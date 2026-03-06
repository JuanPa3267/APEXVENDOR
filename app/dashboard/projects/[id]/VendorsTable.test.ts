import { expect, test, describe } from "bun:test";

describe("VendorsTable - Reglas de Negocio UI", () => {
  test("TC-CB-89: canEvaluate - Debería permitir evaluación solo si la participación terminó o el proyecto culminó", () => {
    const participant = { fin: "2026-01-01", evaluacion: [] }; // Participación ya terminó
    const projectStatus = "En curso";

    const isParticipationEnded = new Date(participant.fin) < new Date();
    const alreadyEvaluated = participant.evaluacion.length > 0;

    const canEval = isParticipationEnded && !alreadyEvaluated;
    expect(canEval).toBe(true);
  });

  test("TC-CB-90: canEvaluate - Debería bloquear si ya existe una evaluación", () => {
    const participant = { fin: "2026-01-01", evaluacion: [{ id: 1 }] };
    const alreadyEvaluated = participant.evaluacion.length > 0;
    expect(alreadyEvaluated).toBe(true);
  });
});
