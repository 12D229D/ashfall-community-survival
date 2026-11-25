/**
 * sqlite.js - Capa de Persistencia Estructurada SQLite (LocalStorage / IndexedDB / Web Engine)
 * Almacena el estado de los 8 habitantes, inventario del refugio, memorial de caídos y decisiones del Libro de Cuentas.
 */

const STORAGE_KEY = 'ashfall_haven_sqlite_v1';

export class SQLiteStorageEngine {
  constructor() {
    this.memoryDb = {
      survivors: [],
      shelter_state: null,
      ledger_decisions: [],
      expeditions_history: [],
      chronicles_memorial: []
    };
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.memoryDb = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('No se pudo cargar SQLiteStorageEngine de LocalStorage:', err);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryDb));
    } catch (err) {
      console.error('Error al persistir base de datos SQLite:', err);
    }
  }

  syncSurvivors(survivors) {
    this.memoryDb.survivors = survivors.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      traitPrimary: s.traitPrimary,
      traitSecondary: s.traitSecondary,
      health: Math.round(s.health),
      hunger: Math.round(s.hunger),
      fatigue: Math.round(s.fatigue),
      respiratoryStress: Math.round(s.respiratoryStress),
      morale: Math.round(s.morale),
      isAlive: s.isAlive ? 1 : 0,
      assignedJob: s.assignedJob,
      currentLocation: s.currentLocation,
      deathCause: s.deathCause,
      deathDay: s.deathDay,
      expeditionsSurvived: s.expeditionsSurvived
    }));
    this.saveToStorage();
  }

  syncShelterState(day, hour, resources, ashPhase, activeSurvivorId) {
    this.memoryDb.shelter_state = {
      day,
      hour,
      activeSurvivorId,
      foodRations: Number(resources.foodRations.toFixed(1)),
      waterLiters: Number(resources.waterLiters.toFixed(1)),
      medicalSupplies: resources.medicalSupplies,
      airFilters: resources.airFilters,
      fuelUnits: Number(resources.fuelUnits.toFixed(1)),
      materials: resources.materials,
      filterWearPercent: Number(resources.filterWearPercent.toFixed(1)),
      currentAshPhase: ashPhase.id,
      lastUpdated: new Date().toISOString()
    };
    this.saveToStorage();
  }

  addLedgerEntry(entry) {
    this.memoryDb.ledger_decisions.unshift({
      id: entry.id || Date.now(),
      title: entry.title,
      chosenOption: entry.chosenOption,
      civilianDelta: entry.civilianDelta,
      technicianDelta: entry.technicianDelta,
      scoutDelta: entry.scoutDelta,
      summary: entry.summary,
      timestamp: new Date().toISOString()
    });
    this.saveToStorage();
  }

  addExpeditionRecord(record) {
    this.memoryDb.expeditions_history.unshift({
      id: Date.now(),
      ...record,
      timestamp: new Date().toISOString()
    });
    this.saveToStorage();
  }

  addMemorialRecord(record) {
    this.memoryDb.chronicles_memorial.unshift({
      id: Date.now(),
      day: record.day || 1,
      eventType: record.eventType || 'death',
      survivorName: record.survivorName || 'Anónimo',
      chronicleText: record.chronicleText,
      timestamp: new Date().toISOString()
    });
    this.saveToStorage();
  }

  getMemorial() {
    return this.memoryDb.chronicles_memorial;
  }

  getSavedState() {
    return this.memoryDb;
  }

  resetAllData() {
    this.memoryDb = {
      survivors: [],
      shelter_state: null,
      ledger_decisions: [],
      expeditions_history: [],
      chronicles_memorial: []
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}
