const vscode = require("vscode");
const { getCleanGitDiff, getGitExtension } = require("./utils/git");
const { generateCommitMessage } = require("./utils/aiHandeler");

const SECRET_KEY = "xpocommit-ai.apiKey";

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	let setApiKey = vscode.commands.registerCommand(
		"xpocommit-ai.setApiKey",
		async () => {
			const key = await vscode.window.showInputBox({
				prompt: "Enter your Gemini API key",
				ignoreFocusOut: true,
				password: false,
			});
			if (!key) {
				vscode.window.showInformationMessage("API key not set.");
				return;
			}
			await context.secrets.store(SECRET_KEY, key);
			vscode.window.showInformationMessage("API key saved securely.");
		}
	);
	context.subscriptions.push(setApiKey);

	let clearApiKey = vscode.commands.registerCommand(
		"xpocommit-ai.clearApiKey",
		async () => {
			await context.secrets.delete(SECRET_KEY);
			vscode.window.showInformationMessage("API key cleared.");
		}
	);
	context.subscriptions.push(clearApiKey);

	let generateCommit = vscode.commands.registerCommand(
		"xpocommit-ai.generateCommit",
		async () => {
			const key = await getApiKey(context);
			if (!key) {
				const choice = await vscode.window.showWarningMessage(
					"No API key found. Please set your Gemini API key.",
					"Set API Key"
				);
				if (choice === "Set API Key") {
					await vscode.commands.executeCommand("xpocommit-ai.setApiKey");
				}
				return;
			}

			const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
			const diff = await getCleanGitDiff(folder);
			if (!diff) {
				vscode.window.showInformationMessage("NO CHANGES");
				return;
			}
			vscode.window.showInformationMessage(`Diff length: ${diff.length}`);
			const response = await generateCommitMessage(context, diff);

			if (!response) {
				vscode.window.showErrorMessage("No commit message generated.");
				return;
			}

			// Insert commit message into VSCode Git commit box
			const gitAPI = getGitExtension();
			if (!gitAPI) return;

			const repo = gitAPI.repositories[0]; // use the first repo in the workspace
			if (!repo) {
				vscode.window.showErrorMessage("No Git repository found.");
				return;
			}

			repo.inputBox.value = response;
			vscode.window.showInformationMessage("AI commit message inserted!");
		}
	);

	context.subscriptions.push(generateCommit);
}

async function getApiKey(context) {
	return await context.secrets.get(SECRET_KEY);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
	getApiKey,
};
