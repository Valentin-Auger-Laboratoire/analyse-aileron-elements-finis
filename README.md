# Analyse d'un aileron arrière par éléments finis

🇫🇷 [Français](#français) · 🇬🇧 [English](#english)

**Essayer l'outil :** https://valentin-auger-laboratoire.github.io/portfolio/outils/aileron/

---

## Français

### Ce que fait l'outil
Outil web d'analyse structurelle d'un aileron arrière de voiture, en HTML / CSS / JavaScript pur (solveur, dessins et diagrammes écrits à la main, aucune bibliothèque).

1. **Charge aérodynamique** : l'appui F = ½·ρ·v²·S·Cl est calculé à partir de la vitesse, de la surface (envergure × corde) et du coefficient d'appui, puis réparti sur l'envergure (elliptique ou uniforme). Le poids propre est ajouté.
2. **Section** : profil **NACA 4 chiffres**, plein ou creux (peau d'épaisseur donnée). L'aire, le centre de gravité et le moment quadratique sont obtenus par intégration numérique du profil.
3. **Éléments finis** : l'aileron est une poutre d'Euler-Bernoulli découpée en environ 160 éléments à deux nœuds (flèche et rotation par nœud), posée en **appui simple** ou **encastrée** sur deux supports. Le système K·u = F est assemblé puis résolu par élimination de Gauss.
4. **Résultats** :
   - **réactions aux supports** (et moments d'encastrement) ;
   - diagrammes de **charge, effort tranchant, moment fléchissant et flèche**, avec survol synchronisé ;
   - **déformée amplifiée** colorée selon la contrainte, comme dans un logiciel de simulation ;
   - **contrainte maximale** σ = M·y / I et **coefficient de sécurité** par rapport à la limite élastique du matériau (aluminium, carbone, acier, PLA imprimé) ;
   - avertissements : plastification, marge faible, flèche excessive, porte-à-faux trop longs.

### Validation
Les tests comparent le solveur aux formules de la résistance des matériaux, à moins de 10⁻⁶ près :

| Cas | Flèche | Moment |
|---|---|---|
| Poutre sur deux appuis, charge uniforme | 5wL⁴ / 384EI | wL² / 8 |
| Poutre encastrée aux deux bouts | wL⁴ / 384EI | wL² / 24 au milieu, −wL² / 12 aux encastrements |
| Deux appuis avec porte-à-faux a | wl²(5l² − 24a²) / 384EI | −wa² / 2 sur appui |

Ils vérifient aussi l'aire d'un profil NACA 0012 (0,685·t·c²), l'équilibre des forces et la détection de la rupture.

### Fichiers
| Fichier | Rôle |
|---|---|
| `aileron.js` | Moteur : profil NACA, section, solveur éléments finis, post-traitement (testable avec Node) |
| `index.html` | Interface, bilingue FR / EN |
| `tests/test.js` | Tests de validation |

```bash
node tests/test.js
```

### Limites
Modèle poutre 1D : pas de torsion, pas de flambement de la peau, pas de concentration de contraintes aux fixations (la contrainte locale près des vis est plus élevée) ; Cl supposé constant ; supports parfaitement rigides ; caractéristiques des matériaux indicatives. Ce n'est pas un maillage 3D comme dans SolidWorks Simulation, mais la même méthode appliquée à un modèle simplifié.

---

## English

### What the tool does
Web tool for the structural analysis of a car rear wing, in plain HTML / CSS / JavaScript (hand-written solver, drawings and diagrams, no library).

1. **Aerodynamic load**: downforce F = ½·ρ·v²·S·Cl from speed, area (span × chord) and downforce coefficient, distributed along the span (elliptic or uniform), plus self-weight.
2. **Section**: **4-digit NACA** profile, solid or hollow (given skin thickness); area, centroid and second moment of area by numerical integration.
3. **Finite elements**: the wing is an Euler-Bernoulli beam split into about 160 two-node elements (deflection and rotation per node), **pinned** or **clamped** on two supports; K·u = F is assembled and solved by Gaussian elimination.
4. **Results**: **support reactions** (and fixed-end moments), **load, shear, bending moment and deflection** diagrams with synchronised hover, **magnified deformed shape** coloured by stress, **maximum stress** σ = M·y / I and **safety factor** against the material yield strength (aluminium, carbon, steel, printed PLA), and warnings.

### Validation
The tests compare the solver with classic beam formulas (simply supported, clamped-clamped, overhanging supports) to within 10⁻⁶, and also check the NACA 0012 area, force equilibrium and failure detection.

### Files
| File | Purpose |
|---|---|
| `aileron.js` | Engine: NACA profile, section, finite element solver, post-processing (testable with Node) |
| `index.html` | User interface, bilingual FR / EN |
| `tests/test.js` | Validation tests |

```bash
node tests/test.js
```

### Limitations
1D beam model: no torsion, no skin buckling, no stress concentration at the mounts (local stress near the bolts is higher); constant Cl; perfectly rigid supports; indicative material properties. It is not a 3D mesh like SolidWorks Simulation, but the same method applied to a simplified model.
