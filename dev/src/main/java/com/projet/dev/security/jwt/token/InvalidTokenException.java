package com.projet.dev.security.jwt.token;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) // Code HTTP 400 pour token invalide
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException() {
        super("Le token est invalide.");
    }

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
