/**
 * main.js - Orquestador Principal de Ashfall Haven
 * Conecta Simulación, Bucle Canvas, UI Reactiva, Expediciones y Persistencia SQLite.
 */

import { AshPhaseManager } from './hazards/ashPhases.js';
import { VolcanicForecast } from './hazards/forecast.js';
import { LandslideHazard } from './hazards/landslides.js';
import { createInitialCommunity, SurvivorAgent } from './sim/agents.js';
import { ShelterResources } from './base/resources.js';
import { createInitialBuildings } from './base/buildings.js';
import { JobManager } from './base/jobs.js';
import { RelationshipGraph } from './sim/relationships.js';
import { ShelterLedger } from './sim/ledger.js';
import { RoutePlanner, EXPEDITION_SECTORS } from './expedition/routePlanner.js';
import { ExpeditionEncounters } from './expedition/encounters.js';
import { SQLiteStorageEngine } from './storage/sqlite.js';
import { GameRenderer } from './loop.js';
import { RosterSwitchUI } from './ui/rosterSwitch.js';
import { LedgerPanelUI } from './ui/ledgerPanel.js';

class AshfallGame {
  constructor() {
    this.day = 1;
    this.hour = 8;
    this.activeSurvivorId = 'carlos_huanaco';

    // Gestores y Subsistemas
    this.storage = new SQLiteStorageEngine();
    this.ashManager = new AshPhaseManager('leve');
    this.forecast = new VolcanicForecast();
    this.landslides = new LandslideHazard();
    this.resources = new ShelterResources();
    this.buildings = createInitialBuildings();
    this.survivors = createInitialCommunity();
    this.relationships = new RelationshipGraph(this.survivors.map(s => s.id));
    this.ledger = new ShelterLedger();
    this.routePlanner = new RoutePlanner();

    this.currentPendingDilemma = null;
    this.eventsCatalog = [];

    this.initAudioContext();
    this.loadEventsCatalog();
    this.initUI();
    this.initCanvasLoop();
    this.logChronicle('La comunidad sella las compuertas del refugio. La ceniza comienza a caer.', 'incident');
  }

