# AGENTS.md - Guia de Desenvolvimento

## Visão Geral do Projeto

Extensão VS Code/Cursor desenvolvida em TypeScript para gerar e importar deeplinks de comandos, regras e prompts do Cursor. Facilita o compartilhamento e colaboração através de links compartilháveis.

**Tecnologias Principais:**
- TypeScript (strict mode)
- VS Code Extension API
- Node.js (CommonJS modules)

## Estrutura de Diretórios

```
src/              # Código fonte TypeScript
  ├── extension.ts           # Ponto de entrada, registro de comandos
  ├── deeplinkGenerator.ts   # Geração de deeplinks
  ├── deeplinkImporter.ts    # Importação de deeplinks
  ├── codelensProvider.ts    # Provider de CodeLens
  ├── userCommandsTreeProvider.ts  # Tree Provider para comandos pessoais
  └── utils.ts               # Funções utilitárias
out/              # Código compilado (gerado automaticamente)
resources/        # Recursos estáticos (ícones, etc.)
```

## Convenções de Código

### Nomenclatura
- **Arquivos**: camelCase (ex: `deeplinkGenerator.ts`)
- **Funções**: camelCase (ex: `generateDeeplink`, `getFileTypeFromPath`)
- **Classes**: PascalCase (ex: `DeeplinkCodeLensProvider`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_URL_LENGTH`)
- **Tipos/Interfaces**: PascalCase (ex: `DeeplinkParams`)

### Formatação e Estilo
- TypeScript strict mode habilitado
- Target: ES2020
- Módulos: CommonJS
- Sempre usar tipos explícitos em funções exportadas
- Comentários JSDoc para funções públicas e complexas

### Estrutura de Funções
```typescript
/**
 * Descrição clara da função
 * @param param Descrição do parâmetro
 * @returns Descrição do retorno
 */
export async function functionName(param: Type): Promise<ReturnType> {
  // Validações primeiro
  // Lógica principal
  // Tratamento de erros
}
```

## Arquitetura e Padrões

### Separação de Responsabilidades
- **extension.ts**: Registro de comandos e ativação da extensão
- **deeplinkGenerator.ts**: Lógica de geração de deeplinks
- **deeplinkImporter.ts**: Lógica de importação e criação de arquivos
- **codelensProvider.ts**: Implementação do CodeLens
- **userCommandsTreeProvider.ts**: Tree Provider para visualização de comandos pessoais
- **utils.ts**: Funções utilitárias reutilizáveis

### Tratamento de Erros
- Sempre mostrar mensagens de erro ao usuário via `vscode.window.showErrorMessage()`
- Validar entradas antes de processar
- Usar try-catch em operações assíncronas
- Retornar `null` ou `undefined` em caso de erro (não lançar exceções não tratadas)

### Validações
- Validar extensões de arquivo permitidas antes de processar
- Validar comprimento de URL (limite de 8000 caracteres)
- Validar formato de URLs customizadas
- Verificar existência de arquivos antes de operações

### Configurações
- Usar `vscode.workspace.getConfiguration('cursorDeeplink')` para acessar configurações
- Suportar configurações em nível de workspace e usuário
- Valores padrão sempre definidos
- Validar configurações antes de usar

## Desenvolvimento

### Workflow
1. Desenvolver em `src/` usando TypeScript
2. Compilar com `npm run compile` (gera `out/`)
3. Testar localmente instalando o `.vsix`
4. Atualizar `CHANGELOG.md` com mudanças
5. Publicar com `npm run publish`

### Comandos Disponíveis
- `npm run compile`: Compila TypeScript
- `npm run watch`: Compilação em modo watch
- `npm run package`: Cria arquivo `.vsix`
- `npm run publish`: Publica no marketplace

### Registro de Comandos
- Registrar todos os comandos em `activate()`
- Adicionar disposables ao `context.subscriptions`
- Usar prefixo `cursor-deeplink.` para todos os comandos

### CodeLens
- Implementar `vscode.CodeLensProvider`
- Atualizar CodeLens quando configurações mudarem
- Mostrar apenas em arquivos válidos (`.cursor/` ou `.claude/` folders)
- Validar extensões permitidas antes de exibir

### Tree Provider
- Implementar `vscode.TreeDataProvider` para comandos pessoais
- Atualizar tree quando arquivos mudarem (usar FileSystemWatcher)
- Filtrar arquivos por extensões permitidas
- Ordenar itens alfabeticamente
- Criar diretórios automaticamente se não existirem
- Suportar múltiplas pastas baseado em configuração (`personalCommandsView`)

## Padrões de Integração

### Suporte a Múltiplos Formatos
- **Deeplink**: `cursor://anysphere.cursor-deeplink/`
- **Web**: `https://cursor.com/link/`
- **Custom**: Configurável via `cursorDeeplink.customBaseUrl`

### Pastas Suportadas
- **Commands**: `.cursor/commands/` ou `.claude/commands/` (configurável)
- **Rules**: `.cursor/rules/` (apenas)
- **Prompts**: `.cursor/prompts/` (apenas)

### Comandos Pessoais vs Projeto
- Comandos pessoais: `~/.cursor/commands/` ou `~/.claude/commands/`
- Comandos de projeto: `{workspace}/.cursor/commands/` ou `{workspace}/.claude/commands/`
- Sempre perguntar ao usuário ao importar comandos

## Qualidade

### Validações Obrigatórias
- Verificar extensão de arquivo permitida
- Validar comprimento de URL (máximo 8000 caracteres)
- Verificar existência de arquivos antes de operações
- Validar formato de URLs customizadas
- Sanitizar nomes de arquivos

### Mensagens ao Usuário
- Usar `showInformationMessage()` para sucesso
- Usar `showErrorMessage()` para erros
- Usar `showWarningMessage()` para confirmações
- Mensagens devem ser claras e acionáveis

### Extensões de Arquivo
- Padrão: `['md', 'mdc']`
- Configurável via `cursorDeeplink.allowedExtensions`
- Para rules, preferir `.mdc` se disponível (suporta metadata)

## Boas Práticas

### Funções Utilitárias
- Manter funções puras quando possível
- Exportar funções reutilizáveis em `utils.ts`
- Documentar funções complexas com JSDoc
- Usar tipos explícitos

### Manipulação de Arquivos
- Usar `vscode.workspace.fs` para operações de arquivo
- Criar diretórios se não existirem
- Verificar existência antes de sobrescrever
- Perguntar confirmação antes de deletar

### Parsing de URLs
- Suportar ambos os formatos (`cursor://` e `https://`)
- Normalizar URLs antes de processar
- Decodificar parâmetros URL com tratamento de erros
- Validar estrutura de URL antes de extrair parâmetros

### Sanitização
- Sanitizar nomes de arquivos (remover caracteres inválidos)
- Manter apenas letras, números, pontos, hífens e underscores
- Remover extensão antes de sanitizar

## Configurações da Extensão

### Configurações Disponíveis
- `cursorDeeplink.linkType`: Tipo de link (`deeplink`, `web`, `custom`)
- `cursorDeeplink.customBaseUrl`: URL base customizada
- `cursorDeeplink.allowedExtensions`: Extensões permitidas
- `cursorDeeplink.commandsFolder`: Pasta de comandos (`cursor` ou `claude`)
- `cursorDeeplink.personalCommandsView`: Exibir comandos de (`both`, `cursor`, `claude`)

### Ativação
- Ativar em `onLanguage` e `onCommand`
- Registrar CodeLens provider para todos os arquivos
- Registrar Tree Provider para visualização de comandos pessoais
- Comandos disponíveis via Command Palette e Context Menu
- FileSystemWatcher para atualizar tree quando arquivos mudarem

