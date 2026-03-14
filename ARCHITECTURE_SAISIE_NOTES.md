# 🏗️ ARCHITECTURE DU COMPOSANT SAISIE DE NOTES

> Diagrammes et schémas explicatifs de l'architecture complète

---

## 📊 SCHÉMA GÉNÉRAL DE L'ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAISIE NOTE COMPONENT                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    TEMPLATE HTML                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │  Filtres   │  │  Tableau   │  │  Actions   │         │  │
│  │  │  Cascade   │  │  Notes     │  │  Export    │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              COMPONENT TYPESCRIPT                        │  │
│  │  • Signals (state management)                            │  │
│  │  • Reactive Forms (FormGroup + FormArray)                │  │
│  │  • Computed (statistiques, pagination, recherche)        │  │
│  │  • Effects (auto-fermeture messages)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   STYLES SCSS                            │  │
│  │  • Design System (CSS Variables)                         │  │
│  │  • Animations (fadeIn, slideIn)                          │  │
│  │  • Responsive (mobile-first)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                   SAISIE NOTES SERVICE                          │
│  • chargerDonneesInitiales() → forkJoin                        │
│  • filtrerClassesPourMatiere()                                 │
│  • getEtudiantsAvecNotes()                                     │
│  • saisirOuMettreAJourNotes()                                  │
│  • aLeDroitDacceder() → Sécurité                              │
└─────────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                │
│  GET  /api/v1/enseignant/pedagogie/enseignements               │
│  GET  /api/v1/referentiel/matieres                             │
│  GET  /api/v1/referentiel/classes                              │
│  GET  .../classes/{id}/matieres/{id}/notes                     │
│  POST .../classes/{id}/matieres/{id}/notes                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 WORKFLOW DU FILTRAGE EN CASCADE

```
┌─────────────────────────────────────────────────────────────────┐
│                   FILTRAGE EN CASCADE (4 NIVEAUX)               │
└─────────────────────────────────────────────────────────────────┘

ÉTAPE 1 : Sélection MATIÈRE
┌───────────────────────────────────────────────┐
│  USER sélectionne Matière                    │
│             ↓                                 │
│  onMatiereChange()                            │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 1. Filtre CLASSES disponibles           │ │
│  │    → filtrerClassesPourMatiere()        │ │
│  │    → classes.set([...])                 │ │
│  │    → ACTIVE champ Classe                │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 2. Auto-remplit SEMESTRE                │ │
│  │    → Récupère matiere.ue.semestreId     │ │
│  │    → semestreId.setValue(...)           │ │
│  │    → semestres.set([semestre])          │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  Reset Classe, Année, Notes                  │
└───────────────────────────────────────────────┘
                ↓

ÉTAPE 2 : Sélection CLASSE
┌───────────────────────────────────────────────┐
│  USER sélectionne Classe                     │
│             ↓                                 │
│  onClasseChange()                             │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 1. Trouve Enseignement actif            │ │
│  │    → find(matiere + classe)             │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 2. Auto-remplit ANNÉE ACADÉMIQUE        │ │
│  │    → anneeId.setValue(ens.anneeId)      │ │
│  │    → annees.set([annee])                │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  Reset Notes                                  │
└───────────────────────────────────────────────┘
                ↓

ÉTAPE 3 : VALIDATION
┌───────────────────────────────────────────────┐
│  Vérification des 4 champs :                 │
│  ✓ Matière                                   │
│  ✓ Classe                                    │
│  ✓ Année Académique (auto)                   │
│  ✓ Semestre (auto)                           │
│             ↓                                 │
│  form.valid === true                         │
│             ↓                                 │
│  Bouton "Charger" ACTIVÉ                     │
└───────────────────────────────────────────────┘
                ↓

ÉTAPE 4 : CHARGEMENT
┌───────────────────────────────────────────────┐
│  USER clique "Charger"                       │
│             ↓                                 │
│  chargerNotes()                               │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 1. Vérification droits d'accès          │ │
│  │    → aLeDroitDacceder()                 │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 2. Appel API                            │ │
│  │    → GET .../notes?anneeId&semestreId   │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  ┌─────────────────────────────────────────┐ │
│  │ 3. Construction FormArray               │ │
│  │    → construireFormArray(lignes)        │ │
│  │    → lignesForm.push(...)               │ │
│  └─────────────────────────────────────────┘ │
│             ↓                                 │
│  Affichage TABLEAU + STATISTIQUES             │
└───────────────────────────────────────────────┘
```

---

## 📋 STRUCTURE DU FORMARRAY

