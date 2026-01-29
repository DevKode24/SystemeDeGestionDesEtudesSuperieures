import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* =======================
   AUTH
======================= */
import { LoginComponent } from './auth/login/login.component';

/* =======================
   LAYOUT / PARTAGE
======================= */
import { NavbarComponent } from './components/partager/navbar/navbar.component';
import { SidebarComponent } from './components/partager/sidebar/sidebar.component';

/* =======================
   MODULES MÉTIER
======================= */
import { EnseignantComponent } from './components/enseignant/enseignant.component';
import { AnneeAcademiqueComponent } from './components/anneeAcademique/annee-academique-list/annee-academique-list.component';

@NgModule({
  declarations: [
    AppComponent,

    // Auth
    LoginComponent,

    // Layout
    NavbarComponent,
    SidebarComponent,

    // Métier
    EnseignantComponent,
    AnneeAcademiqueComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
