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

function parseInlineRuns(domNode, initialStyles = {}, defaultFont = 'Times New Roman', defaultSize = 24) {
  const runs = [];

  function traverse(node, currentStyles) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        runs.push(
          new TextRun({
            text: text,
            font: currentStyles.font || defaultFont,
            size: currentStyles.size || defaultSize,
            bold: currentStyles.bold || false,
            italics: currentStyles.italics || false,
            underline: currentStyles.underline ? {} : undefined,
            strike: currentStyles.strike || false,
            subScript: currentStyles.subScript || false,
            superScript: currentStyles.superScript || false,
            color: currentStyles.color || undefined,
          })
        );
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const newStyles = { ...currentStyles };
    const tag = node.tagName.toLowerCase();
    const style = node.getAttribute('style') || '';

    if (tag === 'b' || tag === 'strong' || style.includes('font-weight: bold') || style.includes('font-weight:bold')) {
      newStyles.bold = true;
    }

  if (
      node.classList?.contains('math-symbol') ||
      node.classList?.contains('math-formula-box') ||
      node.classList?.contains('math-number') || // <--- RECONOCIMIENTO DE NÚMEROS MATH
      style.includes('Cambria Math') ||
      style.includes('STIX Two Math') ||
      style.includes('Computer Modern')
    ) {
      newStyles.font = 'Cambria Math';
      if (node.classList?.contains('math-operator') || node.classList?.contains('math-number')) {
        newStyles.italics = false; // Los números se mantienen rectos
      } else if (style.includes('font-style: italic') || !node.classList?.contains('math-operator')) {
        newStyles.italics = true;
      }
    }
    if (tag === 'i' || tag === 'em' || style.includes('font-style: italic') || style.includes('font-style:italic')) {
      newStyles.italics = true;
    }
    if (tag === 'u' || style.includes('text-decoration: underline')) {
      newStyles.underline = true;
    }
    if (tag === 's' || tag === 'strike') {
      newStyles.strike = true;
    }
    if (tag === 'sub') {
      newStyles.subScript = true;
    }
    if (tag === 'sup') {
      newStyles.superScript = true;
    }

    const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\))/);
    if (colorMatch && !colorMatch[1].includes('#000000')) {
      newStyles.color = colorMatch[1].replace('#', '');
    }

    node.childNodes.forEach((child) => traverse(child, newStyles));
  }

  traverse(domNode, initialStyles);
  return runs;
}

