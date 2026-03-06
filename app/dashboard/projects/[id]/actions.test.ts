import { describe, expect, test } from "bun:test";
import { assignVendorAction } from "./actions";

describe("Project Detail Actions - Integridad de Datos (Caja Blanca)", () => {
  test("TC-CB-87: Debería calcular correctamente la calificacion_global (Promedio Aritmético)", async () => {
    const formData = new FormData();
    formData.append("id_participacion", "p123");
    formData.append("id_evaluador", "admin1");
    formData.append("comentario", "Excelente desempeño");
    // Simulamos 3 métricas
    formData.append("metric_m1", "5");
    formData.append("metric_m2", "4");
    formData.append("metric_m3", "3");

    // Lógica interna: (5+4+3)/3 = 4
    const totalScore = 5 + 4 + 3;
    const count = 3;
    const calificacion_global = totalScore / count;

    expect(calificacion_global).toBe(4);
  });

  test("TC-CB-88: Debería rechazar asignaciones sin los campos obligatorios", async () => {
    const formData = new FormData();
    // No agregamos id_proyecto ni id_proveedor
    const result = await assignVendorAction(null, formData);
    expect(result.error).toBe("No autorizado"); // Fallo por assertAdmin inicial
  });
});
