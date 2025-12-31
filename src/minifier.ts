import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Tipos de arquivo suportados para minificação
 */
export type MinifiableFileType = 'json' | 'html' | 'xml' | 'css' | 'svg' | 'javascript' | 'typescript' | 'text' | 'unknown';

/**
 * Resultado da minificação
 */
export interface MinificationResult {
  success: boolean;
  originalSize: number;
  minifiedSize: number;
  minifiedContent: string;
  error?: string;
  savings: number;
  savingsPercent: number;
}

/**
 * Detecta o tipo de arquivo baseado na extensão
 * @param filePath Caminho do arquivo ou extensão
 * @returns Tipo de arquivo detectado
 */
export function detectFileType(filePath: string): MinifiableFileType {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  
  switch (ext) {
    case 'json':
      return 'json';
    case 'html':
    case 'htm':
      return 'html';
    case 'xml':
      return 'xml';
    case 'css':
      return 'css';
    case 'svg':
      return 'svg';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'txt':
    case 'md':
      return 'text';
    default:
      return 'unknown';
  }
}

/**
 * Detecta tipo de conteúdo baseado no próprio conteúdo (para clipboard)
 * @param content Conteúdo a ser analisado
 * @returns Tipo detectado
 */
export function detectContentType(content: string): MinifiableFileType {
  const trimmed = content.trim();
  
  // Tentar detectar JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Não é JSON válido
    }
  }
  
  // Detectar HTML
  if (trimmed.startsWith('<!DOCTYPE html') || 
      trimmed.startsWith('<html') ||
      /<html[\s>]/i.test(trimmed)) {
    return 'html';
  }
  
  // Detectar XML/SVG
  if (trimmed.startsWith('<?xml')) {
    if (trimmed.includes('<svg')) {
      return 'svg';
    }
    return 'xml';
  }
  
  // Detectar SVG sem declaração XML
  if (trimmed.startsWith('<svg')) {
    return 'svg';
  }
  
  // Detectar CSS
  if (/^[\s\S]*\{[\s\S]*:[^\{]*;[\s\S]*\}/.test(trimmed)) {
    return 'css';
  }
  
  // Se tem tags XML/HTML gerais
  if (/<\w+[\s>]/.test(trimmed) && /<\/\w+>/.test(trimmed)) {
    return 'xml';
  }
  
  return 'text';
}

/**
 * Minifica JSON removendo espaços desnecessários
 * @param content Conteúdo JSON
 * @returns JSON minificado
 */
export function minifyJson(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(`JSON inválido: ${error}`);
  }
}

/**
 * Minifica HTML removendo espaços e comentários
 * @param content Conteúdo HTML
 * @returns HTML minificado
 */
export function minifyHtml(content: string): string {
  let minified = content;
  
  // Remover comentários HTML (<!-- ... -->)
  minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remover espaços múltiplos entre tags
  minified = minified.replace(/>\s+</g, '><');
  
  // Remover espaços no início e fim de linhas
  minified = minified.replace(/^\s+/gm, '');
  minified = minified.replace(/\s+$/gm, '');
  
  // Remover quebras de linha desnecessárias
  minified = minified.replace(/\n+/g, '');
  
  // Remover espaços múltiplos dentro de tags
  minified = minified.replace(/\s{2,}/g, ' ');
  
  return minified.trim();
}

/**
 * Minifica XML removendo espaços e comentários
 * @param content Conteúdo XML
 * @returns XML minificado
 */
export function minifyXml(content: string): string {
  let minified = content;
  
  // Remover comentários XML (<!-- ... -->)
  minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remover espaços múltiplos entre tags
  minified = minified.replace(/>\s+</g, '><');
  
  // Remover espaços no início e fim
  minified = minified.replace(/^\s+/gm, '');
  minified = minified.replace(/\s+$/gm, '');
  
  // Remover quebras de linha
  minified = minified.replace(/\n+/g, '');
  
  // Remover espaços múltiplos
  minified = minified.replace(/\s{2,}/g, ' ');
  
  return minified.trim();
}