  initAudioContext() {
    // Audio procedural con Web Audio API
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio no disponible');
    }
  }

  playProceduralSound(type = 'click') {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'alarm') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(330, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'rumble') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  async loadEventsCatalog() {
    try {
      const resp = await fetch('src/data/events.json');
      this.eventsCatalog = await resp.json();
    } catch (err) {
      this.eventsCatalog = [
        {
          id: 'leak_emergency',
          title: 'Fuga de Monóxido en Conducto Norte',
          description: 'Los sensores del taller parpadean con advertencia roja.',
          options: [
            { text: 'Invertir 5 materiales y sellar de inmediato.', outcome: { materials: -5, air_filters: 0, civilians_trust: 5, technicians_trust: 10, log: 'El conducto fue sellado.' } },
            { text: 'Ignorar por ahora y ahorrar materiales.', outcome: { filter_wear_percent: 25, civilians_trust: -10, technicians_trust: -5, log: 'El filtro absorbió la sobrepresión.' } }
          ]
        }
      ];
    }
  }

  initUI() {
    // Componentes Reactivos
    const rosterContainer = document.getElementById('rosterList');
    this.rosterUI = new RosterSwitchUI(
      rosterContainer,
      (id) => this.selectActiveSurvivor(id),
      (survivorId, jobId) => this.assignJob(survivorId, jobId)
    );

    const ledgerContainer = document.getElementById('ledgerContainer');
    this.ledgerUI = new LedgerPanelUI(
      ledgerContainer,
      (dilemma, optionIdx) => this.resolveDilemma(dilemma, optionIdx)
    );

    // Botones de Cabecera
    document.getElementById('btnAdvanceTime')?.addEventListener('click', () => {
      this.playProceduralSound('click');
      this.advanceHour(3);
    });

    document.getElementById('btnReplaceFilter')?.addEventListener('click', () => {
      this.playProceduralSound('click');
      const res = this.resources.replaceAirFilter();
      if (res.success) {
        this.logChronicle(res.message, 'loot');
      } else {
        alert(res.reason);
      }
      this.updateAllViews();
    });

    document.getElementById('btnCraftFilter')?.addEventListener('click', () => {
      this.playProceduralSound('click');
      const res = this.resources.craftFilter();
      if (res.success) {
        this.logChronicle(res.message, 'loot');
      } else {
        alert(res.reason);
      }
      this.updateAllViews();
    });

    // Pestañas de Vista Central
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.playProceduralSound('click');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        this.switchCentralView(view);
      });
    });

    this.renderExpeditionSectors();
    this.updateAllViews();
  }

  initCanvasLoop() {
    const canvas = document.getElementById('shelterCanvas');
    if (canvas) {
      this.renderer = new GameRenderer(canvas);
      const loop = () => {
        this.renderer.render(
          { resources: this.resources, day: this.day, hour: this.hour },
          this.survivors,
          this.buildings,
          this.ashManager.getPhase()
        );
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  selectActiveSurvivor(id) {
    this.activeSurvivorId = id;
    this.playProceduralSound('click');
    const s = this.survivors.find(item => item.id === id);
    if (s) {
      document.getElementById('activeSurvivorBanner').textContent = `Perspectiva: ${s.name} (${s.role})`;
    }
    this.updateAllViews();
  }

  assignJob(survivorId, jobId) {
    const survivor = this.survivors.find(s => s.id === survivorId);
    if (!survivor) return;
    JobManager.assign(survivor, jobId, this.buildings);
    this.playProceduralSound('click');
    this.updateAllViews();
  }

  switchCentralView(viewName) {
    const bunkerCanvas = document.getElementById('shelterCanvasWrapper');
    const expeditionView = document.getElementById('expeditionView');
    const ledgerView = document.getElementById('ledgerView');

    if (bunkerCanvas) bunkerCanvas.style.display = viewName === 'bunker' ? 'block' : 'none';
    if (expeditionView) expeditionView.style.display = viewName === 'expedition' ? 'grid' : 'none';
    if (ledgerView) ledgerView.style.display = viewName === 'ledger' ? 'block' : 'none';

    if (viewName === 'expedition') {
      this.renderExpeditionSectors();
    }
  }

  advanceHour(hours = 3) {
    this.hour += hours;
    if (this.hour >= 24) {
      this.hour = this.hour % 24;
      this.advanceDay();
    }

    const currentPhase = this.ashManager.getPhase();

    // Desgaste de filtro
    const wear = this.ashManager.calculateFilterWear(hours);
    this.resources.filterWearPercent = Math.min(100, this.resources.filterWearPercent + wear);

    // Actualización de Necesidades de cada sobreviviente
    for (const survivor of this.survivors) {
      survivor.tickHour({ filterWearPercent: this.resources.filterWearPercent, day: this.day }, currentPhase);
      
      // Comprobar muerte permanente en el refugio
      if (!survivor.isAlive && !survivor.registeredDeath) {
        survivor.registeredDeath = true;
        this.playProceduralSound('alarm');
        this.logChronicle(`💀 MUERTE: ${survivor.name} ha sucumbido: ${survivor.deathCause}.`, 'incident');
        this.storage.addMemorialRecord({
          day: this.day,
          eventType: 'death',
          survivorName: survivor.name,
          chronicleText: survivor.deathCause
        });
        const grief = this.relationships.handleSurvivorDeath(survivor.id, survivor.name, this.survivors);
        grief.forEach(msg => this.logChronicle(msg, 'incident'));
      }
    }

    // Producción de los edificios
    this.buildings.forEach(b => {
      const workers = this.survivors.filter(s => s.isAlive && s.assignedJob === b.id);
      const traits = workers.map(w => w.traitPrimary);
      const prod = b.getProductionPerTick(workers.length, traits);
      this.resources.foodRations += prod.food;
      this.resources.filterWearPercent = Math.max(0, this.resources.filterWearPercent - prod.filterWearReduction);
    });

    // Desencadenar dilema ocasional si no hay uno activo
    if (!this.currentPendingDilemma && Math.random() < 0.25 && this.eventsCatalog.length > 0) {
      const randIdx = Math.floor(Math.random() * this.eventsCatalog.length);
      this.currentPendingDilemma = this.eventsCatalog[randIdx];
      this.playProceduralSound('alarm');
    }

    this.updateAllViews();
    this.saveGame();
  }

  advanceDay() {
    this.day += 1;
    this.playProceduralSound('rumble');
    this.logChronicle(`🌅 Amanece el Día ${this.day}. El volcán retumba en la distancia.`, 'incident');

    // Consumo diario comunitario
    const livingCount = this.survivors.filter(s => s.isAlive).length;
    this.resources.consumeDaily(livingCount);

    // Actualizar Pronóstico Volcánico
    this.forecast.advanceDay(this.day);
    const todayForecast = this.forecast.getCurrentForecast()[0];
    this.ashManager.setPhase(todayForecast.phase.id);

    this.logChronicle(`Fase Volcánica actual: ${todayForecast.phase.name} (Riesgo sísmico: ${todayForecast.seismicTremor})`, 'incident');
  }

  resolveDilemma(dilemma, optionIdx) {
    const chosen = dilemma.options[optionIdx];
    if (!chosen) return;

    this.playProceduralSound('click');
    const outcome = chosen.outcome || {};

    if (outcome.materials) this.resources.materials += outcome.materials;
    if (outcome.food_rations) this.resources.foodRations += outcome.food_rations;
    if (outcome.water_liters) this.resources.waterLiters += outcome.water_liters;
    if (outcome.medical_supplies) this.resources.medicalSupplies += outcome.medical_supplies;
    if (outcome.air_filters) this.resources.airFilters += outcome.air_filters;
    if (outcome.filter_wear_percent) this.resources.filterWearPercent += outcome.filter_wear_percent;

    this.ledger.applyDecision({
      title: dilemma.title,
      chosenOption: chosen.text,
      civilianDelta: outcome.civilians_trust || 0,
      technicianDelta: outcome.technicians_trust || 0,
      scoutDelta: outcome.scouts_trust || 0,
      summary: outcome.log || chosen.text
    });

    this.logChronicle(`⚖️ Libro de Cuentas: ${outcome.log || chosen.text}`, 'dilemma');
    this.currentPendingDilemma = null;
    this.updateAllViews();
  }

  launchExpedition(sectorId) {
    const sector = this.routePlanner.getSector(sectorId);
    const activeSurvivor = this.survivors.find(s => s.id === this.activeSurvivorId);

    if (!activeSurvivor || !activeSurvivor.isAlive) {
      alert('Debes seleccionar un habitante vivo para liderar la expedición.');
      return;
    }

    if (activeSurvivor.assignedJob === 'expedicion') {
      alert('Este habitante ya se encuentra en camino.');
      return;
    }

    this.playProceduralSound('click');
    const routeRisk = this.routePlanner.calculateRouteRisk(sector, this.ashManager.getPhase(), activeSurvivor);
    
    // Resolver expedición
    const res = ExpeditionEncounters.resolveExpedition(activeSurvivor, sector, routeRisk, this.ashManager.getPhase());

    res.logMessages.forEach(msg => this.logChronicle(msg, res.died ? 'incident' : 'loot'));

    if (res.died) {
      this.playProceduralSound('alarm');
      this.storage.addMemorialRecord({
        day: this.day,
        eventType: 'death',
        survivorName: activeSurvivor.name,
        chronicleText: `Murió en la expedición a ${sector.name}.`
      });
      this.relationships.handleSurvivorDeath(activeSurvivor.id, activeSurvivor.name, this.survivors);
    } else {
      // Recompensas de botín
      if (res.loot.food) this.resources.foodRations += res.loot.food;
      if (res.loot.water) this.resources.waterLiters += res.loot.water;
      if (res.loot.medical_supplies) this.resources.medicalSupplies += res.loot.medical_supplies;
      if (res.loot.materials) this.resources.materials += res.loot.materials;
      if (res.loot.air_filters) this.resources.airFilters += res.loot.air_filters;
      if (res.loot.fuel) this.resources.fuelUnits += res.loot.fuel;

      this.storage.addExpeditionRecord({
        day: this.day,
        survivorId: activeSurvivor.id,
        sectorId: sector.id,
        sectorName: sector.name,
        routeRisk: `${routeRisk}%`,
        lootSummary: JSON.stringify(res.loot),
        injuryLevel: res.injuryDamage
      });
    }

    this.advanceHour(sector.distanceHours);
    this.updateAllViews();
  }

  renderExpeditionSectors() {
    const container = document.getElementById('sectorCardsGrid');
    if (!container) return;

    container.innerHTML = '';
    const activeSurvivor = this.survivors.find(s => s.id === this.activeSurvivorId) || this.survivors[0];

    EXPEDITION_SECTORS.forEach(sec => {
      const risk = this.routePlanner.calculateRouteRisk(sec, this.ashManager.getPhase(), activeSurvivor);
      const card = document.createElement('div');
      card.className = 'sector-card';
      card.innerHTML = `
        <div class="sector-title">${sec.icon} ${sec.name}</div>
        <p class="sector-desc">${sec.description}</p>
        <div class="sector-meta">
          <span>Marcha: ${sec.distanceHours}h</span>
          <span style="color: ${risk > 50 ? 'var(--danger-red)' : 'var(--lava-orange)'}">Riesgo: ${risk}%</span>
        </div>
        <div class="sector-meta">
          <span>Enfoque: ${sec.lootFocus}</span>
        </div>
        <button class="btn-launch-expedition" data-id="${sec.id}">Partir con ${activeSurvivor.name.split(' ')[0]}</button>
      `;

      card.querySelector('.btn-launch-expedition').addEventListener('click', () => {
        this.launchExpedition(sec.id);
      });

      container.appendChild(card);
    });
  }

  logChronicle(text, type = 'normal') {
    const logContainer = document.getElementById('chronicleLog');
    if (!logContainer) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[Día ${this.day} - ${String(this.hour).padStart(2, '0')}:00] ${text}`;
    logContainer.prepend(entry);
  }

  updateAllViews() {
    // HUD Superior
    document.getElementById('hudDay').textContent = `Día ${this.day}`;
    document.getElementById('hudHour').textContent = `${String(this.hour).padStart(2, '0')}:00`;
    document.getElementById('hudFood').textContent = `${Math.round(this.resources.foodRations)}`;
    document.getElementById('hudWater').textContent = `${Math.round(this.resources.waterLiters)}L`;
    document.getElementById('hudMeds').textContent = this.resources.medicalSupplies;
    document.getElementById('hudFilters').textContent = this.resources.airFilters;
    document.getElementById('hudFuel').textContent = `${Math.round(this.resources.fuelUnits)}U`;
    document.getElementById('hudMaterials').textContent = this.resources.materials;
    document.getElementById('hudFilterWear').textContent = `${Math.round(this.resources.filterWearPercent)}%`;

    // Overlay de Fase en Canvas
    const phase = this.ashManager.getPhase();
    const phaseBadge = document.getElementById('canvasAshBadge');
    if (phaseBadge) {
      phaseBadge.textContent = `${phase.name} (Visibilidad ${phase.visibilityKm} km)`;
      phaseBadge.style.color = phase.color;
    }

    // Renderizado de Subcomponentes
    this.rosterUI.render(this.survivors, this.activeSurvivorId);
    this.ledgerUI.render(this.ledger, this.currentPendingDilemma);
    this.renderForecastUI();
  }

  renderForecastUI() {
    const container = document.getElementById('forecastList');
    if (!container) return;
    const fDays = this.forecast.getCurrentForecast();

    container.innerHTML = fDays.map(f => `
      <div class="forecast-card f-${f.phase.id}">
        <div class="forecast-header">
          <span>${f.title}</span>
          <span class="forecast-phase-name">${f.phase.name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--text-dim);">
          <span>Sismos: ${f.seismicTremor}</span>
          <span>Lahares: ${f.landslideRisk}</span>
        </div>
      </div>
    `).join('');
  }

  saveGame() {
    this.storage.syncSurvivors(this.survivors);
    this.storage.syncShelterState(this.day, this.hour, this.resources, this.ashManager.getPhase(), this.activeSurvivorId);
  }
}

// Inicialización cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new AshfallGame();
});
