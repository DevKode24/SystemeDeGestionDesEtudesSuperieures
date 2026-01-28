package com.projet.dev.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Session {

    NORMALE("NORMALE"),
    RATTRAPAGE("RATTRAPAGE");

    private final String code;

    Session(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static Session fromValue(String value) {
        for (Session s : values()) {
            if (s.code.equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Session inconnue : " + value);
    }
}
