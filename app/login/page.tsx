"use client";

import { motion } from "framer-motion";
import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#f8f9fa]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="form-div" // Corregido de form_div a form-div
      >
        <div className="text-center mb-10">
          <motion.h2
            layoutId="logo"
            className="text-4xl font-black text-[#252525] tracking-tighter uppercase"
          >
            ApexVendor
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 }}
            className="h-1.5 w-16 bg-[#e9d26a] mx-auto mt-2 rounded-full"
          ></motion.div>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && <div className="error">{state.error}</div>}

          <input
            name="username"
            type="text"
            placeholder="Username"
            className="styled-input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="styled-input"
            required
          />

          <button
            type="submit"
            disabled={pending}
            className={`btn-gold mt-2 ${
              pending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {pending ? "Cargando..." : "Log In"}
          </button>
        </form>
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">¿No tienes una cuenta?</span>{" "}
          <a
            href="/register"
            className="text-[#bba955] font-bold hover:underline"
          >
            Regístrate aquí
          </a>
        </div>
      </motion.div>
    </div>
  );
}
