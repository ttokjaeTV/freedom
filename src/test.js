const E=require('./engine.js');
const base={age:60,endAge:89,inf:0.025,inv0:0,cash0:0,income:0,incG:0,spend:36e6,chg:[],lumps:[],nps:0,npsAge:99,priv:0,privAge:99,privYears:0,rPre:0.05,rPost:0.05,rCash:0.05,cost:0,crash:false,rec:{on:false},doom:{on:false},safe:{on:false}};
// 1) 필요 자산 (평균 수익률 가정): 30년 매년 초 인출, 물가만큼 증가
let pv=0; for(let k=0;k<30;k++) pv+=36e6*Math.pow(1.025/1.05,k);
const r=E.simulate({...base,inv0:pv},60);
console.log('PV',Math.round(pv),'last end',Math.round(r.rows.at(-1).end),'depl',r.depl,'rows',r.rows.length);
const r2=E.simulate({...base,inv0:pv*0.999},60); console.log('slightly less -> depl',r2.depl);
// 2) 적립: 1년 월 100만 적립, 연 6% → FV = 100만*annuity12(m)
const m=Math.pow(1.06,1/12)-1; const fv=1e6*E.annuity12(m);
const r3=E.simulate({...base,age:40,endAge:40,income:12e6,spend:0,rPre:0.06,rPost:0.06},99);
console.log('FV formula',Math.round(fv),'engine',Math.round(r3.rows[0].end));
// 3) 혼합: 투자 75%/현금 25%, 무흐름 1년
const r4=E.simulate({...base,age:40,endAge:40,inv0:3e8,cash0:1e8,spend:0,rPre:0.06,rCash:0.02},99);
console.log('mix',Math.round(r4.rows[0].end),'expect',3e8*1.06+1e8*1.02);
// 4) 기본값 시나리오
const d={age:45,endAge:95,inf:0.025,inv0:3e8,cash0:1e8,income:72e6,incG:0.03,spend:42e6,chg:[],lumps:[],nps:18e6,npsAge:65,priv:0,privAge:60,privYears:20,rPre:0.06,rPost:0.04,rCash:0.025,cost:0,crash:false,rec:{on:false,cycle:8,drop:0.3},doom:{on:false,age:70,drop:0.5,cut:0.2},safe:{on:false,age:80,r:0.03}};
console.log('FI age',E.freedomAge(d,80),'60 depl',E.simulate(d,60).depl,'retireAssets60',Math.round(E.simulate(d,60).retireAssets/1e4),'max spend@60',Math.round(E.maxSpend(d,60)/12/1e4));
console.log('with rec',E.freedomAge({...d,rec:{on:true,cycle:8,drop:0.3}},80),'crash',E.freedomAge({...d,crash:true},80));
