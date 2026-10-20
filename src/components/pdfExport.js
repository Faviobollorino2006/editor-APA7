import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPdf(editorElements, filename = 'Investigacion_Estadistica_APA7.pdf') {
  // Capturamos las hojas físicas reales que el usuario ya está viendo en pantalla
  const sheetElements = document.querySelectorAll('.paper-sheet');
  if (!sheetElements || sheetElements.length === 0) {
    alert('No se encontraron hojas para exportar.');
    return;
  }

  // Guardamos la posición actual de scroll del usuario
  const originalScrollY = window.scrollY;
  window.scrollTo(0, 0); // Nos aseguramos de estar al inicio para evitar desfases de captura

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter', // 8.5 x 11 pulgadas oficiales APA 7
    });

    for (let i = 0; i < sheetElements.length; i++) {
      const sheet = sheetElements[i];

      // A partir de la segunda hoja, añadimos una página nueva al archivo PDF
      if (i > 0) {
        pdf.addPage('letter', 'portrait');
      }

      // Fotografía HD de la hoja real (escala 2x para nitidez tipográfica)
      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // Ajustamos la imagen exactamente a las 8.5 x 11 pulgadas de la hoja Carta
      pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11, undefined, 'FAST');
    }

    // Descarga directa e inmediata a la carpeta Descargas
    pdf.save(filename);
  } finally {
    // Restauramos el scroll del usuario
    window.scrollTo(0, originalScrollY);
  }
}