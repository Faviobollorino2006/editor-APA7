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
  const [saveStatus, setSaveStatus] = useState('Guardado en este equipo');
  const [auditData, setAuditData] = useState({
    hasHeader: false,
    hasTitle: false,
    headingCount: 0,
    wordCount: 0,
    tableCount: 0,
    hasReferences: false,
  });

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

    setPages([{ id: 1 }]);
    setTimeout(() => {
      if (pageRefs.current[0]) pageRefs.current[0].innerHTML = DEFAULT_PAGE_1;
      updateStatsAndPersist();
    }, 80);

    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel) {
      try { setModelData(JSON.parse(savedModel)); } catch (e) {}
    }
  }, []);

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
      setSaveStatus('Guardado en este equipo');
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

  const handleDeletePage = (indexToDelete) => {
    if (pages.length <= 1) {
      alert("El documento debe tener al menos una hoja.");
      return;
    }
    if (window.confirm(`¿Deseas eliminar la Hoja ${indexToDelete + 1}?`)) {
      setPages((prev) => prev.filter((_, idx) => idx !== indexToDelete));
      pageRefs.current.splice(indexToDelete, 1);
      activePageIndex.current = Math.max(0, indexToDelete - 1);
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
          pageRefs.current[0].focus();
          activePageIndex.current = 0;
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
      setSaveStatus('Generando archivo PDF...');
      await exportToPdf(null, 'Investigacion_Estadistica_APA7.pdf');
      setSaveStatus('PDF descargado con éxito');
    } catch (e) {
      alert("Error al generar el PDF: " + e.message);
      setSaveStatus('Error al generar PDF');
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

    const handleEditorKeyDown = (e, index) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      updateStatsAndPersist();
    }
  };
    };
  

  const marginStyle = `${layout.marginSize}cm`;

  return (
    <div className="min-h-screen flex flex-col bg-[#edf2f7]">
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
        {/* Escritorio Diurno Tipo Word */}
        <main className="flex-1 overflow-y-auto py-10 px-6 flex flex-col items-center">
          {pages.map((page, index) => (
            <div key={page.id} className="relative mb-10 flex flex-col items-center">
              
              {/* Cabecera sutil de la página */}
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

              {/* Hoja Física Carta con sombra suave */}
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
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                      {layout.headerText}
                    </span>
                    {layout.showPageNumber && (
                      <span className="font-times text-base font-normal text-slate-800">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Lienzo de Escritura */}
                <div
                  ref={(el) => (pageRefs.current[index] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => handleEditorInput(index)}
                  onFocus={() => (activePageIndex.current = index)}
                  onKeyDown={(e) => handleEditorKeyDown(e, index)}
                  onInsertTab={() => handleInsertSnippet('&nbsp;&nbsp;&nbsp;&nbsp;')}
                  className="editor-body"
                  style={{ lineHeight: layout.lineHeight }}
                  spellCheck="true"
                />
              </div>
            </div>
          ))}

          {/* Botón sobrio para agregar página */}
          <button
            onClick={handleInsertNewPage}
            className="no-print my-4 px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium shadow-2xs flex items-center gap-2 transition-all"
          >
            <span className="text-blue-700 font-bold">+</span> Agregar Página Siguiente (Página {pages.length + 1})
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

      {/* Barra de Estado Inferior estilo Microsoft Word */}
      <footer className="h-6 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-500 font-sans no-print select-none">
        <div className="flex items-center space-x-4">
          <span>Página {pages.length > 1 ? `1-${pages.length}` : '1'} de {stats.pages}</span>
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <span>{modelData ? `Modelo: ${modelData.fileName}` : 'Sin modelo de referencia'}</span>
          <span>|</span>
          <span>Español (Latinoamérica)</span>
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
