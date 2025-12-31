import * as vscode from 'vscode';
import * as path from 'path';
import * as zlib from 'zlib';
import { sanitizeFileName, getCommandsPath, getPromptsPath, getRulesPath } from './utils';

interface ShareableParams {
  type: 'command' | 'prompt' | 'rule';
  name: string;
  content: string; // Already decompressed
}

/**
 * Imports a shareable and creates the corresponding file
 * @param shareableUrl Shareable URL in format: cursortoys://TYPE:name:compressedData
 */
export async function importShareable(shareableUrl: string): Promise<void> {
  try {
    // Parse URL
    const params = parseShareableUrl(shareableUrl);
    if (!params) {
      // Error message already shown in parseShareableUrl
      return;
    }

    // For commands and prompts, ask if user wants to save as Project or Personal
    let isPersonal = false;
    if (params.type === 'command' || params.type === 'prompt') {
      const itemType = params.type === 'command' ? 'command' : 'prompt';
      const itemLocation = await vscode.window.showQuickPick(
        [
          { 
            label: `Personal ${itemType}s`, 
            description: `Available in all projects (~/.cursor/${itemType}s)`, 
            value: true 
          },
          { 
            label: `Project ${itemType}s`, 
            description: 'Specific to this workspace', 
            value: false 
          }
        ],
        {
          placeHolder: `Where do you want to save this ${itemType}?`
        }
      );

      if (itemLocation === undefined) {
        // User cancelled
        return;
      }

      isPersonal = itemLocation.value;
    }

    // Get workspace folder (only needed for project files)
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder && !isPersonal) {
      vscode.window.showErrorMessage('No workspace open');
      return;
    }

    // Determine destination folder and file name
    const workspacePath = workspaceFolder?.uri.fsPath || '';
    const { folderPath, fileName } = getDestinationPath(params, workspacePath, isPersonal);

    // Check if file already exists
    const fileUri = vscode.Uri.file(path.join(folderPath, fileName));
    let fileExists = false;
    try {
      await vscode.workspace.fs.stat(fileUri);
      fileExists = true;
    } catch {
      // File doesn't exist, that's fine
    }

    if (fileExists) {
      const overwrite = await vscode.window.showWarningMessage(
        `File ${fileName} already exists. Do you want to overwrite it?`,
        'Yes',
        'No'
      );
      if (overwrite !== 'Yes') {
        return;
      }
    }

    // Create folder if it doesn't exist
    const folderUri = vscode.Uri.file(folderPath);
    try {
      await vscode.workspace.fs.stat(folderUri);
    } catch {
      // Folder doesn't exist, create it
      await vscode.workspace.fs.createDirectory(folderUri);
    }

    // Create file
    const content = Buffer.from(params.content, 'utf8');
    await vscode.workspace.fs.writeFile(fileUri, content);

    vscode.window.showInformationMessage(`File created: ${fileName}`);
    
    // Open file
    const document = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(document);
  } catch (error) {
    vscode.window.showErrorMessage(`Error importing shareable: ${error}`);
  }
}

/**
 * Parses the shareable URL and extracts parameters
 * @param url Shareable URL
 * @returns Parsed parameters or null if invalid
 */
export function parseShareableUrl(url: string): ShareableParams | null {
  try {
    const trimmedUrl = url.trim();

    // Validate protocol
    if (!trimmedUrl.startsWith('cursortoys://')) {
      vscode.window.showErrorMessage('Invalid shareable format. Must start with cursortoys://');
      return null;
    }

    // Remove protocol
    const withoutProtocol = trimmedUrl.substring('cursortoys://'.length);

    // Split by colon to get TYPE:name:data
    const parts = withoutProtocol.split(':');
    
    if (parts.length < 3) {
      vscode.window.showErrorMessage('Invalid shareable format. Expected format: cursortoys://TYPE:name:data');
      return null;
    }

    // Extract type
    const typeStr = parts[0].toUpperCase();
    let type: 'command' | 'prompt' | 'rule';
    
    if (typeStr === 'COMMAND') {
      type = 'command';
    } else if (typeStr === 'PROMPT') {
      type = 'prompt';
    } else if (typeStr === 'RULE') {
      type = 'rule';
    } else {
      vscode.window.showErrorMessage(`Invalid type: ${typeStr}. Must be COMMAND, PROMPT, or RULE.`);
      return null;
    }

    // Extract name
    const name = parts[1];
    if (!name || name.trim().length === 0) {
      vscode.window.showErrorMessage('Invalid shareable: name is empty');
      return null;
    }

    // Extract compressed data (everything after the second colon)
    const compressedData = parts.slice(2).join(':');
    if (!compressedData || compressedData.trim().length === 0) {
      vscode.window.showErrorMessage('Invalid shareable: data is empty');
      return null;
    }

    // Decode and decompress
    let content: string;
    try {
      content = decodeAndDecompress(compressedData);
    } catch (error) {
      vscode.window.showErrorMessage(`Error decompressing data: ${error}`);
      return null;
    }

    return {
      type,
      name: sanitizeFileName(name),
      content
    };
  } catch (error) {
    vscode.window.showErrorMessage(`Error parsing shareable: ${error}`);
    return null;
  }
}

/**
 * Decodes base64 and decompresses gzip content
 * @param compressedData Base64 encoded compressed content
 * @returns Decompressed content
 */
export function decodeAndDecompress(compressedData: string): string {
  try {
    // Decode from base64
    const buffer = Buffer.from(compressedData, 'base64');
    
    // Decompress using gunzip
    const decompressed = zlib.gunzipSync(buffer);
    
    // Convert to string
    const content = decompressed.toString('utf8');
    
    return content;
  } catch (error) {
    throw new Error(`Failed to decompress content: ${error}`);
  }
}

/**
 * Determines the destination path and file name based on parameters
 */
function getDestinationPath(
  params: ShareableParams,
  workspacePath: string,
  isPersonal: boolean = false
): { folderPath: string; fileName: string } {
  // Get allowed extensions configuration
  const config = vscode.workspace.getConfiguration('cursorToys');
  const allowedExtensions = config.get<string[]>('allowedExtensions', ['md', 'mdc']);
  const defaultExtension = allowedExtensions[0] || 'md';

  let folderPath: string;
  let fileName: string;

  switch (params.type) {
    case 'command':
      folderPath = getCommandsPath(workspacePath, isPersonal);
      fileName = `${params.name}.${defaultExtension}`;
      break;
    case 'rule':
      folderPath = getRulesPath(workspacePath, isPersonal);
      // For rules, prefer .mdc if it's in the allowed extensions
      const ruleExtension = allowedExtensions.includes('mdc') ? 'mdc' : defaultExtension;
      fileName = `${params.name}.${ruleExtension}`;
      break;
    case 'prompt':
      folderPath = getPromptsPath(workspacePath, isPersonal);
      fileName = `${params.name}.${defaultExtension}`;
      break;
  }

  return { folderPath, fileName };
}

