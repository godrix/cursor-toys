# Cursor Command Toys 🚀 Supercharge Your Cursor Development Experience

A powerful VS Code/Cursor extension that **enhances your development workflow** by making Cursor's AI capabilities more accessible, shareable, and efficient. Transform your coding experience with seamless command management, instant HTTP request testing, and effortless team collaboration.

**Build faster, collaborate better, and unlock the full potential of Cursor AI.**

## 🎬 Visual Demo

### Share Commands and Generate Deeplinks
![Share Command and Generate Deeplink](.github/assets/share-command-and-generate-deeplink.gif)

### Import Commands, Rules, and Prompts
![Import Commands, Rules, and Prompts](.github/assets/import-commands-rules-prompts.gif)

### Personal Commands Tree View
![Personal Commands Tree View](.github/assets/personal-commands-view-tree.gif)

## 🎯 Why Cursor Command Toys?

**Cursor is powerful, but managing AI commands, testing APIs, and sharing configurations shouldn't slow you down.** This extension bridges the gap between Cursor's capabilities and your workflow, providing:

### ⚡ **Faster Development**
- **One-Click Command Execution**: Execute HTTP requests directly from your workspace without leaving your editor
- **Instant Command Access**: Visual tree view for all your personal commands, accessible across all projects
- **Smart CodeLens Integration**: Generate share links and execute requests directly from your files

### 🤝 **Better Collaboration**
- **Share AI Configurations Instantly**: Turn your commands, rules, and prompts into shareable links with one click
- **Team Consistency**: Ensure everyone uses the same AI instructions and best practices
- **Knowledge Replication**: Import team configurations in seconds, not minutes

### 🛠️ **Enhanced Workflow**
- **HTTP Request Testing**: Test APIs directly in your editor with syntax highlighting and automatic response formatting
- **Personal Command Library**: Build a reusable library of commands that work across all your projects
- **Seamless Integration**: Works naturally with Cursor's existing features, no workflow disruption

### 📦 **Developer-First Features**
- **Multiple Request Management**: Organize and execute multiple HTTP requests in a single file
- **Execution Time Tracking**: Monitor API performance directly in your editor
- **Flexible Formats**: Support for curl commands, JSON, and structured request formats

## ✨ What's New

### HTTP Request Execution (Latest)

