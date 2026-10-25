import React, { useRef, useState, useEffect } from 'react';
import mammoth from 'mammoth';
import Toolbar from './components/Toolbar';
import MathModal from './components/MathModal';
import SymbolModal from './components/SymbolModal';
import TableModal from './components/TableModal';
import FigureModal from './components/FigureModal';
import ReferenceModal from './components/ReferenceModal';
import LayoutModal from './components/LayoutModal';
import ApaAuditSidebar from './components/ApaAuditSidebar';
import ModelComparisonDrawer from './components/ModelComparisonDrawer';
import { exportToDocx } from './components/docxExport';
import { exportToPdf } from './components/pdfExport';

const STORAGE_KEY_PAGES = 'apa7_stats_document_pages_v2';
const STORAGE_KEY_FONT = 'apa7_stats_document_font';
const STORAGE_KEY_FONT_SIZE = 'apa7_stats_document_font_size';
const MODEL_STORAGE_KEY = 'apa7_teacher_model_data';

const DEFAULT_PAGE_1 = `
  <div class="no-indent" style="line-height: 1.3; margin-bottom: 2em;">
    <div><strong>Bollorino Montoya, Favio</strong></div>
    <div>Guayaquil, 27 de octubre del 2026</div>
    <div>Deber 01</div>
    <div>Estadística / Matemáticas</div>
  </div>

  <h3>Trabajo de Investigación: Población y Muestra Estadística</h3>

  <h4>Pregunta 1: ¿Qué es la población y la muestra en estadística?</h4>
  <p class="indent-first-line">
    En el análisis cuantitativo y la inferencia matemática, la distinción rigurosa entre el universo de estudio y la fracción observable constituye el punto de partida fundamental para cualquier inferencia válida. En palabras de Triola (2018), la "población es el conjunto completo de todos los elementos que se van a estudiar" (p. 5), mientras que la muestra representa un subconjunto de miembros seleccionados con la finalidad de obtener información representativa.
  </p>

  <h4>Pregunta 2: ¿Para qué sirven el cálculo de la población y de la muestra?</h4>
  <p class="indent-first-line">
    En la práctica científica y social, la recolección de información sobre la totalidad de los miembros resulta frecuentemente inviable debido a limitaciones presupuestarias y de tiempo. En consecuencia, el dimensionamiento de la muestra permite determinar el número mínimo indispensable de observaciones requeridas para obtener estimaciones precisas con un margen de error cuantificable.
  </p>
`;

