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
const MODEL_STORAGE_KEY = 'apa7_teacher_model_data';

const DEFAULT_PAGE_1 = `
  <div class="no-indent" style="line-height: 1.3; margin-bottom: 2em;">
    <div><strong>Bollorino Montoya, Favio</strong></div>
    <div>Guayaquil, 19 de octubre de 2026</div>
    <div>Deber 01</div>
    <div>Estadística / Matemáticas</div>
  </div>

  <h3>Trabajo de Investigación: Población y Muestra Estadística</h3>

  <h4>Pregunta 1: ¿Qué es la población y la muestra en estadística?</h4>
  <p class="indent-first-line">
    En el análisis estadístico y la investigación cuantitativa, la delimitación precisa del universo de estudio y de la fracción observable constituye el punto de partida fundamental para cualquier inferencia válida. En palabras de Triola (2018), la "población es el conjunto completo de todos los elementos que se van a estudiar" (p. 5), mientras que la muestra representa un subconjunto de miembros seleccionados con la finalidad de obtener información representativa.
  </p>

  <h4>Pregunta 2: ¿Para qué sirven el cálculo de la población y de la muestra?</h4>
  <p class="indent-first-line">
    En la práctica científica y social, la recolección de información sobre la totalidad de los miembros resulta frecuentemente inviable debido a limitaciones presupuestarias y de tiempo. En consecuencia, el dimensionamiento de la muestra permite determinar el número mínimo indispensable de observaciones requeridas para obtener estimaciones precisas con un margen de error cuantificable.
  </p>
`;

