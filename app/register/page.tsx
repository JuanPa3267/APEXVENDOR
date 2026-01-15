"use client";

import { useActionState, useState } from "react";
import { registerAction } from "./actions";

type CertUI = {
  nombre: string;
  emisor: string;
  nivel: string;
  fechaEmision: string;
  fechaExpiracion: string;
  file: File | null;
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null);

  const [step, setStep] = useState(1);

  // Paso 1
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Paso 2
  const [tipoProveedor, setTipoProveedor] = useState<"Persona" | "Empresa">(
    "Persona"
  );

  // Paso 3 (datos + redes)
  const [name, setName] = useState("");
  const [nit, setNit] = useState("");
  const [city, setCity] = useState("");

  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [portafolio, setPortafolio] = useState("");

  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

  // Paso 4 docs
  const [cv, setCv] = useState<File | null>(null);

  const [certs, setCerts] = useState<CertUI[]>([
    {
      nombre: "",
      emisor: "",
      nivel: "",
      fechaEmision: "",
      fechaExpiracion: "",
      file: null,
    },
  ]);

  const passMismatch = confirm.length > 0 && password !== confirm;

  const next = () => {
    if (step === 1) {
      if (!correo || !password || !confirm || passMismatch) return;
    }
    if (step === 2) {
      if (!tipoProveedor) return;
    }
    if (step === 3) {
      if (!name || !nit || !city) return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const addCert = () => {
    setCerts((prev) => [
      ...prev,
      {
        nombre: "",
        emisor: "",
        nivel: "",
        fechaEmision: "",
        fechaExpiracion: "",
        file: null,
      },
    ]);
  };

  const removeCert = (i: number) => {
    setCerts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateCert = (i: number, patch: Partial<CertUI>) => {
    setCerts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4">
      <div className="form_div max-w-lg w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-[#252525] tracking-tighter uppercase">
            Registro
          </h2>
          <div className="h-1.5 w-12 bg-[#e9d26a] mx-auto mt-2 rounded-full" />
          <p className="text-sm text-gray-500 mt-2">Paso {step} de 4</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <div className="error text-sm mb-2">{state.error}</div>
          )}

          {/* Hidden fields para enviar todo al final */}
          <input type="hidden" name="correo" value={correo} />
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="tipo_proveedor" value={tipoProveedor} />

          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="nit" value={nit} />
          <input type="hidden" name="city" value={city} />

          <input type="hidden" name="telefono" value={telefono} />
          <input type="hidden" name="direccion" value={direccion} />
          <input type="hidden" name="portafolio_resumen" value={portafolio} />

          <input type="hidden" name="linkedin" value={linkedin} />
          <input type="hidden" name="github" value={github} />
          <input type="hidden" name="website" value={website} />
          <input type="hidden" name="instagram" value={instagram} />

          <input type="hidden" name="is_admin" value="false" />

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="styled-input"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              {/* TODO: Modificar longitud minima de contraseña */}
              <input
                type="password"
                placeholder="Contraseña"
                className="styled-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  className={`styled-input ${
                    passMismatch ? "border-red-400" : ""
                  }`}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                {passMismatch && (
                  <span className="text-xs text-red-500">
                    Las contraseñas no coinciden.
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn-gold mt-2 py-3"
                onClick={next}
                disabled={!correo || !password || !confirm || passMismatch}
              >
                Siguiente
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                Tipo de proveedor
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer">
                  <input
                    type="radio"
                    checked={tipoProveedor === "Persona"}
                    onChange={() => setTipoProveedor("Persona")}
                  />
                  <span className="text-sm">Persona</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer">
                  <input
                    type="radio"
                    checked={tipoProveedor === "Empresa"}
                    onChange={() => setTipoProveedor("Empresa")}
                  />
                  <span className="text-sm">Empresa</span>
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn-gold flex-1 py-3"
                  onClick={next}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  {tipoProveedor === "Empresa"
                    ? "Razón social"
                    : "Nombre completo"}
                </label>
                <input
                  placeholder={
                    tipoProveedor === "Empresa"
                      ? "Nombre legal de la empresa"
                      : "Nombres y apellidos"
                  }
                  className="styled-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="NIT / Cédula"
                  className="styled-input"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  required
                />
                <input
                  placeholder="Ciudad"
                  className="styled-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              {/* TODO: Modificar longitud minima de telefono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Teléfono (opcional)"
                  className="styled-input"
                  type="number"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
                <input
                  placeholder="Dirección (opcional)"
                  className="styled-input"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <textarea
                placeholder="Resumen portafolio / experiencia (opcional)"
                className="styled-input min-h-[110px]"
                value={portafolio}
                onChange={(e) => setPortafolio(e.target.value)}
              />

              <label className="text-xs font-bold text-gray-400 ml-1 uppercase mt-2">
                Redes sociales (opcional)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="LinkedIn"
                  className="styled-input"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
                <input
                  placeholder="GitHub"
                  className="styled-input"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
                <input
                  placeholder="Website"
                  className="styled-input"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <input
                  placeholder="Instagram"
                  className="styled-input"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn-gold flex-1 py-3"
                  onClick={next}
                  disabled={!name || !nit || !city}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                Hoja de vida (PDF)
              </label>

              {/* Este input SI debe estar dentro del form para que FormData lo incluya */}
              <input
                type="file"
                name="hoja_vida_pdf"
                accept="application/pdf"
                className="styled-input"
                onChange={(e) => setCv(e.target.files?.[0] ?? null)}
              />

              <div className="mt-3 flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                  Certificaciones
                </label>
                <button
                  type="button"
                  className="btn-secondary px-3 py-2"
                  onClick={addCert}
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {certs.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">
                        Certificación #{idx + 1}
                      </span>
                      {certs.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:underline"
                          onClick={() => removeCert(idx)}
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    {/* Nombres en arrays para que FormData.getAll(...) funcione */}
                    <input
                      name="cert_nombre[]"
                      placeholder="Nombre certificación"
                      className="styled-input"
                      value={c.nombre}
                      onChange={(e) =>
                        updateCert(idx, { nombre: e.target.value })
                      }
                    />
                    <input
                      name="cert_emisor[]"
                      placeholder="Emisor"
                      className="styled-input mt-2"
                      value={c.emisor}
                      onChange={(e) =>
                        updateCert(idx, { emisor: e.target.value })
                      }
                    />
                    <input
                      name="cert_nivel[]"
                      placeholder="Nivel / categoría (opcional)"
                      className="styled-input mt-2"
                      value={c.nivel}
                      onChange={(e) =>
                        updateCert(idx, { nivel: e.target.value })
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <input
                        name="cert_fecha_emision[]"
                        type="date"
                        className="styled-input"
                        value={c.fechaEmision}
                        onChange={(e) =>
                          updateCert(idx, { fechaEmision: e.target.value })
                        }
                      />
                      <input
                        name="cert_fecha_expiracion[]"
                        type="date"
                        className="styled-input"
                        value={c.fechaExpiracion}
                        onChange={(e) =>
                          updateCert(idx, { fechaExpiracion: e.target.value })
                        }
                      />
                    </div>

                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase mt-2 block">
                      Archivo PDF
                    </label>
                    <input
                      type="file"
                      name="cert_file[]"
                      accept="application/pdf"
                      className="styled-input"
                      onChange={(e) =>
                        updateCert(idx, { file: e.target.files?.[0] ?? null })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 py-3"
                  onClick={back}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className={`btn-gold flex-1 py-3 ${
                    pending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {pending ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">¿Ya tienes cuenta?</span>{" "}
          <a href="/login" className="text-[#bba955] font-bold hover:underline">
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}
