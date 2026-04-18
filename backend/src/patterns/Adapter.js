const nodemailer = require('nodemailer');

/**
 * PATRÓN ADAPTER - Interfaz/Clase Base
 * 
 * Define el contrato que debe implementar cualquier adaptador de notificación.
 * Esto permite que el código cliente (controladores) dependa de una abstracción
 * en lugar de implementaciones concretas, cumpliendo con el Principio de Inversión de Dependencia.
 */
class INotificator {
  /**
   * Envía una notificación
   * @param {Object} message - Objeto con la información de la notificación
   * @param {string} message.to - Correo destinatario
   * @param {string} message.subject - Asunto del mensaje
   * @param {string} message.html - Contenido HTML del mensaje
   * @param {string} message.text - Contenido de texto plano
   * @returns {Promise<Object>} Respuesta del envío
   */
  async sendNotification(message) {
    throw new Error('sendNotification() debe ser implementado por subclases');
  }
}

/**
 * PATRÓN ADAPTER - Implementación Concreta
 * 
 * Adaptador que encapsula la lógica de Nodemailer.
 * El controlador no necesita conocer los detalles de Nodemailer,
 * solo interactúa con esta interfaz estándar.
 * 
 * Ventajas:
 * - Si necesitas cambiar a otro servicio de email, solo cambias esta clase
 * - Los controladores permanecen inalterados
 * - Fácil de testear: puedes mockear este adaptador
 */
class EmailAdapter extends INotificator {
  constructor() {
    super();
    this.transporter = null;
    this.testAccount = null;
    this.transporterReady = this.initTransporter();
  }

  /**
   * Inicializa el transporter de Nodemailer
   * Usa Ethereal (servicio de prueba gratuito) o Mailtrap
   * Si no hay credenciales reales para Ethereal, crea una cuenta de prueba automática.
   */
  async initTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'ethereal';
    const hasEtherealCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS && !['test@ethereal.email', 'test_password'].includes(process.env.EMAIL_USER);

