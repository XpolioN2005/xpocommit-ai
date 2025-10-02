const { exec } = require("child_process");
const vscode = require("vscode");
const path = require("path");

/**
 * Run a command and return stdout
 */
function runCommand(cmd, cwd) {
	return new Promise((resolve, reject) => {
		exec(cmd, { cwd }, (err, stdout, stderr) => {
			if (err) reject(stderr || err.message);
			else resolve(stdout.trim());
		});
	});
}

/**
 * Check if folder is a Git repo
 */
async function isGitRepo(cwd) {
	try {
		await runCommand("git rev-parse --is-inside-work-tree", cwd);
		return true;
	} catch {
		return false;
	}
}

/**
 * Convert glob patterns to simple regex (basic **, *)
 */
function globToRegex(pattern) {
	let g = pattern.replace(/\\/g, "/");
	g = g.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\./g, "\\.");
	return new RegExp("^" + g + "$");
}

/**
 * Filter files against ignored patterns
 */
function filterIgnoredFiles(files, ignoredPatterns) {
	if (!ignoredPatterns || ignoredPatterns.length === 0) return files;

	const regexes = ignoredPatterns.map(globToRegex);
	return files.filter((f) => {
		const posixPath = f.split(path.sep).join("/");
		return !regexes.some((r) => r.test(posixPath));
	});
}

/**
 * Get git diff of staged files, filtered by ignoredFiles from settings
 */
async function getCleanGitDiff(cwd) {
	if (!(await isGitRepo(cwd))) {
		vscode.window.showErrorMessage("Not a Git repository.");
		return null;
	}

	try {
		// Get staged files only
		const rawFiles = await runCommand("git diff --name-only", cwd);
		if (!rawFiles) return null;
		const files = rawFiles
			.split(/\r?\n/)
			.map((f) => f.trim())
			.filter(Boolean);

		// Read ignored patterns from settings
		const ignoredPatterns =
			vscode.workspace.getConfiguration("xpocommit-ai").get("ignoredFiles") ||
			[];

		// Filter out ignored files
		const validFiles = filterIgnoredFiles(files, ignoredPatterns);
		if (validFiles.length === 0) {
			vscode.window.showWarningMessage(
				"No valid files to commit after ignoring patterns."
			);
			return null;
		}

		// Get diff for valid files only
		const diffCmd = `git diff -- ${validFiles.map((f) => `"${f}"`).join(" ")}`;
		const diff = await runCommand(diffCmd, cwd);
		return diff || null;
	} catch (err) {
		vscode.window.showErrorMessage("Failed to get git diff: " + err);
		return null;
	}
}

module.exports = {
	getCleanGitDiff,
};
