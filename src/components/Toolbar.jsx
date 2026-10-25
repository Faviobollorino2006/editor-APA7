import React, { useRef, useState, useEffect } from 'react';

const STORAGE_KEY_RECENT_COLORS = 'apa7_recent_font_colors';
const DEFAULT_PALETTE = [
  '#000000', // Negro APA estándar
  '#334155', // Gris pizarra oscuro
  '#64748b', // Gris secundario
  '#1d4ed8', // Azul institucional / académico
  '#0284c7', // Celeste / Info
  '#16a34a', // Verde positivo / Éxito
  '#dc2626', // Rojo estadístico / Error
  '#d97706', // Ámbar / Alerta
  '#7e22ce', // Púrpura
  '#b91c1c', // Carmesí
];

export default function Toolbar({
  onInsertHeader,
  onOpenTableModal,
  onOpenFigureModal,
  onOpenReferenceModal,
  onOpenMathModal,
  onOpenSymbolModal,
  onApplyApaDefaultStyle,
  currentIndent = 'none',
  onApplyIndentStyle,
  onApplyColor,
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
  onFontSizeChange,
  saveStatus,
}) {
  const fileInputRef = useRef(null);
  const colorMenuRef = useRef(null);

  // Estados del selector de color e historial
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [activeColor, setActiveColor] = useState('#000000');
  const [recentColors, setRecentColors] = useState(['#000000', '#1d4ed8', '#dc2626']);

  // Cargar historial persistente al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_COLORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentColors(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) {
        setIsColorPickerOpen(false);
      }
    };
    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColorPickerOpen]);

  const executeCmd = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // Aplica color y lo guarda en el historial reciente (máximo 6 sin duplicados)
  const handleSelectColor = (color) => {
    setActiveColor(color);
    if (onApplyColor) {
      onApplyColor(color);
    } else {
      executeCmd('foreColor', color);
    }

    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== color.toLowerCase());
      const updated = [color, ...filtered].slice(0, 7);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT_COLORS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setIsColorPickerOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs no-print select-none">
      {/* FILA SUPERIOR: Archivo, Modos, Exportación */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-slate-100 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mr-2 text-sm">
            <span className="w-5 h-5 rounded bg-blue-700 text-white flex items-center justify-center text-xs">W</span>
            <span>Editor Académico APA 7</span>
          </div>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('undo')}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            title="Deshacer (Ctrl+Z)"
          >
            ↺
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCmd('redo')}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            title="Rehacer (Ctrl+Y)"
          >
            ↻
          </button>

          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {saveStatus}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onApplyApaDefaultStyle}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded text-xs border border-blue-200 transition-colors"
            title="Aplica formato general APA 7 (Times New Roman 12pt, Sangría 1.27cm, Margen 2.54cm)"
          >
            ✓ Formato APA 7
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onUploadModel}
            accept=".docx,.txt,.md"
            className="hidden"
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition-colors"
            title="Cargar documento modelo del docente (.docx)"
          >
            Cargar Modelo
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenLayoutModal}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs transition-colors"
          >
            Disposición
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertNewPage}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs transition-colors"
            title="Agregar página nueva al final"
          >
            + Nueva Hoja
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onNewBlankPage}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs transition-colors"
            title="Vaciar y empezar con hoja limpia"
          >
            Hoja en Blanco
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggleAudit}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition-colors"
            title="Revisar cumplimiento de normas APA 7"
          >
            Checklist
          </button>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onResetDocument}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded text-xs transition-colors"
            title="Reiniciar a plantilla base"
          >
            Reiniciar
          </button>

          <span className="text-slate-300">|</span>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onExportWord}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors"
          >
            <span>📄</span> Word (.docx)
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onExportPdf}
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-3 py-1 rounded text-xs shadow-2xs transition-colors"
          >
            PDF
          </button>
        </div>
      </div>

      {/* FILA INFERIOR: Tipografía, Formato, Color de Fuente, Fórmulas */}
      <div className="h-10 px-4 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center space-x-2">
          {/* Tipografía */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1">
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

          {/* Tamaño */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1">
            <select
              value={currentFontSize}
              onChange={(e) => onFontSizeChange(e.target.value)}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs font-sans pr-1"
            >
              <option value="12pt">12 pt (Times Estándar)</option>
              <option value="11pt">11 pt (Arial / Calibri)</option>
              <option value="10pt">10 pt (Notas / Tablas)</option>
              <option value="14pt">14 pt (Título Grande)</option>
              <option value="16pt">16 pt (Encabezado)</option>
            </select>
          </div>

          <span className="text-slate-300">|</span>

          {/* Negrita, Cursiva, Subrayado */}
          <div className="flex items-center space-x-0.5">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('bold')}
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 font-bold"
              title="Negrita (Ctrl+B)"
            >
              B
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('italic')}
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 italic font-serif"
              title="Cursiva (Ctrl+I)"
            >
              I
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('underline')}
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 underline"
              title="Subrayado (Ctrl+U)"
            >
              U
            </button>

            {/* CONTROL DE COLOR DE FUENTE CON HISTORIAL */}
            <div className="relative inline-block text-left" ref={colorMenuRef}>
              <div className="flex items-center rounded hover:bg-slate-100 p-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectColor(activeColor)}
                  className="flex flex-col items-center justify-center w-6 h-6 rounded hover:bg-slate-200/60"
                  title={`Aplicar último color (${activeColor})`}
                >
                  <span className="font-serif font-bold text-xs leading-none text-slate-800">A</span>
                  <span
                    className="w-4 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: activeColor }}
                  />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className="w-3.5 h-6 flex items-center justify-center hover:bg-slate-200/60 rounded text-[9px] text-slate-500"
                  title="Abrir paleta e historial de colores"
                >
                  ▾
                </button>
              </div>

              {/* Menú Flotante de Colores e Historial */}
              {isColorPickerOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-slate-700 animate-in fade-in zoom-in-95">
                  {/* Restablecer Automático */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectColor('#000000')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 text-xs font-medium flex items-center gap-2 mb-2 text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-300"></span>
                    <span>Automático (Negro APA)</span>
                  </button>

                  <div className="w-full h-px bg-slate-100 my-1.5"></div>

                  {/* Paleta Académica Estándar */}
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Paleta estándar
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {DEFAULT_PALETTE.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectColor(color)}
                        className="w-7 h-7 rounded border border-slate-200/80 hover:scale-110 hover:shadow-xs transition-transform flex items-center justify-center"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Historial de Colores Usados */}
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Historial reciente
                  </span>
                  <div className="flex items-center gap-1.5 min-h-[28px] mb-3">
                    {recentColors.length > 0 ? (
                      recentColors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectColor(color)}
                          className="w-6 h-6 rounded-full border border-slate-300 hover:scale-115 hover:shadow-2xs transition-transform"
                          style={{ backgroundColor: color }}
                          title={`Usado recientemente: ${color}`}
                        />
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin historial</span>
                    )}
                  </div>

                  <div className="w-full h-px bg-slate-100 my-1.5"></div>

                  {/* Selector Libre Personalizado */}
                  <label className="flex items-center justify-between text-xs text-slate-600 hover:bg-slate-50 p-1.5 rounded cursor-pointer transition-colors">
                    <span className="font-medium text-[11px]">Más colores...</span>
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => handleSelectColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Potencias directas */}
          <div className="flex items-center space-x-0.5 bg-slate-50 border border-slate-200 rounded p-0.5">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('superscript')}
              className="px-2 h-6 hover:bg-white rounded text-slate-800 font-mono font-bold text-xs"
              title="Superíndice / Potencia directa (ej: 1,96²)"
            >
              x²
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('subscript')}
              className="px-2 h-6 hover:bg-white rounded text-slate-800 font-mono font-bold text-xs"
              title="Subíndice directo (ej: H₀, x₁)"
            >
              x₂
            </button>
          </div>

          <span className="text-slate-300">|</span>

          {/* Alineaciones */}
          <div className="flex items-center space-x-0.5">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('justifyLeft')}
              className="px-1.5 py-1 hover:bg-slate-100 rounded text-slate-700"
              title="Alinear a la izquierda (APA 7)"
            >
              ⇤ Izq
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('justifyCenter')}
              className="px-1.5 py-1 hover:bg-slate-100 rounded text-slate-700"
              title="Centrar"
            >
              ≡ Centro
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('justifyRight')}
              className="px-1.5 py-1 hover:bg-slate-100 rounded text-slate-700"
              title="Alinear a la derecha"
            >
              ⇥ Der
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCmd('justifyFull')}
              className="px-1.5 py-1 hover:bg-slate-100 rounded text-slate-700"
              title="Justificar"
            >
              ⇔ Justificado
            </button>
          </div>

          <span className="text-slate-300">|</span>

          {/* Sangrías */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1">
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
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 font-mono text-xs"
            title="Tabulador APA (1.27 cm)"
          >
            ⇆ Tab
          </button>
        </div>

        {/* Fórmulas, Símbolos, Tablas */}
        <div className="flex items-center space-x-1.5">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertHeader}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 text-xs"
          >
            + Encabezado
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenTableModal}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 text-xs"
          >
            + Tabla
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenFigureModal}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 text-xs"
          >
            + Gráfico
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenMathModal}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors"
            title="Insertar ecuación matemática o aritmética"
          >
            <span>∑</span> Fórmulas
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenSymbolModal}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 text-xs font-semibold"
          >
            Ω Símbolos
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onFormatMathNumber}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 text-xs font-mono font-semibold"
            title="Aplicar tipografía matemática Cambria Math a los números"
          >
            🔢 Num Math
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onOpenReferenceModal}
            className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 text-xs"
          >
            + Cita / Ref
          </button>
        </div>
      </div>
    </header>
  );
}