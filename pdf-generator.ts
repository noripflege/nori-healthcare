import fs from "fs";
import path from "path";

interface PDFGenerationData {
  entryId: string;
  residentName: string;
  content: any;
  approvedBy: string;
  approvedAt: Date;
}

export class PDFGenerator {
  private ensurePdfDirectory(): string {
    const pdfDir = path.join(process.cwd(), "pdf");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    return pdfDir;
  }

  async generatePDF(data: PDFGenerationData): Promise<string> {
    const pdfDir = this.ensurePdfDirectory();
    const filename = `entry-${data.entryId}.pdf`;
    const filepath = path.join(pdfDir, filename);
    
    // For now, create a simple text-based PDF using HTML conversion
    // In a real implementation, you'd use a library like puppeteer or jsPDF
    const htmlContent = this.generateHTMLContent(data);
    
    // Create a simple text file as placeholder (in real implementation would be actual PDF)
    const textContent = this.htmlToText(htmlContent);
    fs.writeFileSync(filepath, textContent, 'utf8');
    
    return `/pdf/${filename}`;
  }

  private generateHTMLContent(data: PDFGenerationData): string {
    const formatDate = (date: Date) => date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Nori – Pflegebericht - ${data.residentName}</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; background: white; }
        .page { min-height: 100vh; padding: 40px; position: relative; }
        .header { text-align: center; border-bottom: 3px solid #1E88E5; padding-bottom: 25px; margin-bottom: 40px; }
        .nori-logo { font-size: 28px; font-weight: 700; color: #1E88E5; letter-spacing: -0.5px; }
        .nori-subtitle { margin: 8px 0; color: #666; font-size: 14px; }
        .document-title { font-size: 18px; font-weight: 600; color: #333; margin-top: 15px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: 600; color: #1E88E5; margin-bottom: 12px; border-bottom: 2px solid #E3F2FD; padding-bottom: 6px; }
        .content-text { margin: 8px 0; padding: 12px; background: #FAFAFA; border-left: 4px solid #1E88E5; }
        .medication-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .medication-table th, .medication-table td { border: 1px solid #E0E0E0; padding: 12px 8px; text-align: left; }
        .medication-table th { background-color: #1E88E5; color: white; font-weight: 600; }
        .vital-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
        .vital-item { background: #F8F9FA; padding: 12px; border-radius: 6px; border-left: 4px solid #1E88E5; }
        .footer { position: fixed; bottom: 20px; left: 40px; right: 40px; border-top: 2px solid #E0E0E0; padding-top: 15px; font-size: 12px; color: #666; text-align: center; background: white; }
        .approval { text-align: center; margin: 40px 0; padding: 25px; background: #E8F5E8; border: 2px solid #4CAF50; border-radius: 8px; }
        .approval-title { font-weight: 600; color: #2E7D32; margin-bottom: 8px; }
        .approval-details { color: #388E3C; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="nori-logo">Nori</div>
            <div class="nori-subtitle">Pflegeassistenz – Digitale Pflegedokumentation</div>
            <div class="document-title">Pflegebericht</div>
            <div class="nori-subtitle">${data.residentName} • ${formatDate(new Date())}</div>
        </div>

    <div class="section">
        <div class="section-title">Vitalwerte</div>
        ${data.content.vitalSigns ? Object.entries(data.content.vitalSigns)
          .filter(([_, value]) => value)
          .map(([key, value]) => `<p><strong>${this.translateVitalSign(key)}:</strong> ${value}</p>`)
          .join('') : '<p>Keine Vitalwerte dokumentiert.</p>'}
    </div>

    <div class="section">
        <div class="section-title">Medikation</div>
        ${data.content.medication && data.content.medication.length > 0 ? `
        <table class="medication-table">
            <thead>
                <tr>
                    <th>Medikament</th>
                    <th>Dosis</th>
                    <th>Uhrzeit</th>
                    <th>Verabreicht</th>
                </tr>
            </thead>
            <tbody>
                ${data.content.medication.map((med: any) => `
                <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.time}</td>
                    <td>${med.administered ? 'Ja' : 'Nein'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p>Keine Medikation dokumentiert.</p>'}
    </div>

    <div class="section">
        <div class="section-title">Mobilität</div>
        <p>${data.content.mobility || 'Nicht dokumentiert.'}</p>
    </div>

    <div class="section">
        <div class="section-title">Ernährung und Flüssigkeit</div>
        <p>${data.content.nutrition || 'Nicht dokumentiert.'}</p>
    </div>

    <div class="section">
        <div class="section-title">Hygiene</div>
        <p>${data.content.hygiene || 'Nicht dokumentiert.'}</p>
    </div>

    <div class="section">
        <div class="section-title">Stimmung und Kognition</div>
        <p>${data.content.mood || 'Nicht dokumentiert.'}</p>
    </div>

    <div class="section">
        <div class="section-title">Besonderheiten</div>
        <p>${data.content.specialNotes || 'Keine besonderen Vorkommnisse.'}</p>
    </div>

    <div class="section">
        <div class="section-title">Empfehlungen</div>
        <p>${data.content.recommendations || 'Keine Empfehlungen.'}</p>
    </div>

    <div class="approval">
        <strong>Freigegeben am:</strong> ${formatDate(data.approvedAt)}<br>
        <strong>Freigegeben von:</strong> ${data.approvedBy}
    </div>

    <div class="footer">
        <p>Generiert mit Nori Pflegeassistenz am ${formatDate(new Date())}</p>
        <p>Dieses Dokument wurde digital erstellt und ist ohne Unterschrift gültig.</p>
    </div>
</body>
</html>`;
  }

  private translateVitalSign(key: string): string {
    const translations: Record<string, string> = {
      bloodPressure: 'Blutdruck',
      pulse: 'Puls',
      temperature: 'Temperatur',
      weight: 'Gewicht'
    };
    return translations[key] || key;
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion for demo purposes
    // In real implementation, this would generate actual PDF
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}