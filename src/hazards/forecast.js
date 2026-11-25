/**
 * forecast.js - Pronóstico sismológico y dispersión de plumas volcánicas
 * Permite a la comunidad anticiparse a los cambios climáticos volcánicos en los próximos 3 días.
 */

import { ASH_PHASES } from './ashPhases.js';

export class VolcanicForecast {
  constructor() {
    this.forecastDays = [];
    this.seismicActivityScore = 15; // 0 - 100
    this.windDirection = 'Sur-Suroeste hacia el Valle';
    this.generateInitialForecast();
  }

  generateInitialForecast() {
    this.forecastDays = [
      {
        dayOffset: 0,
        title: 'Hoy',
        phase: ASH_PHASES.LEVE,
        seismicTremor: 12,
        landslideRisk: 'Bajo (8%)',
        atmosphericPressure: '1012 hPa'
      },
      {
        dayOffset: 1,
        title: 'Mañana',
        phase: ASH_PHASES.MODERADA,
        seismicTremor: 35,
        landslideRisk: 'Moderado (28%)',
        atmosphericPressure: '998 hPa'
      },
      {
        dayOffset: 2,
        title: 'En 2 Días',
        phase: ASH_PHASES.TORMENTA,
        seismicTremor: 68,
        landslideRisk: 'Crítico (65%)',
        atmosphericPressure: '984 hPa'
      }
    ];
  }

  advanceDay(newDayNumber) {
    this.forecastDays.shift();

    // Generar nuevo pronóstico dinámico para el día + 2
    const roll = Math.random() * 100;
    let nextPhase = ASH_PHASES.LEVE;
    let tremor = Math.floor(10 + Math.random() * 25);
    let riskStr = 'Bajo (10%)';

    if (roll > 70) {
      nextPhase = ASH_PHASES.TORMENTA;
      tremor = Math.floor(65 + Math.random() * 30);
      riskStr = 'Crítico (70%)';
    } else if (roll > 35) {
      nextPhase = ASH_PHASES.MODERADA;
      tremor = Math.floor(30 + Math.random() * 30);
      riskStr = 'Moderado (35%)';
    }

    this.forecastDays.push({
      dayOffset: 2,
      title: `Día ${newDayNumber + 2}`,
      phase: nextPhase,
      seismicTremor: tremor,
      landslideRisk: riskStr,
      atmosphericPressure: `${Math.floor(980 + Math.random() * 30)} hPa`
    });

    this.seismicActivityScore = this.forecastDays[0].seismicTremor;
  }

  getCurrentForecast() {
    return this.forecastDays;
  }
}
