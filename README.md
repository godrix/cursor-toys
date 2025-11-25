# Cursor Deeplink Extension

A VS Code/Cursor extension that enables easy generation and import of deeplinks for Cursor commands, rules, and prompts. Share your custom instructions, commands, and rules with your team through shareable deeplinks.

## Purpose

This extension simplifies the creation and sharing of Cursor configuration files (commands, rules, and prompts) by:

- **Generating deeplinks** from your existing files with a single click
- **Importing deeplinks** to automatically create files in the correct directories
- **Supporting both deeplink and web link formats** for maximum compatibility
- **Providing CodeLens integration** for quick access directly in your files

Deeplinks allow you to share instructions and commands with others, enabling collaboration and knowledge sharing across teams and communities.

## Features

- 🚀 **Generate Deeplinks**: Right-click on files in `.cursor/commands/`, `.cursor/rules/`, or `.cursor/prompts/` to generate deeplinks
- 📥 **Import Deeplinks**: Import deeplinks to automatically create files in the appropriate directories
- 🔗 **Multiple Link Formats**: Support for both `cursor://` deeplinks and `https://cursor.com/link/` web links
- 👁️ **CodeLens Integration**: Clickable links at the top of files for quick deeplink generation
- ⚙️ **Configurable**: Customize allowed file extensions and link types
- 📝 **File Type Detection**: Automatically detects file type based on directory structure
- ✅ **Validation**: Validates file extensions and URL length (8000 character limit)

## Installation

1. Clone or download this repository
2. Open the project in VS Code or Cursor
3. Run `npm install` to install dependencies
4. Press `F5` to launch the extension in a new window, or package it for distribution

## Usage

### Generating Deeplinks

#### Method 1: Context Menu (Recommended)

1. Navigate to a file in one of these directories:
   - `.cursor/commands/` for commands
   - `.cursor/rules/` for rules
   - `.cursor/prompts/` for prompts

2. Right-click on the file

3. You'll see context-specific options:
   - **"Generate Cursor Deeplink Command"** (for files in `commands/`)
   - **"Generate Cursor Deeplink Rule"** (for files in `rules/`)
   - **"Generate Cursor Deeplink Prompt"** (for files in `prompts/`)

4. You'll also see a generic **"Generate Cursor Deeplink"** option that opens a selector to choose the type

5. Click your preferred option - the deeplink will be copied to your clipboard

#### Method 2: CodeLens

1. Open any file in `.cursor/commands/`, `.cursor/rules/`, or `.cursor/prompts/`
2. Look for a clickable link at the top of the file (CodeLens)
3. Click the link to generate and copy the deeplink

#### Method 3: Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Generate Cursor Deeplink"
3. Select the appropriate command:
   - `Generate Cursor Deeplink` - Opens a type selector
   - `Generate Cursor Deeplink Command` - Generates command deeplink
   - `Generate Cursor Deeplink Rule` - Generates rule deeplink
   - `Generate Cursor Deeplink Prompt` - Generates prompt deeplink

### Importing Deeplinks

#### Method 1: Keyboard Shortcut

1. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
2. Paste the deeplink in the input box
3. The file will be created in the appropriate directory

#### Method 2: Command Palette

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Import Cursor Deeplink"
3. Paste the deeplink
4. The file will be created automatically

#### Method 3: Native Cursor Deeplink Support

Cursor has built-in support for deeplinks. You can also use the native deeplink handler:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Cursor deeplink debug trigger" or search for deeplink-related commands
3. This will open Cursor's native deeplink handler

**Note**: The native handler is useful for testing and debugging deeplinks directly in Cursor.

### Deeplink Formats

The extension supports two link formats:

#### Deeplink Format (Default)
```
cursor://anysphere.cursor-deeplink/prompt?text=Hello%20world
cursor://anysphere.cursor-deeplink/command?name=run_test&text=Run%20tests
cursor://anysphere.cursor-deeplink/rule?name=always_test&text=Always%20run%20tests
```

#### Web Link Format
```
https://cursor.com/link/prompt?text=Hello%20world
https://cursor.com/link/command?name=run_test&text=Run%20tests
https://cursor.com/link/rule?name=always_test&text=Always%20run%20tests
```

