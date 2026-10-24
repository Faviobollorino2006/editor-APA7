import React, { useState, useEffect, useRef } from 'react';

export default function MathModal({ isOpen, onClose, onInsert }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'builder' | 'free'
  const [equationMode, setEquationMode] = useState('display'); // 'display' (centrada) | 'inline' (en línea)
  
  // Estados del Constructor Visual
  const [fracNum, setFracNum] = useState('N \\cdot Z^2 \\cdot p \\cdot q');
  const [fracDen, setFracDen] = useState('(N - 1) \\cdot e^2 + Z^2 \\cdot p \\cdot q');
  const [leftVar, setLeftVar] = useState('n = ');
  const [rightResult, setRightResult] = useState('');
  
  // Estado Modo Libre
  const [rawLatex, setRawLatex] = useState('n = \\frac{1200 \\cdot 1{,}96^2 \\cdot 0{,}50 \\cdot 0{,}50}{1199 \\cdot 0{,}05^2 + 1{,}96^2 \\cdot 0{,}50 \\cdot 0{,}50}');
  
  const previewRef = useRef(null);

  // Renderiza la ecuación en SVG vectorial usando MathJax
  const renderSvg = (latexCode, container) => {
    if (!container) return;
    if (window.MathJax && window.MathJax.tex2svg) {
      try {
        const node = window.MathJax.tex2svg(latexCode, { display: equationMode === 'display' });
        container.innerHTML = '';
        container.appendChild(node);
      } catch (e) {
        container.innerHTML = `<span class="text-rose-600 text-xs">${latexCode}</span>`;
      }
    } else {
      container.innerHTML = `<span class="font-serif italic text-sm">${latexCode}</span>`;
    }
  };

  // Código LaTeX activo según la pestaña
  const getCurrentLatex = () => {
    if (activeTab === 'builder') {
      let latex = '';
      if (leftVar) latex += leftVar + ' ';
      latex += `\\frac{${fracNum || 'a'}}{${fracDen || 'b'}}`;
      if (rightResult) latex += ' ' + rightResult;
      return latex;
    }
    if (activeTab === 'free') {
      return rawLatex;
    }
    return '';
  };

  useEffect(() => {
    if (activeTab === 'builder' || activeTab === 'free') {
      renderSvg(getCurrentLatex(), previewRef.current);
    }
  }, [fracNum, fracDen, leftVar, rightResult, rawLatex, activeTab, equationMode]);

  // Insertar la ecuación como bloque vectorial en la hoja
  const handleInsertCurrent = (customLatex = null) => {
    const finalLatex = customLatex || getCurrentLatex();
    if (!finalLatex) return;

    let svgHtml = '';
    if (window.MathJax && window.MathJax.tex2svg) {
      const node = window.MathJax.tex2svg(finalLatex, { display: equationMode === 'display' });
      svgHtml = node.innerHTML;
    } else {
      svgHtml = `<span style="font-family: 'Cambria Math', serif; font-size: 13pt;">${finalLatex}</span>`;
    }

    const wrapperHtml = equationMode === 'display'
      ? `
        <div class="math-equation-block no-indent" data-latex="${encodeURIComponent(finalLatex)}" style="text-align: center; margin: 1.2em 0; user-select: all; cursor: pointer;" title="Ecuación Vectorial Matemática">
          <div style="display: inline-block; padding: 8px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            ${svgHtml}
          </div>
        </div>
        <p class="indent-first-line"><br></p>
      `
      : `
        <span class="math-equation-inline" data-latex="${encodeURIComponent(finalLatex)}" style="display: inline-block; vertical-align: middle; padding: 2px 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; margin: 0 3px;">
          ${svgHtml}
        </span>&nbsp;
      `;

    onInsert(wrapperHtml);
    onClose();
  };

  // Catálogo de Plantillas Estadísticas
  const templates = [
    {
      title: 'Tamaño de Muestra: Población Finita (Fórmula General)',
      category: 'Muestreo',
      latex: 'n = \\frac{N \\cdot Z^2 \\cdot p \\cdot q}{(N - 1) \\cdot e^2 + Z^2 \\cdot p \\cdot q}',
      desc: 'Cálculo de muestra con población conocida N'
    },
    {
      title: 'Sustitución de Datos (Deber 01 - Ejercicio)',
      category: 'Muestreo',
      latex: 'n = \\frac{1200 \\cdot (1{,}96)^2 \\cdot 0{,}50 \\cdot 0{,}50}{1199 \\cdot (0{,}05)^2 + (1{,}96)^2 \\cdot 0{,}50 \\cdot 0{,}50}',
      desc: 'Valores para N=1200, Z=1.96, p=0.50, e=0.05'
    },
    {
      title: 'División Final del Ejercicio',
      category: 'Muestreo',
      latex: 'n = \\frac{1152{,}48}{3{,}9579} = 291{,}18 \\approx 292 \\text{ clientes}',
      desc: 'Resultado fraccionario con redondeo de muestra'
    },
    {
      title: 'Resolución de Potencias',
      category: 'Aritmética',
      latex: '(1{,}96)^2 = 3{,}8416 \\quad ; \\quad (0{,}05)^2 = 0{,}0025',
      desc: 'Cálculo de coeficientes cuadráticos'
    },
    {
      title: 'Tamaño de Muestra: Población Infinita',
      category: 'Muestreo',
      latex: 'n = \\frac{Z^2 \\cdot p \\cdot q}{e^2}',
      desc: 'Cálculo para universos mayores a 100,000 elementos'
    },
    {
      title: 'Media Aritmética Muestral y Poblacional',
      category: 'Descriptiva',
      latex: '\\bar{x} = \\frac{\\sum_{i=1}^{n} x_i}{n} \\quad ; \\quad \\mu = \\frac{\\sum_{i=1}^{N} X_i}{N}',
      desc: 'Promedios muestral y poblacional'
    },
    {
      title: 'Varianza y Desviación Estándar Muestral',
      category: 'Descriptiva',
      latex: 's^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n - 1} \\quad ; \\quad s = \\sqrt{s^2}',
      desc: 'Dispersión y variabilidad muestral'
    },
    {
      title: 'Puntaje Z Estandarizado (Distribución Normal)',
      category: 'Inferencia',
      latex: 'Z = \\frac{x - \\mu}{\\sigma}',
      desc: 'Distancia estandarizada a la media'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded bg-blue-700 text-white font-serif font-bold text-lg flex items-center justify-center shadow-xs">
              ∑
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Ecuaciones Vectoriales tipo Word (APA 7)</h3>
              <p className="text-[11px] text-slate-500">Renderizado matemático vectorial inmune a fallos en PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Pestañas y Opciones */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'templates' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📚 Plantillas del Deber
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'builder' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🛠️ Constructor Fracción / Resultado
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'free' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✍️ Editor Libre (LaTeX / Word)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 text-[11px]">Modo:</label>
            <select
              value={equationMode}
              onChange={(e) => setEquationMode(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none text-xs"
            >
              <option value="display">Centrada en Bloque (APA 7)</option>
              <option value="inline">En Línea con el Texto</option>
            </select>
          </div>
        </div>

        {/* TAB 1: PLANTILLAS OFICIALES */}
        {activeTab === 'templates' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 gap-3.5 flex-1 bg-slate-50/50">
            {templates.map((tpl, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {tpl.category}
                    </span>
                    <h4 className="font-semibold text-xs text-slate-800 truncate">
                      {tpl.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{tpl.desc}</p>
                  
                  {/* Vista Previa Renderizada */}
                  <div
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded text-center overflow-x-auto min-h-[44px] flex items-center justify-center"
                    ref={(el) => renderSvg(tpl.latex, el)}
                  />
                </div>

                <button
                  onClick={() => handleInsertCurrent(tpl.latex)}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 shadow-xs"
                >
                  + Insertar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CONSTRUCTOR FRACCIÓN CON RESULTADO */}
        {activeTab === 'builder' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Variable inicial:</label>
                <input
                  type="text"
                  value={leftVar}
                  onChange={(e) => setLeftVar(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs outline-none focus:border-blue-500"
                  placeholder="n = "
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Numerador (arriba):</label>
                <input
                  type="text"
                  value={fracNum}
                  onChange={(e) => setFracNum(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs outline-none focus:border-blue-500"
                  placeholder="1200 \cdot 1.96^2 \cdot 0.25"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Denominador (abajo):</label>
                <input
                  type="text"
                  value={fracDen}
                  onChange={(e) => setFracDen(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs outline-none focus:border-blue-500"
                  placeholder="1199 \cdot 0.05^2 + ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">Resultado o igualdad final continua:</label>
              <input
                type="text"
                value={rightResult}
                onChange={(e) => setRightResult(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs outline-none focus:border-blue-500"
                placeholder="= 291{,}18 \approx 292 \text{ clientes}"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Todo lo que escribas aquí se mantendrá dentro de la misma caja matemática sin desunirse.
              </span>
            </div>

            {/* Vista Previa Vectorial en Vivo */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Vista previa vectorial en tiempo real (Cambria Math)
              </span>
              <div
                ref={previewRef}
                className="py-3 flex items-center justify-center min-h-[60px] overflow-x-auto"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleInsertCurrent()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-xs transition-colors"
              >
                Insertar Ecuación Vectorial en la Hoja
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MODO LIBRE LATEX */}
        {activeTab === 'free' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">Escribe o pega el código matemático:</label>
              <textarea
                value={rawLatex}
                onChange={(e) => setRawLatex(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
                placeholder="Ej: n = \frac{1152{,}48}{3{,}9579} = 291{,}18 \approx 292 \text{ clientes}"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Vista previa vectorial
              </span>
              <div
                ref={previewRef}
                className="py-3 flex items-center justify-center min-h-[60px] overflow-x-auto"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleInsertCurrent()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-xs transition-colors"
              >
                Insertar en la Hoja
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}