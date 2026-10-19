import React, { useState } from 'react';

export default function ReferenceModal({ isOpen, onClose, onInsertReference, onInsertInTextCitation }) {
  if (!isOpen) return null;

  const [sourceType, setSourceType] = useState('book'); // 'book' | 'journal' | 'web'
  const [authors, setAuthors] = useState('Triola, M. F.');
  const [year, setYear] = useState('2018');
  const [title, setTitle] = useState('Estadística');
  const [publisher, setPublisher] = useState('Pearson Educación');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');

  // Genera el HTML formal de la referencia según APA 7
  const buildReferenceHtml = () => {
    let html = `<div class="apa-reference-item">${authors} (${year}). `;

    if (sourceType === 'book') {
      html += `<em>${title}</em>. ${publisher}.`;
      if (doi) html += ` ${doi}`;
    } else if (sourceType === 'journal') {
      html += `${title}. <em>${journal}</em>`;
      if (volume) html += `, <em>${volume}</em>`;
      if (issue) html += `(${issue})`;
      if (pages) html += `, ${pages}.`;
      if (doi) html += ` https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, '')}`;
    } else {
      html += `<em>${title}</em>. ${publisher ? `${publisher}. ` : ''}${doi}`;
    }

    html += `</div><p></p>`;
    return html;
  };

  const handleInsertFullReference = () => {
    onInsertReference(buildReferenceHtml());
    onClose();
  };

  const handleInsertParenthetical = () => {
    // Ejemplo: (Triola, 2018)
    const primaryAuthor = authors.split(',')[0].trim();
    onInsertInTextCitation(`(${primaryAuthor}, ${year}) `);
    onClose();
  };

  const handleInsertNarrative = () => {
    // Ejemplo: Triola (2018)
    const primaryAuthor = authors.split(',')[0].trim();
    onInsertInTextCitation(`${primaryAuthor} (${year}) `);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-bold text-base text-blue-400">Generador de Citas y Referencias APA 7</h3>
            <p className="text-xs text-slate-400">Construye referencias bibliográficas con sangría francesa y citas de texto</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded flex items-center justify-center">✕</button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Tipo de fuente */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setSourceType('book')}
              className={`px-3 py-1.5 rounded font-medium ${sourceType === 'book' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Libro / Manual
            </button>
            <button
              onClick={() => setSourceType('journal')}
              className={`px-3 py-1.5 rounded font-medium ${sourceType === 'journal' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Artículo Científico / Paper
            </button>
            <button
              onClick={() => setSourceType('web')}
              className={`px-3 py-1.5 rounded font-medium ${sourceType === 'web' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Página Web / Informe
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Autor(es) (Apellido, Inicial.)</label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: Triola, M. F. o Levin, R. I. & Rubin, D. S."
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Año de Publicación</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: 2018"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Título de la Obra o Artículo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
              placeholder="Ej: Estadística aplicada a los negocios y a la economía"
            />
          </div>

          {sourceType === 'book' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Editorial</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
                placeholder="Ej: Pearson Educación / McGraw-Hill"
              />
            </div>
          )}

          {sourceType === 'journal' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Nombre de la Revista</label>
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none"
                  placeholder="Ej: Journal of Statistics"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vol (Núm)</label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none"
                  placeholder="Ej: 14(2)"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Páginas</label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none"
                  placeholder="Ej: 45-62"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">DOI o Enlace URL (Opcional)</label>
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-200 outline-none focus:border-blue-500"
              placeholder="Ej: https://doi.org/10.1016/..."
            />
          </div>

          {/* Previsualización en tiempo real */}
          <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Previsualización de la Referencia</span>
            <div
              className="font-times text-slate-200 text-sm"
              dangerouslySetInnerHTML={{ __html: buildReferenceHtml() }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs mr-1">Citar en el texto:</span>
            <button
              onClick={handleInsertParenthetical}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 px-2.5 py-1.5 rounded text-xs border border-slate-700"
              title="Inserta cita entre paréntesis al final de la oración"
            >
              (Autor, Año)
            </button>
            <button
              onClick={handleInsertNarrative}
              className="bg-slate-800 hover:bg-slate-700 text-blue-300 px-2.5 py-1.5 rounded text-xs border border-slate-700"
              title="Inserta cita como parte del discurso del párrafo"
            >
              Autor (Año)
            </button>
          </div>

          <button
            onClick={handleInsertFullReference}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 rounded text-xs shadow transition-colors"
          >
            Agregar a la Bibliografía
          </button>
        </div>
      </div>
    </div>
  );
}