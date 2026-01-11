import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VendorsTable from "./VendorsTable";
import CreateAdminButton from "./CreateAdminButton";

export default async function VendorsPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  // Verificación de Rol Admin
  const user = await db.usuario.findUnique({
    where: { username },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) redirect("/dashboard/profile?error=unauthorized");

  const vendors = await db.perfilProveedor.findMany({
    include: {
      usuario: true, // Esto trae username, correo y estado_cuenta
    },
  });
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-[#252525] font-black text-4xl uppercase tracking-tighter m-0 leading-none">
            Directorio de <span className="text-[#bba955]">Proveedores</span>
          </h2>
          <p className="text-gray-400 text-xs mt-3 uppercase tracking-widest font-bold">
            Gestión y Auditoría de Cuentas Apex
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateAdminButton />

          <div className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#e9d26a]/20">
            Total: {vendors.length} Registros
          </div>
        </div>

      </div>

      <VendorsTable initialVendors={vendors} />
    </div>
  );
}
