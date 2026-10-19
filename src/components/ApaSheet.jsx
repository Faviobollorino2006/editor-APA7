import React from 'react';

export default function ApaSheet({ data }) {
  return (
    <div className="apa-page font-times text-[12pt] text-black">
      {/* Numeración en la esquina superior derecha */}
      <div className="absolute top-[1in] right-[1in] leading-none">
        1
      </div>

      {/* Espaciado superior previo al título (aprox. 3 a 4 saltos a doble espacio) */}
      <div className="pt-24 flex flex-col items-center text-center">
        {/* Título en Negrita */}
        <h1 className="font-bold max-w-[80%] leading-normal mb-8">
          {data.title || "[Título del Trabajo de Investigación]"}
        </h1>

        {/* Metadatos del estudiante e institución (doble espacio regular) */}
        <div className="space-y-0">
          <p>{data.author || "[Nombre del Estudiante]"}</p>
          <p>{data.institution || "[Facultad, Nombre de la Universidad]"}</p>
          <p>{data.course || "[Código y Nombre de la Asignatura]"}</p>
          <p>{data.instructor || "[Nombre del Profesor]"}</p>
          <p>{data.date || "[Fecha de Entrega]"}</p>
        </div>
      </div>
    </div>
  );
}