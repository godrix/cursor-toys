import * as vscode from 'vscode';
import { sendToChat } from './sendToChat';

export interface AnnotationParams {
  id?: string;
  file?: string;
  line?: string;
  code?: string;
  message?: string;
  type?: 'error' | 'warning' | 'info';
  [key: string]: string | undefined;
}

export class AnnotationPanel {
  private static currentPanel: AnnotationPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, params: AnnotationParams) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this.getWebviewContent(params);
    this.setupMessageListener(params);
  }

  public static createOrShow(params: AnnotationParams) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (AnnotationPanel.currentPanel) {
      AnnotationPanel.currentPanel._panel.reveal(column);
      AnnotationPanel.currentPanel.update(params);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'cursorSidekickAnnotation',
      'Cursor Toys - Annotation',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    AnnotationPanel.currentPanel = new AnnotationPanel(panel, params);
  }

  private update(params: AnnotationParams) {
    this._panel.webview.html = this.getWebviewContent(params);
    this.setupMessageListener(params);
  }

  private setupMessageListener(params: AnnotationParams) {
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'fixInChat':
            await this.sendToChat(params);
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private async sendToChat(params: AnnotationParams) {
    // Construir prompt estruturado
    const prompt = this.buildFixPrompt(params);
    const code = params.code || '';
    
    await sendToChat(code, prompt);
  }

  private buildFixPrompt(params: AnnotationParams): string {
    const parts: string[] = [];
    
    if (params.message) {
      parts.push(`**Erro:** ${params.message}`);
    }
    if (params.file) {
      parts.push(`**Arquivo:** ${params.file}`);
    }
    if (params.line) {
      parts.push(`**Linha:** ${params.line}`);
    }
    if (params.type) {
      parts.push(`**Tipo:** ${params.type}`);
    }
    
    parts.push('\nPor favor, corrija este problema:');
    
    return parts.join('\n');
  }

  private getWebviewContent(params: AnnotationParams): string {
    const code = params.code || 'Nenhum código fornecido';
    const message = params.message || 'Sem mensagem';
    const file = params.file || 'Arquivo desconhecido';
    const line = params.line || '?';
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cursor Toys - Annotation</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .header {
            margin-bottom: 20px;
        }
        .code-block {
            background: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            overflow-x: auto;
        }
        .info {
            margin: 10px 0;
            padding: 10px;
            background: var(--vscode-input-background);
            border-radius: 4px;
        }
        .fix-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 20px;
        }
        .fix-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Cursor Toys - Annotation</h2>
    </div>
    
    <div class="info">
        <strong>Arquivo:</strong> ${this.escapeHtml(file)}<br>
        <strong>Linha:</strong> ${line}<br>
        <strong>Mensagem:</strong> ${this.escapeHtml(message)}
    </div>
    
    <div class="code-block">
        <pre><code>${this.escapeHtml(code)}</code></pre>
    </div>
    
    <button class="fix-button" onclick="fixInChat()">Fix in Chat</button>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function fixInChat() {
            vscode.postMessage({
                command: 'fixInChat'
            });
        }
    </script>
</body>
</html>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public dispose() {
    AnnotationPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