```
FormGroup (form)
│
├─ matiereId: FormControl (required)
│
├─ classeId: FormControl (required, disabled initialement)
│
├─ anneeAcademiqueId: FormControl (required, auto-rempli)
│
├─ semestreId: FormControl (required, auto-rempli)
│
└─ lignes: FormArray
    │
    ├─ FormGroup[0] (Étudiant 1)
    │   ├─ etudiantId: number (required)
    │   ├─ nomPrenom: string (disabled)
    │   ├─ noteDevoir: number | null (min: 0, max: 20)
    │   ├─ noteSessionOrdinaire: number | null (min: 0, max: 20)
    │   ├─ noteSessionRattrapage: number | null (min: 0, max: 20)
    │   └─ valeur: number | null (disabled, calculé backend)
    │
    ├─ FormGroup[1] (Étudiant 2)
    │   └─ ...
    │
    └─ FormGroup[N] (Étudiant N)
        └─ ...
```

---

## 🔄 FLUX D'ENREGISTREMENT DES NOTES

```
1. USER saisit les notes dans le formulaire
                ↓
2. USER clique "Enregistrer"
                ↓
   ┌─────────────────────────────────────┐
   │ enregistrer()                       │
   └─────────────────────────────────────┘
                ↓
3. Vérification : peutEnregistrer()
   • form.valid?
   • lignesForm.valid?
   • lignes.length > 0?
                ↓ OUI
4. Construction du payload
   ┌─────────────────────────────────────┐
   │ lignesAEnregistrer: LigneNote[]     │
   │   = lignesForm.map(ctrl => ({       │
   │       etudiantId,                   │
   │       noteDevoir,                   │
   │       noteSessionOrdinaire,         │
   │       noteSessionRattrapage         │
   │     }))                             │
   └─────────────────────────────────────┘
                ↓
5. Appel Service
   ┌─────────────────────────────────────┐
   │ construireSaisieNotes(...)          │
   │   → {                               │
   │       classeId,                     │
   │       matiereId,                    │
   │       anneeAcademiqueId,            │
   │       semestreId,                   │
   │       lignes: [...]                 │
   │     }                               │
   └─────────────────────────────────────┘
                ↓
6. Requête HTTP POST
   ┌─────────────────────────────────────┐
   │ POST /api/.../notes                 │
   │ Headers: Bearer token               │
   │ Body: SaisieNotes                   │
   └─────────────────────────────────────┘
                ↓
7. Réponse Backend
   ┌─────────────────────────────────────┐
   │ { message: "Notes enregistrées" }   │
   └─────────────────────────────────────┘
                ↓
8. Actions post-enregistrement
   • Affichage message de succès
   • Rechargement des notes (pour valeur calculée)
   • Auto-fermeture message après 5s
```

---

## 📥 FLUX D'IMPORT EXCEL/CSV

```
1. USER clique "Importer"
                ↓
2. Sélection fichier (Excel ou CSV)
                ↓
   ┌─────────────────────────────────────┐
   │ importerFichier(event)              │
   │   • Validation extension            │
   │   • FileReader                      │
   └─────────────────────────────────────┘
                ↓
3. Lecture du fichier
   ┌─────────────────────────────────────┐
   │ XLSX.read(data, {type: 'binary'})   │
   │   → Workbook                        │
   │   → Sheet                           │
   │   → Rows: any[]                     │
   └─────────────────────────────────────┘
                ↓
4. Traitement des données
   ┌─────────────────────────────────────┐
   │ traiterImport(rows)                 │
   │                                     │
   │ Pour chaque ligne :                 │
   │   1. Normaliser nom                 │
   │   2. Trouver index dans FormArray   │
   │   3. patchValue() sur formGroup     │
   │   4. Incrémenter compteurs          │
   └─────────────────────────────────────┘
                ↓
5. Affichage résultat
   ┌─────────────────────────────────────┐
   │ "Import terminé :                   │
   │  X ligne(s) importée(s),            │
   │  Y ignorée(s)"                      │
   └─────────────────────────────────────┘
                ↓
6. Reset input file
```

**Algorithme de Matching :**
```typescript
// Création d'une Map : nomNormalisé → index FormArray
const map = new Map<string, number>();
lignes.forEach((ligne, index) => {
  const nom = normaliserNom(ligne.nomPrenom);
  map.set(nom, index);
});

// Pour chaque ligne Excel/CSV
rows.forEach(row => {
  const nom = normaliserNom(row['Étudiant']);
  
  if (map.has(nom)) {
    const index = map.get(nom);
    const formGroup = lignesForm.at(index);
    formGroup.patchValue({...});
    nbImportes++;
  } else {
    nbIgnores++;
  }
});
```

---

