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

const STORAGE_KEY = 'apa7_stats_document_draft';
const MODEL_STORAGE_KEY = 'apa7_teacher_model_data';

const DEFAULT_TEMPLATE = `
  <div class="no-indent" style="line-height: 1.3; margin-bottom: 2em;">
    <div><strong>Bollorino Montoya, Favio</strong></div>
    <div>Guayaquil, 19 de octubre de 2026</div>
    <div>Deber 01</div>
    <div>Estadística / Matemáticas</div>
  </div>

  <h3>Trabajo de Investigación: Población y Muestra Estadística</h3>

  <h4>Pregunta 1: ¿Qué es la población y la muestra en estadística?</h4>
  <p>
    En el análisis estadístico y la investigación cuantitativa, la delimitación precisa del universo de estudio y de la fracción observable constituye el punto de partida fundamental para cualquier inferencia válida. En palabras de Triola (2018), la "población es el conjunto completo de todos los elementos que se van a estudiar" (p. 5), mientras que la muestra representa un subconjunto de miembros seleccionados con la finalidad de obtener información representativa.
  </p>

  <h4>Pregunta 2: ¿Para qué sirven el cálculo de la población y de la muestra?</h4>
  <p>
    En la práctica científica y social, la recolección de información sobre la totalidad de los miembros resulta frecuentemente inviable debido a limitaciones presupuestarias y de tiempo. En consecuencia, el dimensionamiento de la muestra permite determinar el número mínimo indispensable de observaciones requeridas para obtener estimaciones precisas con un margen de error cuantificable.
  </p>
`;

