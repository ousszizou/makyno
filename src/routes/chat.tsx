import { createFileRoute } from "@tanstack/react-router";
import { AIChatUI } from "@/features/ai-chat/components/ai-chat-ui";

export const Route = createFileRoute("/chat")({
	component: ChatPage,
});

function ChatPage() {
	return (
		<div className="flex h-screen w-full flex-col">
			<AIChatUI />
		</div>
	);
}
