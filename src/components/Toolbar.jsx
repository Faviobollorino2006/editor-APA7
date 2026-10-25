import React, { useRef } from 'react';

export default function Toolbar({
  onInsertHeader,
  onOpenTableModal,
  onOpenFigureModal,
  onOpenReferenceModal,
  onOpenMathModal,
  onOpenSymbolModal,
  onApplyApaDefaultStyle,
  onApplyIndentStyle,
  onOpenLayoutModal,
  onToggleAudit,
  onToggleModelDrawer,
  hasModelLoaded,
  onInsertNewPage,
  onNewBlankPage,
  onResetDocument,
  onExportWord,
  onExportPdf,
  onUploadModel,
  onInsertTab,
  onFormatMathNumber,
  currentFont,
  onFontChange,
  currentFontSize,
  currentIndent = 'none',
  onApplyIndentStyle,
  onFontSizeChange,
  saveStatus,
}) {
  const fileInputRef = useRef(null);

  const execute = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
  };

  const handleTextColorChange = (e) => execute('foreColor', e.target.value);
  const handleHighlightColor = (color) => execute('hiliteColor', color);

  return (
    <header className="no-print bg-white border-b border-slate-200 text-slate-700 select-none shadow-sm">
      <input
        type="file"
        id="changeModelInput"
        ref={fileInputRef}
        accept=".docx,.txt"
        className="hidden"
        onChange={onUploadModel}
      />

      {/* Fila Superior: Título y Acciones Principales */}
      <div className="px-6 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded bg-blue-700 text-white font-serif font-bold text-xs flex items-center justify-center shadow-sm">
              W
            </span>
            <span className="font-semibold text-slate-800 tracking-tight text-sm">
              Editor Académico <span className="text-blue-700 font-bold">APA 7</span>
            </span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Deshacer / Rehacer */}
          <div className="flex items-center space-x-1">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execute('undo')}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Deshacer (Ctrl + Z)"
            >
              ↶
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execute('redo')}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Rehacer (Ctrl + Y)"
            >
              ↷
            </button>
          </div>

          <span className="text-slate-300">|</span>

          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {saveStatus}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Estilo APA 7 */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onApplyApaDefaultStyle}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5"
            title="Aplica formato reglamentario APA 7 al párrafo actual"
          >
            <span>✓</span> Formato APA 7
          </button>

          {hasModelLoaded ? (
            <button
              onClick={onToggleModelDrawer}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium px-2.5 py-1 rounded text-xs transition-colors"
            >
              Comparar Modelo
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium px-2.5 py-1 rounded text-xs transition-colors"
            >
              Cargar Modelo
            </button>
          )}

          <button
            onClick={onOpenLayoutModal}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
          >
            Disposición
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertNewPage}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded text-xs transition-colors"
          >
            + Nueva Hoja
          </button>

          <button
            onClick={onNewBlankPage}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
          >
            Hoja en Blanco
          </button>

          <button
            onClick={onToggleAudit}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
          >
            Checklist
          </button>

          <button
            onClick={onResetDocument}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded text-xs transition-colors"
          >
            Reiniciar
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={onExportWord}
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-3 py-1 rounded text-xs shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <span>📄</span> Word (.docx)
          </button>

          <button
            onClick={onExportPdf}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1 rounded text-xs shadow-sm transition-colors"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Fila Inferior: Formato Reactivo Inmediato */}
      <div className="px-6 py-1.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        
        {/* Selector de Fuente */}
        <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-0.5 shadow-2xs">
          <select
            value={currentFont}
            onChange={(e) => onFontChange(e.target.value)}
            className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-sans pr-1"
          >
            <option value="Times New Roman">Times New Roman (12pt)</option>
            <option value="Arial">Arial (11pt)</option>
            <option value="Calibri">Calibri (11pt)</option>
            <option value="Georgia">Georgia (11pt)</option>
            <option value="Cambria Math">Cambria Math (Matemática)</option>
          </select>
        </div>

        {/* Selector de Tamaño */}
        <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-0.5 shadow-2xs">
          <select
            value={currentFontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-sans pr-1"
          >
            <option value="10pt">10 pt (Notas)</option>
            <option value="11pt">11 pt (Arial/Calibri)</option>
            <option value="12pt">12 pt (Times Estándar)</option>
            <option value="14pt">14 pt</option>
            <option value="18pt">18 pt (Títulos)</option>
          </select>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* B, I, U, S */}
        <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('bold')} className="px-2 py-0.5 font-bold text-slate-700 hover:bg-slate-100 rounded" title="Negrita">B</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('italic')} className="px-2 py-0.5 italic font-serif text-slate-700 hover:bg-slate-100 rounded" title="Cursiva">I</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('underline')} className="px-2 py-0.5 underline text-slate-700 hover:bg-slate-100 rounded" title="Subrayado">U</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('strikeThrough')} className="px-2 py-0.5 line-through text-slate-700 hover:bg-slate-100 rounded" title="Tachado">S</button>
        </div>

        {/* Color y Resaltador */}
        <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded px-2 py-0.5 shadow-2xs">
          <div className="flex items-center gap-1" title="Color de Fuente">
            <span className="text-[11px] font-bold text-slate-600">A</span>
            <input type="color" defaultValue="#000000" onChange={handleTextColorChange} className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent" />
          </div>
          <div className="h-3 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1" title="Resaltado de Texto">
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlightColor('#fef08a')} className="w-3 h-3 rounded-full bg-yellow-300 border border-yellow-400 hover:scale-110" title="Resaltar Amarillo"></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlightColor('#bbf7d0')} className="w-3 h-3 rounded-full bg-green-300 border border-green-400 hover:scale-110" title="Resaltar Verde"></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlightColor('transparent')} className="text-[10px] text-slate-400 hover:text-slate-700 px-0.5" title="Quitar">✕</button>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Alineaciones */}
        <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('justifyLeft')} className="px-2 py-0.5 hover:bg-slate-100 rounded text-slate-700" title="Izquierda (APA)">⇤ Izq</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('justifyCenter')} className="px-2 py-0.5 hover:bg-slate-100 rounded text-slate-700" title="Centrado">≡ Centro</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('justifyRight')} className="px-2 py-0.5 hover:bg-slate-100 rounded text-slate-700" title="Derecha">⇥ Der</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execute('justifyFull')} className="px-2 py-0.5 hover:bg-slate-100 rounded text-slate-700" title="Justificado">⇎ Justificado</button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Sangría y Tabulador */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-0.5 shadow-2xs">
            <label className="text-[10px] text-slate-400 mr-1.5 font-medium">Sangría:</label>
            <select
  value={currentIndent}
  onChange={(e) => onApplyIndentStyle(e.target.value)}
  className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-sans pr-1"
