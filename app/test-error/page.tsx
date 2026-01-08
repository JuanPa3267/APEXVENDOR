export default function TestErrorPage() {
  // Esto simula un fallo de base de datos o lógica de servidor
  throw new Error("Simulacro de fallo crítico en el núcleo de Apex.");

  return <div>Si ves esto, el error falló.</div>;
}
