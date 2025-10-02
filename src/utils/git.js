const { exec } = require("child_process");
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function getGitExtension() {
	const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
	if (!gitExtension) {
		vscode.window.showErrorMessage("Git extension not found.");
		return null;
	}
	return gitExtension.getAPI(1); // API version 1
}

function runCommand(cmd, cwd) {
	return new Promise((resolve, reject) => {
		exec(cmd, { cwd }, (err, stdout, stderr) => {
			if (err) reject(stderr || err.message);
			else resolve(stdout.trim());
		});
	});
}

async function isGitRepo(cwd) {
	try {
		await runCommand("git rev-parse --is-inside-work-tree", cwd);
		return true;
	} catch {
		return false;
	}
}

function globToRegex(pattern) {
	let g = pattern.replace(/\\/g, "/");
	g = g.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\./g, "\\.");
	return new RegExp("^" + g + "$");
}

function filterIgnoredFiles(files, ignoredPatterns) {
	if (!ignoredPatterns || ignoredPatterns.length === 0) return files;

	const regexes = ignoredPatterns.map(globToRegex);
	return files.filter((f) => {
		const posixPath = f.split(path.sep).join("/");
		return !regexes.some((r) => r.test(posixPath));
	});
}

async function getCleanGitDiff(cwd) {
	if (!(await isGitRepo(cwd))) {
		vscode.window.showErrorMessage("Not a Git repository.");
		return null;
	}

	try {
		// Get modified and staged tracked files
		const stagedFilesRaw = await runCommand(
			"git diff --cached --name-only",
			cwd
		);
		const unstagedFilesRaw = await runCommand("git diff --name-only", cwd);
		// Get untracked files
		const untrackedFilesRaw = await runCommand(
			"git ls-files --others --exclude-standard",
			cwd
		);

		let allFiles = [
			...(stagedFilesRaw ? stagedFilesRaw.split(/\r?\n/) : []),
			...(unstagedFilesRaw ? unstagedFilesRaw.split(/\r?\n/) : []),
			...(untrackedFilesRaw ? untrackedFilesRaw.split(/\r?\n/) : []),
		]
			.map((f) => f.trim())
			.filter(Boolean);

		const ignoredPatterns =
			vscode.workspace.getConfiguration("xpocommit-ai").get("ignoredFiles") ||
			[];

		const validFiles = filterIgnoredFiles(allFiles, ignoredPatterns);
		if (validFiles.length === 0) {
			vscode.window.showWarningMessage(
				"No valid files to commit after ignoring patterns."
			);
			return null;
		}

		let diffParts = [];

		// Staged tracked files
		if (stagedFilesRaw) {
			const stagedTracked = validFiles.filter((f) =>
				stagedFilesRaw.includes(f)
			);
			if (stagedTracked.length > 0) {
				const stagedDiff = await runCommand(
					`git diff --cached -- ${stagedTracked
						.map((f) => `"${f}"`)
						.join(" ")}`,
					cwd
				);
				if (stagedDiff) diffParts.push(stagedDiff);
			}
		}

		// Unstaged tracked files
		if (unstagedFilesRaw) {
			const unstagedTracked = validFiles.filter((f) =>
				unstagedFilesRaw.includes(f)
			);
			if (unstagedTracked.length > 0) {
				const unstagedDiff = await runCommand(
					`git diff -- ${unstagedTracked.map((f) => `"${f}"`).join(" ")}`,
					cwd
				);
				if (unstagedDiff) diffParts.push(unstagedDiff);
			}
		}

		// Untracked/new files → return full content
		if (untrackedFilesRaw) {
			const untrackedValid = validFiles.filter((f) =>
				untrackedFilesRaw.includes(f)
			);
			for (const file of untrackedValid) {
				const fullPath = path.join(cwd, file);
				if (fs.existsSync(fullPath)) {
					const content = fs.readFileSync(fullPath, "utf-8");
					// Simulate diff format for new file
					diffParts.push(`--- /dev/null\n+++ b/${file}\n${content}`);
				}
			}
		}

		return diffParts.join("\n") || null;
	} catch (err) {
		vscode.window.showErrorMessage("Failed to get git diff: " + err);
		return null;
	}
}

module.exports = {
	getCleanGitDiff,
	getGitExtension,
};
