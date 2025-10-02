const vscode = require("vscode");

/**
 * Get the stored Gemini API key
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<string|undefined>}
 */
async function getApiKey(context) {
	return await context.secrets.get("xpocommit-ai.apiKey");
}

/**
 * Send diff to Gemini AI to generate commit message
 * @param {vscode.ExtensionContext} context
 * @param {string} diff - the git diff string
 * @returns {Promise<string|null>} - AI-generated commit message or null
 */
async function generateCommitMessage(context, diff) {
	const apiKey = await getApiKey(context);

	if (!apiKey) {
		vscode.window.showErrorMessage(
			"API key not set. Please set it via 'XpoCommit: Set API Key'."
		);
		return null;
	}

	if (!diff) {
		vscode.window.showWarningMessage(
			"No valid git diff to generate a commit message."
		);
		return null;
	}

	const promt = `You are a professional software engineer. Your task is to generate clear, concise, and descriptive git commit messages based on code diffs. 

Guidelines:
- Use **conventional commit prefixes** where appropriate:
  - feat: for new features
  - fix: for bug fixes
  - docs: for documentation changes
  - style: for code style formatting (whitespace, formatting, etc.)
  - refactor: for code restructuring without changing behavior
  - perf: for performance improvements
  - test: for adding or fixing tests
  - chore: for maintenance or tooling changes
- Analyze the diff carefully and choose the most appropriate prefix.
- Summarize the changes in one line if possible.
- Use imperative tense (e.g., "Add feature", "Fix bug", "Update docs").
- Avoid unnecessary details like file paths or line numbers.
- Focus on the purpose and effect of the change, not implementation details.
- Keep the message under 72 characters if possible.

Only return the commit message as plain text. Do not add extra commentary or explanations.
`;
	try {
		const response = await fetch(
			"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
			{
				method: "POST",
				headers: {
					"x-goog-api-key": apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{
									text: `${promt}:\n\n${diff}`,
								},
							],
						},
					],
				}),
			}
		);
		if (!response.ok) {
			vscode.window.showErrorMessage(`Gemini API returned ${response.status}`);
			return null;
		}

		const data = await response.json();

		// @ts-ignore
		let commitMessage =
			data?.candidates?.[0]?.content?.parts?.[0]?.text ||
			"No commit message returned";

		return commitMessage;
	} catch (err) {
		vscode.window.showErrorMessage(
			"Failed to generate AI commit: " + err.message
		);
		return null;
	}
}

module.exports = {
	getApiKey,
	generateCommitMessage,
};
