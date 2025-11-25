import * as vscode from 'vscode';
import * as path from 'path';
import { getFileTypeFromPath, sanitizeFileName, validateUrlLength } from './utils';

const MAX_URL_LENGTH = 8000;

/**
 * Generates a deeplink for the specified file
 * @param filePath File path
 * @param forcedType Forced type (optional). If provided, uses this type instead of detecting by folder
 */
export async function generateDeeplink(
  filePath: string,
  forcedType?: 'command' | 'rule' | 'prompt'
): Promise<string | null> {
  try {
    // Read configuration
    const config = vscode.workspace.getConfiguration('cursorDeeplink');
    const linkType = config.get<string>('linkType', 'deeplink');
    const allowedExtensions = config.get<string[]>('allowedExtensions', ['md']);

    // Check if file exists
    const uri = vscode.Uri.file(filePath);
    try {
      await vscode.workspace.fs.stat(uri);
    } catch {
      vscode.window.showErrorMessage(`File not found: ${filePath}`);
      return null;
    }

    // Detect or use forced type
    let fileType: 'command' | 'rule' | 'prompt' | null;
    if (forcedType) {
      fileType = forcedType;
    } else {
      fileType = getFileTypeFromPath(filePath);
      if (!fileType) {
        vscode.window.showErrorMessage('File must be in .cursor/commands/, .cursor/rules/ or .cursor/prompts/');
        return null;
      }
    }

    // Read file content
    const document = await vscode.workspace.openTextDocument(uri);
    const content = document.getText();

    // Generate deeplink
    const deeplink = buildDeeplink(fileType, filePath, content, linkType);

    // Validate size
    if (!validateUrlLength(deeplink)) {
      vscode.window.showErrorMessage(
        `Deeplink too long (${deeplink.length} characters). The limit is ${MAX_URL_LENGTH} characters.`
      );
      return null;
    }

    return deeplink;
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating deeplink: ${error}`);
    return null;
  }
}

/**
 * Builds the deeplink based on file type
 */
function buildDeeplink(
  fileType: 'command' | 'rule' | 'prompt',
  filePath: string,
  content: string,
  linkType: string
): string {
  const baseUrl = linkType === 'web' 
    ? 'https://cursor.com/link/' 
    : 'cursor://anysphere.cursor-deeplink/';

  const encodedContent = encodeURIComponent(content);

  if (fileType === 'prompt') {
    return `${baseUrl}prompt?text=${encodedContent}`;
  }

  // For command and rule, we need the name
  const fileName = path.parse(filePath).name;
  const sanitizedName = sanitizeFileName(fileName);

  if (fileType === 'command') {
    return `${baseUrl}command?name=${encodeURIComponent(sanitizedName)}&text=${encodedContent}`;
  }

  // rule
  return `${baseUrl}rule?name=${encodeURIComponent(sanitizedName)}&text=${encodedContent}`;
}

