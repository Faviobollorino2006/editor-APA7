import React from 'react';

export default function LayoutModal({ isOpen, onClose, layout, onChangeLayout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-bold text-base text-blue-400">Disposición de Página y Márgenes</h3>
            <p className="text-xs text-slate-400">Configuración dimensional del documento bajo normas APA 7</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Tamaño de Hoja */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Tamaño de Papel
            </label>
            <select
              value={layout.paperSize}
              onChange={(e) => onChangeLayout({ ...layout, paperSize: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500 font-sans"
            >
              <option value="letter">Tamaño Carta (Letter: 8.5" × 11" / 21.59 × 27.94 cm) — Estándar APA 7</option>
              <option value="a4">Tamaño A4 (8.27" × 11.69" / 21.0 × 29.7 cm)</option>
              <option value="legal">Tamaño Oficio (Legal: 8.5" × 14" / 21.59 × 35.56 cm)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              * Las normas APA 7 especifican el formato Carta (*Letter*) para entregas universitarias.
            </span>
          </div>

          {/* Márgenes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Márgenes de Hoja
            </label>
            <select
              value={layout.marginSize}
              onChange={(e) => onChangeLayout({ ...layout, marginSize: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500 font-sans"
            >
              <option value="2.54">APA 7 Estándar: 2.54 cm (1 pulgada) en los 4 bordes</option>
              <option value="1.27">Estrecho: 1.27 cm (0.5 pulgadas)</option>
              <option value="3.0">Amplio: 3.0 cm</option>
            </select>
          </div>

          {/* Configuración de Encabezado y Numeración */}
          <div className="p-3.5 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Encabezado & Numeración de Página
            </span>
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={layout.showPageNumber}
                onChange={(e) => onChangeLayout({ ...layout, showPageNumber: e.target.checked })}
                className="rounded bg-slate-900 border-slate-600 text-blue-500 focus:ring-0"
              />
              <span>Mostrar número de página en esquina superior derecha (APA 7)</span>
            </label>

            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">
                Texto de encabezado superior (Opcional - Trabajos profesionales)
              </label>
              <input
                type="text"
                value={layout.headerText}
                onChange={(e) => onChangeLayout({ ...layout, headerText: e.target.value })}
                placeholder="Ej: TÍTULO CORTO DEL TRABAJO"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 outline-none text-xs"
              />
            </div>
          </div>

          {/* Interlineado */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Interlineado Predeterminado
            </label>
            <select
              value={layout.lineHeight}
              onChange={(e) => onChangeLayout({ ...layout, lineHeight: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="2.0">Doble (2.0) — Exigido por APA 7</option>
              <option value="1.5">1.5 Líneas</option>
              <option value="1.0">Sencillo (1.0)</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-1.5 rounded text-xs transition-colors shadow"
          >
            Aplicar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}