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

      // Clonar la página para limpiarla antes de capturar el PDF
      const clone = sheet.cloneNode(true);

      // 1. Eliminar elementos de interfaz no deseados
      clone.querySelectorAll('.no-print, .page-header-overlay').forEach((el) => el.remove());

      // 2. ELIMINACIÓN DE CAJAS: Hace que las cajas de fórmulas desaparezcan en el PDF
      clone.querySelectorAll(
        '.math-equation-block, .math-equation-box, .math-equation-inline, .math-formula-box, .math-formula-inner'
      ).forEach((box) => {
        box.style.backgroundColor = 'transparent';
        box.style.border = 'none';
        box.style.boxShadow = 'none';
        box.style.outline = 'none';
      });

      // También remover fondos de cualquier contenedor interior de fórmula
      clone.querySelectorAll('.math-equation-block div, .math-formula-box span').forEach((inner) => {
        inner.style.backgroundColor = 'transparent';
        inner.style.border = 'none';
        inner.style.boxShadow = 'none';
      });

      // Posicionar el clon fuera de la vista para cálculo milimétrico
      clone.style.position = 'fixed';
      clone.style.top = '-99999px';
      clone.style.left = '0';
      clone.style.width = '8.5in';
      clone.style.height = '11in';
      clone.style.zIndex = '-1';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 3, // Calidad HD 300 DPI
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
      });

      document.body.removeChild(clone);

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