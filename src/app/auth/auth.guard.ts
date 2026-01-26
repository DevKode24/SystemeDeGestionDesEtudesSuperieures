import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../auth/token-storage.service';

export const authGuard: CanActivateFn = (route, state) => {

  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  // ✅ Utilisateur connecté
  if (tokenStorage.isLoggedIn()) {
    return true;
  }

  // ❌ Pas connecté → login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