    if (emailService === 'ethereal') {
      if (hasEtherealCredentials) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      } else {
        const account = await nodemailer.createTestAccount();
        this.testAccount = account;
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
        console.log('✉️ Ethereal test account created:', account.user);
      }
    } else if (emailService === 'mailtrap') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else if (emailService === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // App password, no contraseña de Gmail
        },
      });
    }
  }

  /**
   * Implementación del método sendNotification del contrato INotificator
   * 
   * @param {Object} message 
   * @param {string} message.to - Correo destinatario
   * @param {string} message.subject - Asunto
   * @param {string} message.html - HTML del email
   * @param {string} message.text - Texto plano del email
   * @param {string} message.from - Remitente (opcional)
   * @returns {Promise<Object>} Respuesta del envío
   */
  async sendNotification(message) {
    try {
      if (!this.transporter) {
        await this.transporterReady;
      }

      const mailOptions = {
        from: message.from || process.env.EMAIL_FROM || 'TaskFlow <noreply@taskflow.com>',
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`📧 Email enviado a ${message.to}:`);
      console.log(`   ID: ${info.messageId}`);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`   Vista previa: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || null,
        message: 'Email enviado correctamente',
      };
    } catch (error) {
      console.error(`❌ Error enviando email a ${message.to}:`, error);
      return {
        success: false,
        error: error.message || String(error),
        message: 'Error enviando email',
      };
    }
  }

  /**
   * Método auxiliar para construir un email de confirmación de tarea
   * @param {Object} taskData - Datos de la tarea
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Objeto con to, subject, html, text
   */
  buildTaskConfirmationEmail(taskData, userData) {
    const taskUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskData._id}`;
    
    return {
      to: userData.email,
      subject: `✅ Tarea Creada: ${taskData.title}`,
      text: `
Hola ${userData.name},

Tu tarea "${taskData.title}" ha sido creada exitosamente.

Detalles:
- ID: ${taskData._id}
- Tipo: ${taskData.type}
- Prioridad: ${taskData.priority}
- Tablero: ${taskData.boardId}
- Descripción: ${taskData.description || '(Sin descripción)'}

Ver tarea: ${taskUrl}

¡Saludos desde TaskFlow!
      `,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
              .header { background-color: #6366F1; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { padding: 20px; }
              .details { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #6366F1; margin: 15px 0; }
              .button { display: inline-block; background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Tarea Creada</h1>
              </div>
              <div class="content">
                <p>¡Hola <strong>${userData.name}</strong>!</p>
                <p>Tu tarea <strong>"${taskData.title}"</strong> ha sido creada exitosamente.</p>
                
                <div class="details">
                  <p><strong>Detalles de la Tarea:</strong></p>
                  <ul>
                    <li><strong>Tipo:</strong> ${taskData.type}</li>
                    <li><strong>Prioridad:</strong> ${taskData.priority}</li>
                    <li><strong>Descripción:</strong> ${taskData.description || '(Sin descripción)'}</li>
                    <li><strong>ID:</strong> ${taskData._id}</li>
                  </ul>
                </div>

                <a href="${taskUrl}" class="button">Ver Tarea</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 TaskFlow - Todos los derechos reservados</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  }
}

/**
 * PATRÓN ADAPTER - Implementación Concreta para Telegram
 * 
 * Adaptador que encapsula la lógica de Telegram API.
 * Mantiene la misma interfaz que EmailAdapter para permitir intercambiabilidad.
 * 
 * Ventajas del patrón:
 * - Código cliente no conoce detalles de la API de Telegram
 * - Fácil cambiar entre notificadores (email, telegram, SMS, etc.)
 * - Cumple Liskov Substitution Principle: ambos adapters son intercambiables
 */
class TelegramAdapter extends INotificator {
  constructor() {
    super();
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!this.botToken || !this.chatId) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados');
    }
  }

  /**
   * Implementación del método sendNotification del contrato INotificator
   * 
   * @param {Object} message 
   * @param {string} message.telegramUserId - ID de chat de Telegram del usuario
   * @param {string} message.subject - Asunto (se usa en el texto del mensaje)
   * @param {string} message.text - Texto del mensaje
   * @returns {Promise<Object>} Respuesta del envío
   */
  async sendNotification(message) {
    try {
      if (!this.botToken || !this.chatId) {
        return {
          success: false,
          error: 'Token de Telegram no configurado',
          message: 'Error enviando mensaje de Telegram',
        };
      }

      // Construir el texto del mensaje
      const telegramMessage = `*${message.subject}*\n\n${message.text}`;

      // Usar el chatId del mensaje si se proporciona, sino usar el del env
      const targetChatId = message.telegramUserId || this.chatId;

      const apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      });

      const result = await response.json();

      if (result.ok) {
        console.log(`📱 Mensaje de Telegram enviado a ${targetChatId}:`);
        console.log(`   ID del mensaje: ${result.result.message_id}`);

        return {
          success: true,
          messageId: result.result.message_id,
          previewUrl: null,
          message: 'Mensaje de Telegram enviado correctamente',
        };
      } else {
        console.error(`❌ Error enviando mensaje de Telegram:`, result.description);
        return {
          success: false,
          error: result.description || 'Error desconocido',
          message: 'Error enviando mensaje de Telegram',
        };
      }
    } catch (error) {
      console.error(`❌ Error en TelegramAdapter:`, error);
      return {
        success: false,
        error: error.message || String(error),
        message: 'Error enviando mensaje de Telegram',
      };
    }
  }

  /**
   * Método auxiliar para construir un mensaje de confirmación de tarea
   * @param {Object} taskData - Datos de la tarea
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Objeto con subject, text y telegramUserId
   */
  buildTaskConfirmationMessage(taskData, userData) {
    const taskUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskData._id}`;
    
    return {
      subject: `✅ Tarea Creada: ${taskData.title}`,
      text: `
¡Hola ${userData.name}!

Tu tarea *"${taskData.title}"* ha sido creada exitosamente.

*Detalles:*
• Tipo: ${taskData.type}
• Prioridad: ${taskData.priority}
• Descripción: ${taskData.description || '(Sin descripción)'}

Ver en TaskFlow: ${taskUrl}

¡Saludos desde TaskFlow!
      `.trim(),
      telegramUserId: userData.telegramUserId || null,
    };
  }
}

module.exports = {
  INotificator,
  EmailAdapter,
  TelegramAdapter,
};