>
  <option value="none">Sin Sangría</option>
  <option value="firstLine">1.ª Línea (1.27 cm APA)</option>
  <option value="hanging">Francesa (1.27 cm)</option>
  <option value="block">Bloque (Cita textual)</option>
</select>
          </div>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertTab}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs font-mono font-bold"
            title="Insertar espacio de tabulación en el cursor (Tecla Tab)"
          >
            ↹ Tab
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        {/* Herramientas de Inserción */}
        <div className="flex items-center space-x-1">
          <button onMouseDown={(e) => e.preventDefault()} onClick={onInsertHeader} className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs">
            + Encabezado
          </button>
          <button onClick={onOpenTableModal} className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs">
            + Tabla
          </button>
          <button onClick={onOpenFigureModal} className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs">
            + Gráfico
          </button>
          <button onClick={onOpenMathModal} className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs">
            ∑ Fórmulas
          </button>
          <button onClick={onOpenSymbolModal} className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs font-serif font-bold">
            Ω Símbolos
          </button>
          <button
  onMouseDown={(e) => e.preventDefault()}
  onClick={onFormatMathNumber}
  className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs font-mono font-semibold flex items-center gap-1"
  title="Aplica la tipografía Cambria Math a los números o estadísticas seleccionadas"
>
  <span>🔢</span> Num Math
</button>
          <button onClick={onOpenReferenceModal} className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs shadow-2xs">
            + Cita / Ref
          </button>
        </div>
      </div>
    </header>
  );
}