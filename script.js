/**
 * CREMORIVA — Master Haute Glacerie & Molecular Confiserie Experience Engine
 * Synchronizes 297-Frame Scroll Scrubber, Web Audio Velvet Ambiance, AURA AI Sommelier,
 * Bespoke Atelier Customizer, Catalog Filters, and Haute Cart System.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION & STATE
  // =========================================================================
  const TOTAL_FRAMES = 297;
  const FRAME_DIR_PRIMARY = './background-animation.agignore/';
  const FRAME_DIR_FALLBACK = './background-animation/';
  let activeFrameDir = FRAME_DIR_PRIMARY;
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.jpg';

  // Animation Canvas & Stage Elements
  const canvas = document.getElementById('animation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const scrollWrapper = document.getElementById('scroll-experience');
  const heroOverlay = document.getElementById('hero-overlay');
  const heroScrollIndicator = document.getElementById('hero-scroll-indicator');
  const storyCards = document.querySelectorAll('.story-card');
  const chapterDots = document.querySelectorAll('.dot-item');

  // Animation Frame Buffers
  const images = new Array(TOTAL_FRAMES);
  const loadedFlags = new Array(TOTAL_FRAMES).fill(false);
  let loadedCount = 0;
  let targetFrame = 1;
  let currentFrame = 1;
  let lastDrawnFrame = -1;

  // Audio Ambiance Synthesizer State
  let audioCtx = null;
  let audioNodes = null;
  let isAudioActive = false;

  // Cart State
  let cartItems = [
    {
      id: 1,
      title: 'Grand Degustation Trio',
      price: 58.00,
      desc: '3-Tier Tasting Flight with Sub-Zero Insulated Capsule',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvAoJgDNDYpx_hbTXjb-kCBngRgFLP2m7OReVN814lhvVz7TXG46YMwowz5uBIn_AK_fBFAL4w1YsUQOo3Q46V-hW5bdKKB_uyWyUOOi9dp78U0k4YbbV-ssUNzmeulLQRx_JOMMTIFof6U3ztaVZICPOs-3uh5nQBm1WtfBCvV5tw0pUp2TdPGhsyWqozcTABaeMHa92IDRbHPFa_MTMPFhQ1i3kK0HkklJdb8mNZKEPT0d6htUlicGHeuJ0uGarylfM',
      qty: 1
    }
  ];

  // =========================================================================
  // 2. 297-FRAME SCROLL ANIMATION SCRUBBER ENGINE
  // =========================================================================
  function formatFrameNumber(num) {
    return String(num).padStart(3, '0');
  }

  function getFrameSrc(index, dir = activeFrameDir) {
    return `${dir}${FRAME_PREFIX}${formatFrameNumber(index)}${FRAME_EXT}`;
  }

  function initFramePreloader() {
    const initialReadyThreshold = 20;

    function onSingleFrameLoaded(index) {
      loadedFlags[index - 1] = true;
      loadedCount++;

      // Sharpen current frame immediately once downloaded
      if (Math.round(currentFrame) === index) {
        lastDrawnFrame = -1;
        renderCanvasFrame(index);
      }

      // Ensure frame 1 displays instantly
      if (index === 1 && lastDrawnFrame === -1) {
        renderCanvasFrame(1);
      }
    }

    function loadFrame(i) {
      const img = new Image();
      img.onload = () => onSingleFrameLoaded(i);
      img.onerror = () => {
        // Transparent fallback to alternate folder
        const altDir = activeFrameDir === FRAME_DIR_PRIMARY ? FRAME_DIR_FALLBACK : FRAME_DIR_PRIMARY;
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          activeFrameDir = altDir;
          images[i - 1] = fallbackImg;
          onSingleFrameLoaded(i);
        };
        fallbackImg.src = getFrameSrc(i, altDir);
      };
      img.src = getFrameSrc(i, activeFrameDir);
      images[i - 1] = img;
    }

    // Load initial 20 frames immediately
    for (let i = 1; i <= Math.min(initialReadyThreshold, TOTAL_FRAMES); i++) {
      loadFrame(i);
    }

    // Stream remaining frames in background
    setTimeout(() => {
      for (let i = initialReadyThreshold + 1; i <= TOTAL_FRAMES; i++) {
        loadFrame(i);
      }
    }, 40);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width > 0 ? rect.width : window.innerWidth;
    const ch = rect.height > 0 ? rect.height : window.innerHeight;

    canvas.width = Math.floor(cw * dpr);
    canvas.height = Math.floor(ch * dpr);

    lastDrawnFrame = -1;
    renderCanvasFrame(Math.round(currentFrame));
  }

  window.addEventListener('resize', resizeCanvas);

  function renderCanvasFrame(frameNum) {
    frameNum = Math.max(1, Math.min(TOTAL_FRAMES, frameNum));
    const img = images[frameNum - 1];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Find nearest loaded frame for zero flicker
      let fallback = null;
      for (let offset = 1; offset < 40; offset++) {
        if (frameNum - offset >= 1 && images[frameNum - offset - 1]?.complete && images[frameNum - offset - 1]?.naturalWidth > 0) {
          fallback = images[frameNum - offset - 1];
          break;
        }
        if (frameNum + offset <= TOTAL_FRAMES && images[frameNum + offset - 1]?.complete && images[frameNum + offset - 1]?.naturalWidth > 0) {
          fallback = images[frameNum + offset - 1];
          break;
        }
      }
      if (fallback) {
        drawCover(fallback);
      }
      return;
    }

    drawCover(img);
    lastDrawnFrame = frameNum;
  }

  function drawCover(img) {
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const canvasAspect = cw / ch;
    const imageAspect = iw / ih;

    let renderW, renderH, dx, dy;

    if (canvasAspect > imageAspect) {
      renderW = cw;
      renderH = cw / imageAspect;
      dx = 0;
      dy = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * imageAspect;
      dx = (cw - renderW) / 2;
      dy = 0;
    }

    ctx.drawImage(img, dx, dy, renderW, renderH);
  }

  function calculateScrollTarget() {
    if (!scrollWrapper) return;
    const rect = scrollWrapper.getBoundingClientRect();
    const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    const currentScroll = Math.max(0, -rect.top);
    const progress = Math.min(1, Math.max(0, currentScroll / maxScroll));

    targetFrame = 1 + Math.floor(progress * (TOTAL_FRAMES - 1));
  }

  window.addEventListener('scroll', calculateScrollTarget, { passive: true });

  function animationLoop() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.05) {
      currentFrame += diff * 0.18; // Smooth 60/120fps lerp
    } else {
      currentFrame = targetFrame;
    }

    const frameInt = Math.round(currentFrame);
    if (frameInt !== lastDrawnFrame) {
      renderCanvasFrame(frameInt);
      updateAnimationUI(frameInt);
    }

    requestAnimationFrame(animationLoop);
  }

  function updateAnimationUI(frame) {
    // 1. Hero Overlay Visibility
    if (heroOverlay) {
      if (frame > 28) {
        heroOverlay.classList.add('hidden');
      } else {
        heroOverlay.classList.remove('hidden');
      }
    }

    // 2. Story Chapter Cards
    storyCards.forEach((card) => {
      const start = parseInt(card.dataset.start, 10);
      const end = parseInt(card.dataset.end, 10);

      if (frame >= start && frame <= end) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // 3. Chapter Dots
    chapterDots.forEach((dot) => {
      const target = parseInt(dot.dataset.targetFrame, 10);
      const isActive = Math.abs(frame - target) < 32;
      dot.classList.toggle('active', isActive);
    });
  }

  // Chapter Dots Click Navigation
  chapterDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      if (!scrollWrapper) return;
      const target = parseInt(dot.dataset.targetFrame, 10);
      targetFrame = target;
      const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;
      const progress = (target - 1) / (TOTAL_FRAMES - 1);
      const targetScrollY = scrollWrapper.offsetTop + progress * maxScroll;
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    });
  });

  // Hero Scroll Indicator Click
  if (heroScrollIndicator) {
    heroScrollIndicator.addEventListener('click', () => {
      const targetScrollY = window.innerHeight * 1.5;
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    });
  }

  // Arrow Key Navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (!scrollWrapper) return;
    const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;
    const step = (maxScroll / (TOTAL_FRAMES - 1)) * 8;

    if (e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'PageDown') {
      const scrollPos = window.scrollY;
      if (scrollPos < scrollWrapper.offsetHeight) {
        e.preventDefault();
        window.scrollBy({ top: step, behavior: 'auto' });
      }
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'PageUp') {
      const scrollPos = window.scrollY;
      if (scrollPos > 0 && scrollPos <= scrollWrapper.offsetHeight) {
        e.preventDefault();
        window.scrollBy({ top: -step, behavior: 'auto' });
      }
    }
  });

  // =========================================================================
  // 3. LUXURY WEB AUDIO AMBIANCE SYNTHESIZER
  // =========================================================================
  function initAmbientAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 2.5);

    // Warm Lowpass Filter (380 Hz cutoff for cozy chocolate lounge atmosphere)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    // Lush chord frequencies: F2 (87.31Hz), C3 (130.81Hz), A3 (220.0Hz), E4 (329.63Hz)
    const notes = [87.31, 130.81, 220.0, 329.63];
    const oscillators = [];

    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Subtle organic LFO
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.12 + idx * 0.04, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0.14, audioCtx.currentTime);

      osc.connect(noteGain);
      noteGain.connect(filter);
      osc.start();
      oscillators.push(osc);
    });

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);
    audioNodes = { masterGain, filter, oscillators };
  }

  function toggleAudio() {
    const audioToggle = document.getElementById('audio-toggle');
    const audioState = document.getElementById('audio-state');

    if (!isAudioActive) {
      if (!audioCtx) {
        initAmbientAudio();
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (audioNodes) {
        audioNodes.masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        audioNodes.masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        audioNodes.masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 1.5);
      }
      isAudioActive = true;
      if (audioState) audioState.textContent = 'Velvet: On';
      if (audioToggle) audioToggle.classList.add('audio-playing', 'text-primary', 'border-primary/50');
      showToast('Velvet Sound Ambiance Activated ✦');
    } else {
      if (audioNodes && audioCtx) {
        audioNodes.masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        audioNodes.masterGain.gain.setValueAtTime(audioNodes.masterGain.gain.value, audioCtx.currentTime);
        audioNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      }
      isAudioActive = false;
      if (audioState) audioState.textContent = 'Ambiance: Mute';
      if (audioToggle) audioToggle.classList.remove('audio-playing', 'text-primary', 'border-primary/50');
      showToast('Sound Ambiance Muted');
    }
  }

  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }

  // =========================================================================
  // 4. HAUTE CART & SLIDE-OVER DRAWER ENGINE
  // =========================================================================
  window.openCart = function () {
    const panel = document.getElementById('instant-order-panel');
    const backdrop = document.getElementById('cart-backdrop');
    if (panel) panel.classList.remove('translate-x-full');
    if (backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100');
    }
  };

  window.closeCart = function () {
    const panel = document.getElementById('instant-order-panel');
    const backdrop = document.getElementById('cart-backdrop');
    if (panel) panel.classList.add('translate-x-full');
    if (backdrop) {
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      backdrop.classList.remove('opacity-100');
    }
  };

  window.addToOrder = function (title, price, desc, img) {
    const existingIndex = cartItems.findIndex(item => item.title === title);
    if (existingIndex > -1) {
      cartItems[existingIndex].qty += 1;
    } else {
      cartItems.push({
        id: Date.now(),
        title: title,
        price: parseFloat(price),
        desc: desc || 'Artisan Haute Creation',
        img: img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvAoJgDNDYpx_hbTXjb-kCBngRgFLP2m7OReVN814lhvVz7TXG46YMwowz5uBIn_AK_fBFAL4w1YsUQOo3Q46V-hW5bdKKB_uyWyUOOi9dp78U0k4YbbV-ssUNzmeulLQRx_JOMMTIFof6U3ztaVZICPOs-3uh5nQBm1WtfBCvV5tw0pUp2TdPGhsyWqozcTABaeMHa92IDRbHPFa_MTMPFhQ1i3kK0HkklJdb8mNZKEPT0d6htUlicGHeuJ0uGarylfM',
        qty: 1
      });
    }

    renderCart();
    window.openCart();
    showToast(`Added "${title}" to your Haute Cart!`);
  };

  window.removeFromCart = function (index) {
    if (index >= 0 && index < cartItems.length) {
      const removedTitle = cartItems[index].title;
      cartItems.splice(index, 1);
      renderCart();
      showToast(`Removed "${removedTitle}"`);
    }
  };

  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-badge-count');
    const subtotalEl = document.getElementById('cart-subtotal');
    const grandtotalEl = document.getElementById('cart-grandtotal');

    if (!container) return;

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div class="py-12 flex flex-col items-center justify-center text-center gap-3 text-on-surface-variant">
          <span class="material-symbols-outlined text-[48px] text-outline">shopping_bag</span>
          <p class="font-serif text-lg text-on-surface">Your Haute Cart is Empty</p>
          <p class="font-sans text-xs max-w-xs">Explore our Vault Creations or compose a bespoke sundae above.</p>
        </div>
      `;
      if (badge) badge.textContent = '0';
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      if (grandtotalEl) grandtotalEl.textContent = '$0.00';
      return;
    }

    let subtotal = 0;
    let totalQty = 0;
    container.innerHTML = '';

    cartItems.forEach((item, idx) => {
      subtotal += item.price * item.qty;
      totalQty += item.qty;

      const itemEl = document.createElement('div');
      itemEl.className = 'flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm';
      itemEl.innerHTML = `
        <div class="w-14 h-14 rounded-lg bg-surface-container-highest overflow-hidden shrink-0 border border-outline-variant/20">
          <img src="${item.img}" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex flex-col flex-grow">
          <div class="flex justify-between items-start">
            <h4 class="font-serif text-sm font-semibold text-on-surface">${item.title}</h4>
            <span class="font-serif text-sm font-bold text-primary">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
          <span class="font-sans text-[11px] text-on-surface-variant line-clamp-1">${item.desc}</span>
          <div class="flex items-center justify-between mt-2 pt-1 border-t border-outline-variant/10">
            <span class="font-sans text-[10px] uppercase font-bold tracking-wider text-secondary">Qty: ${item.qty}</span>
            <button onclick="removeFromCart(${idx})" class="text-outline hover:text-error transition-colors text-[11px] font-semibold">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(itemEl);
    });

    const grandTotal = subtotal + 4.50; // $4.50 courier dispatch
    if (badge) badge.textContent = String(totalQty);
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (grandtotalEl) grandtotalEl.textContent = `$${grandTotal.toFixed(2)}`;
  }

  let currentOrderData = null;

  window.openCustomerDetailsModal = function () {
    if (cartItems.length === 0) {
      showToast('Your Haute Cart is empty! Select an exquisite creation first.');
      return;
    }

    const previewList = document.getElementById('checkout-items-list');
    const previewCount = document.getElementById('checkout-preview-count');
    const previewTotal = document.getElementById('checkout-preview-total');

    if (previewList) {
      previewList.innerHTML = '';
      let subtotal = 0;
      let totalQty = 0;
      cartItems.forEach(item => {
        subtotal += item.price * item.qty;
        totalQty += item.qty;
        const row = document.createElement('div');
        row.className = 'flex justify-between items-center py-1.5 border-b border-outline-variant/15 text-xs';
        row.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <span class="font-serif text-on-surface font-medium">${item.title}</span>
            <span class="text-secondary text-[11px] font-sans">× ${item.qty}</span>
          </div>
          <span class="font-serif font-bold text-primary">$${(item.price * item.qty).toFixed(2)}</span>
        `;
        previewList.appendChild(row);
      });

      const grandTotal = subtotal + 4.50;
      if (previewCount) previewCount.textContent = `${totalQty} item${totalQty > 1 ? 's' : ''}`;
      if (previewTotal) previewTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }

    window.closeCart();
    const modal = document.getElementById('customer-details-modal');
    if (modal) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100');
    }
  };

  window.closeCustomerDetailsModal = function () {
    const modal = document.getElementById('customer-details-modal');
    if (modal) {
      modal.classList.add('opacity-0', 'pointer-events-none');
      modal.classList.remove('opacity-100');
    }
  };

  window.completeCheckout = function () {
    window.openCustomerDetailsModal();
  };

  window.submitCustomerOrder = function (e) {
    if (e && e.preventDefault) e.preventDefault();

    if (cartItems.length === 0) {
      showToast('Your Haute Cart is empty!');
      return;
    }

    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const emailInput = document.getElementById('cust-email');
    const addressInput = document.getElementById('cust-address');
    const deliveryTimeInput = document.getElementById('cust-delivery-time');
    const notesInput = document.getElementById('cust-notes');
    const submitBtn = document.getElementById('submit-order-btn');
    const submitText = document.getElementById('submit-order-text');

    const customerName = nameInput ? nameInput.value.trim() : 'Anonymous Client';
    const customerPhone = phoneInput ? phoneInput.value.trim() : 'N/A';
    const customerEmail = emailInput ? emailInput.value.trim() : 'N/A';
    const customerAddress = addressInput ? addressInput.value.trim() : 'Salon Direct Collection';
    const deliveryTime = deliveryTimeInput ? deliveryTimeInput.value : 'Express Cryo-Transit';
    const customerNotes = notesInput ? notesInput.value.trim() : 'None';

    if (!customerName || !customerPhone || !customerEmail || !customerAddress) {
      showToast('Please fill all required coordinates.');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Compiling Excel Manifest...';

    const orderRef = '#CR-2026-' + Math.floor(1000 + Math.random() * 9000);
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.price * item.qty;
    });
    const dispatchFee = 4.50;
    const grandTotal = subtotal + dispatchFee;

    const orderData = {
      orderRef: orderRef,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      isoDate: new Date().toISOString(),
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        deliveryTime: deliveryTime,
        notes: customerNotes
      },
      items: cartItems.map(item => ({
        title: item.title,
        desc: item.desc || '',
        price: item.price,
        qty: item.qty,
        total: (item.price * item.qty).toFixed(2)
      })),
      subtotal: subtotal.toFixed(2),
      dispatch: dispatchFee.toFixed(2),
      total: grandTotal.toFixed(2),
      managerEmail: 'rahekrishn07@gmail.com'
    };

    currentOrderData = orderData;

    // 1. Generate & Trigger Excel Download (.xlsx)
    try {
      generateOrderExcel(orderData);
    } catch (err) {
      console.warn('Excel generation fallback to CSV:', err);
      downloadCSVOrder(orderData);
    }

    // 2. Transmit to serverless API / log for manager
    try {
      fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).catch(apiErr => console.log('API logging completed:', apiErr));
    } catch (_) {}

    // 3. Update Email & WhatsApp Manifest Links for Manager
    const emailBtn = document.getElementById('email-manager-btn');
    const whatsappBtn = document.getElementById('whatsapp-manager-btn');

    const emailSubject = encodeURIComponent(`🍨 [CREMORIVA ORDER] ${orderRef} - ${customerName} ($${orderData.total})`);
    const emailBody = encodeURIComponent(
`CREMORIVA HAUTE GLACERIE & MOLECULAR CONFISERIE
OFFICIAL ORDER MANIFEST & CLIENT DISPATCH RECORD
=====================================================
Order Reference: ${orderRef}
Date & Time: ${orderData.timestamp}
Status: CONFIRMED FOR CRYO-DISPATCH (-196°C)

CUSTOMER COORDINATES:
-----------------------------------------------------
Name: ${customerName}
Mobile / WhatsApp: ${customerPhone}
Email: ${customerEmail}
Delivery Address: ${customerAddress}
Preferred Delivery Slot: ${deliveryTime}
Special Notes / Inscriptions: ${customerNotes}

ORDER ITEMS:
-----------------------------------------------------
${orderData.items.map((it, idx) => `${idx + 1}. ${it.title} × ${it.qty} = $${it.total} (Unit: $${Number(it.price).toFixed(2)})`).join('\n')}

FINANCIAL BREAKDOWN:
-----------------------------------------------------
Subtotal: $${orderData.subtotal}
Sub-Zero Cryo-Pod Insulation: Complimentary
Courier Thermal Dispatch: $${orderData.dispatch}
TOTAL DUE: $${orderData.total}
Target Plating Temperature: -12.5°C
=====================================================
Official Excel Manifest (.xlsx) has been generated.
Manager Recipient: rahekrishn07@gmail.com`
    );

    if (emailBtn) {
      emailBtn.href = `mailto:rahekrishn07@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    }

    const waText = encodeURIComponent(
`🍨 *CREMORIVA ORDER MANIFEST - ${orderRef}*
👤 *Client:* ${customerName}
📞 *Mobile:* ${customerPhone}
📧 *Email:* ${customerEmail}
📍 *Address:* ${customerAddress}
⏰ *Window:* ${deliveryTime}
📝 *Notes:* ${customerNotes}
───────────────────────
*ORDER ITEMS:*
${orderData.items.map((it, idx) => `${idx + 1}. *${it.title}* × ${it.qty} = $${it.total}`).join('\n')}
───────────────────────
*Subtotal:* $${orderData.subtotal}
*Courier Thermal Dispatch:* $${orderData.dispatch}
*TOTAL DUE:* $${orderData.total}
───────────────────────
📁 Official Excel spreadsheet dispatched for Manager: rahekrishn07@gmail.com`
    );

    if (whatsappBtn) {
      whatsappBtn.href = `https://api.whatsapp.com/send?text=${waText}`;
    }

    // 4. Update Confirmation Modal State
    const refEl = document.getElementById('order-ref');
    const confirmNameEl = document.getElementById('confirm-cust-name');
    const confirmTotalEl = document.getElementById('confirm-grand-total');

    if (refEl) refEl.textContent = orderRef;
    if (confirmNameEl) confirmNameEl.textContent = `${customerName} (${customerPhone})`;
    if (confirmTotalEl) confirmTotalEl.textContent = `$${orderData.total}`;

    // Reset button state
    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.textContent = 'Confirm & Transmit Order (Excel)';

    // Close checkout details modal and open success confirmation modal
    window.closeCustomerDetailsModal();
    const successModal = document.getElementById('checkout-modal');
    if (successModal) {
      successModal.classList.remove('opacity-0', 'pointer-events-none');
      successModal.classList.add('opacity-100');
    }

    // Reset cart
    cartItems = [];
    renderCart();
    showToast(`Order confirmed! Excel manifest generated for ${customerName}`);
  };

  function generateOrderExcel(orderData) {
    if (typeof XLSX !== 'undefined') {
      const rows = [
        ['CREMORIVA — HAUTE GLACERIE & MOLECULAR CONFISERIE'],
        ['OFFICIAL ORDER MANIFEST & CLIENT DISPATCH RECORD'],
        [''],
        ['Order Reference:', orderData.orderRef],
        ['Order Date & Time:', orderData.timestamp],
        ['Cryogenic Protocol:', 'CONFIRMED (-196°C VACUUM SEALED)'],
        ['Target Plating Temp:', '-12.5°C'],
        ['Dispatched To Manager:', 'rahekrishn07@gmail.com'],
        [''],
        ['CUSTOMER COORDINATES'],
        ['Customer Full Name:', orderData.customer.name],
        ['Mobile / WhatsApp:', orderData.customer.phone],
        ['Customer Email:', orderData.customer.email],
        ['Delivery Coordinates:', orderData.customer.address],
        ['Preferred Dispatch Window:', orderData.customer.deliveryTime],
        ['Special Cryogenic Notes:', orderData.customer.notes],
        [''],
        ['ORDER LINE ITEMS'],
        ['Line #', 'Creation Title', 'Formulation Details', 'Unit Price ($)', 'Quantity', 'Line Total ($)']
      ];

      orderData.items.forEach((item, idx) => {
        rows.push([
          idx + 1,
          item.title,
          item.desc,
          `$${Number(item.price).toFixed(2)}`,
          item.qty,
          `$${item.total}`
        ]);
      });

      rows.push(['']);
      rows.push(['', '', '', '', 'Subtotal:', `$${orderData.subtotal}`]);
      rows.push(['', '', '', '', 'Sub-Zero Cryo-Pod Capsule:', 'Complimentary']);
      rows.push(['', '', '', '', 'Courier Thermal Dispatch:', `$${orderData.dispatch}`]);
      rows.push(['', '', '', '', 'TOTAL DUE:', `$${orderData.total}`]);
      rows.push(['']);
      rows.push(['Manager Contact:', 'rahekrishn07@gmail.com']);
      rows.push(['Notice:', 'All formulations conched under strict cryogenic molecular standards.']);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [
        { wch: 8 },
        { wch: 32 },
        { wch: 38 },
        { wch: 15 },
        { wch: 10 },
        { wch: 16 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Order Manifest');
      const filename = `CREMORIVA_Order_${orderData.orderRef.replace(/[^a-zA-Z0-9-]/g, '')}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else {
      downloadCSVOrder(orderData);
    }
  }

  function downloadCSVOrder(orderData) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'CREMORIVA Haute Glacerie - Official Order Manifest\r\n';
    csvContent += `Order Reference,${orderData.orderRef}\r\n`;
    csvContent += `Date,${orderData.timestamp}\r\n`;
    csvContent += `Manager Email,rahekrishn07@gmail.com\r\n`;
    csvContent += `Customer Name,${orderData.customer.name}\r\n`;
    csvContent += `Customer Phone,${orderData.customer.phone}\r\n`;
    csvContent += `Customer Email,${orderData.customer.email}\r\n`;
    csvContent += `Delivery Address,"${orderData.customer.address.replace(/"/g, '""')}"\r\n`;
    csvContent += `Delivery Window,${orderData.customer.deliveryTime}\r\n`;
    csvContent += `Special Notes,"${(orderData.customer.notes || '').replace(/"/g, '""')}"\r\n\r\n`;
    csvContent += 'Line,Item,Description,Unit Price,Quantity,Total\r\n';

    orderData.items.forEach((item, idx) => {
      csvContent += `${idx + 1},"${item.title.replace(/"/g, '""')}","${(item.desc || '').replace(/"/g, '""')}",$${item.price},${item.qty},$${item.total}\r\n`;
    });

    csvContent += `,,,,Subtotal,$${orderData.subtotal}\r\n`;
    csvContent += `,,,,Courier Thermal Dispatch,$${orderData.dispatch}\r\n`;
    csvContent += `,,,,Total Payable,$${orderData.total}\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CREMORIVA_Order_${orderData.orderRef.replace(/[^a-zA-Z0-9-]/g, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  window.downloadExcelAgain = function () {
    if (currentOrderData) {
      try {
        generateOrderExcel(currentOrderData);
        showToast('Downloaded official Excel manifest.');
      } catch (err) {
        downloadCSVOrder(currentOrderData);
      }
    } else {
      showToast('No active order manifest found.');
    }
  };

  window.closeCheckoutModal = function () {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('opacity-0', 'pointer-events-none');
      modal.classList.remove('opacity-100');
    }
  };

  // =========================================================================
  // 5. AI FLAVOR SOMMELIER (AURA CONCIERGE) ENGINE
  // =========================================================================
  window.simulateAuraPrompt = function (text) {
    const input = document.getElementById('aura-input');
    if (input) {
      input.value = text;
      window.submitAuraQuery();
    }
  };

  window.submitAuraQuery = function () {
    const input = document.getElementById('aura-input');
    const query = input?.value.trim();
    if (!query) return;

    const conversation = document.getElementById('aura-conversation');
    const statusLabel = document.getElementById('aura-status-label');

    // Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'flex items-start justify-end gap-3 self-end max-w-[85%]';
    userBubble.innerHTML = `
      <div class="p-3.5 rounded-xl bg-primary-container text-on-primary-container font-sans text-sm shadow-sm font-medium">
        <p>${query}</p>
      </div>
      <div class="w-8 h-8 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center shrink-0 mt-0.5">
        <span class="material-symbols-outlined text-[16px]">person</span>
      </div>
    `;
    conversation.appendChild(userBubble);
    input.value = '';
    conversation.scrollTop = conversation.scrollHeight;

    if (statusLabel) statusLabel.textContent = 'Harmonizing Sensory Matrix...';

    // Tailored AI Sommelier Responses based on query analysis
    setTimeout(() => {
      let recTitle = 'Midnight Eclipse Platter with Toffee';
      let recPrice = 38.00;
      let recDesc = '72% Ecuadorian Arriba with smoked fleur de sel toffee';
      let recImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAAxyO1hMvy641tnWmU0cdXzKRMkPuqOWeDlR-vMEqPKHRtN-RVo_dNnvgp2hGvvayYYc5-l1puXRvVbzqHknOu5V4pdNvMFC-ixf-E3qPCcpTwbCstsUGEVVM4K8bbOwYKHaIMGhbwestK7rtPjzMOAPrF4R8fpepm7YB8khELpPmjyzzd0am94RDAhSivnWackz3Tptap1Z1ulGJhnF4fWxRLUTEVL5gYC9-tnYkk7DzyL5V0y2E6g';
      let responseText = '';
      let radarPoints = '100,30 170,80 145,155 60,150 35,80';

      const lower = query.toLowerCase();
      if (lower.includes('vegan') || lower.includes('plant')) {
        recTitle = 'Pure Oat & Criollo Dark Sorbet';
        recPrice = 21.00;
        recDesc = 'Freeze-whipped oat milk and pure liquid obsidian Venezuelan cocoa';
        responseText = 'Formulating molecular plant-based lipids: Our <strong>"Pure Oat &amp; Criollo Dark Sorbet"</strong> delivers 88% cacao density with zero dairy butterfat, balanced by unrefined Madagascar vanilla and toasted coconut silk.';
        radarPoints = '100,20 155,90 135,160 55,160 30,75';
        updateSensoryBars('92% Single-Origin', '88% Silk Texture', '40% Controlled');
      } else if (lower.includes('glycemic') || lower.includes('calorie') || lower.includes('diet') || lower.includes('kcal')) {
        recTitle = 'Keto Cryo-Ganache Cloud';
        recPrice = 23.00;
        recDesc = 'Monk fruit infused 80% Arriba dark with cold-pressed cocoa butter';
        responseText = 'Calibrating low-glycemic curve: Our <strong>"Keto Cryo-Ganache Cloud"</strong> is sweetened purely with organic monk fruit extract, clocking at 310 kcal with zero blood sugar spikes and extraordinary tannin velvet.';
        radarPoints = '100,25 160,85 140,150 45,155 25,85';
        updateSensoryBars('88% High Polyphenol', '92% Whipped Airy', '28% Low Glycemic');
      } else if (lower.includes('wine') || lower.includes('port') || lower.includes('champagne') || lower.includes('alcohol')) {
        recTitle = 'Vintage Barrel Port & Praline Coupe';
        recPrice = 29.00;
        recDesc = 'Infused with 20-year Tawny Port and caramelized hazelnut crisps';
        responseText = 'Sommelier Pairing Selected: We recommend the <strong>"Vintage Barrel Port &amp; Praline Coupe"</strong>. The high residual sugars and dried fig notes of vintage port integrate flawlessly with 74% dark chocolate and salted toffee.';
        radarPoints = '100,35 175,75 150,150 65,145 40,75';
        updateSensoryBars('78% Rounded Oak', '95% Full Bodied', '65% Rich Molasses');
      } else if (lower.includes('track') || lower.includes('cr-') || lower.includes('order')) {
        recTitle = 'Priority Cryo-Tracking Status';
        recPrice = 0.00;
        recDesc = 'Sub-Zero Vacuum Sealed Capsule Active';
        responseText = 'Tracking Order <strong>#CR-9841</strong>: Current core temperature is calibrated at <strong class="text-secondary">-13.1°C</strong>. Seal integrity: 100%. Dispatch courier is 12 minutes away with refrigerated thermal pod.';
        radarPoints = '100,45 150,85 130,140 70,140 50,85';
      } else {
        responseText = `Calibrating bespoke parameters for <em>"${query}"</em>: Our culinary algorithms recommend our award-winning <strong>"${recTitle}"</strong> conched for 24 continuous hours with Georgia pecans and single-estate cocoa.`;
        updateSensoryBars('85% Single-Origin', '98% Double Whipped', '58% Controlled');
      }

      // Append AURA response bubble
      const auraBubble = document.createElement('div');
      auraBubble.className = 'flex items-start gap-3 max-w-[92%]';
      auraBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/30">
          <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
        </div>
        <div class="p-4 rounded-xl bg-surface-container-high text-on-surface font-sans text-sm shadow-sm space-y-2 border border-outline-variant/20">
          <div class="flex items-center gap-1.5 text-primary font-sans text-xs font-bold uppercase tracking-wider">
            <span class="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
            <span>AURA Sensory Pairing Found</span>
          </div>
          <p class="text-on-surface-variant leading-relaxed">${responseText}</p>
          ${recPrice > 0 ? `
          <div class="pt-2">
            <button onclick="addToOrder('${recTitle}', ${recPrice}, '${recDesc}', '${recImg}')" class="px-4 py-1.5 rounded-full bg-primary text-on-primary font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:bg-primary-container transition-colors">
              Add Recommended Formulation ($${recPrice.toFixed(2)})
            </button>
          </div>` : ''}
        </div>
      `;
      conversation.appendChild(auraBubble);
      conversation.scrollTop = conversation.scrollHeight;

      // Animate Radar Polygon
      const polygon = document.getElementById('radar-polygon');
      if (polygon) polygon.setAttribute('points', radarPoints);

      if (statusLabel) statusLabel.textContent = 'Palate Concierge Active';
    }, 650);
  };

  function updateSensoryBars(tannic, silk, sweet) {
    const valTannic = document.getElementById('val-tannic');
    const valSilk = document.getElementById('val-silk');
    const valSweet = document.getElementById('val-sweet');
    if (valTannic) valTannic.textContent = tannic;
    if (valSilk) valSilk.textContent = silk;
    if (valSweet) valSweet.textContent = sweet;
  }

  // =========================================================================
  // 6. BESPOKE SUNDAE BUILDER ATELIER
  // =========================================================================
  window.calculateBespokeTotal = function () {
    let basePrice = 14.00;
    let calories = 280;
    const recipeList = document.getElementById('customizer-recipe-list');
    if (!recipeList) return;

    recipeList.innerHTML = '';

    // Selected Base
    const selectedBase = document.querySelector('input[name="base"]:checked');
    if (selectedBase) {
      basePrice = parseFloat(selectedBase.getAttribute('data-price')) || 14.00;
      calories = parseInt(selectedBase.getAttribute('data-cals'), 10) || 280;
      recipeList.innerHTML += `
        <div class="flex justify-between">
          <span>Base: ${selectedBase.value}</span>
          <span class="text-on-surface font-semibold">$${basePrice.toFixed(2)}</span>
        </div>
      `;
    }

    // Checked Toppings
    let extrasTotal = 0;
    const checkedToppings = document.querySelectorAll('input[name="topping"]:checked');
    checkedToppings.forEach(top => {
      const topPrice = parseFloat(top.getAttribute('data-price')) || 0;
      const topCals = parseInt(top.getAttribute('data-cals'), 10) || 0;
      extrasTotal += topPrice;
      calories += topCals;

      recipeList.innerHTML += `
        <div class="flex justify-between">
          <span>Extra: ${top.value}</span>
          <span class="text-on-surface font-semibold">+$${topPrice.toFixed(2)}</span>
        </div>
      `;
    });

    const grandBespoke = basePrice + extrasTotal;
    const priceEl = document.getElementById('bespoke-price');
    const calsEl = document.getElementById('bespoke-cals');
    if (priceEl) priceEl.textContent = '$' + grandBespoke.toFixed(2);
    if (calsEl) calsEl.textContent = calories + ' kcal';
  };

  window.addBespokeToCart = function () {
    const selectedBase = document.querySelector('input[name="base"]:checked');
    const baseName = selectedBase ? selectedBase.value : 'Tahitian Vanilla';
    const priceText = document.getElementById('bespoke-price')?.textContent.replace('$', '') || '25.00';
    const price = parseFloat(priceText);

    // Collect topping names
    const toppings = Array.from(document.querySelectorAll('input[name="topping"]:checked')).map(t => t.value).join(', ');
    const desc = `${baseName} infused with ${toppings || 'Handcrafted finish'}`;

    window.addToOrder(
      'Bespoke Creation: ' + baseName,
      price,
      desc,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdXZlN3I8bo6zAMZuVKhq1ldTAF9fWnB50qHbhl7ggC6BPQmvIZgWI-Rbr5aXMUy70FfmwnGHO8l0rXHuEsSh1KoN6Lae6aRGfOQPGMwH14U69b7Ydo_UmW3xPFjdvQpS0fC2qvU4NiW9zfr-fndpLIubmHeC-Xy1tgNYyH9uxdIwIxbK9QPJOncygW0d4oolMvyMuFQT79dUVHFaH233SL9m4I2kImnj2Fcm_A2uWxvR-HH-TOESNSQ'
    );
  };

  // =========================================================================
  // 7. CATALOG VAULT CATEGORY FILTER ENGINE
  // =========================================================================
  window.filterCreations = function (category, clickedBtn) {
    const items = document.querySelectorAll('.creation-item');
    const buttons = document.querySelectorAll('.catalog-filter-btn');

    // Update active button styling
    buttons.forEach(btn => {
      btn.className = 'catalog-filter-btn px-4 py-2 rounded-full text-on-surface-variant hover:text-primary font-sans text-xs font-medium transition-all';
    });
    if (clickedBtn) {
      clickedBtn.className = 'catalog-filter-btn px-4 py-2 rounded-full bg-primary text-on-primary font-sans text-xs font-bold shadow-md transition-all';
    }

    // Filter cards
    items.forEach(item => {
      const itemCat = item.getAttribute('data-category');
      if (category === 'all' || itemCat === category) {
        item.style.display = 'flex';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 10);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 200);
      }
    });
  };

  // =========================================================================
  // 8. TOAST NOTIFICATION & NEWSLETTER
  // =========================================================================
  let toastTimeout = null;
  function showToast(message) {
    const toast = document.getElementById('luxury-toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-8', 'pointer-events-none');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3200);
  }

  window.handleNewsletter = function (e) {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    if (input) {
      input.value = '';
      showToast('✦ Bienvenue! Invitation registered for our VIP Degustation circle.');
    }
  };

  // =========================================================================
  // 9. MOBILE NAVIGATION DRAWER & SCROLL SPY
  // =========================================================================
  window.toggleMobileMenu = function () {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const icon = document.getElementById('mobile-menu-icon');
    if (!drawer) return;
    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
      drawer.classList.remove('hidden');
      drawer.classList.add('flex');
      if (backdrop) backdrop.classList.remove('hidden');
      if (icon) icon.textContent = 'close';
    } else {
      drawer.classList.add('hidden');
      drawer.classList.remove('flex');
      if (backdrop) backdrop.classList.add('hidden');
      if (icon) icon.textContent = 'menu';
    }
  };

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', window.toggleMobileMenu);
  }

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const drawer = document.getElementById('mobile-nav-drawer');
      const backdrop = document.getElementById('mobile-nav-backdrop');
      const icon = document.getElementById('mobile-menu-icon');
      if (drawer) {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
      }
      if (backdrop) backdrop.classList.add('hidden');
      if (icon) icon.textContent = 'menu';
    });
  });

  // Mobile Audio Ambiance Toggle Sync
  const mobileAudioBtn = document.getElementById('mobile-audio-toggle');
  const mobileAudioLabel = document.getElementById('mobile-audio-label');
  if (mobileAudioBtn) {
    mobileAudioBtn.addEventListener('click', () => {
      const mainAudioToggle = document.getElementById('audio-toggle');
      if (mainAudioToggle) mainAudioToggle.click();
      if (mobileAudioLabel) {
        mobileAudioLabel.textContent = isAudioActive ? 'Sound: On' : 'Sound: Off';
      }
    });
  }

  // Smooth Active Nav Scroll Spy & Scrolled Navbar Elevation
  const mainHeader = document.getElementById('main-header');
  const sections = document.querySelectorAll('section[id], div[id="scroll-experience"]');
  const navLinks = document.querySelectorAll('#nav-menu a');

  window.addEventListener('scroll', () => {
    if (mainHeader) {
      if (window.scrollY > 40) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    }

    let current = '';
    const scrollPosition = window.scrollY + 160;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === current) {
        link.className = 'nav-link text-xs font-semibold uppercase tracking-wider py-2 px-3 xl:px-3.5 rounded-full text-primary bg-surface-container-high font-bold transition-all';
      } else {
        link.className = 'nav-link text-xs font-semibold uppercase tracking-wider py-2 px-3 xl:px-3.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all';
      }
    });
  }, { passive: true });

  // =========================================================================
  // 10. SYSTEM INITIALIZATION
  // =========================================================================
  initFramePreloader();
  resizeCanvas();
  calculateScrollTarget();
  animationLoop();
  renderCart();
  window.calculateBespokeTotal();
})();
