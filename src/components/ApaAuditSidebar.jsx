import React from 'react';

export default function ApaAuditSidebar({ isOpen, onClose, auditData = {} }) {
  if (!isOpen) return null;

  // Valores por defecto seguros para evitar caídas de renderizado
  const data = {
    hasHeader: false,
    hasTitle: false,
    headingCount: 0,
    wordCount: 0,
    tableCount: 0,
    hasReferences: false,
    ...auditData
  };

  const checks = [
    {
      title: 'Encabezado con Identificación',
      passed: data.hasHeader,
      hint: 'Debe incluir nombres, fecha, deber y asignatura al inicio.',
    },
    {
      title: 'Título Principal (Nivel 1)',
      passed: data.hasTitle,
      hint: 'Debe haber al menos un título central en negrita.',
    },
    {
      title: 'Jerarquía de Preguntas / Secciones',
      passed: data.headingCount >= 2,
      hint: `Se detectaron ${data.headingCount} títulos de sección (recomendado: 2 o más).`,
    },
    {
      title: 'Extensión Mínima de Texto',
      passed: data.wordCount >= 250,
      hint: `Llevas ${data.wordCount} palabras (mínimo recomendado para investigación: 250).`,
    },
    {
      title: 'Tablas Estadísticas con Formato',
      passed: data.tableCount >= 1,
      hint: data.tableCount >= 1 ? `Contiene ${data.tableCount} tabla(s) APA integrada(s).` : 'Aún no has insertado tablas de datos.',
    },
    {
      title: 'Apartado de Referencias',
      passed: data.hasReferences,
      hint: 'Debe existir una sección con sangría francesa y fuentes citadas.',
    },
  ];

  const totalPassed = checks.filter(c => c.passed).length;
  const scorePercent = Math.round((totalPassed / checks.length) * 100);

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-700 p-5 overflow-y-auto text-white flex flex-col h-full shadow-2xl z-30 flex-shrink-0">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-slate-100">Auditoría APA 7</h3>
          <p className="text-[11px] text-slate-400">Verificación contra el modelo del docente</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-base font-bold">✕</button>
      </div>

      <div className="my-4 p-4 rounded-lg bg-slate-800/80 border border-slate-700">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-slate-300">Conformidad APA</span>
          <span className="text-xs font-bold text-blue-400">{scorePercent}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              scorePercent === 100 ? 'bg-emerald-500' : scorePercent >= 60 ? 'bg-blue-500' : 'bg-amber-500'
            }`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {checks.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border text-xs transition-colors ${
              item.passed ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200' : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${item.passed ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                {item.passed ? '✓' : '!'}
              </span>
              <span className={`font-semibold ${item.passed ? 'text-emerald-300' : 'text-slate-200'}`}>{item.title}</span>
            </div>
            <p className="text-[11px] text-slate-400 pl-6 leading-tight">{item.hint}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}