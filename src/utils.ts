import * as path from 'path';

/**
 * Sanitizes the file name to use only letters, numbers, dots, hyphens, and underscores
 */
export function sanitizeFileName(name: string): string {
  // Remove file extension
  const nameWithoutExt = path.parse(name).name;
  // Remove invalid characters, keeping only letters, numbers, dots, hyphens, and underscores
  return nameWithoutExt.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Validates if the URL has less than 8000 characters
 */
export function validateUrlLength(url: string): boolean {
  return url.length < 8000;
}

/**
 * Detects the file type based on the path
 */
export function getFileTypeFromPath(filePath: string): 'command' | 'rule' | 'prompt' | null {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (normalizedPath.includes('/.cursor/commands/')) {
    return 'command';
  }
  if (normalizedPath.includes('/.cursor/rules/')) {
    return 'rule';
  }
  if (normalizedPath.includes('/.cursor/prompts/')) {
    return 'prompt';
  }
  
  return null;
}

/**
 * Decodes a URL parameter
 */
export function decodeUrlParam(param: string): string {
  try {
    // First replace + with spaces, then decode
    const withSpaces = param.replace(/\+/g, ' ');
    return decodeURIComponent(withSpaces);
  } catch (error) {
    // If it fails, try to decode in smaller parts or return as is
    try {
      // Try to decode character by character for very long URLs
      return param.replace(/\+/g, ' ').replace(/%([0-9A-F]{2})/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch {
      // If it still fails, return the parameter with + replaced by spaces
      return param.replace(/\+/g, ' ');
    }
  }
}

/**
 * Checks if the file extension is in the allowed extensions list
 */
export function isAllowedExtension(filePath: string, allowedExtensions: string[]): boolean {
  const ext = getFileExtension(filePath);
  return allowedExtensions.includes(ext.toLowerCase());
}

/**
 * Extracts the file extension (without the dot)
 */
export function getFileExtension(filePath: string): string {
  const ext = path.extname(filePath);
  return ext.startsWith('.') ? ext.substring(1) : ext;
}

/**
 * Gets the file name without the extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  return path.parse(filePath).name;
}

