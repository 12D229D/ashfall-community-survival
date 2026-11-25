/**
 * ashPhases.js - Definición y lógica de las fases de ceniza volcánica
 * Afectan visibilidad, desgaste de purificadores, salud respiratoria y riesgo en el exterior.
 */

export const ASH_PHASES = {
  LEVE: {
    id: 'leve',
    name: 'Ceniza Leve en Suspensión',
    severity: 1,
    color: '#94a3b8',
    particleDensity: 25,
    windSpeed: 1.2,
    skyColor: 'rgba(30, 41, 59, 0.75)',
    filterWearPerHour: 0.25,
    respiratoryStressRate: 0.1,
    expeditionRiskModifier: 1.0,
    visibilityKm: 5.0,
    description: 'Fina capa de polvo grisáceo. La vida exterior es posible con pañuelos o máscaras quirúrgicas.'
  },
  MODERADA: {
    id: 'moderada',
    name: 'Lluvia de Ceniza Volcánica',
    severity: 2,
    color: '#f97316',
    particleDensity: 70,
    windSpeed: 2.8,
    skyColor: 'rgba(67, 34, 18, 0.85)',
    filterWearPerHour: 0.75,
    respiratoryStressRate: 0.4,
    expeditionRiskModifier: 1.45,
    visibilityKm: 1.2,
    description: 'Chubascos de tefra fina y olor acre a dióxido de azufre. Los filtros requieren mantenimiento frecuente.'
  },
  TORMENTA: {
    id: 'tormenta',
    name: 'Tormenta Piroclástica y Lluvia Ácida',
    severity: 3,
    color: '#ef4444',
    particleDensity: 140,
    windSpeed: 5.0,
    skyColor: 'rgba(40, 10, 10, 0.95)',
    filterWearPerHour: 1.8,
    respiratoryStressRate: 1.2,
    expeditionRiskModifier: 2.2,
    visibilityKm: 0.2,
    description: 'Cielo ennegrecido con relámpagos volcánicos. La ceniza abrasiva devora los conductos y salir sin respirador es letal.'
  }
};

export class AshPhaseManager {
  constructor(initialPhase = 'leve') {
    this.currentPhase = ASH_PHASES[initialPhase.toUpperCase()] || ASH_PHASES.LEVE;
  }

  getPhase() {
    return this.currentPhase;
  }

  setPhase(phaseKey) {
    const key = phaseKey.toUpperCase();
    if (ASH_PHASES[key]) {
      this.currentPhase = ASH_PHASES[key];
    }
  }

  calculateFilterWear(hours = 1, purifierEfficiency = 1.0) {
    const baseWear = this.currentPhase.filterWearPerHour * hours;
    return Math.max(0, baseWear * (1 / purifierEfficiency));
  }

  calculateOutdoorRespiratoryDamage(hasProtectiveGear = false) {
    const baseDamage = this.currentPhase.respiratoryStressRate * 10;
    return hasProtectiveGear ? baseDamage * 0.25 : baseDamage;
  }
}
