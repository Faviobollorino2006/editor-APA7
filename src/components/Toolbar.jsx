import React, { useRef } from 'react';

export default function Toolbar({
  onInsertHeader,
  onOpenTableModal,
  onOpenFigureModal,
  onOpenReferenceModal,
  onOpenMathModal,
  onOpenLayoutModal,
  onToggleAudit,
  onToggleModelDrawer, // <--- Conmuta el panel comparador
  hasModelLoaded,       // <--- Booleano que indica si ya se cargó un modelo
  onInsertNewPage,
  onNewBlankPage,
  onResetDocument,
  onExportWord,
  onUploadModel,
  saveStatus,
}) {
  const fileInputRef = useRef(null);

  const execute = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
  };

  const handleFontChange = (e) => execute('fontName', e.target.value);
  const handleFontSizeChange = (e) => execute('fontSize', e.target.value);
  const handleTextColorChange = (e) => execute('foreColor', e.target.value);
  const handleHighlightColor = (color) => execute('hiliteColor', color);

  return (
    <div className="bg-slate-800 border-b border-slate-700 text-slate-200 select-none shadow-md">
      <input
        type="file"
        id="changeModelInput"
        ref={fileInputRef}
        accept=".docx,.txt"
        className="hidden"
        onChange={onUploadModel}
      />

      {/* Fila 1 */}
      <div className="px-5 py-2 border-b border-slate-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-black text-blue-400 tracking-wider text-sm">APA 7 STATS</span>
          <span className="text-slate-500">|</span>
          <button onClick={() => execute('undo')} className="hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-700" title="Deshacer">↶</button>
          <button onClick={() => execute('redo')} className="hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-700" title="Rehacer">↷</button>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {saveStatus}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botón Inteligente de Modelo Docente */}
          {hasModelLoaded ? (
            <button
              onClick={onToggleModelDrawer}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded text-xs shadow flex items-center gap-1.5 transition-colors"
              title="Abrir u ocultar el panel de comparación con el modelo del profesor"
            >
              <span>👁️</span> Comparar con Modelo
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="bg-blue-900/60 hover:bg-blue-800 border border-blue-600/60 px-2.5 py-1 rounded text-xs text-blue-200 font-semibold shadow flex items-center gap-1.5 transition-colors"
              title="Cargar el archivo .docx del docente para usar como base comparativa"
            >
              <span>📂</span> Cargar Modelo Docente
            </button>
          )}

          <button onClick={onOpenLayoutModal} className="bg-indigo-700 hover:bg-indigo-600 px-2.5 py-1 rounded text-xs text-white font-bold shadow flex items-center gap-1">
            <span>📐</span> Disposición
          </button>

          <button onClick={onInsertNewPage} className="bg-amber-600 hover:bg-amber-500 px-2 py-1 rounded text-xs text-white font-bold shadow">
            + Nueva Hoja
          </button>

          <button onClick={onNewBlankPage} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-cyan-300 font-semibold">
            📄 Hoja en Blanco
          </button>

          <button onClick={onInsertHeader} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white">
            + Encabezado
          </button>

          <button onClick={onOpenTableModal} className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs font-semibold text-white shadow">
            + Tabla
          </button>

          <button onClick={onOpenFigureModal} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white">
            + Gráfico
          </button>

          <button onClick={onOpenMathModal} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white">
            ∑ Fórmulas
          </button>

          <button onClick={onOpenReferenceModal} className="bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded text-xs font-semibold text-white shadow">
            + Citar / Ref
          </button>

          <button onClick={onToggleAudit} className="bg-violet-700 hover:bg-violet-600 px-2 py-1 rounded text-xs font-bold text-white shadow">
            ✓ Checklist
          </button>

          <button onClick={onResetDocument} className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 px-2 py-1 rounded text-xs">
            Reiniciar
          </button>

          <button onClick={onExportWord} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs font-bold text-white shadow flex items-center gap-1">
            <span>📄</span> Word (.docx)
          </button>

          <button onClick={() => window.print()} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs font-medium text-slate-300">
            PDF
          </button>
        </div>
      </div>

      {/* Fila 2: Formato */}
      <div className="px-5 py-2 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5">
          <label className="text-[10px] text-slate-400 mr-1.5">Fuente APA:</label>
          <select onChange={handleFontChange} defaultValue="Times New Roman" className="bg-transparent text-white outline-none cursor-pointer py-0.5 text-xs font-sans">
            <option value="Times New Roman" className="bg-slate-800">Times New Roman (12pt)</option>
            <option value="Arial" className="bg-slate-800">Arial (11pt)</option>
            <option value="Calibri" className="bg-slate-800">Calibri (11pt)</option>
            <option value="Georgia" className="bg-slate-800">Georgia (11pt)</option>
          </select>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5">
          <label className="text-[10px] text-slate-400 mr-1.5">Tamaño:</label>
          <select onChange={handleFontSizeChange} defaultValue="3" className="bg-transparent text-white outline-none cursor-pointer py-0.5 text-xs">
            <option value="1" className="bg-slate-800">10 pt (Notas)</option>
            <option value="2" className="bg-slate-800">11 pt (Arial/Calibri)</option>
            <option value="3" className="bg-slate-800">12 pt (Times Estándar)</option>
            <option value="4" className="bg-slate-800">14 pt</option>
            <option value="5" className="bg-slate-800">18 pt (Títulos)</option>
          </select>
        </div>

        <div className="h-5 w-px bg-slate-700 mx-1"></div>

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
          <button onClick={() => execute('bold')} className="px-2 py-0.5 font-bold hover:bg-slate-700 rounded" title="Negrita">B</button>
          <button onClick={() => execute('italic')} className="px-2 py-0.5 italic font-serif hover:bg-slate-700 rounded" title="Cursiva">I</button>
          <button onClick={() => execute('underline')} className="px-2 py-0.5 underline hover:bg-slate-700 rounded" title="Subrayado">U</button>
          <button onClick={() => execute('strikeThrough')} className="px-2 py-0.5 line-through hover:bg-slate-700 rounded" title="Tachado">S</button>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded px-2 py-0.5">
          <div className="flex items-center gap-1" title="Color de Fuente">
            <span className="text-[10px] text-slate-400 font-bold">A</span>
            <input type="color" defaultValue="#000000" onChange={handleTextColorChange} className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent" />
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1" title="Resaltado de Texto">
            <button onClick={() => handleHighlightColor('#fef08a')} className="w-3.5 h-3.5 rounded-full bg-yellow-300 border border-yellow-500 hover:scale-110" title="Resaltar Amarillo"></button>
            <button onClick={() => handleHighlightColor('#bbf7d0')} className="w-3.5 h-3.5 rounded-full bg-green-300 border border-green-500 hover:scale-110" title="Resaltar Verde"></button>
            <button onClick={() => handleHighlightColor('transparent')} className="text-[10px] text-slate-400 hover:text-white px-1" title="Quitar Resaltado">✕</button>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-700 mx-1"></div>

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
          <button onClick={() => execute('justifyLeft')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300" title="Alinear Izquierda">⇤</button>
          <button onClick={() => execute('justifyCenter')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300" title="Centrar">≡</button>
          <button onClick={() => execute('justifyRight')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300" title="Alinear Derecha">⇥</button>
          <button onClick={() => execute('justifyFull')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300" title="Justificar">⇎</button>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
          <button onClick={() => execute('insertUnorderedList')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">• Lista</button>
          <button onClick={() => execute('insertOrderedList')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">1. Lista</button>
          <button onClick={() => execute('indent')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300" title="Sangría">→ Sangría</button>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
          <button onClick={() => execute('subscript')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">x<sub>2</sub></button>
          <button onClick={() => execute('superscript')} className="px-2 py-0.5 hover:bg-slate-700 rounded text-slate-300">x<sup>2</sup></button>
        </div>
      </div>
    </div>
  );
}