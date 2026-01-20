# Sou Financas

Aplicacao React + Vite + TypeScript com UI Material UI, Dexie para IndexedDB, Chart.js e modulos de planejamento financeiro local.

## Como comecar

1. `npm install`
2. `npm run dev` (localhost:5173)
3. `npm run build`

## Estrutura

- `src/db`: Dexie com tabelas `users`, `categories`, `transactions`, `savingGoals`, `savingEntries`, `settings`, `sessions`
- `src/services`: autenticao, transacoes, metas, seeds, configuracoes
- `src/hooks`: contexto de autenticacao e sessao
- `src/theme`: ThemeProvider com dark mode, cor principal configuravel e persistencia
- `src/components` / `src/pages`: layout responsivo, Drawer, BottomNavigation, formularios com `react-hook-form` + `zod`

## Rotas

- `/login`, `/register`
- `/app/dashboard`, `/app/transactions`, `/app/savings`, `/app/reports`, `/app/profile`
- Rotas `/app/*` protegem o conteudo e redirecionam para `/login`
- Drawer lateral permanente no desktop, menu inferior no mobile, topbar com seletores de tema/cor e botao de adicionar

## Persistencia

Todos os dados ficam no IndexedDB do projeto (`finance-db`) nas tabelas definidas pelo Dexie. Sao armazenados:

- Usuarios (email, senha hashed com bcryptjs)
- Transacoes (tipo, valor, categoria, forma de pagamento, recorrencia)
- Categorias (padrao + personalizadas)
- Metas de poupanca e entradas mensais
- Configuracoes (tema, cor, moeda)
- Sessao atual (tabela `sessions` com registro `current`)

## Limpar e seeds

Use o botao **Gerar dados demo** na pagina de Perfil para popular transacoes, metas e categorias. O botao **Resetar dados locais** limpa toda a base (transacoes, categorias, metas, entradas, configuracoes e sessao).

## Qualidade

- Formulario e validacao controlada com Zod e React Hook Form
- Feedback com Snackbar e ErrorBoundary
- Layout responsivo mobile-first (Drawer + BottomNavigation)
- Grafico com Chart.js (linha, barra, rosca)
- Tema customizavel via AppThemeProvider

## Ideias futuras

1. Orçamento por categoria com alertas de limite
2. Notificacoes locais para lancar gastos e depositos
3. Recorrencias automáticas para contas fixas
4. Modo casal/familia com multiplos perfis
5. Anexo ou nota por transacao (base64 ou File System Access)
6. Tela de insights com detecao de padroes e comparativos
7. Backup/restore completo via JSON
