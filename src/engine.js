/* ===== 경제적 자유 계산기 엔진 =====
   1년 단위. 생활비가 수입보다 많으면 모자란 돈을 연초에 꺼내고(인출 매년 초),
   남으면 매달 말 나눠 적립(월 복리: 월 수익률 = (1+연)^(1/12) − 1). 연말에 투자 비중으로 다시 맞춤. */
function annuity12(m) { return Math.abs(m) < 1e-12 ? 12 : (Math.pow(1 + m, 12) - 1) / m; }

function simulate(p, R) {
  const rows = [];
  let Bi = p.inv0, Bc = p.cash0;
  const w0 = (p.inv0 + p.cash0) > 0 ? p.inv0 / (p.inv0 + p.cash0) : 1;
  const Rr = Math.max(R, p.age);          // 이미 은퇴했으면 올해부터 은퇴 생활
  let depl = null, retireAssets = null, freeStart = null;
  let sumShort = 0;
  for (let t = 0; p.age + t <= p.endAge; t++) {
    const a = p.age + t;
    const ix = Math.pow(1 + p.inf, t);
    const working = a < Rr;
    const start = Bi + Bc;
    if (a === Rr) retireAssets = start;

    // 생활비 (오늘 돈 가치 → 명목)
    let sp = p.spend;
    p.chg.forEach(c => { if (c.age != null && a >= c.age) sp += c.delta; });
    sp = Math.max(0, sp) * ix;
    const doomOn = p.doom.on && a >= p.doom.age;
    if (doomOn) sp *= (1 - p.doom.cut);

    const inc = working ? p.income * Math.pow(1 + p.incG, t) : 0;
    const pub = (p.nps > 0 && a >= p.npsAge) ? p.nps * ix : 0;
    const pv = (p.priv > 0 && a >= p.privAge && a < p.privAge + p.privYears) ? p.priv : 0;
    let lump = 0;
    p.lumps.forEach(l => { if (l.age === a) lump += l.amt * ix; });
    const flow = inc + pub + pv - sp;

    // 올해 투자자산 수익(연)
    const safeNow = p.safe.on && a >= p.safe.age;
    let fi = 1 + (safeNow ? p.safe.r : (working ? p.rPre : p.rPost));
    const ev = [];
    if (!safeNow) {
      if (p.crash && a >= Rr && a < Rr + 2) { fi = Math.min(fi, 0.8); ev.push('은퇴 직후 폭락'); }
      if (p.rec.on && p.rec.cycle > 0 && t > 0 && t % p.rec.cycle === 0) { fi = Math.min(fi, 1 - p.rec.drop); ev.push('불황'); }
      if (p.doom.on && a === p.doom.age) { fi = Math.min(fi, 1 - p.doom.drop); ev.push('둠스데이'); }
    }
    fi = Math.max(fi, 0.0001);
    const fc = 1 + (safeNow ? p.safe.r : p.rCash);
    const w = safeNow ? 0 : w0;
    if (safeNow) { Bc += Bi; Bi = 0; }

    // 연초: 큰돈 들어오면 더하고, 모자라면 꺼냄
    const plusIn = Math.max(0, lump);
    Bi += plusIn * w; Bc += plusIn * (1 - w);
    const need = Math.max(0, -flow) + Math.max(0, -lump);
    let short = 0, drawn = 0;
    if (need > 0) {
      const gross = need / (1 - p.cost);
      const tot = Bi + Bc;
      if (gross <= tot) {
        const k = tot > 0 ? (tot - gross) / tot : 0;
        Bi *= k; Bc *= k; drawn = gross;
      } else {
        short = need - tot * (1 - p.cost);
        drawn = tot; Bi = 0; Bc = 0;
      }
    }
    // 1년 굴리기 + 남는 돈은 매달 말 적립
    const plus = Math.max(0, flow);
    const mi = Math.pow(fi, 1 / 12) - 1, mc = Math.pow(fc, 1 / 12) - 1;
    Bi = Bi * fi + plus * w / 12 * annuity12(mi);
    Bc = Bc * fc + plus * (1 - w) / 12 * annuity12(mc);
    const end = Bi + Bc;
    Bi = end * w; Bc = end * (1 - w);   // 연말 비중 맞추기

    if (short > 1 && depl == null) depl = a;
    sumShort += short;
    rows.push({ t, a, ix, working, start, inc, pub, pv, sp, lump, flow, need, drawn, short, end, endInv: Bi, endCash: Bc, fi, ev });
  }
  return { rows, depl, retireAssets: retireAssets == null ? (p.inv0 + p.cash0) : retireAssets, R: Rr, sumShort };
}

// 가장 빠른 경제적 자유 나이: 그 나이에 일을 그만둬도 계획 나이까지 모자람이 없는 최소 나이
function freedomAge(p, maxAge) {
  const lim = Math.min(maxAge, p.endAge);
  for (let R = p.age; R <= lim; R++) if (simulate(p, R).depl == null) return R;
  return null;
}

// 희망 나이에 은퇴해도 계획 나이까지 버티는 최대 월 생활비 (오늘 돈 가치, 기본 생활비만 조정)
function maxSpend(p, R) {
  const ok = s => simulate(Object.assign({}, p, { spend: s }), R).depl == null;
  if (!ok(0)) return 0;
  let lo = 0, hi = Math.max(p.spend, 1e6) * 2;
  while (ok(hi) && hi < 1e11) hi *= 2;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; }
  return lo;
}

if (typeof module !== 'undefined') module.exports = { simulate, freedomAge, maxSpend, annuity12 };
