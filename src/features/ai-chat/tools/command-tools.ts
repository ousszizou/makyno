import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * ⚡ Tool: Run Command
 * Allows the AI agent to execute shell commands
 */
export const runCommandTool = toolDefinition({
	name: "run_command",
	description: `Executes a shell command and returns the output.
	Use this to run tests, linters, build commands, or any other shell operations.

	Common use cases:
	- Run tests: "pnpm test"
	- Run linter: "pnpm lint"
	- Format code: "pnpm format"
	- Build: "pnpm build"
	- Install dependencies: "pnpm install <package>"

	IMPORTANT: Only run commands if explicitly mentioned in feature requirements.`,
	inputSchema: z.object({
		command: z.string().describe("The shell command to execute"),
		workingDir: z
			.string()
			.optional()
			.describe("Working directory (default: project root)"),
		timeout: z
			.number()
			.optional()
			.describe("Timeout in milliseconds (default: 60000)"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		stdout: z.string(),
		stderr: z.string(),
		exitCode: z.number(),
		command: z.string(),
		duration: z.number(),
	}),
	needsApproval: false, // TODO: Re-enable after fixing TanStack AI approval flow issue
}).server(async ({ command, workingDir, timeout = 60000 }) => {
	const startTime = Date.now();

	try {
		const { stdout, stderr } = await execAsync(command, {
			cwd: workingDir || process.cwd(),
			timeout,
			maxBuffer: 1024 * 1024 * 10, // 10MB buffer
		});

		const duration = Date.now() - startTime;

		return {
			success: true,
			stdout: stdout.trim(),
			stderr: stderr.trim(),
			exitCode: 0,
			command,
			duration,
		};
	} catch (error: any) {
		const duration = Date.now() - startTime;

		return {
			success: false,
			stdout: error.stdout?.trim() || "",
			stderr: error.stderr?.trim() || error.message,
			exitCode: error.code || 1,
			command,
			duration,
		};
	}
});
