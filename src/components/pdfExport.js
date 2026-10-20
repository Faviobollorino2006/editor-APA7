export async function exportToPdf(editorElement, filename = 'Investigacion_Estadistica_APA7.pdf', headerText = '') {
  if (!editorElement) return;

  // Carga dinámica segura para entornos Vite/ESM
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  // 1. Contenedor temporal aislado fuera de pantalla con ancho Carta exacto
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  // 6.5 pulgadas de contenido interior (8.5 pulg - 2 pulg de márgenes APA)
  container.style.width = '6.5in';
  container.style.fontFamily = '"Times New Roman", Times, serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '2.0';
  container.style.color = '#000000';
  container.style.backgroundColor = '#ffffff';

  // 2. Clonamos el contenido para no alterar la pantalla del usuario
  const clone = editorElement.cloneNode(true);

  // 3. Removemos cualquier elemento de interfaz o numeración visual en pantalla
  clone.querySelectorAll(
    '.no-print, .page-header-overlay, .page-number-indicator, .page-number-indicator-page'
  ).forEach((el) => el.remove());

  // 4. Reemplazamos los separadores visuales por saltos de página nativos de html2pdf
  clone.querySelectorAll('.apa-page-break-container, .apa-page-break').forEach((el) => {
    const breakEl = document.createElement('div');
    breakEl.className = 'html2pdf__page-break';
    breakEl.style.pageBreakBefore = 'always';
    breakEl.style.height = '0';
    breakEl.style.margin = '0';
    breakEl.style.padding = '0';
    el.parentNode.replaceChild(breakEl, el);
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const opt = {
      // 25.4 mm = 1 pulgada (2.54 cm en los cuatro costados según APA 7)
      margin: [25.4, 25.4, 25.4, 25.4],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, // Calidad retina/HD para textos nítidos
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'letter', // Tamaño Carta oficial
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.html2pdf__page-break',
      },
    };

    // Genera el PDF, estampa la numeración superior APA y descarga el archivo
    await html2pdf()
      .set(opt)
      .from(container)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFont('Times', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);

          // Coordenadas APA: 190.5 mm en X (esquina superior derecha) y 13 mm en Y (encabezado)
          pdf.text(String(i), 190.5, 13, { align: 'right' });

          if (headerText && headerText.trim()) {
            pdf.setFontSize(10);
            pdf.text(headerText.trim().toUpperCase(), 25.4, 13, { align: 'left' });
          }
        }
      })
      .save();
  } finally {
    // Limpieza del nodo temporal
    document.body.removeChild(container);
  }
}