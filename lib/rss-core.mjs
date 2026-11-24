// Motor compartilhado de coleta, parsing e classificação de RSS do mercado de cosméticos
// Custo R$ 0 — usa apenas fetch nativo do Node.js (>= 18), sem dependências externas.

export const RSS_SOURCES = [
  {
    id: 'cosmetic-innovation',
    name: 'Cosmetic Innovation',
    region: 'BR',
    defaultCategory: 'Ativos, P&D & Ciência',
    url: 'https://cosmeticinnovation.com.br/feed/'
  },
  {
    id: 'gnews-hppc-br',
    name: 'Radar HPPC Brasil (Google News)',
    region: 'BR',
    defaultCategory: 'Mercado & Negócios',
    url: 'https://news.google.com/rss/search?q=mercado+cosm%C3%A9ticos+OR+ABIHPEC+OR+%22ind%C3%BAstria+de+beleza%22+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419'
  },
  {
    id: 'gnews-haircare-br',
    name: 'Radar Capilar & Hair Care (BR)',
    region: 'BR',
    defaultCategory: 'Hair Care & Capilar',
    url: 'https://news.google.com/rss/search?q=%22cuidados+capilares%22+OR+%22produtos+capilares%22+OR+%22cronograma+capilar%22+OR+%22scalp+care%22&hl=pt-BR&gl=BR&ceid=BR:pt-419'
  },
  {
    id: 'gnews-anvisa-sustentabilidade',
    name: 'Regulação ANVISA & Sustentabilidade',
    region: 'BR',
    defaultCategory: 'Sustentabilidade & Regulação',
    url: 'https://news.google.com/rss/search?q=Anvisa+cosm%C3%A9ticos+OR+%22cosm%C3%A9ticos+veganos%22+OR+%22biodiversidade+brasileira%22+cosm%C3%A9ticos&hl=pt-BR&gl=BR&ceid=BR:pt-419'
  },
  {
    id: 'brazil-beauty-news',
    name: 'Brazil Beauty News',
    region: 'BR',
    defaultCategory: 'Mercado & Negócios',
    url: 'https://www.brazilbeautynews.com/spip.php?page=backend'
  },
  {
    id: 'gnews-global-trends',
    name: 'Global Beauty & Hair Innovation',
    region: 'GLOBAL',
    defaultCategory: 'Tendências & Conteúdo',
    url: 'https://news.google.com/rss/search?q=%22hair+care+trends%22+OR+%22cosmetics+industry%22+innovation+OR+%22scalp+care%22+beauty&hl=en-US&gl=US&ceid=US:en'
  }
];

