import React, { useState } from 'react';

export default function ModelComparisonDrawer({
  isOpen,
  onClose,
  modelData,
  onInsertSnippet,
  editorText = '',
}) {
  if (!isOpen || !modelData) return null;

  const [activeTab, setActiveTab] = useState('compare'); // 'compare' | 'read'

  // Compara si una sección del docente ya fue incluida o respondida en el trabajo del alumno
  const comparisonResults = modelData.sections.map((sec) => {
    // Normaliza para búsqueda insensible a mayúsculas
    const cleanSecTitle = sec.title.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, ' ').trim();
    const cleanDocText = editorText.toLowerCase();

    // Comprueba coincidencia por título o por fragmento representativo
    const isPresent = cleanDocText.includes(cleanSecTitle.slice(0, 25));

    return {
      title: sec.title,
      content: sec.content,
      isPresent,
    };
  });

  const completedCount = comparisonResults.filter((r) => r.isPresent).length;
  const progressPercent = Math.round(
    (completedCount / (comparisonResults.length || 1)) * 100
  );

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-700 text-slate-200 flex flex-col h-full shadow-2xl z-40 flex-shrink-0 animate-in slide-in-from-right duration-200">
      {/* Cabecera del Drawer */}
      <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-sm">Modelo del Docente</span>
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded font-mono">
              Referencia
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[240px] mt-0.5" title={modelData.fileName}>
            {modelData.fileName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800"
        >
          ✕
        </button>
      </div>

      {/* Pestañas: Comparador vs Lectura Completa */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 py-1.5 rounded font-semibold transition-colors ${
            activeTab === 'compare'
              ? 'bg-slate-800 text-blue-400 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🔍 Comparar Estructura
        </button>
        <button
          onClick={() => setActiveTab('read')}
          className={`flex-1 py-1.5 rounded font-semibold transition-colors ${
            activeTab === 'read'
              ? 'bg-slate-800 text-blue-400 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📖 Leer Modelo Completo
        </button>
      </div>

      {/* PESTAÑA 1: COMPARADOR ESTRUCTURAL Y CHECKLIST */}
      {activeTab === 'compare' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Barra de progreso de correspondencia */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1.5 font-medium">
              <span className="text-slate-300">Coincidencia con el Modelo</span>
              <span className="text-blue-400 font-bold font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent === 100
                    ? 'bg-emerald-500'
                    : progressPercent >= 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block">
              {completedCount} de {comparisonResults.length} puntos detectados en tu trabajo
            </span>
          </div>

          {/* Listado de apartados identificados */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Puntos del Modelo Identificados
            </span>

            {comparisonResults.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition-all ${
                  item.isPresent
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        item.isPresent
                          ? 'bg-emerald-500 text-black'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.isPresent ? '✓' : '!'}
                    </span>
                    <h4 className="font-semibold text-xs leading-tight">{item.title}</h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 pl-5 mb-2 leading-relaxed">
                  {item.content || 'Sin texto descriptivo adicional.'}
                </p>

                <div className="pl-5 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-medium ${
                      item.isPresent ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {item.isPresent ? 'Detectado en tu texto' : 'Pendiente por redactar'}
                  </span>

                  <button
                    onClick={() => onInsertSnippet(`<h4>${item.title}</h4><p><br></p>`)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] px-2 py-0.5 rounded font-medium transition-colors"
                    title="Insertar este título o enunciado en el punto actual del cursor"
                  >
                    + Pasar a mi hoja
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: LECTURA COMPLETA DEL ARCHIVO DEL PROFESOR */}
      {activeTab === 'read' && (
        <div className="flex-1 overflow-y-auto p-4 text-xs font-serif leading-relaxed text-slate-300 bg-slate-950 select-text">
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: modelData.html }}
          />
        </div>
      )}

      {/* Pie con selector para sustituir modelo si cambia el deber */}
      <div className="p-3 border-t border-slate-800 bg-slate-850 text-center">
        <label
          htmlFor="changeModelInput"
          className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
        >
          🔄 Cargar otro archivo modelo
        </label>
      </div>
    </aside>
  );
}