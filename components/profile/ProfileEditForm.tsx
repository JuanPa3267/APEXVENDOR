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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateSocialLinks = (formData: FormData) => {
    const newErrors: { [key: string]: string } = {};
    const linkedin = formData.get("linkedin") as string;
    const github = formData.get("github") as string;
    const website = formData.get("website") as string;
    const instagram = formData.get("instagram") as string;

    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    if (linkedin && !linkedin.match(/^https:\/\/(www\.)?linkedin\.com\/.*$/)) {
      newErrors.linkedin =
        "Ingresa una URL válida de LinkedIn (https://linkedin.com/...)";
    }
    if (github && !github.match(/^https:\/\/(www\.)?github\.com\/.*$/)) {
      newErrors.github =
        "Ingresa una URL válida de GitHub (https://github.com/...)";
    }
    if (
      instagram &&
      !instagram.match(/^https:\/\/(www\.)?instagram\.com\/.*$/)
    ) {
      newErrors.instagram =
        "Ingresa una URL válida de Instagram (https://instagram.com/...)";
    }
    if (website && !website.match(urlRegex)) {
      newErrors.website = "Ingresa una URL válida";
    }

    return newErrors;
  };

  return (
    <form
      action={async (formData) => {
        setIsSavingData(true);
        setErrors({});

        if (mode === "social") {
          const validationErrors = validateSocialLinks(formData);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSavingData(false);
            return;
          }
        }

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
            <div>
              <input
                name="linkedin"
                defaultValue={profile.user.social.linkedin || ""}
                placeholder="LinkedIn"
                className={`styled-input w-full ${
                  errors.linkedin ? "border-red-500" : ""
                }`}
              />
              {errors.linkedin && (
                <p className="text-red-500 text-xs mt-1">{errors.linkedin}</p>
              )}
            </div>
            <div>
              <input
                name="github"
                defaultValue={profile.user.social.github || ""}
                placeholder="GitHub"
                className={`styled-input w-full ${
                  errors.github ? "border-red-500" : ""
                }`}
              />
              {errors.github && (
                <p className="text-red-500 text-xs mt-1">{errors.github}</p>
              )}
            </div>
            <div>
              <input
                name="website"
                defaultValue={profile.user.social.website || ""}
                placeholder="Website"
                className={`styled-input w-full ${
                  errors.website ? "border-red-500" : ""
                }`}
              />
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">{errors.website}</p>
              )}
            </div>
            <div>
              <input
                name="instagram"
                defaultValue={profile.user.social.instagram || ""}
                placeholder="Instagram"
                className={`styled-input w-full ${
                  errors.instagram ? "border-red-500" : ""
                }`}
              />
              {errors.instagram && (
                <p className="text-red-500 text-xs mt-1">{errors.instagram}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSavingData}
          className={`btn-gold px-8 py-3 w-full md:w-auto ${
            isSavingData ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isSavingData ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
