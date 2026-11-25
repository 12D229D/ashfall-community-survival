/**
 * needs.js - Modelo de Necesidades Vitales y Estrés Respiratorio
 * Controla Hambre, Sed, Fatiga, Estrés Respiratorio y Salud.
 */

export class NeedsSystem {
  static updateNeeds(agent, hours = 1, shelterState, ashPhase) {
    if (!agent.isAlive) return;

    // 1. Hambre y Sed (crece gradualmente)
    agent.hunger = Math.min(100, agent.hunger + (0.8 * hours));
    agent.fatigue = Math.min(100, agent.fatigue + (agent.assignedJob === 'descanso' ? -2.5 * hours : 1.2 * hours));
    if (agent.fatigue < 0) agent.fatigue = 0;

    // 2. Estrés respiratorio afectado por la pureza del filtro del refugio
    const filterStatus = shelterState.filterWearPercent; // 0 (impecable) a 100 (destruido)
    let ashExposure = (filterStatus / 100) * ashPhase.respiratoryStressRate * 2.5 * hours;

    // Si tiene rasgo asmático o pulmones curados
    if (agent.traitPrimary === 'asthmatic' && filterStatus > 40) {
      ashExposure *= 2.0;
    } else if (agent.traitPrimary === 'resilient_lungs') {
      ashExposure *= 0.65;
    }

    // Si está descansando en enfermería se reduce
    if (agent.assignedJob === 'clinic') {
      agent.respiratoryStress = Math.max(0, agent.respiratoryStress - (3.0 * hours));
    } else {
      agent.respiratoryStress = Math.min(100, agent.respiratoryStress + ashExposure);
    }

    // 3. Impacto en la Salud
    let healthLoss = 0;
    if (agent.hunger > 80) healthLoss += 1.5 * hours;
    if (agent.respiratoryStress > 70) healthLoss += 2.5 * hours;
    if (agent.fatigue > 90) healthLoss += 0.8 * hours;

    // Si está descansando con comida y aire limpio se regenera salud
    if (agent.hunger < 40 && agent.respiratoryStress < 30 && agent.health < 100) {
      agent.health = Math.min(100, agent.health + (1.2 * hours));
    }

    agent.health = Math.max(0, agent.health - healthLoss);

    // Comprobación de defunción por abandono o asfixia
    if (agent.health <= 0) {
      agent.isAlive = false;
      let cause = 'Falla multiorgánica por inanición y asfixia';
      if (agent.respiratoryStress >= 95) cause = 'Asfixia aguda por intoxicación con ceniza volcánica';
      else if (agent.hunger >= 95) cause = 'Inanición prolongada en el refugio';
      agent.deathCause = cause;
      agent.deathDay = shelterState.day;
    }
  }

  static feed(agent, foodAmount = 1) {
    if (!agent.isAlive) return false;
    agent.hunger = Math.max(0, agent.hunger - (25 * foodAmount));
    agent.morale = Math.min(100, agent.morale + 5);
    return true;
  }

  static administerMedicine(agent) {
    if (!agent.isAlive) return false;
    agent.health = Math.min(100, agent.health + 35);
    agent.respiratoryStress = Math.max(0, agent.respiratoryStress - 30);
    return true;
  }
}
