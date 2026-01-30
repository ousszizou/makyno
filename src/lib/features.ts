import { createServerFn } from '@tanstack/react-start'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// Activity log entry
export interface ActivityLog {
	timestamp: string
	message: string
	type: 'info' | 'success' | 'error'
}

// Types for feature card
export interface FeatureCard {
	id: string
	title: string
	description: string
	status: 'backlog' | 'todo' | 'in_progress' | 'wait_approval' | 'done' | 'rejected'
	createdAt: string
	startedAt?: string
	implementedAt?: string
	completedAt?: string
	rejectedAt?: string
	rejectionReason?: string
	logs: ActivityLog[]
	metadata?: {
		branch?: string
		commits?: number
		filesChanged?: string[]
		diff?: string
	}
}

// Helper to get features directory path
const getFeaturesDir = () => path.join(process.cwd(), '.makyno', 'features')

// Helper to get feature path
const getFeaturePath = (id: string) =>
	path.join(getFeaturesDir(), id, 'feature.json')

// Helper to ensure directory exists
async function ensureDir(dir: string) {
	try {
		await fs.mkdir(dir, { recursive: true })
	} catch (error) {
		// Directory might already exist
	}
}

// Helper to add log to feature
async function addLog(
	featureId: string,
	message: string,
	type: ActivityLog['type'] = 'info'
) {
	const featurePath = getFeaturePath(featureId)
	const content = await fs.readFile(featurePath, 'utf-8')
	const feature = JSON.parse(content) as FeatureCard

	const log: ActivityLog = {
		timestamp: new Date().toISOString(),
		message,
		type,
	}

	feature.logs.push(log)
	await fs.writeFile(featurePath, JSON.stringify(feature, null, 2), 'utf-8')

	console.log(`[${featureId}] ${type.toUpperCase()}: ${message}`)
}

// Create a new feature
export const createFeature = createServerFn({ method: 'POST' })
	.inputValidator((data: { title: string; description: string }) => data)
	.handler(async ({ data }) => {
		// Generate feature ID
		const timestamp = Date.now()
		const id = `feat-${timestamp}`

		// Create feature card
		const feature: FeatureCard = {
			id,
			title: data.title,
			description: data.description,
			status: 'backlog',
			createdAt: new Date().toISOString(),
			logs: [
				{
					timestamp: new Date().toISOString(),
					message: 'Feature created and added to backlog',
					type: 'info',
				},
			],
		}

		// Create feature directory
		const featureDir = path.join(getFeaturesDir(), id)
		await ensureDir(featureDir)

		// Write feature.json
		const featurePath = getFeaturePath(id)
		await fs.writeFile(featurePath, JSON.stringify(feature, null, 2), 'utf-8')

		return feature
	})

// List all features
export const listFeatures = createServerFn({ method: 'GET' }).handler(
	async () => {
		const featuresDir = getFeaturesDir()

		try {
			// Check if directory exists
			await fs.access(featuresDir)
		} catch {
			// Directory doesn't exist yet, return empty array
			return []
		}

		// Read all feature directories
		const entries = await fs.readdir(featuresDir, { withFileTypes: true })
		const featureDirs = entries.filter((entry) => entry.isDirectory())

		// Read each feature.json
		const features: FeatureCard[] = []
		for (const dir of featureDirs) {
			const featurePath = getFeaturePath(dir.name)
			try {
				const content = await fs.readFile(featurePath, 'utf-8')
				const feature = JSON.parse(content) as FeatureCard
				features.push(feature)
			} catch (error) {
				console.error(`Failed to read feature ${dir.name}:`, error)
			}
		}

		// Sort by creation date (newest first)
		return features.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
	}
)

