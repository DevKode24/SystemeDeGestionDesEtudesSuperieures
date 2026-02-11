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
            path: 'ues',
            component: UeComponent
          },
          {
            path: 'etudiants',
            component: EtudiantComponent
          },
          {
            path: 'enseignant',
            component: EnseignantComponent
          }
        ]
      },

      /* ========= ENSEIGNANT ========= */
      {
        path: 'enseignant',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ENSEIGNANT'] },
        children: [
          // exemple futur
          // { path: 'ReleveNotes', component: ReleveNotesComponent }
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
