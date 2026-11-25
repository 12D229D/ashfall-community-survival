/**
 * landslides.js - Simulación de desprendimientos de laderas y lahares volcánicos
 * Modifica la transitabilidad de las rutas de expedición y los accesos exteriores del refugio.
 */

export class LandslideHazard {
  constructor() {
    this.blockedSectors = new Set();
    this.structuralThreatLevel = 5; // 0 a 100
  }

  evaluateSectorRisk(sector, volcanicPhase, seismicActivity) {
    let baseProb = sector.baseLandslideRisk || 15;
    
    // Aumento según fase de ceniza y acumulación de tefra pesada
    if (volcanicPhase.id === 'moderada') baseProb += 20;
    if (volcanicPhase.id === 'tormenta') baseProb += 45;

    // Aumento por actividad sísmica y tremores
    baseProb += Math.floor(seismicActivity * 0.35);

    const roll = Math.random() * 100;
    const triggered = roll < baseProb;

    return {
      triggered,
      probability: Math.min(95, baseProb),
      severity: triggered ? (roll < baseProb * 0.3 ? 'lahar_masivo' : 'desprendimiento_rocoso') : 'estable',
      damagePotential: triggered ? Math.floor(15 + Math.random() * 35) : 0
    };
  }

  applyStructuralStrain(shelterLevel = 1, eventSeverity = 'estable') {
    if (eventSeverity === 'lahar_masivo') {
      const reduction = Math.max(5, 30 - shelterLevel * 8);
      this.structuralThreatLevel += reduction;
      return {
        damaged: true,
        message: '¡Un lahar volcánico impactó las defensas exteriores del búnker! Estructura comprometida.',
        strain: reduction
      };
    }
    return { damaged: false, strain: 0 };
  }
}
