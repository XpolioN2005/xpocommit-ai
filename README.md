# XpoCommit AI

Automatically generate meaningful Git commit messages using AI directly in VS Code.

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?style=flat)](https://github.com/yourusername/XpoCommit-AI/releases) [![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](LICENSE) [![VS Code](https://img.shields.io/badge/VS%20Code-extension-007ACC.svg?style=flat)](https://marketplace.visualstudio.com/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/yourusername/XpoCommit-AI/pulls) ![Gemini 2.5](https://img.shields.io/badge/LLM-Gemini%202.5-ff69b4.svg?style=flat)

[![Demo](https://i.ibb.co/x8rjNWnR/demo.png)](https://drive.google.com/file/d/1OxFojp_stDsRhhLv0MY7EpTegk19N8tA/view?usp=drive_link)

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

Initial release of XpoCommit AI with automatic AI commit message generation.

---

## Usage

1. Open your Git workspace in VS Code.
2. Make code changes so Git registers a diff.
3. Click the button in the Source Control view. or use command pallet **XpoCommit: Generate Commit Message - Gemini** or using **ctrl + alt + c**
4. Set your Gemini API key if prompted.
5. Your commit message is automatically inserted into the commit input box.

---

## Contributing 🤝

Contributions are welcome! Feel free to fork this repo, open issues, and submit pull requests.
If you’d like to collaborate more deeply, reach out — I’m open to ideas and contributors from the ground up.
