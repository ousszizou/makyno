import { chat, maxIterations, toServerSentEventsResponse } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import { createFileRoute } from "@tanstack/react-router";
import { runCommandTool } from "@/features/ai-chat/tools/command-tools";
import {
	createFeatureTool,
	listFeaturesTool,
	updateFeatureStatusTool,
} from "@/features/ai-chat/tools/feature-tools";
import {
	editFileTool,
	listFilesTool,
	readFileTool,
	searchCodeTool,
	writeFileTool,
} from "@/features/ai-chat/tools/file-tools";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// Check for API key
				if (!process.env.ANTHROPIC_API_KEY) {
					return new Response(
						JSON.stringify({
							error: "ANTHROPIC_API_KEY not configured",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				try {
					// Parse request body
					const { messages, conversationId } = await request.json();

					console.log("[AI Chat API] Received request:", {
						messageCount: messages?.length,
						conversationId,
					});

					// Create streaming chat response with Claude Sonnet
					const stream = chat({
						adapter: anthropicText("claude-sonnet-4-5"),
						messages,
						conversationId,
						systemPrompts: [
							`You are an AI coding agent for Makyno, a workspace management system.

							IMPORTANT: Features stored in .makyno/features are WORK ITEMS (tasks), NOT feature flag implementations.
							When implementing a feature, you make REAL CODE CHANGES to the actual project files.
							NEVER create stub/mock implementation files - always do the actual work described in the feature.

							**Feature Management Tools:**
							- list_features: See all work items
							- create_feature: Create a new work item
							- update_feature_status: Update status (backlog → todo → in_progress → wait_approval → done)

							**Coding Tools:**
							- read_file: Read file contents
							- write_file: Create new file or overwrite (needs approval)
							- edit_file: Make targeted edits (needs approval)
							- list_files: Explore directory structure
							- search_code: Find code patterns
							- run_command: Execute shell commands like git, tests, etc. (needs approval)

							**Implementation Workflow (with Worktrees for Parallel Execution):**
							When a user asks you to implement a feature:
							1. Update feature status to "in_progress"
							2. Create isolated worktree for this feature:
							   run_command({ command: "git worktree add .worktrees/feat-{featureId} -b feat/{featureName}" })
							3. Work in the worktree using full paths:
							   - read_file({ filePath: ".worktrees/feat-{featureId}/src/foo.tsx" })
							   - edit_file({ filePath: ".worktrees/feat-{featureId}/src/bar.tsx", ... })
							4. Use list_files/search_code with worktree paths
							5. Make REAL changes (not mock stubs!)
							6. Run tests ONLY if user mentions testing
							7. Commit in worktree: run_command({ command: "git add . && git commit -m '...'", workingDir: ".worktrees/feat-{featureId}" })
							8. Merge to main:
							   - git checkout main
							   - git merge feat/{featureName}
							   - git worktree remove .worktrees/feat-{featureId}
							   - git branch -d feat/{featureName}
							9. Update feature to "wait_approval"

							Note: Using worktrees allows multiple AI agents to work on different features in parallel without conflicts.

							**Example - "Change project title to X":**
							❌ DON'T create src/features/feat-123.ts with stub code
							✅ DO find and edit src/routes/__root.tsx, package.json, manifest.json with actual title

							**Guidelines:**
							- Always read files before editing
							- Follow existing code patterns
							- Make focused, minimal changes
							- Test only when explicitly requested
							- Use git branches (feat/feature-name)
							- Ask questions if requirements are unclear`,
						],
						// 🔥 Add all tools!
						tools: [
							// Feature management
							listFeaturesTool,
							createFeatureTool,
							updateFeatureStatusTool,
							// File operations
							readFileTool,
							writeFileTool,
							editFileTool,
							listFilesTool,
							searchCodeTool,
							// Command execution
							runCommandTool,
						],
						// 🔥 Enable agent loop (up to 50 tool calls for coding tasks)
						agentLoopStrategy: maxIterations(50),
					});

					console.log("[AI Chat API] Streaming response started");

					// Convert stream to Server-Sent Events format
					return toServerSentEventsResponse(stream);
				} catch (error) {
					console.error("[AI Chat API] Error:", error);
					return new Response(
						JSON.stringify({
							error:
								error instanceof Error ? error.message : "An error occurred",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
