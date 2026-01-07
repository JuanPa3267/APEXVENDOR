import { db } from "@/lib/db";

export const imageService = {
  async setProfileImage(username: string, base64Image: string) {
    // Usamos el username como identificador único
    return await db.pfps.upsert({
      where: { username: username },
      update: { image_base64: base64Image },
      create: {
        username: username,
        image_base64: base64Image,
      },
    });
  },

  async getProfileImage(username: string) {
    const res = await db.pfps.findUnique({
      where: { username: username },
    });
    return res?.image_base64 || null;
  },
};
