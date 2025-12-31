import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getEnvironmentsPath } from './utils';

/**
 * Environment Manager - Gerencia variáveis de environment através de arquivos .env
 * Singleton pattern para uso global na extensão
 */
export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private activeEnvironment: string = 'dev';
  private environmentsCache: Map<string, Map<string, string>> = new Map();
  private _onDidChangeEnvironment: vscode.EventEmitter<string> = new vscode.EventEmitter<string>();
  public readonly onDidChangeEnvironment: vscode.Event<string> = this._onDidChangeEnvironment.event;

  private constructor() {}

  /**
   * Obtém a instância única do EnvironmentManager
   */
  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * Obtém o environment ativo atual
   */
  public getActiveEnvironment(): string {
    return this.activeEnvironment;
  }

  /**
   * Define o environment ativo
   */
  public setActiveEnvironment(name: string): void {
    this.activeEnvironment = name;
    this._onDidChangeEnvironment.fire(name);
  }

  /**
   * Carrega variáveis de um environment específico
   * @param envName Nome do environment (ex: 'dev', 'prod')
   * @param workspacePath Caminho do workspace
   * @returns Map com as variáveis do environment ou null se não encontrado
   */
  public loadEnvironment(envName: string, workspacePath: string): Map<string, string> | null {
    // Verificar cache primeiro
    const cacheKey = `${workspacePath}:${envName}`;
    if (this.environmentsCache.has(cacheKey)) {
      return this.environmentsCache.get(cacheKey)!;
    }

    const envDir = getEnvironmentsPath(workspacePath);
    
    // Tentar carregar .env.{nome}
    let envFilePath = path.join(envDir, `.env.${envName}`);
    
    if (!fs.existsSync(envFilePath)) {
      // Fallback: tentar .env
      envFilePath = path.join(envDir, '.env');
      
      if (!fs.existsSync(envFilePath)) {
        return null;
      }
    }

    try {
      const content = fs.readFileSync(envFilePath, 'utf8');
      const variables = this.parseEnvFile(content);
      
      // Salvar no cache
      this.environmentsCache.set(cacheKey, variables);
      
      return variables;
    } catch (error) {
      console.error(`Failed to load environment file: ${envFilePath}`, error);
      return null;
    }
  }

  /**
   * Parseia o conteúdo de um arquivo .env
   * @param content Conteúdo do arquivo .env
   * @returns Map com as variáveis parseadas
   */
  private parseEnvFile(content: string): Map<string, string> {
    const variables = new Map<string, string>();
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Ignorar linhas vazias e comentários
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Parsear linha no formato KEY=VALUE
      const separatorIndex = trimmedLine.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmedLine.substring(0, separatorIndex).trim();
      let value = trimmedLine.substring(separatorIndex + 1).trim();

      // Remover aspas se presentes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }

      if (key) {
        // Armazenar com key em lowercase para matching case-insensitive
        variables.set(key.toLowerCase(), value);
      }
    }

    return variables;
  }

  /**
   * Substitui variáveis no formato {{varName}} no texto
   * @param text Texto com variáveis
   * @param envName Nome do environment
   * @param workspacePath Caminho do workspace
   * @returns Texto com variáveis substituídas
   */
  public replaceVariables(text: string, envName: string, workspacePath: string): string {
    const variables = this.loadEnvironment(envName, workspacePath);
    
    if (!variables) {
      return text;
    }

    let result = text;

    // Substituir todas as ocorrências de {{variableName}}
    // Usar regex para encontrar todas as variáveis
    const variableRegex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    
    result = result.replace(variableRegex, (match, varName) => {
      const varNameLower = varName.toLowerCase();
      const value = variables.get(varNameLower);
      
      if (value !== undefined) {
        return value;
      }
      
      // Se não encontrar a variável, manter o placeholder
      return match;
    });

    return result;
  }

  /**
   * Valida se há variáveis não resolvidas no texto
   * @param text Texto para validar
   * @param envName Nome do environment
   * @param workspacePath Caminho do workspace
   * @returns Array com nomes das variáveis não resolvidas
   */
  public validateVariables(text: string, envName: string, workspacePath: string): string[] {
    const variables = this.loadEnvironment(envName, workspacePath);
    
    if (!variables) {
      // Se não conseguiu carregar o environment, considerar todas as variáveis como não resolvidas
      const allVars: string[] = [];
      const variableRegex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
      let match;
      
      while ((match = variableRegex.exec(text)) !== null) {
        if (!allVars.includes(match[1])) {
          allVars.push(match[1]);
        }
      }
      
      return allVars;
    }

    const unresolved: string[] = [];
    const variableRegex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      const varName = match[1];
      const varNameLower = varName.toLowerCase();
      
      if (!variables.has(varNameLower) && !unresolved.includes(varName)) {
        unresolved.push(varName);
      }
    }

    return unresolved;
  }

  /**
   * Lista todos os environments disponíveis no workspace
   * @param workspacePath Caminho do workspace
   * @returns Array com nomes dos environments disponíveis
   */
  public getAvailableEnvironments(workspacePath: string): string[] {
    const envDir = getEnvironmentsPath(workspacePath);
    
    if (!fs.existsSync(envDir)) {
      return [];
    }

    try {
      const files = fs.readdirSync(envDir);
      const envNames: string[] = [];

      for (const file of files) {
        if (file.startsWith('.env')) {
          if (file === '.env') {
            envNames.push('default');
          } else if (file.startsWith('.env.')) {
            // Extrair nome do environment (.env.dev -> dev)
            const envName = file.substring(5); // Remove '.env.'
            envNames.push(envName);
          }
        }
      }

      return envNames.sort();
    } catch (error) {
      console.error(`Failed to read environments directory: ${envDir}`, error);
      return [];
    }
  }

  /**
   * Limpa o cache de environments
   */
  public clearCache(): void {
    this.environmentsCache.clear();
  }

  /**
   * Cria um novo arquivo de environment com template
   * @param envName Nome do environment
   * @param workspacePath Caminho do workspace
   * @returns true se criado com sucesso
   */
  public async createEnvironment(envName: string, workspacePath: string): Promise<boolean> {
    const envDir = getEnvironmentsPath(workspacePath);
    
    // Criar diretório se não existir
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir, { recursive: true });
    }

    const fileName = envName === 'default' ? '.env' : `.env.${envName}`;
    const filePath = path.join(envDir, fileName);

    // Verificar se já existe
    if (fs.existsSync(filePath)) {
      return false;
    }

    // Template padrão
    const template = `# Environment: ${envName}
# Add your environment variables below in the format KEY=VALUE

BASE_URL=http://localhost:3000
API_KEY=your-api-key-here
TIMEOUT=10000
`;

    try {
      fs.writeFileSync(filePath, template, 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to create environment file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Inicializa environments padrão no workspace se não existirem
   * @param workspacePath Caminho do workspace
   */
  public async initializeDefaultEnvironments(workspacePath: string): Promise<void> {
    const envDir = getEnvironmentsPath(workspacePath);
    
    // Verificar se diretório já existe e tem arquivos
    if (fs.existsSync(envDir)) {
      const files = fs.readdirSync(envDir);
      if (files.some(f => f.startsWith('.env'))) {
        // Já tem arquivos .env, não criar
        return;
      }
    }

    // Criar diretório
    if (!fs.existsSync(envDir)) {
      fs.mkdirSync(envDir, { recursive: true });
    }

    // Criar .env (default environment usado quando decorator presente)
    const defaultEnvPath = path.join(envDir, '.env');
    if (!fs.existsSync(defaultEnvPath)) {
      const defaultContent = `# Default Environment Variables
# Usado quando # @env default ou quando .env.{nome} não existe

BASE_URL=http://localhost:3000
API_KEY=your-api-key-here
TIMEOUT=10000
`;
      fs.writeFileSync(defaultEnvPath, defaultContent, 'utf8');
    }

    // Criar .env.example (exemplo de como criar novos environments)
    const exampleEnvPath = path.join(envDir, '.env.example');
    if (!fs.existsSync(exampleEnvPath)) {
      const exampleContent = `# Example Environment File
# 
# Como usar:
# 1. Copie este arquivo e renomeie para .env.{nome}
#    Exemplo: .env.dev, .env.staging, .env.prod
# 
# 2. No arquivo .req, use o decorator:
#    # @env dev
#    ## Minha Request
#    curl --request GET \\
#      --url {{base_url}}/api/endpoint
#
# 3. As variáveis {{base_url}}, {{api_key}}, etc serão substituídas
#    pelos valores definidos aqui
#
# Sintaxe:
# - Uma variável por linha no formato: NOME=valor
# - Nomes em MAIÚSCULAS (por convenção)
# - Sem espaços ao redor do =
# - Linhas iniciadas com # são comentários
#
# Exemplos de variáveis:

BASE_URL=http://localhost:3000
API_KEY=your-api-key-here
TIMEOUT=10000
AUTH_TOKEN=your-auth-token
API_VERSION=v1

# Dicas:
# - Use .env para valores padrão
# - Crie .env.dev para desenvolvimento
# - Crie .env.prod para produção
# - Adicione .env.local ao .gitignore para valores pessoais
`;
      fs.writeFileSync(exampleEnvPath, exampleContent, 'utf8');
    }

    // Criar .gitignore no diretório environments
    const gitignorePath = path.join(envDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `# Ignore local environment files
.env.local
*.local

# Keep example file
!.env.example
`;
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
    }
  }
}

