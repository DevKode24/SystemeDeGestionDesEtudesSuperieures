import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export enum Role {
  Admin = 'ADMIN',
  Scolarite = 'SCOLARITE',
  Enseignant = 'ENSEIGNANT',
  Etudiant = 'ETUDIANT',
  User = "USER"
}

export interface JwtUser {
  username: string;
  role: Role | Role[];
}

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  getToken() {
    throw new Error('Method not implemented.');
  }

  constructor() {}

  // =========================
  // 🔐 Sauvegarde tokens
  // =========================
  saveAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  // =========================
  // 📥 Lecture tokens
  // =========================
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // =========================
  // 🧹 Déconnexion
  // =========================
  signOut(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // =========================
  // ✅ Vérifie connexion
  // =========================
  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }

  // =========================
  // 🧠 Décodage JWT
  // =========================
  private decodeToken(token?: string): any | null {
    const jwt = token || this.getAccessToken();
    if (!jwt) return null;

    try {
      const payload = jwt.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('JWT invalide', error);
      return null;
    }
  }

  // =========================
  // 👤 Utilisateur connecté
  // =========================
  getUser(): JwtUser | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    const roleClaim = payload.role || payload.roles;
    let role: Role | Role[] = Role.Etudiant;

    if (Array.isArray(roleClaim)) {
      role = roleClaim.map((r: string) => r.replace('ROLE_', '') as Role);
    } else if (typeof roleClaim === 'string') {
      role = roleClaim.replace('ROLE_', '') as Role;
    }

    return {
      username: payload.sub,
      role
    };
  }

  // =========================
  // 🎭 Rôle uniquement
  // =========================
  getUserRole(): Role | Role[] | null {
    return this.getUser()?.role || null;
  }

  // =========================
  // ⏳ Vérifie expiration token
  // =========================
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload || !payload.exp) return true;
    return Date.now() > payload.exp * 1000;
  }

  // =========================
  // ⚡ Header pour requêtes HTTP sécurisées
  // =========================
  getAuthHeaders(): { Authorization: string } {
    const token = this.getAccessToken();
    return {
      Authorization: `Bearer ${token || ''}`
    };
  }
}
