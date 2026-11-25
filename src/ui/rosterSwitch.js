/**
 * rosterSwitch.js - Componente de UI para Seleccionar y Alternar Habitantes
 * Permite cambiar de perspectiva entre los supervivientes vivos y ver sus rasgos y ficha clínica.
 */

import { JOB_DEFINITIONS } from '../base/jobs.js';

export class RosterSwitchUI {
  constructor(containerElement, onSelectSurvivor, onAssignJob) {
    this.container = containerElement;
    this.onSelectSurvivor = onSelectSurvivor;
    this.onAssignJob = onAssignJob;
  }

  render(survivors, activeSurvivorId) {
    if (!this.container) return;
    this.container.innerHTML = '';

    survivors.forEach(survivor => {
      const card = document.createElement('div');
      card.className = `survivor-card ${survivor.id === activeSurvivorId ? 'active' : ''} ${!survivor.isAlive ? 'is-dead' : ''}`;
      
      const badge = survivor.getStatusBadge();

      card.innerHTML = `
        <div class="survivor-header">
          <span class="avatar">${survivor.avatar}</span>
          <div class="name-box">
            <h4>${survivor.name}</h4>
            <span class="role">${survivor.role}</span>
          </div>
          <span class="status-pill ${badge.class}">${badge.text}</span>
        </div>

        <div class="survivor-bars">
          <div class="stat-bar" title="Salud física">
            <span class="lbl">SALUD</span>
            <div class="bar-track"><div class="bar-fill health" style="width: ${survivor.health}%"></div></div>
            <span class="val">${Math.round(survivor.health)}%</span>
          </div>
          <div class="stat-bar" title="Hambre">
            <span class="lbl">HAMBRE</span>
            <div class="bar-track"><div class="bar-fill hunger" style="width: ${survivor.hunger}%"></div></div>
            <span class="val">${Math.round(survivor.hunger)}%</span>
          </div>
          <div class="stat-bar" title="Estrés Respiratorio por Ceniza">
            <span class="lbl">PULMONES</span>
            <div class="bar-track"><div class="bar-fill lungs" style="width: ${survivor.respiratoryStress}%"></div></div>
            <span class="val">${Math.round(survivor.respiratoryStress)}%</span>
          </div>
        </div>

        <div class="survivor-job-row">
          <label class="job-lbl">Tarea:</label>
          <select class="job-select" ${!survivor.isAlive ? 'disabled' : ''} data-id="${survivor.id}">
            ${Object.values(JOB_DEFINITIONS).map(j => `
              <option value="${j.id}" ${survivor.assignedJob === j.id ? 'selected' : ''}>${j.icon} ${j.name}</option>
            `).join('')}
          </select>
        </div>

        ${!survivor.isAlive ? `<div class="death-epitaph">Memorial: ${survivor.deathCause || 'Fallecido'}</div>` : ''}
      `;

      // Evento de selección
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'select') return;
        if (survivor.isAlive) {
          this.onSelectSurvivor(survivor.id);
        }
      });

      // Evento de cambio de trabajo
      const select = card.querySelector('.job-select');
      if (select) {
        select.addEventListener('change', (e) => {
          this.onAssignJob(survivor.id, e.target.value);
        });
      }

      this.container.appendChild(card);
    });
  }
}