/**
 * Minifica CSS removendo espaços e comentários
 * @param content Conteúdo CSS
 * @returns CSS minificado
 */
export function minifyCss(content: string): string {
  let minified = content;
  
  // Remover comentários CSS (/* ... */)
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remover espaços ao redor de { } : ; ,
  minified = minified.replace(/\s*{\s*/g, '{');
  minified = minified.replace(/\s*}\s*/g, '}');
  minified = minified.replace(/\s*:\s*/g, ':');
  minified = minified.replace(/\s*;\s*/g, ';');
  minified = minified.replace(/\s*,\s*/g, ',');
  
  // Remover quebras de linha
  minified = minified.replace(/\n+/g, '');
  
  // Remover espaços múltiplos
  minified = minified.replace(/\s{2,}/g, ' ');
  
  // Remover ponto e vírgula antes de }
  minified = minified.replace(/;}/g, '}');
  
  return minified.trim();
}

/**
 * Minifica SVG removendo espaços e metadados desnecessários
 * @param content Conteúdo SVG
 * @returns SVG minificado
 */
export function minifySvg(content: string): string {
  let minified = content;
  
  // Remover comentários
  minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remover declarações XML desnecessárias (exceto a principal)
  const xmlDeclaration = minified.match(/<\?xml[^?]*\?>/);
  minified = minified.replace(/<\?xml[^?]*\?>/g, '');
  if (xmlDeclaration) {
    minified = xmlDeclaration[0] + minified;
  }
  
  // Remover metadados desnecessários
  minified = minified.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  
  // Remover espaços entre tags
  minified = minified.replace(/>\s+</g, '><');
  
  // Remover espaços no início e fim
  minified = minified.replace(/^\s+/gm, '');
  minified = minified.replace(/\s+$/gm, '');
  
  // Remover quebras de linha
  minified = minified.replace(/\n+/g, '');
  
  // Remover espaços múltiplos em atributos
  minified = minified.replace(/\s{2,}/g, ' ');
  
  return minified.trim();
}

/**
 * Minifica JavaScript removendo espaços e comentários (básico)
 * @param content Conteúdo JavaScript
 * @returns JavaScript minificado
 */
export function minifyJavaScript(content: string): string {
  let minified = content;
  
  // Remover comentários de linha (// ...)
  minified = minified.replace(/\/\/.*$/gm, '');
  
  // Remover comentários de bloco (/* ... */)
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remover espaços no início e fim de linhas
  minified = minified.replace(/^\s+/gm, '');
  minified = minified.replace(/\s+$/gm, '');
  
  // Remover linhas vazias
  minified = minified.replace(/\n{2,}/g, '\n');
  
  // Remover espaços ao redor de operadores e pontuação (cuidado com strings)
  // Nota: Esta é uma implementação básica. Para minificação real de JS, use UglifyJS ou similar
  minified = minified.replace(/\s*([{}();,=<>+\-*/])\s*/g, '$1');
  
  // Remover quebras de linha (exceto em strings)
  minified = minified.replace(/\n/g, '');
  
  return minified.trim();
}

/**
 * Minifica TypeScript (similar ao JavaScript)
 * @param content Conteúdo TypeScript
 * @returns TypeScript minificado
 */
export function minifyTypeScript(content: string): string {
  // Para TypeScript, usamos a mesma estratégia do JavaScript
  // Em produção, seria ideal usar um transpilador real
  return minifyJavaScript(content);
}

/**
 * Minifica texto genérico removendo espaços excessivos
 * @param content Conteúdo texto
 * @returns Texto minificado
 */
export function minifyText(content: string): string {
  let minified = content;
  
  // Remover espaços no início e fim de linhas
  minified = minified.replace(/^\s+/gm, '');
  minified = minified.replace(/\s+$/gm, '');
  
  // Remover linhas vazias múltiplas (manter apenas uma)
  minified = minified.replace(/\n{3,}/g, '\n\n');
  
  // Remover espaços múltiplos (mas preservar quebras de linha)
  minified = minified.replace(/[^\S\n]{2,}/g, ' ');
  
  return minified.trim();
}

