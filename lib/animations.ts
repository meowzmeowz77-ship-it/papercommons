'use client';

/**
 * PaperVault PRO - Animation & Micro-interaction Engine
 * High-performance Web Animations API & requestAnimationFrame utilities
 * Zero heavy bundle overhead, 60fps spring & physics curves
 */

export function animateCounter(
  target: HTMLElement | null,
  endValue: number,
  duration = 1000,
  prefix = '',
  suffix = ''
) {
  if (!target) return;
  const el = target;
  const start = 0;
  const startTime = performance.now();

  function update(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Smooth easeOutExpo curve
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(start + (endValue - start) * ease);

    el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Particle pop effect on button click (e.g. Bookmark, PRO Unlock)
 */
export function popSparkleEffect(element: HTMLElement | null) {
  if (!element) return;

  // Spring scale & wiggle via Web Animations API
  element.animate(
    [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.35) rotate(12deg)', offset: 0.3 },
      { transform: 'scale(0.95) rotate(-8deg)', offset: 0.6 },
      { transform: 'scale(1) rotate(0deg)' }
    ],
    {
      duration: 450,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  );

  // Spawn visual sparkle particles around element
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  spawnParticleBurst(centerX, centerY);
}

export function spawnParticleBurst(x: number, y: number, color = '#F59E0B') {
  if (typeof document === 'undefined') return;

  const count = 10;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    const size = Math.random() * 6 + 4;
    const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5);
    const velocity = Math.random() * 45 + 30;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity;

    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = i % 2 === 0 ? color : '#8B5CF6';
    particle.style.boxShadow = `0 0 8px ${color}`;
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';

    document.body.appendChild(particle);

    const animation = particle.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
      ],
      {
        duration: 600 + Math.random() * 200,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    );

    animation.onfinish = () => {
      particle.remove();
    };
  }
}

/**
 * 3D Perspective Card Tilt
 * Computes rotation based on cursor offset from card center
 */
export function handleCardTilt(
  e: React.MouseEvent<HTMLElement>,
  card: HTMLElement | null
) {
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
  const rotateY = ((x - centerX) / centerX) * 6;

  card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
}

export function resetCardTilt(card: HTMLElement | null) {
  if (!card) return;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
}
