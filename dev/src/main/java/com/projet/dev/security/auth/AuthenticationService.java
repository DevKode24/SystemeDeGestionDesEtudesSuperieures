package com.projet.dev.security.auth;

import com.projet.dev.models.*;
import com.projet.dev.repository.RoleRepository;
import com.projet.dev.repository.UserRepository;
import com.projet.dev.security.jwt.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /* =========================
       AUTHENTIFICATION
       ========================= */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        // Authentification avec Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Récupération de l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Création UserDetails pour JWT
        UserDetails userDetails = new AppUser(user);

        // Récupérer les rôles
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        // Sécurité : au moins un rôle
        if (roles.isEmpty()) {
            roles.add("USER");
        }

        // Génération JWT
        String accessToken = jwtService.generateToken(userDetails, roles);
        String refreshToken = jwtService.generateRefreshToken(userDetails, roles);

        return new AuthenticationResponse(accessToken, refreshToken);
    }

    /* =========================
       INSCRIPTION (ETUDIANT)
       ========================= */
    public void register(String nom, String prenom, String email, String password) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Role roleEtudiant = roleRepository.findByName(ERole.ETUDIANT)
                .orElseThrow(() -> new RuntimeException("Rôle ETUDIANT non trouvé"));

        Etudiant etudiant = new Etudiant();
        etudiant.setNom(nom);
        etudiant.setPrenom(prenom);
        etudiant.setEmail(email);
        etudiant.setPassword(passwordEncoder.encode(password));
        etudiant.setRoles(Set.of(roleEtudiant));
        etudiant.setEnabled(true);
        etudiant.setActif(true);

        userRepository.save(etudiant);
    }
}