// Update feature status
export const updateFeatureStatus = createServerFn({ method: 'POST' })
	.inputValidator((data: { id: string; status: FeatureCard['status'] }) => data)
	.handler(async ({ data }) => {
		const featurePath = getFeaturePath(data.id)

		// Read current feature
		const content = await fs.readFile(featurePath, 'utf-8')
		const feature = JSON.parse(content) as FeatureCard

		// Update status and timestamps
		const oldStatus = feature.status
		feature.status = data.status

		// Handle status transitions and logging
		if (data.status === 'todo' && oldStatus === 'backlog') {
			feature.logs.push({
				timestamp: new Date().toISOString(),
				message: 'Moved from backlog to todo - ready to start',
				type: 'info',
			})
		}

		if (data.status === 'in_progress' && !feature.startedAt) {
			feature.startedAt = new Date().toISOString()
			feature.logs.push({
				timestamp: new Date().toISOString(),
				message: 'AI agent started working on this feature',
				type: 'info',
			})
		}

		if (data.status === 'wait_approval' && !feature.implementedAt) {
			feature.implementedAt = new Date().toISOString()
			feature.logs.push({
				timestamp: new Date().toISOString(),
				message: 'Implementation complete - waiting for approval',
				type: 'success',
			})
		}

		if (data.status === 'done' && !feature.completedAt) {
			feature.completedAt = new Date().toISOString()
			feature.logs.push({
				timestamp: new Date().toISOString(),
				message: 'Feature approved and merged to main branch',
				type: 'success',
			})
		}

		if (data.status === 'rejected' && !feature.rejectedAt) {
			feature.rejectedAt = new Date().toISOString()
			feature.logs.push({
				timestamp: new Date().toISOString(),
				message: 'Feature rejected - needs revision',
				type: 'error',
			})
		}

		// Write back
		await fs.writeFile(featurePath, JSON.stringify(feature, null, 2), 'utf-8')

		return feature
	})

// Mock AI agent work (simulates implementation)
export const mockAgentWork = createServerFn({ method: 'POST' })
	.inputValidator((data: { featureId: string }) => data)
	.handler(async ({ data }) => {
		const featureId = data.featureId

		console.log(`[MOCK AGENT] Starting work on ${featureId}`)

		try {
			// Step 1: Planning (1 second)
			await addLog(featureId, 'Analyzing feature requirements...', 'info')
			await new Promise((resolve) => setTimeout(resolve, 1000))

			await addLog(
				featureId,
				'Created implementation plan with 3 tasks',
				'info'
			)
			await new Promise((resolve) => setTimeout(resolve, 500))

			// Step 2: Implementation (2 seconds)
			await addLog(featureId, 'Creating feature branch...', 'info')
			await new Promise((resolve) => setTimeout(resolve, 800))

			await addLog(featureId, 'Implementing core functionality...', 'info')
			await new Promise((resolve) => setTimeout(resolve, 1500))

			await addLog(featureId, 'Adding tests...', 'info')
			await new Promise((resolve) => setTimeout(resolve, 1000))

			// Step 3: Finalization (500ms)
			await addLog(featureId, 'Running tests and checks...', 'info')
			await new Promise((resolve) => setTimeout(resolve, 800))

			// Update feature to wait_approval
			const featurePath = getFeaturePath(featureId)
			const content = await fs.readFile(featurePath, 'utf-8')
			const feature = JSON.parse(content) as FeatureCard

			// Generate simulated git diff
			const simulatedDiff = `diff --git a/src/features/${featureId}.ts b/src/features/${featureId}.ts
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/src/features/${featureId}.ts
@@ -0,0 +1,15 @@
+/**
+ * ${feature.title}
+ * ${feature.description}
+ */
+
+export interface ${featureId.replace(/-/g, '_').toUpperCase()}_Config {
+  enabled: boolean;
+  options?: Record<string, unknown>;
+}
+
+export function implement${featureId.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}(config: ${featureId.replace(/-/g, '_').toUpperCase()}_Config) {
+  if (!config.enabled) return;
+
+  // Implementation logic here
+  console.log('Feature implemented:', '${feature.title}');
+}

diff --git a/src/features/${featureId}.test.ts b/src/features/${featureId}.test.ts
new file mode 100644
index 0000000..abcdefg
--- /dev/null
+++ b/src/features/${featureId}.test.ts
@@ -0,0 +1,12 @@
+import { describe, it, expect } from 'vitest';
+import { implement${featureId.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')} } from './${featureId}';
+
+describe('${feature.title}', () => {
+  it('should implement feature correctly', () => {
+    const config = { enabled: true };
+
+    expect(() => {
+      implement${featureId.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}(config);
+    }).not.toThrow();
+  });
+});`

			feature.status = 'wait_approval'
			feature.implementedAt = new Date().toISOString()
			feature.metadata = {
				branch: `feat/${featureId}`,
				commits: 3,
				filesChanged: [
					`src/features/${featureId}.ts`,
					`src/features/${featureId}.test.ts`,
				],
				diff: simulatedDiff,
			}

			feature.logs.push({
				timestamp: new Date().toISOString(),
				message: 'Implementation complete! Created 3 commits, modified 2 files. Ready for review.',
				type: 'success',
			})

			await fs.writeFile(featurePath, JSON.stringify(feature, null, 2), 'utf-8')

			console.log(`[MOCK AGENT] Completed work on ${featureId}`)

			return feature
		} catch (error) {
			await addLog(
				featureId,
				`Error during implementation: ${error}`,
				'error'
			)
			throw error
		}
	})
