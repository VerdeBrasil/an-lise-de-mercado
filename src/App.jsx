import React, { useState, useMemo, useEffect } from 'react';
import {
  Newspaper,
  Sparkles,
  BookOpen,
  Compass,
  RefreshCw,
  Search,
  ExternalLink,
  Bookmark,
  Copy,
  Check,
  ArrowRight,
  Leaf,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

import seedNews from './data/news.json';
import dossiers from './data/dossiers.json';
import contentTrends from './data/content-trends.json';
import references from './data/references.json';

const CATEGORIES = [
  'Todas',
  'Hair Care & Capilar',
  'Ativos, P&D & Ciência',
  'Mercado & Negócios',
  'Sustentabilidade & Regulação',
  'Tendências & Conteúdo'
];

function formatDatePT(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTimePT(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [newsState, setNewsState] = useState(seedNews);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  // Filtros do Radar de Notícias
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [onlySaved, setOnlySaved] = useState(false);

  // Favoritos salvos no navegador
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const raw = localStorage.getItem('vb_saved_news');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Filtro de linha no Lab de Conteúdo
  const [selectedLine, setSelectedLine] = useState('Todas');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('vb_saved_news', JSON.stringify(savedIds));
    } catch {
      // ignora caso storage esteja bloqueado
    }
  }, [savedIds]);

  const currentDossier = dossiers[0];

  const handleLiveRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage('');
    try {
      const res = await fetch('/api/rss');
      if (!res.ok) throw new Error('Falha na resposta RSS');
      const liveData = await res.json();
      if (liveData?.items?.length > 0) {
        setNewsState(liveData);
        setRefreshMessage(
          `Radar sincronizado ao vivo! ${liveData.items.length} notícias recentes carregadas dos portais do setor.`
        );
      }
    } catch {
      setRefreshMessage(
        'Exibindo a última coleta salva no repositório (GitHub Actions atualiza automaticamente todos os dias).'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleSave = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleCopyPauta = (pauta) => {
    const text = `Linha: ${pauta.line}\nFormato: ${pauta.format}\nGancho (Hook): "${pauta.hook}"\n\nRoteiro:\n${pauta.scriptSteps.join('\n')}\n\nCTA: ${pauta.cta}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(pauta.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const filteredNews = useMemo(() => {
    return (newsState.items || []).filter((item) => {
      if (onlySaved && !savedIds.includes(item.id)) return false;
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.title} ${item.summary} ${item.publisher} ${item.verdeBrasilNote}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [newsState.items, onlySaved, savedIds, selectedCategory, selectedRegion, searchQuery]);

  const productLines = useMemo(() => {
    const unique = Array.from(new Set(contentTrends.contentIdeas.map((i) => i.line)));
    return ['Todas', ...unique];
  }, []);

  const filteredPautas = useMemo(() => {
    if (selectedLine === 'Todas') return contentTrends.contentIdeas;
    return contentTrends.contentIdeas.filter((p) => p.line === selectedLine);
  }, [selectedLine]);

  return (
    <div>
      {/* Cabeçalho Institucional Verde Brasil */}
      <header className="top-header">
        <div className="header-inner">
          <div className="brand-lockup">
            <div className="brand-logo-wrap">
              <img
                src="/logo-verde-brasil.png"
                alt="Verde Brasil Cosméticos"
                className="brand-logo"
              />
            </div>
            <div className="brand-titles">
              <span className="brand-kicker">Inteligência de Mercado & Conteúdo</span>
              <h1 className="brand-portal-name">Radar HPPC & Hair Care Brasil</h1>
            </div>
          </div>

          <div className="header-actions">
            <div className="status-pill" title="Atualização diária via GitHub Actions + RSS gratuito">
              <span className="pulse-dot" />
              <span>Última coleta: {formatDateTimePT(newsState.updatedAt)}</span>
            </div>
            <button
              type="button"
              className="btn-refresh"
              onClick={handleLiveRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
              {isRefreshing ? 'Sincronizando...' : 'Atualizar Radar Agora'}
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Navegação */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={17} />
            Visão Executiva
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <Newspaper size={17} />
            Radar de Notícias
            <span className="tab-count">{newsState.items?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'dossiers' ? 'active' : ''}`}
            onClick={() => setActiveTab('dossiers')}
          >
            <BookOpen size={17} />
            Dossiê Semanal
            <span className="tab-count">{dossiers.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Sparkles size={17} />
            Tendências de Conteúdo & Pautas
            <span className="tab-count">{contentTrends.contentIdeas.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <Compass size={17} />
            Portais & Automação
          </button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="main-container">
        {refreshMessage && (
          <div className="toast-banner">
            <span>{refreshMessage}</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => setRefreshMessage('')}
            >
              Fechar
            </button>
          </div>
        )}

        {/* ABA 1: VISÃO EXECUTIVA */}
        {activeTab === 'overview' && (
          <>
            <section className="hero-banner">
              <div>
                <div className="hero-badge">
                  <Leaf size={14} />
                  {currentDossier.edition} · {currentDossier.date}
                </div>
                <h2 className="hero-title">{currentDossier.title}</h2>
                <p className="hero-desc">{currentDossier.subtitle}</p>
                <div className="hero-cta-row">
                  <button
                    type="button"
                    className="btn-primary-mint"
                    onClick={() => setActiveTab('dossiers')}
                  >
                    Ler Dossiê Completo
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-outline-light"
                    onClick={() => setActiveTab('content')}
                  >
                    Ver Pautas Prontas p/ Redes
                  </button>
                </div>
              </div>

              <div className="hero-side-box">
                <span className="hero-side-title">Termômetro Rápido — Verde Brasil</span>
                <ul className="hero-mini-list">
                  <li>
                    <CheckCircle2 size={16} color="#A5DFD3" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>
                      <strong>Scalp Care em alta histórica:</strong> oportunidade direta para o{' '}
                      <em>Tônico Cresce Cabelo</em>.
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="#A5DFD3" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>
                      <strong>Busca por brilho espelhado & resgate pós-luzes:</strong> vitrine para a{' '}
                      <em>Linha Antiemborrachamento</em>.
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} color="#A5DFD3" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>
                      <strong>Fim da estética artificial no TikTok:</strong> vídeos de teste real e textura de{' '}
                      <em>Açaí + Jabuticaba</em> e <em>Óleos de Monoi/Argan</em> lideram salvamentos.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* KPIs do Mercado */}
            <section className="kpi-grid">
              {currentDossier.kpis.map((kpi) => (
                <div className="kpi-card" key={kpi.label}>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-label">{kpi.label}</div>
                </div>
              ))}
            </section>

            {/* Duas Colunas: Últimas Notícias + Matriz de Portfólio */}
            <div className="overview-cols">
              <section>
                <div className="section-head">
                  <div>
                    <div className="section-kicker">Monitoramento Diário Automático</div>
                    <h3 className="section-title">Últimas Notícias do Setor</h3>
                  </div>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setActiveTab('news')}
                  >
                    Ver todas ({newsState.items?.length || 0}) <ArrowRight size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(newsState.items || []).slice(0, 5).map((item) => (
                    <article className="news-card" key={item.id}>
                      <div className="news-meta-top">
                        <span className="cat-badge">{item.category}</span>
                        <span className="region-tag">
                          {item.publisher} · {formatDatePT(item.publishedAt)}
                        </span>
                      </div>
                      <h4 className="news-title">
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                      </h4>
                      <p className="news-summary">{item.summary}</p>
                      <div className="news-footer">
                        <span className="vb-connection-tag">
                          <Leaf size={13} /> {item.verdeBrasilNote}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="link-btn"
                        >
                          Ler fonte <ExternalLink size={13} />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div className="section-head">
                  <div>
                    <div className="section-kicker">Cruzamento Estratégico</div>
                    <h3 className="section-title">Tendências × Linhas Verde Brasil</h3>
                  </div>
                </div>

                <div className="matrix-list">
                  {currentDossier.portfolioMatrix.map((row) => (
                    <div className="matrix-card" key={row.trend}>
                      <div className="matrix-trend">{row.trend}</div>
                      <span className="matrix-line">{row.productLine}</span>
                      <p className="matrix-desc">{row.angle}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {/* ABA 2: RADAR DE NOTÍCIAS */}
        {activeTab === 'news' && (
          <section>
            <div className="section-head">
              <div>
                <div className="section-kicker">Feed RSS Automatizado (Brasil & Global)</div>
                <h2 className="section-title">Radar Diário do Mercado de Cosméticos</h2>
              </div>
              <button
                type="button"
                className={`filter-pill ${onlySaved ? 'active' : ''}`}
                onClick={() => setOnlySaved(!onlySaved)}
              >
                <Bookmark size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Salvos ({savedIds.length})
              </button>
            </div>

            <div className="toolbar">
              <div className="search-row">
                <div className="search-box">
                  <Search size={17} color="#4b635c" />
                  <input
                    type="text"
                    placeholder="Buscar por capilar, scalp care, ANVISA, embalagens, açaí, Boticário, exportação..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="pill-row">
                  {[
                    { id: 'ALL', label: 'Brasil + Global' },
                    { id: 'BR', label: 'Só Brasil' },
                    { id: 'GLOBAL', label: 'Internacional' }
                  ].map((reg) => (
                    <button
                      key={reg.id}
                      type="button"
                      className={`filter-pill ${selectedRegion === reg.id ? 'active' : ''}`}
                      onClick={() => setSelectedRegion(reg.id)}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pill-row">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredNews.length === 0 ? (
              <div className="dossier-shell" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ color: '#4b635c', marginBottom: 12 }}>
                  Nenhuma notícia encontrada com esses filtros.
                </p>
                <button
                  type="button"
                  className="filter-pill active"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todas');
                    setSelectedRegion('ALL');
                    setOnlySaved(false);
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="news-grid">
                {filteredNews.map((item) => {
                  const isSaved = savedIds.includes(item.id);
                  return (
                    <article className="news-card" key={item.id}>
                      <div>
                        <div className="news-meta-top" style={{ marginBottom: 10 }}>
                          <span className="cat-badge">{item.category}</span>
                          <span className="region-tag">
                            {item.region === 'GLOBAL' ? 'Global' : 'Brasil'} · {formatDatePT(item.publishedAt)}
                          </span>
                        </div>
                        <h3 className="news-title" style={{ marginBottom: 10 }}>
                          <a href={item.url} target="_blank" rel="noreferrer">
                            {item.title}
                          </a>
                        </h3>
                        <p className="news-summary">{item.summary}</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <span className="vb-connection-tag">
                          <Leaf size={13} /> {item.verdeBrasilNote}
                        </span>
                        <div className="news-footer">
                          <span>Fonte: {item.publisher}</span>
                          <div className="news-actions">
                            <button
                              type="button"
                              className={`icon-btn ${isSaved ? 'saved' : ''}`}
                              onClick={() => toggleSave(item.id)}
                              title={isSaved ? 'Remover dos salvos' : 'Salvar para pauta'}
                            >
                              <Bookmark size={15} />
                            </button>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-btn"
                              title="Abrir matéria original"
                            >
                              <ExternalLink size={15} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ABA 3: DOSSIÊ SEMANAL */}
        {activeTab === 'dossiers' && (
          <article className="dossier-shell">
            <header className="dossier-header">
              <div className="dossier-meta">
                <span className="edition-pill">{currentDossier.edition}</span>
                <span>{currentDossier.date}</span>
                <span>·</span>
                <span>{currentDossier.readTime}</span>
                <span>·</span>
                <span>{currentDossier.author}</span>
              </div>
              <h2 className="dossier-title">{currentDossier.title}</h2>
              <p className="dossier-subtitle">{currentDossier.subtitle}</p>
            </header>

            <div className="dossier-prose">
              <div className="section-kicker">1. Síntese Executiva</div>
              <h3 className="section-title" style={{ marginBottom: 14 }}>
                Panorama da Semana para a Verde Brasil Cosméticos
              </h3>
              {currentDossier.executiveSummary.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              <div className="section-kicker" style={{ marginTop: 30 }}>
                2. Movimentações de Mercado
              </div>
              <h3 className="section-title" style={{ marginBottom: 8 }}>
                Destaques da Semana & Ações Recomendadas
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table className="highlight-table">
                  <thead>
                    <tr>
                      <th>Frente</th>
                      <th>O que está acontecendo</th>
                      <th>Oportunidade Verde Brasil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDossier.weeklyHighlights.map((row) => (
                      <tr key={row.area}>
                        <td style={{ fontWeight: 700, color: '#074135', whiteSpace: 'nowrap' }}>
                          {row.area}
                        </td>
                        <td>
                          <strong>{row.headline}</strong>
                          <div style={{ color: '#4b635c', marginTop: 4 }}>{row.insight}</div>
                        </td>
                        <td style={{ color: '#102620' }}>{row.actionForVerdeBrasil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="section-kicker" style={{ marginTop: 12 }}>
                3. Mapa de Oportunidades por Linha
              </div>
              <h3 className="section-title" style={{ marginBottom: 16 }}>
                Macrotendências de Hair Care 2026 × Portfólio Atual
              </h3>

              <div className="matrix-list">
                {currentDossier.portfolioMatrix.map((item) => (
                  <div className="matrix-card" key={item.trend}>
                    <div className="matrix-trend">{item.trend}</div>
                    <span className="matrix-line">{item.productLine}</span>
                    <p className="matrix-desc" style={{ marginBottom: 6 }}>
                      <strong>Sinal de mercado:</strong> {item.marketSignal}
                    </p>
                    <p className="matrix-desc">
                      <strong>Ângulo de comunicação:</strong> {item.angle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* ABA 4: TENDÊNCIAS DE CONTEÚDO & PAUTAS */}
        {activeTab === 'content' && (
          <section>
            <div className="section-head">
              <div>
                <div className="section-kicker">Monitoramento TikTok · Reels · Shorts · Newsletters</div>
                <h2 className="section-title">Tendências de Conteúdo no Mercado de Beleza</h2>
              </div>
            </div>

            <div className="shifts-grid">
              {contentTrends.macroShifts.map((shift) => (
                <div className="shift-card" key={shift.id}>
                  <span className="heat-badge">{shift.heat}</span>
                  <div style={{ fontSize: '0.76rem', color: '#4b635c', fontWeight: 600, marginBottom: 4 }}>
                    {shift.channel}
                  </div>
                  <h3 className="news-title" style={{ marginBottom: 8 }}>
                    {shift.title}
                  </h3>
                  <p className="news-summary" style={{ marginBottom: 12 }}>
                    {shift.summary}
                  </p>
                  <div className="vb-connection-tag">
                    <strong>Aplicação:</strong> {shift.howToUse}
                  </div>
                </div>
              ))}
            </div>

            <div className="section-head">
              <div>
                <div className="section-kicker">Roteiros & Ganchos Prontos</div>
                <h2 className="section-title">Banco de Pautas — Verde Brasil Cosméticos</h2>
              </div>
            </div>

            <div className="pill-row" style={{ marginBottom: 20 }}>
              {productLines.map((line) => (
                <button
                  key={line}
                  type="button"
                  className={`filter-pill ${selectedLine === line ? 'active' : ''}`}
                  onClick={() => setSelectedLine(line)}
                >
                  {line}
                </button>
              ))}
            </div>

            <div className="pauta-grid">
              {filteredPautas.map((pauta) => {
                const isCopied = copiedId === pauta.id;
                return (
                  <div className="pauta-card" key={pauta.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="news-meta-top">
                        <span className="cat-badge">{pauta.line}</span>
                        <span className="region-tag">{pauta.format}</span>
                      </div>
                      <div className="hook-box">“{pauta.hook}”</div>
                      <ol className="steps-list">
                        {pauta.scriptSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                      <p style={{ fontSize: '0.82rem', color: '#074135', fontWeight: 600 }}>
                        CTA sugerido: {pauta.cta}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`btn-copy ${isCopied ? 'copied' : ''}`}
                      onClick={() => handleCopyPauta(pauta)}
                    >
                      {isCopied ? <Check size={15} /> : <Copy size={15} />}
                      {isCopied ? 'Roteiro copiado!' : 'Copiar Gancho & Roteiro'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ABA 5: PORTAIS DE REFERÊNCIA & AUTOMAÇÃO */}
        {activeTab === 'sources' && (
          <section>
            <div className="section-head">
              <div>
                <div className="section-kicker">Curadoria B2B, Ciência Capilar & Comportamento</div>
                <h2 className="section-title">Portais de Referência do Mercado de Cosméticos</h2>
              </div>
            </div>

            <div className="ref-grid">
              {references.map((ref) => (
                <div className="ref-card" key={ref.name}>
                  <div>
                    <div className="news-meta-top" style={{ marginBottom: 8 }}>
                      <span className="region-tag">{ref.scope}</span>
                      {ref.rssIntegrated && <span className="cat-badge">RSS Ativo</span>}
                    </div>
                    <h3 className="news-title" style={{ marginBottom: 8 }}>
                      {ref.name}
                    </h3>
                    <p className="news-summary">{ref.focus}</p>
                  </div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-btn"
                  >
                    Visitar portal <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>

            <div className="section-head">
              <div>
                <div className="section-kicker">Arquitetura Sem Custos Extras (R$ 0)</div>
                <h2 className="section-title">Como Funciona o Modelo Híbrido deste Portal</h2>
              </div>
            </div>

            <div className="hybrid-box">
              <div className="hybrid-step">
                <h4>1. Radar Diário Automático (GitHub Actions + RSS)</h4>
                <p>
                  Todos os dias de manhã, um fluxo gratuito no GitHub Actions executa{' '}
                  <code>npm run fetch-news</code>, varre os feeds de cosméticos e hair care, classifica por
                  conexão com a Verde Brasil e atualiza o site na Vercel sozinho.
                </p>
              </div>

              <div className="hybrid-step">
                <h4>2. Sincronização Ao Vivo Sob Demanda</h4>
                <p>
                  Ao clicar em <strong>“Atualizar Radar Agora”</strong> no topo, a função serverless gratuita{' '}
                  <code>/api/rss</code> consulta as fontes em tempo real sem precisar esperar o agendamento.
                </p>
              </div>

              <div className="hybrid-step">
                <h4>3. Dossiê Semanal & Pautas via Antigravity</h4>
                <p>
                  Uma vez por semana (ou quando quiser), basta pedir no Antigravity:{' '}
                  <em>“Gere a nova Edição Semanal e novas pautas para a Verde Brasil”</em> — sem custo
                  adicional além da sua assinatura atual.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>
            <strong>Verde Brasil Cosméticos</strong> · Central de Inteligência de Mercado, Tendências &
            Conteúdo
          </span>
          <span>Arquitetura Híbrida Gratuita · Vercel + GitHub Actions + Antigravity</span>
        </div>
      </footer>
    </div>
  );
}
