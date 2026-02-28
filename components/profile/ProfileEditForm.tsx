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

  const DAYS_OF_WEEK = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const [selectedDays, setSelectedDays] = useState<string[]>(
    profile.details?.dias_disponibles || [],
  );

  // Extraemos inicio y fin del array horas_disponibles [start, end]
  const [startTime, setStartTime] = useState(
    profile.details?.horas_disponibles?.[0] || "08:00",
  );
  const [endTime, setEndTime] = useState(
    profile.details?.horas_disponibles?.[1] || "17:00",
  );

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      return next.sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b),
      );
    });
  };

  const format12h = (time: string) => {
    if (!time) return "--:--";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

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

  const TimeSelector = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
  }) => {
    const [h, m] = value.split(":");
    const hour24 = parseInt(h);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;

    const handleHourChange = (newH12: number) => {
      let newH24 = newH12;
      if (ampm === "PM" && newH12 < 12) newH24 += 12;
      if (ampm === "AM" && newH12 === 12) newH24 = 0;
      onChange(`${newH24.toString().padStart(2, "0")}:${m}`);
    };

    const handleMinuteChange = (newM: string) => {
      onChange(`${h}:${newM}`);
    };

    const toggleAMPM = () => {
      let newH24 = hour24;
      if (ampm === "AM") {
        newH24 = (hour24 + 12) % 24;
      } else {
        newH24 = (hour24 - 12 + 24) % 24;
      }
      onChange(`${newH24.toString().padStart(2, "0")}:${m}`);
    };

    return (
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-black text-[#bba955] uppercase tracking-widest">
          {label}
        </p>
        <div className="flex items-center gap-2 bg-[#fcfcfc] border border-gray-100 rounded-2xl p-2 px-4 shadow-sm focus-within:border-[#e9d26a] transition-all group">
          <select
            value={hour12}
            onChange={(e) => handleHourChange(parseInt(e.target.value))}
            className="bg-transparent text-sm font-black outline-none cursor-pointer p-1 appearance-none hover:text-[#bba955] transition-colors"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="text-gray-300 font-bold">:</span>
          <select
            value={m}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="bg-transparent text-sm font-black outline-none cursor-pointer p-1 appearance-none hover:text-[#bba955] transition-colors"
          >
            {Array.from({ length: 60 }, (_, i) => i).map((min) => (
              <option key={min} value={min.toString().padStart(2, "0")}>
                {min.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleAMPM}
            className="ml-auto bg-[#252525] text-[#e9d26a] text-[10px] font-black px-4 py-2 rounded-xl active:scale-95 transition-all hover:bg-black hover:shadow-lg uppercase tracking-widest"
          >
            {ampm}
          </button>
        </div>
      </div>
    );
  };

  return (
    <form
      action={async (formData) => {
        setIsSavingData(true);
        setErrors({});

        if (mode === "contact") {
          formData.set("dias_disponibles", JSON.stringify(selectedDays));
          // Guardamos como [start, end] para fácil lectura
          formData.set(
            "horas_disponibles",
            JSON.stringify([startTime, endTime]),
          );
        }

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
              className="styled-input"
            />
            <input
              name="tarifa_hora"
              type="number"
              step="0.01"
              defaultValue={profile.details?.tarifa_hora || ""}
              placeholder="Tarifa por hora ($)"
              className="styled-input"
            />
          </div>

          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 mt-6">
              Días de Disponibilidad
            </h4>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border ${
                    selectedDays.includes(day)
                      ? "bg-[#e9d26a] text-[#252525] border-[#e9d26a] shadow-lg"
                      : "bg-transparent text-gray-400 border-gray-200 hover:border-[#e9d26a] hover:text-[#252525]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 mt-6">
              Horario de Disponibilidad
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TimeSelector
                label="Desde"
                value={startTime}
                onChange={setStartTime}
              />
              <TimeSelector
                label="Hasta"
                value={endTime}
                onChange={setEndTime}
              />
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase mt-3">
              Rango actual:{" "}
              <span className="text-[#252525] font-black whitespace-nowrap">
                {format12h(startTime)} — {format12h(endTime)}
              </span>
            </p>
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