## 📤 FLUX D'EXPORT (Excel/CSV/PDF)

### Export Excel
```
1. Préparation des données
   ┌─────────────────────────────────────┐
   │ preparerDonneesExport()             │
   │   → Array d'objets clé-valeur       │
   │      {                              │
   │        'N°': 1,                     │
   │        'Étudiant': 'DUPONT Jean',   │
   │        'Note Devoir': '15.50',      │
   │        ...                          │
   │      }                              │
   └─────────────────────────────────────┘
                ↓
2. Conversion en Worksheet
   ┌─────────────────────────────────────┐
   │ XLSX.utils.json_to_sheet(donnees)   │
   │   → ws (Worksheet)                  │
   └─────────────────────────────────────┘
                ↓
3. Configuration colonnes
   ┌─────────────────────────────────────┐
   │ ws['!cols'] = [                     │
   │   { wch: 5 },   // N°              │
   │   { wch: 30 },  // Étudiant        │
   │   { wch: 15 },  // Devoir          │
   │   ...                               │
   │ ]                                   │
   └─────────────────────────────────────┘
                ↓
4. Création Workbook
   ┌─────────────────────────────────────┐
   │ XLSX.utils.book_new()               │
   │ XLSX.utils.book_append_sheet(...)   │
   └─────────────────────────────────────┘
                ↓
5. Téléchargement
   ┌─────────────────────────────────────┐
   │ XLSX.writeFile(wb, filename)        │
   │   → Téléchargement automatique      │
   └─────────────────────────────────────┘
```

### Export PDF avec jsPDF
```
1. Initialisation
   ┌─────────────────────────────────────┐
   │ const doc = new jsPDF();            │
   └─────────────────────────────────────┘
                ↓
2. En-tête
   ┌─────────────────────────────────────┐
   │ doc.text('RELEVÉ DE NOTES', ...)    │
   │ Classe, Matière, Année, Semestre    │
   └─────────────────────────────────────┘
                ↓
3. Tableau avec autoTable
   ┌─────────────────────────────────────┐
   │ autoTable(doc, {                    │
   │   head: [...],                      │
   │   body: [...],                      │
   │   theme: 'grid',                    │
   │   headStyles: {...}                 │
   │ })                                  │
   └─────────────────────────────────────┘
                ↓
4. Statistiques
   ┌─────────────────────────────────────┐
   │ doc.text('Moyenne: ...')            │
   │ doc.text('Taux réussite: ...')      │
   └─────────────────────────────────────┘
                ↓
5. Téléchargement
   ┌─────────────────────────────────────┐
   │ doc.save(filename)                  │
   └─────────────────────────────────────┘
```

---

## 🖨️ FLUX D'IMPRESSION

```
1. USER clique "Imprimer"
                ↓
2. Génération PDF identique à Export PDF
   (mais avec thème 'striped')
                ↓
3. SPÉCIFICITÉ : Auto-Print
   ┌─────────────────────────────────────┐
   │ doc.autoPrint();                    │
   │ window.open(                        │
   │   doc.output('bloburl'),            │
   │   '_blank'                          │
   │ );                                  │
   └─────────────────────────────────────┘
                ↓
4. Fenêtre d'impression s'ouvre automatiquement
```

---

## 📊 CALCUL DES STATISTIQUES (Computed Signal)

```typescript
statistiques = computed(() => {
  
  // 1. Récupération des lignes
  const lignes = this.lignes(); // Signal
  if (!lignes.length) return null;
  
  // 2. Extraction des notes finales (non-nulles)
  const notesFinales = lignes
    .map(l => l.valeur)
    .filter((v): v is number => v != null);
  
  if (!notesFinales.length) return null;
  
  // 3. Calculs
  const moyenne = notesFinales.reduce((a, b) => a + b, 0) / notesFinales.length;
  const admis = notesFinales.filter(n => n >= 10).length;
  const min = Math.min(...notesFinales);
  const max = Math.max(...notesFinales);
  
  // 4. Retour
  return {
    moyenne: moyenne.toFixed(2),
    admis,
    total: notesFinales.length,
    tauxReussite: ((admis / notesFinales.length) * 100).toFixed(1),
    min: min.toFixed(2),
    max: max.toFixed(2)
  };
});
```

**Avantages des Computed Signals :**
- ✅ Recalcul automatique dès que `lignes()` change
- ✅ Pas de souscription manuelle
- ✅ Pas de memory leaks
- ✅ Performance optimisée (memoization)

---

## 🔍 RECHERCHE ET PAGINATION (Computed Signals)

