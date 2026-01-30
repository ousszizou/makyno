import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KanbanBoard } from "@/components/kanban-board";
import {
	listFeatures,
	createFeature,
	updateFeatureStatus,
	type FeatureCard,
} from "@/lib/features";

export const Route = createFileRoute("/workspace")({
	component: WorkspacePage,
});

function WorkspacePage() {
	const { data: features = [], refetch } = useQuery<FeatureCard[]>({
		queryKey: ["features"],
		queryFn: () => listFeatures(),
		refetchInterval: 2000, // Poll every 2 seconds to check for status updates
	});

	const { mutate: handleCreateFeature } = useMutation({
		mutationFn: (data: { title: string; description: string }) =>
			createFeature({ data }),
		onSuccess: () => refetch(),
	});

	const { mutate: handleUpdateStatus } = useMutation({
		mutationFn: ({
			id,
			status,
		}: {
			id: string;
			status: FeatureCard["status"];
		}) => updateFeatureStatus({ data: { id, status } }),
		onSuccess: () => refetch(),
	});

	return (
		<div className="min-h-screen bg-background">
			<KanbanBoard
				features={features}
				onCreateFeature={handleCreateFeature}
				onUpdateStatus={(id, status) => handleUpdateStatus({ id, status })}
			/>
		</div>
	);
}
