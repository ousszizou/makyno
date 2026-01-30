interface DiffViewerProps {
	diff: string;
}

export function DiffViewer({ diff }: DiffViewerProps) {
	const lines = diff.split("\n");

	return (
		<div className="overflow-auto rounded-md border bg-slate-950 p-4">
			<div className="font-mono text-xs">
				{lines.map((line, idx) => {
					let className = "text-slate-300";
					let prefix = "";

					if (line.startsWith("diff --git") || line.startsWith("index")) {
						className = "text-slate-500 font-semibold";
					} else if (line.startsWith("---") || line.startsWith("+++")) {
						className = "text-slate-400 font-semibold";
					} else if (line.startsWith("@@")) {
						className = "text-cyan-400 font-semibold";
					} else if (line.startsWith("+")) {
						className = "bg-green-900/30 text-green-300";
						prefix = "+ ";
					} else if (line.startsWith("-")) {
						className = "bg-red-900/30 text-red-300";
						prefix = "- ";
					}

					return (
						<div key={idx} className={className}>
							{prefix}
							{line}
						</div>
					);
				})}
			</div>
		</div>
	);
}
