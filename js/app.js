/* ==========================================================================
   EcoVerse - Main Interactive Application Logic
   Features: Scroll Storytelling, Carbon Calculator, AI Assistant Chat,
             Daily Reward Wheel, Interactive Dashboard, Modals, Count-up counters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Canvas Engines
  const earth = new Earth3D('earth-canvas');
  const particles = new ParticleEngine('particles-canvas');

  // 2. Navbar Scroll Morphing & Mobile Menu Toggle
  const navbar = document.getElementById('navbar');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // 3. Storytelling Scroll Transformation Engine
    handleScrollStorytelling(earth);
    updateActiveNavLink();
  });

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  }

  // Storytelling Scroll Handler
  function handleScrollStorytelling(earthInstance) {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = window.scrollY;
    const scrollRatio = Math.min(Math.max(scrollPos / (scrollMax * 0.7), 0), 1);
    
    // Dynamic Earth Health factor updates from 40% (0.4) to 100% (1.0)
    const currentHealth = 0.4 + scrollRatio * 0.6;
    earthInstance.setHealth(currentHealth);
    
    // Update Timeline Line Height
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineSection = document.getElementById('journey');
    if (timelineSection && timelineProgress) {
      const rect = timelineSection.getBoundingClientRect();
      const sectionHeight = rect.height;
      const progress = Math.min(Math.max((-rect.top + window.innerHeight * 0.4) / sectionHeight, 0), 1);
      timelineProgress.style.height = `${progress * 100}%`;
    }

    // Active State for Timeline Nodes
    const timelineSteps = document.querySelectorAll('.timeline-step');
    timelineSteps.forEach(step => {
      const rect = step.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.7) {
        step.classList.add('active');
      }
    });

    // Health Meter Section sync
    const healthBarFill = document.getElementById('health-bar-fill');
    const healthPercentLabel = document.getElementById('health-percent-label');
    if (healthBarFill && healthPercentLabel) {
      const val = Math.round(currentHealth * 100);
      healthBarFill.style.width = `${val}%`;
      healthPercentLabel.textContent = `${val}%`;
    }
  }

  // Interactive Health Slider in Restoration Section
  const restorationSlider = document.getElementById('restoration-slider');
  if (restorationSlider) {
    restorationSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      const factor = val / 100;
      earth.setHealth(factor);
      
      const healthBarFill = document.getElementById('health-bar-fill');
      const healthPercentLabel = document.getElementById('health-percent-label');
      if (healthBarFill && healthPercentLabel) {
        healthBarFill.style.width = `${val}%`;
        healthPercentLabel.textContent = `${val}%`;
      }
    });
  }

  // 4. Interactive Carbon Calculator Widget
  const transportSlider = document.getElementById('calc-transport');
  const energySlider = document.getElementById('calc-energy');
  const dietSelect = document.getElementById('calc-diet');
  const carbonOutput = document.getElementById('carbon-output-val');

  function calculateCarbon() {
    if (!transportSlider || !energySlider || !dietSelect || !carbonOutput) return;
    const km = parseFloat(transportSlider.value) || 0;
    const kwh = parseFloat(energySlider.value) || 0;
    const dietMultiplier = parseFloat(dietSelect.value) || 1.0;
    
    // Carbon footprint formula estimation (kg CO2 per month)
    const score = Math.round((km * 0.15 + kwh * 0.8) * dietMultiplier * 30);
    carbonOutput.textContent = `${score} kg`;

    // Visual feedback label
    const calcFeedback = document.getElementById('calc-feedback-msg');
    if (calcFeedback) {
      if (score < 150) {
        calcFeedback.textContent = '🌱 Low Impact! You are an Eco Guardian.';
        calcFeedback.style.color = '#34d399';
      } else if (score < 350) {
        calcFeedback.textContent = '⚡ Moderate Impact. Easy missions can reduce this by 40%!';
        calcFeedback.style.color = '#f59e0b';
      } else {
        calcFeedback.textContent = '⚠️ High Carbon Footprint! Complete daily eco challenges now.';
        calcFeedback.style.color = '#f87171';
      }
    }
  }

  if (transportSlider && energySlider && dietSelect) {
    transportSlider.addEventListener('input', () => {
      document.getElementById('val-transport').textContent = `${transportSlider.value} km`;
      calculateCarbon();
    });
    energySlider.addEventListener('input', () => {
      document.getElementById('val-energy').textContent = `${energySlider.value} kWh`;
      calculateCarbon();
    });
    dietSelect.addEventListener('change', calculateCarbon);
  }

  // 5. AI Eco Assistant Chatbot Modal & Interactive Drawer
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatMessages = document.getElementById('chat-messages');

  const aiResponses = {
    'carbon': '🌱 To reduce your carbon footprint: 1) Switch to solar or LED lights, 2) Use public transport or bicycle for short trips, 3) Adopt a plant-rich diet!',
    'tree': '🌳 In EcoVerse, every 100 EcoCoins earned in real-world challenges equates to 1 real tree planted via our verified forestry partners!',
    'mission': '🎯 Today\'s top mission: Record a 30-second video segregating wet and dry waste at home or school to instantly unlock 150 XP!',
    'default': '🤖 Hello Eco Hero! I am EcoBot AI. Ask me about daily challenges, carbon reduction, school leaderboards, or virtual tree planting!'
  };

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user-msg';
    userMsg.style.cssText = 'background: rgba(16, 185, 129, 0.2); padding: 10px 14px; border-radius: 12px; margin-bottom: 10px; align-self: flex-end; max-width: 80%; border: 1px solid rgba(16, 185, 129, 0.3);';
    userMsg.textContent = text;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate AI Thinking & Response
    setTimeout(() => {
      let reply = aiResponses['default'];
      const lower = text.toLowerCase();
      if (lower.includes('carbon') || lower.includes('calculate')) reply = aiResponses['carbon'];
      else if (lower.includes('tree') || lower.includes('plant')) reply = aiResponses['tree'];
      else if (lower.includes('mission') || lower.includes('challenge')) reply = aiResponses['mission'];

      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg ai-msg';
      aiMsg.style.cssText = 'background: rgba(15, 23, 42, 0.8); padding: 10px 14px; border-radius: 12px; margin-bottom: 10px; align-self: flex-start; max-width: 85%; border: 1px solid rgba(255, 255, 255, 0.1); color: #34d399;';
      aiMsg.textContent = reply;
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
  }

  if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  // 6. Daily Reward Wheel Game Canvas Modal
  const wheelCanvas = document.getElementById('reward-wheel-canvas');
  const spinBtn = document.getElementById('spin-wheel-btn');
  const wheelResult = document.getElementById('wheel-result');

  if (wheelCanvas) {
    const ctx = wheelCanvas.getContext('2d');
    const rewards = ['100 XP', '25 EcoCoins', '🌱 Seed Badge', '50 XP', '🌳 Tree Boost', '200 XP'];
    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
    let currentAngle = 0;

    function drawWheel() {
      const numSegments = rewards.length;
      const arc = (Math.PI * 2) / numSegments;
      const cx = wheelCanvas.width / 2;
      const cy = wheelCanvas.height / 2;
      const radius = cx - 10;

      ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

      for (let i = 0; i < numSegments; i++) {
        const angle = currentAngle + i * arc;
        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + arc);
        ctx.lineTo(cx, cy);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();

        // Render text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.fillText(rewards[i], radius - 20, 5);
        ctx.restore();
      }
    }

    drawWheel();

    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        spinBtn.disabled = true;
        spinBtn.textContent = 'Spinning...';
        
        const extraRounds = 5 + Math.floor(Math.random() * 5);
        const randomSegment = Math.floor(Math.random() * rewards.length);
        const totalRotation = extraRounds * Math.PI * 2 + (randomSegment * (Math.PI * 2 / rewards.length));
        
        let start = null;
        const duration = 3500;

        function animateWheel(timestamp) {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          currentAngle = totalRotation * easeOut;
          drawWheel();

          if (progress < 1) {
            requestAnimationFrame(animateWheel);
          } else {
            spinBtn.disabled = false;
            spinBtn.textContent = 'Spin Again!';
            const prize = rewards[(rewards.length - 1 - randomSegment) % rewards.length];
            if (wheelResult) {
              wheelResult.innerHTML = `🎉 Congratulations! You won <strong style="color:#34d399">${prize}</strong>!`;
            }
          }
        }

        requestAnimationFrame(animateWheel);
      });
    }
  }

  // 7. Student Dashboard Checkbox Interactions
  const checkItems = document.querySelectorAll('.dash-checkbox');
  const xpCountDisplay = document.getElementById('user-xp-display');

  checkItems.forEach(box => {
    box.addEventListener('change', (e) => {
      let currentXP = parseInt(xpCountDisplay.textContent) || 2450;
      if (e.target.checked) {
        currentXP += 100;
        e.target.parentElement.style.textDecoration = 'line-through';
        e.target.parentElement.style.opacity = '0.6';
      } else {
        currentXP -= 100;
        e.target.parentElement.style.textDecoration = 'none';
        e.target.parentElement.style.opacity = '1';
      }
      xpCountDisplay.textContent = currentXP;
    });
  });

  // 8. Animated Count-up Statistics
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsTriggered = false;

  function animateCounters() {
    if (statsTriggered) return;
    const statsSection = document.getElementById('stats');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      statsTriggered = true;
      statNumbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target')) || 0;
        const suffix = num.getAttribute('data-suffix') || '';
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentVal = Math.floor(progress * target);
          num.textContent = `${currentVal.toLocaleString()}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            num.textContent = `${target.toLocaleString()}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
      });
    }
  }

  window.addEventListener('scroll', animateCounters);

  // 9. Modal Management
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  const modalOpenBtns = document.querySelectorAll('[data-modal]');
  const modalCloseBtns = document.querySelectorAll('.modal-close');

  modalOpenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.classList.add('active');
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlays.forEach(m => m.classList.remove('active'));
    });
  });

  modalOverlays.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
});
