import React from 'react';

export default function MathModal({ isOpen, onClose, onInsert }) {
  if (!isOpen) return null;

  const formulas = [
    {
      name: 'Muestra en Población Finita (Cualitativa)',
      description: 'Cálculo del tamaño muestral conociendo el universo (N).',
      html: `
        <div class="math-formula-box" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Times New Roman', serif; font-size: 13pt; margin: 1em 0; font-style: italic;">
          <span>n = </span>
          <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
            <div style="border-bottom: 1.5px solid black; padding: 0 6px 2px 6px;">N · Z<sup>2</sup> · p · q</div>
            <div style="padding: 2px 6px 0 6px;">(N - 1) · e<sup>2</sup> + Z<sup>2</sup> · p · q</div>
          </div>
        </div>
        <p></p>
      `
    },
    {
      name: 'Muestra en Población Infinita / Desconocida',
      description: 'Cálculo de muestra para universos mayores a 100.000.',
      html: `
        <div class="math-formula-box" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Times New Roman', serif; font-size: 13pt; margin: 1em 0; font-style: italic;">
          <span>n = </span>
          <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
            <div style="border-bottom: 1.5px solid black; padding: 0 6px 2px 6px;">Z<sup>2</sup> · p · q</div>
            <div style="padding: 2px 6px 0 6px;">e<sup>2</sup></div>
          </div>
        </div>
        <p></p>
      `
    },
    {
      name: 'Media Aritmética Muestral (x̄)',
      description: 'Promedio muestral de observaciones cuantitativas.',
      html: `
        <div class="math-formula-box" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Times New Roman', serif; font-size: 13pt; margin: 1em 0; font-style: italic;">
          <span>x̄ = </span>
          <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
            <div style="border-bottom: 1.5px solid black; padding: 0 6px 2px 6px;">∑ x<sub>i</sub></div>
            <div style="padding: 2px 6px 0 6px;">n</div>
          </div>
        </div>
        <p></p>
      `
    },
    {
      name: 'Desviación Estándar Muestral (s)',
      description: 'Dispersión cuadrática promedio con n - 1 grados de libertad.',
      html: `
        <div class="math-formula-box" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Times New Roman', serif; font-size: 13pt; margin: 1em 0; font-style: italic;">
          <span>s = √ </span>
          <span style="font-size: 1.4em;">[</span>
          <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
            <div style="border-bottom: 1.5px solid black; padding: 0 6px 2px 6px;">∑ (x<sub>i</sub> - x̄)<sup>2</sup></div>
            <div style="padding: 2px 6px 0 6px;">n - 1</div>
          </div>
          <span style="font-size: 1.4em;">]</span>
        </div>
        <p></p>
      `
    },
    {
      name: 'Puntaje de Estandarización Normal (Valor Z)',
      description: 'Distancia de un valor respecto a la media en desviaciones estándar.',
      html: `
        <div class="math-formula-box" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Times New Roman', serif; font-size: 13pt; margin: 1em 0; font-style: italic;">
          <span>Z = </span>
          <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
            <div style="border-bottom: 1.5px solid black; padding: 0 6px 2px 6px;">x - μ</div>
            <div style="padding: 2px 6px 0 6px;">σ</div>
          </div>
        </div>
        <p></p>
      `
    },
    {
      name: 'Modelo de Regresión Lineal Simple',
      description: 'Ecuación de la recta de mejor ajuste para predicción.',
      html: `
        <div class="math-formula-box" style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Times New Roman', serif; font-size: 13pt; margin: 1em 0; font-style: italic;">
          <span>ŷ = β<sub>0</sub> + β<sub>1</sub>x + ε</span>
        </div>
        <p></p>
      `
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-bold text-base text-blue-400">Insertar Fórmula Estadística</h3>
            <p className="text-xs text-slate-400">Selecciona la fórmula requerida para insertarla con tipografía matemática APA</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Lista de fórmulas */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {formulas.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-800/80 border border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-between gap-4 transition-all hover:bg-slate-800"
            >
              <div>
                <h4 className="font-semibold text-sm text-slate-100">{item.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => {
                  onInsert(item.html);
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded shadow transition-colors flex-shrink-0"
              >
                Insertar en Hoja
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}