/**
 * Minifica conteúdo baseado no tipo
 * @param content Conteúdo a ser minificado
 * @param type Tipo de conteúdo
 * @returns Resultado da minificação
 */
export function minifyContent(content: string, type: MinifiableFileType): MinificationResult {
  const originalSize = Buffer.byteLength(content, 'utf8');
  
  try {
    let minifiedContent: string;
    
    switch (type) {
      case 'json':
        minifiedContent = minifyJson(content);
        break;
      case 'html':
        minifiedContent = minifyHtml(content);
        break;
      case 'xml':
        minifiedContent = minifyXml(content);
        break;
      case 'css':
        minifiedContent = minifyCss(content);
        break;
      case 'svg':
        minifiedContent = minifySvg(content);
        break;
      case 'javascript':
        minifiedContent = minifyJavaScript(content);
        break;
      case 'typescript':
        minifiedContent = minifyTypeScript(content);
        break;
      case 'text':
        minifiedContent = minifyText(content);
        break;
      default:
        minifiedContent = minifyText(content);
        break;
    }
    
    const minifiedSize = Buffer.byteLength(minifiedContent, 'utf8');
    const savings = originalSize - minifiedSize;
    const savingsPercent = originalSize > 0 ? (savings / originalSize) * 100 : 0;
    
    return {
      success: true,
      originalSize,
      minifiedSize,
      minifiedContent,
      savings,
      savingsPercent
    };
  } catch (error) {
    return {
      success: false,
      originalSize,
      minifiedSize: 0,
      minifiedContent: content,
      error: error instanceof Error ? error.message : String(error),
      savings: 0,
      savingsPercent: 0
    };
  }
}

/**
 * Minifica arquivo e salva com sufixo
 * @param filePath Caminho do arquivo original
 * @param suffix Sufixo para o arquivo minificado (padrão: '.min')
 * @returns Resultado da minificação com caminho do arquivo salvo
 */
export async function minifyFile(
  filePath: string, 
  suffix: string = '.min'
): Promise<MinificationResult & { outputPath?: string }> {
  try {
    // Ler arquivo
    const fileUri = vscode.Uri.file(filePath);
    const contentBytes = await vscode.workspace.fs.readFile(fileUri);
    const content = Buffer.from(contentBytes).toString('utf8');
    
    // Detectar tipo
    const fileType = detectFileType(filePath);
    
    if (fileType === 'unknown') {
      return {
        success: false,
        originalSize: 0,
        minifiedSize: 0,
        minifiedContent: '',
        error: 'Tipo de arquivo não suportado para minificação',
        savings: 0,
        savingsPercent: 0
      };
    }
    
    // Minificar
    const result = minifyContent(content, fileType);
    
    if (!result.success) {
      return result;
    }
    
    // Gerar caminho do arquivo de saída
    const parsedPath = path.parse(filePath);
    const outputPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}${suffix}${parsedPath.ext}`
    );
    
    // Salvar arquivo minificado
    const outputUri = vscode.Uri.file(outputPath);
    const minifiedBytes = Buffer.from(result.minifiedContent, 'utf8');
    await vscode.workspace.fs.writeFile(outputUri, minifiedBytes);
    
    return {
      ...result,
      outputPath
    };
  } catch (error) {
    return {
      success: false,
      originalSize: 0,
      minifiedSize: 0,
      minifiedContent: '',
      error: error instanceof Error ? error.message : String(error),
      savings: 0,
      savingsPercent: 0
    };
  }
}

/**
 * Formata estatísticas de minificação para exibir ao usuário
 * @param result Resultado da minificação
 * @returns String formatada com as estatísticas
 */
export function formatMinificationStats(result: MinificationResult): string {
  const originalKB = (result.originalSize / 1024).toFixed(2);
  const minifiedKB = (result.minifiedSize / 1024).toFixed(2);
  const savingsKB = (result.savings / 1024).toFixed(2);
  const percent = result.savingsPercent.toFixed(1);
  
  return `Economia: ${savingsKB}KB (${percent}%) | Original: ${originalKB}KB → Minificado: ${minifiedKB}KB`;
}

