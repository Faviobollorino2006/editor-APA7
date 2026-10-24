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
    if (document.fonts) {
      await document.fonts.ready;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    for (let i = 0; i < sheetElements.length; i++) {
      const sheet = sheetElements[i];

      if (i > 0) {
        pdf.addPage('letter', 'portrait');
      }

      // Captura vectorial a 300 DPI de imprenta
      const canvas = await html2canvas(sheet, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        ignoreElements: (element) => {
          return element.classList.contains('no-print') || element.classList.contains('page-header-overlay');
        },
      });

      const imgData = canvas.toDataURL('image/png');

      const pdfWidth = 8.5;
      const pdfHeight = 11;
      const canvasRatio = canvas.width / canvas.height;
      const pageRatio = pdfWidth / pdfHeight;

      let renderWidth = pdfWidth;
      let renderHeight = pdfHeight;
      let posX = 0;
      let posY = 0;

      if (Math.abs(canvasRatio - pageRatio) > 0.005) {
        if (canvasRatio > pageRatio) {
          renderHeight = pdfWidth / canvasRatio;
          posY = (pdfHeight - renderHeight) / 2;
        } else {
          renderWidth = pdfHeight * canvasRatio;
          posX = (pdfWidth - renderWidth) / 2;
        }
      }

      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight);
    }

    pdf.save(filename);
  } finally {
    window.scrollTo(0, originalScrollY);
  }
}