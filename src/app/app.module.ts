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
import { UserComponent } from './components/user/user.component';
import { InfoEtudiantComponent } from './components/etudiant/info-etudiant/info-etudiant.component';
import { VerrouilleNoteComponent } from './components/verrouille-note/verrouille-note.component';
import { LogincomponentComponent } from './auth/login/logincomponent/logincomponent.component';
import { TypeFraisComponent } from './components/facturation/type-frais/type-frais.component';
import { FraisAcademiquesComponent } from './components/facturation/frais-academiques/frais-academiques.component';
import { FacturesEtudiantComponent } from './components/facturation/factures-etudiant/factures-etudiant.component';
import { PaiementsEtudiantComponent } from './components/facturation/paiements-etudiant/paiements-etudiant.component';
import { AjustementsEtudiantComponent } from './components/facturation/ajustements-etudiant/ajustements-etudiant.component';
import { JournalComptableComponent } from './components/facturation/journal-comptable/journal-comptable.component';
import { SituationFinanciereEtudiantComponent } from './components/facturation/situation-financiere-etudiant/situation-financiere-etudiant.component';
import { StatistiqueFinanciereEtudiantComponent } from './components/facturation/statistique-financiere-etudiant/statistique-financiere-etudiant.component';
import { FactureDetailComponent } from './components/facturation/facture-detail/facture-detail.component';
import { ParametrageTypeFraisComponent } from './components/facturation/parametrage-type-frais/parametrage-type-frais.component';
import { ModeleEcheancierComponent } from './components/facturation/modele-echeancier/modele-echeancier.component';



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
    SaisieNoteComponent,
    VerrouilleNoteComponent,
    StatistiquesComponent,
    LogincomponentComponent,
    InfoEtudiantComponent,
    UserComponent,
    TypeFraisComponent,
    FraisAcademiquesComponent,
    FacturesEtudiantComponent,
    PaiementsEtudiantComponent,
    AjustementsEtudiantComponent,
    JournalComptableComponent,
    SituationFinanciereEtudiantComponent,
    StatistiqueFinanciereEtudiantComponent,
    FactureDetailComponent,
    ParametrageTypeFraisComponent,
    ModeleEcheancierComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgChartsModule,
   
    
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