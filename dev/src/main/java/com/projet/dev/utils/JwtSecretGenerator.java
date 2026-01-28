package com.projet.dev.utils;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Base64;

public class JwtSecretGenerator {
    public static void main(String[] args) {
        // Génère une clé secrète HS512
        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

        // Encode la clé en Base64 pour l'utiliser dans .properties
        String secret = Base64.getEncoder().encodeToString(key.getEncoded());

        System.out.println("JWT Secret (Base64): " + secret);
        System.out.println("Longueur: " + secret.length() + " caractères");
    }
}

