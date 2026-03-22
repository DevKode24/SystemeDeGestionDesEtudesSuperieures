import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* ================= AUTH ================= */
import { LoginComponent } from './auth/login/login.component';

/* ================= LAYOUT ================= */
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';

/* ================= MÉTIER ================= */
import { EnseignantComponent } from './components/enseignant/enseignant.component';
import { AnneeAcademiqueComponent } from './components/anneeAcademique/annee-academique-list/annee-academique-list.component';

/* ================= GUARDS ================= */
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { SemestreComponent } from './components/semestre/semestre/semestre.component';
import { FiliereComponent } from './components/filiere/filiere/filiere.component';
import { NiveauComponent } from './components/niveau/niveau/niveau.component';
import { ClasseComponent } from './components/classe/classe/classe.component';
import { EnseignementComponent } from './components/enseignement/enseignement/enseignement.component';
import { MatiereComponent } from './components/matiere/matiere/matiere.component';
import { UeComponent } from './components/ue/ue.component';
import { EtudiantComponent } from './components/etudiant/etudiant.component';
import { StatistiquesComponent } from './components/statistiques/statistiques.component';
import { SaisieNoteComponent } from './components/enseignant/saisie-note/saisie-note.component';
import { RelevenoteComponent } from './components/relevenote/relevenote.component';
import { BulletinComponent } from './components/bulletin/bulletin.component';
import { VerrouilleNoteComponent } from './components/verrouille-note/verrouille-note.component';
import { InfoEtudiantComponent } from './components/etudiant/info-etudiant/info-etudiant.component';
import { UserComponent } from './components/user/user.component';
import { TypeFraisComponent } from './components/facturation/type-frais/type-frais.component';
import { FraisAcademiquesComponent } from './components/facturation/frais-academiques/frais-academiques.component';
import { FacturesEtudiantComponent } from './components/facturation/factures-etudiant/factures-etudiant.component';
import { PaiementsEtudiantComponent } from './components/facturation/paiements-etudiant/paiements-etudiant.component';
import { AjustementsEtudiantComponent } from './components/facturation/ajustements-etudiant/ajustements-etudiant.component';
import { JournalComptableComponent } from './components/facturation/journal-comptable/journal-comptable.component';
import { SituationFinanciereEtudiantComponent } from './components/facturation/situation-financiere-etudiant/situation-financiere-etudiant.component';
import { StatistiqueFinanciereEtudiantComponent } from './components/facturation/statistique-financiere-etudiant/statistique-financiere-etudiant.component';
import { EcheanciersPaiementComponent } from './components/facturation/echeanciers-paiement/echeanciers-paiement.component';

const routes: Routes = [

  /* ========= AUTH ========= */
  {
    path: 'login',
    component: LoginComponent
  },
   {
    path: '',
    component: LoginComponent
  },

  /* ========= DASHBOARD ========= */
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [

      /* ----- DEFAULT ----- */
      {
        path: '',
         component: StatistiquesComponent,
        pathMatch: 'full'
      },

      /* ========= SCOLARITÉ ========= */
      {
        path: 'scolarite',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SCOLARITE'] },
        children: [
          {
            path: 'Anneeacademique',
            component: AnneeAcademiqueComponent
          },{
            path: 'semestres',
            component: SemestreComponent
          },
          {
            path: 'filiere',
            component: FiliereComponent
          },
          {
            path: 'niveau',
            component: NiveauComponent
          },
          {
            path: 'salles',
            component: ClasseComponent
          },
          {
            path: 'enseignements',
            component: EnseignementComponent
          },
          {
            path: 'matieres',
            component: MatiereComponent
          },
          {
            path: 'VerrouilleNote',
            component: VerrouilleNoteComponent
          },
          {
            path: 'ues',
            component: UeComponent
          },
          {
            path: 'etudiants',
            component: EtudiantComponent
          },
          {
            path: 'etudiant/info/:id',
            component: InfoEtudiantComponent
          },{
            path: 'utilisateurs',
            component: UserComponent
          },
          {
            path: 'enseignant',
            component: EnseignantComponent
          },
          {
            path: 'bulletin',
            component: BulletinComponent
          }
        ]
      },
         /* ========= FACTURATION ========= */
      {
        path: 'facturation',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SCOLARITE'] },
        children: [
          // 1. Configuration des frais
          { path: 'type-frais', component: TypeFraisComponent },
          { path: 'frais-academiques', component: FraisAcademiquesComponent }, 

          // 2. Facturation, paiements, ajustements, journal
          { path: 'factures', component: FacturesEtudiantComponent }, 
          { path: 'paiements', component: PaiementsEtudiantComponent }, 
          { path: 'ajustements', component: AjustementsEtudiantComponent },
          { path: 'journal', component: JournalComptableComponent }, 

          // 3. Situations et statistiques
          { path: 'situation-financiere', component: SituationFinanciereEtudiantComponent }, // situation étudiant
          { path: 'statistiques', component: StatistiqueFinanciereEtudiantComponent }, // stats financières
          { path: 'echeanciers', component: EcheanciersPaiementComponent }, // echeanciers de paiement
        ],
      },

      /* ========= ENSEIGNANT ========= */
      {
        path: 'enseignant',
        canActivate: [roleGuard],
        data: { roles: ['ENSEIGNANT'] },
        children: [

          // APRÈS — aligner avec ce que relevenote appelle
            { path: 'saisie-note', component: SaisieNoteComponent },
          // exemple futur
          { path: 'relevenotes', component: RelevenoteComponent }
          
        ]
      },

      /* ========= ETUDIANT ========= */
      {
        path: 'etudiant',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ETUDIANT'] },
        children: [
          // consultation notes, inscription, emploi du temps…
        ]
      }
    ]
  },

  /* ========= REDIRECTIONS ========= */
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
