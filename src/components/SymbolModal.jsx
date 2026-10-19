import React, { useState } from 'react';

export default function SymbolModal({ isOpen, onClose, onInsertSymbol }) {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState('greek');
  const [searchTerm, setSearchTerm] = useState('');

  const symbolCategories = {
    greek: {
      name: 'Letras Griegas (Estadística)',
      symbols: [
        { char: 'α', name: 'Alfa (Nivel de significancia / Error tipo I)' },
        { char: 'β', name: 'Beta (Coeficiente de regresión / Error tipo II)' },
        { char: 'μ', name: 'Mu (Media poblacional)' },
        { char: 'σ', name: 'Sigma (Desviación estándar poblacional)' },
        { char: 'σ²', name: 'Sigma cuadrado (Varianza poblacional)' },
        { char: 'Σ', name: 'Sigma mayúscula (Sumatoria)' },
        { char: 'χ²', name: 'Chi-cuadrado (Bondad de ajuste / Independencia)' },
        { char: 'ρ', name: 'Rho (Coeficiente de correlación poblacional)' },
        { char: 'θ', name: 'Theta (Parámetro desconocido)' },
        { char: 'λ', name: 'Lambda (Tasa media Poisson)' },
        { char: 'π', name: 'Pi (Constante / Proporción)' },
        { char: 'δ', name: 'Delta (Diferencia)' },
        { char: 'Δ', name: 'Delta mayúscula (Incremento)' },
        { char: 'ε', name: 'Épsilon (Término de error residual)' },
        { char: 'η', name: 'Eta (Tamaño del efecto)' },
        { char: 'ω', name: 'Omega' },
        { char: 'Ω', name: 'Omega mayúscula (Espacio muestral)' },
      ],
    },
    notation: {
      name: 'Notación Estadística & Hipótesis',
      symbols: [
        { char: 'x̄', name: 'x-barra (Media muestral)' },
        { char: 'ŷ', name: 'y-sombrero (Valor estimado de regresión)' },
        { char: 's', name: 's (Desviación estándar muestral)' },
        { char: 's²', name: 's cuadrado (Varianza muestral)' },
        { char: 'H₀', name: 'H sub-cero (Hipótesis nula)' },
        { char: 'H₁', name: 'H sub-uno (Hipótesis alternativa)' },
        { char: 'r', name: 'r de Pearson (Correlación muestral)' },
        { char: 'R²', name: 'R cuadrado (Coeficiente de determinación)' },
        { char: 'p', name: 'p-valor (Nivel crítico de significancia)' },
        { char: 'z', name: 'Puntaje Z (Distribución normal estándar)' },
        { char: 't', name: 'Estadístico t de Student' },
        { char: 'F', name: 'Estadístico F (ANOVA)' },
        { char: 'df', name: 'Grados de libertad (Degrees of freedom)' },
        { char: 'n', name: 'Tamaño de la muestra' },
        { char: 'N', name: 'Tamaño total de la población' },
      ],
    },
    operators: {
      name: 'Operadores Matemáticos & Lógicos',
      symbols: [
        { char: '±', name: 'Más/Menos (Margen de error)' },
        { char: '≠', name: 'Diferente de' },
        { char: '≤', name: 'Menor o igual que' },
        { char: '≥', name: 'Mayor o igual que' },
        { char: '≈', name: 'Aproximadamente igual a' },
        { char: '√', name: 'Raíz cuadrada' },
        { char: '∞', name: 'Infinito' },
        { char: '×', name: 'Multiplicación' },
        { char: '÷', name: 'División' },
        { char: '·', name: 'Punto medio (Producto)' },
        { char: '∈', name: 'Pertenece a' },
        { char: '∉', name: 'No pertenece a' },
        { char: '∩', name: 'Intersección (Sucesos conjuntos)' },
        { char: '∪', name: 'Unión de eventos' },
        { char: '∅', name: 'Conjunto vacío' },
        { char: '≡', name: 'Idéntico / Equivalente' },
        { char: '∝', name: 'Proporcional a' },
      ],
    },
  };

  const currentSymbols = symbolCategories[activeCategory].symbols.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.char.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono text-blue-400 font-bold">Ω</span>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Insertar Símbolo Estadístico y Matemático</h3>
              <p className="text-[11px] text-slate-400">Selecciona el símbolo para insertarlo en la posición del cursor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Buscador y Pestañas */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('greek')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeCategory === 'greek' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Letras Griegas
            </button>
            <button
              onClick={() => setActiveCategory('notation')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeCategory === 'notation' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Notación & Hipótesis
            </button>
            <button
              onClick={() => setActiveCategory('operators')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeCategory === 'operators' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Operadores
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar símbolo (ej: media, sigma, alfa)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 p-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        {/* Rejilla interactiva de símbolos */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          {currentSymbols.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onInsertSymbol(item.char);
                onClose();
              }}
              className="p-3 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500 rounded-lg flex items-center gap-3 transition-all text-left group"
              title={item.name}
            >
              <span className="w-10 h-10 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-lg font-serif font-bold text-blue-400 group-hover:scale-110 transition-transform">
                {item.char}
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-slate-200 truncate group-hover:text-blue-300">
                  {item.char}
                </span>
                <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                  {item.name}
                </span>
              </div>
            </button>
          ))}
          {currentSymbols.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs">
              No se encontraron símbolos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}