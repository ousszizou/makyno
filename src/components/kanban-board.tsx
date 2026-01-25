import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DiffViewer } from '@/components/diff-viewer'
import type { FeatureCard, ActivityLog } from '@/lib/features'

interface KanbanBoardProps {
	features: FeatureCard[]
	onCreateFeature: (data: { title: string; description: string }) => void
	onUpdateStatus: (id: string, status: FeatureCard['status']) => void
}

export function KanbanBoard({
	features,
	onCreateFeature,
	onUpdateStatus,
}: KanbanBoardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	const handleCreate = () => {
		if (!title.trim()) return

		onCreateFeature({ title, description })
		setTitle('')
		setDescription('')
		setIsDialogOpen(false)
	}

	const backlogFeatures = features.filter((f) => f.status === 'backlog')
	const todoFeatures = features.filter((f) => f.status === 'todo')
	const inProgressFeatures = features.filter((f) => f.status === 'in_progress')
	const waitApprovalFeatures = features.filter((f) => f.status === 'wait_approval')
	const doneFeatures = features.filter((f) => f.status === 'done')
	const rejectedFeatures = features.filter((f) => f.status === 'rejected')

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">AI Kanban Workspace</h1>
					<p className="text-muted-foreground">
						Create features and let AI implement them automatically
					</p>
				</div>

				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>Create Feature</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Feature</DialogTitle>
							<DialogDescription>
								Describe the feature you want to implement. The AI agent will
								work on it when you move it to "In Progress".
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="e.g., Add OAuth login"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Describe what needs to be built..."
									rows={4}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleCreate}>Create</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex gap-4 overflow-x-auto pb-4">
				<KanbanColumn
					title="Backlog"
					features={backlogFeatures}
					onMoveNext={(id) => onUpdateStatus(id, 'todo')}
					nextLabel="Move to Todo"
				/>
				<KanbanColumn
					title="Todo"
					features={todoFeatures}
					onMoveNext={(id) => onUpdateStatus(id, 'in_progress')}
					onMovePrev={(id) => onUpdateStatus(id, 'backlog')}
					nextLabel="Start"
					prevLabel="Back"
				/>
				<KanbanColumn
					title="In Progress"
					features={inProgressFeatures}
					onMovePrev={(id) => onUpdateStatus(id, 'todo')}
					prevLabel="Cancel"
					showProgress
				/>
				<KanbanColumn
					title="Wait Approval"
					features={waitApprovalFeatures}
					onMoveNext={(id) => onUpdateStatus(id, 'done')}
					onMovePrev={(id) => onUpdateStatus(id, 'rejected')}
					nextLabel="Approve"
					prevLabel="Reject"
					showWaitApproval
				/>
				<KanbanColumn
					title="Done"
					features={doneFeatures}
					showDone
				/>
				<KanbanColumn
					title="Rejected"
					features={rejectedFeatures}
					onMoveNext={(id) => onUpdateStatus(id, 'todo')}
					nextLabel="Retry"
					showRejected
				/>
			</div>
		</div>
	)
}

interface KanbanColumnProps {
	title: string
	features: FeatureCard[]
	onMoveNext?: (id: string) => void
	onMovePrev?: (id: string) => void
	nextLabel?: string
	prevLabel?: string
	showProgress?: boolean
	showWaitApproval?: boolean
	showDone?: boolean
	showRejected?: boolean
}

function KanbanColumn({
	title,
	features,
	onMoveNext,
	onMovePrev,
	nextLabel,
	prevLabel,
	showProgress,
	showWaitApproval,
	showDone,
	showRejected,
}: KanbanColumnProps) {
	return (
		<div className="flex min-w-[320px] flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">{title}</h2>
				<span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
					{features.length}
				</span>
			</div>

			<div className="flex flex-col gap-3">
				{features.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="flex items-center justify-center py-8">
							<p className="text-sm text-muted-foreground">No features yet</p>
						</CardContent>
					</Card>
				) : (
					features.map((feature) => (
						<FeatureCardComponent
							key={feature.id}
							feature={feature}
							onMoveNext={onMoveNext}
							onMovePrev={onMovePrev}
							nextLabel={nextLabel}
							prevLabel={prevLabel}
							showProgress={showProgress}
							showWaitApproval={showWaitApproval}
							showDone={showDone}
							showRejected={showRejected}
						/>
					))
				)}
			</div>
		</div>
	)
}

