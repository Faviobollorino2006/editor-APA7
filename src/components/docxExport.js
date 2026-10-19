import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  PageBreak,
} from 'docx';

export async function exportToDocx(editorElement, filename = 'Trabajo_Estadistica_APA7.docx') {
  if (!editorElement) return;

  const docChildren = [];
  const nodes = Array.from(editorElement.childNodes);

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text, font: 'Times New Roman', size: 24 })],
            spacing: { line: 480, after: 0 },
            indent: { firstLine: 720 },
          })
        );
      }
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node;

    // Ignorar indicadores visuales de página en el cuerpo de Word
    if (
      el.classList.contains('page-number-indicator') ||
      el.classList.contains('page-number-indicator-page')
    ) {
      continue;
    }

    // Salto de página oficial
    if (
      el.classList.contains('apa-page-break') ||
      el.classList.contains('apa-page-break-container') ||
      el.tagName === 'HR'
    ) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }

    // Encabezado
    if (el.classList.contains('no-indent')) {
      const subLines = el.innerText.split('\n').filter(l => l.trim().length > 0);
      for (const line of subLines) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: line, font: 'Times New Roman', size: 24, bold: line.includes('Bollorino') })],
            spacing: { line: 360, after: 0 },
          })
        );
      }
      continue;
    }

    // Título Nivel 1
    if (el.tagName === 'H3') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: el.innerText.trim(), font: 'Times New Roman', size: 24, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { line: 480, before: 360, after: 180 },
        })
      );
      continue;
    }

    // Título Nivel 2
    if (el.tagName === 'H4') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: el.innerText.trim(), font: 'Times New Roman', size: 24, bold: true })],
          alignment: AlignmentType.LEFT,
          spacing: { line: 480, before: 240, after: 120 },
        })
      );
      continue;
    }

    // Referencia
    if (el.classList.contains('apa-reference-item')) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: el.innerText.trim(), font: 'Times New Roman', size: 24 })],
          indent: { left: 720, hanging: 720 },
          spacing: { line: 480, after: 200 },
        })
      );
      continue;
    }

    // Tablas
    const tableEl = el.querySelector('table');
    if (tableEl || el.tagName === 'TABLE') {
      const targetTable = tableEl || el;
      const htmlRows = Array.from(targetTable.querySelectorAll('tr'));
      
      const docxRows = htmlRows.map((r, rowIndex) => {
        const isHeader = rowIndex === 0;
        const isLastRow = rowIndex === htmlRows.length - 1;
        const cells = Array.from(r.querySelectorAll('th, td'));

        return new TableRow({
          children: cells.map((cell) => {
            return new TableCell({
              width: { size: 100 / (cells.length || 1), type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell.innerText.trim(),
                      font: 'Times New Roman',
                      size: 22,
                      bold: isHeader || cell.tagName === 'TH',
                    }),
                  ],
                  spacing: { line: 300 },
                }),
              ],
              borders: {
                top: isHeader ? { style: BorderStyle.SINGLE, size: 12, color: '000000' } : { style: BorderStyle.NONE },
                bottom: isHeader || isLastRow ? { style: BorderStyle.SINGLE, size: isHeader ? 8 : 12, color: '000000' } : { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            });
          }),
        });
      });

      const tableLabel = el.querySelector('div[style*="font-weight: bold"], div[style*="font-weight:bold"]');
      const tableTitle = el.querySelector('div[style*="font-style: italic"], div[style*="font-style:italic"]');
      const tableNote = el.querySelector('div[style*="font-size: 10pt"], div[style*="font-size:10pt"]');

      if (tableLabel) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: tableLabel.innerText.trim(), font: 'Times New Roman', size: 24, bold: true })],
            spacing: { line: 360, before: 200, after: 40 },
          })
        );
      }
      if (tableTitle) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: tableTitle.innerText.trim(), font: 'Times New Roman', size: 24, italics: true })],
            spacing: { line: 360, after: 120 },
          })
        );
      }

      docChildren.push(new Table({ rows: docxRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

      if (tableNote) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: tableNote.innerText.trim(), font: 'Times New Roman', size: 20 })],
            spacing: { line: 300, before: 60, after: 200 },
          })
        );
      }
      continue;
    }

    // Párrafo general
    const textContent = el.innerText.trim();
    if (textContent) {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: textContent, font: 'Times New Roman', size: 24 })],
          spacing: { line: 480, after: 0 },
          indent: { firstLine: 720 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}