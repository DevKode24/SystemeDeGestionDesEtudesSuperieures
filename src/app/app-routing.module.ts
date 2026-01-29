import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* =======================
   AUTH
======================= */
import { LoginComponent } from './auth/login/login.component';

/* =======================
   LAYOUT
======================= */
import { EnseignantComponent } from './components/enseignant/enseignant.component';
import { AnneeAcademiqueComponent } from './components/anneeAcademique/annee-academique-list/annee-academique-list.component';

const routes: Routes = [

  /* ========= AUTH ========= */
  {
    path: 'login',
    component: LoginComponent
  },

  /* ========= DASHBOARD ========= */
  {
    path: 'dashboard',
    children: [
      {
        path: 'enseignants',
        component: EnseignantComponent
      },
      {
        path: 'annee-academique',
        component: AnneeAcademiqueComponent
      },
      {
        path: '',
        redirectTo: 'enseignants',
        pathMatch: 'full'
      }
    ]
  },

  /* ========= DEFAULT ========= */
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