export async function exportToDocx(
  editorElements,
  filename = 'Investigacion_Estadistica_APA7.docx',
  options = { font: 'Times New Roman', size: '12pt' }
) {
  const pages = Array.isArray(editorElements) ? editorElements.filter(Boolean) : [editorElements].filter(Boolean);
  if (pages.length === 0) return;

  const defaultFont = options.font || 'Times New Roman';
  const ptNum = parseInt(options.size) || 12;
  const defaultSizeInHalfPoints = ptNum * 2; // 12pt = 24 twips

  const docChildren = [];

  pages.forEach((pageEl, pageIdx) => {
    const nodes = Array.from(pageEl.childNodes);

    for (const el of nodes) {
      if (el.nodeType === Node.TEXT_NODE) {
        const text = el.textContent.trim();
        if (text) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text, font: defaultFont, size: defaultSizeInHalfPoints })],
              spacing: { line: 480, after: 0 },
              indent: { firstLine: 720 },
            })
          );
        }
        continue;
      }

      if (el.nodeType !== Node.ELEMENT_NODE) continue;
      if (el.classList.contains('no-print') || el.classList.contains('page-header-overlay')) continue;

      // 1. Encabezado institucional
      if (el.classList.contains('no-indent')) {
        const subParagraphs = Array.from(el.querySelectorAll('div, p'));
        const lines = subParagraphs.length > 0 ? subParagraphs : [el];
        for (const lineEl of lines) {
          const runs = parseInlineRuns(lineEl, {}, defaultFont, defaultSizeInHalfPoints);
          if (runs.length > 0) {
            docChildren.push(new Paragraph({ children: runs, spacing: { line: 360, after: 0 } }));
          }
        }
        continue;
      }

      // 2. Título Nivel 1 (h3)
      if (el.tagName === 'H3') {
        docChildren.push(
          new Paragraph({
            children: parseInlineRuns(el, { bold: true }, defaultFont, defaultSizeInHalfPoints),
            alignment: AlignmentType.CENTER,
            spacing: { line: 480, before: 360, after: 180 },
          })
        );
        continue;
      }

      // 3. Título Nivel 2 (h4)
      if (el.tagName === 'H4') {
        docChildren.push(
          new Paragraph({
            children: parseInlineRuns(el, { bold: true }, defaultFont, defaultSizeInHalfPoints),
            alignment: AlignmentType.LEFT,
            spacing: { line: 480, before: 240, after: 120 },
          })
        );
        continue;
      }

      // 4. Referencias (Sangría francesa)
      if (el.classList.contains('apa-reference-item') || el.classList.contains('indent-hanging')) {
        docChildren.push(
          new Paragraph({
            children: parseInlineRuns(el, {}, defaultFont, defaultSizeInHalfPoints),
            indent: { left: 720, hanging: 720 },
            spacing: { line: 480, after: 200 },
          })
        );
        continue;
      }

      // 5. Tablas APA
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
              const cellRuns = parseInlineRuns(cell, {}, defaultFont, Math.max(20, defaultSizeInHalfPoints - 2));
              if (isHeader) cellRuns.forEach((run) => (run.root[1].bold = true));

              return new TableCell({
                width: { size: 100 / (cells.length || 1), type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: cellRuns, spacing: { line: 300, after: 60, before: 60 } })],
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

        const label = el.querySelector('div[style*="font-weight: bold"], div[style*="font-weight:bold"]');
        const title = el.querySelector('div[style*="font-style: italic"], div[style*="font-style:italic"]');
        const note = el.querySelector('div[style*="font-size: 10pt"], div[style*="font-size:10pt"]');

        if (label) docChildren.push(new Paragraph({ children: parseInlineRuns(label, { bold: true }, defaultFont, defaultSizeInHalfPoints), spacing: { line: 360, before: 240, after: 60 } }));
        if (title) docChildren.push(new Paragraph({ children: parseInlineRuns(title, { italics: true }, defaultFont, defaultSizeInHalfPoints), spacing: { line: 360, after: 120 } }));
        docChildren.push(new Table({ rows: docxRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
        if (note) docChildren.push(new Paragraph({ children: parseInlineRuns(note, {}, defaultFont, 20), spacing: { line: 300, before: 80, after: 240 } }));
        continue;
      }

      // 6. Fórmulas matemáticas
      if (el.classList.contains('math-formula-box')) {
        docChildren.push(
          new Paragraph({
            children: parseInlineRuns(el, {}, defaultFont, defaultSizeInHalfPoints),
            alignment: AlignmentType.CENTER,
            spacing: { line: 360, before: 180, after: 180 },
          })
        );
        continue;
      }

      // 7. Párrafos generales
      const runs = parseInlineRuns(el, {}, defaultFont, defaultSizeInHalfPoints);
      if (runs.length > 0) {
        const style = el.getAttribute('style') || '';
        let alignment = AlignmentType.LEFT;
        if (style.includes('text-align: center')) alignment = AlignmentType.CENTER;
        else if (style.includes('text-align: right')) alignment = AlignmentType.RIGHT;
        else if (style.includes('text-align: justify')) alignment = AlignmentType.JUSTIFIED;

        let indentConfig = { firstLine: 720 };
        if (el.classList.contains('indent-none') || el.classList.contains('no-indent')) indentConfig = undefined;
        else if (el.classList.contains('indent-hanging')) indentConfig = { left: 720, hanging: 720 };
        else if (el.classList.contains('indent-block')) indentConfig = { left: 720 };

        docChildren.push(
          new Paragraph({
            children: runs,
            alignment,
            indent: indentConfig,
            spacing: { line: 480, after: 0 },
          })
        );
      }
    }

    if (pageIdx < pages.length - 1) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
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