export default function App() {
  const [pages, setPages] = useState([{ id: 1 }]);
  const pageRefs = useRef([]);
  const activePageIndex = useRef(0);
  const [currentVisiblePage, setCurrentVisiblePage] = useState(1);
  const mainScrollRef = useRef(null);
  const lastRangeRef = useRef(null);

  // Tipografía y Tamaño Dinámicos
  const [docFont, setDocFont] = useState('Times New Roman');
  const [docFontSize, setDocFontSize] = useState('12pt');

  // Modales
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Comparador de Modelo
  const [modelData, setModelData] = useState(null);
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false);

  // Configuración APA 7
  const [layout, setLayout] = useState({
    paperSize: 'letter',
    marginSize: '2.54',
    lineHeight: '2.0',
    showPageNumber: true,
    headerText: '',
  });

  const [stats, setStats] = useState({ words: 0, chars: 0, pages: 1 });
  const [editorText, setEditorText] = useState('');
  const [saveStatus, setSaveStatus] = useState('Guardado en este equipo');
  const [auditData, setAuditData] = useState({
    hasHeader: false,
    hasTitle: false,
    headingCount: 0,
    wordCount: 0,
    tableCount: 0,
    hasReferences: false,
  });

  const saveCursorPosition = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Reabsorbe textos huérfanos y migra fracciones flex a tablas nativas estables
  const healFormulaBoxes = (container) => {
    if (!container) return;

    // 1. Migración automática de fracciones viejas en pantalla a tablas estables
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
          'display: inline-table !important; vertical-align: middle !important; border-collapse: collapse !important; text-align: center !important; margin: 0 4px !important; border: none !important; font-size: 0.95em !important; line-height: 1.1 !important;'
        );
        table.innerHTML = `
          <tbody>
            <tr>
              <td class="math-numerator" style="border-bottom: 1.5px solid #000000 !important; border-top: none !important; border-left: none !important; border-right: none !important; padding: 0 4px 1px 4px !important; text-align: center !important;">${numHtml}</td>
            </tr>
            <tr>
              <td class="math-denominator" style="border: none !important; padding: 1px 4px 0 4px !important; text-align: center !important;">${denHtml}</td>
            </tr>
          </tbody>
        `;
        frac.parentNode.replaceChild(table, frac);
      }
    });

    // 2. Unificación de símbolos dentro de la caja gris
    const formulaBoxes = container.querySelectorAll('.math-formula-box');
    formulaBoxes.forEach((box) => {
      const pill = box.querySelector('.math-formula-inner, span[style*="background-color"], span[style*="background:#f8fafc"]');
      if (pill) {
        const strayNodes = Array.from(box.childNodes).filter(
          (node) => node !== pill && !node.classList?.contains('math-formula-label')
        );
        if (strayNodes.length > 0) {
          strayNodes.forEach((node) => {
            pill.appendChild(node);
          });
        }
      }
    });
  };

  useEffect(() => {
    const savedFont = localStorage.getItem(STORAGE_KEY_FONT);
    if (savedFont) setDocFont(savedFont);

    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (savedFontSize) setDocFontSize(savedFontSize);

    const saved = localStorage.getItem(STORAGE_KEY_PAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed.map((_, i) => ({ id: i + 1 })));
          setTimeout(() => {
            parsed.forEach((html, i) => {
              if (pageRefs.current[i]) {
                pageRefs.current[i].innerHTML = html;
                healFormulaBoxes(pageRefs.current[i]);
              }
            });
            updateStatsAndPersist();
          }, 80);
          return;
        }
      } catch (e) {}
    }

    setPages([{ id: 1 }]);
    setTimeout(() => {
      if (pageRefs.current[0]) {
        pageRefs.current[0].innerHTML = DEFAULT_PAGE_1;
        healFormulaBoxes(pageRefs.current[0]);
      }
      updateStatsAndPersist();
    }, 80);

    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel) {
      try { setModelData(JSON.parse(savedModel)); } catch (e) {}
    }
  }, []);

  const handleScrollTracking = () => {
    if (!mainScrollRef.current) return;
    const containerTop = mainScrollRef.current.getBoundingClientRect().top;

    pageRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top - containerTop <= 260 && rect.bottom - containerTop >= 140) {
        setCurrentVisiblePage(index + 1);
        activePageIndex.current = index;
      }
    });
  };

  const scrollToPage = (index) => {
    if (pageRefs.current[index]) {
      pageRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      activePageIndex.current = index;
      setCurrentVisiblePage(index + 1);
    }
  };

  const updateStatsAndPersist = () => {
    let totalWords = 0;
    let totalChars = 0;
    let allText = '';
    const pagesHtml = [];

    pageRefs.current.forEach((el) => {
      if (el) {
        healFormulaBoxes(el);
        const html = el.innerHTML;
        const text = el.innerText || '';
        pagesHtml.push(html);
        allText += ' ' + text;
        const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
        totalWords += words;
        totalChars += text.length;
      }
    });

    setEditorText(allText);
    setStats({ words: totalWords, chars: totalChars, pages: pages.length });

    setAuditData({
      hasHeader: pageRefs.current.some((el) => el && el.querySelector('.no-indent')),
      hasTitle: pageRefs.current.some((el) => el && el.querySelector('h3')),
      headingCount: pageRefs.current.reduce((acc, el) => acc + (el ? el.querySelectorAll('h3, h4').length : 0), 0),
      wordCount: totalWords,
      tableCount: pageRefs.current.reduce((acc, el) => acc + (el ? el.querySelectorAll('table').length : 0), 0),
      hasReferences: pageRefs.current.some((el) => el && el.querySelector('.apa-reference-item')) || allText.toLowerCase().includes('referencias'),
    });

    try {
      localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pagesHtml));
      localStorage.setItem(STORAGE_KEY_FONT, docFont);
      localStorage.setItem(STORAGE_KEY_FONT_SIZE, docFontSize);
      setSaveStatus('Guardado en este equipo');
    } catch (e) {
      setSaveStatus('Memoria llena');
    }
  };

  const handleEditorInput = (index) => {
    activePageIndex.current = index;
    saveCursorPosition();
    const el = pageRefs.current[index];
    if (el) {
      const text = el.innerText || '';
      if (text.trim() === '' && !el.querySelector('p')) {
        el.innerHTML = '<p class="indent-first-line"><br></p>';
      }
    }
    setSaveStatus('Guardando...');
    updateStatsAndPersist();
  };

  const getActivePageEl = () => {
    const idx = activePageIndex.current;
    return pageRefs.current[idx] || pageRefs.current[0];
  };

  const stepOutOfFraction = (fracElement) => {
    let nextNode = fracElement.nextSibling;
    if (!nextNode || (nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent === '')) {
      nextNode = document.createTextNode('\u00A0');
      fracElement.parentNode.insertBefore(nextNode, fracElement.nextSibling);
    }

    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(nextNode, nextNode.nodeType === Node.TEXT_NODE ? 1 : 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    lastRangeRef.current = newRange.cloneRange();
    updateStatsAndPersist();
  };

  // Clics inteligentes: si se hace clic fuera de la píldora gris, el cursor entra a la caja
  const handleEditorClick = (e, index) => {
    activePageIndex.current = index;
    const target = e.target;
    const formulaBox = target.closest('.math-formula-box');

    if (formulaBox) {
      healFormulaBoxes(pageRefs.current[index]);
      const pill = formulaBox.querySelector('.math-formula-inner, span[style*="background-color"], span[style*="background:#f8fafc"]');

      if (pill) {
        // Si el clic fue en el margen o fuera de la píldora gris, colocar el cursor DENTRO de la píldora al final
        if (!pill.contains(target) || target === formulaBox) {
          e.preventDefault();
          e.stopPropagation();

          let lastNode = pill.lastChild;
          if (!lastNode || (lastNode.nodeType === Node.TEXT_NODE && lastNode.textContent === '')) {
            lastNode = document.createTextNode('\u00A0');
            pill.appendChild(lastNode);
          }

          const sel = window.getSelection();
          const newRange = document.createRange();
          newRange.selectNodeContents(pill);
          newRange.collapse(false);
          sel.removeAllRanges();
          sel.addRange(newRange);
          lastRangeRef.current = newRange.cloneRange();
          return;
        }

        // Si se hace clic a la derecha de la fracción dentro de la píldora
        const frac = pill.querySelector('.math-fraction, span[style*="flex-direction: column"], span[style*="flex-direction:column"]');
        if (frac) {
          const fracRect = frac.getBoundingClientRect();
          if (e.clientX > fracRect.right && (!target || !frac.contains(target))) {
            e.preventDefault();
            e.stopPropagation();

            let nextNode = frac.nextSibling;
            if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
              nextNode = document.createTextNode('\u00A0');
              frac.parentNode.insertBefore(nextNode, frac.nextSibling);
            }

            const sel = window.getSelection();
            const newRange = document.createRange();
            newRange.setStart(nextNode, nextNode.length);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            lastRangeRef.current = newRange.cloneRange();
            return;
          }
        }
      }
    }
    saveCursorPosition();
  };

  const handleEditorKeyDown = (e, index) => {
    activePageIndex.current = index;

    // 1. Tabulador
    if (e.key === 'Tab') {
      const sel = window.getSelection();
      const node = sel?.anchorNode;
      const elem = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      const frac = elem?.closest('.math-fraction, span[style*="flex-direction: column"], span[style*="flex-direction:column"]');

      if (frac) {
        e.preventDefault();
        e.stopPropagation();
        stepOutOfFraction(frac);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      insertTabAtCursor();
      return;
    }

    // 2. Escape con flechas
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Escape') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const elem = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

        const frac = elem?.closest('.math-fraction, span[style*="flex-direction: column"], span[style*="flex-direction:column"]');
        if (frac) {
          const isAtEnd = (node.nodeType === Node.TEXT_NODE && range.startOffset === node.length);
          const isDenominator = frac.children.length >= 2 && frac.children[1].contains(elem);
          const isNumerator = frac.children.length >= 1 && frac.children[0].contains(elem);

          if (isDenominator && (isAtEnd || e.key === 'Escape' || e.key === 'ArrowRight')) {
            e.preventDefault();
            e.stopPropagation();
            stepOutOfFraction(frac);
            return;
          }

          if (isNumerator && e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            const den = frac.children[1];
            const newRange = document.createRange();
            newRange.selectNodeContents(den);
            newRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(newRange);
            lastRangeRef.current = newRange.cloneRange();
            return;
          }

          if (isDenominator && e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            const num = frac.children[0];
            const newRange = document.createRange();
            newRange.selectNodeContents(num);
            newRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(newRange);
            lastRangeRef.current = newRange.cloneRange();
            return;
          }
        }

        const scriptElem = elem?.closest('sup, sub');
        if (scriptElem && pageRefs.current[index]?.contains(scriptElem)) {
          const isAtEnd = (node.nodeType === Node.TEXT_NODE && range.startOffset === node.length);
          if (isAtEnd || e.key === 'Escape' || e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();

            let targetNode = scriptElem.nextSibling;
            if (!targetNode || (targetNode.nodeType === Node.TEXT_NODE && targetNode.textContent === '')) {
              const spacer = document.createTextNode('\u00A0');
              scriptElem.parentNode.insertBefore(spacer, scriptElem.nextSibling);
              targetNode = spacer;
            }

            const newRange = document.createRange();
            newRange.setStart(targetNode, targetNode.nodeType === Node.TEXT_NODE ? 1 : 0);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            lastRangeRef.current = newRange.cloneRange();
            updateStatsAndPersist();
            return;
          }
        }
      }
    }

    // 3. Salida de la caja de fórmula con Enter
    if (e.key === 'Enter') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        let node = range.startContainer;
        let elem = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        const formulaBox = elem?.closest('.math-formula-box');

        if (formulaBox) {
          e.preventDefault();
          let nextP = formulaBox.nextElementSibling;
          if (!nextP || nextP.tagName !== 'P') {
            nextP = document.createElement('p');
            nextP.className = 'indent-first-line';
            nextP.innerHTML = '<br>';
            formulaBox.parentNode.insertBefore(nextP, formulaBox.nextSibling);
          }

          const newRange = document.createRange();
          newRange.setStart(nextP, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          lastRangeRef.current = newRange.cloneRange();
          updateStatsAndPersist();
          return;
        }
      }

      const el = pageRefs.current[index];
      if (el && !el.querySelector('p')) {
        e.preventDefault();
        document.execCommand('insertParagraph', false);
      }
    }
  };

  const handleFontChange = (newFont) => {
    setDocFont(newFont);
    let autoSize = docFontSize;
    if (newFont === 'Times New Roman') autoSize = '12pt';
    else if (newFont === 'Arial' || newFont === 'Calibri' || newFont === 'Georgia') autoSize = '11pt';
    setDocFontSize(autoSize);

    const activeEl = getActivePageEl();
    if (!activeEl) return;
    activeEl.focus();

    const sel = window.getSelection();
    const savedRange = lastRangeRef.current;
    const hasSelection = savedRange && !savedRange.collapsed && activeEl.contains(savedRange.commonAncestorContainer);

    if (hasSelection) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange);
        document.execCommand('fontName', false, newFont);
        saveCursorPosition();
      } catch (e) {}
    } else {
      pageRefs.current.forEach((pageEl) => {
        if (!pageEl) return;
        pageEl.style.fontFamily = newFont;
        pageEl.style.fontSize = autoSize;
        pageEl.querySelectorAll('*').forEach((el) => {
          if (el.style && el.style.fontFamily) el.style.fontFamily = '';
          if (el.hasAttribute('face')) el.removeAttribute('face');
        });
      });
      if (savedRange && activeEl.contains(savedRange.commonAncestorContainer)) {
        try { sel.removeAllRanges(); sel.addRange(savedRange); } catch (e) {}
      }
      document.execCommand('fontName', false, newFont);
    }

    try {
      localStorage.setItem(STORAGE_KEY_FONT, newFont);
      localStorage.setItem(STORAGE_KEY_FONT_SIZE, autoSize);
    } catch (e) {}
    updateStatsAndPersist();
  };

  const handleFontSizeChange = (newSize) => {
    setDocFontSize(newSize);
    const activeEl = getActivePageEl();
    if (!activeEl) return;
    activeEl.focus();

    const sel = window.getSelection();
    const savedRange = lastRangeRef.current;
    const hasSelection = savedRange && !savedRange.collapsed && activeEl.contains(savedRange.commonAncestorContainer);

    if (hasSelection) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange);
        document.execCommand('fontSize', false, '7');
        activeEl.querySelectorAll('font[size="7"]').forEach((tag) => {
          tag.removeAttribute('size');
          tag.style.fontSize = newSize;
        });
        saveCursorPosition();
      } catch (e) {}
    } else {
      pageRefs.current.forEach((pageEl) => {
        if (!pageEl) return;
        pageEl.style.fontSize = newSize;
        pageEl.querySelectorAll('p, div, span, td, th').forEach((el) => {
          if (!el.closest('h3, h4, .page-header-overlay')) {
            if (el.style && el.style.fontSize) el.style.fontSize = '';
            if (el.hasAttribute('size')) el.removeAttribute('size');
          }
        });
      });
      if (savedRange && activeEl.contains(savedRange.commonAncestorContainer)) {
        try { sel.removeAllRanges(); sel.addRange(savedRange); } catch (e) {}
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_FONT_SIZE, newSize);
    } catch (e) {}
    updateStatsAndPersist();
  };

  const insertTabAtCursor = () => {
    const activeEl = getActivePageEl();
    if (!activeEl) return;
    activeEl.focus();
    let sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0) {
      const curRange = sel.getRangeAt(0);
      if (activeEl.contains(curRange.commonAncestorContainer)) range = curRange;
    }

    if (!range && lastRangeRef.current && activeEl.contains(lastRangeRef.current.commonAncestorContainer)) {
      range = lastRangeRef.current;
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (!range) {
      sel = window.getSelection();
      if (sel && sel.rangeCount > 0) range = sel.getRangeAt(0);
    }

    if (range) {
      range.deleteContents();
      const tabNode = document.createTextNode('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0');
      range.insertNode(tabNode);
      const newRange = document.createRange();
      newRange.setStartAfter(tabNode);
      newRange.setEndAfter(tabNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      lastRangeRef.current = newRange.cloneRange();
      updateStatsAndPersist();
    }
  };

  const handleFormatMathNumber = () => {
    const activeEl = getActivePageEl();
    if (!activeEl) return;
    activeEl.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText.trim().length > 0) {
      const span = document.createElement('span');
      span.className = 'math-number';
      span.textContent = selectedText;
      range.deleteContents();
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      lastRangeRef.current = newRange.cloneRange();
    } else {
      document.execCommand('fontName', false, 'Cambria Math');
    }
    updateStatsAndPersist();
  };

  const handleInsertNewPage = () => {
    const newId = Date.now();
    setPages((prev) => [...prev, { id: newId }]);

    setTimeout(() => {
      const nextIdx = pages.length;
      if (pageRefs.current[nextIdx]) {
        pageRefs.current[nextIdx].innerHTML = '<p class="indent-first-line"><br></p>';
        pageRefs.current[nextIdx].style.fontFamily = docFont;
        pageRefs.current[nextIdx].style.fontSize = docFontSize;
        pageRefs.current[nextIdx].focus();
        scrollToPage(nextIdx);
      }
      updateStatsAndPersist();
    }, 60);
  };

  const handleDeletePage = (indexToDelete) => {
    if (pages.length <= 1) {
      alert("El documento debe tener al menos una hoja.");
      return;
    }
    if (window.confirm(`¿Deseas eliminar la Hoja ${indexToDelete + 1}?`)) {
      setPages((prev) => prev.filter((_, idx) => idx !== indexToDelete));
      pageRefs.current.splice(indexToDelete, 1);
      const targetIdx = Math.max(0, indexToDelete - 1);
      scrollToPage(targetIdx);
      setTimeout(() => updateStatsAndPersist(), 60);
    }
  };

  const handleNewBlankPage = () => {
    if (window.confirm("¿Deseas vaciar todo el trabajo y empezar con una sola hoja en blanco?")) {
      setPages([{ id: 1 }]);
      pageRefs.current = [];
      setTimeout(() => {
        if (pageRefs.current[0]) {
          pageRefs.current[0].innerHTML = '<p class="indent-first-line"><br></p>';
          pageRefs.current[0].style.fontFamily = docFont;
          pageRefs.current[0].style.fontSize = docFontSize;
          pageRefs.current[0].focus();
          scrollToPage(0);
        }
        updateStatsAndPersist();
      }, 60);
    }
  };

  const handleApplyApaDefaultStyle = () => {
    const el = getActivePageEl();
    if (!el) return;
    el.focus();
    document.execCommand('justifyLeft', false, null);
    handleFontChange('Times New Roman');
    handleFontSizeChange('12pt');

    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === 3) node = node.parentNode;
      const p = node.closest('p');
      if (p) {
        p.className = 'indent-first-line';
        p.style.lineHeight = '2.0';
        p.style.textAlign = 'left';
      }
    }
    updateStatsAndPersist();
  };

  const handleApplyIndentStyle = (indentType) => {
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === 3) node = node.parentNode;
      const p = node.closest('p');
      if (p) {
        p.classList.remove('indent-first-line', 'indent-hanging', 'indent-none', 'indent-block');
        if (indentType === 'firstLine') p.classList.add('indent-first-line');
        else if (indentType === 'hanging') p.classList.add('indent-hanging');
        else if (indentType === 'none') p.classList.add('indent-none');
        else if (indentType === 'block') p.classList.add('indent-block');
      }
    }
    updateStatsAndPersist();
  };

  // Inserción de Símbolos asegurando entrada a la caja de fórmula
  const handleInsertSymbol = (symbolData) => {
    const activeEl = getActivePageEl();
    if (!activeEl) return;
    activeEl.focus();

    // Si el cursor estaba en la fila de la fórmula, garantizar que el foco esté DENTRO de la píldora gris
    if (lastRangeRef.current) {
      let node = lastRangeRef.current.startContainer;
      let elem = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      const formulaBox = elem?.closest('.math-formula-box');

      if (formulaBox) {
        const pill = formulaBox.querySelector('.math-formula-inner, span[style*="background-color"], span[style*="background:#f8fafc"]');
        if (pill && !pill.contains(node)) {
          const sel = window.getSelection();
          const newRange = document.createRange();
          newRange.selectNodeContents(pill);
          newRange.collapse(false);
          sel.removeAllRanges();
          sel.addRange(newRange);
          lastRangeRef.current = newRange.cloneRange();
        }
      }
    }

    const char = typeof symbolData === 'string' ? symbolData : symbolData.char;
    const isOp = typeof symbolData === 'object' && symbolData.isOperator;
    const fontStyle = isOp ? 'normal' : 'italic';

    const symbolHtml = `<span class="math-symbol ${isOp ? 'math-operator' : ''}" style="font-family: 'Cambria Math', 'STIX Two Math', 'Latin Modern Math', 'Computer Modern', serif; font-style: ${fontStyle};">${char}</span>&nbsp;`;
    handleInsertSnippet(symbolHtml);
  };

  // Inserción precisa en la posición del cursor (sin saltos al inicio de la página)
  const handleInsertSnippet = (snippetHtml) => {
    const activeEl = getActivePageEl();
    if (!activeEl) return;
    activeEl.focus();

    const sel = window.getSelection();
    let range = null;

    // Recupera la posición exacta que tenía el cursor antes de abrir el modal
    if (lastRangeRef.current && activeEl.contains(lastRangeRef.current.commonAncestorContainer)) {
      range = lastRangeRef.current.cloneRange();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (sel && sel.rangeCount > 0 && activeEl.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      range = sel.getRangeAt(0);
    }

    if (!range) {
      // Si por alguna razón no hay rango, lo coloca al final del documento y no arriba
      range = document.createRange();
      range.selectNodeContents(activeEl);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Convertir el HTML a nodos reales
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = snippetHtml;
    const fragment = document.createDocumentFragment();
    let lastInsertedNode = null;

    while (tempDiv.firstChild) {
      lastInsertedNode = tempDiv.firstChild;
      fragment.appendChild(lastInsertedNode);
    }

    // Si es un bloque de fórmula y el cursor está en un párrafo vacío (<p><br></p>), reemplaza el párrafo
    const startNode = range.startContainer;
    const currentElem = startNode.nodeType === Node.TEXT_NODE ? startNode.parentElement : startNode;
    const currentP = currentElem?.closest('p');

    if (currentP && snippetHtml.includes('math-equation-block')) {
      if (currentP.textContent.trim() === '') {
        currentP.parentNode.insertBefore(fragment, currentP);
        currentP.remove();
      } else {
        // Si el párrafo tiene texto, inserta la fórmula inmediatamente debajo
        if (currentP.nextSibling) {
          currentP.parentNode.insertBefore(fragment, currentP.nextSibling);
        } else {
          currentP.parentNode.appendChild(fragment);
        }
      }
    } else {
      // Inserción en línea estándar
      range.deleteContents();
      range.insertNode(fragment);
    }

    // Posiciona el cursor inmediatamente después de la fórmula insertada
    if (lastInsertedNode) {
      const nextP = document.createElement('p');
      nextP.className = 'indent-first-line';
      nextP.innerHTML = '<br>';

      if (lastInsertedNode.parentNode) {
        lastInsertedNode.parentNode.insertBefore(nextP, lastInsertedNode.nextSibling);
        const newRange = document.createRange();
        newRange.setStart(nextP, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        lastRangeRef.current = newRange.cloneRange();
      }
    }

    updateStatsAndPersist();
  };

  const handleResetDocument = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el documento a la plantilla inicial?")) {
      setPages([{ id: 1 }]);
      pageRefs.current = [];
      localStorage.removeItem(STORAGE_KEY_PAGES);
      setTimeout(() => {
        if (pageRefs.current[0]) {
          pageRefs.current[0].innerHTML = DEFAULT_PAGE_1;
          pageRefs.current[0].style.fontFamily = docFont;
          pageRefs.current[0].style.fontSize = docFontSize;
          scrollToPage(0);
        }
        updateStatsAndPersist();
      }, 60);
    }
  };

  const handleInsertHeader = () => {
    const headerHtml = `
      <div class="no-indent" style="line-height: 1.3; margin-bottom: 2em;">
        <div><strong>Bollorino Montoya, Favio</strong></div>
        <div>Guayaquil, 27 de octubre del 2026</div>
        <div>Deber 01</div>
        <div>Estadística / Matemáticas</div>
      </div>
      <h3 style="text-align: center; font-weight: bold; margin-bottom: 1.5em;">
        Trabajo de Investigación: Población y Muestra Estadística
      </h3>
    `;
    handleInsertSnippet(headerHtml);
  };

  const handleExportWord = async () => {
    await exportToDocx(pageRefs.current, 'Investigacion_Estadistica_APA7.docx', {
      font: docFont,
      size: docFontSize,
    });
  };

  const handleExportPdf = async () => {
    try {
      setSaveStatus('Generando PDF...');
      await exportToPdf(null, 'Investigacion_Estadistica_APA7.pdf');
      setSaveStatus('PDF descargado');
    } catch (e) {
      alert("Error al generar PDF: " + e.message);
    }
  };

  const handleUploadModel = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setSaveStatus('Leyendo modelo...');
      let html = '';
      let rawText = '';

      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        html = result.value;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        rawText = tempDiv.innerText;
      } else {
        rawText = await file.text();
        html = `<p>${rawText.replace(/\n\n/g, '</p><p>')}</p>`;
      }

      const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const extractedSections = [];

      lines.forEach((line) => {
        if (
          line.startsWith('#') ||
          /^pregunta\s+\d+/i.test(line) ||
          /^ejemplo\s+\d+/i.test(line) ||
          /^ejercicio\s+\d+/i.test(line) ||
          line.toLowerCase().includes('investigación:') ||
          line.toLowerCase().includes('referencias') ||
          line.toLowerCase().includes('fórmulas') ||
          (line.length < 80 && line.endsWith(':'))
        ) {
          extractedSections.push({ title: line.replace(/^#+\s*/, ''), content: '' });
        } else if (extractedSections.length > 0) {
          if (!extractedSections[extractedSections.length - 1].content) {
            extractedSections[extractedSections.length - 1].content = line.slice(0, 160);
          }
        }
      });

      const finalSections =
        extractedSections.length > 0
          ? extractedSections
          : lines.slice(0, 8).map((l) => ({ title: l.slice(0, 60), content: '' }));

      const newModel = { fileName: file.name, html, text: rawText, sections: finalSections };
      setModelData(newModel);
      setIsModelDrawerOpen(true);
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(newModel));
      setSaveStatus('Modelo cargado');
    } catch (error) {
      alert('Error al leer el archivo modelo: ' + error.message);
    } finally {
      e.target.value = '';
    }
  };

  const marginStyle = `${layout.marginSize}cm`;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#edf2f7] overflow-hidden select-none">
      <Toolbar
        onInsertHeader={handleInsertHeader}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onOpenFigureModal={() => setIsFigureModalOpen(true)}
        onOpenReferenceModal={() => setIsRefModalOpen(true)}
        onOpenMathModal={() => setIsMathModalOpen(true)}
        onOpenSymbolModal={() => setIsSymbolModalOpen(true)}
        onApplyApaDefaultStyle={handleApplyApaDefaultStyle}
        onApplyIndentStyle={handleApplyIndentStyle}
        onOpenLayoutModal={() => setIsLayoutModalOpen(true)}
        onToggleAudit={() => setIsAuditOpen(!isAuditOpen)}
        onToggleModelDrawer={() => setIsModelDrawerOpen(!isModelDrawerOpen)}
        hasModelLoaded={!!modelData}
        onInsertNewPage={handleInsertNewPage}
        onNewBlankPage={handleNewBlankPage}
        onResetDocument={handleResetDocument}
        onExportWord={handleExportWord}
        onExportPdf={handleExportPdf}
        onUploadModel={handleUploadModel}
        onInsertTab={insertTabAtCursor}
        onFormatMathNumber={handleFormatMathNumber}
        currentFont={docFont}
        onFontChange={handleFontChange}
        currentFontSize={docFontSize}
        onFontSizeChange={handleFontSizeChange}
        saveStatus={saveStatus}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <main
          ref={mainScrollRef}
          onScroll={handleScrollTracking}
          className="flex-1 overflow-y-auto py-10 px-6 flex flex-col items-center scroll-smooth"
        >
          {pages.map((page, index) => (
            <div key={page.id} className="relative mb-12 flex flex-col items-center">
              <div className="w-full flex items-center justify-between px-2 pb-1.5 text-xs text-slate-500 no-print">
                <span className="font-sans font-medium text-[11px] text-slate-400">
                  Página {index + 1} de {pages.length}
                </span>
                {pages.length > 1 && (
                  <button
                    onClick={() => handleDeletePage(index)}
                    className="hover:text-red-600 text-[11px] px-2 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
                    title="Eliminar esta hoja"
                  >
                    Eliminar página
                  </button>
                )}
              </div>

              <div
                className={`paper-sheet size-${layout.paperSize}`}
                style={{
                  padding: marginStyle,
                  fontFamily: docFont,
                  fontSize: docFontSize,
                }}
              >
                <div
                  className="page-header-overlay"
                  style={{
                    top: `calc(${marginStyle} / 2)`,
                    left: marginStyle,
                    right: marginStyle,
                    fontFamily: docFont,
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                      {layout.headerText}
                    </span>
                    {layout.showPageNumber && (
                      <span className="text-base font-normal text-slate-800">{index + 1}</span>
                    )}
                  </div>
                </div>

                <div
                  ref={(el) => (pageRefs.current[index] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => handleEditorInput(index)}
                  onFocus={() => {
                    activePageIndex.current = index;
                    setCurrentVisiblePage(index + 1);
                    saveCursorPosition();
                  }}
                  onClick={(e) => handleEditorClick(e, index)}
                  onKeyUp={saveCursorPosition}
                  onMouseUp={saveCursorPosition}
                  onKeyDown={(e) => handleEditorKeyDown(e, index)}
                  className="editor-body select-text"
                  style={{
                    lineHeight: layout.lineHeight,
                    fontFamily: docFont,
                    fontSize: docFontSize,
                  }}
                  spellCheck="true"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleInsertNewPage}
            className="no-print my-6 px-6 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium shadow-2xs flex items-center gap-2 transition-all hover:shadow-xs"
          >
            <span className="text-blue-700 font-bold">+</span> Agregar Página Siguiente (Página {pages.length + 1})
          </button>
        </main>

        {pages.length > 1 && (
          <aside className="no-print absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-lg rounded-full py-3 px-2 flex flex-col items-center gap-2 z-20">
            <button
              onClick={() => scrollToPage(Math.max(0, currentVisiblePage - 2))}
              disabled={currentVisiblePage <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
              title="Desplazarse a la hoja anterior"
            >
              ▲
            </button>

            <div className="text-[11px] font-sans font-bold text-slate-700 py-1 px-1.5 rounded text-center leading-none">
              <span className="text-blue-700 text-sm block">{currentVisiblePage}</span>
              <span className="text-[9px] text-slate-400">de {pages.length}</span>
            </div>

            <button
              onClick={() => scrollToPage(Math.min(pages.length - 1, currentVisiblePage))}
              disabled={currentVisiblePage >= pages.length}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold"
              title="Desplazarse a la siguiente hoja"
            >
              ▼
            </button>

            <div className="w-4 h-px bg-slate-200 my-0.5"></div>

            <button
              onClick={handleInsertNewPage}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-sm font-bold"
              title="Añadir nueva hoja"
            >
              +
            </button>
          </aside>
        )}

        {isAuditOpen && (
          <ApaAuditSidebar isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} auditData={auditData} />
        )}

        {isModelDrawerOpen && modelData && (
          <ModelComparisonDrawer
            isOpen={isModelDrawerOpen}
            onClose={() => setIsModelDrawerOpen(false)}
            modelData={modelData}
            editorText={editorText}
            onInsertSnippet={handleInsertSnippet}
          />
        )}
      </div>

      <footer className="h-6 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-500 font-sans no-print select-none">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-slate-700">Página {currentVisiblePage} de {stats.pages}</span>
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <span>Fuente: {docFont} ({docFontSize})</span>
          <span>|</span>
          <span>APA 7.ª Edición</span>
        </div>
      </footer>

      <SymbolModal isOpen={isSymbolModalOpen} onClose={() => setIsSymbolModalOpen(false)} onInsertSymbol={handleInsertSymbol} />
      <LayoutModal isOpen={isLayoutModalOpen} onClose={() => setIsLayoutModalOpen(false)} layout={layout} onChangeLayout={setLayout} />
      <MathModal isOpen={isMathModalOpen} onClose={() => setIsMathModalOpen(false)} onInsert={handleInsertSnippet} />
      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsert={handleInsertSnippet} />
      <FigureModal isOpen={isFigureModalOpen} onClose={() => setIsFigureModalOpen(false)} onInsert={handleInsertSnippet} />
      <ReferenceModal isOpen={isRefModalOpen} onClose={() => setIsRefModalOpen(false)} onInsertReference={handleInsertSnippet} onInsertInTextCitation={(text) => handleInsertSnippet(`<span>${text}</span>`)} />
    </div>
  );
}