/* 노후 자금 고갈 시뮬레이터(retire-drawdown)의 종목 프리셋 모듈을 그대로 복사 — 그쪽을 고치면 여기도 함께 */
const PF = (() => {
  const DATA_BASE = 'https://ttokjaetv.github.io/portfolio-sheet-data/data/';
  // 주요 종목 성장률 프리셋 — 배당 재투자 계산기와 같은 값 [이름, 배당률(데이터 없을 때), 배당성장, 주가성장]
  const PRESET = {
    'KR:161510': ['PLUS 고배당주', 4.6, 7.0, 7.0],
    'KR:489030': ['PLUS 고배당주위클리커버드콜', 24.1, -13.6, -13.6],
    'KR:498400': ['KODEX 200타겟위클리커버드콜', 19.8, -9.3, -9.3],
    'KR:498410': ['KODEX 금융고배당TOP10타겟위클리커버드콜', 17.3, -6.8, -6.8],
    'KR:472150': ['TIGER 배당커버드콜액티브', 28.1, -17.6, -17.6],
    'KR:466940': ['TIGER 은행고배당플러스TOP10', 4.2, 5.0, 6.0],
    'KR:441800': ['TIME Korea플러스배당액티브', 9.4, 3.1, 3.1],
    'KR:0052D0': ['TIGER 코리아배당다우존스', 4.7, 7.0, 7.0],
    'KR:091170': ['KODEX 은행', 4.2, 4.0, 5.5],
    'KR:484880': ['SOL 금융지주플러스고배당', 4.1, 5.0, 6.0],
    'KR:0153K0': ['KODEX 주주환원고배당주', 2.9, 7.0, 7.0],
    'KR:0089D0': ['KODEX 금융고배당TOP10', 5.0, 5.5, 6.0],
    'KR:489250': ['KODEX 미국배당다우존스', 3.0, 8.0, 8.0],
    'KR:458730': ['TIGER 미국배당다우존스', 3.0, 8.0, 8.0],
    'KR:0046Y0': ['ACE 미국배당퀄리티', 1.4, 8.0, 8.0],
    'KR:441640': ['KODEX 미국배당커버드콜액티브', 9.8, 0.7, 0.7],
    'KR:458760': ['TIGER 미국배당다우존스타겟커버드콜2호', 10.4, 0.1, 0.1],
    'KR:494300': ['KODEX 미국나스닥100데일리커버드콜OTM', 23.3, -12.8, -12.8],
    'KR:491620': ['RISE 미국테크100데일리고정커버드콜', 22.0, -11.5, -11.5],
    'KR:490600': ['RISE 미국배당100데일리고정커버드콜', 18.2, -7.7, -7.7],
    'KR:441680': ['TIGER 미국나스닥100커버드콜(합성)', 12.6, -2.1, -2.1],
    'KR:473330': ['SOL 미국30년국채커버드콜(합성)', 13.2, -2.7, -2.7],
    'KR:0040Y0': ['SOL 팔란티어커버드콜OTM채권혼합', 27.4, -16.9, -16.9],
    'KR:005930': ['삼성전자', 0.6, 4.0, 6.0],
    'KR:000660': ['SK하이닉스', 0.2, 5.0, 12.0],
    'KR:033780': ['KT&G', 3.5, 4.0, 4.0],
    'KR:105560': ['KB금융', 3.0, 7.0, 7.0],
    'KR:055550': ['신한지주', 3.1, 6.5, 6.5],
    'KR:086790': ['하나금융지주', 3.7, 6.0, 6.0],
    'KR:316140': ['우리금융지주', 4.4, 5.0, 5.0],
    'KR:024110': ['기업은행', 6.3, 4.0, 4.5],
    'KR:005380': ['현대차', 3.2, 5.0, 7.0],
    'KR:000270': ['기아', 6.1, 5.0, 6.4],
    'KR:017670': ['SK텔레콤', 2.1, 3.0, 4.0],
    'KR:030200': ['KT', 4.8, 4.0, 4.5],
    'KR:005490': ['POSCO홀딩스', 3.0, 4.0, 5.0],
    'US:SCHD': ['SCHD', 3.2, 8.0, 8.0],
    'US:JEPI': ['JEPI', 8.0, 2.0, 2.5],
    'US:JEPQ': ['JEPQ', 11.3, -0.8, -0.8],
    'US:VYM': ['VYM', 2.3, 7.0, 7.0],
    'US:VOO': ['VOO', 1.0, 6.0, 10.0],
    'US:QQQ': ['QQQ', 0.5, 8.0, 12.0],
    'US:O': ['O', 5.9, 3.0, 3.0],
    'US:KO': ['KO', 2.3, 5.0, 6.0],
    'US:PEP': ['PEP', 4.6, 6.0, 6.0],
    'US:JNJ': ['JNJ', 2.1, 6.0, 6.0],
    'US:PG': ['PG', 2.8, 5.0, 7.0],
    'US:MCD': ['MCD', 3.2, 8.0, 8.0],
    'US:MO': ['MO', 6.0, 2.0, 2.0],
    'US:XOM': ['XOM', 2.4, 4.0, 5.0],
    'US:CVX': ['CVX', 3.2, 5.0, 5.0],
    'US:T': ['T', 4.9, 1.0, 3.0],
    'US:VZ': ['VZ', 6.4, 2.0, 3.0],
    'US:AAPL': ['AAPL', 0.3, 5.0, 12.0],
    'US:MSFT': ['MSFT', 0.7, 10.0, 11.8],
  };
  // 유형별 기본값 (실데이터 아님 · 가정치) — 배당 재투자 계산기와 같은 표
  const TYPE = {
    levInv: { label: '레버리지·인버스', dg: 0, pg: 0, warn: '레버리지·인버스 상품은 장기 보유 시 지수와 수익률이 크게 벌어져 이 계산에 맞지 않습니다' },
    cc: { label: '커버드콜', dg: 0.5, pg: 2.0 }, rate: { label: '금리·초단기채', dg: 0, pg: 2.5 }, bond: { label: '채권', dg: 0, pg: 0 },
    reit: { label: '리츠·부동산', dg: 2.0, pg: 2.0 }, mixed: { label: '채권혼합', dg: 2.0, pg: 3.0 }, commod: { label: '원자재·가상자산', dg: 0, pg: 4.0 },
    currency: { label: '통화', dg: 0, pg: 1.0 }, etc: { label: '기타', dg: 0, pg: 3.0 }, krDivEtf: { label: '국내 배당주 ETF', dg: 6.0, pg: 6.0 },
    overseasEtf: { label: '해외주식 ETF(국내상장)', dg: 6.0, pg: 8.0 }, krEqEtf: { label: '국내주식 ETF', dg: 5.0, pg: 6.0 },
    krStock: { label: '국내 개별주', dg: 4.0, pg: 5.0 }, spac: { label: '스팩', dg: 0, pg: 0 }, usDivEtf: { label: '미국 배당 ETF', dg: 6.0, pg: 7.0 },
    usEtf: { label: '미국 주식 ETF', dg: 6.0, pg: 8.0 }, usStock: { label: '미국 개별주', dg: 5.0, pg: 7.0 },
    usDiv100: { label: '미국배당다우존스(SCHD형)', dg: 8.0, pg: 8.0 },
  };
  // 공용 프리셋(portfolio-sheet-data/data/presets.js)으로 숫자만 덮어씀 — 이름·목록은 이 계산기 것 유지, 못 불러오면 위 내장 값
  (function () {
    const S = window.TTOKJAE_PRESETS;
    if (!S || !Array.isArray(S.groups)) return;
    S.groups.forEach(([g, rows]) => rows.forEach(([key, nm, y, dg, pg]) => { const p = PRESET[key]; if (p) { p[1] = y; p[2] = dg; p[3] = pg; } }));
    if (S.types) Object.entries(S.types).forEach(([k, v]) => { if (TYPE[k] && Array.isArray(v)) { TYPE[k].dg = v[0]; TYPE[k].pg = v[1]; } });
  })();
  const RATE_RE = /금리|KOFR|SOFR|CD|머니마켓|단기자금/;
  function classify(it) {
    const n = it.name;
    if (it.kind === '국내ETF') {
      if (/레버리지|인버스|2X|곱버스/i.test(n)) return 'levInv';
      if (/커버드콜|프리미엄|옵션|버퍼/.test(n)) return 'cc';
      if (it.asset === '채권') return it.yieldTTM < 1 ? 'rate' : 'bond';
      if (it.asset === '부동산') return 'reit';
      if (it.asset === '혼합자산') return 'mixed';
      if (it.asset === '원자재') return 'commod';
      if (it.asset === '통화') return RATE_RE.test(n) ? 'rate' : 'currency';
      if (it.asset === '기타') return RATE_RE.test(n) ? 'rate' : 'etc';
      if (/미국배당다우존스/.test(n)) return 'usDiv100';   // Dow Jones U.S. Dividend 100 추종(커버드콜·타겟형은 위에서 cc)
      if (/배당/.test(n)) return 'krDivEtf';
      if (/미국|나스닥|S&P|글로벌|선진|일본|중국|차이나|인도|베트남|유럽|신흥|MSCI|필라델피아|월드/i.test(n)) return 'overseasEtf';
      return 'krEqEtf';
    }
    if (it.kind === '국내주식') { if (/스팩/.test(n)) return 'spac'; if (/리츠|인프라/.test(n)) return 'reit'; return 'krStock'; }
    if (it.kind === '미국ETF') {
      if (/\b(2x|3x|ultra|leveraged|inverse|bear|short)\b/i.test(n)) return 'levInv';
      if (/covered call|option|premium income|buywrite|yieldmax|buffer/i.test(n)) return 'cc';
      if (/t-bill|treasury bill|money market|ultra.?short|0-3 month|floating rate/i.test(n)) return 'rate';
      if (/bond|treasury|muni|clo\b|fixed income|aggregate|corporate|high yield|mortgage|tips|income securities/i.test(n)) return 'bond';
      if (/reit|real estate/i.test(n)) return 'reit';
      if (/gold|silver|oil|commodit|bitcoin|ether|crypto|copper|uranium/i.test(n)) return 'commod';
      if (/dividend/i.test(n)) return 'usDivEtf';
      return 'usEtf';
    }
    return 'usStock';
  }

  const U = new Map(); let LIST = [];
  const ST = { status: 'loading', krUpdated: '', usUpdated: '' };
  function parseCSV(text) {
    const rows = []; let row = [], field = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c !== '\r') field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    const head = (rows.shift() || []).map(h => h.replace(/^﻿/, '').trim());
    return rows.filter(r => r.length > 1).map(r => { const o = {}; head.forEach((h, i) => { o[h] = (r[i] ?? '').trim(); }); return o; });
  }
  const fetchCSV = name => fetch(DATA_BASE + name, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(name); return r.text(); }).then(parseCSV);
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
  const norm = s => String(s || '').toLowerCase().replace(/[\s·\-_().&,+]/g, '');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function add(it) { it.norm = norm(it.name); it.codeNorm = it.code.toLowerCase(); it.type = classify(it); U.set(it.key, it); }
  async function loadKR() {
    const [etfs, stocks, divs] = await Promise.all([fetchCSV('etf_prices.csv'), fetchCSV('kr_stocks.csv'), fetchCSV('dividends.csv')]);
    const dmap = new Map(divs.map(d => [d['종목코드'], d]));
    const mk = (code, name, kind, price, extra) => {
      const d = dmap.get(code); let ttm = null;
      if (d) { ttm = num(d['배당수익률']); const paid = num(d['연배당_실지급']); if (ttm == null && paid != null && price) ttm = paid / price * 100; }
      add(Object.assign({ key: 'KR:' + code, code, name, market: 'KR', kind, yieldTTM: ttm ?? 0, hasDiv: !!d && (ttm ?? 0) > 0 }, extra));
    };
    etfs.forEach(r => mk(r['종목코드'], r['종목명'], '국내ETF', num(r['현재가']), { asset: r['자산군'] }));
    stocks.forEach(r => mk(r['종목코드'], r['종목명'], '국내주식', num(r['현재가']), {}));
    ST.krUpdated = (divs[0] && divs[0]['갱신시각']) || (etfs[0] && etfs[0]['갱신시각']) || '';
  }
  async function loadUS() {
    const [prices, divs] = await Promise.all([fetchCSV('us_prices.csv'), fetchCSV('us_dividends.csv')]);
    const dmap = new Map(divs.map(d => [d['티커'], d]));
    prices.forEach(r => {
      const t = r['티커']; const d = dmap.get(t); const price = num(r['현재가USD']); let ttm = 0;
      if (d) { ttm = num(d['배당수익률']); if (ttm == null) { const a = num(d['연배당USD']); ttm = (a && price) ? a / price * 100 : 0; } }
      add({ key: 'US:' + t, code: t, name: r['종목명'], market: 'US', kind: r['구분'] === 'ETF' ? '미국ETF' : '미국주식', yieldTTM: ttm || 0, hasDiv: !!d && ttm > 0 });
    });
    ST.usUpdated = (divs[0] && divs[0]['갱신시각']) || '';
  }

  // ---------- 은퇴 전·후 포트폴리오 ----------
  // 계산 기준 = 은퇴 역산 계산기 조합 탐색기 기본 설정 (주가성장률 2.5%p 낮춰 잡기 · 총수익률 상한 일반 10% · 커버드콜 8%)
  const OPT = { haircut: 2.5, trCap: 10, ccCap: 8 };
  const MAXH = 6;
  // 빠른 시작 예시 조합 (종목 추천이 아니라 출발점 · 비중은 바꿀 수 있음)
  const QUICK = {
    Pre: [
      ['성장형', [['US:VOO', 40], ['US:QQQ', 40], ['KR:489250', 20]]],
      ['배당성장형', [['KR:489250', 100]]],
      ['지수 + 배당성장', [['US:VOO', 50], ['KR:489250', 50]]],
    ],
    Post: [
      ['인컴형', [['KR:489250', 50], ['KR:441640', 30], ['KR:161510', 20]]],
      ['커버드콜 중심', [['KR:441640', 50], ['KR:458760', 50]]],
      ['배당성장 유지', [['KR:489250', 100]]],
    ],
  };
  const LABEL = { Pre: '은퇴 전', Post: '은퇴 후' };

  function defState(ph) { return { mode: 'pf', h: QUICK[ph][0][1].map(([k, w]) => [k, w]) }; }
  function getState(ph) {
    const s = PFS[ph];
    if (s && (s.mode === 'pf' || s.mode === 'man') && Array.isArray(s.h)) return s;
    return defState(ph);
  }
  function setState(ph, st) { PFS[ph] = st; saveLocal(); }
  const isEditedPf = ph => JSON.stringify(getState(ph)) !== JSON.stringify(defState(ph));

  function info(key) {
    const it = U.get(key), p = PRESET[key];
    const o = { key, name: p ? p[0] : (it ? it.name : key.split(':')[1]), code: key.split(':')[1], market: key.slice(0, 2) };
    o.type = it ? it.type : (p ? null : 'etc');
    if (it) { o.y = round2(it.yieldTTM || 0); o.ySrc = it.hasDiv ? 'real' : 'none'; }
    else if (p) { o.y = p[1]; o.ySrc = 'preset'; }
    else { o.y = 0; o.ySrc = 'none'; }
    if (p) { o.pg = p[3]; o.gSrc = 'preset'; }
    else { const d = TYPE[o.type] || TYPE.etc; o.pg = d.pg; o.gSrc = 'type'; }
    if (!o.type && /커버드콜|프리미엄/.test(o.name)) o.type = 'cc';
    if (!o.type && o.market === 'US' && /^(JEPI|JEPQ)$/.test(o.code)) o.type = 'cc';
    return o;
  }
  const round2 = v => Math.round(v * 100) / 100;
  function eff(o) {
    const d = Math.max(0, o.y);
    let p = o.pg - OPT.haircut;
    let lim = OPT.trCap;
    if (o.type === 'cc') lim = Math.min(lim, OPT.ccCap);
    const capped = d + p > lim;
    if (capped) p = lim - d;
    return { d, p, t: d + p, capped };
  }
  function calc(ph) {
    const st = getState(ph);
    const rows = st.h.map(([k, w]) => { const o = info(k), e = eff(o); return { o, e, w: Math.max(0, +w || 0) }; });
    const sw = rows.reduce((a, r) => a + r.w, 0);
    let d = 0, p = 0;
    if (sw > 0) rows.forEach(r => { d += r.e.d * r.w / sw; p += r.e.p * r.w / sw; });
    return { rows, sw, d, p, t: d + p, ok: sw > 0 };
  }
  // 모델이 쓰는 수익률(%): 종목 모드면 조합 총수익률, 직접 입력이면 입력값
  function rate(ph, manual) { const st = getState(ph); if (st.mode === 'man') return manual; const c = calc(ph); return c.ok ? c.t : manual; }

  // ---------- 화면 ----------
  const srcY = { real: '실데이터', preset: '프리셋', none: '배당 없음' };
  function rowHTML(ph, r, i) {
    const { o, e } = r;
    const yTxt = o.ySrc === 'none' ? '배당 0%' : `배당 ${o.y.toFixed(2)}% <i>${srcY[o.ySrc]}</i>`;
    const gTxt = `주가성장 ${round2(e.p).toFixed(1)}% <i>${o.gSrc === 'preset' ? '프리셋' : (TYPE[o.type] || TYPE.etc).label + ' 기본값'} ${o.pg} − ${OPT.haircut}${e.capped ? ` · 상한 ${o.type === 'cc' ? OPT.ccCap : OPT.trCap}%` : ''}</i>`;
    return `<div class="pf-row">
      <div class="pf-nm"><b>${esc(o.name)}</b><span>${yTxt} · ${gTxt}</span></div>
      <div class="pf-tr">${e.t.toFixed(1)}%</div>
      <div class="pf-w"><input type="number" inputmode="numeric" min="0" max="100" step="5" value="${r.w}" data-pfw="${ph}" data-i="${i}" aria-label="${esc(o.name)} 비중"><span>%</span></div>
      <button type="button" class="pf-x" data-pfdel="${ph}" data-i="${i}" aria-label="${esc(o.name)} 빼기">×</button>
    </div>`;
  }
  function totalHTML(ph) {
    const c = calc(ph);
    if (!c.ok) return `<div class="pf-total warn">비중을 넣어 주세요</div>`;
    return `<div class="pf-total"><span>예상 총수익률 <small>(세전·연)</small></span><b>${c.t.toFixed(1)}%</b><em>배당 ${c.d.toFixed(1)}% + 주가성장 ${c.p.toFixed(1)}%</em></div>${Math.round(c.sw) !== 100 ? `<div class="pf-sumwarn">비중 합계 ${round2(c.sw)}% → 100%로 맞춰 계산합니다</div>` : ''}`;
  }
  function render(ph) {
    const box = document.getElementById('pf' + ph); if (!box) return;
    const st = getState(ph), c = calc(ph);
    const cur = JSON.stringify(st.h);
    box.querySelector('.pf-quick').innerHTML = QUICK[ph].map(([nm, h], i) => `<button type="button" class="chip${JSON.stringify(h) === cur ? ' on' : ''}" data-pfq="${ph}" data-i="${i}">${nm}</button>`).join('');
    box.querySelector('.pf-rows').innerHTML = c.rows.map((r, i) => rowHTML(ph, r, i)).join('') || '<div class="pf-empty">아래에서 종목을 검색해 담아 주세요.</div>';
    box.querySelector('.pf-tot').innerHTML = totalHTML(ph);
    box.querySelector('.pf-add').style.display = st.h.length >= MAXH ? 'none' : '';
    box.classList.toggle('man', st.mode === 'man');
    box.closest('.pf-box').querySelectorAll('[data-pfmode]').forEach(b => b.classList.toggle('on', b.dataset.pfmode === st.mode));
  }
  function renderAllPf() { render('Pre'); render('Post'); const n = document.getElementById('pfDataNote'); if (n) n.innerHTML = dataNote(); }
  function dataNote() {
    const d = (ST.krUpdated || '').slice(0, 10);
    const base = ST.status === 'ok' ? `배당률은 최근 12개월 실제 지급액 ÷ 현재가${d ? ` (${esc(d)} 기준 데이터)` : ''}` : ST.status === 'fail' ? '종목 데이터를 불러오지 못해 배당률은 프리셋 예비값을 씁니다' : '종목 데이터를 불러오는 중… (그동안 프리셋 예비값)';
    return `${base}. 주가성장률은 배당 재투자 계산기와 같은 프리셋 값(없으면 유형별 기본값)에서 환율·세금·수수료를 감안해 ${OPT.haircut}%p 낮춰 잡고, 총수익률이 ${OPT.trCap}%(커버드콜 ${OPT.ccCap}%)를 넘으면 그 값에 맞춥니다 — 은퇴 역산 계산기 조합 탐색기와 같은 기준입니다. 빠른 시작 조합은 출발점 예시일 뿐 종목 추천이 아닙니다.`;
  }
  function search(ph, q) {
    const out = document.querySelector(`#pf${ph} .pf-res`); if (!out) return;
    const nq = norm(q);
    if (!nq) { out.innerHTML = ''; return; }
    const have = new Set(getState(ph).h.map(x => x[0]));
    const pool = U.size ? [...U.values()] : Object.keys(PRESET).map(k => ({ key: k, name: PRESET[k][0], code: k.split(':')[1], norm: norm(PRESET[k][0]), codeNorm: k.split(':')[1].toLowerCase() }));
    const hits = [];
    for (const it of pool) {
      if (have.has(it.key)) continue;
      const nn = it.norm || norm(it.name), cn = it.codeNorm || String(it.code).toLowerCase();
      const sc = (cn === nq || nn === nq) ? 0 : nn.startsWith(nq) ? 1 : (nn.includes(nq) || cn.includes(nq)) ? 2 : -1;
      if (sc >= 0) hits.push([sc + (PRESET[it.key] ? -0.5 : 0) + nn.length / 1000, it]);
      if (hits.length > 400) break;
    }
    hits.sort((a, b) => a[0] - b[0]);
    out.innerHTML = hits.slice(0, 8).map(([, it]) => { const o = info(it.key), e = eff(o); return `<button type="button" data-pfadd="${ph}" data-key="${esc(it.key)}"><b>${esc(o.name)}</b><span>${esc(o.code)} · 총 ${e.t.toFixed(1)}%</span></button>`; }).join('') || '<div class="pf-nohit">찾는 종목이 없습니다</div>';
  }

  function bind(onChange) {
    ['Pre', 'Post'].forEach(ph => {
      const box = document.getElementById('pf' + ph); if (!box) return;
      const wrap = box.closest('.pf-box');
      wrap.addEventListener('click', e => {
        const t = e.target.closest('button'); if (!t) return;
        const st = JSON.parse(JSON.stringify(getState(ph)));
        if (t.dataset.pfmode) { st.mode = t.dataset.pfmode; setState(ph, st); render(ph); onChange(); return; }
        if (t.dataset.pfq != null) { st.h = QUICK[ph][+t.dataset.i][1].map(([k, w]) => [k, w]); st.mode = 'pf'; setState(ph, st); render(ph); onChange(); return; }
        if (t.dataset.pfdel != null) { st.h.splice(+t.dataset.i, 1); setState(ph, st); render(ph); onChange(); return; }
        if (t.dataset.pfadd != null) {
          if (st.h.length >= MAXH) return;
          const left = Math.max(0, 100 - st.h.reduce((a, x) => a + (+x[1] || 0), 0));
          st.h.push([t.dataset.key, left || 10]); setState(ph, st);
          const q = box.querySelector('.pf-q'); q.value = ''; box.querySelector('.pf-res').innerHTML = '';
          render(ph); onChange(); return;
        }
      });
      box.addEventListener('input', e => {
        const t = e.target;
        if (t.dataset.pfw != null) {
          const st = JSON.parse(JSON.stringify(getState(ph)));
          st.h[+t.dataset.i][1] = Math.max(0, Math.min(100, parseFloat(t.value) || 0));
          setState(ph, st);
          const c = calc(ph); const r = c.rows[+t.dataset.i];
          box.querySelector('.pf-tot').innerHTML = totalHTML(ph);
          box.querySelectorAll('.pf-quick .chip').forEach((b, i) => b.classList.toggle('on', JSON.stringify(QUICK[ph][i][1]) === JSON.stringify(st.h)));
          onChange();
        } else if (t.classList.contains('pf-q')) search(ph, t.value);
      });
    });
  }
  async function load(onDone) {
    await Promise.allSettled([loadKR(), loadUS()]);
    ST.status = U.size ? 'ok' : 'fail';
    renderAllPf(); onDone();
  }
  return { rate, calc, render: renderAllPf, bind, load, isEditedPf, getState, LABEL, defState, ST };
})();
