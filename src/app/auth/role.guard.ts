import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { TokenStorageService, Role } from '../auth/token-storage.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const expectedRoles: string[] = route.data?.['roles'] ?? [];

  if (!tokenStorage.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  let userRole = tokenStorage.getUserRole();

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  // 🔹 Normalisation : retirer 'ROLE_' pour matcher avec expectedRoles
  const normalizedRoles = Array.isArray(userRole)
    ? userRole.map(r => r.replace('ROLE_', ''))
    : [userRole.replace('ROLE_', '')];

  const allowed = expectedRoles.length === 0 || expectedRoles.some(r => normalizedRoles.includes(r));

  if (!allowed) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
