import { Component } from '@angular/core';
import { TokenStorageService, JwtUser } from '../../../auth/token-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  user: JwtUser | null = null;

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    this.user = this.tokenStorage.getUser();
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.router.navigate(['/login']);
  }
}
