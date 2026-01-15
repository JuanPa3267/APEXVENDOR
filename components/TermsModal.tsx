export default function TermsModal({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-black text-[#252525] uppercase tracking-tight">
              Términos y Condiciones – Proveedores
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Última actualización: 15 de enero de 2026
            </p>
          </div>
          <button
            onClick={onReject}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar text-justify text-sm text-[#333]">
          <h3 className="text-base font-bold uppercase mb-2 text-[#252525]">
            1. INTRODUCCIÓN Y ACEPTACIÓN
          </h3>
          <p className="mb-4">
            El presente documento constituye un contrato vinculante entre{" "}
            <strong>TECH & KNOWLEDGE (TAK)</strong> (en adelante, “LA EMPRESA”),
            propietaria de la plataforma web ApexVendor, y toda persona natural o
            jurídica que se registre como proveedor (en adelante, “EL PROVEEDOR”).
          </p>
          <p className="mb-4">
            Al registrarse en ApexVendor y aceptar estos términos, EL PROVEEDOR
            declara haber leído, entendido y aceptado de manera expresa el
            tratamiento de sus datos personales conforme a la ley.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            2. DEFINICIONES
          </h3>
          <p className="mb-4">
            <strong>Plataforma:</strong> Software web ApexVendor destinado a la
            gestión y análisis de información de proveedores.
            <br />
            <strong>Proveedor:</strong> Persona natural o jurídica que registra
            voluntariamente su información en la plataforma.
            <br />
            <strong>Motor de Recomendación (IA):</strong> Sistema automatizado
            que analiza información del proveedor con fines de afinidad técnica.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            3. DESCRIPCIÓN DEL SERVICIO
          </h3>
          <p className="mb-4">
            ApexVendor es una herramienta de gestión y soporte a la decisión.
            La información suministrada por EL PROVEEDOR puede ser analizada
            mediante sistemas automatizados para identificar afinidades técnicas.
          </p>
          <p className="mb-4">
            La plataforma <strong>no garantiza contrataciones</strong> ni
            decisiones automáticas sin intervención humana.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            4. NATURALEZA DE LA RELACIÓN
          </h3>
          <p className="mb-4">
            El registro en ApexVendor no crea relación laboral, contractual ni
            societaria entre EL PROVEEDOR y LA EMPRESA. ApexVendor actúa
            únicamente como plataforma tecnológica (SaaS).
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            5. RESPONSABILIDAD SOBRE LA INFORMACIÓN
          </h3>
          <p className="mb-4">
            EL PROVEEDOR es responsable de la veracidad, actualización y
            legalidad de la información y documentos que registre en la
            plataforma.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            6. PROPIEDAD DE LOS DATOS
          </h3>
          <p className="mb-4">
            EL PROVEEDOR conserva la titularidad de sus datos personales. Al
            registrarse, otorga a LA EMPRESA una licencia de uso limitada para
            la operación, análisis técnico y mejora del servicio.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            7. TRATAMIENTO DE DATOS PERSONALES
          </h3>
          <p className="mb-4">
            En cumplimiento de la Ley 1581 de 2012, EL PROVEEDOR autoriza de
            manera previa, expresa e informada el tratamiento de sus datos
            personales con fines de gestión, análisis técnico y funcionamiento
            de la plataforma.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            8. DERECHOS DEL TITULAR
          </h3>
          <p className="mb-4">
            EL PROVEEDOR podrá conocer, actualizar, rectificar, suprimir sus
            datos o revocar la autorización otorgada, conforme a la ley.
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            9. CANAL DE ATENCIÓN
          </h3>
          <p className="mb-4">
            Para ejercer derechos de Habeas Data:
            <br />
            📧 <strong>soporte@apexvendor.com</strong>
          </p>

          <h3 className="text-base font-bold uppercase mb-2 mt-6 text-[#252525]">
            10. LEY APLICABLE
          </h3>
          <p className="mb-4">
            Estos términos se rigen por las leyes de la República de Colombia.
            Cualquier disputa será resuelta en la jurisdicción de Bogotá D.C.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onReject} className="btn-delete px-6 py-2">
            Rechazar
          </button>
          <button onClick={onAccept} className="btn-gold px-8 py-2">
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
