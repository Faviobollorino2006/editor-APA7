import React from 'react';

export default function CoverPageForm({ data, onChange }) {
  const handleChange = (e) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-sm space-y-4">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Datos de la Carátula APA 7</h2>
      
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase">Título del Trabajo</label>
        <input 
          type="text" 
          name="title" 
          value={data.title} 
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ej: Análisis Estadístico de Regresión..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase">Nombre del Estudiante</label>
        <input 
          type="text" 
          name="author" 
          value={data.author} 
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase">Facultad y Universidad</label>
        <input 
          type="text" 
          name="institution" 
          value={data.institution} 
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase">Materia / Asignatura</label>
        <input 
          type="text" 
          name="course" 
          value={data.course} 
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase">Profesor</label>
        <input 
          type="text" 
          name="instructor" 
          value={data.instructor} 
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase">Fecha de Entrega</label>
        <input 
          type="text" 
          name="date" 
          value={data.date} 
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  );
}