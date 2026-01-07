import nodemailer from "nodemailer";

// Configuración del transportador (El "servidor" SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: `"ApexVendor" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "¡Bienvenido a ApexVendor!",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px; text-align: center;">
        <div style="max-width: 500px; background: #ffffff; margin: auto; padding: 20px; border-top: 5px solid #e9d26a; border-radius: 8px;">
          <h1 style="color: #252525;">Bienvenido, ${name}</h1>
          <p style="color: #666;">Tu cuenta ha sido creada con éxito.</p>
          <p>Usa tu correo y contraseña para iniciar sesión en tu dashboard y empezar a gestionar tus ofertas.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <small style="color: #aaa;">ApexVendor Team - 2026</small>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado a:", email);
  } catch (error) {
    console.error("Error enviando SMTP:", error);
  }
};
