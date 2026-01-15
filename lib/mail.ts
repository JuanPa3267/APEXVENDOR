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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const mailOptions = {
    from: `"ApexVendor" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "¡Bienvenido a ApexVendor!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .button:hover { background-color: #d4be5d !important; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f6f9fc">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
                
                <!-- Spacer -->
                <tr>
                   <td style="height: 6px; background-color: #e9d26a;"></td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <h1 style="color: #32325d; margin: 0 0 20px 0; font-size: 26px; font-weight: 700;">¡Bienvenido, ${name}!</h1>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #525f7f;">
                      Tu cuenta ha sido creada exitosamente. Nos alegra tenerte en ApexVendor.
                    </p>
                    <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #525f7f;">
                      Usa tu correo y contraseña para iniciar sesión en tu dashboard y empezar a gestionar tus ofertas de inmediato.
                    </p>
                    
                    <div>
                      <a href="${baseUrl}/login" class="button" style="background-color: #e9d26a; color: #1f1f1f; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                        Ingresar al Dashboard
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px;">
                    <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 0;">
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; text-align: center; background-color: #ffffff;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #9aa8b5;">ApexVendor Team - 2026</p>
                    <div style="font-size: 12px; color: #9aa8b5;">
                      <a href="${baseUrl}" style="color: #9aa8b5; text-decoration: underline; margin: 0 8px;">Sitio Web</a>
                      &bull;
                      <a href="#" style="color: #9aa8b5; text-decoration: underline; margin: 0 8px;">Soporte</a>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Legal/Unsubscribe Text -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                <tr>
                   <td align="center" style="padding: 20px; font-size: 12px; color: #aab7c4;">
                     &copy; 2026 ApexVendor. Todos los derechos reservados.
                   </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error enviando SMTP:", error);
  }
};