- **Execute HTTP Requests Directly from Files**: Create `.req` or `.request` files in `.cursor/http/` folder with curl commands or JSON format and execute them with a single click
- **CodeLens Integration**: Click "Send Request" links directly in your HTTP request files to execute requests
- **Multiple Requests Support**: Organize multiple requests in a single file using markdown sections (## Section Title)
- **Automatic Response Handling**: Responses are automatically saved to `.res` or `.response` files (or shown in preview mode)
- **Syntax Highlighting**: Full syntax highlighting for both HTTP request (`.req`, `.request`) and response (`.res`, `.response`) files
- **Execution Time Tracking**: See how long each request took to execute
- **Flexible Formats**: Supports both curl commands and structured JSON format
- **Smart Response Formatting**: Automatically formats JSON and XML responses for better readability

### Personal Commands Management (v0.4.0)

![Personal Commands Tree View](.github/assets/personal-commands-view-tree.gif)

- **Tree View Interface**: New "Personal Commands" sidebar view to browse and manage your user commands from `~/.cursor/commands/` or `~/.claude/commands/`
- **Visual Command Management**: Manage personal commands directly from the tree view with actions to:
  - Open command files
  - Generate deeplinks for sharing
  - Rename commands
  - Delete commands
  - Reveal commands in Explorer
  - Refresh the tree view
- **Automatic Folder Creation**: Tree view automatically creates user commands folder if it doesn't exist
- **Smart Filtering**: Tree view filters files by allowed extensions from configuration
- **Alphabetical Sorting**: Commands are automatically sorted alphabetically for easy navigation

### Enhanced User Experience
- **Improved Organization**: Enhanced user commands management with visual tree view interface
- **Better Accessibility**: Dedicated sidebar view for personal commands makes them easily accessible across all projects

## 🚀 Core Features

### 📋 **Command & Configuration Management**

**Personal Commands Library**
- Visual tree view sidebar for all your personal commands
- Access commands across all projects from one place
- Organize, rename, and manage commands with ease
- Automatic folder creation and smart filtering

**Instant Sharing & Import**
- Generate shareable deeplinks with one click
- Import team configurations instantly via keyboard shortcut (`Cmd+Shift+I`)
- Support for both `.cursor/` and `.claude/` command folders
- Multiple link formats (deeplink, web, custom) for any distribution method

**Smart CodeLens Integration**
- Click-to-share links directly in your files
- No context menu navigation needed
- Works seamlessly with your existing workflow

### 🌐 **HTTP Request Testing**

**In-Editor API Testing**
- Execute HTTP requests directly from `.req` or `.request` files
- Support for curl commands and structured JSON format
- Syntax highlighting for both requests and responses
- Automatic JSON/XML response formatting

**Advanced Request Management**
- Multiple requests in one file using markdown sections
- Individual execution per section via CodeLens
- Execution time tracking for performance monitoring
- Flexible response handling (save to file or preview mode)

### 💬 **Enhanced Chat Integration**

**Direct Code Interaction**
- Send selected code directly to Cursor chat
- Custom text injection for faster context building
- Streamlined AI interaction workflow

## 🚀 Installation

### Quick Install (Recommended)

**For Cursor/VS Code:**
- Open Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
- Search for **"Cursor Command Toys"**
- Click Install

**Direct Links:**
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Godrix.cursor-deeplink)
- [Open VSX Registry](https://open-vsx.org/extension/godrix/cursor-deeplink) (for Cursor and other editors)

### Manual Install

1. Download the latest `.vsix` from [GitHub Releases](https://github.com/godrix/cursor-deeplink/releases)
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Run **"Extensions: Install from VSIX..."**
4. Select the downloaded file

**That's it!** The extension is ready to enhance your Cursor experience.

## 📖 Quick Start Guide

### 🎯 **Get Started in 60 Seconds**

**Step 1: Test an API (30 seconds)**
```bash
# Create .cursor/http/api-test.req in your project
curl -X GET https://api.github.com/users/octocat
```
Click the "Send Request" link that appears above → See formatted response!

**Step 2: Share a Command (20 seconds)**
1. Create `.cursor/commands/my-command.md`
2. Right-click → "Generate Cursor Toys Command"
3. Link copied! Share it anywhere.

**Step 3: Import Team Config (10 seconds)**
1. Press `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
2. Paste a deeplink
3. Done! File created automatically.

### 🎯 **Daily Workflow Scenarios**

#### Scenario 1: Testing an API Endpoint
1. Create `.cursor/http/api-test.req` in your project
2. Write your curl command or JSON request
3. Click the "Send Request" CodeLens link
4. View formatted response with execution time

#### Scenario 2: Sharing a Team Command
1. Create your command in `.cursor/commands/`
2. Right-click → "Generate Cursor Toys Command"
3. Share the link in your team chat
4. Team members import with `Cmd+Shift+I`

#### Scenario 3: Building a Personal Command Library
1. Use the Personal Commands tree view
2. Save frequently used commands as personal commands
3. Access them from any project instantly
4. Organize and manage your AI command collection

## 🤝 Detailed Usage: Share and Import

### Generating Share Links

![Share Command and Generate Deeplink](.github/assets/share-command-and-generate-deeplink.gif)

#### Method 1: Context Menu (Recommended for Quick Generation)

1.  Navigate to the configuration file you wish to share:
      * `.cursor/commands/` or `.claude/commands/` (for Commands)
      * `.cursor/rules/` (for Rules)
      * `.cursor/prompts/` (for Prompts)
2.  **Right-click** the file and select the specific **"Generate Cursor Toys..."** option (e.g., "Generate Cursor Toys Command").
3.  The share link will be **automatically copied to your clipboard**.

#### Method 2: CodeLens (Direct In-File Access)

1.  Open any file in `.cursor/commands/`, `.claude/commands/`, `.cursor/rules/`, or `.cursor/prompts/`.
2.  Click the CodeLens link displayed at the top of the file.
3.  The deeplink will be generated and copied.

### Importing Shared Links

![Import Commands, Rules, and Prompts](.github/assets/import-commands-rules-prompts.gif)

#### Method 1: Keyboard Shortcut

1.  Press **`Ctrl+Shift+I`** (Windows/Linux) or **`Cmd+Shift+I`** (Mac).
2.  Paste the deeplink into the input box.
3.  For **commands**, choose where to save:
    - **Project commands**: Save to `.cursor/commands/` or `.claude/commands/` in the current workspace (based on configuration, project-specific)
    - **Personal commands**: Save to `~/.cursor/commands/` or `~/.claude/commands/` (based on configuration, available in all projects)
4.  The file will be **automatically created and imported** into the appropriate directory.

#### Method 2: Command Palette

1.  Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux).
2.  Type **"Import Cursor Toys"**.
3.  Paste the deeplink, and for commands, choose the save location.
4.  The file will be created.

### Saving Commands as User Commands

You can move existing project commands to your personal commands folder so they're available across all projects:

1.  Right-click on any file in `.cursor/commands/` or `.claude/commands/` folder.
2.  Select **"Cursor Toys"** submenu.
3.  Choose **"Save as User Command"**.
4.  The command will be copied to `~/.cursor/commands/` or `~/.claude/commands/` (based on your configuration) and you'll be asked if you want to remove the original file from the workspace.

## 🌐 HTTP Request Execution

**Test APIs without leaving your editor.** Execute HTTP requests directly from your workspace with full syntax highlighting, automatic response formatting, and performance tracking.

### Visual Demo
![Send HTTP Request](.github/assets/send-request.gif)

### Creating HTTP Request Files

**Important**: HTTP request files must be located in the `.cursor/http/` folder (or subfolders within it) to be recognized by the extension.

Create files with `.req` or `.request` extension in `.cursor/http/` containing your HTTP requests in one of two formats:

#### Format 1: Curl Command
```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

#### Format 2: Structured JSON
```json
{
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Executing Requests

#### Method 1: CodeLens (Recommended)
1. Open any `.req` or `.request` file in `.cursor/http/` folder
2. Click the **"Send Request"** link that appears above the request (or above each section if you have multiple requests)
3. The request will be executed and the response will be displayed

#### Method 2: Command Palette
1. Open any `.req` or `.request` file in `.cursor/http/` folder
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type **"Send HTTP Request"** and select it
4. The request will be executed

**Note**: Files must be in `.cursor/http/` (or subfolders) to be recognized. The extension will not show CodeLens links for `.req` files outside this folder.

### Multiple Requests in One File

You can organize multiple requests in a single file using markdown sections. Create the file in `.cursor/http/`:

```markdown
## Get User
curl -X GET https://api.example.com/users/123 \
  -H "Authorization: Bearer token123"

## Create User
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name": "John Doe"}'
```

Each section will have its own "Send Request" CodeLens link, allowing you to execute requests individually.

### File Location Requirements

**HTTP request files must be located in:**
- `.cursor/http/` (root level)
- `.cursor/http/subfolder/` (any subfolder)

**Supported file extensions:**
- `.req`
- `.request`

**Example file structure:**
```
project/
  .cursor/
    http/
      api-tests.req
      auth/
        login.request
      users.req
```

### Response Files

When a request is executed:
- **If `httpRequestSaveFile` is `true`**: The response is saved to a `.res` or `.response` file (same name as request file, with response extension)
- **If `httpRequestSaveFile` is `false`**: The response is shown in a preview tab (not saved to disk)

Response files include:
- HTTP status code and status text
- Response headers
- Formatted response body (JSON and XML are automatically formatted)
- Execution time in the file name/title

### Configuration

Configure HTTP request behavior in your settings:

```json
{
  "cursorDeeplink.httpRequestTimeout": 10,
  "cursorDeeplink.httpRequestSaveFile": false
}
```

- **`cursorDeeplink.httpRequestTimeout`**: Timeout in seconds for HTTP requests (default: 10 seconds)
- **`cursorDeeplink.httpRequestSaveFile`**: Save HTTP response to file. If `false`, only shows preview without saving (default: `false`)

### Requirements

- **curl**: The extension uses `curl` command-line tool to execute requests. Make sure `curl` is installed and available in your system PATH.

## 🔗 Link Formats & Distribution

Choose the link format that works best for your sharing needs:

| Format | Example | Best For |
| :--- | :--- | :--- |
| **Deeplink** | `cursor://anysphere.cursor-deeplink/prompt?text=...` | Direct sharing in Slack, Discord, or other tools that support native links |
| **Web Link** | `https://cursor.com/link/prompt?text=...` | Blogs, documentation, forums, or any platform requiring HTTP links |
| **Custom** | `https://example.com/link/prompt?text=...` | Internal systems, custom distribution channels, or branded sharing |

### All Configuration Options

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `cursorDeeplink.linkType` | `string` | `"deeplink"` | Link format: `"deeplink"`, `"web"`, or `"custom"` |
| `cursorDeeplink.customBaseUrl` | `string` | `""` | Custom base URL (only used when `linkType` is `"custom"`) |
| `cursorDeeplink.allowedExtensions` | `string[]` | `["md", "mdc"]` | File extensions allowed for link processing |
| `cursorDeeplink.commandsFolder` | `string` | `"cursor"` | Commands folder: `"cursor"` or `"claude"` |
| `cursorDeeplink.personalCommandsView` | `string` | `"both"` | Personal commands view: `"both"`, `"cursor"`, or `"claude"` |
| `cursorDeeplink.httpRequestTimeout` | `number` | `10` | HTTP request timeout in seconds |
| `cursorDeeplink.httpRequestSaveFile` | `boolean` | `false` | Save HTTP responses to file (vs preview only) |

## 💡 Real-World Use Cases

### Use Case 1: Team Onboarding
**Problem**: New team members need to set up Cursor with project-specific commands and rules.

**Solution**: 
1. Team lead creates standardized commands and rules
2. Generates deeplinks for each configuration
3. Shares links in onboarding documentation
4. New members import everything with `Cmd+Shift+I` in seconds

**Result**: Consistent AI behavior across the entire team from day one.

### Use Case 2: API Development Workflow
**Problem**: Constantly switching between editor and terminal/Postman to test API endpoints.

**Solution**:
1. Create `.req` files in `.cursor/http/` folder (or subfolders)
2. Write requests in curl or JSON format
3. Execute directly from editor with CodeLens
4. View formatted responses with execution times

**Result**: Faster iteration, better context, no context switching.

### Use Case 3: Personal Productivity
**Problem**: Recreating the same commands in every new project.

**Solution**:
1. Build a personal command library using the tree view
2. Save frequently used commands as personal commands
3. Access them instantly in any project
4. Share your best commands with the community

**Result**: Your best AI workflows available everywhere, instantly.

### Use Case 4: Knowledge Sharing
**Problem**: Great AI prompts and commands get lost in Slack/Discord history.

**Solution**:
1. Create a command/prompt that solves a specific problem
2. Generate a shareable deeplink
3. Share in team channels or documentation
4. Team members can import and use immediately

**Result**: Knowledge becomes reusable, searchable, and permanent.

-----

## ⚙️ Configuration & Customization

### Workspace vs User Settings

Configure the extension at both workspace and user levels:

- **Workspace settings**: Project-specific configurations (`.vscode/settings.json`)
- **User settings**: Personal preferences that apply globally

### Recommended Settings

```json
{
  // Use web links for maximum compatibility
  "cursorDeeplink.linkType": "web",
  
  // Save HTTP responses for API testing workflow
  "cursorDeeplink.httpRequestSaveFile": true,
  "cursorDeeplink.httpRequestTimeout": 30,
  
  // Support both .cursor and .claude folders
  "cursorDeeplink.commandsFolder": "cursor",
  "cursorDeeplink.personalCommandsView": "both"
}
```

## 📝 Limitations & Notes

  * **URL Length Limit**: Deeplink content cannot exceed 8,000 characters (after URL-encoding). The system will warn you if this limit is reached.
  * **File Location for Deeplinks**: Only files within `.cursor/commands/`, `.claude/commands/`, `.cursor/rules/`, or `.cursor/prompts/` folders can be converted into share links.
  * **HTTP Request File Location**: HTTP request files (`.req`, `.request`) must be located in `.cursor/http/` folder (or subfolders) to be recognized and executed.
  * **HTTP Requests**: Requires `curl` to be installed and available in your system PATH.

## ⌨️ Available Commands

| Command | Description | Shortcut |
| :--- | :--- | :--- |
| `cursor-commands-toys.generate` | Generate share link (opens type selector) | - |
| `cursor-commands-toys.generate-command` | Generate command share link | - |
| `cursor-commands-toys.generate-rule` | Generate rule share link | - |
| `cursor-commands-toys.generate-prompt` | Generate prompt share link | - |
| `cursor-commands-toys.import` | Import share link to create file | `Ctrl+Shift+I` / `Cmd+Shift+I` |
| `cursor-commands-toys.save-as-user-command` | Save project command as personal command | - |
| `cursor-commands-toys.sendHttpRequest` | Execute HTTP request from file | - |
| `cursor-commands-toys.sendToChat` | Send custom text to Cursor chat | - |
| `cursor-commands-toys.sendSelectionToChat` | Send selected code to Cursor chat | - |

**Pro Tip**: Most commands are accessible via CodeLens (clickable links in your files) or context menu (right-click), so you rarely need to remember command names!

## 🎁 Developer Experience Benefits

### ⏱️ **Time Savings**
- **No more manual file copying**: Import team configurations in seconds
- **No context switching**: Test APIs without leaving your editor
- **Instant access**: Personal commands available across all projects

### 🧠 **Cognitive Load Reduction**
- **Visual organization**: Tree view makes command management intuitive
- **One-click actions**: CodeLens eliminates menu navigation
- **Automatic formatting**: Responses formatted for readability

### 🤝 **Team Productivity**
- **Consistency**: Everyone uses the same AI configurations
- **Knowledge sharing**: Best practices become reusable assets
- **Onboarding speed**: New team members productive faster

### 🚀 **Workflow Enhancement**
- **Integrated testing**: API testing where you code
- **Command library**: Build once, use everywhere
- **Seamless sharing**: Turn configurations into shareable links instantly

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🔧 Code contributions

Please feel free to [open an issue](https://github.com/godrix/cursor-deeplink/issues) or submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the Cursor community**