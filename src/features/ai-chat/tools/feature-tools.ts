import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import {
	listFeatures,
	createFeature,
	updateFeatureStatus,
	type FeatureCard,
} from "@/lib/features";

/**
 * 🔧 Tool 1: List Features
 *
 * Allows the AI to see all features in the workspace.
 * The AI can use this to answer questions like:
 * - "What features do I have?"
 * - "Show me in-progress features"
 * - "List my backlog"
 */
export const listFeaturesTool = toolDefinition({
	name: "list_features",
	description: `Lists all features in the workspace with their current status, title, and description.
	Use this to see what features exist, check their status, or answer questions about the backlog.`,
	inputSchema: z.object({
		// No input needed - just list everything
	}),
	outputSchema: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			description: z.string(),
			status: z.enum([
				"backlog",
				"todo",
				"in_progress",
				"wait_approval",
				"done",
				"rejected",
			]),
			createdAt: z.string(),
			startedAt: z.string().optional(),
			implementedAt: z.string().optional(),
			completedAt: z.string().optional(),
		}),
	),
}).server(async () => {
	// Call the existing server function
	const features = await listFeatures();

	// Return simplified data for the AI
	return features.map((f) => ({
		id: f.id,
		title: f.title,
		description: f.description,
		status: f.status,
		createdAt: f.createdAt,
		startedAt: f.startedAt,
		implementedAt: f.implementedAt,
		completedAt: f.completedAt,
	}));
});

/**
 * 🔧 Tool 2: Create Feature
 *
 * Allows the AI to create new features based on user requests.
 * The AI can use this when the user says:
 * - "Create a feature for user authentication"
 * - "Add a new task to implement dark mode"
 * - "I need a feature for email notifications"
 */
export const createFeatureTool = toolDefinition({
	name: "create_feature",
	description: `Creates a new feature in the workspace with a title and description.
	The feature will be added to the backlog.
	Use this when the user wants to add a new feature or task to the workspace.`,
	inputSchema: z.object({
		title: z
			.string()
			.describe(
				"Short, descriptive title for the feature (e.g., 'User Authentication')",
			),
		description: z
			.string()
			.describe(
				"Detailed description of what the feature should do and any requirements",
			),
	}),
	outputSchema: z.object({
		id: z.string(),
		title: z.string(),
		description: z.string(),
		status: z.string(),
		createdAt: z.string(),
		message: z.string(),
	}),
}).server(async ({ title, description }) => {
	// Call the existing server function
	const feature = await createFeature({ data: { title, description } });

	return {
		id: feature.id,
		title: feature.title,
		description: feature.description,
		status: feature.status,
		createdAt: feature.createdAt,
		message: `✅ Feature created successfully! ID: ${feature.id}`,
	};
});

/**
 * 🔧 Tool 3: Update Feature Status
 *
 * Allows the AI to move features between different stages.
 * The AI can use this when the user says:
 * - "Move feature X to in progress"
 * - "Mark the authentication feature as done"
 * - "Start working on the dark mode feature"
 */
export const updateFeatureStatusTool = toolDefinition({
	name: "update_feature_status",
	description: `Updates the status of a feature to move it through the workflow.

	Status workflow:
	- backlog: Feature is planned but not yet ready
	- todo: Feature is ready to be worked on
	- in_progress: Feature is currently being implemented
	- wait_approval: Implementation is complete, waiting for review
	- done: Feature is approved and complete
	- rejected: Feature was rejected and needs revision

	Use this when the user wants to change a feature's status.`,
	inputSchema: z.object({
		featureId: z
			.string()
			.describe("The ID of the feature to update (e.g., 'feat-1234567890')"),
		status: z
			.enum([
				"backlog",
				"todo",
				"in_progress",
				"wait_approval",
				"done",
				"rejected",
			])
			.describe("The new status to set"),
	}),
	outputSchema: z.object({
		id: z.string(),
		title: z.string(),
		oldStatus: z.string(),
		newStatus: z.string(),
		message: z.string(),
	}),
}).server(async ({ featureId, status }) => {
	// First, get the current feature to know the old status
	const allFeatures = await listFeatures();
	const feature = allFeatures.find((f) => f.id === featureId);

	if (!feature) {
		throw new Error(`Feature with ID ${featureId} not found`);
	}

	const oldStatus = feature.status;

	// Update the status
	const updatedFeature = await updateFeatureStatus({
		data: { id: featureId, status },
	});

	return {
		id: updatedFeature.id,
		title: updatedFeature.title,
		oldStatus,
		newStatus: updatedFeature.status,
		message: `✅ Feature "${updatedFeature.title}" moved from ${oldStatus} to ${status}`,
	};
});
