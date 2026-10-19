import React, { useState } from 'react';

export default function FigureModal({ isOpen, onClose, onInsert }) {
  if (!isOpen) return null;

  const [figureNumber, setFigureNumber] = useState('Figura 1');
  const [figureTitle, setFigureTitle] = useState('Distribución muestral de frecuencias relativas');
  const [figureNote, setFigureNote] = useState('Elaboración propia a partir del procesamiento estadístico de la muestra.');
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmInsert = () => {
    if (!imageSrc) {
      alert("Por favor selecciona o sube una imagen para el gráfico.");
      return;
    }

    const figureHtml = `
      <div class="no-indent" style="margin: 2em 0; line-height: 1.4;">
        <div style="font-weight: bold; font-size: 12pt; margin-bottom: 2px;">${figureNumber || 'Figura'}</div>
        <div style="font-style: italic; font-size: 12pt; margin-bottom: 0.8em;">${figureTitle || 'Título descriptivo'}</div>
        <div style="text-align: center; margin: 1em 0;">
          <img src="${imageSrc}" alt="${figureTitle}" style="max-width: 85%; height: auto; display: inline-block; border: 1px solid #e2e8f0; border-radius: 4px;" />
        </div>
        ${
          figureNote.trim()
            ? `<div style="font-size: 10pt; line-height: 1.3; margin-top: 6px;">
                <em>Nota.</em> ${figureNote}
              </div>`
            : ''
        }
      </div>
      <p></p>
    `;

    onInsert(figureHtml);
    setImageSrc(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-bold text-base text-blue-400">Insertar Figura o Gráfico Estadístico APA 7</h3>
            <p className="text-xs text-slate-400">Sube la captura de tu gráfico de Excel, SPSS o R</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded flex items-center justify-center">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Rótulo de la Figura (Negrita)</label>
              <input
                type="text"
                value={figureNumber}
                onChange={(e) => setFigureNumber(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: Figura 1"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Título de la Figura (Cursiva)</label>
              <input
                type="text"
                value={figureTitle}
                onChange={(e) => setFigureTitle(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: Histograma de frecuencias acumuladas"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Cargar Imagen del Gráfico (.png, .jpg)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-slate-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          {imageSrc && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block mb-2 uppercase font-semibold">Vista previa de imagen</span>
              <img src={imageSrc} alt="Preview" className="max-h-48 mx-auto rounded border border-slate-700" />
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nota al pie de la Figura (Opcional - Fuente 10pt)</label>
            <input
              type="text"
              value={figureNote}
              onChange={(e) => setFigureNote(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
              placeholder="Ej: Elaboración propia a partir de los datos recolectados..."
            />
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800">
            Cancelar
          </button>
          <button
            onClick={handleConfirmInsert}
            className="bg-blue-600 hover:bg-blue-500 px-5 py-1.5 rounded text-xs font-semibold text-white shadow"
          >
            Insertar Figura en Hoja
          </button>
        </div>
      </div>
    </div>
  );
}