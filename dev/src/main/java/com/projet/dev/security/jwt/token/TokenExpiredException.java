package com.projet.dev.security.jwt.token;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED) // ou FORBIDDEN selon le contexte
public class TokenExpiredException extends RuntimeException {

    public TokenExpiredException() {
        super("Le token est expiré.");
    }

    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}