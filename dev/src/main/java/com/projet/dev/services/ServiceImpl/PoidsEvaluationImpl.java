package com.projet.dev.services.ServiceImpl;

import org.springframework.stereotype.Component;

@Component
public class PoidsEvaluationImpl {

    private double pourcentageCC = 40.0;
    private double pourcentageExamen = 60.0;

    public void definirPoids(double cc, double examen) {
        if (cc + examen != 100) {
            throw new IllegalArgumentException("La somme des poids doit être égale à 100%");
        }
        this.pourcentageCC = cc;
        this.pourcentageExamen = examen;
    }

    public double getPourcentageCC() {
        return pourcentageCC;
    }

    public double getPourcentageExamen() {
        return pourcentageExamen;
    }
}
