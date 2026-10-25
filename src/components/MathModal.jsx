import React, { useState, useEffect, useRef } from 'react';

export default function MathModal({ isOpen, onClose, onInsert, editingLatex = null }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(editingLatex ? 'free' : 'arithmetic'); // 'arithmetic' | 'templates' | 'builder' | 'free'
  const [equationMode, setEquationMode] = useState('inline'); // 'inline' (en la línea) | 'display' (bloque centrado)
  
  // Constructor Visual
  const [fracNum, setFracNum] = useState('1200 \\cdot 1{,}96^2 \\cdot 0{,}25');
  const [fracDen, setFracDen] = useState('1199 \\cdot 0{,}05^2 + 1{,}96^2 \\cdot 0{,}25');
  const [leftVar, setLeftVar] = useState('n = ');
  const [rightResult, setRightResult] = useState('');
  
  // Editor Libre
  const [rawLatex, setRawLatex] = useState(
    editingLatex || '(1{,}96)^2 = 3{,}8416'
  );
  
  const previewRef = useRef(null);

  // Limpia cualquier signo de dólar accidental
  const cleanLatex = (str) => {
    if (!str) return '';
    return str.replace(/\$+/g, '').trim();
  };

  const renderSvg = (latexCode, container) => {
    if (!container) return;
    const cleaned = cleanLatex(latexCode);
    if (window.MathJax && window.MathJax.tex2svg) {
      try {
        const node = window.MathJax.tex2svg(cleaned, { display: equationMode === 'display' });
        container.innerHTML = '';
        container.appendChild(node);
      } catch (e) {
        container.innerHTML = `<span class="text-rose-600 text-xs">${cleaned}</span>`;
      }
    } else {
      container.innerHTML = `<span class="font-serif italic text-sm">${cleaned}</span>`;
    }
  };

  const getCurrentLatex = () => {
    if (activeTab === 'builder') {
      let latex = '';
      if (leftVar) latex += leftVar + ' ';
      latex += `\\frac{${fracNum || 'a'}}{${fracDen || 'b'}}`;
      if (rightResult) latex += ' ' + rightResult;
      return cleanLatex(latex);
    }
    if (activeTab === 'free') {
      return cleanLatex(rawLatex);
    }
    return '';
  };

  useEffect(() => {
    if (activeTab === 'builder' || activeTab === 'free') {
      renderSvg(getCurrentLatex(), previewRef.current);
    }
  }, [fracNum, fracDen, leftVar, rightResult, rawLatex, activeTab, equationMode]);

  const handleInsertCurrent = (customLatex = null, preferredMode = null) => {
    const chosenMode = preferredMode || equationMode;
    const finalLatex = cleanLatex(customLatex || getCurrentLatex());
    if (!finalLatex) return;

    let svgHtml = '';
    if (window.MathJax && window.MathJax.tex2svg) {
      const node = window.MathJax.tex2svg(finalLatex, { display: chosenMode === 'display' });
      // Extrae EXCLUSIVAMENTE el SVG gráfico para evitar duplicados en dos líneas
      const svgEl = node.querySelector('svg');
      if (svgEl) {
        svgEl.setAttribute('style', 'display: inline-block; vertical-align: middle;');
        svgHtml = svgEl.outerHTML;
      } else {
        svgHtml = node.innerHTML;
      }
    } else {
      svgHtml = `<span style="font-family: 'Cambria Math', serif; font-size: 12pt;">${finalLatex}</span>`;
    }

    const wrapperHtml = chosenMode === 'display'
      ? `
        <div class="math-equation-block no-indent math-scale-md" data-latex="${encodeURIComponent(finalLatex)}" contenteditable="false" style="text-align: center; margin: 0.8em 0; user-select: none;" title="Haz clic para seleccionar o modificar">
          <div class="math-equation-box">
            ${svgHtml}
          </div>
        </div>
      `
      : `
        <span class="math-equation-inline" data-latex="${encodeURIComponent(finalLatex)}" contenteditable="false" style="display: inline-block; vertical-align: middle; padding: 1px 4px; margin: 0 2px;">
          ${svgHtml}
        </span>&nbsp;
      `;

    onInsert(wrapperHtml);
    onClose();
  };};

  // Catálogo Aritmético Paso a Paso (Ideal para deberes de estadística)
  const arithmeticTemplates = [
    {
      title: 'Resolución de Potencia al Cuadrado',
      latex: '(1{,}96)^2 = 3{,}8416',
      desc: 'Cálculo de Z al cuadrado (Paso 2)',
      defaultMode: 'inline'
    },
    {
      title: 'Resolución de Margen de Error al Cuadrado',
      latex: '(0{,}05)^2 = 0{,}0025',
      desc: 'Cálculo de e al cuadrado (Paso 2)',
      defaultMode: 'inline'
    },
    {
      title: 'Multiplicación Continua del Numerador',
      latex: '1200 \\times 3{,}8416 \\times 0{,}25 = 1152{,}48',
      desc: 'Cálculo de N · Z² · p · q (Paso 3)',
      defaultMode: 'inline'
    },
    {
      title: 'Cálculo del Denominador Combinado',
      latex: '(0{,}0025 \\times 1199) + (3{,}8416 \\times 0{,}25) = 2{,}9975 + 0{,}9604 = 3{,}9579',
      desc: 'Suma de términos del divisor (Paso 3)',
      defaultMode: 'inline'
    },
    {
      title: 'División Lineal con Redondeo Final',
      latex: 'n = 1152{,}48 / 3{,}9579 = 291{,}18 \\approx 292 \\text{ clientes}',
      desc: 'Resultado final del tamaño muestral (Paso 4)',
      defaultMode: 'inline'
    },
    {
      title: 'Fracción Vertical con Resultado en Bloque',
      latex: 'n = \\frac{1152{,}48}{3{,}9579} = 291{,}18 \\approx 292 \\text{ clientes}',
      desc: 'División vertical centrada (Paso 4)',
      defaultMode: 'display'
    }
  ];

  // Plantillas de Fórmulas Teóricas
  const theoreticalTemplates = [
    {
      title: 'Tamaño de Muestra: Población Finita (Fórmula General)',
      latex: 'n = \\frac{N \\cdot Z^2 \\cdot p \\cdot q}{(N - 1) \\cdot e^2 + Z^2 \\cdot p \\cdot q}',
      desc: 'Cálculo general con N conocido',
      defaultMode: 'display'
    },
    {
      title: 'Sustitución Completa de Valores (Paso 1)',
      latex: 'n = \\frac{1200 \\cdot (1{,}96)^2 \\cdot 0{,}50 \\cdot 0{,}50}{1199 \\cdot (0{,}05)^2 + (1{,}96)^2 \\cdot 0{,}50 \\cdot 0{,}50}',
      desc: 'Reemplazo de datos para N=1200',
      defaultMode: 'display'
    },
    {
      title: 'Población Infinita (Desconocida)',
      latex: 'n = \\frac{Z^2 \\cdot p \\cdot q}{e^2}',
      desc: 'Fórmula para universos mayores a 100.000',
      defaultMode: 'display'
    },
    {
      title: 'Media Aritmética y Desviación Estándar',
      latex: '\\bar{x} = \\frac{\\sum x_i}{n} \\quad ; \\quad s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n - 1}}',
      desc: 'Medidas de tendencia central y dispersión',
      defaultMode: 'display'
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
              <h3 className="font-bold text-sm text-slate-800">
                {editingLatex ? 'Editar Ecuación' : 'Inserción de Fórmulas y Aritmética APA 7'}
              </h3>
              <p className="text-[11px] text-slate-500">Insertar en el renglón activo o centrada en bloque</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Pestañas y Modo de Inserción */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('arithmetic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'arithmetic' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔢 Aritmética & Cálculos
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'templates' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📚 Fórmulas Teóricas
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'builder' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🛠️ Constructor
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'free' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✍️ Editor Libre
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 text-[11px]">Posición:</label>
            <select
              value={equationMode}
              onChange={(e) => setEquationMode(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none text-xs font-medium"
            >
              <option value="inline">En el renglón (En línea)</option>
              <option value="display">Centrada en Bloque (APA 7)</option>
            </select>
          </div>
        </div>

        {/* TAB 1: ARITMÉTICA Y CÁLCULOS PASO A PASO */}
        {activeTab === 'arithmetic' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 gap-3 flex-1 bg-slate-50/50">
            {arithmeticTemplates.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-800">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-2">{item.desc}</p>
                  <div
                    className="p-2 bg-slate-50 border border-slate-100 rounded text-left overflow-x-auto min-h-[38px] flex items-center"
                    ref={(el) => renderSvg(item.latex, el)}
                  />
                </div>
                <button
                  onClick={() => handleInsertCurrent(item.latex, item.defaultMode)}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 shadow-xs"
                >
                  + Insertar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: FÓRMULAS TEÓRICAS */}
        {activeTab === 'templates' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 gap-3 flex-1 bg-slate-50/50">
            {theoreticalTemplates.map((tpl, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-800">{tpl.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-2">{tpl.desc}</p>
                  <div
                    className="p-2 bg-slate-50 border border-slate-100 rounded text-left overflow-x-auto min-h-[38px] flex items-center"
                    ref={(el) => renderSvg(tpl.latex, el)}
                  />
                </div>
                <button
                  onClick={() => handleInsertCurrent(tpl.latex, tpl.defaultMode)}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 shadow-xs"
                >
                  + Insertar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONSTRUCTOR */}
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
              <label className="block text-slate-600 font-semibold mb-1 text-xs">Resultado o igualdad continua:</label>
              <input
                type="text"
                value={rightResult}
                onChange={(e) => setRightResult(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs outline-none focus:border-blue-500"
                placeholder="= 291{,}18 \approx 292 \text{ clientes}"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Vista previa
              </span>
              <div
                ref={previewRef}
                className="py-3 flex items-center justify-center min-h-[50px] overflow-x-auto"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleInsertCurrent()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-xs transition-colors"
              >
                {editingLatex ? 'Guardar Cambios' : 'Insertar en la Hoja'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: MODO LIBRE */}
        {activeTab === 'free' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                Expresión matemática (no incluyas símbolos $$ ni $):
              </label>
              <textarea
                value={rawLatex}
                onChange={(e) => setRawLatex(cleanLatex(e.target.value))}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-800 outline-none focus:border-blue-500"
                placeholder="Ej: (1,96)^2 = 3,8416"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Vista previa
              </span>
              <div
                ref={previewRef}
                className="py-3 flex items-center justify-center min-h-[50px] overflow-x-auto"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleInsertCurrent()}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-xs transition-colors"
              >
                {editingLatex ? 'Guardar Cambios' : 'Insertar en la Hoja'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );