/**
 * relationships.js - Red Social y Lazos entre los Habitantes
 * Registra empatía, rencores, alianzas y estados emocionales compartidos.
 */

export class RelationshipGraph {
  constructor(survivorIds = []) {
    this.matrix = new Map();
    this.initGraph(survivorIds);
  }

  initGraph(ids) {
    for (const idA of ids) {
      if (!this.matrix.has(idA)) {
        this.matrix.set(idA, new Map());
      }
      for (const idB of ids) {
        if (idA !== idB) {
          // Nivel de afinidad inicial neutro a positivo (40 - 70)
          this.matrix.get(idA).set(idB, 50 + Math.floor((Math.random() * 20) - 10));
        }
      }
    }
  }

  getAffinity(idA, idB) {
    if (this.matrix.has(idA) && this.matrix.get(idA).has(idB)) {
      return this.matrix.get(idA).get(idB);
    }
    return 50;
  }

  modifyAffinity(idA, idB, delta) {
    if (this.matrix.has(idA) && this.matrix.get(idA).has(idB)) {
      const current = this.matrix.get(idA).get(idB);
      const updated = Math.max(0, Math.min(100, current + delta));
      this.matrix.get(idA).set(idB, updated);
      // Reciprocidad parcial
      if (this.matrix.has(idB) && this.matrix.get(idB).has(idA)) {
        const curB = this.matrix.get(idB).get(idA);
        this.matrix.get(idB).set(idA, Math.max(0, Math.min(100, curB + Math.floor(delta * 0.7))));
      }
    }
  }

  handleSurvivorDeath(deceasedId, deceasedName, allSurvivors) {
    const griefLogs = [];
    for (const survivor of allSurvivors) {
      if (survivor.id !== deceasedId && survivor.isAlive) {
        const affinity = this.getAffinity(survivor.id, deceasedId);
        let moraleLoss = 15;
        if (affinity > 70) {
          moraleLoss = 30; // Gran luto por amigo íntimo o familiar
          griefLogs.push(`${survivor.name} está desolado por la pérdida de ${deceasedName} (Vínculo cercano).`);
        } else {
          griefLogs.push(`${survivor.name} siente la pesadumbre por la partida de ${deceasedName}.`);
        }
        survivor.morale = Math.max(0, survivor.morale - moraleLoss);
      }
    }
    return griefLogs;
  }
}
