import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
/* ===== INTERCEPTOR ===== */
import { AuthInterceptor } from './auth/auth.interceptor';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

/* ===== COMPONENTS ===== */
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { NavbarComponent } from './components/partager/navbar/navbar.component';
import { SidebarComponent } from './components/partager/sidebar/sidebar.component';
import { LoginComponent } from './auth/login/login.component';
import { EnseignantComponent } from './components/enseignant/enseignant.component';


import { CommonModule } from '@angular/common';
import { AnneeAcademiqueComponent } from './components/anneeAcademique/annee-academique-list/annee-academique-list.component';
import { SemestreComponent } from './components/semestre/semestre/semestre.component';
import { NiveauComponent } from './components/niveau/niveau/niveau.component';
import { FiliereComponent } from './components/filiere/filiere/filiere.component';
import { MatiereComponent } from './components/matiere/matiere/matiere.component';
import { NoteComponent } from './components/note/note.component';
import { RelevenoteComponent } from './components/relevenote/relevenote.component';
import { SaisieNoteComponent } from './components/enseignant/saisie-note/saisie-note.component';
import { UeComponent } from './components/ue/ue.component';
import { BulletinComponent } from './components/bulletin/bulletin.component';
import { ClasseComponent } from './components/classe/classe/classe.component';
import { EnseignementComponent } from './components/enseignement/enseignement/enseignement.component';
import { EtudiantComponent } from './components/etudiant/etudiant.component';
import { StatistiquesComponent } from './components/statistiques/statistiques.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SidebarComponent,
    NavbarComponent,
    LoginComponent,
    EnseignantComponent,
    AnneeAcademiqueComponent,
    SemestreComponent,
    NiveauComponent,
    FiliereComponent,
    MatiereComponent,
    NoteComponent,
    RelevenoteComponent,
    SaisieNoteComponent,
    UeComponent,
    BulletinComponent,
    EtudiantComponent,
    ClasseComponent,
    EnseignementComponent,
    StatistiquesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    NgChartsModule,
    ReactiveFormsModule
  ],

  
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}