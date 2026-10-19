import React, { useState, useMemo } from 'react';

export default function TableModal({ isOpen, onClose, onInsert }) {
  if (!isOpen) return null;

  const [tableNumber, setTableNumber] = useState('Tabla 1');
  const [tableTitle, setTableTitle] = useState('Distribución de frecuencias y estadísticos descriptivos');
  const [tableNote, setTableNote] = useState('Valores obtenidos a partir de la muestra evaluada (n = 292).');
  const [hasHeader, setHasHeader] = useState(true);
  const [rawPastedData, setRawPastedData] = useState(
    "Variable / Categoría\tFrecuencia (f)\tPorcentaje (%)\tMedia (x̄)\nEstrato A\t120\t41.1%\t14.5\nEstrato B\t172\t58.9%\t16.2\nTotal\t292\t100.0%\t15.4"
  );

  // Parsea las celdas copiadas de Excel (separadas por tabulación \t) o CSV
  const parsedData = useMemo(() => {
    if (!rawPastedData.trim()) return [];
    const lines = rawPastedData.trim().split(/\r?\n/);
    const delimiter = rawPastedData.includes('\t') ? '\t' : (rawPastedData.includes(';') ? ';' : ',');
    return lines.map(line => line.split(delimiter).map(cell => cell.trim()));
  }, [rawPastedData]);

  const headers = hasHeader && parsedData.length > 0 ? parsedData[0] : [];
  const rows = hasHeader ? parsedData.slice(1) : parsedData;

  const handleConfirmInsert = () => {
    if (parsedData.length === 0) return;

    // Construcción del HTML estricto bajo APA 7
    const tableHtml = `
      <div class="no-indent" style="margin: 1.8em 0; line-height: 1.4;">
        <div style="font-weight: bold; font-size: 12pt; margin-bottom: 2px;">${tableNumber || 'Tabla'}</div>
        <div style="font-style: italic; font-size: 12pt; margin-bottom: 0.6em;">${tableTitle || 'Título de la tabla'}</div>
        <table class="apa-table">
          ${
            hasHeader && headers.length > 0
              ? `<thead>
                  <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>`
              : ''
          }
          <tbody>
            ${rows
              .map(
                row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
        ${
          tableNote.trim()
            ? `<div style="font-size: 10pt; line-height: 1.3; margin-top: 6px; font-style: normal;">
                <em>Nota.</em> ${tableNote}
              </div>`
            : ''
        }
      </div>
      <p></p>
    `;

    onInsert(tableHtml);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Encabezado del modal */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-bold text-base text-blue-400">Generador de Tablas Estadísticas APA 7</h3>
            <p className="text-xs text-slate-400">Copia tus celdas en Excel o Sheets y pégalas aquí directamente</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Metadatos APA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Número de Tabla (Negrita)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: Tabla 1"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Título Descriptivo (Cursiva)
              </label>
              <input
                type="text"
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: Resultados del análisis ANOVA"
              />
            </div>
          </div>

          {/* Área de pegado desde Excel */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                Pegar datos desde Excel / R / SPSS
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                />
                <span>La primera fila contiene encabezados</span>
              </label>
            </div>
            <textarea
              rows={5}
              value={rawPastedData}
              onChange={(e) => setRawPastedData(e.target.value)}
              placeholder="Selecciona las celdas en Excel, presiona Ctrl+C y luego haz Ctrl+V aquí..."
              className="w-full p-2.5 bg-slate-950 font-mono text-[11px] border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          {/* Campo de Nota al pie */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Nota al pie de la tabla (Opcional - Fuente 10pt)
            </label>
            <input
              type="text"
              value={tableNote}
              onChange={(e) => setTableNote(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
              placeholder="Ej: p < .05. Datos recolectados mediante encuesta digital..."
            />
          </div>

          {/* Previsualización en tiempo real con reglas APA */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Vista Previa con Formato Oficial APA 7
            </label>
            <div className="p-6 bg-white text-black rounded shadow-inner overflow-x-auto font-times text-[12pt]">
              <div className="font-bold">{tableNumber || 'Tabla X'}</div>
              <div className="italic mb-2">{tableTitle || 'Título descriptivo'}</div>

              <table className="apa-table w-full">
                {hasHeader && headers.length > 0 && (
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {tableNote.trim() && (
                <div className="text-[10pt] mt-1 leading-tight">
                  <em>Nota.</em> {tableNote}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmInsert}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-1.5 rounded text-xs font-semibold text-white shadow transition-colors"
          >
            Insertar Tabla en el Documento
          </button>
        </div>
      </div>
    </div>
  );
}