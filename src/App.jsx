import React, { useRef, useState, useEffect } from 'react';
import mammoth from 'mammoth';
import Toolbar from './components/Toolbar';
import MathModal from './components/MathModal';
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
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Estado del Modelo del Profesor (Referencia aislada)
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

  // Carga inicial
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

    // Recupera modelo guardado si existe
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

  // Carga y procesamiento del archivo modelo del profesor
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

      // Parsea los títulos, preguntas o enunciados del modelo del profesor
      const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const extractedSections = [];

      lines.forEach((line) => {
        // Detecta títulos del docente (Pregunta X, Tareas, Fórmulas, Ejemplos, etc.)
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
          extractedSections.push({
            title: line.replace(/^#+\s*/, ''),
            content: '',
          });
        } else if (extractedSections.length > 0) {
          // Asocia las primeras líneas descriptivas a la sección actual
          if (!extractedSections[extractedSections.length - 1].content) {
            extractedSections[extractedSections.length - 1].content = line.slice(0, 160);
          }
        }
      });

      // Si no detectó encabezados por regex, genera secciones estándar por párrafos
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
      setIsModelDrawerOpen(true); // Abre el comparador lateral de inmediato
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(newModel));
      setSaveStatus('Modelo cargado como referencia');
    } catch (error) {
      alert('Error al leer el archivo modelo: ' + error.message);
    } finally {
      e.target.value = '';
    }
  };

  // Inserción controlada desde el panel del docente al cursor del alumno
  const handleInsertSnippet = (snippetHtml) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, snippetHtml);
    updateStatsAndPersist();
  };

  const handleNewBlankPage = () => {
    if (window.confirm('¿Deseas vaciar el documento para empezar en una hoja en blanco?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p><br></p>';
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
      <p><br></p>
    `;

    document.execCommand('insertHTML', false, pageHtml);
    updateStatsAndPersist();
  };

  const handleResetDocument = () => {
    if (window.confirm('¿Seguro que deseas reiniciar el documento? Se restaurará la estructura inicial.')) {
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
        {/* Lienzo Principal con Hoja APA */}
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

        {/* Panel 1: Auditoría APA General */}
        {isAuditOpen && (
          <ApaAuditSidebar
            isOpen={isAuditOpen}
            onClose={() => setIsAuditOpen(false)}
            auditData={auditData}
          />
        )}

        {/* Panel 2: Comparador y Lector del Modelo del Docente */}
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

      {/* Barra de estado */}
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