```
┌──────────────────────────────────────────────────────────┐
│                    FLUX DE DONNÉES                       │
└──────────────────────────────────────────────────────────┘

lignes (Signal source)             searchTerm (Signal)
    [100 étudiants]                     "Dupont"
           │                                │
           └────────────┬───────────────────┘
                        │
                        ↓
            ┌───────────────────────┐
            │  filteredLignes()     │
            │  (Computed Signal)    │
            │                       │
            │  lignes.filter(l =>   │
            │    l.nomPrenom        │
            │      .includes(term)  │
            │  )                    │
            └───────────────────────┘
                        │
                        ↓ [5 étudiants]
                        │
            page (Signal) = 1      pageSize = 10
                        │
                        ↓
            ┌───────────────────────┐
            │  paginatedLignes()    │
            │  (Computed Signal)    │
            │                       │
            │  slice(start, end)    │
            └───────────────────────┘
                        │
                        ↓ [5 étudiants] (page 1)
                        │
                    AFFICHAGE

┌──────────────────────────────────────────────────────────┐
│  EXEMPLE CONCRET                                         │
└──────────────────────────────────────────────────────────┘

lignes() = [
  { nomPrenom: 'DUPONT Jean', ... },
  { nomPrenom: 'MARTIN Sophie', ... },
  { nomPrenom: 'DUPOND Marie', ... },
  { nomPrenom: 'DURAND Luc', ... },
  ... (96 autres)
]

searchTerm() = "Dupont"
        ↓
filteredLignes() = [
  { nomPrenom: 'DUPONT Jean', ... },
  { nomPrenom: 'DUPOND Marie', ... }
] // 2 résultats

page() = 1, pageSize = 10
        ↓
paginatedLignes() = [
  { nomPrenom: 'DUPONT Jean', ... },
  { nomPrenom: 'DUPOND Marie', ... }
] // Tous sur page 1

totalPages() = Math.ceil(2 / 10) = 1
```

---

## 🔐 VÉRIFICATION DES DROITS D'ACCÈS

```
┌──────────────────────────────────────────────────────────┐
│  aLeDroitDacceder(enseignements, matiereId, classeId,    │
│                   anneeId)                               │
└──────────────────────────────────────────────────────────┘

enseignements = [
  {
    id: 1,
    matiereId: 10,
    classeId: 5,
    anneeAcademiqueId: 3,
    actif: true
  },
  {
    id: 2,
    matiereId: 12,
    classeId: 5,
    anneeAcademiqueId: 3,
    actif: true
  },
  ...
]

⬇️ Vérification

return enseignements.some(e =>
  e.matiereId === matiereId &&      // ✓ Matière correspond
  e.classeId === classeId &&        // ✓ Classe correspond
  e.anneeAcademiqueId === anneeId &&// ✓ Année correspond
  e.actif !== false                 // ✓ Enseignement actif
);

EXEMPLE :
• matiereId = 10, classeId = 5, anneeId = 3
  → TRUE (enseignement[0] match)

• matiereId = 99, classeId = 5, anneeId = 3
  → FALSE (aucun enseignement avec matiereId=99)
```

---

## 💬 GESTION DES MESSAGES (Effects)

```typescript
// Dans le constructeur
effect(() => {
  // 1. Vérification message succès
  if (this.messageSucces()) {
    setTimeout(() => {
      this.messageSucces.set(null);
    }, 5000); // Auto-fermeture après 5s
  }
  
  // 2. Vérification message erreur
  if (this.messageErreur()) {
    setTimeout(() => {
      this.messageErreur.set(null);
    }, 5000); // Auto-fermeture après 5s
  }
});
```

**Timeline :**
```
T=0s   : messageSucces.set('Notes enregistrées')
         → Effect déclenché
         → setTimeout(5000) lancé
         
T=0-5s : Message visible avec animation

T=5s   : setTimeout callback exécuté
         → messageSucces.set(null)
         → Message disparaît avec animation
```

---

## 📡 COMMUNICATION AVEC LE BACKEND

### Initialisation (ForkJoin)
```
chargerDonneesInitiales()
          │
          ↓
   ┌──────────────────────────────────────┐
   │ forkJoin({                           │
   │   enseignements: GET /enseignements, │
   │   matieres: GET /matieres,           │
   │   classes: GET /classes,             │
   │   annees: GET /annees-academiques,   │
   │   semestres: GET /semestres          │
   │ })                                   │
   └──────────────────────────────────────┘
          │
          ↓ (Parallèle, attend toutes les réponses)
   ┌──────────────────────────────────────┐
   │ {                                    │
   │   enseignements: [...],              │
   │   matieres: [...],                   │
   │   classes: [...],                    │
   │   annees: [...],                     │
   │   semestres: [...]                   │
   │ }                                    │
   └──────────────────────────────────────┘
          │
          ↓
  initialiserDonnees(data)
```

