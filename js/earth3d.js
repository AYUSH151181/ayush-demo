/* ==========================================================================
   EcoVerse - Interactive 3D Earth WebGL & Canvas Renderer
   Features: Real-time rotation, atmosphere glow, continents, smog-to-green scroll transformation
   ========================================================================== */

class Earth3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = 500;
    this.height = 500;
    this.rotation = 0;
    this.healthFactor = 0.4; // Starts at 40% (polluted), transitions to 1.0 (green)
    
    this.initCanvas();
    this.createContinentData();
    this.animate();
    
    window.addEventListener('resize', () => this.initCanvas());
  }

  initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 500;
    this.height = rect.height || 500;
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setHealth(factor) {
    this.healthFactor = Math.min(Math.max(factor, 0), 1);
  }

  createContinentData() {
    // Procedural 3D spherical landmass points (lat, lon, size)
    this.continents = [
      { lat: 0.3, lon: 0.5, radius: 0.35 },
      { lat: -0.2, lon: 1.2, radius: 0.4 },
      { lat: 0.6, lon: 2.1, radius: 0.3 },
      { lat: -0.5, lon: 3.5, radius: 0.45 },
      { lat: 0.2, lon: 4.2, radius: 0.38 },
      { lat: -0.6, lon: 5.1, radius: 0.28 },
      { lat: 0.7, lon: 5.8, radius: 0.32 },
    ];

    // Cloud particles around Earth
    this.clouds = [];
    for (let i = 0; i < 25; i++) {
      this.clouds.push({
        lat: (Math.random() - 0.5) * 1.6,
        lon: Math.random() * Math.PI * 2,
        size: 0.12 + Math.random() * 0.15,
        speed: 0.001 + Math.random() * 0.002
      });
    }
  }

  animate() {
    this.rotation += 0.004;
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = Math.min(this.width, this.height) * 0.4;
    
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Atmospheric Outer Glow
    const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.35);
    
    // Dynamic glow color based on health factor (Cyan/Emerald vs Smoggy Blue)
    const emeraldAlpha = this.healthFactor;
    glowGradient.addColorStop(0, `rgba(${16 + (1 - emeraldAlpha)*20}, ${185 * emeraldAlpha + 100 * (1 - emeraldAlpha)}, ${129 * emeraldAlpha + 200 * (1 - emeraldAlpha)}, 0.4)`);
    glowGradient.addColorStop(0.6, `rgba(6, 182, 212, ${0.15 + emeraldAlpha * 0.15})`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 2. Base Ocean Sphere
    const oceanGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    
    // Ocean transitions from murky dark teal/grey to vibrant electric ocean blue
    const oceanR = Math.round(10 * (1 - this.healthFactor) + 6 * this.healthFactor);
    const oceanG = Math.round(40 * (1 - this.healthFactor) + 140 * this.healthFactor);
    const oceanB = Math.round(70 * (1 - this.healthFactor) + 220 * this.healthFactor);
    
    oceanGrad.addColorStop(0, `rgb(${oceanR + 40}, ${oceanG + 60}, ${oceanB + 35})`);
    oceanGrad.addColorStop(0.7, `rgb(${oceanR}, ${oceanG}, ${oceanB})`);
    oceanGrad.addColorStop(1, `rgb(5, 15, 35)`);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = oceanGrad;
    ctx.shadowColor = `rgba(16, 185, 129, ${0.3 * this.healthFactor})`;
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.restore();

    // Clip to Earth Sphere for 3D Landmass Projection
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // 3. Render 3D Landmasses (Continents)
    // Land color interpolates from brown/grey polluted (#655848) to vibrant emerald green (#10B981)
    const landR = Math.round(100 * (1 - this.healthFactor) + 16 * this.healthFactor);
    const landG = Math.round(88 * (1 - this.healthFactor) + 185 * this.healthFactor);
    const landB = Math.round(70 * (1 - this.healthFactor) + 129 * this.healthFactor);

    this.continents.forEach(cont => {
      const currentLon = cont.lon + this.rotation;
      const x3d = Math.cos(cont.lat) * Math.sin(currentLon);
      const z3d = Math.cos(cont.lat) * Math.cos(currentLon);
      const y3d = Math.sin(cont.lat);

      // Only render visible front hemisphere
      if (z3d > -0.2) {
        const px = cx + x3d * radius;
        const py = cy - y3d * radius;
        const pRadius = radius * cont.radius * (0.8 + z3d * 0.3);

        const landGrad = ctx.createRadialGradient(px, py, 0, px, py, pRadius);
        landGrad.addColorStop(0, `rgba(${landR + 30}, ${landG + 40}, ${landB + 30}, ${0.85 + z3d * 0.15})`);
        landGrad.addColorStop(0.8, `rgba(${landR}, ${landG}, ${landB}, ${0.7 + z3d * 0.3})`);
        landGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = landGrad;
        ctx.beginPath();
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4. Moving Cloud Layer & Smog Shader
    this.clouds.forEach(cloud => {
      cloud.lon += cloud.speed;
      const currentLon = cloud.lon + this.rotation * 0.5;
      const x3d = Math.cos(cloud.lat) * Math.sin(currentLon);
      const z3d = Math.cos(cloud.lat) * Math.cos(currentLon);
      const y3d = Math.sin(cloud.lat);

      if (z3d > 0) {
        const px = cx + x3d * radius * 1.03;
        const py = cy - y3d * radius * 1.03;
        const cSize = radius * cloud.size * (0.8 + z3d * 0.3);

        // Smog is dark & thick when healthFactor is low, bright white & fluffy when high
        const cloudOpacity = 0.3 + (1 - this.healthFactor) * 0.3;
        const cloudBrightness = Math.round(120 * (1 - this.healthFactor) + 250 * this.healthFactor);

        ctx.fillStyle = `rgba(${cloudBrightness}, ${cloudBrightness}, ${cloudBrightness}, ${cloudOpacity * z3d})`;
        ctx.beginPath();
        ctx.arc(px, py, cSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Dynamic 3D Specular Lighting / Night Shading Edge
    const shadowGrad = ctx.createRadialGradient(cx + radius * 0.5, cy + radius * 0.5, radius * 0.2, cx, cy, radius * 1.1);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(0.6, 'rgba(5, 10, 25, 0.4)');
    shadowGrad.addColorStop(1, 'rgba(2, 5, 15, 0.85)');

    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Initialize on DOM load
window.Earth3D = Earth3D;