export default function App() {
  // Lista de páginas físicas activas
  const [pages, setPages] = useState([{ id: 1 }]);
  const pageRefs = useRef([]);
  const activePageIndex = useRef(0);

  // Modales
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Modelo del Docente
  const [modelData, setModelData] = useState(null);
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false);

  // Disposición APA 7
  const [layout, setLayout] = useState({
    paperSize: 'letter',
    marginSize: '2.54',
    lineHeight: '2.0',
    showPageNumber: true,
    headerText: '',
  });

  const [stats, setStats] = useState({ words: 0, chars: 0, pages: 1 });
  const [editorText, setEditorText] = useState('');
  const [saveStatus, setSaveStatus] = useState('Guardado');
  const [auditData, setAuditData] = useState({
    hasHeader: false,
    hasTitle: false,
    headingCount: 0,
    wordCount: 0,
    tableCount: 0,
    hasReferences: false,
  });

  // Carga inicial y restauración de páginas
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed.map((_, i) => ({ id: i + 1 })));
          setTimeout(() => {
            parsed.forEach((html, i) => {
              if (pageRefs.current[i]) pageRefs.current[i].innerHTML = html;
            });
            updateStatsAndPersist();
          }, 80);
          return;
        }
      } catch (e) {}
    }

    // Inicialización por defecto
    setPages([{ id: 1 }]);
    setTimeout(() => {
      if (pageRefs.current[0]) {
        pageRefs.current[0].innerHTML = DEFAULT_PAGE_1;
      }
      updateStatsAndPersist();
    }, 80);

    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel) {
      try { setModelData(JSON.parse(savedModel)); } catch (e) {}
    }
  }, []);

  // Actualiza estadísticas y persiste el array de páginas en LocalStorage
  const updateStatsAndPersist = () => {
    let totalWords = 0;
    let totalChars = 0;
    let allText = '';
    const pagesHtml = [];

    pageRefs.current.forEach((el) => {
      if (el) {
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
    setStats({
      words: totalWords,
      chars: totalChars,
      pages: pages.length,
    });

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
      setSaveStatus('Guardado en navegador');
    } catch (e) {
      setSaveStatus('Memoria llena');
    }
  };

  const handleEditorInput = (index) => {
    activePageIndex.current = index;
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

  // Insertar Nueva Hoja en Blanco Independiente (como en Word)
  const handleInsertNewPage = () => {
    const newId = Date.now();
    setPages((prev) => [...prev, { id: newId }]);

    setTimeout(() => {
      const nextIdx = pages.length;
      if (pageRefs.current[nextIdx]) {
        pageRefs.current[nextIdx].innerHTML = '<p class="indent-first-line"><br></p>';
        pageRefs.current[nextIdx].focus();
        activePageIndex.current = nextIdx;
      }
      updateStatsAndPersist();
    }, 60);
  };

  // Eliminar una hoja específica
  const handleDeletePage = (indexToDelete) => {
    if (pages.length <= 1) {
      alert("El documento debe tener al menos una hoja.");
      return;
    }
    if (window.confirm(`¿Seguro que deseas eliminar la Hoja ${indexToDelete + 1}? Se borrará su contenido.`)) {
      setPages((prev) => prev.filter((_, idx) => idx !== indexToDelete));
      pageRefs.current.splice(indexToDelete, 1);
      activePageIndex.current = Math.max(0, indexToDelete - 1);
      setTimeout(() => updateStatsAndPersist(), 60);
    }
  };

  // Vaciar a una sola hoja en blanco
  const handleNewBlankPage = () => {
    if (window.confirm("¿Deseas vaciar todo el trabajo y empezar desde una sola hoja en blanco?")) {
      setPages([{ id: 1 }]);
      pageRefs.current = [];
      setTimeout(() => {
        if (pageRefs.current[0]) {
          pageRefs.current[0].innerHTML = '<p class="indent-first-line"><br></p>';
          pageRefs.current[0].focus();
          activePageIndex.current = 0;
        }
        updateStatsAndPersist();
      }, 60);
    }
  };

  // Botón Maestro APA 7
  const handleApplyApaDefaultStyle = () => {
    const el = getActivePageEl();
    if (!el) return;
    el.focus();
    document.execCommand('justifyLeft', false, null);
    document.execCommand('fontName', false, 'Times New Roman');
    document.execCommand('fontSize', false, '3');

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

  const handleInsertSymbol = (char) => {
    const el = getActivePageEl();
    if (!el) return;
    el.focus();
    document.execCommand('insertText', false, char);
    updateStatsAndPersist();
  };

  const handleInsertSnippet = (snippetHtml) => {
    const el = getActivePageEl();
    if (!el) return;
    el.focus();
    document.execCommand('insertHTML', false, snippetHtml);
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
          activePageIndex.current = 0;
        }
        updateStatsAndPersist();
      }, 60);
    }
  };

  const handleInsertHeader = () => {
    const headerHtml = `
      <div class="no-indent" style="line-height: 1.3; margin-bottom: 2em;">
        <div><strong>Bollorino Montoya, Favio</strong></div>
        <div>Guayaquil, 19 de octubre de 2026</div>
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
    await exportToDocx(pageRefs.current, 'Investigacion_Estadistica_APA7.docx');
  };

  const handleExportPdf = async () => {
    try {
      setSaveStatus('Generando PDF...');
      await exportToPdf(pageRefs.current, 'Investigacion_Estadistica_APA7.pdf', layout.headerText);
      setSaveStatus('PDF descargado con éxito');
    } catch (e) {
      alert("Error al generar PDF: " + e.message);
    }
  };

  const handleUploadModel = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setSaveStatus('Analizando modelo...');
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
    <div className="min-h-screen flex flex-col bg-slate-950">
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
        saveStatus={saveStatus}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Espacio de trabajo (Desk) tipo Word con hojas separadas */}
        <main className="flex-1 overflow-y-auto py-10 px-6 flex flex-col items-center">
          {pages.map((page, index) => (
            <div key={page.id} className="relative mb-12 flex flex-col items-center">
              {/* Barra superior de la hoja: Etiqueta y botón de eliminar */}
              <div className="w-full flex items-center justify-between px-2 pb-2 text-xs text-slate-400 no-print">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  Hoja {index + 1} de {pages.length}
                </span>
                {pages.length > 1 && (
                  <button
                    onClick={() => handleDeletePage(index)}
                    className="hover:text-rose-400 text-[11px] px-2 py-0.5 rounded hover:bg-slate-900 transition-colors"
                    title="Eliminar esta hoja del documento"
                  >
                    🗑️ Eliminar Hoja
                  </button>
                )}
              </div>

              {/* Hoja Física Carta */}
              <div
                className={`paper-sheet size-${layout.paperSize}`}
                style={{ padding: marginStyle }}
              >
                {/* Encabezado Superior APA */}
                <div
                  className="page-header-overlay"
                  style={{
                    top: `calc(${marginStyle} / 2)`,
                    left: marginStyle,
                    right: marginStyle,
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs uppercase tracking-wider text-slate-700">
                      {layout.headerText}
                    </span>
                    {layout.showPageNumber && (
                      <span className="font-times text-base font-normal">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Área de Escritura de esta Hoja */}
                <div
                  ref={(el) => (pageRefs.current[index] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => handleEditorInput(index)}
                  onFocus={() => (activePageIndex.current = index)}
                  className="editor-body"
                  style={{ lineHeight: layout.lineHeight }}
                  spellCheck="true"
                />
              </div>
            </div>
          ))}

          {/* Botón flotante al final del documento para añadir otra hoja */}
          <button
            onClick={handleInsertNewPage}
            className="no-print my-6 px-6 py-3 border-2 border-dashed border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:bg-slate-900"
          >
            <span className="text-base text-blue-400">+</span> Añadir Nueva Hoja en Blanco (Hoja {pages.length + 1})
          </button>
        </main>

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

      <footer className="h-7 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-400 no-print">
        <div className="flex items-center space-x-4">
          <span>Hojas totales: {stats.pages}</span>
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-500">
          <span>{modelData ? `Modelo: ${modelData.fileName}` : 'Sin modelo'}</span>
          <span>|</span>
          <span>Márgenes: {layout.marginSize} cm</span>
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