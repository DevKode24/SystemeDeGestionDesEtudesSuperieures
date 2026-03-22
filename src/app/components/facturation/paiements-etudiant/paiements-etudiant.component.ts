import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Facture } from 'src/app/models/facture';
import { Paiement } from 'src/app/models/paiement';
import { Etudiant } from 'src/app/models/etudiant';

import { EtudiantService } from 'src/app/services/etudiant.service';
import { FacturationService } from 'src/app/services/facturation.service';

@Component({
  selector: 'app-paiements-etudiant',
  templateUrl: './paiements-etudiant.component.html'
})
export class PaiementsEtudiantComponent implements OnInit {

  etudiants: Etudiant[] = [];
  factures: Facture[] = [];
  paiements: Paiement[] = [];

  selectedEtudiant?: Etudiant;

  paiementForm!: FormGroup;

  loading = false;

  // 🔥 PREVIEW
  showPreview = false;
  previewRecu: any;
  numeroRecuGenere?: string;

  constructor(
    private fb: FormBuilder,
    private etudiantService: EtudiantService,
    private facturationService: FacturationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEtudiants();
  }

  initForm() {
    this.paiementForm = this.fb.group({
      etudiantId: [null, Validators.required],
      factureId: [null, Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]],
      modePaiement: ['ESPECE'],
      referenceTransaction: ['', Validators.required]
    });
  }

  loadEtudiants() {
    this.etudiantService.getAll().subscribe(data => this.etudiants = data);
  }

  onSelectEtudiant() {
    const id = this.paiementForm.value.etudiantId;
    this.selectedEtudiant = this.etudiants.find(e => e.id === +id);

    if (!this.selectedEtudiant) return;

    this.facturationService.getFacturesByEtudiant(id)
      .subscribe(data => this.factures = data);
  }

  // 🔥 PREVIEW AVEC NUMERO BACKEND
previewPaiement(): void {
  if (this.paiementForm.invalid || !this.selectedEtudiant) return;

  const form = this.paiementForm.value;
  const facture = this.factures.find(f => f.id === +form.factureId);

  this.previewRecu = {
    numeroRecu: 'GÉNÉRÉ AUTOMATIQUEMENT',
    date: new Date(),
    etudiant: `${this.selectedEtudiant.nom} ${this.selectedEtudiant.prenom}`,
    montant: form.montant,
    mode: form.modePaiement,
    reference: form.referenceTransaction,
    facture: facture?.numeroFacture
  };

  this.showPreview = true;
}

  // 🔥 SAVE FINAL
  enregistrerPaiement() {
    if (!this.numeroRecuGenere) return;

    const payload = {
      ...this.paiementForm.value,
      etudiantId: this.selectedEtudiant?.id,
      numeroRecu: this.numeroRecuGenere
    };

    this.loading = true;

    this.facturationService.effectuerPaiement(payload).subscribe({
      next: (p: Paiement) => {
        this.paiements.unshift(p);
        alert('✅ Paiement enregistré');

        this.reset();
      },
      error: () => alert('Erreur'),
      complete: () => this.loading = false
    });
  }

  reset() {
    this.showPreview = false;
    this.previewRecu = null;
    this.numeroRecuGenere = undefined;

    this.paiementForm.reset();
  }

  formatAmount(amount: number): string {
    return amount?.toLocaleString('fr-FR') || '0';
  }
}