Web links redirect users to cursor.com where they can open the deeplink in their browser or copy it to use in Cursor.

## Configuration

### Settings

Open Settings (`Cmd+,` on Mac, `Ctrl+,` on Windows/Linux) and search for "Cursor Deeplink":

#### `cursorDeeplink.linkType`

- **Type**: `string`
- **Options**: `"deeplink"` | `"web"`
- **Default**: `"deeplink"`
- **Description**: Choose whether to generate `cursor://` deeplinks or `https://cursor.com/link/` web links

#### `cursorDeeplink.allowedExtensions`

- **Type**: `array<string>`
- **Default**: `["md", "mdc"]`
- **Description**: File extensions allowed for processing (without the dot, e.g., `"md"`, `"mdc"`, `"txt"`)

**Note**: For rules, `.mdc` is recommended to support MDC format with metadata (frontmatter). The extension will prefer `.mdc` for rules if it's in the allowed extensions list.

### Example Configuration

```json
{
  "cursorDeeplink.linkType": "web",
  "cursorDeeplink.allowedExtensions": ["md", "mdc", "txt"]
}
```

## File Structure

The extension works with the following directory structure:

```
.cursor/
├── commands/     # Command files (.md)
├── rules/         # Rule files (.md or .mdc for MDC format)
└── prompts/       # Prompt files (.md)
```

### Rule Files with MDC Format

Rules can use the MDC (Markdown with Content) format to include metadata:

```markdown
---
description: RPC Service boilerplate
globs:
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.
```

The extension supports both `.md` and `.mdc` formats for rules.

## Limitations

- **URL Length**: Deeplink URLs have a maximum length of 8,000 characters. The extension will warn you if your content exceeds this limit when URL-encoded.
- **File Extensions**: Only files with allowed extensions (configured in settings) will be processed.
- **File Location**: Files must be in `.cursor/commands/`, `.cursor/rules/`, or `.cursor/prompts/` directories.

## Commands

| Command | Description | Keyboard Shortcut |
|---------|------------|-------------------|
| `cursor-deeplink.generate` | Generate deeplink (opens type selector) | - |
| `cursor-deeplink.generate-command` | Generate command deeplink | - |
| `cursor-deeplink.generate-rule` | Generate rule deeplink | - |
| `cursor-deeplink.generate-prompt` | Generate prompt deeplink | - |
| `cursor-deeplink.import` | Import deeplink | `Ctrl+Shift+I` / `Cmd+Shift+I` |

## Examples

### Example 1: Generate a Command Deeplink

1. Create a file `.cursor/commands/run-tests.md`:
   ```markdown
   Run the tests in package.json
   ```

2. Right-click the file and select "Generate Cursor Deeplink Command"

3. The deeplink is copied to clipboard:
   ```
   cursor://anysphere.cursor-deeplink/command?name=run_tests&text=Run%20the%20tests%20in%20package.json
   ```

### Example 2: Import a Prompt Deeplink

1. Press `Cmd+Shift+I` (or `Ctrl+Shift+I`)

2. Paste the deeplink:
   ```
   cursor://anysphere.cursor-deeplink/prompt?text=Exemplo+de+um+prompt+com+link+para+o+cursor
   ```

3. A file is created in `.cursor/prompts/` with the content decoded

### Example 3: Share a Rule with Team

1. Create `.cursor/rules/code-review.mdc`:
   ```markdown
   ---
   description: Code review guidelines
   alwaysApply: false
   ---
   
   Always run tests before committing code.
   ```

2. Generate the deeplink and share it with your team

3. Team members can import it using the extension

## Development

### Building

```bash
npm install
npm run compile
```

### Debugging

1. Open the project in VS Code/Cursor
2. Press `F5` to launch the extension in a new window
3. The extension will be loaded in the new window for testing

### Project Structure

```
.
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── deeplinkGenerator.ts   # Deeplink generation logic
│   ├── deeplinkImporter.ts    # Deeplink import logic
│   ├── codelensProvider.ts    # CodeLens provider
│   └── utils.ts               # Utility functions
├── out/                        # Compiled JavaScript
├── package.json               # Extension manifest
└── tsconfig.json              # TypeScript configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Support

For issues, feature requests, or questions, please open an issue on the repository.
