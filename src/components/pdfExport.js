import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Transforma cualquier fracción flex antigua o nueva en una tabla nativa 100% compatible con html2canvas
function normalizeFractionsForCanvas(container) {
  const flexFractions = container.querySelectorAll(
    'span.math-fraction, span[style*="flex-direction: column"], span[style*="flex-direction:column"]'
  );

  flexFractions.forEach((frac) => {
    const children = Array.from(frac.children);
    if (children.length >= 2) {
      const numHtml = children[0].innerHTML;
      const denHtml = children[1].innerHTML;

      const table = document.createElement('table');
      table.className = 'math-fraction-table';
      table.setAttribute(
        'style',
        'display: inline-table !important; vertical-align: middle !important; border-collapse: collapse !important; text-align: center !important; margin: 0 4px !important; border: none !important; font-size: 0.95em !important; line-height: 1.1 !important; background: transparent !important;'
      );

      table.innerHTML = `
        <tbody>
          <tr>
            <td style="display: table-cell !important; border-bottom: 1.5px solid #000000 !important; border-top: none !important; border-left: none !important; border-right: none !important; padding: 0 4px 1px 4px !important; text-align: center !important; color: #000000 !important;">${numHtml}</td>
          </tr>
          <tr>
            <td style="display: table-cell !important; border: none !important; padding: 1px 4px 0 4px !important; text-align: center !important; color: #000000 !important;">${denHtml}</td>
          </tr>
        </tbody>
      `;

      frac.parentNode.replaceChild(table, frac);
    }
  });

  // Limpieza de cajas grises vacías que causaban franjas sin texto
  container.querySelectorAll('.math-formula-box, .math-formula-inner').forEach((el) => {
    if (el.textContent.trim() === '' && !el.querySelector('img, svg, table')) {
      el.remove();
    }
  });
}

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

      // Clonamos la hoja para sanitizarla sin alterar lo que estás viendo
      const clone = sheet.cloneNode(true);
      clone.querySelectorAll('.no-print, .page-header-overlay').forEach((el) => el.remove());
      normalizeFractionsForCanvas(clone);

      // Posicionamos el clon de forma segura en el DOM para que el renderizador calcule estilos
      clone.style.position = 'fixed';
      clone.style.top = '-99999px';
      clone.style.left = '0';
      clone.style.width = '8.5in';
      clone.style.height = '11in';
      clone.style.zIndex = '-1';
      document.body.appendChild(clone);

      // Captura HD a 300 DPI de imprenta (scale: 3.125 = 300 DPI / 96 base)
      const canvas = await html2canvas(clone, {
        scale: 3.125,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
      });

      document.body.removeChild(clone);

      // Exportación PNG nítida sin remuestreo FAST
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

      // Omitir el parámetro 'FAST' restaura la interpolación bilineal de alta nitidez
      pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight);
    }

    pdf.save(filename);
  } finally {
    window.scrollTo(0, originalScrollY);
  }
}