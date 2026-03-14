import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { TokenStorageService } from '../token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private route:        ActivatedRoute    // ← AJOUTER
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  // 🔐 Soumission formulaire
  onSubmit(): void {
  localStorage.clear();
  sessionStorage.clear();

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading      = true;
  this.errorMessage = '';

  const credentials = {
    email:    this.loginForm.value.email,
    password: this.loginForm.value.password
  };

  this.authService.login(credentials).subscribe({
    next: (response) => {
      this.tokenStorage.saveAccessToken(response.accessToken);
      this.tokenStorage.saveRefreshToken(response.refreshToken);

      // ✅ SEUL CHANGEMENT : returnUrl au lieu de '/dashboard' en dur
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl')
                        ?? '/dashboard';
      this.router.navigateByUrl(returnUrl);
    },
    error: (err) => {
      this.loading = false;
      if (err.status === 403 || err.status === 401) {
        this.errorMessage = 'Email ou mot de passe incorrect';
      } else {
        this.errorMessage = 'Erreur serveur. Veuillez réessayer.';
      }
    }
  });
}

  // 👁️ Toggle mot de passe
  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  // 🧪 Helpers validation
  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
