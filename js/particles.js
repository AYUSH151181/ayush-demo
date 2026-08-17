/* ==========================================================================
   EcoVerse - Interactive Environmental Particle Canvas Engine
   Features: Floating leaves, twinkling stars, flying bird silhouettes, butterflies, pollen
   ========================================================================== */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.leaves = [];
    this.birds = [];
    this.butterflies = [];
    
    this.resizeCanvas();
    this.createElements();
    this.animate();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  createElements() {
    // 1. Twinkling Stars & Emerald Pollen Particles
    for (let i = 0; i < 70; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speedAlpha: (Math.random() - 0.5) * 0.015,
        color: Math.random() > 0.4 ? '#10b981' : '#38bdf8'
      });
    }

    // 2. Floating Leaves
    for (let i = 0; i < 15; i++) {
      this.leaves.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 10 + Math.random() * 12,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.5 + Math.random() * 0.8,
        color: Math.random() > 0.5 ? '#10b981' : '#34d399'
      });
    }

    // 3. Flying Bird Silhouettes
    for (let i = 0; i < 5; i++) {
      this.birds.push({
        x: Math.random() * this.width,
        y: 50 + Math.random() * (this.height * 0.4),
        speed: 1.2 + Math.random() * 1.5,
        wingPhase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 6
      });
    }

    // 4. Magical Butterflies
    for (let i = 0; i < 6; i++) {
      this.butterflies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        wingAngle: 0,
        wingSpeed: 0.15 + Math.random() * 0.1,
        color: Math.random() > 0.5 ? '#06b6d4' : '#f59e0b'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.updateParticles();
    this.updateLeaves();
    this.updateBirds();
    this.updateButterflies();
    
    requestAnimationFrame(() => this.animate());
  }

  updateParticles() {
    this.particles.forEach(p => {
      p.alpha += p.speedAlpha;
      if (p.alpha <= 0.1 || p.alpha >= 0.9) p.speedAlpha *= -1;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  updateLeaves() {
    this.leaves.forEach(l => {
      l.x += l.vx + Math.sin(l.y * 0.01) * 0.5;
      l.y += l.vy;
      l.angle += l.rotationSpeed;

      if (l.y > this.height + 20) {
        l.y = -20;
        l.x = Math.random() * this.width;
      }

      this.ctx.save();
      this.ctx.translate(l.x, l.y);
      this.ctx.rotate(l.angle);
      
      // Draw leaf shape
      this.ctx.fillStyle = l.color;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, l.size, l.size * 0.4, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Leaf center vein
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(-l.size, 0);
      this.ctx.lineTo(l.size, 0);
      this.ctx.stroke();

      this.ctx.restore();
    });
  }

  updateBirds() {
    this.birds.forEach(b => {
      b.x += b.speed;
      b.wingPhase += 0.12;

      if (b.x > this.width + 50) {
        b.x = -50;
        b.y = 50 + Math.random() * (this.height * 0.4);
      }

      const wingY = Math.sin(b.wingPhase) * b.size * 0.6;

      this.ctx.save();
      this.ctx.translate(b.x, b.y);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-b.size, wingY);
      this.ctx.quadraticCurveTo(0, -b.size * 0.4, b.size, wingY);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  updateButterflies() {
    this.butterflies.forEach(bf => {
      bf.x += bf.vx + (Math.random() - 0.5) * 0.5;
      bf.y += bf.vy + (Math.random() - 0.5) * 0.5;
      bf.wingAngle += bf.wingSpeed;

      if (bf.x < 0 || bf.x > this.width) bf.vx *= -1;
      if (bf.y < 0 || bf.y > this.height) bf.vy *= -1;

      const wingScale = Math.abs(Math.sin(bf.wingAngle));

      this.ctx.save();
      this.ctx.translate(bf.x, bf.y);
      this.ctx.fillStyle = bf.color;
      
      // Left Wing
      this.ctx.beginPath();
      this.ctx.ellipse(-6 * wingScale, 0, 8 * wingScale, 5, -0.2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Right Wing
      this.ctx.beginPath();
      this.ctx.ellipse(6 * wingScale, 0, 8 * wingScale, 5, 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }
}

// Initialize on DOM load
window.ParticleEngine = ParticleEngine;
