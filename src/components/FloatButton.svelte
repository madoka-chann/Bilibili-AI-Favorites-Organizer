<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bot } from 'lucide-svelte';
  import { gsap, Draggable, EASINGS } from '$animations/gsap-config';
  import { shouldAnimate } from '$animations/gsap-config';
  import { magnetic } from '$actions/magnetic';
  import { gmGetValue, gmSetValue } from '$utils/gm';

  interface Props {
    visible?: boolean;
    onclick?: () => void;
  }

  let { visible = true, onclick }: Props = $props();

  let btnEl = $state<HTMLButtonElement>(undefined!);
  let orbitsContainer = $state<HTMLDivElement>(undefined!);
  let ctx: gsap.Context;
  let dragged = false;
  let magneticOpts = $state({ radius: 120, strength: 0.3, enabled: true });

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

      // A5: 星座轨道 — 5 个轨道球围绕按钮旋转 + 闪烁
      if (shouldAnimate() && orbitsContainer) {
        const orbCount = 5;
        const orbRadius = 42;
        const colors = ['var(--ai-primary)', '#9b59f6', 'var(--ai-gradient-accent)', '#6ec1ff', '#ff6b9d'];
        const sizes = [5, 4, 3.5, 4.5, 3];
        const durations = [10, 13, 16, 11, 18];
        const blinkDurations = [1.5, 2.2, 1.8, 2.8, 2];

        for (let i = 0; i < orbCount; i++) {
          const orb = document.createElement('div');
          const sz = sizes[i];
          orb.style.cssText = `
            position: absolute;
            width: ${sz}px;
            height: ${sz}px;
            border-radius: 50%;
            background: ${colors[i]};
            box-shadow: 0 0 ${sz * 2}px ${colors[i]};
            pointer-events: none;
            will-change: transform, opacity;
          `;
          orbitsContainer.appendChild(orb);

          const startAngle = (Math.PI * 2 * i) / orbCount;
          const proxy = { angle: startAngle };
          gsap.to(proxy, {
            angle: startAngle + Math.PI * 2,
            duration: durations[i],
            repeat: -1,
            ease: 'none',
            onUpdate() {
              const x = Math.cos(proxy.angle) * orbRadius;
              const y = Math.sin(proxy.angle) * orbRadius;
              orb.style.transform = `translate(${x}px, ${y}px)`;
            },
          });

          gsap.timeline({ repeat: -1, yoyo: true, delay: i * 0.4 })
            .to(orb, { opacity: 0.2, duration: blinkDurations[i], ease: 'sine.inOut' })
            .to(orb, { opacity: 1, duration: blinkDurations[i] * 0.6, ease: 'sine.inOut' });
        }
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

  <button
    class="float-btn"
    class:hidden={!visible}
    bind:this={btnEl}
    onclick={handleClick}
    use:magnetic={magneticOpts}
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
  }

  .float-btn.hidden {
    display: none;
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
