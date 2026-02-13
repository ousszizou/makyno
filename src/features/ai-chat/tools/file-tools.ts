import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * 📖 Tool: Read File
 * Allows the AI agent to read file contents
 */
export const readFileTool = toolDefinition({
	name: "read_file",
	description: `Reads the contents of a file.
	Use this to understand existing code before making changes.
	Always read files before editing them to understand the current implementation.`,
	inputSchema: z.object({
		filePath: z
			.string()
			.describe("Path to the file to read (relative to project root)"),
	}),
	outputSchema: z.object({
		content: z.string(),
		lines: z.number(),
		path: z.string(),
	}),
}).server(async ({ filePath }) => {
	const fullPath = path.join(process.cwd(), filePath);
	const content = await fs.readFile(fullPath, "utf-8");
	const lines = content.split("\n").length;

	return {
		content,
		lines,
		path: filePath,
	};
});

/**
 * ✏️ Tool: Write File
 * Allows the AI agent to create or overwrite files
 */
export const writeFileTool = toolDefinition({
	name: "write_file",
	description: `Creates a new file or overwrites an existing file with the provided content.
	Use this for creating new files or completely replacing file contents.
	For modifying existing files, use edit_file instead.`,
	inputSchema: z.object({
		filePath: z
			.string()
			.describe("Path to the file to write (relative to project root)"),
		content: z.string().describe("The complete content to write to the file"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		path: z.string(),
		size: z.number(),
		message: z.string(),
	}),
	needsApproval: true,
}).server(async ({ filePath, content }) => {
	const fullPath = path.join(process.cwd(), filePath);

	// Ensure directory exists
	await fs.mkdir(path.dirname(fullPath), { recursive: true });

	// Write file
	await fs.writeFile(fullPath, content, "utf-8");

	// Get file stats
	const stats = await fs.stat(fullPath);

	return {
		success: true,
		path: filePath,
		size: stats.size,
		message: `✅ File written: ${filePath} (${stats.size} bytes)`,
	};
});

/**
 * ✂️ Tool: Edit File
 * Allows the AI agent to make targeted edits to existing files
 */
export const editFileTool = toolDefinition({
	name: "edit_file",
	description: `Edits an existing file by replacing specific content.
	Use this to make targeted changes to files without rewriting the entire file.
	Provide the exact text to find (old_content) and what to replace it with (new_content).`,
	inputSchema: z.object({
		filePath: z.string().describe("Path to the file to edit"),
		oldContent: z.string().describe("The exact text to find and replace"),
		newContent: z.string().describe("The new text to replace with"),
	}),
	outputSchema: z.object({
		success: z.boolean(),
		path: z.string(),
		replacements: z.number(),
		message: z.string(),
	}),
	needsApproval: true,
}).server(async ({ filePath, oldContent, newContent }) => {
	const fullPath = path.join(process.cwd(), filePath);

	// Read current content
	const currentContent = await fs.readFile(fullPath, "utf-8");

	// Check if old content exists
	if (!currentContent.includes(oldContent)) {
		throw new Error(
			`Content not found in ${filePath}. Make sure the old_content matches exactly.`,
		);
	}

	// Replace content
	const updatedContent = currentContent.replace(oldContent, newContent);
	const replacements = (
		currentContent.match(
			new RegExp(oldContent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
		) || []
	).length;

	// Write back
	await fs.writeFile(fullPath, updatedContent, "utf-8");

	return {
		success: true,
		path: filePath,
		replacements,
		message: `✅ File edited: ${filePath} (${replacements} replacement${replacements > 1 ? "s" : ""})`,
	};
});

/**
 * 📁 Tool: List Files
 * Allows the AI agent to explore the project structure
 */
export const listFilesTool = toolDefinition({
	name: "list_files",
	description: `Lists files and directories in a given path.
	Use this to explore the project structure and find relevant files to modify.`,
	inputSchema: z.object({
		dirPath: z
			.string()
			.describe("Directory path to list (relative to project root)"),
		recursive: z
			.boolean()
			.optional()
			.describe("Whether to list recursively (default: false)"),
	}),
	outputSchema: z.object({
		files: z.array(z.string()),
		directories: z.array(z.string()),
		path: z.string(),
		count: z.number(),
	}),
}).server(async ({ dirPath, recursive = false }) => {
	const fullPath = path.join(process.cwd(), dirPath);

	if (recursive) {
		// Recursive listing
		const allFiles: string[] = [];
		const allDirs: string[] = [];

		async function walk(dir: string, prefix = "") {
			const entries = await fs.readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const relativePath = path.join(prefix, entry.name);

				// Skip node_modules, .git, etc.
				if (entry.name.startsWith(".") || entry.name === "node_modules")
					continue;

				if (entry.isDirectory()) {
					allDirs.push(relativePath);
					await walk(path.join(dir, entry.name), relativePath);
				} else {
					allFiles.push(relativePath);
				}
			}
		}

		await walk(fullPath);

		return {
			files: allFiles,
			directories: allDirs,
			path: dirPath,
			count: allFiles.length + allDirs.length,
		};
	} else {
		// Non-recursive listing
		const entries = await fs.readdir(fullPath, { withFileTypes: true });

		const files = entries.filter((e) => e.isFile()).map((e) => e.name);
		const directories = entries
			.filter((e) => e.isDirectory())
			.map((e) => e.name);

		return {
			files,
			directories,
			path: dirPath,
			count: files.length + directories.length,
		};
	}
});

/**
 * 🔍 Tool: Search Code
 * Allows the AI agent to search for patterns in code
 */
export const searchCodeTool = toolDefinition({
	name: "search_code",
	description: `Searches for text patterns across files in the project.
	Use this to find where specific code, functions, or patterns are used.`,
	inputSchema: z.object({
		pattern: z.string().describe("Text pattern to search for"),
		filePattern: z
			.string()
			.optional()
			.describe("Glob pattern for files to search (e.g., '**/*.ts')"),
		maxResults: z
			.number()
			.optional()
			.describe("Maximum number of results to return (default: 20)"),
	}),
	outputSchema: z.object({
		matches: z.array(
			z.object({
				file: z.string(),
				line: z.number(),
				content: z.string(),
			}),
		),
		totalMatches: z.number(),
		searchPattern: z.string(),
	}),
}).server(
	async ({
		pattern,
		filePattern = "**/*.{ts,tsx,js,jsx}",
		maxResults = 20,
	}) => {
		// Use grep to search (simple implementation)
		// In production, you'd use something like ripgrep or a proper search library
		const { execSync } = require("node:child_process");

		try {
			const grepResult = execSync(
				`grep -rn "${pattern}" --include="${filePattern}" . | head -n ${maxResults}`,
				{
					cwd: process.cwd(),
					encoding: "utf-8",
				},
			);

			const matches = grepResult
				.trim()
				.split("\n")
				.map((line) => {
					const [file, lineNum, ...content] = line.split(":");
					return {
						file: file.replace("./", ""),
						line: parseInt(lineNum) || 0,
						content: content.join(":").trim(),
					};
				});

			return {
				matches,
				totalMatches: matches.length,
				searchPattern: pattern,
			};
		} catch (error) {
			// No matches found
			return {
				matches: [],
				totalMatches: 0,
				searchPattern: pattern,
			};
		}
	},
);
