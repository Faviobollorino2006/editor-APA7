export async function exportToPdf(editorElements, filename = 'Investigacion_Estadistica_APA7.pdf', headerText = '') {
  const pages = Array.isArray(editorElements) ? editorElements.filter(Boolean) : [editorElements].filter(Boolean);
  if (pages.length === 0) return;

  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '6.5in';
  container.style.fontFamily = '"Times New Roman", Times, serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '2.0';
  container.style.color = '#000000';
  container.style.backgroundColor = '#ffffff';

  pages.forEach((pageEl, idx) => {
    const clone = pageEl.cloneNode(true);
    clone.querySelectorAll('.no-print, .page-header-overlay').forEach((el) => el.remove());

    const pageWrapper = document.createElement('div');
    pageWrapper.appendChild(clone);

    if (idx > 0) {
      const breakEl = document.createElement('div');
      breakEl.className = 'html2pdf__page-break';
      breakEl.style.pageBreakBefore = 'always';
      breakEl.style.height = '0';
      breakEl.style.margin = '0';
      container.appendChild(breakEl);
    }

    container.appendChild(pageWrapper);
  });

  document.body.appendChild(container);

  try {
    const opt = {
      margin: [25.4, 25.4, 25.4, 25.4],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'letter',
        orientation: 'portrait',
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.html2pdf__page-break',
      },
    };

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
          pdf.text(String(i), 190.5, 13, { align: 'right' });
          if (headerText && headerText.trim()) {
            pdf.setFontSize(10);
            pdf.text(headerText.trim().toUpperCase(), 25.4, 13, { align: 'left' });
          }
        }
      })
      .save();
  } finally {
    document.body.removeChild(container);
  }
}