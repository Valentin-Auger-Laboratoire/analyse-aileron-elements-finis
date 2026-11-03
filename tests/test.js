// Tests du moteur d'analyse par éléments finis : node tests/test.js
const assert = require('assert');
const A = require('../aileron.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b)), msg + ' : ' + a + ' au lieu de ' + b);

const L = 2, EI = 1e4, w = 1000, n = 100;
const nodes = [...Array(n + 1)].map((_, i) => (L * i) / n);
const at = (ns, x) => ns.findIndex((v) => Math.abs(v - x) < 1e-9);

// 1. Poutre sur deux appuis, charge uniforme : f = 5wL⁴/384EI, M = wL²/8, R = wL/2
let fe = A.beamFE(nodes, () => w, [{ x: 0, type: 'pin' }, { x: L, type: 'pin' }], EI);
let f = A.internalForces(nodes, () => w, fe.reactions);
near(fe.v[50], (-5 * w * L ** 4) / (384 * EI), 1e-6, 'flèche, deux appuis');
near(f.M[50], (w * L * L) / 8, 1e-6, 'moment, deux appuis');
fe.reactions.forEach((r) => near(r.F, (w * L) / 2, 1e-6, 'réaction'));
assert.ok(Math.abs(f.M[n]) < 1e-3, 'moment nul au bout');

// 2. Poutre encastrée aux deux bouts : f = wL⁴/384EI, M(milieu) = wL²/24, M(encastrement) = −wL²/12
fe = A.beamFE(nodes, () => w, [{ x: 0, type: 'fixed' }, { x: L, type: 'fixed' }], EI);
f = A.internalForces(nodes, () => w, fe.reactions);
near(fe.v[50], (-w * L ** 4) / (384 * EI), 1e-6, 'flèche, encastrée');
near(f.M[50], (w * L * L) / 24, 1e-6, 'moment au milieu, encastrée');
near(f.M[0], (-w * L * L) / 12, 1e-6, "moment d'encastrement");

// 3. Deux appuis avec porte-à-faux a de chaque côté (comme un aileron sur deux supports)
const a = 0.4, l = L - 2 * a;
const n2 = [...new Set([...nodes, a, L - a].map((x) => +x.toFixed(9)))].sort((x, y) => x - y);
fe = A.beamFE(n2, () => w, [{ x: a, type: 'pin' }, { x: +(L - a).toFixed(9), type: 'pin' }], EI);
f = A.internalForces(n2, () => w, fe.reactions);
near(fe.v[at(n2, 1)], (-w * l * l * (5 * l * l - 24 * a * a)) / (384 * EI), 1e-6, 'flèche au milieu, porte-à-faux');
near(f.M[at(n2, a)], (-w * a * a) / 2, 1e-6, 'moment sur appui, porte-à-faux');
near(f.M[at(n2, 1)], (w * l * l) / 8 - (w * a * a) / 2, 1e-6, 'moment au milieu, porte-à-faux');

// 4. Section NACA 0012 pleine, corde 1 m : aire ≈ 0,0822 (formule connue 0,685·t·c²)
const s = A.section(A.parseNaca('0012'), 1, 0);
near(s.A, 0.685 * 0.12, 0.01, 'aire NACA 0012');
assert.ok(Math.abs(s.yG) < 1e-9, 'centre de gravité sur la corde (profil symétrique)');
// rectangle équivalent : la peau creuse réduit bien I
const sh = A.section(A.parseNaca('0012'), 1, 0.005);
assert.ok(sh.I < s.I && sh.A < s.A);

// 5. Analyse complète : équilibre (somme des réactions = appui + poids propre), appui = ½ρv²·S·Cl
const r = A.analyse({ span: 1.4, chord: 0.25, naca: '6412', skin: 2, material: 'alu', speed: 200, cl: 1.5, dist: 'elliptic', supportGap: 0.8, support: 'pin' });
assert.ok(r.ok);
near(r.Ftot, 0.5 * 1.225 * (200 / 3.6) ** 2 * 1.4 * 0.25 * 1.5, 1e-12, 'appui aérodynamique');
near(r.reactions.reduce((acc, x) => acc + x.F, 0), r.totalLoad, 1e-3, 'équilibre des forces');
// répartition elliptique : même charge totale que l'uniforme (à la discrétisation près)
const ru = A.analyse({ span: 1.4, chord: 0.25, naca: '6412', skin: 2, material: 'alu', speed: 200, cl: 1.5, dist: 'uniform', supportGap: 0.8, support: 'pin' });
near(r.reactions.reduce((acc, x) => acc + x.F, 0), ru.reactions.reduce((acc, x) => acc + x.F, 0), 2e-3, 'même charge totale');

// 6. Aileron trop léger : rupture détectée
const bad = A.analyse({ span: 1.8, chord: 0.2, naca: '4409', skin: 0.5, material: 'alu', speed: 300, cl: 2, dist: 'elliptic', supportGap: 0.5, support: 'pin' });
assert.ok(bad.issues.some((i) => i.code === 'yield'));
assert.ok(!A.analyse({ span: 1.4, chord: 0.25, naca: '12', skin: 2, material: 'alu', speed: 200, cl: 1.5, dist: 'uniform', supportGap: 0.8, support: 'pin' }).ok);

console.log('OK : tous les tests passent');
