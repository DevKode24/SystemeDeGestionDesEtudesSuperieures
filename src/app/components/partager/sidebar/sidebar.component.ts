import { Component } from '@angular/core';
import { TokenStorageService, Role } from '../../../auth/token-storage.service';

interface SubMenu {
  label: string;
  path: string;
  roles: Role[];
}

interface Menu {
  label: string;
  icon: string;
  path?: string;
  roles: Role[];
  subMenus?: SubMenu[];
  expanded?: boolean; // pour l'état ouvert/fermé
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  Role = Role;
  role: Role | Role[] | null = null; // 🔹 peut être un seul rôle ou un tableau
  menus: Menu[] = [];

  constructor(private tokenStorage: TokenStorageService) {
    this.role = this.tokenStorage.getUserRole();
    this.initMenus();
  }

  private initMenus() {
    this.menus = [
      {
        label: 'Dashboard',
        icon: 'bi-speedometer2',
        path: '/dashboard',
        roles: [Role.Admin, Role.Scolarite, Role.Enseignant, Role.Etudiant]
      },
      {
        label: 'Scolarité',
        icon: 'bi-building',
        path: '/dashboard/scolarite',
        roles: [Role.Admin, Role.Scolarite],
        subMenus: [
          { label: 'Année Academique', path: 'scolarite/Anneeacademique', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Semestre', path: 'scolarite/semestres', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Filière', path: 'scolarite/filiere', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Niveau', path: 'scolarite/niveau', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Classes/salles', path: 'scolarite/salles', roles: [Role.Admin, Role.Scolarite] },
           { label: 'Gestion des enseignements', path: 'scolarite/enseignements', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Unité d\'enseignement', path: 'scolarite/ues', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Matière', path: 'scolarite/matieres', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Bulletin', path: 'scolarite/bulletin', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Dossier académique', path: '/login', roles: [Role.Admin, Role.Scolarite] }

        ]
      },
       {
    label: 'Facturation',
    icon: 'bi-cash-stack',
    path: '/dashboard/facturation',
    roles: [Role.Admin, Role.Scolarite],
    subMenus: [
      { label: 'Types de frais', path: 'facturation/type-frais', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Frais académiques', path: 'facturation/frais-academiques', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Facturation des étudiants', path: 'facturation/factures', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Paiements', path: 'facturation/paiements', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Ajustements financiers', path: 'facturation/ajustements', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Journal comptable', path: 'facturation/journal', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Situation financière étudiant', path: 'facturation/situation-financiere', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Statistiques financières', path: 'facturation/statistiques', roles: [Role.Admin, Role.Scolarite] },
      { label: 'Échéanciers de paiement', path: 'facturation/echeanciers', roles: [Role.Admin, Role.Scolarite] }
    ]
  },
      {
        label: 'Enseignants',
        icon: 'bi-person-video3',
        path: '/dashboard/enseignant',
        roles: [Role.Admin, Role.Enseignant],
        subMenus: [
          { label: 'Creer un Enseignant', path: 'scolarite/enseignant', roles: [Role.Admin, Role.Scolarite] },
          { label: 'Releve de note', path: 'enseignant/ReleveNotes', roles: [Role.Enseignant] },
          { label: 'Répartition des cours', path: '/login', roles: [Role.Admin, Role.Enseignant] },   
          { label: 'Lister les étudiants par classe', path: 'scolarite/enseignant', roles: [Role.Admin, Role.Scolarite] }
        ]
      },
      {
        label: 'Étudiants',
        icon: 'bi-mortarboard',
        roles: [Role.Admin, Role.Etudiant],
        subMenus: [
          { label: 'Inscription', path: 'scolarite/etudiants', roles: [Role.Admin, Role.Etudiant] },
          { label: 'Emploi du temps', path: 'scolarite/enseignant/listEtudiant', roles: [Role.Etudiant] },
          { label: 'Lister tous les Etudiants', path: 'scolarite/listeEtudiants', roles: [Role.Admin, Role.Scolarite] }
        ]
      },
    {
        label: 'Gestion des Notes',
        path: '/dashboard/enseignant',
        icon: 'bi-journal-text',
        roles: [Role.Admin, Role.Etudiant, Role.Enseignant],
        subMenus: [
          { label: 'Enregistrement des notes', path: '/login', roles: [Role.Admin] },
          { label: 'Verrouillé notes', path: 'scolarite/VerrouilleNote', roles: [Role.Admin] },
          { label: 'SM Consulter notes', path: '/login', roles: [Role.Admin, Role.Etudiant] },
          { label: 'Saisir notes', path: 'enseignant/saisie-note', roles: [Role.Enseignant] },
          { label: 'Modifier notes', path: '/login', roles: [Role.Admin] }
        ]
      },
      {
        label: 'Gestion des utilisateurs',
        icon: 'bi-people',
        roles: [Role.Admin],
        subMenus: [
                  { label: 'Gestion des utilisateurs', path: 'scolarite/utilisateurs', roles: [Role.Admin] },
                  { label: 'Gestion des rôles et permissions', path: '/login', roles: [Role.Admin] }
        ]
      },
      {
        label: 'Paramètres',
        icon: 'bi-gear',
        path: '/login',
        roles: [Role.Admin, Role.Scolarite, Role.Enseignant, Role.Etudiant]
      }
    ];
  }

  /* ==========================
     DROITS
     ========================== */
  canView(menu: Menu | SubMenu): boolean {
    if (!this.role) return false;

    // 🔹 si plusieurs rôles, vérifier qu'au moins un est autorisé
    if (Array.isArray(this.role)) {
      return this.role.some(r => menu.roles.includes(r));
    }

    // 🔹 rôle unique
    return menu.roles.includes(this.role);
  }

  toggleMenu(menu: Menu) {
    menu.expanded = !menu.expanded;
  }
}
