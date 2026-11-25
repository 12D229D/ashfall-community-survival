/**
 * agents.js - Habitantes del Refugio (Comunidad de 8 personajes)
 * Modelo POO con muerte permanente, rasgos, asignación de tareas y estado psicológico.
 */

import { NeedsSystem } from './needs.js';

export class SurvivorAgent {
  constructor({
    id,
    name,
    role,
    avatar,
    traitPrimary,
    traitSecondary = null,
    quote,
    health = 100,
    hunger = 20,
    fatigue = 15,
    respiratoryStress = 10,
    morale = 75,
    assignedJob = 'descanso',
    currentLocation = 'refugio'
  }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.avatar = avatar;
    this.traitPrimary = traitPrimary;
    this.traitSecondary = traitSecondary;
    this.quote = quote;
    this.health = health;
    this.hunger = hunger;
    this.fatigue = fatigue;
    this.respiratoryStress = respiratoryStress;
    this.morale = morale;
    this.assignedJob = assignedJob;
    this.currentLocation = currentLocation; // 'refugio', 'expedicion', 'clinica'
    this.isAlive = true;
    this.deathCause = null;
    this.deathDay = null;
    this.expeditionsSurvived = 0;
  }

  tickHour(shelterState, ashPhase) {
    if (!this.isAlive) return;
    NeedsSystem.updateNeeds(this, 1, shelterState, ashPhase);
  }

  assignJob(newJob) {
    if (!this.isAlive) return false;
    this.assignedJob = newJob;
    return true;
  }

  getStatusBadge() {
    if (!this.isAlive) return { text: 'FALLECIDO', class: 'status-dead' };
    if (this.health < 30 || this.respiratoryStress > 75) return { text: 'CRÍTICO', class: 'status-danger' };
    if (this.hunger > 65 || this.fatigue > 70) return { text: 'AGOTADO', class: 'status-warning' };
    if (this.currentLocation === 'expedicion') return { text: 'EN EXPEDICIÓN', class: 'status-info' };
    return { text: 'ESTABLE', class: 'status-ok' };
  }
}

export function createInitialCommunity() {
  return [
    new SurvivorAgent({
      id: 'mateo_alvarez',
      name: 'Mateo Álvarez',
      role: 'Ingeniero Hidráulico',
      avatar: '👨‍🔧',
      traitPrimary: 'mechanic_savant',
      traitSecondary: 'resilient_lungs',
      quote: 'Si este purificador se ahoga en ceniza, todos nos ahogamos con él.',
      hunger: 25,
      fatigue: 20,
      respiratoryStress: 15,
      morale: 80,
      assignedJob: 'purifier'
    }),
    new SurvivorAgent({
      id: 'dra_elena_solis',
      name: 'Dra. Elena Solís',
      role: 'Médico Comunitario',
      avatar: '👩‍⚕️',
      traitPrimary: 'medic_veteran',
      quote: 'El azufre irrita la tráquea. Nadie sale sin mascarilla sellada.',
      hunger: 15,
      fatigue: 30,
      respiratoryStress: 8,
      morale: 85,
      assignedJob: 'clinic'
    }),
    new SurvivorAgent({
      id: 'carlos_huanaco',
      name: 'Carlos Huanaco',
      role: 'Guía de Alta Montaña',
      avatar: '🧗‍♂️',
      traitPrimary: 'mountain_scout',
      traitSecondary: 'reckless_brave',
      quote: 'Conozco cada quebrada del volcán. La tefra está suelta, pero pasaremos.',
      hunger: 30,
      fatigue: 10,
      respiratoryStress: 12,
      morale: 90,
      assignedJob: 'descanso'
    }),
    new SurvivorAgent({
      id: 'lucia_castro',
      name: 'Lucía Castro',
      role: 'Agrónoma y Botánica',
      avatar: '👩‍🌾',
      traitPrimary: 'botanist',
      quote: 'Las semillas de quinua germinan incluso bajo la tenue luz artificial.',
      hunger: 20,
      fatigue: 15,
      respiratoryStress: 5,
      morale: 75,
      assignedJob: 'greenhouse'
    }),
    new SurvivorAgent({
      id: 'tomas_herrera',
      name: 'Tomás Herrera',
      role: 'Líder Comunal / Mediador',
      avatar: '👨‍💼',
      traitPrimary: 'diplomatic_voice',
      quote: 'Si nos dividimos en facciones, la montaña nos devorará a todos.',
      hunger: 20,
      fatigue: 25,
      respiratoryStress: 18,
      morale: 70,
      assignedJob: 'descanso'
    }),
    new SurvivorAgent({
      id: 'sofia_paz',
      name: 'Sofía Paz',
      role: 'Operadora de Radio y Logística',
      avatar: '👩‍💻',
      traitPrimary: 'claustrophobic',
      quote: 'Las estáticas de la radio son peores cada vez que hay relámpagos piroclásticos.',
      hunger: 35,
      fatigue: 40,
      respiratoryStress: 22,
      morale: 60,
      assignedJob: 'workshop'
    }),
    new SurvivorAgent({
      id: 'raul_quiroz',
      name: 'Raúl Quiroz',
      role: 'Mecánico de Motores Diésel',
      avatar: '👨‍🏭',
      traitPrimary: 'asthmatic',
      traitSecondary: 'mechanic_savant',
      quote: 'El generador tose igual que yo cuando el aire huele a azufre.',
      hunger: 40,
      fatigue: 35,
      respiratoryStress: 35,
      morale: 55,
      assignedJob: 'workshop'
    }),
    new SurvivorAgent({
      id: 'valentina_mora',
      name: 'Valentina Mora',
      role: 'Rescatista Voluntaria',
      avatar: '🦸‍♀️',
      traitPrimary: 'reckless_brave',
      traitSecondary: 'mountain_scout',
      quote: 'Quedan supervivientes en el refugio del teleférico. No los dejaré atrás.',
      hunger: 20,
      fatigue: 15,
      respiratoryStress: 10,
      morale: 95,
      assignedJob: 'descanso'
    })
  ];
}
