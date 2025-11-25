import * as vscode from 'vscode';
import { generateDeeplink } from './deeplinkGenerator';
import { importDeeplink } from './deeplinkImporter';
import { getFileTypeFromPath, isAllowedExtension } from './utils';
import { DeeplinkCodeLensProvider } from './codelensProvider';

/**
 * Helper function to generate deeplink with validations
 */
async function generateDeeplinkWithValidation(
  uri: vscode.Uri | undefined,
  forcedType?: 'command' | 'rule' | 'prompt'
): Promise<void> {
  // If no URI, try to get from active editor
  let filePath: string;
  
  if (uri) {
    filePath = uri.fsPath;
  } else {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No file selected');
      return;
    }
    filePath = editor.document.uri.fsPath;
  }

  // Validate extension
  const config = vscode.workspace.getConfiguration('cursorDeeplink');
  const allowedExtensions = config.get<string[]>('allowedExtensions', ['md']);
  
  if (!isAllowedExtension(filePath, allowedExtensions)) {
    vscode.window.showErrorMessage(
      `File extension is not in the allowed extensions list: ${allowedExtensions.join(', ')}`
    );
    return;
  }

  // Generate deeplink
  const deeplink = await generateDeeplink(filePath, forcedType);
  if (deeplink) {
    // Copy to clipboard
    await vscode.env.clipboard.writeText(deeplink);
    vscode.window.showInformationMessage('Deeplink copied to clipboard!');
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Register CodeLens Provider for all files
  const codeLensProvider = new DeeplinkCodeLensProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    '*',
    codeLensProvider
  );

  // Generic command to generate deeplink (opens selector)
  const generateCommand = vscode.commands.registerCommand(
    'cursor-deeplink.generate',
    async (uri?: vscode.Uri) => {
      const fileType = await vscode.window.showQuickPick(
        [
          { label: 'Command', value: 'command' as const },
          { label: 'Rule', value: 'rule' as const },
          { label: 'Prompt', value: 'prompt' as const }
        ],
        {
          placeHolder: 'Select the deeplink type'
        }
      );

      if (fileType) {
        await generateDeeplinkWithValidation(uri, fileType.value);
      }
    }
  );

  // Specific command to generate command deeplink
  const generateCommandSpecific = vscode.commands.registerCommand(
    'cursor-deeplink.generate-command',
    async (uri?: vscode.Uri) => {
      await generateDeeplinkWithValidation(uri, 'command');
    }
  );

  // Specific command to generate rule deeplink
  const generateRuleSpecific = vscode.commands.registerCommand(
    'cursor-deeplink.generate-rule',
    async (uri?: vscode.Uri) => {
      await generateDeeplinkWithValidation(uri, 'rule');
    }
  );

  // Specific command to generate prompt deeplink
  const generatePromptSpecific = vscode.commands.registerCommand(
    'cursor-deeplink.generate-prompt',
    async (uri?: vscode.Uri) => {
      await generateDeeplinkWithValidation(uri, 'prompt');
    }
  );

  // Command to import deeplink
  const importCommand = vscode.commands.registerCommand(
    'cursor-deeplink.import',
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Paste the Cursor deeplink',
        placeHolder: 'cursor://anysphere.cursor-deeplink/... or https://cursor.com/link/...',
        validateInput: (value) => {
          if (!value) {
            return 'Please enter a deeplink';
          }
          if (!value.includes('cursor-deeplink') && !value.includes('cursor.com/link')) {
            return 'Invalid URL. Must be a Cursor deeplink';
          }
          return null;
        }
      });

      if (url) {
        await importDeeplink(url);
      }
    }
  );

  context.subscriptions.push(
    codeLensDisposable,
    generateCommand,
    generateCommandSpecific,
    generateRuleSpecific,
    generatePromptSpecific,
    importCommand
  );
}

export function deactivate() {}

