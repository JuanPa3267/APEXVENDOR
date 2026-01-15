"use client";

import { updatePersonalDataAction } from "@/app/dashboard/profile/actions";
import { useState } from "react";

interface ProfileEditFormProps {
  profile: any;
  onSuccess: () => void;
  mode: "contact" | "social";
}

export default function ProfileEditForm({
  profile,
  onSuccess,
  mode,
}: ProfileEditFormProps) {
  const [isSavingData, setIsSavingData] = useState(false);

  return (
    <form
      action={async (formData) => {
        setIsSavingData(true);
        const res = await updatePersonalDataAction(formData);
        if (res?.error) {
          alert(res.error);
        } else {
          onSuccess();
        }
        setIsSavingData(false);
      }}
      className="space-y-8"
    >
      {mode === "contact" && (
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Datos de contacto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="telefono"
              defaultValue={profile.details?.telefono || ""}
              placeholder="Teléfono"
              className="styled-input"
            />
            <input
              name="direccion"
              defaultValue={profile.details?.direccion || ""}
              placeholder="Dirección"
              className="styled-input"
            />
            <input
              name="ciudad"
              defaultValue={profile.details?.city || ""}
              placeholder="Ciudad"
              className="styled-input md:col-span-2"
            />
          </div>
        </div>
      )}

      {mode === "social" && (
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            Redes sociales
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="linkedin"
              defaultValue={profile.user.social.linkedin || ""}
              placeholder="LinkedIn"
              className="styled-input"
            />
            <input
              name="github"
              defaultValue={profile.user.social.github || ""}
              placeholder="GitHub"
              className="styled-input"
            />
            <input
              name="website"
              defaultValue={profile.user.social.website || ""}
              placeholder="Website"
              className="styled-input"
            />
            <input
              name="instagram"
              defaultValue={profile.user.social.instagram || ""}
              placeholder="Instagram"
              className="styled-input"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSavingData}
          className={`btn-gold px-8 py-3 w-full md:w-auto ${isSavingData ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
        >
          {isSavingData ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
