package com.projet.dev.security.jwt;

import com.projet.dev.models.ERole;
import com.projet.dev.models.Permission;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${application.security.jwt.secretKey}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration; // ex: 86400000 = 1 jour

    @Value("${application.security.jwt.refresh-token-expiration}")
    private long refreshExpiration;

    // 🔐 Génération access token avec rôle(s) et permissions
    public String generateToken(UserDetails userDetails, Set<String> roles) {
        Map<String, Object> claims = new HashMap<>();

        if (roles == null || roles.isEmpty()) {
            claims.put("roles", Set.of("ROLE_USER"));
            claims.put("permissions", Set.of());
        } else {
            // Ajouter ROLE_ + permissions
            Set<String> roleAuthorities = roles.stream()
                    .map(r -> "ROLE_" + r)
                    .collect(Collectors.toSet());
            claims.put("roles", roleAuthorities);

            Set<String> permissions = roles.stream()
                    .map(this::mapRoleToPermissions)
                    .flatMap(Set::stream)
                    .collect(Collectors.toSet());
            claims.put("permissions", permissions);
        }

        return buildToken(claims, userDetails, jwtExpiration);
    }

    // 🔄 Génération refresh token
    public String generateRefreshToken(UserDetails userDetails, Set<String> roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles == null || roles.isEmpty()
                ? Set.of("ROLE_USER")
                : roles.stream().map(r -> "ROLE_" + r).collect(Collectors.toSet()));
        claims.put("permissions", Set.of()); // pas besoin de permissions dans refresh token
        return buildToken(claims, userDetails, refreshExpiration);
    }

    // Mapper rôle → permissions
    private Set<String> mapRoleToPermissions(String role) {
        return switch (role) {
            case "ADMIN" -> ERole.ADMIN.getPermissions()
                    .stream()
                    .map(Permission::getPermission)
                    .collect(Collectors.toSet());
            case "SCOLARITE" -> ERole.SCOLARITE.getPermissions()
                    .stream()
                    .map(Permission::getPermission)
                    .collect(Collectors.toSet());
            case "ENSEIGNANT" -> ERole.ENSEIGNANT.getPermissions()
                    .stream()
                    .map(Permission::getPermission)
                    .collect(Collectors.toSet());
            case "ETUDIANT" -> ERole.ETUDIANT.getPermissions()
                    .stream()
                    .map(Permission::getPermission)
                    .collect(Collectors.toSet());
            default -> Set.of();
        };
    }

    // Construire token
    private String buildToken(Map<String, Object> claims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
