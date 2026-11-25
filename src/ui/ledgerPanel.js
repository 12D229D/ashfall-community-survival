/**
 * ledgerPanel.js - Panel del Libro de Cuentas y Dilemas Morales de la Comunidad
 */

export class LedgerPanelUI {
  constructor(containerElement, onChooseDecision) {
    this.container = containerElement;
    this.onChooseDecision = onChooseDecision;
  }

  render(ledger, currentPendingDilemma = null) {
    if (!this.container) return;

    const { civilians, technicians, scouts } = ledger.factions;
    const cohesion = ledger.getOverallCohesion();

    let dilemmaHtml = '';
    if (currentPendingDilemma) {
      dilemmaHtml = `
        <div class="active-dilemma-card">
          <div class="dilemma-badge">⚠️ DILEMA COMUNITARIO URGENTE</div>
          <h3 class="dilemma-title">${currentPendingDilemma.title}</h3>
          <p class="dilemma-desc">${currentPendingDilemma.description}</p>
          <div class="dilemma-actions">
            ${currentPendingDilemma.options.map((opt, idx) => `
              <button class="btn btn-choice" data-idx="${idx}">
                <span class="choice-num">${idx + 1}.</span> ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="ledger-header">
        <div class="cohesion-indicator">
          <span class="cohesion-label">COHESIÓN SOCIAL DEL REFUGIO</span>
          <div class="cohesion-val-row">
            <span class="cohesion-number">${cohesion}%</span>
            <div class="cohesion-bar-track">
              <div class="cohesion-bar-fill" style="width: ${cohesion}%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="factions-grid">
        <div class="faction-card">
          <div class="faction-title-row">
            <span class="fac-icon">${civilians.icon}</span>
            <div>
              <h5>${civilians.name}</h5>
              <span class="fac-desc">${civilians.stance}</span>
            </div>
          </div>
          <div class="fac-trust-row">
            <span>Confianza:</span>
            <strong>${civilians.trust}%</strong>
          </div>
          <div class="fac-meter-track"><div class="fac-meter-fill civilians" style="width: ${civilians.trust}%"></div></div>
        </div>

        <div class="faction-card">
          <div class="faction-title-row">
            <span class="fac-icon">${technicians.icon}</span>
            <div>
              <h5>${technicians.name}</h5>
              <span class="fac-desc">${technicians.stance}</span>
            </div>
          </div>
          <div class="fac-trust-row">
            <span>Confianza:</span>
            <strong>${technicians.trust}%</strong>
          </div>
          <div class="fac-meter-track"><div class="fac-meter-fill technicians" style="width: ${technicians.trust}%"></div></div>
        </div>

        <div class="faction-card">
          <div class="faction-title-row">
            <span class="fac-icon">${scouts.icon}</span>
            <div>
              <h5>${scouts.name}</h5>
              <span class="fac-desc">${scouts.stance}</span>
            </div>
          </div>
          <div class="fac-trust-row">
            <span>Confianza:</span>
            <strong>${scouts.trust}%</strong>
          </div>
          <div class="fac-meter-track"><div class="fac-meter-fill scouts" style="width: ${scouts.trust}%"></div></div>
        </div>
      </div>

      ${dilemmaHtml}

      <div class="ledger-history">
        <h5 class="history-title">📜 Registro de Resoluciones Pasadas</h5>
        <div class="history-list">
          ${ledger.decisionsHistory.length === 0 ? '<p class="empty-hint">Aún no se han registrado votos ni resoluciones solemnes.</p>' : ''}
          ${ledger.decisionsHistory.slice(0, 5).map(item => `
            <div class="history-item">
              <span class="time">${item.timestamp}</span>
              <strong>${item.title}:</strong>
              <span class="detail">${item.summary || item.chosenOption}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Asignar listeners de opciones si hay dilema
    if (currentPendingDilemma) {
      const choiceButtons = this.container.querySelectorAll('.btn-choice');
      choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.onChooseDecision(currentPendingDilemma, idx);
        });
      });
    }
  }
}
