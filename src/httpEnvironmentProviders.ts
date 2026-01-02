import * as vscode from 'vscode';
import { isHttpRequestFile } from './utils';
import { EnvironmentManager } from './environmentManager';

/**
 * Provides hover information for environment variables in HTTP request files
 */
export class HttpVariableHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // Only provide hover for HTTP request files
    if (!isHttpRequestFile(document.uri.fsPath)) {
      return null;
    }

    // Get the word at the current position
    const wordRange = document.getWordRangeAtPosition(position, /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);
    
    // Extract variable name from {{variable}}
    const match = word.match(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/);
    if (!match) {
      return null;
    }

    const varName = match[1];

    // Detect environment for this section
    const envName = this.getEnvironmentForLine(document, position.line);
    
    if (!envName) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${varName}**\n\n`);
      markdown.appendMarkdown('_No environment decorator found._\n\n');
      markdown.appendMarkdown('Tip: Add `# @env default` before the section to use `.env` file\n\n');
      markdown.appendMarkdown('Example:\n');
      markdown.appendCodeblock('# @env default\n## My Request\ncurl --request GET \\\n  --url {{base_url}}/api', 'http');
      return new vscode.Hover(markdown);
    }

    // Get workspace path
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const envManager = EnvironmentManager.getInstance();

    // Load variables and get value
    const variables = envManager.loadEnvironment(envName, workspacePath);
    if (!variables) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${varName}** \`[${envName}]\`\n\n`);
      markdown.appendMarkdown(`_Environment file not found_\n\n`);
      markdown.appendMarkdown(`Tip: Create \`.env.${envName}\` in \`.cursor/http/environments/\`\n\n`);
      markdown.appendMarkdown(`Or use \`# @env default\` to use the default \`.env\` file`);
      return new vscode.Hover(markdown);
    }

    const value = variables.get(varName.toLowerCase());
    
    if (value !== undefined) {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${varName}** \`[${envName}]\`\n\n`);
      markdown.appendCodeblock(value, 'text');
      return new vscode.Hover(markdown);
    } else {
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**${varName}** \`[${envName}]\`\n\n`);
      markdown.appendMarkdown(`_Variable not defined in \`.env.${envName}\`_\n\n`);
      markdown.appendMarkdown(`Tip: Add to your environment file:\n`);
      markdown.appendCodeblock(`${varName.toUpperCase()}=your-value-here`, 'bash');
      return new vscode.Hover(markdown);
    }
  }

  /**
   * Detects the environment decorator for a line with cascading support
   * Implements 3-level cascading: section-specific > previous section > global
   */
  private getEnvironmentForLine(document: vscode.TextDocument, lineNumber: number): string | null {
    // 1. First, find the section header (##) by searching backwards
    let sectionHeaderLine = -1;
    for (let i = lineNumber; i >= 0; i--) {
      const line = document.lineAt(i).text.trim();
      if (line.startsWith('##')) {
        sectionHeaderLine = i;
        break;
      }
    }
    
    // If no section header found, search from current line
    if (sectionHeaderLine === -1) {
      sectionHeaderLine = lineNumber;
    }
    
    // 2. Try to find section-specific decorator
    const sectionEnv = this.findSectionEnvironment(document, sectionHeaderLine);
    if (sectionEnv) {
      return sectionEnv;
    }
    
    // 3. If not found, inherit from previous section
    const previousSectionEnv = this.findPreviousSectionEnvironment(document, sectionHeaderLine);
    if (previousSectionEnv) {
      return previousSectionEnv;
    }
    
    // 4. If no previous section, use global environment
    const globalEnv = this.findGlobalEnvironment(document);
    return globalEnv;
  }

  /**
   * Finds the environment decorator for a specific section
   */
  private findSectionEnvironment(document: vscode.TextDocument, sectionHeaderLine: number): string | null {
    // Search backwards from section header for # @env decorator
    // Stop when we find another section header or reach the top
    for (let i = sectionHeaderLine - 1; i >= 0; i--) {
      const line = document.lineAt(i).text.trim();
      
      // Skip empty lines
      if (!line) {
        continue;
      }
      
      // Match decorator: # @env qa  or  #@env qa
      const match = line.match(/^#\s*@env\s+(\w+)/i);
      if (match) {
        return match[1];
      }
      
      // Stop if we find another section header
      if (line.startsWith('##')) {
        return null;
      }
      
      // Stop if we find a non-comment line
      if (!line.startsWith('#')) {
        return null;
      }
    }
    
    return null;
  }

  /**
   * Finds the environment from the previous section (inheritance)
   */
  private findPreviousSectionEnvironment(document: vscode.TextDocument, currentSectionLine: number): string | null {
    // Search for the previous section (next ## above)
    for (let i = currentSectionLine - 1; i >= 0; i--) {
      const line = document.lineAt(i).text.trim();
      if (line.startsWith('##')) {
        // Found previous section, get its environment recursively
        return this.getEnvironmentForLine(document, i);
      }
    }
    
    return null;
  }

  /**
   * Finds the global environment decorator at the top of the file
   */
  private findGlobalEnvironment(document: vscode.TextDocument): string | null {
    // Search from top until the first ##
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i).text.trim();
      
      // Stop when we find the first section header
      if (line.startsWith('##')) {
        return null;
      }
      
      // Skip empty lines and regular comments
      if (!line || (line.startsWith('#') && !line.match(/^#\s*@env/i))) {
        continue;
      }
      
      // Match global decorator
      const match = line.match(/^#\s*@env\s+(\w+)/i);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }
}

/**
 * Provides completion items for environment decorators
 */
export class HttpEnvironmentCompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    // Only provide completions for HTTP request files
    if (!isHttpRequestFile(document.uri.fsPath)) {
      return [];
    }

    const lineText = document.lineAt(position.line).text;
    const textBeforeCursor = lineText.substring(0, position.character);

    // Check if we're typing # @env
    if (!textBeforeCursor.match(/^#\s*@env\s*$/)) {
      return [];
    }

    // Get available environments
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const envManager = EnvironmentManager.getInstance();
    const availableEnvs = envManager.getAvailableEnvironments(workspacePath);

    // Create completion items
    const completionItems: vscode.CompletionItem[] = availableEnvs.map(envName => {
      const item = new vscode.CompletionItem(envName, vscode.CompletionItemKind.Value);
      item.detail = `Environment: ${envName}`;
      item.documentation = new vscode.MarkdownString(`Use variables from \`.env.${envName}\``);
      item.insertText = envName;
      return item;
    });

    return completionItems;
  }
}

/**
 * Provides decorations for environment decorators to style them as comments
 */
export class HttpEnvironmentDecorationProvider {
  private decorationType: vscode.TextEditorDecorationType;
  private timeout: NodeJS.Timeout | undefined;

  constructor() {
    // Create decoration type with comment-like style
    this.decorationType = vscode.window.createTextEditorDecorationType({
      color: new vscode.ThemeColor('editorLineNumber.foreground'), // Use line number color (subtle)
      opacity: '0.6',
      fontStyle: 'italic'
    });
  }

  /**
   * Update decorations for all visible editors
   */
  public updateDecorations() {
    vscode.window.visibleTextEditors.forEach(editor => {
      this.updateDecorationsForEditor(editor);
    });
  }

  /**
   * Update decorations for a specific editor
   */
  private updateDecorationsForEditor(editor: vscode.TextEditor) {
    if (!isHttpRequestFile(editor.document.uri.fsPath)) {
      return;
    }

    const decorations: vscode.DecorationOptions[] = [];
    const text = editor.document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match # @env decorator
      const match = line.match(/^(#\s*@env\s+\w+)/);
      if (match) {
        const startPos = new vscode.Position(i, 0);
        const endPos = new vscode.Position(i, match[1].length);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        decorations.push(decoration);
      }
    }

    editor.setDecorations(this.decorationType, decorations);
  }

  /**
   * Trigger update with debounce
   */
  public triggerUpdateDecorations() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.updateDecorations();
    }, 100);
  }

  /**
   * Dispose the decoration type
   */
  public dispose() {
    this.decorationType.dispose();
  }
}

