const { INotificator, EmailAdapter, TelegramAdapter } = require('./Adapter');

/**
 * PATRÓN FACTORY METHOD
 * 
 * NotificationFactory es responsable de crear instancias de adaptadores de notificación.
 * En lugar de que el código cliente (controladores) instancien directamente EmailAdapter o TelegramAdapter,
 * usa esta Factory para desacoplarse de las implementaciones concretas.
 * 
 * Ventajas:
 * - Centraliza la lógica de creación de objetos
 * - Fácil agregar nuevos tipos de notificadores sin modificar el código cliente
 * - Código cliente solo depende de la interfaz INotificator
 * - Cumple Open/Closed Principle: abierto para extensión, cerrado para modificación
 */
class NotificationFactory {
  /**
   * Crea una instancia del adaptador de notificación según el tipo proporcionado.
   * 
   * @param {string} type - Tipo de notificador: 'email' o 'telegram'
   * @returns {INotificator} Instancia del adaptador solicitado
   * @throws {Error} Si el tipo no es reconocido
   */
  static createNotificator(type = 'email') {
    const notificatorType = (type || 'email').toLowerCase();

    switch (notificatorType) {
      case 'email':
        return new EmailAdapter();
      
      case 'telegram':
        return new TelegramAdapter();
      
      default:
        console.warn(`⚠️ Tipo de notificador no reconocido: "${notificatorType}". Usando Email por defecto.`);
        return new EmailAdapter();
    }
  }

  /**
   * Obtiene la preferencia de notificación del usuario y crea el adaptador correspondiente.
   * 
   * @param {Object} user - Objeto del usuario con propiedad preferredNotificationMethod
   * @returns {INotificator} Instancia del adaptador según preferencia del usuario
   */
  static createFromUserPreference(user, overrideType) {
    const selectedType = overrideType || user?.preferredNotificationMethod || 'email';
    if (!selectedType) {
      console.log('📧 Usando Email como notificador por defecto');
      return new EmailAdapter();
    }

    console.log(`📬 Usando ${selectedType} como notificador del usuario ${user?.email || 'desconocido'}`);
    return this.createNotificator(selectedType);
  }
}

module.exports = NotificationFactory;
