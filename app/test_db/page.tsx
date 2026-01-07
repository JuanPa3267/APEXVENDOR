import { db } from "@/lib/db";

export default async function TestDbPage() {
  const userCount = await db.usuario.count().catch(() => 0);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-t-4 border-[#f8c11e]">
        <h1 className="text-xl font-bold text-[#333] mb-2">
          Database Connection
        </h1>
        <div className="text-5xl font-black text-[#e9d26a] my-4">
          {userCount}
        </div>
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Total Users
        </p>
      </div>
    </div>
  );
}
