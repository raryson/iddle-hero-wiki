import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './recommendations.css';
import './routes.css';
import './responsive.css';
import { GOLD_ROUTES, XP_ROUTES, routesAroundLevel } from './routes';

const ELEMENTS = ['fire', 'ice', 'earth', 'energy', 'holy', 'death', 'physical'];
const fmt = (value, digits = 2) => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: digits });
const percent = (value) => `${(Number(value || 0) * 100).toFixed(1).replace('.', ',')}%`;

function App() {
  const [payload, setPayload] = useState(null);
  const [activeSection, setActiveSection] = useState('hunts');
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sort, setSort] = useState('stage');
  const [page, setPage] = useState(1);
  const [selectedHunt, setSelectedHunt] = useState(null);
  const [level, setLevel] = useState('');
  const [levelDraft, setLevelDraft] = useState('');
  const [levelEditorOpen, setLevelEditorOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageSize = 12;

  useEffect(() => { fetch('/data/hunts.json').then((r) => r.json()).then(setPayload); }, []);

  const hunts = useMemo(() => {
    if (!payload) return [];
    const result = payload.hunts.filter((hunt) => {
      const matchesQuery = hunt.name.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = levelFilter === 'all' || (levelFilter === 'early' && hunt.recLevel <= 50) || (levelFilter === 'advanced' && hunt.recLevel > 50);
      return matchesQuery && matchesLevel;
    });
    return result.sort((a, b) => {
      if (sort === 'xp') return b.efficiency.xpPerHp - a.efficiency.xpPerHp;
      if (sort === 'gold') return b.efficiency.totalGoldPerHp - a.efficiency.totalGoldPerHp;
      if (sort === 'hp') return a.hp - b.hp;
      return a.stage - b.stage;
    });
  }, [payload, query, levelFilter, sort]);

  useEffect(() => setPage(1), [query, levelFilter, sort]);
  const visibleHunts = hunts.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(hunts.length / pageSize));

  const recommendations = useMemo(() => level ? { xp: routesAroundLevel(XP_ROUTES, Number(level)), gold: routesAroundLevel(GOLD_ROUTES, Number(level)) } : null, [level]);

  function saveLevel(event) {
    event.preventDefault();
    const parsed = Number(levelDraft);
    if (Number.isInteger(parsed) && parsed > 0) {
      setLevel(parsed);
      setLevelEditorOpen(false);
    }
  }

  if (!payload) return <div className="loading-screen"><div className="sigil">✦</div><p>CARREGANDO BESTIÁRIO...</p></div>;

  return <div className="wiki-app">
    <header className="mobile-header"><Logo /><button className="mobile-menu" aria-label="Abrir menu" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>{mobileNavOpen ? '×' : '☰'}</button></header>
    <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
      <Logo />
      <div className="server-status"><span /> BESTIÁRIO ONLINE</div>
      <nav className="main-nav">
        <NavButton active={activeSection === 'hunts'} icon="⚔" label="Hunts recomendadas" onClick={() => { setActiveSection('hunts'); setMobileNavOpen(false); }} />
        <NavButton active={activeSection === 'bestiary'} icon="♜" label="Bestiário" onClick={() => { setActiveSection('bestiary'); setMobileNavOpen(false); }} soon />
        <NavButton active={activeSection === 'items'} icon="◈" label="Itens e loot" onClick={() => { setActiveSection('items'); setMobileNavOpen(false); }} soon />
        <NavButton active={activeSection === 'mechanics'} icon="◌" label="Mecânicas" onClick={() => { setActiveSection('mechanics'); setMobileNavOpen(false); }} soon />
      </nav>
      <div className="sidebar-bottom"><div className="version">IDLE HERO WIKI <b>v0.1</b></div><p>Uma referência feita pela comunidade.</p></div>
    </aside>

    <main className="content">
      <div className="topline"><div className="crumb">WIKI <span>/</span> {activeSection === 'hunts' ? 'HUNTS' : activeSection.toUpperCase()}</div><div className="data-source">● DADOS DO JOGO <span>•</span> ATUALIZADO EM 03 AGO 2026</div></div>
      {activeSection === 'hunts' ? <>
        <section className="hero-heading"><div><div className="section-kicker"><span /> GUIA DE PROGRESSÃO</div><h1>Hunts recomendadas</h1><p>Encontre as melhores criaturas para evoluir, farmar ouro e avançar pelo estágio.</p></div><div className="hero-count"><strong>{payload.totalHunts}</strong><span>HUNTS<br />CATALOGADAS</span></div></section>
        <section className="level-card"><div className="level-card-icon">⌁</div><div className="level-card-copy"><span>PERSONALIZE SUA RECOMENDAÇÃO</span><strong>{level ? `Recomendações para level ${fmt(level, 0)}` : 'Descubra onde caçar agora'}</strong><p>{level ? 'Resultados calculados para o level anterior, atual e seguinte.' : 'Informe seu level para encontrar as melhores hunts de XP e Gold.'}</p></div>{!levelEditorOpen && <button className="level-action" onClick={() => { setLevelDraft(level); setLevelEditorOpen(true); }}>{level ? 'Alterar level' : 'Informar meu level'} <b>→</b></button>}{levelEditorOpen && <form className="level-form" onSubmit={saveLevel}><label>SEU LEVEL<input autoFocus type="number" min="1" value={levelDraft} onChange={(event) => setLevelDraft(event.target.value)} placeholder="Ex.: 120" /></label><button type="submit">Aplicar</button></form>}</section>
        {level && <RecommendationSection recommendations={recommendations} onOpen={(route) => setSelectedHunt(payload.hunts.find((hunt) => hunt.name.toLowerCase() === route.name.toLowerCase()) || null)} />}
        <section className="stat-strip"><Stat label="HUNTS CATALOGADAS" value={payload.hunts.length} /><Stat label="ESTÁGIO MÁXIMO" value={Math.max(...payload.hunts.map((hunt) => hunt.stage))} /><Stat label="NÍVEL RECOMENDADO MÁXIMO" value={Math.max(...payload.hunts.map((hunt) => hunt.recLevel))} /><Stat label="COM LOOT REGISTRADO" value={payload.hunts.filter((hunt) => hunt.lootPool?.length).length} /></section>
        <section className="toolbar"><div className="search-field"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar criatura..." /></div><select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}><option value="all">Todos os níveis</option><option value="early">Níveis iniciais (até 50)</option><option value="advanced">Níveis avançados (51+)</option></select><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="stage">Ordenar por estágio</option><option value="xp">Melhor XP / HP</option><option value="gold">Melhor Gold / HP</option><option value="hp">Menor HP</option></select></section>
        <section className="table-card"><div className="table-heading"><div><h2>Catálogo de criaturas</h2><p>{hunts.length} resultado{hunts.length === 1 ? '' : 's'} encontrados</p></div><span className="legend"><i className="legend-dot" /> fraqueza elemental</span></div><div className="table-scroll"><table><thead><tr><th>CRIATURA</th><th>ESTÁGIO</th><th>REC. LVL</th><th>HP</th><th>XP / KILL</th><th>GOLD / KILL</th><th>XP / HP</th><th>ELEMENTOS</th><th /></tr></thead><tbody>{visibleHunts.map((hunt) => <HuntRow key={`${hunt.stage}-${hunt.name}`} hunt={hunt} onOpen={() => setSelectedHunt(hunt)} />)}</tbody></table></div>{visibleHunts.length === 0 && <div className="empty">Nenhuma criatura encontrada para esses filtros.</div>}<div className="pagination"><span>Mostrando {hunts.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, hunts.length)} de {hunts.length}</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button><b>{page} / {pages}</b><button disabled={page === pages} onClick={() => setPage(page + 1)}>→</button></div></div></section>
      </> : <ComingSoon title={activeSection === 'bestiary' ? 'Bestiário' : activeSection === 'items' ? 'Itens e loot' : 'Mecânicas'} />}
      <footer><span>✦</span> IDLE HERO WIKI <i>feito para consultar, descobrir e jogar melhor.</i></footer>
    </main>
    {selectedHunt && <HuntModal hunt={selectedHunt} onClose={() => setSelectedHunt(null)} />}
  </div>;
}

