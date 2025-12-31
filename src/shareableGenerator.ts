import * as vscode from 'vscode';
import * as path from 'path';
import * as zlib from 'zlib';
import { getFileTypeFromPath, sanitizeFileName, isAllowedExtension } from './utils';

const MAX_CONTENT_SIZE = 50 * 1024 * 1024; // 50MB limit for safety

/**
 * Generates a shareable link for the specified file
 * @param filePath File path
 * @param forcedType Forced type (optional). If provided, uses this type instead of detecting by folder
 * @returns Shareable URL in format: cursortoys://TYPE:name:compressedData
 */
export async function generateShareable(
  filePath: string,
  forcedType?: 'command' | 'rule' | 'prompt'
): Promise<string | null> {
  try {
    // Read configuration
    const config = vscode.workspace.getConfiguration('cursorToys');
    const allowedExtensions = config.get<string[]>('allowedExtensions', ['md']);

    // Validate file extension
    if (!isAllowedExtension(filePath, allowedExtensions)) {
      vscode.window.showErrorMessage(
        `File extension is not in the allowed extensions list: ${allowedExtensions.join(', ')}`
      );
      return null;
    }

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
        vscode.window.showErrorMessage('File must be in commands/, rules/ or prompts/ folder');
        return null;
      }
    }

    // Read file content
    const document = await vscode.workspace.openTextDocument(uri);
    const content = document.getText();

    // Validate content size
    if (content.length > MAX_CONTENT_SIZE) {
      vscode.window.showErrorMessage(
        `File too large (${(content.length / 1024 / 1024).toFixed(2)} MB). Maximum size is 50 MB.`
      );
      return null;
    }

    // Get file name without extension
    const fileName = path.parse(filePath).name;
    const sanitizedName = sanitizeFileName(fileName);

    // Compress and encode content
    const compressedData = compressAndEncode(content);

    // Build shareable URL
    const shareable = buildShareableUrl(fileType, sanitizedName, compressedData);

    return shareable;
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating shareable: ${error}`);
    return null;
  }
}

/**
 * Compresses content using gzip and encodes it to base64
 * @param content Content to compress
 * @returns Base64 encoded compressed content
 */
export function compressAndEncode(content: string): string {
  try {
    // Convert string to Buffer
    const buffer = Buffer.from(content, 'utf8');
    
    // Compress using gzip
    const compressed = zlib.gzipSync(buffer, {
      level: zlib.constants.Z_BEST_COMPRESSION
    });
    
    // Encode to base64
    const encoded = compressed.toString('base64');
    
    return encoded;
  } catch (error) {
    throw new Error(`Failed to compress content: ${error}`);
  }
}

/**
 * Builds the shareable URL
 * @param type File type (command, rule, or prompt)
 * @param fileName Sanitized file name
 * @param compressedData Compressed and encoded content
 * @returns Shareable URL
 */
export function buildShareableUrl(
  type: 'command' | 'rule' | 'prompt',
  fileName: string,
  compressedData: string
): string {
  // Convert type to uppercase for protocol
  const typeUpperCase = type.toUpperCase();
  
  // Build URL: cursortoys://TYPE:name:data
  return `cursortoys://${typeUpperCase}:${fileName}:${compressedData}`;
}