interface FeatureCardComponentProps {
	feature: FeatureCard
	onMoveNext?: (id: string) => void
	onMovePrev?: (id: string) => void
	nextLabel?: string
	prevLabel?: string
	showProgress?: boolean
	showWaitApproval?: boolean
	showDone?: boolean
	showRejected?: boolean
}

function FeatureCardComponent({
	feature,
	onMoveNext,
	onMovePrev,
	nextLabel,
	prevLabel,
	showProgress,
	showWaitApproval,
	showDone,
	showRejected,
}: FeatureCardComponentProps) {
	const [showLogs, setShowLogs] = useState(false)
	const [showDiff, setShowDiff] = useState(false)
	const latestLog = feature.logs?.[feature.logs.length - 1]

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">{feature.title}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<p className="text-sm text-muted-foreground">{feature.description}</p>

				{showProgress && latestLog && (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2 rounded-md bg-muted p-2">
							<div className="size-2 animate-pulse rounded-full bg-primary" />
							<span className="text-xs text-muted-foreground">
								{latestLog.message}
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowLogs(!showLogs)}
							className="text-xs"
						>
							{showLogs ? 'Hide' : 'Show'} Activity Log ({feature.logs?.length || 0})
						</Button>
					</div>
				)}

				{showWaitApproval && (
					<div className="flex flex-col gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3">
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-amber-500" />
							<span className="text-xs font-medium text-amber-700 dark:text-amber-400">
								Waiting for Approval
							</span>
						</div>
						{feature.metadata && (
							<div className="text-xs text-muted-foreground">
								<div>Branch: {feature.metadata.branch}</div>
								<div>Commits: {feature.metadata.commits}</div>
								<div>Files: {feature.metadata.filesChanged?.join(', ')}</div>
							</div>
						)}
						<div className="flex flex-col gap-1">
							{feature.metadata?.diff && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowDiff(true)}
									className="text-xs"
								>
									View Git Diff
								</Button>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowLogs(!showLogs)}
								className="text-xs"
							>
								{showLogs ? 'Hide' : 'View'} Implementation Log
							</Button>
						</div>
					</div>
				)}

				{showDone && (
					<div className="rounded-md bg-green-500/10 p-2">
						<div className="flex items-center gap-2">
							<div className="text-green-500">✓</div>
							<span className="text-xs font-medium text-green-700 dark:text-green-400">
								Approved & Merged
							</span>
						</div>
					</div>
				)}

				{showRejected && (
					<div className="flex flex-col gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3">
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-red-500" />
							<span className="text-xs font-medium text-red-700 dark:text-red-400">
								Rejected - Needs Revision
							</span>
						</div>
						{feature.rejectionReason && (
							<p className="text-xs text-muted-foreground">
								Reason: {feature.rejectionReason}
							</p>
						)}
					</div>
				)}

				{showLogs && feature.logs && feature.logs.length > 0 && (
					<div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-2">
						<div className="flex flex-col gap-1">
							{feature.logs.map((log, idx) => (
								<div key={idx} className="flex items-start gap-2 text-xs">
									<span className="text-muted-foreground">
										{new Date(log.timestamp).toLocaleTimeString()}
									</span>
									<span
										className={
											log.type === 'error'
												? 'text-red-500'
												: log.type === 'success'
													? 'text-green-500'
													: 'text-foreground'
										}
									>
										{log.message}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="flex items-center gap-2">
					{onMovePrev && prevLabel && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onMovePrev(feature.id)}
						>
							{prevLabel}
						</Button>
					)}
					{onMoveNext && nextLabel && (
						<Button size="sm" onClick={() => onMoveNext(feature.id)}>
							{nextLabel}
						</Button>
					)}
				</div>

				<div className="text-xs text-muted-foreground">
					Created: {new Date(feature.createdAt).toLocaleString()}
				</div>
			</CardContent>
		</Card>

			{/* Git Diff Dialog */}
			<Dialog open={showDiff} onOpenChange={setShowDiff}>
				<DialogContent className="max-w-4xl max-h-[80vh]">
					<DialogHeader>
						<DialogTitle>Git Diff - {feature.title}</DialogTitle>
						<DialogDescription>
							Review the changes made by the AI agent
						</DialogDescription>
					</DialogHeader>
					<div className="max-h-[60vh] overflow-auto">
						{feature.metadata?.diff ? (
							<DiffViewer diff={feature.metadata.diff} />
						) : (
							<p className="text-sm text-muted-foreground">No diff available</p>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDiff(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
