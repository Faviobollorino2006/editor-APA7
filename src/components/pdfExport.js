import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPdf(editorElements, filename = 'Investigacion_Estadistica_APA7.pdf') {
  const sheetElements = document.querySelectorAll('.paper-sheet');
  if (!sheetElements || sheetElements.length === 0) {
    alert('No se encontraron hojas para exportar.');
    return;
  }

  const originalScrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    // Esperar a que las fuentes del navegador estén totalmente calculadas
    if (document.fonts) {
      await document.fonts.ready;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter', // 8.5 x 11 pulgadas oficiales
    });

    for (let i = 0; i < sheetElements.length; i++) {
      const sheet = sheetElements[i];

      if (i > 0) {
        pdf.addPage('letter', 'portrait');
      }

      // Captura nítida de la hoja física
      const canvas = await html2canvas(sheet, {
        scale: 2, // Calidad HD
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // Dimensiones de la página Carta en pulgadas
      const pdfWidth = 8.5;
      const pdfHeight = 11;

      // Cálculo de relación de aspecto proporcional
      const canvasRatio = canvas.width / canvas.height;
      const pageRatio = pdfWidth / pdfHeight;

      let renderWidth = pdfWidth;
      let renderHeight = pdfHeight;
      let posX = 0;
      let posY = 0;

      // Si existe una discrepancia en la relación de aspecto, ajustamos proporcionalmente
      // evitando cualquier compresión vertical o estiramiento horizontal
      if (Math.abs(canvasRatio - pageRatio) > 0.005) {
        if (canvasRatio > pageRatio) {
          renderHeight = pdfWidth / canvasRatio;
          posY = (pdfHeight - renderHeight) / 2;
        } else {
          renderWidth = pdfHeight * canvasRatio;
          posX = (pdfWidth - renderWidth) / 2;
        }
      }

      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
    }

    pdf.save(filename);
  } finally {
    window.scrollTo(0, originalScrollY);
  }
}