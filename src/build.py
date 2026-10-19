"""src/ → index.html 빌드:  python src/build.py"""
from pathlib import Path
S = Path(__file__).parent
t = (S / 'template.html').read_text(encoding='utf-8')
eng = (S / 'engine.js').read_text(encoding='utf-8').replace("if (typeof module !== 'undefined') module.exports = { simulate, freedomAge, maxSpend, annuity12 };\n", '')
t = t.replace('/*__PF_CSS__*/', (S / 'pf.css').read_text(encoding='utf-8').rstrip('\n'))
t = t.replace('/*__PF_MODULE__*/', (S / 'pf-module.js').read_text(encoding='utf-8').rstrip('\n'))
t = t.replace('/*__ENGINE__*/', eng)
t = t.replace("$('foot-date').textContent = `계산 기준: 입력값 · 페이지 ${new Date().toISOString().slice(0, 10)} 열람`;", "$('foot-date').textContent = '2026-10-19 제작';")
assert '/*__' not in t
(S.parent / 'index.html').write_text(t, encoding='utf-8')
print('index.html', len(t))
