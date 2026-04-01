<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bot } from 'lucide-svelte';
  import { gsap, Draggable, EASINGS } from '$animations/gsap-config';
  import { shouldAnimate } from '$animations/gsap-config';
  import { magnetic } from '$actions/magnetic';
  import { gmGetValue, gmSetValue } from '$lib/utils/gm';

  export let visible = true;
  export let onclick: (() => void) | undefined = undefined;

  let btnEl: HTMLButtonElement;
  let ctx: gsap.Context;
  let dragged = false;
  let magneticOpts = { radius: 120, strength: 0.3, enabled: true };

  onMount(() => {
    ctx = gsap.context(() => {
      const savedPos = gmGetValue('bfao_floatBtnPos', { bottom: 30, left: 30 });
      if (btnEl) {
        btnEl.style.bottom = savedPos.bottom + 'px';
        btnEl.style.left = savedPos.left + 'px';
      }

      // K1: 按钮拖拽
      Draggable.create(btnEl, {
        type: 'left,top',
        bounds: document.body,
        edgeResistance: 0.75,
        inertia: false,
        onDragStart() {
          dragged = false;
          magneticOpts = { ...magneticOpts, enabled: false };
          if (shouldAnimate()) {
            gsap.to(btnEl, { scale: 0.9, duration: 0.15 });
          }
        },
        onDrag() {
          dragged = true;
        },
        onDragEnd() {
          magneticOpts = { ...magneticOpts, enabled: true };
          if (shouldAnimate()) {
            gsap.to(btnEl, { scale: 1, duration: 0.4, ease: EASINGS.prismBounce });
          }
          const rect = btnEl.getBoundingClientRect();
          gmSetValue('bfao_floatBtnPos', {
            bottom: window.innerHeight - rect.bottom,
            left: rect.left,
          });
        },
      });

      // A2: 极光呼吸光晕
      if (shouldAnimate()) {
        const rgb = getComputedStyle(btnEl).getPropertyValue('--ai-primary-rgb').trim() || '115, 100, 255';
        gsap.timeline({ repeat: -1, yoyo: true }).fromTo(
          btnEl,
          { boxShadow: `0 0 14px rgba(${rgb},0.18), 0 0 28px rgba(155,89,246,0.08)` },
          { boxShadow: `0 0 24px rgba(${rgb},0.35), 0 0 48px rgba(155,89,246,0.15)`, duration: 3, ease: 'sine.inOut' }
        );
      }

      // A6: 液态形变 — border-radius 循环变形
      if (shouldAnimate()) {
        gsap.timeline({ repeat: -1, defaults: { duration: 2, ease: EASINGS.liquidMorph } })
          .to(btnEl, { borderRadius: '42% 58% 62% 38% / 48% 52% 48% 52%' })
          .to(btnEl, { borderRadius: '58% 42% 38% 62% / 52% 48% 52% 48%' })
          .to(btnEl, { borderRadius: '45% 55% 52% 48% / 60% 40% 55% 45%' })
          .to(btnEl, { borderRadius: '55% 45% 48% 52% / 40% 60% 45% 55%' })
          .to(btnEl, { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' });
      }
    }, btnEl);
  });

  onDestroy(() => {
    ctx?.revert();
  });

  function handleClick() {
    if (!dragged) {
      // A3: 点击粒子爆发
      if (shouldAnimate() && btnEl) {
        spawnParticles(btnEl);
      }
      onclick?.();
    }
    dragged = false;
  }

  /** A3: 生成粒子爆发效果 */
  function spawnParticles(origin: HTMLElement) {
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 16;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 40 + Math.random() * 50;
      const size = 3 + Math.random() * 4;

      dot.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: var(--ai-primary, #7364FF);
        pointer-events: none;
        z-index: 2147483647;
      `;
      document.body.appendChild(dot);

      gsap.to(dot, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
        duration: 0.5 + Math.random() * 0.4,
        ease: EASINGS.confettiArc,
        onComplete: () => dot.remove(),
      });
    }
  }
</script>

{#if visible}
  <button
    class="float-btn"
    bind:this={btnEl}
    onclick={handleClick}
    use:magnetic={magneticOpts}
    aria-label="打开 AI 收藏夹整理器"
  >
    <Bot size={24} />
  </button>
{/if}

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
  }
</style>
