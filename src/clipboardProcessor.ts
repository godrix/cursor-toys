import * as vscode from 'vscode';
import { minifyContent, detectContentType, MinifiableFileType, MinificationResult, formatMinificationStats } from './minifier';

/**
 * Lê o conteúdo da clipboard
 * @returns Conteúdo da clipboard ou null se vazia
 */
export async function readClipboard(): Promise<string | null> {
  try {
    const clipboardContent = await vscode.env.clipboard.readText();
    
    if (!clipboardContent || clipboardContent.trim().length === 0) {
      return null;
    }
    
    return clipboardContent;
  } catch (error) {
    throw new Error(`Erro ao ler clipboard: ${error}`);
  }
}

/**
 * Escreve conteúdo na clipboard
 * @param content Conteúdo a ser escrito
 */
export async function writeClipboard(content: string): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(content);
  } catch (error) {
    throw new Error(`Erro ao escrever na clipboard: ${error}`);
  }
}

/**
 * Normaliza espaços em branco múltiplos
 * @param text Texto a ser normalizado
 * @returns Texto com espaços normalizados
 */
export function normalizeWhitespace(text: string): string {
  // Remover espaços múltiplos (mas preservar quebras de linha)
  let normalized = text.replace(/[^\S\n]+/g, ' ');
  
  // Remover linhas vazias múltiplas (manter no máximo uma linha vazia)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  // Remover espaços no início e fim de cada linha
  normalized = normalized.replace(/^[ \t]+/gm, '');
  normalized = normalized.replace(/[ \t]+$/gm, '');
  
  return normalized.trim();
}

/**
 * Faz trim básico de texto removendo espaços excessivos
 * @param text Texto a ser processado
 * @returns Texto com trim aplicado
 */
export function trimText(text: string): string {
  return normalizeWhitespace(text);
}

/**
 * Detecta automaticamente o tipo de conteúdo e aplica minificação apropriada
 * @param content Conteúdo a ser processado
 * @param forceType Tipo forçado (opcional)
 * @returns Resultado da minificação
 */
export function detectAndMinifyClipboard(
  content: string, 
  forceType?: MinifiableFileType
): MinificationResult {
  // Detectar tipo automaticamente se não for forçado
  const detectedType = forceType || detectContentType(content);
  
  // Minificar usando o tipo detectado
  return minifyContent(content, detectedType);
}

/**
 * Processa o conteúdo da clipboard: lê, minifica e substitui
 * @param showPrompt Se true, pergunta ao usuário o tipo de arquivo
 * @returns Resultado da operação
 */
export async function trimClipboard(showPrompt: boolean = false): Promise<MinificationResult | null> {
  try {
    // Ler clipboard
    const clipboardContent = await readClipboard();
    
    if (!clipboardContent) {
      vscode.window.showWarningMessage('Clipboard está vazia');
      return null;
    }
    
    let detectedType: MinifiableFileType;
    
    // Se showPrompt é true, perguntar ao usuário
    if (showPrompt) {
      const typeOptions: vscode.QuickPickItem[] = [
        { label: 'json', description: 'JSON - JavaScript Object Notation' },
        { label: 'html', description: 'HTML - HyperText Markup Language' },
        { label: 'xml', description: 'XML - eXtensible Markup Language' },
        { label: 'css', description: 'CSS - Cascading Style Sheets' },
        { label: 'svg', description: 'SVG - Scalable Vector Graphics' },
        { label: 'javascript', description: 'JavaScript' },
        { label: 'typescript', description: 'TypeScript' },
        { label: 'text', description: 'Texto genérico (apenas trim)' }
      ];
      
      // Detectar automaticamente para sugerir
      const autoDetected = detectContentType(clipboardContent);
      
      const selectedType = await vscode.window.showQuickPick(typeOptions, {
        placeHolder: `Detectado: ${autoDetected}. Selecione o tipo de conteúdo para minificar`,
        title: 'Tipo de Conteúdo'
      });
      
      if (!selectedType) {
        // Usuário cancelou
        return null;
      }
      
      detectedType = selectedType.label as MinifiableFileType;
    } else {
      // Detectar automaticamente
      detectedType = detectContentType(clipboardContent);
    }
    
    // Minificar
    const result = detectAndMinifyClipboard(clipboardContent, detectedType);
    
    if (!result.success) {
      vscode.window.showErrorMessage(`Erro ao minificar: ${result.error}`);
      return result;
    }
    
    // Verificar se houve economia significativa
    if (result.savings <= 0) {
      const shouldContinue = await vscode.window.showWarningMessage(
        'Nenhuma economia detectada. Conteúdo já está minificado ou não pode ser otimizado. Continuar?',
        'Sim', 'Não'
      );
      
      if (shouldContinue !== 'Sim') {
        return result;
      }
    }
    
    // Escrever de volta na clipboard
    await writeClipboard(result.minifiedContent);
    
    // Mostrar estatísticas
    const stats = formatMinificationStats(result);
    vscode.window.showInformationMessage(`Clipboard minificada! ${stats}`);
    
    return result;
  } catch (error) {
    vscode.window.showErrorMessage(
      `Erro ao processar clipboard: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Processa clipboard com detecção automática (sem prompt)
 */
export async function trimClipboardAuto(): Promise<MinificationResult | null> {
  return trimClipboard(false);
}

/**
 * Processa clipboard com prompt para selecionar tipo
 */
export async function trimClipboardWithPrompt(): Promise<MinificationResult | null> {
  return trimClipboard(true);
}

/**
 * Obtém estatísticas do conteúdo da clipboard sem modificar
 * @returns Informações sobre o conteúdo
 */
export async function getClipboardStats(): Promise<{
  size: number;
  lines: number;
  detectedType: MinifiableFileType;
  content: string;
} | null> {
  try {
    const content = await readClipboard();
    
    if (!content) {
      return null;
    }
    
    const size = Buffer.byteLength(content, 'utf8');
    const lines = content.split('\n').length;
    const detectedType = detectContentType(content);
    
    return {
      size,
      lines,
      detectedType,
      content
    };
  } catch (error) {
    return null;
  }
}

/**
 * Copia texto para clipboard e mostra confirmação
 * @param text Texto a ser copiado
 * @param message Mensagem de confirmação (opcional)
 */
export async function copyToClipboard(text: string, message?: string): Promise<void> {
  try {
    await writeClipboard(text);
    
    if (message) {
      vscode.window.showInformationMessage(message);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Erro ao copiar para clipboard: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

