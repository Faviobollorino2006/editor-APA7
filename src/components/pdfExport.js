export async function exportToPdf(editorElements, filename = 'Investigacion_Estadistica_APA7.pdf', headerText = '') {
  const pages = Array.isArray(editorElements) ? editorElements.filter(Boolean) : [editorElements].filter(Boolean);
  if (pages.length === 0) return;

  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  // Contenedor temporal en coordenadas seguras (0, 0) protegido detrás de la interfaz
  const container = document.createElement('div');
  container.id = 'pdf-render-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '8.5in';
  container.style.zIndex = '-99999';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.margin = '0';
  container.style.padding = '0';
  container.style.pointerEvents = 'none';

  pages.forEach((pageEl, idx) => {
    // Hoja Carta individual (8.5 x 11 pulgadas) con margen reglamentario APA de 2.54 cm (1 pulgada)
    const pageWrapper = document.createElement('div');
    pageWrapper.style.width = '8.5in';
    pageWrapper.style.minHeight = '11in';
    pageWrapper.style.height = '11in';
    pageWrapper.style.padding = '1in';
    pageWrapper.style.boxSizing = 'border-box';
    pageWrapper.style.position = 'relative';
    pageWrapper.style.backgroundColor = '#ffffff';
    pageWrapper.style.color = '#000000';
    pageWrapper.style.overflow = 'hidden';

    // Encabezado superior APA con número de página arriba a la derecha
    const headerDiv = document.createElement('div');
    headerDiv.style.position = 'absolute';
    headerDiv.style.top = '0.5in';
    headerDiv.style.left = '1in';
    headerDiv.style.right = '1in';
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.fontFamily = '"Times New Roman", Times, serif';
    headerDiv.style.fontSize = '12pt';
    headerDiv.style.lineHeight = '1';
    headerDiv.style.color = '#000000';

    const headerTextSpan = document.createElement('span');
    headerTextSpan.style.fontSize = '10pt';
    headerTextSpan.style.textTransform = 'uppercase';
    headerTextSpan.style.color = '#475569';
    headerTextSpan.textContent = headerText ? headerText.trim().toUpperCase() : '';

    const pageNumSpan = document.createElement('span');
    pageNumSpan.textContent = String(idx + 1);

    headerDiv.appendChild(headerTextSpan);
    headerDiv.appendChild(pageNumSpan);
    pageWrapper.appendChild(headerDiv);

    // Clonación del contenido de la hoja
    const contentClone = pageEl.cloneNode(true);
    contentClone.querySelectorAll('.no-print, .page-header-overlay').forEach((el) => el.remove());

    contentClone.className = 'editor-body';
    contentClone.style.fontFamily = '"Times New Roman", Times, serif';
    contentClone.style.fontSize = '12pt';
    contentClone.style.lineHeight = '2.0';
    contentClone.style.color = '#000000';

    pageWrapper.appendChild(contentClone);

    if (idx < pages.length - 1) {
      pageWrapper.style.pageBreakAfter = 'always';
    }

    container.appendChild(pageWrapper);
  });

  document.body.appendChild(container);

  try {
    const opt = {
      margin: 0, // Margen 0 en jsPDF porque cada hoja ya cuenta con el padding de 1 pulgada
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 816, // 8.5in * 96 DPI
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['css', 'legacy'],
      },
    };

    await html2pdf().set(opt).from(container).save();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}