function Logo() { return <div className="logo"><div className="logo-mark">✦</div><div><strong>IDLE HERO</strong><span>COMMUNITY WIKI</span></div></div>; }
function NavButton({ active, icon, label, onClick, soon }) { return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}><span className="nav-icon">{icon}</span>{label}{soon && <small>EM BREVE</small>}</button>; }
function Stat({ label, value }) { return <div className="stat"><span>{label}</span><strong>{fmt(value, 0)}</strong></div>; }
function HuntRow({ hunt, onOpen }) { const weaknesses = Object.entries(hunt.elements || {}).filter(([, value]) => value < 0).slice(0, 3); return <tr onClick={onOpen}><td><strong className="creature-name">{hunt.name}</strong>{hunt.lootPool?.length > 0 && <small className="loot-tag">LOOT</small>}</td><td><span className="stage">{hunt.stage}</span></td><td>{hunt.recLevel}</td><td className="mono">{fmt(hunt.hp, 0)}</td><td className="mono">{fmt(hunt.xpBase, 0)}</td><td className="mono">{fmt(hunt.expectedTotalGoldPerKill)}</td><td className="green mono">{percent(hunt.efficiency.xpPerHp)}</td><td><div className="elements">{weaknesses.length ? weaknesses.map(([name, value]) => <span className={`element ${name}`} key={name}>{name} {value}%</span>) : <span className="no-element">—</span>}</div></td><td className="arrow">↗</td></tr>; }
function HuntModal({ hunt, onClose }) { return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={onClose}>×</button><div className="section-kicker"><span /> DETALHES DA CRIATURA</div><h2>{hunt.name}</h2><p className="modal-sub">ESTÁGIO {hunt.stage} · NÍVEL RECOMENDADO {hunt.recLevel}</p><div className="detail-grid"><Detail label="Pontos de vida" value={fmt(hunt.hp, 0)} /><Detail label="XP por kill" value={fmt(hunt.xpBase, 0)} /><Detail label="Gold por kill" value={fmt(hunt.expectedTotalGoldPerKill)} /><Detail label="XP por HP" value={percent(hunt.efficiency.xpPerHp)} /><Detail label="Gold total / HP" value={hunt.efficiency.totalGoldPerHp.toFixed(3)} /><Detail label="Loot registrado" value={`${hunt.lootPool?.length || 0} itens`} /></div><div className="modal-block"><span>RESISTÊNCIAS E FRAQUEZAS</span><div className="modal-elements">{Object.entries(hunt.elements || {}).map(([key, value]) => <span className={`element ${value < 0 ? key : 'resist'}`} key={key}>{key} {value > 0 ? '+' : ''}{value}%</span>)}{!Object.keys(hunt.elements || {}).length && <em>Sem modificadores registrados.</em>}</div></div><div className="modal-block"><span>IMUNIDADES</span><p>{hunt.immunities?.length ? hunt.immunities.join(' · ') : 'Nenhuma imunidade registrada.'}</p></div></div></div>; }
function Detail({ label, value }) { return <div className="detail"><span>{label}</span><strong>{value}</strong></div>; }
function RecommendationSection({ recommendations, onOpen }) {
  return <section className="recommendations"><div className="recommendation-heading"><div><div className="section-kicker"><span /> RECOMENDAÇÕES POR LEVEL</div><h2>Rota sugerida para você</h2><p>Uma hunt anterior, a faixa atual e a próxima, seguindo as rotas estratégicas da wiki.</p></div><span className="recommendation-note">ROTA CONFIGURADA</span></div><div className="recommendation-columns"><RecommendationGroup title="RUSH DE XP" accent="xp" routes={recommendations.xp} onOpen={onOpen} /><RecommendationGroup title="PROFIT POR LEVEL" accent="gold" routes={recommendations.gold} onOpen={onOpen} /></div></section>;
}
function RecommendationGroup({ title, accent, routes, onOpen }) {
  return <div className={`recommendation-group ${accent}`}><div className="group-title"><span>{accent === 'xp' ? '✦' : '◈'}</span><strong>{title}</strong><small>MELHOR HUNT DA FAIXA</small></div><div className="recommendation-levels">{routes.map(({ route, relation }) => <button className="route-card" key={`${accent}-${route.start}-${route.name}`} onClick={() => onOpen(route)}><div className="route-card-heading"><span>{relation}</span><strong>{route.start}–{route.end}</strong></div><b className="route-name">{route.name}</b><small>FASE {route.stage} · {route.element}</small><div className="route-metrics"><span>{route.multiplier}</span><strong>{accent === 'xp' ? `${route.perHour} XP/h` : `${route.goldPerHour} Gold/h`}</strong></div></button>)}</div></div>;
}
function ComingSoon({ title }) { return <section className="coming-soon"><div className="big-sigil">✦</div><div className="section-kicker"><span /> PRÓXIMA SEÇÃO</div><h1>{title}</h1><p>Esta área da wiki está sendo preparada. A base de dados já está estruturada para receber novos conteúdos.</p></section>; }

createRoot(document.getElementById('root')).render(<App />);
