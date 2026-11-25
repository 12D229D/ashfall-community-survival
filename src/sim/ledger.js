/**
 * ledger.js - El Libro de Cuentas del Refugio
 * Sistema de gobernanza y confianza social entre las 3 facciones del refugio:
 * 1. Civiles y Familias (Bienestar común, reparto equitativo, salud y hospitalidad)
 * 2. Técnicos y Mantenedores (Eficiencia estricta, ahorro de filtros y combustible)
 * 3. Exploradores y Cazadores (Libertad de acción, riesgos calculados, suministros)
 */

export class ShelterLedger {
  constructor() {
    this.factions = {
      civilians: {
        id: 'civilians',
        name: 'Civiles y Familias',
        trust: 60, // 0 - 100
        icon: '👨‍👩‍👧',
        stance: 'Preocupados por el calor humano, la comida y el rescate de vecinos.'
      },
      technicians: {
        id: 'technicians',
        name: 'Técnicos de Mantenimiento',
        trust: 65,
        icon: '🔧',
        stance: 'Enfocados en los respiradores, purificadores y preservación de energía.'
      },
      scouts: {
        id: 'scouts',
        name: 'Cuerpo de Exploradores',
        trust: 55,
        icon: '🧭',
        stance: 'Dispuestos a arriesgar la vida fuera con tal de traer suministros valiosos.'
      }
    };
    this.decisionsHistory = [];
  }

  getFactionTrust(factionId) {
    return this.factions[factionId]?.trust || 50;
  }

  getOverallCohesion() {
    const avg = (this.factions.civilians.trust + this.factions.technicians.trust + this.factions.scouts.trust) / 3;
    return Math.round(avg);
  }

  applyDecision(decision) {
    const { title, chosenOption, civilianDelta = 0, technicianDelta = 0, scoutDelta = 0, summary } = decision;

    this.factions.civilians.trust = Math.max(0, Math.min(100, this.factions.civilians.trust + civilianDelta));
    this.factions.technicians.trust = Math.max(0, Math.min(100, this.factions.technicians.trust + technicianDelta));
    this.factions.scouts.trust = Math.max(0, Math.min(100, this.factions.scouts.trust + scoutDelta));

    const entry = {
      id: Date.now(),
      title,
      chosenOption,
      civilianDelta,
      technicianDelta,
      scoutDelta,
      summary,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.decisionsHistory.unshift(entry);
    return entry;
  }

  checkMutinyOrCrisis() {
    const alerts = [];
    if (this.factions.civilians.trust < 20) {
      alerts.push('¡Descontento civil! Huelga de brazos caídos en el reparto de raciones.');
    }
    if (this.factions.technicians.trust < 20) {
      alerts.push('¡Tensión técnica! Los mantenedores se niegan a reparar conductos secundarios.');
    }
    if (this.factions.scouts.trust < 20) {
      alerts.push('¡Rebelión de exploradores! Se niegan a salir en expediciones de alto riesgo.');
    }
    return alerts;
  }
}