function decodeHtmlEntities(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

function stripHtml(html = '') {
  return decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block, tag) {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : '';
}

export function classifyArticle(title, summary, fallbackCategory) {
  const text = `${title} ${summary}`.toLowerCase();

  if (
    /(capilar|cabelo|hair|scalp|shampoo|condicionador|m[aá]scara|fios|couro cabeludo|cronograma|[oó]leo de argan|monoi|frizz|descolora|matizador|queda capilar)/.test(
      text
    )
  ) {
    return 'Hair Care & Capilar';
  }
  if (
    /(anvisa|regul|sustent[aá]v|vegano|recicl|embalagen|log[ií]stica reversa|biodiversidade|carbono|esg|cruelty)/.test(
      text
    )
  ) {
    return 'Sustentabilidade & Regulação';
  }
  if (
    /(ativo|ingrediente|biotecnologia|pept[ií]deo|formula[cç][aã]o|p&d|microbioma|exossomo|niacinamida|a[cç]a[ií]|col[aá]geno|ci[eê]ncia|efic[aá]cia)/.test(
      text
    )
  ) {
    return 'Ativos, P&D & Ciência';
  }
  if (
    /(tiktok|tend[eê]ncia|trend|viral|conte[uú]do|consumidor|gera[cç][aã]o z|social commerce|influencer|instagram|newsletter)/.test(
      text
    )
  ) {
    return 'Tendências & Conteúdo';
  }
  return fallbackCategory || 'Mercado & Negócios';
}

export function detectVerdeBrasilTag(title, summary, category) {
  const text = `${title} ${summary}`.toLowerCase();
  if (/(couro cabeludo|scalp|queda|crescimento|raiz|t[oô]nico)/.test(text)) {
    return 'Conexão: Linha Cresce Cabelo / Scalp Care';
  }
  if (/(reconstru[cç][aã]o|qu[ií]mica|descolor|el[aá]stico|danificad|porosidade|acidifica)/.test(text)) {
    return 'Conexão: Linha Antiemborrachamento';
  }
  if (/(a[cç]a[ií]|jabuticaba|amaz[oô]n|biodiversidade|natural|bot[aâ]nic|vegano)/.test(text)) {
    return 'Conexão: Ativos Naturais & Biodiversidade';
  }
  if (/([oó]leo|argan|monoi|finalizador|frizz|brilho|nutri[cç][aã]o)/.test(text)) {
    return 'Conexão: Óleos Capilares & Finalizadores';
  }
  if (category === 'Hair Care & Capilar') {
    return 'Foco Core: Cuidados Capilares';
  }
  if (category === 'Sustentabilidade & Regulação') {
    return 'Monitoramento: ANVISA & ESG';
  }
  return 'Radar Estratégico HPPC';
}

export function parseRssItems(xml, source) {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  const parsed = [];

  for (const block of itemBlocks.slice(0, 12)) {
    let rawTitle = stripHtml(extractTag(block, 'title'));
    let publisher = source.name;

    // No Google News, o título geralmente termina com " - Nome do Portal"
    const sourceTag = stripHtml(extractTag(block, 'source'));
    if (sourceTag) {
      publisher = sourceTag;
      const suffix = ` - ${sourceTag}`;
      if (rawTitle.endsWith(suffix)) {
        rawTitle = rawTitle.slice(0, -suffix.length).trim();
      }
    } else if (rawTitle.includes(' - ') && source.id.startsWith('gnews-')) {
      const parts = rawTitle.split(' - ');
      publisher = parts.pop().trim();
      rawTitle = parts.join(' - ').trim();
    }

    if (!rawTitle || rawTitle.length < 12) continue;

    let link = stripHtml(extractTag(block, 'link'));
    if (!link) {
      const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
      if (hrefMatch) link = hrefMatch[1];
    }

    const rawDesc = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content:encoded');
    let summary = stripHtml(rawDesc);
    // Evita repetir o próprio título quando o Google News traz o título dentro da description
    if (summary.toLowerCase().startsWith(rawTitle.toLowerCase().slice(0, 35))) {
      summary = summary.slice(rawTitle.length).replace(/^[\s\-–—·|]+/, '').trim();
    }
    if (!summary || summary.length < 25) {
      summary = `Cobertura publicada por ${publisher} monitorada no radar ${source.name}. Clique para ler a matéria completa na fonte original.`;
    } else if (summary.length > 260) {
      summary = `${summary.slice(0, 257).trim()}...`;
    }

    const pubDateRaw = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'dc:date');
    const parsedDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
    const isoDate = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

    const category = classifyArticle(rawTitle, summary, source.defaultCategory);
    const verdeBrasilNote = detectVerdeBrasilTag(rawTitle, summary, category);

    parsed.push({
      id: Buffer.from(`${rawTitle}-${publisher}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 22),
      title: rawTitle,
      summary,
      url: link,
      publisher,
      feedName: source.name,
      region: source.region,
      category,
      verdeBrasilNote,
      publishedAt: isoDate
    });
  }

  return parsed;
}

export async function fetchAllCosmeticsNews({ maxItems = 42 } = {}) {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8500);
      try {
        const res = await fetch(source.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'VerdeBrasilMarketRadar/1.0 (+https://verdebrasilcosmeticos.com.br)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*'
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        return parseRssItems(xml, source);
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  const allItems = [];
  const sourceStats = [];

  results.forEach((result, idx) => {
    const src = RSS_SOURCES[idx];
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
      sourceStats.push({ id: src.id, name: src.name, ok: true, count: result.value.length });
    } else {
      sourceStats.push({
        id: src.id,
        name: src.name,
        ok: false,
        count: 0,
        error: result.reason?.message || 'Erro ao consultar feed'
      });
    }
  });

  // Deduplicação por título normalizado
  const seen = new Set();
  const deduped = [];
  for (const item of allItems) {
    const key = item.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 55);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  // Ordena pelas mais recentes
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    updatedAt: new Date().toISOString(),
    totalCollected: deduped.length,
    sources: sourceStats,
    items: deduped.slice(0, maxItems)
  };
}
