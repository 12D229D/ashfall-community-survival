/**
 * routePlanner.js - Planificador de Rutas y Sectores Exteriores
 * Mapeo de zonas montañosas cubiertas de ceniza, cálculo de riesgo y tiempos de marcha.
 */

export const EXPEDITION_SECTORS = [
  {
    id: 'silo_granos',
    name: 'Silos de Grano Abandonados',
    icon: '🌾',
    distanceHours: 4,
    baseLandslideRisk: 15,
    lootFocus: 'Comida y Agua',
    potentialLoot: { food: [6, 14], water: [4, 10], materials: [2, 6] },
    description: 'Antiguos almacenes agrícolas a mitad del valle. La tefra acumulada amenaza con hundir el techo.'
  },
  {
    id: 'estacion_meteo',
    name: 'Estación Meteorológica y Antena',
    icon: '📡',
    distanceHours: 6,
    baseLandslideRisk: 35,
    lootFocus: 'Piezas Técnicas y Filtros',
    potentialLoot: { materials: [10, 20], air_filters: [1, 3], fuel: [4, 12] },
    description: 'Situada en una cresta escarpada. Viento racheado y alto riesgo de desprendimiento de rocas.'
  },
  {
    id: 'dispensario_salud',
    name: 'Dispensario Médico Rural',
    icon: '💉',
    distanceHours: 5,
    baseLandslideRisk: 25,
    lootFocus: 'Medicinas y Respiradores',
    potentialLoot: { medical_supplies: [4, 8], air_filters: [1, 2], materials: [4, 8] },
    description: 'Puesto de socorro semi-enterrado bajo ceniza volcánica compactada.'
  },
  {
    id: 'mina_caliza',
    name: 'Cantera y Talleres de la Mina',
    icon: '⛏️',
    distanceHours: 8,
    baseLandslideRisk: 50,
    lootFocus: 'Combustible Pesado y Repuestos',
    potentialLoot: { fuel: [12, 25], materials: [15, 30], air_filters: [1, 2] },
    description: 'Zona inestable propensa a lahares volcánicos repentinos. Alta recompensa pero peligro mortal.'
  }
];

export class RoutePlanner {
  constructor() {
    this.sectors = EXPEDITION_SECTORS;
  }

  getSector(id) {
    return this.sectors.find(s => s.id === id);
  }

  calculateRouteRisk(sector, ashPhase, survivor) {
    let risk = sector.baseLandslideRisk * ashPhase.expeditionRiskModifier;

    // Bonificaciones del superviviente
    if (survivor.traitPrimary === 'mountain_scout' || survivor.traitSecondary === 'mountain_scout') {
      risk *= 0.65; // Mucho más diestro en sortear desprendimientos
    }
    if (survivor.traitPrimary === 'reckless_brave' || survivor.traitSecondary === 'reckless_brave') {
      risk *= 1.25; // Más propenso a accidentes por arrojo excesivo
    }

    if (survivor.respiratoryStress > 50) {
      risk *= 1.35; // Fatigado o tosiendo en ruta
    }

    return Math.min(95, Math.round(risk));
  }
}
