import React, { useRef, useState, useEffect } from 'react';
import mammoth from 'mammoth';
import Toolbar from './components/Toolbar';
import MathModal from './components/MathModal';
import TableModal from './components/TableModal';
import FigureModal from './components/FigureModal';
import ReferenceModal from './components/ReferenceModal';
import ApaAuditSidebar from './components/ApaAuditSidebar';
import { exportToDocx } from './components/docxExport';

const STORAGE_KEY = 'apa7_stats_document_draft';

const DEFAULT_TEMPLATE = `
  <div class="page-number-indicator">1</div>
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

  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const [stats, setStats] = useState({ words: 0, chars: 0, pages: 1 });
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
  }, []);

  const updateStatsAndPersist = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';

    const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const chars = text.length;
    const pageBreaks = editorRef.current.querySelectorAll('.apa-page-break-container, .apa-page-break').length;

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

  // Evita que la hoja quede sin elementos al borrar todo el contenido
  const handleEditorInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      if (text.trim() === '' && !editorRef.current.querySelector('p')) {
        const hasBreak = editorRef.current.querySelector('.apa-page-break-container');
        if (!hasBreak) {
          editorRef.current.innerHTML = '<div class="page-number-indicator">1</div><p><br></p>';
        }
      }
    }
    setSaveStatus('Guardando...');
    updateStatsAndPersist();
  };

  // Asegura el cursor en un párrafo si hacen clic en un lienzo vacío
  const handleEditorClick = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText?.trim() || '';
      if (!text && (!editorRef.current.querySelector('p') || editorRef.current.innerHTML.trim() === '')) {
        editorRef.current.innerHTML = '<div class="page-number-indicator">1</div><p><br></p>';
      }
    }
  };

  // Si presionan Enter y no hay párrafo activo, lo genera de inmediato
  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (editorRef.current && !editorRef.current.querySelector('p')) {
        e.preventDefault();
        document.execCommand('insertParagraph', false);
      }
    }
  };

  // Crear Hoja en Blanco limpia
  const handleNewBlankPage = () => {
    if (window.confirm("¿Deseas vaciar el documento para empezar en una hoja en blanco?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = `
          <div class="page-number-indicator">1</div>
          <p><br></p>
        `;
        updateStatsAndPersist();
        editorRef.current.focus();
      }
    }
  };

  // Insertar Nueva Página numerada correlativamente
  const handleInsertNewPage = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const pageBreaks = editorRef.current.querySelectorAll('.apa-page-break-container, .apa-page-break').length;
    const nextNum = pageBreaks + 2;

    const pageHtml = `
      <div class="apa-page-break-container" contenteditable="false">
        <div class="apa-page-divider">
          <span class="divider-line"></span>
          <span class="divider-chip">Inicio de Hoja ${nextNum}</span>
          <span class="divider-line"></span>
        </div>
        <div class="page-number-indicator-page">${nextNum}</div>
      </div>
      <p><br></p>
    `;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      document.execCommand('insertHTML', false, pageHtml);
    } else {
      editorRef.current.insertAdjacentHTML('beforeend', pageHtml);
    }

    updateStatsAndPersist();
  };

  const handleResetDocument = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el documento? Se restaurará la plantilla inicial.")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = DEFAULT_TEMPLATE;
        localStorage.removeItem(STORAGE_KEY);
        updateStatsAndPersist();
      }
    }
  };

  const handleUploadModel = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setSaveStatus('Leyendo modelo...');

      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        if (editorRef.current) {
          editorRef.current.innerHTML = `<div class="page-number-indicator">1</div>` + result.value;
          updateStatsAndPersist();
          alert("¡Modelo cargado con éxito!");
        }
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        if (editorRef.current) {
          editorRef.current.innerHTML = `<div class="page-number-indicator">1</div><p>${text.replace(/\n\n/g, '</p><p>')}</p>`;
          updateStatsAndPersist();
        }
      } else {
        alert("Sube un archivo .docx o .txt.");
      }
    } catch (error) {
      alert("Error al procesar el archivo: " + error.message);
    } finally {
      e.target.value = '';
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

  const handleInsertInTextCitation = (citationText) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertText', false, citationText);
    updateStatsAndPersist();
  };

  const handleExportWord = async () => {
    if (!editorRef.current) return;
    await exportToDocx(editorRef.current, 'Investigacion_Estadistica_APA7.docx');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Toolbar
        onInsertHeader={handleInsertHeader}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onOpenFigureModal={() => setIsFigureModalOpen(true)}
        onOpenReferenceModal={() => setIsRefModalOpen(true)}
        onOpenMathModal={() => setIsMathModalOpen(true)}
        onToggleAudit={() => setIsAuditOpen(!isAuditOpen)}
        onInsertNewPage={handleInsertNewPage}
        onNewBlankPage={handleNewBlankPage}
        onResetDocument={handleResetDocument}
        onExportWord={handleExportWord}
        onUploadModel={handleUploadModel}
        saveStatus={saveStatus}
      />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onClick={handleEditorClick}
              onKeyDown={handleEditorKeyDown}
              className="apa-document-page shadow-2xl"
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
      </div>

      <footer className="h-7 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-400 no-print">
        <div className="flex items-center space-x-4">
          <span>Hojas estimadas: {stats.pages}</span>
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-500">
          <span>APA 7.ª Edición</span>
          <span>Márgenes: 2.54 cm</span>
          <span>Saltos de página dinámicos activos</span>
        </div>
      </footer>

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
        onInsert={handleInsertReference}
        onInsertInTextCitation={handleInsertInTextCitation}
      />
    </div>
  );
}