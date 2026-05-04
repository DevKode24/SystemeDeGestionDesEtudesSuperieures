import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacturationService } from 'src/app/services/facturation.service';
import { Facture } from 'src/app/models/facture';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-facture-detail',
  templateUrl: './facture-detail.component.html',
  styleUrls: ['./facture-detail.component.scss']
})
export class FactureDetailComponent implements OnInit {

  facture?: Facture;
  loading = false;

  qrCodeImage: string = '';
  barcodeImage: string = '';

  @ViewChild('factureRef') factureRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private facturationService: FacturationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFacture(+id);
    }
  }

  loadFacture(id: number) {
    this.loading = true;

    this.facturationService.getFactureById(id).subscribe({
      next: async (data) => {
        this.facture = data;

        await this.generateQRCode();
        this.generateBarcode();
      },
      error: (err) => console.error(err),
      complete: () => this.loading = false
    });
  }

  // ================= QR CODE =================
  async generateQRCode() {
    if (!this.facture) return;

    this.qrCodeImage = await QRCode.toDataURL(
      `FACTURE-${this.facture.numeroFacture}`
    );
  }

  // ================= BARCODE =================
  generateBarcode() {
    if (!this.facture) return;

    const canvas = document.createElement('canvas');

    JsBarcode(canvas, this.facture.numeroFacture, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14
    });

    this.barcodeImage = canvas.toDataURL('image/png');
  }

  // ================= PRINT =================
  print(): void {
    window.print();
  }

  // ================= PDF =================
  exportPDF(): void {
    if (!this.factureRef) return;

    const element = this.factureRef.nativeElement;

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`facture-${this.facture?.numeroFacture}.pdf`);
    });
  }

  // ================= UTILS =================
  formatAmount(amount: number = 0): string {
    return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  get totalPaye(): number {
    return this.facture?.montantPaye || 0;
  }

  get reste(): number {
    return (this.facture?.montantTotal || 0) - this.totalPaye;
  }
}