### Chargement des Notes
```
Request:
  GET /api/v1/enseignant/pedagogie/
      classes/5/matieres/10/notes
      ?anneeAcademiqueId=3&semestreId=1
      
  Headers:
    Authorization: Bearer eyJhbGc...
    Content-Type: application/json

Response:
  [
    {
      etudiantId: 101,
      nomPrenom: "DUPONT Jean",
      noteDevoir: 15.5,
      noteSessionOrdinaire: 16.0,
      noteSessionRattrapage: null,
      valeur: 15.75
    },
    ...
  ]
```

### Enregistrement des Notes
```
Request:
  POST /api/v1/enseignant/pedagogie/
       classes/5/matieres/10/notes
       
  Headers:
    Authorization: Bearer eyJhbGc...
    Content-Type: application/json
  
  Body:
    {
      "classeId": 5,
      "matiereId": 10,
      "anneeAcademiqueId": 3,
      "semestreId": 1,
      "lignes": [
        {
          "etudiantId": 101,
          "noteDevoir": 15.5,
          "noteSessionOrdinaire": 16.0,
          "noteSessionRattrapage": null
        },
        ...
      ]
    }

Response:
  {
    "message": "Notes enregistrées avec succès"
  }
```

---

## 🎨 DESIGN SYSTEM - CSS VARIABLES

```scss
:root {
  // Couleurs principales
  --saisie-primary: #6366f1;      // Indigo
  --saisie-success: #10b981;      // Emerald
  --saisie-danger: #ef4444;       // Red
  --saisie-warning: #f59e0b;      // Amber
  --saisie-info: #3b82f6;         // Blue
  
  // Ombres (Material Design inspired)
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  // Rayons de bordure
  --radius-sm: 0.375rem;  // 6px
  --radius-md: 0.5rem;    // 8px
  --radius-lg: 0.75rem;   // 12px
  --radius-xl: 1rem;      // 16px
  --radius-2xl: 1.5rem;   // 24px
  
  // Transitions
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Application :**
```scss
.btn-primary {
  background: linear-gradient(
    135deg,
    var(--saisie-primary) 0%,
    var(--saisie-primary-dark) 100%
  );
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
┌────────────────────────────────────────────────────────┐
│  DESKTOP (> 992px)                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐        │
│  │ Stat 1   │ Stat 2   │ Stat 3   │ Stat 4   │        │
│  └──────────┴──────────┴──────────┴──────────┘        │
│  ┌─────────────────────────────────────────────┐      │
│  │     Tableau complet (6 colonnes)            │      │
│  └─────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  TABLET (768px - 992px)                                │
│  ┌──────────────────┬──────────────────┐              │
│  │ Stat 1           │ Stat 2           │              │
│  ├──────────────────┼──────────────────┤              │
│  │ Stat 3           │ Stat 4           │              │
│  └──────────────────┴──────────────────┘              │
│  ┌─────────────────────────────────────────────┐      │
│  │ Tableau adapté (scroll horizontal)          │      │
│  └─────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  MOBILE (< 768px)                                      │
│  ┌──────────────────────────────────────────────┐     │
│  │ Stat 1                                       │     │
│  ├──────────────────────────────────────────────┤     │
│  │ Stat 2                                       │     │
│  ├──────────────────────────────────────────────┤     │
│  │ Stat 3                                       │     │
│  ├──────────────────────────────────────────────┤     │
│  │ Stat 4                                       │     │
│  └──────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────┐     │
│  │ [Bouton Charger]                             │     │
│  ├──────────────────────────────────────────────┤     │
│  │ [Bouton Enregistrer]                         │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 RÉSUMÉ DES PATTERNS UTILISÉS

| Pattern | Usage | Bénéfice |
|---------|-------|----------|
| **Signals** | État réactif | Pas de souscription manuelle |
| **Computed** | Dérivation de données | Memoization automatique |
| **Effects** | Side effects | Auto-fermeture messages |
| **Reactive Forms** | Validation | Type-safe |
| **FormArray** | Lignes dynamiques | Ajout/suppression facile |
| **ForkJoin** | Appels parallèles | Performance |
| **Pipes (takeUntil)** | Désabonnement | Pas de memory leaks |
| **Services** | Logique métier | Séparation des responsabilités |

---

**🎉 FIN DE LA DOCUMENTATION D'ARCHITECTURE**

Pour toute question, référez-vous à la documentation complète dans `DOCUMENTATION_SAISIE_NOTES.md`
