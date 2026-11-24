# Verde Brasil Intelligence — Radar do Mercado de Cosméticos & Conteúdo

Portal de inteligência de mercado, notícias diárias do setor HPPC, tendências de *hair care* e banco de pautas de conteúdo desenvolvido sob medida para a **Verde Brasil Cosméticos** no **Modelo Híbrido (Custo R$ 0)**.

## Como funciona (Custo Zero)

1. **Radar Diário Automático (`scripts/fetch-news.mjs` + GitHub Actions):**
   - Todos os dias às **07h00 (horário de Brasília)**, o workflow `.github/workflows/update-news.yml` coleta automaticamente feeds RSS de portais do setor (*Cosmetic Innovation*, *Google News HPPC & Hair Care Brasil*, *Brazil Beauty News*, *Regulação ANVISA* e inovação global), classifica os artigos por categoria e por conexão com o portfólio da Verde Brasil e atualiza `src/data/news.json`.
   - Sempre que `src/data/news.json` muda no GitHub, a **Vercel (Plano Hobby Gratuito)** republica o site automaticamente.
2. **Sincronização Ao Vivo (`/api/rss`):**
   - O botão **"Atualizar Radar Agora"** no topo do site consulta a função serverless gratuita da Vercel (`/api/rss.js`) para trazer notícias em tempo real quando desejar.
3. **Dossiês Semanais & Pautas Curadas (`src/data/dossiers.json` e `src/data/content-trends.json`):**
   - Gerados sob medida direto pelo **Antigravity** (usando sua assinatura atual), sem gastar nada com APIs pagas.

## Comandos locais

```bash
# Instalar dependências
npm install

# Atualizar notícias reais agora via RSS
npm run fetch-news

# Rodar servidor local de desenvolvimento
npm run dev

# Gerar build de produção (mesmo comando usado pela Vercel)
npm run build
```

## Como publicar grátis na Vercel (3 passos)

1. Crie um repositório gratuito no [GitHub](https://github.com/new) (ex.: `verde-brasil-radar`) e envie esta pasta:
   ```bash
   git init
   git add .
   git commit -m "feat: portal de inteligencia Verde Brasil Cosmeticos"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/verde-brasil-radar.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com), entre com sua conta do GitHub e clique em **Add New → Project**.
3. Selecione o repositório `verde-brasil-radar` e clique em **Deploy** (a Vercel detecta **Vite** e a rota `/api/rss` automaticamente).
