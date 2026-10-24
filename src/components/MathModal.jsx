import React, { useState } from 'react';

export default function MathModal({ isOpen, onClose, onInsert }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'arithmetic' | 'stats' | 'prob' | 'inference'
  const [insertAsBlock, setInsertAsBlock] = useState(true);

  // Estados del Constructor Interactivo
  const [builderType, setBuilderType] = useState('fraction'); // 'fraction' | 'sqrt' | 'sum' | 'power'
  const [fracNum, setFracNum] = useState('x - \\mu');
  const [fracDen, setFracDen] = useState('\\sigma');
  const [sqrtIndex, setSqrtIndex] = useState('2');
  const [sqrtRadicand, setSqrtRadicand] = useState('n - 1');
  const [sumFrom, setSumFrom] = useState('i = 1');
  const [sumTo, setSumTo] = useState('n');
  const [sumExpr, setSumExpr] = useState('(x_i - \\bar{x})^2');
  const [powerBase, setPowerBase] = useState('Z');
  const [powerSup, setPowerSup] = useState('2');
  const [powerSub, setPowerSub] = useState('\\alpha/2');

  const wrapFormulaHtml = (innerHtml, label = '') => {
    if (insertAsBlock) {
      return `
        <div class="math-formula-box no-indent" style="text-align: center; margin: 1.2em 0; font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.8; cursor: text;">
          <span class="math-formula-inner" style="display: inline-block; padding: 6px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; cursor: text;">
            ${innerHtml}&nbsp;
          </span>
          ${label ? `<span class="math-formula-label" style="float: right; font-size: 11pt; color: #64748b; font-style: italic;">(${label})</span>` : ''}
        </div>
        <p class="indent-first-line"><br></p>
      `;
    }
    return `<span class="math-formula-box math-formula-inner" style="font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; padding: 1px 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; display: inline-flex; align-items: center; vertical-align: middle; cursor: text;">${innerHtml}</span>&nbsp;`;
  };

  const generateFractionHtml = (num, den) => {
    return `
      <table class="math-fraction-table" style="display: inline-table; vertical-align: middle; border-collapse: collapse; text-align: center; margin: 0 4px; border: none; font-size: 0.95em; line-height: 1.1;">
        <tbody>
          <tr>
            <td class="math-numerator" style="border-bottom: 1.5px solid #000000; padding: 0 4px 1px 4px; text-align: center; border-top: none; border-left: none; border-right: none;">${num}</td>
          </tr>
          <tr>
            <td class="math-denominator" style="border: none; padding: 1px 4px 0 4px; text-align: center; border-bottom: none; border-left: none; border-right: none;">${den}</td>
          </tr>
        </tbody>
      </table>&nbsp;
    `;
  };

  // Generador de Raíz con Vínculo Superior
  const generateSqrtHtml = (radicand, index = '2') => {
    const hasIndex = index && index.trim() !== '' && index.trim() !== '2';
    return `
      <span style="display: inline-flex; align-items: baseline; margin: 0 3px;">
        ${hasIndex ? `<sup style="font-size: 0.65em; margin-right: -2px; vertical-align: 0.6em;">${index}</sup>` : ''}
        <span style="font-size: 1.2em; line-height: 1; font-family: 'Times New Roman', Times, serif;">&radic;</span>
        <span style="border-top: 1.5px solid #000000; padding: 0 3px 0 2px; margin-left: 1px; line-height: 1.1;">${radicand}</span>
      </span>
    `;
  };

  // Inserción desde el Constructor Interactivo
  const handleInsertFromBuilder = () => {
    let formulaInnerHtml = '';
    if (builderType === 'fraction') {
      formulaInnerHtml = generateFractionHtml(fracNum || 'a', fracDen || 'b');
    } else if (builderType === 'sqrt') {
      formulaInnerHtml = generateSqrtHtml(sqrtRadicand || 'x', sqrtIndex);
    } else if (builderType === 'sum') {
      formulaInnerHtml = `
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="display: inline-flex; flex-direction: column; text-align: center; font-size: 0.75em; line-height: 1; vertical-align: middle;">
            <span>${sumTo}</span>
            <span style="font-size: 1.8em; line-height: 0.9; font-family: 'Times New Roman', serif;">&Sigma;</span>
            <span>${sumFrom}</span>
          </span>
          <span style="margin-left: 2px;">${sumExpr}</span>
        </span>
      `;
    } else if (builderType === 'power') {
      formulaInnerHtml = `
        <span class="math-power-group">
          ${powerBase}
          ${powerSub ? `<sub>${powerSub}</sub>` : ''}
          ${powerSup ? `<sup>${powerSup}</sup>` : ''}
        </span>&nbsp;
      `;
    }

    onInsert(wrapFormulaHtml(formulaInnerHtml));
    onClose();
  };

  // Plantillas de Catálogo Clasificadas
  const templates = {
    arithmetic: [
      {
        title: 'Fracción Simple',
        desc: 'Cociente básico entre dos cantidades',
        html: `<span>y = ${generateFractionHtml('a', 'b')}</span>`,
      },
      {
        title: 'Raíz Cuadrada Aritmética',
        desc: 'Radical de segundo orden',
        html: `<span>x = ${generateSqrtHtml('a^2 + b^2')}</span>`,
      },
      {
        title: 'Raíz Enésima',
        desc: 'Radical de grado arbitrario n',
        html: `<span>r = ${generateSqrtHtml('\\frac{P_n}{P_0}', 'n')} - 1</span>`,
      },
      {
        title: 'Variación Porcentual (Delta %)',
        desc: 'Tasa relativa de cambio entre periodos',
        html: `<span>&Delta;% = ${generateFractionHtml('V_f - V_i', 'V_i')} &times; 100%</span>`,
      },
      {
        title: 'Valor Absoluto / Distancia',
        desc: 'Magnitud sin considerar signo',
        html: `<span>d = |x_2 - x_1|</span>`,
      },
      {
        title: 'Regla de Tres / Proporción',
        desc: 'Igualdad de razones métricas',
        html: `<span>${generateFractionHtml('A', 'B')} = ${generateFractionHtml('C', 'D')} &implies; A &times; D = B &times; C</span>`,
      },
      {
        title: 'Binomio al Cuadrado',
        desc: 'Identidad algebraica notable',
        html: `<span>(a &plusmn; b)<sup>2</sup> = a<sup>2</sup> &plusmn; 2ab + b<sup>2</sup></span>`,
      },
      {
        title: 'Diferencia de Cuadrados',
        desc: 'Factorización de términos cuadráticos',
        html: `<span>a<sup>2</sup> - b<sup>2</sup> = (a - b)(a + b)</span>`,
      },
    ],
    stats: [
      {
        title: 'Media Aritmética Muestral (x̄)',
        desc: 'Promedio representativo de la muestra',
        html: `<span>x̄ = ${generateFractionHtml('&Sigma; x_i', 'n')}</span>`,
      },
      {
        title: 'Media Poblacional (μ)',
        desc: 'Valor esperado del universo de estudio',
        html: `<span>&mu; = ${generateFractionHtml('&Sigma; X_i', 'N')}</span>`,
      },
      {
        title: 'Varianza Muestral (s²)',
        desc: 'Dispersión cuadrática respecto a la media',
        html: `<span>s<sup>2</sup> = ${generateFractionHtml('&Sigma; (x_i - x̄)<sup>2</sup>', 'n - 1')}</span>`,
      },
      {
        title: 'Desviación Estándar Muestral (s)',
        desc: 'Medida de dispersión en unidades originales',
        html: `<span>s = ${generateSqrtHtml(generateFractionHtml('&Sigma; (x_i - x̄)<sup>2</sup>', 'n - 1'))}</span>`,
      },
      {
        title: 'Error Estándar de la Media (SE)',
        desc: 'Desviación estándar de la distribución muestral',
        html: `<span>SE = ${generateFractionHtml('s', generateSqrtHtml('n'))}</span>`,
      },
      {
        title: 'Puntaje Estandarizado (Z-Score)',
        desc: 'Distancia a la media en desviaciones estándar',
        html: `<span>Z = ${generateFractionHtml('x - &mu;', '&sigma;')}</span>`,
      },
      {
        title: 'Coeficiente de Variación (CV)',
        desc: 'Dispersión relativa porcentual',
        html: `<span>CV = ${generateFractionHtml('s', 'x̄')} &times; 100%</span>`,
      },
      {
        title: 'Rango Intercuartílico (IQR)',
        desc: 'Amplitud del 50% central de las observaciones',
        html: `<span>IQR = Q<sub>3</sub> - Q<sub>1</sub></span>`,
      },
    ],
    prob: [
      {
        title: 'Probabilidad Clásica (Laplace)',
        desc: 'Razón de casos favorables sobre posibles',
        html: `<span>P(A) = ${generateFractionHtml('n(A)', 'N')}</span>`,
      },
      {
        title: 'Factorial de un Número (n!)',
        desc: 'Producto de todos los enteros positivos hasta n',
        html: `<span>n! = n &times; (n - 1) &times; &ctdot; &times; 2 &times; 1</span>`,
      },
      {
        title: 'Combinatoria / Coeficiente Binomial',
        desc: 'Selecciones de k elementos sin importar orden',
        html: `<span>C(n, k) = ${generateFractionHtml('n!', 'k!(n - k)!')}</span>`,
      },
      {
        title: 'Permutación sin Repetición',
        desc: 'Arreglos ordenados de k elementos tomados de n',
        html: `<span>P(n, k) = ${generateFractionHtml('n!', '(n - k)!')}</span>`,
      },
      {
        title: 'Regla de la Adición (Unión de Eventos)',
        desc: 'Probabilidad de ocurrencia de al menos un suceso',
        html: `<span>P(A &cup; B) = P(A) + P(B) - P(A &cap; B)</span>`,
      },
      {
        title: 'Probabilidad Condicional',
        desc: 'Probabilidad de A dado que ocurrió B',
        html: `<span>P(A|B) = ${generateFractionHtml('P(A &cap; B)', 'P(B)')}</span>`,
      },
      {
        title: 'Distribución Binomial',
        desc: 'Probabilidad de k éxitos en n ensayos de Bernoulli',
        html: `<span>P(X = k) = ${generateFractionHtml('n!', 'k!(n - k)!')} &times; p<sup>k</sup> &times; (1 - p)<sup>n - k</sup></span>`,
      },
      {
        title: 'Teorema de Bayes',
        desc: 'Probabilidad posterior a partir de evidencia',
        html: `<span>P(A_i|B) = ${generateFractionHtml('P(B|A_i) &times; P(A_i)', '&Sigma; P(B|A_j) &times; P(A_j)')}</span>`,
      },
    ],
    inference: [
      {
        title: 'Tamaño de Muestra (Población Infinita)',
        desc: 'Cálculo para universos mayores a 100,000 elementos',
        html: `<span>n = ${generateFractionHtml('Z<sup>2</sup> &times; p &times; q', 'e<sup>2</sup>')}</span>`,
      },
      {
        title: 'Tamaño de Muestra (Población Finita)',
        desc: 'Cálculo con corrección por universo conocido N',
        html: `<span>n = ${generateFractionHtml('N &times; Z<sup>2</sup> &times; p &times; q', '(N - 1) &times; e<sup>2</sup> + Z<sup>2</sup> &times; p &times; q')}</span>`,
      },
      {
        title: 'Estadístico t de Student',
        desc: 'Contraste de hipótesis para medias con muestra pequeña',
        html: `<span>t = ${generateFractionHtml('x̄ - &mu;<sub>0</sub>', generateFractionHtml('s', generateSqrtHtml('n')))}</span>`,
      },
      {
        title: 'Intervalo de Confianza para la Media',
        desc: 'Estimación por intervalo con nivel 1 - α',
        html: `<span>IC = x̄ &plusmn; Z<sub>&alpha;/2</sub> &times; ${generateFractionHtml('s', generateSqrtHtml('n'))}</span>`,
      },
      {
        title: 'Intervalo de Confianza para Proporción',
        desc: 'Margen de estimación de frecuencias relativas',
        html: `<span>IC = p &plusmn; Z<sub>&alpha;/2</sub> &times; ${generateSqrtHtml(generateFractionHtml('p(1 - p)', 'n'))}</span>`,
      },
      {
        title: 'Estadístico Chi-Cuadrado (χ²)',
        desc: 'Prueba de bondad de ajuste o independencia',
        html: `<span>&chi;<sup>2</sup> = &Sigma; ${generateFractionHtml('(O_i - E_i)<sup>2</sup>', 'E_i')}</span>`,
      },
      {
        title: 'Ecuación de Regresión Lineal',
        desc: 'Modelo lineal de mínimos cuadrados ordinarios',
        html: `<span>ŷ = &beta;<sub>0</sub> + &beta;<sub>1</sub>x + &epsilon;</span>`,
      },
      {
        title: 'Coeficiente de Determinación (R²)',
        desc: 'Proporción de varianza explicada por el modelo',
        html: `<span>R<sup>2</sup> = 1 - ${generateFractionHtml('SS_{res}', 'SS_{tot}')}</span>`,
      },
    ],
  };

  const handleInsertTemplate = (item) => {
    onInsert(wrapFormulaHtml(item.html, item.title));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[88vh]">
        {/* Cabecera */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded bg-blue-100 text-blue-700 font-serif font-bold text-lg flex items-center justify-center">
              ∑
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Biblioteca Matemática y Estadística APA 7</h3>
              <p className="text-[11px] text-slate-500">Constructor de fracciones, radicales y fórmulas de inferencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Pestañas Superiores */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'builder'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              🛠️ Constructor Aritmético
            </button>
            <button
              onClick={() => setActiveTab('arithmetic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'arithmetic'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              📐 Aritmética & Álgebra
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              📊 Estadística Descriptiva
            </button>
            <button
              onClick={() => setActiveTab('prob')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'prob'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              🎲 Probabilidad
            </button>
            <button
              onClick={() => setActiveTab('inference')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'inference'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              🎯 Muestreo & Inferencia
            </button>
          </div>

          {/* Selector de alineación */}
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={insertAsBlock}
              onChange={(e) => setInsertAsBlock(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Centrar en bloque (APA 7)</span>
          </label>
        </div>

        {/* CONTENIDO 1: CONSTRUCTOR ARITMÉTICO PERSONALIZABLE */}
        {activeTab === 'builder' && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="flex gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setBuilderType('fraction')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${builderType === 'fraction' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Fracción Vertical (a/b)
              </button>
              <button
                onClick={() => setBuilderType('sqrt')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${builderType === 'sqrt' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Radical / Raíz (√x)
              </button>
              <button
                onClick={() => setBuilderType('sum')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${builderType === 'sum' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Sumatoria con Límites (∑)
              </button>
              <button
                onClick={() => setBuilderType('power')}
                className={`px-3 py-1.5 rounded text-xs font-medium ${builderType === 'power' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Potencia / Índices (xⁿ)
              </button>
            </div>

            {/* Campos dinámicos según el tipo seleccionado */}
            {builderType === 'fraction' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Numerador (arriba):</label>
                  <input
                    type="text"
                    value={fracNum}
                    onChange={(e) => setFracNum(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="Ej: x - μ o n(A)"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Denominador (abajo):</label>
                  <input
                    type="text"
                    value={fracDen}
                    onChange={(e) => setFracDen(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="Ej: σ o N"
                  />
                </div>
              </div>
            )}

            {builderType === 'sqrt' && (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Índice (opcional):</label>
                  <input
                    type="text"
                    value={sqrtIndex}
                    onChange={(e) => setSqrtIndex(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="2 (cuadrada), 3 (cúbica), n..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Radicando (contenido interior):</label>
                  <input
                    type="text"
                    value={sqrtRadicand}
                    onChange={(e) => setSqrtRadicand(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="Ej: n - 1 o p(1-p)/n"
                  />
                </div>
              </div>
            )}

            {builderType === 'sum' && (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Límite inferior (inicio):</label>
                  <input
                    type="text"
                    value={sumFrom}
                    onChange={(e) => setSumFrom(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="i = 1"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Límite superior (fin):</label>
                  <input
                    type="text"
                    value={sumTo}
                    onChange={(e) => setSumTo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="n o N"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Expresión a sumar:</label>
                  <input
                    type="text"
                    value={sumExpr}
                    onChange={(e) => setSumExpr(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="x_i o (x_i - x̄)^2"
                  />
                </div>
              </div>
            )}

            {builderType === 'power' && (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Base:</label>
                  <input
                    type="text"
                    value={powerBase}
                    onChange={(e) => setPowerBase(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="Z, x, e..."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Subíndice:</label>
                  <input
                    type="text"
                    value={powerSub}
                    onChange={(e) => setPowerSub(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="α/2 o i"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Superíndice / Exponente:</label>
                  <input
                    type="text"
                    value={powerSup}
                    onChange={(e) => setPowerSup(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm outline-none focus:border-blue-500"
                    placeholder="2, n..."
                  />
                </div>
              </div>
            )}

            {/* Vista previa en tiempo real */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Vista previa de la fórmula
              </span>
              <div className="font-serif text-xl py-3 flex items-center justify-center min-h-[56px] text-slate-900">
                {builderType === 'fraction' && (
                  <div dangerouslySetInnerHTML={{ __html: generateFractionHtml(fracNum || 'a', fracDen || 'b') }} />
                )}
                {builderType === 'sqrt' && (
                  <div dangerouslySetInnerHTML={{ __html: generateSqrtHtml(sqrtRadicand || 'x', sqrtIndex) }} />
                )}
                {builderType === 'sum' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-flex', flexDirection: 'column', textAlign: 'center', fontSize: '0.75em', lineHeight: 1 }}>
                      <span>{sumTo}</span>
                      <span style={{ fontSize: '1.8em', lineHeight: 0.9 }}>&Sigma;</span>
                      <span>{sumFrom}</span>
                    </span>
                    <span style={{ marginLeft: '4px' }}>{sumExpr}</span>
                  </span>
                )}
                {builderType === 'power' && (
                  <span>
                    {powerBase}
                    {powerSub ? <sub>{powerSub}</sub> : null}
                    {powerSup ? <sup>{powerSup}</sup> : null}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleInsertFromBuilder}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-sm transition-colors"
              >
                Insertar Fórmula en la Hoja
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO 2: PLANTILLAS POR CATEGORÍAS */}
        {activeTab !== 'builder' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
            {templates[activeTab]?.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-xs text-slate-800 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">{item.desc}</p>
                </div>

                <div className="py-2.5 px-3 bg-white border border-slate-200/80 rounded flex items-center justify-center font-serif text-base text-slate-900 min-h-[50px] overflow-x-auto">
                  <div dangerouslySetInnerHTML={{ __html: item.html }} />
                </div>

                <button
                  onClick={() => handleInsertTemplate(item)}
                  className="mt-3 w-full bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-medium py-1.5 rounded text-xs transition-colors shadow-2xs"
                >
                  + Insertar en Hoja
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}