# XpoCommit AI

Automatically generate meaningful Git commit messages using AI directly in VS Code.

![Demo](https://via.placeholder.com/600x200?text=XpoCommit+AI+Demo)

---

## Features

- Automatically generate Git commit messages from your code changes.
- Insert commit messages directly into the VS Code Source Control commit box.
- Securely store your Gemini API key using VS Code secrets.
- Customizable ignored files to avoid unnecessary diffs.
- High-visibility SCM sidebar button for quick access.

---

## Requirements

- A Gemini API key for AI-powered commit generation.

---

## Extension Settings

This extension contributes the following settings:

- `xpocommit-ai.ignoredFiles`: Glob patterns for files to ignore when generating commit messages. Default includes:

```json
[
	"node_modules/**",
	".git/**",
	".vscode/**",
	"dist/**",
	"build/**",
	"out/**",
	".DS_Store",
	"*.log",
	"*.tmp",
	"*.env",
	".idea/**",
	".history/**",
	".cache/**",
	"package-lock.json",
	"yarn.lock",
	"pnpm-lock.yaml",
	"Cargo.lock",
	"go.sum",
	"composer.lock",
	"__pycache__/**",
	"*.pyc"
]
```

---

## Known Issues

- Ensure a Git repository is open; the button will not appear otherwise.
- The extension may not work with non-standard SCM providers.

---

## Release Notes

### 0.0.1

Initial release of XpoCommit_AI with automatic AI commit message generation.

---

## Usage

1. Open your Git workspace in VS Code.
2. Make code changes so Git registers a diff.
3. Click the **⚡ Generate Commit Message** button in the Source Control view.
4. Set your Gemini API key if prompted.
5. Your commit message is automatically inserted into the commit input box.

---
