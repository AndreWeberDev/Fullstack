# Arcade365

## Apresentação

Sou o autor deste projeto. Criei o Arcade365 como um portal simples para reunir e apresentar jogos online, sem dependências de frameworks no front-end. O objetivo foi manter a experiência leve, fácil de hospedar e direta de entender.

## Propósito

O site funciona como catálogo de jogos e como meio de divulgar lançamentos futuros. Além das páginas estáticas, implementei uma rota de API que alimenta os blocos dinâmicos de jogos "Em breve".

## Decisões de projeto

- Front-end: HTML, CSS e JavaScript puro, sem frameworks.
- Back-end: servidor Node.js com Express, minimalista e responsável por servir os estáticos e a API.
- Persistência: SQLite, adotado por ser leve e adequado ao escopo deste protótipo.

## Estrutura do repositório

- `index.html` — página principal.
- `server.js` — servidor Node.js com rotas estáticas e API.
- `package.json` — dependências e scripts.
- `assets/` — imagens e recursos estáticos.
- `src/`
  - `css/` — folhas de estilo (`home.css`, `styles.css`, `contact.css`).
  - `js/` — scripts do front-end (`games.js`, `app.js`, `script.js`).
  - `data/` — JSONs com dados (por exemplo `upcomingGames.json`).
  - `db/` — local do arquivo SQLite e documentação do banco.
  - `view/` — páginas internas (`about.html`, `contato.html`, `terms.html`, `politics.html`).
- `extra/` — materiais auxiliares fora do escopo principal.

## Comportamento do servidor

- A API `GET /api/upcomingGames` retorna a lista de jogos futuros. A rota consulta o banco SQLite e usa `src/data/upcomingGames.json` como fonte de seed quando necessário.
- Na inicialização o servidor garante o diretório do banco, cria a tabela `upcomingGames` se ausente e popula dados iniciais quando apropriado.
- O servidor evita servir arquivos sensíveis diretamente e a política de CORS é configurável via `ALLOWED_ORIGINS`.
- Em produção, quando presente o cabeçalho `x-forwarded-proto`, o servidor pode redirecionar para HTTPS.

## Funcionamento do front-end

- `src/js/games.js` tenta carregar os jogos pela API e, em caso de falha, usa o JSON local como fallback; cria dinamicamente os elementos que aparecem em `#dynamic-games`.
- `src/js/app.js` trata a interface de avaliações (estrelas), o formulário de recomendações e um pequeno efeito visual para eventos de orientação/tamanho de tela.
- Estilos divididos entre `home.css` e `styles.css`; `contact.css` concentra os estilos do formulário.

## Como executar localmente

1. Instale dependências:

```powershell
npm install
```

2. (Opcional) Defina variáveis de ambiente, por exemplo:

```powershell
$Env:PORT = 3000
$Env:ALLOWED_ORIGINS = "http://localhost:3000"
```

3. Inicie o servidor:

```powershell
node server.js
```

4. Abra `http://localhost:3000` no navegador.

## Observações técnicas

- Não há processo de build: editar arquivos estáticos e recarregar o navegador é o fluxo de trabalho.
- O arquivo `script.js` atualmente não contém lógica ativa e pode ser removido se não for necessário.

## Contato do autor

Se precisar de esclarecimentos, posso detalhar qualquer parte do projeto.

---

Fim da documentação.
- Não existe suíte de testes automatizados no repositório. Testes manuais recomendados:

