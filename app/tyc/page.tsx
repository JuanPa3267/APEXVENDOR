import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4 bg-[#fafae6]">
      <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-black/5 flex flex-col gap-6 text-[#252525]">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black text-[#252525] tracking-tighter uppercase">
            Términos y Condiciones
          </h1>
          <div className="h-1.5 w-20 bg-[#e9d26a] mx-auto mt-3 rounded-full" />
          <p className="text-sm text-gray-500 mt-4">
            Última actualización: 15 de enero de 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-justify text-sm md:text-base overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          {/* 1. INTRODUCCIÓN Y ACEPTACIÓN */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            1. INTRODUCCIÓN Y ACEPTACIÓN
          </h3>
          <p className="mb-4">
            El presente documento constituye un contrato vinculante entre{" "}
            <strong>TECH & KNOWLEDGE (TAK)</strong> (en adelante, "LA EMPRESA"),
            propietaria de la plataforma web ApexVendor, y toda persona natural
            o jurídica que acceda o utilice dicha plataforma (en adelante, "EL
            USUARIO" o "EL ADMINISTRADOR", según corresponda).
          </p>
          <p className="mb-4">
            Al acceder a ApexVendor, EL USUARIO acepta estos Términos y
            Condiciones. Si no está de acuerdo, deberá abstenerse de utilizar la
            plataforma.
          </p>

          {/* 2. DEFINICIONES */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            2. DEFINICIONES
          </h3>
          <p className="mb-4">
            <strong>Plataforma:</strong> Software web ApexVendor que centraliza
            la información de proveedores y utiliza algoritmos para sugerir
            candidatos idóneos para proyectos específicos.
            <br />
            <strong>Motor de Recomendación (IA/NLP):</strong> Funcionalidad de
            la plataforma que procesa información del perfil del proveedor y
            comentarios históricos ingresados por EL ADMINISTRADOR para sugerir
            coincidencias o aptitudes para un proyecto.
            <br />
            <strong>Proveedor:</strong> Tercero (persona natural o jurídica)
            cuya información es gestionada dentro de la plataforma.
          </p>

          {/* 3. DESCRIPCIÓN DEL SERVICIO Y ALCANCE DE LA IA */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            3. DESCRIPCIÓN DEL SERVICIO Y ALCANCE DE LA IA
          </h3>
          <p className="mb-4">
            ApexVendor es una herramienta de gestión y soporte a la decisión.
          </p>
          <p className="mb-4">
            <strong>Naturaleza de la Recomendación:</strong> EL USUARIO reconoce
            y acepta que la Inteligencia Artificial (IA) integrada en la
            plataforma NO realiza evaluaciones autónomas de desempeño, ni asigna
            calificaciones morales o profesionales por sí misma.
          </p>
          <p className="mb-4">
            <strong>Funcionamiento:</strong> La IA se limita a analizar la
            información suministrada por el proveedor y los comentarios/feedback
            ingresados previamente por EL ADMINISTRADOR para identificar y
            recomendar aquellos perfiles que, según los datos disponibles, son
            más afines o aptos para un proyecto determinado (Matching).
          </p>
          <p className="mb-4">
            <strong>Decisión Humana:</strong> Las sugerencias arrojadas por la
            plataforma son meramente informativas. La decisión final de
            selección, contratación o desvinculación de un proveedor es
            responsabilidad exclusiva del criterio humano de EL ADMINISTRADOR.
          </p>

          {/* 4. RELACIÓN ENTRE LAS PARTES */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            4. RELACIÓN ENTRE LAS PARTES
          </h3>
          <p className="mb-4">
            El uso de la plataforma no crea ningún vínculo laboral, sociedad o
            agencia entre LA EMPRESA (ApexVendor) y los Proveedores gestionados,
            ni entre LA EMPRESA y EL USUARIO. La relación se limita a la
            provisión de una licencia de software (SaaS).
          </p>

          {/* 5. RESPONSABILIDAD SOBRE LA INFORMACIÓN (INPUTS) */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            5. RESPONSABILIDAD SOBRE LA INFORMACIÓN (INPUTS)
          </h3>
          <p className="mb-4">
            <strong>Veracidad de los Datos:</strong> La eficacia de las
            recomendaciones de la IA depende directamente de la calidad y
            veracidad de la información ingresada. LA EMPRESA no se hace
            responsable por recomendaciones inexactas que deriven de:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>
              Información desactualizada o falsa en el perfil del proveedor.
            </li>
            <li>
              Comentarios subjetivos, sesgados o erróneos ingresados por EL
              ADMINISTRADOR sobre los proveedores.
            </li>
          </ul>
          <p className="mb-4">
            <strong>Uso de Comentarios:</strong> EL ADMINISTRADOR se compromete
            a registrar comentarios y feedback sobre los proveedores de manera
            objetiva y profesional, entendiendo que estos textos son la base de
            aprendizaje para futuras recomendaciones del sistema.
          </p>

          {/* 6. PROPIEDAD INTELECTUAL */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            6. PROPIEDAD INTELECTUAL
          </h3>
          <p className="mb-4">
            LA EMPRESA conserva todos los derechos sobre el software, el código
            fuente y los algoritmos de recomendación. EL USUARIO mantiene la
            titularidad sobre los datos (Data Ownership) que ingresa a la
            plataforma (listas de proveedores, comentarios internos), otorgando
            a LA EMPRESA una licencia de uso para fines de procesamiento y
            mejora del servicio.
          </p>

          {/* 7. TRATAMIENTO DE DATOS Y HABEAS DATA */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            7. TRATAMIENTO DE DATOS Y HABEAS DATA
          </h3>
          <p className="mb-4">
            En cumplimiento de la Ley 1581 de 2012 y normativa vigente a 2026:
          </p>
          <p className="mb-4">
            <strong>Finalidad:</strong> Los datos personales de los proveedores
            son tratados con la finalidad de gestionar la relación comercial y
            permitir el funcionamiento del motor de recomendación.
          </p>
          <p className="mb-4">
            <strong>Transparencia en Algoritmos:</strong> Se informa a los
            titulares que sus datos serán procesados por sistemas automatizados
            para fines de perfilamiento técnico y sugerencia de contratación,
            sin que esto implique una decisión completamente automatizada que
            afecte sus derechos fundamentales sin intervención humana.
          </p>

          {/* 8. LIMITACIÓN DE RESPONSABILIDAD */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            8. LIMITACIÓN DE RESPONSABILIDAD
          </h3>
          <p className="mb-4">
            <strong>Resultados de Proyectos:</strong> LA EMPRESA no garantiza el
            éxito de los proyectos realizados con proveedores recomendados por
            la plataforma. La IA sugiere aptitud basada en datos pasados, lo
            cual no asegura rendimiento futuro.
          </p>
          <p className="mb-4">
            <strong>Exención:</strong> LA EMPRESA no será responsable por lucro
            cesante, daño emergente o pérdidas de oportunidad de negocio
            derivadas del uso de las recomendaciones de la plataforma.
          </p>

          {/* 9. LEY APLICABLE */}
          <h3 className="text-lg font-bold uppercase mb-2 mt-6 text-[#333]">
            9. LEY APLICABLE
          </h3>
          <p className="mb-4">
            Estos términos se rigen por las leyes de la República de Colombia.
            Cualquier disputa se resolverá ante la jurisdicción ordinaria o
            centros de conciliación de Bogotá D.C.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center mt-6 pt-6 border-t border-gray-100">
          <Link href="/register">
            <button className="bg-[#e9d26a] text-[#333] px-8 py-3 rounded-xl font-bold uppercase tracking-wider shadow-md hover:bg-[#bba955] hover:shadow-lg transition-all transform hover:-translate-y-1">
              Aceptar y Volver
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
