/**
 * encounters.js - Sistema de Encuentros e Incidentes en Expedición
 * Rescates de civiles, deslizamientos de rocas, hallazgos de alijos y lesiones.
 */

export class ExpeditionEncounters {
  static resolveExpedition(survivor, sector, routeRisk, ashPhase) {
    const outcome = {
      survivorId: survivor.id,
      survivorName: survivor.name,
      sectorName: sector.name,
      success: true,
      injured: false,
      injuryDamage: 0,
      respiratoryDamage: 0,
      died: false,
      loot: {},
      logMessages: [],
      memorialEntry: null
    };

    outcome.logMessages.push(`${survivor.name} partió hacia ${sector.name} cruzando una visibilidad de ${ashPhase.visibilityKm} km.`);

    // 1. Simulación de desgaste ambiental durante el trayecto
    const envStress = Math.floor(sector.distanceHours * ashPhase.respiratoryStressRate * 4);
    outcome.respiratoryDamage = envStress;
    survivor.respiratoryStress = Math.min(100, survivor.respiratoryStress + envStress);
    survivor.fatigue = Math.min(100, survivor.fatigue + (sector.distanceHours * 8));

    // 2. Comprobación de peligro / deslizamiento volcánico
    const rollDanger = Math.random() * 100;
    if (rollDanger < routeRisk) {
      outcome.injured = true;
      const damage = Math.floor(25 + Math.random() * 45);
      outcome.injuryDamage = damage;
      survivor.health = Math.max(0, survivor.health - damage);

      if (survivor.health <= 0) {
        outcome.died = true;
        outcome.success = false;
        survivor.isAlive = false;
        survivor.deathCause = `Sepultado por un deslizamiento de tefra y roca ardiente en ${sector.name}`;
        outcome.logMessages.push(`⚠️ ¡TRAGEDIA! ${survivor.name} fue alcanzado por una avalancha de ceniza volcánica inestable.`);
        outcome.memorialEntry = {
          eventType: 'death',
          survivorName: survivor.name,
          chronicleText: `Cayó en cumplimiento del deber en ${sector.name}. Su sacrificio alimentó la memoria del refugio.`
        };
        return outcome;
      } else {
        outcome.logMessages.push(`⚠️ Un alud de grava volcánica rozó el sendero; ${survivor.name} logró zafarse con contusiones y una máscara averiada.`);
      }
    } else {
      outcome.logMessages.push(`El trayecto fue duro pero ${survivor.name} supo leer las grietas y evitar los valles de gas.`);
    }

    // 3. Obtención de Botín
    for (const [resKey, [min, max]] of Object.entries(sector.potentialLoot)) {
      let qty = Math.floor(min + Math.random() * (max - min + 1));
      if (survivor.traitPrimary === 'mountain_scout' || survivor.traitSecondary === 'mountain_scout') {
        qty = Math.round(qty * 1.3);
      }
      outcome.loot[resKey] = qty;
    }

    survivor.expeditionsSurvived += 1;
    outcome.logMessages.push(`Expedición completada con éxito. Botín recuperado y asegurado para el búnker.`);
    return outcome;
  }
}
