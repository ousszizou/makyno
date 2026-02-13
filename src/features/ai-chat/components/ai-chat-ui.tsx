import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import type { ToolUIPart } from "ai";
import {
	CheckCircleIcon,
	CheckIcon,
	GlobeIcon,
	XCircleIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationAction,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
	ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageBranch,
	MessageBranchContent,
	MessageBranchNext,
	MessageBranchPage,
	MessageBranchPrevious,
	MessageBranchSelector,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	ModelSelector,
	ModelSelectorContent,
	ModelSelectorEmpty,
	ModelSelectorGroup,
	ModelSelectorInput,
	ModelSelectorItem,
	ModelSelectorList,
	ModelSelectorLogo,
	ModelSelectorLogoGroup,
	ModelSelectorName,
	ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
	PromptInput,
	PromptInputActionAddAttachments,
	PromptInputActionMenu,
	PromptInputActionMenuContent,
	PromptInputActionMenuTrigger,
	PromptInputAttachment,
	PromptInputAttachments,
	PromptInputBody,
	PromptInputButton,
	PromptInputFooter,
	PromptInputHeader,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";

type MessageType = {
	key: string;
	from: "user" | "assistant";
	sources?: { href: string; title: string }[];
	versions: {
		id: string;
		content: string;
	}[];
	reasoning?: {
		content: string;
		duration: number;
	};
	tools?: {
		name: string;
		description: string;
		status: ToolUIPart["state"];
		parameters: Record<string, unknown>;
		result: string | undefined;
		error: string | undefined;
		approval?: any;
		toolCallId?: string;
	}[];
};

const models = [
	{
		id: "claude-sonnet-4-5",
		name: "Claude Sonnet 4.5",
		chef: "Anthropic",
		chefSlug: "anthropic",
		providers: ["anthropic"],
	},
];

const suggestions = [
	"List all my features",
	"What features are in progress?",
	"Create a new feature for user authentication",
	"Show me the backlog",
	"Help me prioritize my tasks",
	"What can you help me with?",
];

export function AIChatUI() {
	const [model, setModel] = useState<string>(models[0].id);
	const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
	const [text, setText] = useState<string>("");
	const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
	const [conversationId] = useState(() => crypto.randomUUID());

	const selectedModelData = models.find((m) => m.id === model);

	// Map TanStack AI tool states to AI Elements Tool component states
	const mapToolState = (
		state: string | undefined,
		hasOutput: boolean,
		hasError: boolean | undefined,
	): ToolUIPart["state"] => {
		if (hasError) return "output-error";
		if (hasOutput) return "output-available";

		// Don't map approval states - pass them through as-is for Confirmation component
		if (state === "approval-requested" || state === "approval-responded") {
			return state as ToolUIPart["state"];
		}

		const stateMap: Record<string, ToolUIPart["state"]> = {
			"awaiting-input": "input-streaming",
			"input-streaming": "input-streaming",
			"input-complete": "input-available",
		};

		return stateMap[state || ""] || "input-available";
	};

	// 🔥 Use TanStack AI's useChat hook
	const {
		messages: aiMessages,
		sendMessage,
		isLoading,
		addToolApprovalResponse,
	} = useChat({
		connection: fetchServerSentEvents("/api/chat"),
		body: {
			conversationId,
		},
	});

	// Transform TanStack AI messages to AI Elements format
	const messages: MessageType[] = aiMessages.map((msg) => {
		const textParts = msg.parts.filter((p) => p.type === "text");
		const content = textParts.map((p) => p.content).join("\n");

		// Extract reasoning if present
		const reasoningPart = msg.parts.find((p) => p.type === "thinking");
		const reasoning = reasoningPart
			? {
					content: reasoningPart.content,
					duration: 0,
				}
			: undefined;

		// Extract tools - match tool-call with tool-result parts
		const toolCallParts = msg.parts.filter((p) => p.type === "tool-call");
		const toolResultParts = msg.parts.filter((p) => p.type === "tool-result");

		const tools = toolCallParts.map((toolCall) => {
			// Find matching result by tool call ID
			const toolResult = toolResultParts.find(
				(result) => result.toolCallId === toolCall.id,
			);

			// Parse output from tool-result content (it's a JSON string!)
			let output = toolCall.output;
			if (toolResult?.content) {
				try {
					output = JSON.parse(toolResult.content);
				} catch (_e) {
					// If parsing fails, use content as-is
					output = toolResult.content;
				}
			}

			const hasOutput = !!(output || toolResult?.state === "complete");
			const error = toolCall.errorText || toolResult?.errorText;

			// Parse parameters from input or arguments (arguments is JSON string)
			// Only parse arguments when state is "input-complete" or "approval-requested" (not during streaming)
			let parameters = toolCall.input || {};
			if (
				!toolCall.input &&
				toolCall.arguments &&
				(toolCall.state === "input-complete" ||
					toolCall.state === "approval-requested")
			) {
				try {
					parameters = JSON.parse(toolCall.arguments);
				} catch (_e) {
					// Arguments might still be incomplete, use empty object
					parameters = {};
				}
			}

			return {
				name: toolCall.name,
				description: `Tool: ${toolCall.name}`,
				status: mapToolState(
					toolResult?.state === "complete"
						? "output-available"
						: toolCall.state,
					hasOutput,
					!!error,
				),
				parameters,
				result: output,
				error: error,
				approval: toolCall.approval,
				toolCallId: toolCall.id,
			};
		});

		return {
			key: msg.id,
			from: msg.role as "user" | "assistant",
			versions: [
				{
					id: msg.id,
					content,
				},
			],
			reasoning,
			tools: tools.length > 0 ? tools : undefined,
		};
	});

	const handleSubmit = useCallback(
		(message: PromptInputMessage) => {
			const hasText = Boolean(message.text);
			const hasAttachments = Boolean(message.files?.length);

			if (!(hasText || hasAttachments)) {
				return;
			}

			if (message.files?.length) {
				toast.success("Files attached", {
					description: `${message.files.length} file(s) attached to message`,
				});
			}

			// Send message to AI using TanStack AI
			sendMessage(message.text || "Sent with attachments");
			setText("");
		},
		[sendMessage],
	);

	const handleSuggestionClick = useCallback((suggestion: string) => {
		setText(suggestion);
	}, []);

	// Map loading status to AI Elements format
	const status = isLoading ? "streaming" : "ready";

	return (
		<div className="relative flex size-full flex-col divide-y overflow-hidden">
			{/* Chat Messages */}
			<Conversation>
				<ConversationContent>
					{messages.length === 0 ? (
						<div className="flex h-full items-center justify-center">
							<div className="text-center">
								<h2 className="text-2xl font-semibold">Welcome to Makyno AI</h2>
								<p className="mt-2 text-muted-foreground">
									Start a conversation by typing a message below
								</p>
							</div>
						</div>
					) : (
						messages.map(({ versions, ...message }) => (
							<MessageBranch defaultBranch={0} key={message.key}>
								<MessageBranchContent>
									{versions.map((version) => (
										<Message
											from={message.from}
											key={`${message.key}-${version.id}`}
										>
											<div>
												{/* Sources */}
												{message.sources?.length && (
													<Sources>
														<SourcesTrigger count={message.sources.length} />
														<SourcesContent>
															{message.sources.map((source) => (
																<Source
																	href={source.href}
																	key={source.href}
																	title={source.title}
																/>
															))}
														</SourcesContent>
													</Sources>
												)}

												{/* Reasoning/Thinking */}
												{message.reasoning && (
													<Reasoning duration={message.reasoning.duration}>
														<ReasoningTrigger />
														<ReasoningContent>
															{message.reasoning.content}
														</ReasoningContent>
													</Reasoning>
												)}

												{/* Tools */}
												{message.tools?.map((tool) => (
													<Tool key={tool.toolCallId}>
														<ToolHeader
															title={tool.name}
															type="tool-call"
															state={tool.status}
														/>
														<ToolContent>
															<ToolInput input={tool.parameters} />

															{/* Approval UI */}
															<Confirmation
																approval={tool.approval}
																state={tool.status}
															>
																<ConfirmationRequest>
																	<ConfirmationTitle>
																		{(() => {
																			const params = tool.parameters;

																			if (
																				tool.name === "edit_file" &&
																				params.filePath
																			) {
																				return `Edit ${params.filePath}?`;
																			}
																			if (
																				tool.name === "write_file" &&
																				params.filePath
																			) {
																				return `Create/overwrite ${params.filePath}?`;
																			}
																			if (
																				tool.name === "run_command" &&
																				params.command
																			) {
																				return `Run: ${params.command}`;
																			}
																			return "Approve this action?";
																		})()}
																	</ConfirmationTitle>
																	<ConfirmationActions>
																		<ConfirmationAction
																			variant="outline"
																			onClick={() => {
																				if (tool.approval) {
																					console.log(
																						"Sending approval response (denied):",
																						tool.approval.id,
																					);
																					addToolApprovalResponse({
																						id: tool.approval.id,
																						approved: false,
																					});
																				}
																			}}
																		>
																			<XCircleIcon className="size-4 me-1" />
																			Deny
																		</ConfirmationAction>
																		<ConfirmationAction
																			onClick={() => {
																				if (tool.approval) {
																					addToolApprovalResponse({
																						id: tool.approval.id,
																						approved: true,
																					});
																				}
																			}}
																		>
																			<CheckCircleIcon className="size-4 me-1" />
																			Approve
																		</ConfirmationAction>
																	</ConfirmationActions>
																</ConfirmationRequest>

																<ConfirmationAccepted>
																	<ConfirmationTitle>
																		✅ Approved
																	</ConfirmationTitle>
																</ConfirmationAccepted>

																<ConfirmationRejected>
																	<ConfirmationTitle>
																		❌ Denied
																	</ConfirmationTitle>
																</ConfirmationRejected>
															</Confirmation>

															<ToolOutput
																output={tool.result}
																errorText={tool.error}
															/>
														</ToolContent>
													</Tool>
												))}

												{/* Message Content */}
												<MessageContent>
													<MessageResponse>{version.content}</MessageResponse>
												</MessageContent>
											</div>
										</Message>
									))}
								</MessageBranchContent>

								{/* Message Branching (for multiple versions) */}
								{versions.length > 1 && (
									<MessageBranchSelector from={message.from}>
										<MessageBranchPrevious />
										<MessageBranchPage />
										<MessageBranchNext />
									</MessageBranchSelector>
								)}
							</MessageBranch>
						))
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			{/* Input Area */}
			<div className="grid shrink-0 gap-4 pt-4">
				{/* Suggestions (only show when no messages) */}
				{messages.length === 0 && (
					<Suggestions className="px-4">
						{suggestions.map((suggestion) => (
							<Suggestion
								key={suggestion}
								onClick={() => handleSuggestionClick(suggestion)}
								suggestion={suggestion}
							/>
						))}
					</Suggestions>
				)}

				{/* Prompt Input */}
				<div className="w-full px-4 pb-4">
					<PromptInput globalDrop multiple onSubmit={handleSubmit}>
						{/* Attachments Header */}
						<PromptInputHeader>
							<PromptInputAttachments>
								{(attachment) => <PromptInputAttachment data={attachment} />}
							</PromptInputAttachments>
						</PromptInputHeader>

						{/* Textarea Body */}
						<PromptInputBody>
							<PromptInputTextarea
								onChange={(event) => setText(event.target.value)}
								placeholder="Ask me anything..."
								value={text}
							/>
						</PromptInputBody>

						{/* Footer with Tools and Submit */}
						<PromptInputFooter>
							<PromptInputTools>
								{/* Attachments Menu */}
								<PromptInputActionMenu>
									<PromptInputActionMenuTrigger />
									<PromptInputActionMenuContent>
										<PromptInputActionAddAttachments />
									</PromptInputActionMenuContent>
								</PromptInputActionMenu>

								{/* Web Search Toggle */}
								<PromptInputButton
									onClick={() => setUseWebSearch(!useWebSearch)}
									variant={useWebSearch ? "default" : "ghost"}
								>
									<GlobeIcon size={16} />
									<span>Search</span>
								</PromptInputButton>

								{/* Model Selector */}
								<ModelSelector
									onOpenChange={setModelSelectorOpen}
									open={modelSelectorOpen}
								>
									<ModelSelectorTrigger asChild>
										<PromptInputButton>
											{selectedModelData?.chefSlug && (
												<ModelSelectorLogo
													provider={selectedModelData.chefSlug}
												/>
											)}
											{selectedModelData?.name && (
												<ModelSelectorName>
													{selectedModelData.name}
												</ModelSelectorName>
											)}
										</PromptInputButton>
									</ModelSelectorTrigger>
									<ModelSelectorContent>
										<ModelSelectorInput placeholder="Search models..." />
										<ModelSelectorList>
											<ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
											<ModelSelectorGroup heading="Anthropic">
												{models.map((m) => (
													<ModelSelectorItem
														key={m.id}
														onSelect={() => {
															setModel(m.id);
															setModelSelectorOpen(false);
														}}
														value={m.id}
													>
														<ModelSelectorLogo provider={m.chefSlug} />
														<ModelSelectorName>{m.name}</ModelSelectorName>
														<ModelSelectorLogoGroup>
															{m.providers.map((provider) => (
																<ModelSelectorLogo
																	key={provider}
																	provider={provider}
																/>
															))}
														</ModelSelectorLogoGroup>
														{model === m.id ? (
															<CheckIcon className="ms-auto size-4" />
														) : (
															<div className="ms-auto size-4" />
														)}
													</ModelSelectorItem>
												))}
											</ModelSelectorGroup>
										</ModelSelectorList>
									</ModelSelectorContent>
								</ModelSelector>
							</PromptInputTools>

							{/* Submit Button */}
							<PromptInputSubmit
								disabled={!(text.trim() || status) || status === "streaming"}
								status={status}
							/>
						</PromptInputFooter>
					</PromptInput>
				</div>
			</div>
		</div>
	);
}