export default function App() {
  const editorRef = useRef(null);

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

  // Configuración de Disposición
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

  useEffect(() => {
    if (editorRef.current) {
      const savedHtml = localStorage.getItem(STORAGE_KEY);
      if (savedHtml) {
        editorRef.current.innerHTML = savedHtml;
      } else {
        editorRef.current.innerHTML = DEFAULT_TEMPLATE;
      }
      updateStatsAndPersist();
    }

    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel) {
      try {
        setModelData(JSON.parse(savedModel));
      } catch (e) {}
    }
  }, []);

  const updateStatsAndPersist = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';

    setEditorText(text);

    const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const chars = text.length;
    const pageBreaks = editorRef.current.querySelectorAll('.apa-page-break-container').length;

    setStats({ words, chars, pages: pageBreaks + 1 });

    setAuditData({
      hasHeader: !!editorRef.current.querySelector('.no-indent'),
      hasTitle: !!editorRef.current.querySelector('h3'),
      headingCount: editorRef.current.querySelectorAll('h3, h4').length,
      wordCount: words,
      tableCount: editorRef.current.querySelectorAll('table').length,
      hasReferences:
        !!editorRef.current.querySelector('.apa-reference-item') ||
        text.toLowerCase().includes('referencias'),
    });

    try {
      localStorage.setItem(STORAGE_KEY, html);
      setSaveStatus('Guardado en navegador');
    } catch (e) {
      setSaveStatus('Memoria llena');
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      if (text.trim() === '' && !editorRef.current.querySelector('p')) {
        editorRef.current.innerHTML = '<p><br></p>';
      }
    }
    setSaveStatus('Guardando...');
    updateStatsAndPersist();
  };

  const handleEditorClick = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText?.trim() || '';
      if (!text && !editorRef.current.querySelector('p')) {
        editorRef.current.innerHTML = '<p><br></p>';
      }
    }
  };

  // Botón Maestro: Aplica las reglas puras de APA 7 al párrafo actual
  const handleApplyApaDefaultStyle = () => {
    if (!editorRef.current) return;
    document.execCommand('justifyLeft', false, null);
    document.execCommand('fontName', false, 'Times New Roman');
    document.execCommand('fontSize', false, '3'); // 12pt

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

  // Control manual de sangrías (1.ª línea, francesa, sin sangría, bloque)
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

  // Inserción directa de un símbolo en el cursor
  const handleInsertSymbol = (char) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertText', false, char);
    updateStatsAndPersist();
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

      const newModel = {
        fileName: file.name,
        html,
        text: rawText,
        sections: finalSections,
      };

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

  const handleInsertSnippet = (snippetHtml) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, snippetHtml);
    updateStatsAndPersist();
  };

  const handleNewBlankPage = () => {
    if (window.confirm('¿Deseas vaciar el documento para empezar en una hoja en blanco?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p class="indent-first-line"><br></p>';
        updateStatsAndPersist();
        editorRef.current.focus();
      }
    }
  };

  const handleInsertNewPage = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const pageBreaks = editorRef.current.querySelectorAll('.apa-page-break-container').length;
    const nextNum = pageBreaks + 2;

    const pageHtml = `
      <div class="apa-page-break-container" contenteditable="false">
        <div class="apa-page-divider">
          <span class="divider-line"></span>
          <span class="divider-chip">Inicio de Hoja ${nextNum}</span>
          <span class="divider-line"></span>
        </div>
        ${layout.showPageNumber ? `<div class="page-number-indicator-page">${nextNum}</div>` : ''}
      </div>
      <p class="indent-first-line"><br></p>
    `;

    document.execCommand('insertHTML', false, pageHtml);
    updateStatsAndPersist();
  };

  const handleResetDocument = () => {
    if (window.confirm('¿Seguro que deseas reiniciar el documento? Se restaurará la plantilla inicial.')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = DEFAULT_TEMPLATE;
        localStorage.removeItem(STORAGE_KEY);
        updateStatsAndPersist();
      }
    }
  };

  const handleInsertHeader = () => {
    if (!editorRef.current) return;
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
    document.execCommand('insertHTML', false, headerHtml);
    updateStatsAndPersist();
  };

  const handleInsertCustomTable = (tableHtml) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, tableHtml);
    updateStatsAndPersist();
  };

  const handleInsertFigureHtml = (figureHtml) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, figureHtml);
    updateStatsAndPersist();
  };

  const handleInsertFormulaHtml = (formulaHtml) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, formulaHtml);
    updateStatsAndPersist();
  };

  const handleInsertReference = (refHtml) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, refHtml);
    updateStatsAndPersist();
  };

  const handleExportWord = async () => {
    if (!editorRef.current) return;
    await exportToDocx(editorRef.current, 'Investigacion_Estadistica_APA7.docx');
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
        onUploadModel={handleUploadModel}
        saveStatus={saveStatus}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
          <div
            className={`paper-sheet size-${layout.paperSize}`}
            style={{ padding: marginStyle }}
          >
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
                  <span className="font-times text-base font-normal">1</span>
                )}
              </div>
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onClick={handleEditorClick}
              className="editor-body"
              style={{ lineHeight: layout.lineHeight }}
              spellCheck="true"
            />
          </div>
        </main>

        {isAuditOpen && (
          <ApaAuditSidebar
            isOpen={isAuditOpen}
            onClose={() => setIsAuditOpen(false)}
            auditData={auditData}
          />
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
          <span>Hojas estimadas: {stats.pages}</span>
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-500">
          <span>{modelData ? `Modelo: ${modelData.fileName}` : 'Sin modelo cargado'}</span>
          <span>|</span>
          <span>Márgenes: {layout.marginSize} cm</span>
          <span>|</span>
          <span>APA 7.ª Edición</span>
        </div>
      </footer>

      {/* Modales */}
      <SymbolModal
        isOpen={isSymbolModalOpen}
        onClose={() => setIsSymbolModalOpen(false)}
        onInsertSymbol={handleInsertSymbol}
      />
      <LayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        layout={layout}
        onChangeLayout={setLayout}
      />
      <MathModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onInsert={handleInsertFormulaHtml}
      />
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsert={handleInsertCustomTable}
      />
      <FigureModal
        isOpen={isFigureModalOpen}
        onClose={() => setIsFigureModalOpen(false)}
        onInsert={handleInsertFigureHtml}
      />
      <ReferenceModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        onInsertReference={handleInsertReference}
        onInsertInTextCitation={(text) => handleInsertSnippet(`<span>${text}</span>`)}
      />
    </div>
  );
}