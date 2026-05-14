/**
 * INTERFACE: TaskMeta (I)
 * Define la estructura compartida (Intrinsic State).
 */
class TaskMeta {
  constructor(priority) {
    this.priority = priority; // +priority: String
  }
  
  /**
   * +getStyles(extrinsicState): Object
   * Combina el estado interno (compartido) con el externo (único).
   */
  getStyles(extrinsicState) {
    throw new Error("Method 'getStyles()' must be implemented.");
  }
}

/**
 * CONCRETE FLYWEIGHT: ConcretTaskMeta (C)
 * Almacena el estado intrínseco compartido por múltiples tareas.
 */
class ConcretTaskMeta extends TaskMeta {
  constructor(priority, bg, color, dot, gradient) {
    super(priority);
    this.bg = bg;
    this.color = color;
    this.dot = dot;
    this.gradient = gradient;
  }

  getStyles(extrinsicState = {}) {
    return {
      backgroundColor: this.bg,
      color: this.color,
      borderLeft: `3px solid ${this.dot}`,
      backgroundImage: this.gradient,
      // El estado extrínseco puede modificar el resultado final sin alterar el objeto compartido
      opacity: extrinsicState.isDragging ? 0.6 : 1,
      transform: extrinsicState.isSelected ? 'scale(1.02)' : 'scale(1)',
      ...extrinsicState
    };
  }
}

/**
 * FLYWEIGHT FACTORY: TaskMetaFactory (C)
 * Gestiona la creación y reutilización de los objetos Flyweight.
 * Incluye un monitor de ahorro de memoria.
 */
export class TaskMetaFactory {
  static #cache = new Map(); // -cache: Map
  static #totalRequests = 0; // Contador para medir eficiencia

  // -definitions: Object
  static #definitions = {
    URGENTE: { bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444', gradient:'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
    ALTA:    { bg:'#FFEDD5', color:'#9A3412', dot:'#F97316', gradient:'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)' },
    MEDIA:   { bg:'#FEF3C7', color:'#92400E', dot:'#F59E0B', gradient:'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
    BAJA:    { bg:'#DBEAFE', color:'#1E40AF', dot:'#3B82F6', gradient:'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
  };

  /**
   * +getMeta(priority: String): TaskMeta
   * Retorna una instancia compartida desde la caché o crea una nueva si no existe.
   */
  static getMeta(priority) {
    this.#totalRequests++;
    const key = (priority || 'MEDIA').toUpperCase();
    
    // Si no está en caché, lo creamos (Solo ocurrirá un máximo de 4 veces)
    if (!this.#cache.has(key)) {
      const def = this.#definitions[key] || this.#definitions.MEDIA;
      this.#cache.set(key, new ConcretTaskMeta(key, def.bg, def.color, def.dot, def.gradient));
    }

    // Calcular ahorro porcentual
    const instancesInCache = this.#cache.size;
    const savings = ((1 - instancesInCache / this.#totalRequests) * 100).toFixed(1);

    // Mostrar en consola el ahorro en tiempo real
    if (this.#totalRequests % 5 === 0 || this.#totalRequests < 5) { // Loguear con frecuencia pero sin saturar
      console.info(
        `%c ♻️ Flyweight: ${savings}% ahorro %c (Solicitudes: ${this.#totalRequests} | Instancias reales: ${instancesInCache})`,
        "background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
        "color: #6B7280;"
      );
    }

    return this.#cache.get(key);
  }

  /**
   * Retorna estadísticas detalladas del uso de memoria.
   */
  static getStats() {
    return {
      totalRequests: this.#totalRequests,
      instancesInCache: this.#cache.size,
      savingsPercent: ((1 - this.#cache.size / this.#totalRequests) * 100).toFixed(2) + '%'
    };
  }
}

// Exportación simplificada para el resto de la aplicación
export const getTaskMeta = (priority) => TaskMetaFactory.getMeta(priority);

