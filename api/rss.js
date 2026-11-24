import { fetchAllCosmeticsNews } from '../lib/rss-core.mjs';

export default async function handler(req, res) {
  try {
    const data = await fetchAllCosmeticsNews({ maxItems: 42 });
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Não foi possível atualizar os feeds RSS em tempo real.',
      details: error?.message || 'Erro desconhecido'
    });
  }
}
