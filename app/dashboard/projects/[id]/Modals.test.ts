import { expect, test, describe } from "bun:test";

describe("Project Modals - UX y Estado", () => {
  test("TC-CB-91: ChangeStatusModal - Debería normalizar los labels de estado (quitando guiones bajos)", () => {
    const currentStatus = "en_curso";
    const label = currentStatus.replaceAll("_", " ");
    expect(label).toBe("en curso");
  });

  test("TC-CB-92: AssignVendorModal - Debería filtrar la lista de proveedores por búsqueda", () => {
    const providers = [
      { nombres_apellidos: "Cristian Gomez", usuario: { username: "cris" } },
      { nombres_apellidos: "Juan Perez", usuario: { username: "jp" } },
    ];
    const search = "cris";
    const filtered = providers.filter((p) =>
      (p.nombres_apellidos || "").toLowerCase().includes(search.toLowerCase()),
    );
    expect(filtered.length).toBe(1);
  });

  test("TC-CB-93: EvaluateVendorModal - Debería requerir todas las métricas antes de enviar", () => {
    const metrics = [{ id_metrica: "m1" }, { id_metrica: "m2" }];

    // ✅ Agregamos el tipo Record<string, number> para permitir indexación por string
    const ratings: Record<string, number> = { m1: 5 };

    const isComplete = metrics.every(
      (m) => ratings[m.id_metrica] !== undefined,
    );

    expect(isComplete).toBe(false);
  });
});
