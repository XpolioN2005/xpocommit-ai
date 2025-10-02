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

			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: "Generating commit message...",
					cancellable: false,
				},
				async (progress) => {
					const gitAPI = getGitExtension();
					if (!gitAPI) {
						vscode.window.showErrorMessage("Git extension not found.");
						return;
					}

					const repo = gitAPI.repositories[0];
					if (!repo) {
						vscode.window.showErrorMessage("No Git repository found.");
						return;
					}

					const diff = await getCleanGitDiff(folder);
					if (!diff) {
						vscode.window.showInformationMessage("No changes found.");
						return;
					}

					const response = await generateCommitMessage(context, diff);

					if (!response) {
						vscode.window.showErrorMessage("No commit message generated.");
						return;
					}

					repo.inputBox.value = response;

					vscode.window.showInformationMessage("Commit message inserted!");
				}
			);
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
