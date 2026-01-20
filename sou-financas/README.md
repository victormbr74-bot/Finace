# Sou Finanças

**Sou Finanças** já está preparado para rodar como app financeiro instalável, funcionar em GitHub Pages e sobreviver a conexões instáveis.

## Local development & verificação

- `npm install` (já feito) para sincronizar dependências.
- `npm run dev` levanta o servidor de desenvolvimento (Vite) sem base customizada.
- `npm run build` gera `dist/` usando o `base` configurado por `VITE_GH_PAGES_BASE` ou pelo campo `homepage` do `package.json`.
- `npm run preview` serve a build final para testes de forma idêntica ao Pages.
- `npm run check` roda o `tsc -b` caso você queira manter o type-check separado da build.

## GitHub Pages e base

- O `vite.config.ts` lê `VITE_GH_PAGES_BASE` (ex.: `/finance-hunter/`) para definir `base` e o `start_url` da PWA; se não estiver setado, usa `homepage` em `package.json` ou `/`.
- Configure a variável de ambiente `VITE_GH_PAGES_BASE` antes de rodar `npm run build` para garantir que o HashRouter crie rotas como `/#/app/dashboard` dentro do subdiretório do repositório.
- Se preferir usar `homepage`, adicione algo como `"homepage": "https://<seu-usuário>.github.io/<repo>/"` em `package.json`.
- O `HashRouter` já está configurado para respeitar `import.meta.env.BASE_URL`, portanto os links de rota continuam funcionando sem `BrowserRouter`.

## PWA e continuidade offline

- O `vite-plugin-pwa` registra o service worker automaticamente (`registerType: "autoUpdate"`) e fornece manifest + icons (192x192, 512x512, maskable, apple touch).
- Há um `Snackbar` discreto que aparece quando uma nova versão é baixada, permitindo “Atualizar” com `skipWaiting`.
- Um banner fixo informa quando o dispositivo está offline e permite tentar novamente (recarregando a página).
- O cache inclui JS/CSS/assets/Vite chunks e o fallback de navegação (`navigateFallback`) evita a tela branca mesmo quando a conexão falha.

## Deploy automático com GitHub Actions

- O workflow `.github/workflows/deploy.yml`:
  1. Executa `npm ci`/`npm run build` com Node 20.
  2. Publica `dist/` como artefato de páginas.
  3. Chama `actions/deploy-pages@v1` para atualizar o GitHub Pages em `gh-pages` (com permissão adequada).
  4. Define automaticamente `VITE_GH_PAGES_BASE` como `/${{ github.event.repository.name }}/`.
- Para habilitar o Pages, vá em **Settings > Pages**, escolha a fonte “GitHub Actions”, branch `gh-pages` e o diretório raiz `/`.
- A URL final esperada é `https://<seu-usuário>.github.io/<seu-repositório>/`; atualize o nome de usuário/repos nome conforme necessário.

## Comandos úteis

- `npm run dev` — desenvolvimento com recarregamento automático.
- `npm run build` — build otimizado respeitando a base definida.
- `npm run preview` — preview local da build final.
- `npm run check` — validação de tipos isolada.
