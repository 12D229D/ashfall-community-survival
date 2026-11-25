/**
 * loop.js - Bucle de Animación y Renderizado 2.5D del Refugio
 * Dibuja el búnker subterráneo, conductos de filtrado, partículas de ceniza y habitantes trabajando.
 */

export class GameRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.particles = [];
    this.initParticles();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        radius: Math.random() * 2.2 + 0.5,
        speedX: (Math.random() - 0.2) * 2.5,
        speedY: Math.random() * 1.5 + 0.8,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
  }

  render(shelterState, survivors, buildings, ashPhase) {
    const { ctx, canvas } = this;
    if (!ctx || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Limpieza de fondo con tono atmosférico según ceniza
    ctx.fillStyle = ashPhase.skyColor || '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // 2. Línea de superficie volcánica y ladera
    this.drawSurfaceAndVolcano(ctx, width, height, ashPhase);

    // 3. Estructura Subterránea del Refugio (Corte Transversal 2.5D)
    this.drawBunkerCutaway(ctx, width, height, buildings, survivors, shelterState);

    // 4. Lluvia de partículas de ceniza en la atmósfera superior
    this.drawAshFallParticles(ctx, width, height, ashPhase);
  }

  drawSurfaceAndVolcano(ctx, width, height, ashPhase) {
    const groundLevel = height * 0.32;

    // Silueta de Volcán al fondo
    ctx.beginPath();
    ctx.moveTo(width * 0.45, groundLevel);
    ctx.lineTo(width * 0.75, 40);
    ctx.lineTo(width * 0.82, 40);
    ctx.lineTo(width * 1.1, groundLevel);
    ctx.fillStyle = 'hsla(15, 30%, 15%, 0.9)';
    ctx.fill();

    // Cráter brillando en rojo
    ctx.beginPath();
    ctx.ellipse(width * 0.785, 42, 28, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = ashPhase.id === 'tormenta' ? 'hsl(15, 100%, 50%)' : 'hsl(25, 90%, 45%)';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pluma de humo
    ctx.beginPath();
    ctx.moveTo(width * 0.76, 40);
    ctx.bezierCurveTo(width * 0.65, -30, width * 0.85, -60, width * 0.6, -100);
    ctx.strokeStyle = 'hsla(0, 0%, 50%, 0.3)';
    ctx.lineWidth = 45;
    ctx.stroke();

    // Terreno exterior con acumulación de ceniza grisácea
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(width, groundLevel);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = 'hsl(220, 20%, 12%)';
    ctx.fill();

    // Capa de tefra exterior
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.quadraticCurveTo(width * 0.5, groundLevel - 5, width, groundLevel + 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  drawBunkerCutaway(ctx, width, height, buildings, survivors, shelterState) {
    const bunkerTop = height * 0.38;
    const bunkerWidth = width * 0.92;
    const bunkerLeft = width * 0.04;
    const bunkerHeight = height * 0.56;

    // Carcasa de hormigón blindado
    ctx.fillStyle = 'hsl(220, 18%, 15%)';
    ctx.strokeStyle = 'hsl(215, 20%, 30%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bunkerLeft, bunkerTop, bunkerWidth, bunkerHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Módulos interiores (4 habitaciones principales)
    const roomW = (bunkerWidth - 40) / 2;
    const roomH = (bunkerHeight - 40) / 2;

    const rooms = [
      { id: 'purifier', title: 'Purificador Central', col: 0, row: 0, icon: '💨' },
      { id: 'greenhouse', title: 'Invernadero Hidropónico', col: 1, row: 0, icon: '🌱' },
      { id: 'clinic', title: 'Enfermería', col: 0, row: 1, icon: '🏥' },
      { id: 'workshop', title: 'Taller de Máscaras', col: 1, row: 1, icon: '🛠️' }
    ];

    rooms.forEach(room => {
      const rx = bunkerLeft + 15 + room.col * (roomW + 10);
      const ry = bunkerTop + 15 + room.row * (roomH + 10);

      // Fondo de la habitación
      ctx.fillStyle = 'hsl(220, 16%, 10%)';
      ctx.strokeStyle = 'hsla(220, 15%, 25%, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rx, ry, roomW, roomH, 6);
      ctx.fill();
      ctx.stroke();

      // Cabecera de la habitación
      ctx.font = '600 11px Outfit, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`${room.icon} ${room.title}`, rx + 8, ry + 16);

      // Filtrado y salud del purificador visible
      if (room.id === 'purifier') {
        const wear = Math.round(shelterState.resources.filterWearPercent);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = wear > 75 ? '#ef4444' : '#94a3b8';
        ctx.fillText(`Desgaste Filtro: ${wear}%`, rx + 8, ry + 32);
      }

      // Dibujar habitantes asignados a esta habitación
      const workersInRoom = survivors.filter(s => s.isAlive && s.assignedJob === room.id);
      workersInRoom.forEach((w, wIdx) => {
        const wx = rx + 25 + (wIdx * 50);
        const wy = ry + roomH - 22;

        // Avatar del trabajador
        ctx.font = '18px Arial';
        ctx.fillText(w.avatar, wx - 10, wy);

        // Nombre pequeño
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(w.name.split(' ')[0], wx - 12, wy + 12);
      });
    });
  }

  drawAshFallParticles(ctx, width, height, ashPhase) {
    ctx.fillStyle = ashPhase.color || '#94a3b8';
    const count = Math.min(this.particles.length, ashPhase.particleDensity);

    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      p.x += p.speedX * ashPhase.windSpeed;
      p.y += p.speedY;

      if (p.y > height * 0.35) {
        p.y = 0;
        p.x = Math.random() * width;
      }
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;

      ctx.beginPath();
      ctx.globalAlpha = p.opacity;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
}
