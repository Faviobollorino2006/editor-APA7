import React, { useState } from 'react';

export default function SymbolModal({ isOpen, onClose, onInsertSymbol }) {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState('greek');
  const [searchTerm, setSearchTerm] = useState('');

  const symbolCategories = {
    greek: {
      name: 'Letras Griegas (Estadística)',
      symbols: [
        { char: 'α', name: 'Alfa (Nivel de significancia)', isOperator: false },
        { char: 'β', name: 'Beta (Coeficiente de regresión)', isOperator: false },
        { char: 'μ', name: 'Mu (Media poblacional)', isOperator: false },
        { char: 'σ', name: 'Sigma (Desviación estándar)', isOperator: false },
        { char: 'σ²', name: 'Sigma cuadrado (Varianza)', isOperator: false },
        { char: 'Σ', name: 'Sigma mayúscula (Sumatoria)', isOperator: true },
        { char: 'χ²', name: 'Chi-cuadrado', isOperator: false },
        { char: 'ρ', name: 'Rho (Correlación poblacional)', isOperator: false },
        { char: 'θ', name: 'Theta (Parámetro)', isOperator: false },
        { char: 'λ', name: 'Lambda (Tasa media Poisson)', isOperator: false },
        { char: 'π', name: 'Pi (Constante / Proporción)', isOperator: false },
        { char: 'δ', name: 'Delta minúscula', isOperator: false },
        { char: 'Δ', name: 'Delta mayúscula (Incremento)', isOperator: true },
        { char: 'ε', name: 'Épsilon (Error residual)', isOperator: false },
        { char: 'η', name: 'Eta (Tamaño del efecto)', isOperator: false },
        { char: 'ω', name: 'Omega minúscula', isOperator: false },
        { char: 'Ω', name: 'Omega mayúscula (Espacio muestral)', isOperator: true },
      ],
    },
    notation: {
      name: 'Notación Estadística & Hipótesis',
      symbols: [
        { char: 'x̄', name: 'x-barra (Media muestral)', isOperator: false },
        { char: 'ŷ', name: 'y-sombrero (Valor estimado)', isOperator: false },
        { char: 's', name: 's (Desviación muestral)', isOperator: false },
        { char: 's²', name: 's cuadrado (Varianza muestral)', isOperator: false },
        { char: 'H₀', name: 'H sub-cero (Hipótesis nula)', isOperator: true },
        { char: 'H₁', name: 'H sub-uno (Hipótesis alternativa)', isOperator: true },
        { char: 'r', name: 'r de Pearson (Correlación muestral)', isOperator: false },
        { char: 'R²', name: 'R cuadrado (Coeficiente determinación)', isOperator: false },
        { char: 'p', name: 'p-valor (Significancia)', isOperator: false },
        { char: 'z', name: 'Puntaje Z estandarizado', isOperator: false },
        { char: 't', name: 'Estadístico t de Student', isOperator: false },
        { char: 'F', name: 'Estadístico F de Snedecor (ANOVA)', isOperator: false },
        { char: 'df', name: 'Grados de libertad (Degrees of freedom)', isOperator: false },
        { char: 'n', name: 'Tamaño de la muestra', isOperator: false },
        { char: 'N', name: 'Tamaño total de la población', isOperator: false },
      ],
    },
    operators: {
      name: 'Operadores Matemáticos & Lógicos',
      symbols: [
        { char: '±', name: 'Más/Menos (Margen de error)', isOperator: true },
        { char: '≠', name: 'Diferente de', isOperator: true },
        { char: '≤', name: 'Menor o igual que', isOperator: true },
        { char: '≥', name: 'Mayor o igual que', isOperator: true },
        { char: '≈', name: 'Aproximadamente igual a', isOperator: true },
        { char: '√', name: 'Raíz cuadrada', isOperator: true },
        { char: '∞', name: 'Infinito', isOperator: true },
        { char: '×', name: 'Multiplicación', isOperator: true },
        { char: '÷', name: 'División', isOperator: true },
        { char: '·', name: 'Punto medio (Producto)', isOperator: true },
        { char: '∈', name: 'Pertenece a', isOperator: true },
        { char: '∉', name: 'No pertenece a', isOperator: true },
        { char: '∩', name: 'Intersección de sucesos', isOperator: true },
        { char: '∪', name: 'Unión de eventos', isOperator: true },
        { char: '∅', name: 'Conjunto vacío', isOperator: true },
        { char: '≡', name: 'Idéntico / Equivalente', isOperator: true },
        { char: '∝', name: 'Proporcional a', isOperator: true },
      ],
    },
  };

  const currentSymbols = symbolCategories[activeCategory].symbols.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.char.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[85vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded bg-cyan-100 text-cyan-800 font-serif font-bold text-lg flex items-center justify-center math-font-preview">
              Ω
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Símbolos Matemáticos & Notación Estadística</h3>
              <p className="text-[11px] text-slate-500">Renderizados con tipografía matemática Cambria Math / STIX Math</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Buscador y Pestañas */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveCategory('greek')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'greek' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Letras Griegas
            </button>
            <button
              onClick={() => setActiveCategory('notation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'notation' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Notación & Hipótesis
            </button>
            <button
              onClick={() => setActiveCategory('operators')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'operators' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Operadores
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar símbolo (mu, sigma, z, hipotesis)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 p-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        {/* Rejilla de Símbolos con Previsualización Cambria Math */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 bg-slate-50/50">
          {currentSymbols.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onInsertSymbol({ char: item.char, isOperator: item.isOperator });
                onClose();
              }}
              className="p-2.5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg flex items-center gap-3 transition-all text-left shadow-2xs group"
              title={item.name}
            >
              <span
                className={`w-10 h-10 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-xl text-blue-700 group-hover:scale-110 transition-transform math-font-preview ${
                  item.isOperator ? 'font-normal' : 'italic'
                }`}
              >
                {item.char}
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700">
                  {item.char}
                </span>
                <span className="block text-[10px] text-slate-500 truncate mt-0.5">
                  {item.name}
                </span>
              </div>
            </button>
          ))}
          {currentSymbols.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No se encontraron símbolos coincidentes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}