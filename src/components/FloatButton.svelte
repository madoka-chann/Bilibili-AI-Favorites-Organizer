<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bot } from 'lucide-svelte';
  import { gsap, Draggable, EASINGS } from '$animations/gsap-config';
  import { shouldAnimate } from '$animations/gsap-config';
  import { magnetic } from '$actions/magnetic';
  import { gmGetValue, gmSetValue } from '$utils/gm';
  import { Z_INDEX } from '$utils/constants';

  interface Props {
    visible?: boolean;
    onclick?: () => void;
  }

  let { visible = true, onclick }: Props = $props();

  let btnEl = $state<HTMLButtonElement>(undefined!);
  let orbitsContainer = $state<HTMLDivElement>(undefined!);
  let ctx: gsap.Context;

  // Click vs drag detection
  let pDown = 0, pX = 0, pY = 0;
  function onPDown(e: PointerEvent) { pDown = Date.now(); pX = e.clientX; pY = e.clientY; }
  function onPUp(e: PointerEvent) {
    if (Date.now() - pDown < 300 && Math.abs(e.clientX - pX) < 8 && Math.abs(e.clientY - pY) < 8) {
      if (shouldAnimate() && btnEl) spawnParticles(btnEl);
      onclick?.();
    }
  }

  let wasHidden = !visible;
  $effect(() => {
    if (visible && wasHidden && btnEl) {
      // 面板关闭后，从共享位置恢复（Panel 可能已拖到新位置）
      const saved = gmGetValue('bfao_pos_v5', null) as { tx: number; ty: number } | null;
      if (saved) {
        gsap.set(btnEl, { x: saved.tx, y: saved.ty });
      }
      if (shouldAnimate()) {
        gsap.from(btnEl, { scale: 0, opacity: 0, duration: 0.5, ease: EASINGS.prismBounce });
      }
    }
    wasHidden = !visible;
  });

  onMount(() => {
    if (!btnEl) return;

    // Restore saved drag offset (transform-based, CSS bottom/left stays as default)
    const saved = gmGetValue('bfao_pos_v5', null) as { tx: number; ty: number } | null;
    if (saved) {
      gsap.set(btnEl, { x: saved.tx, y: saved.ty });
    }

    ctx = gsap.context(() => {
      Draggable.create(btnEl, {
        // Default type = "x,y" (transform-based), preserves CSS bottom/left
        bounds: document.body,
        edgeResistance: 0.75,
        inertia: false,
        minimumMovement: 8,
        onDragEnd() {
          // Save the transform offset, not absolute position
          const tx = gsap.getProperty(btnEl, 'x') as number;
          const ty = gsap.getProperty(btnEl, 'y') as number;
          gmSetValue('bfao_pos_v5', { tx, ty });
        },
      });

      if (shouldAnimate()) {
        const rgb = getComputedStyle(btnEl).getPropertyValue('--ai-primary-rgb').trim() || '115, 100, 255';
        gsap.timeline({ repeat: -1, yoyo: true }).fromTo(btnEl,
          { boxShadow: `0 0 14px rgba(${rgb},0.18), 0 0 28px rgba(155,89,246,0.08)` },
          { boxShadow: `0 0 24px rgba(${rgb},0.35), 0 0 48px rgba(155,89,246,0.15)`, duration: 3, ease: 'sine.inOut' }
        );
        gsap.timeline({ repeat: -1, defaults: { duration: 1, ease: EASINGS.liquidMorph } })
          .to(btnEl, { borderRadius: '42% 58% 62% 38% / 48% 52% 48% 52%' })
          .to(btnEl, { borderRadius: '58% 42% 38% 62% / 52% 48% 52% 48%' })
          .to(btnEl, { borderRadius: '45% 55% 52% 48% / 60% 40% 55% 45%' })
          .to(btnEl, { borderRadius: '55% 45% 48% 52% / 40% 60% 45% 55%' })
          .to(btnEl, { borderRadius: '50%' });
      }

      if (shouldAnimate() && orbitsContainer) {
        const colors = ['var(--ai-primary)', '#9b59f6', 'var(--ai-gradient-accent)', '#6ec1ff', '#ff6b9d'];
        const sizes = [5, 4, 3.5, 4.5, 3];
        const durations = [5, 7, 8, 6, 9];
        const blinkDurations = [1.5, 2.2, 1.8, 2.8, 2];
        for (let i = 0; i < 5; i++) {
          const orb = document.createElement('div');
          const sz = sizes[i];
          orb.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${colors[i]};box-shadow:0 0 ${sz*2}px ${colors[i]};pointer-events:none;will-change:transform,opacity;`;
          orbitsContainer.appendChild(orb);
          const sa = (Math.PI * 2 * i) / 5;
          const proxy = { angle: sa };
          gsap.to(proxy, { angle: sa + Math.PI * 2, duration: durations[i], repeat: -1, ease: 'none',
            onUpdate() { orb.style.transform = `translate(${Math.cos(proxy.angle)*42}px,${Math.sin(proxy.angle)*42}px)`; } });
          gsap.timeline({ repeat: -1, yoyo: true, delay: i * 0.4 })
            .to(orb, { opacity: 0.2, duration: blinkDurations[i], ease: 'sine.inOut' })
            .to(orb, { opacity: 1, duration: blinkDurations[i] * 0.6, ease: 'sine.inOut' });
        }
      }
    }, btnEl);
  });

  onDestroy(() => { ctx?.revert(); });

  function spawnParticles(origin: HTMLElement) {
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < 24; i++) {
      const dot = document.createElement('div');
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.4;
      const dist = 40 + Math.random() * 50;
      const size = 3 + Math.random() * 4;
      dot.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;background:var(--ai-primary,#7364FF);pointer-events:none;z-index:${Z_INDEX.TOAST};`;
      document.body.appendChild(dot);
      gsap.to(dot, { x: Math.cos(angle)*dist, y: Math.sin(angle)*dist, opacity: 0, scale: 0, duration: 0.5+Math.random()*0.4, ease: EASINGS.confettiArc, onComplete: () => dot.remove() });
    }
  }
</script>

<button
  class="float-btn"
  class:hidden={!visible}
  bind:this={btnEl}
  onpointerdown={onPDown}
  onpointerup={onPUp}
  use:magnetic={{ radius: 120, strength: 0.4 }}
  aria-label="打开 AI 收藏夹整理器"
>
  <Bot size={24} />
  <div class="orbits" bind:this={orbitsContainer}></div>
</button>

<style>
  .float-btn {
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 2147483640;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary-light), var(--ai-primary));
    background-size: 300% 300%;
    border: 2px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 0 14px rgba(var(--ai-primary-rgb), 0.18), 0 0 28px rgba(155, 89, 246, 0.08);
    will-change: transform, box-shadow, border-radius;
    user-select: none;
    touch-action: none;
  }

  .float-btn.hidden {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .orbits {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    pointer-events: none;
    overflow: visible;
  }
</style>
