
# Dashboard de Marketing (React + Recharts + XLSX)

Projeto criado para leitura de planilhas **.xlsx** e visualização de KPIs e gráficos de marketing.

## 💻 Rodando localmente

```bash
npm install
npm start
```

Abra http://localhost:3000

## 🧱 Build de produção

```bash
npm run build
```

## 📂 Estrutura esperada da planilha

Colunas mínimas recomendadas:
- `Mês/Ano`
- `Plataforma`
- `Gasto Real`
- `Receita`
- `Leads`
- `Vendas`
- `CTR (%)` (opcional)
- `CPC` (opcional)

## 🚀 Publicando no GitHub Pages (opcional)

1. Crie o repositório no GitHub.
2. Faça push do projeto.
3. Ative **Settings → Pages → Deploy from branch → gh-pages** (após o 1º deploy via workflow).
4. O workflow abaixo faz build e publica em `gh-pages` automaticamente a cada push na branch `main`.

## ⚙️ CI: GitHub Actions

Workflow em `.github/workflows/deploy.yml`:
- Node 18
- Build de produção
- Publica conteúdo de `build` na branch `gh-pages`

## 📝 Licença

MIT
