import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAllCosmeticsNews } from '../lib/rss-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/news.json');

async function main() {
  console.log('🌿 Verde Brasil Radar — Coletando feeds RSS do mercado de cosméticos...');
  const payload = await fetchAllCosmeticsNews({ maxItems: 42 });

  console.log(
    `Fontes consultadas: ${payload.sources.map((s) => `${s.name} (${s.ok ? s.count : 'erro'})`).join(' | ')}`
  );

  if (!payload.items || payload.items.length === 0) {
    console.warn('⚠️ Nenhum item retornado nesta execução. Mantendo src/data/news.json existente.');
    return;
  }

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`✅ ${payload.items.length} notícias salvas em src/data/news.json`);
}

main().catch((err) => {
  console.error('Erro ao coletar RSS:', err);
  process.exitCode = 1;
});
