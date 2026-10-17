# 🍫 CREMORIVA — Haute Glacerie & Molecular Confiserie

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRitesh492008%2FCREMORIVA)
![License: ISC](https://img.shields.io/badge/License-ISC-amber.svg)
![Node: >=18](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen.svg)
![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-gold.svg)

> **Where avant-garde cryo-churning meets centuries of French master chocolaterie.**  
> An ultra-luxury interactive digital showcase featuring 297-frame 60fps scroll scrubbing, generative Web Audio ambient synthesis, the AURA AI Sommelier pairing engine, a bespoke atelier configurator, and an interactive sub-zero cryogenic checkout system.

---

## ✨ Features

- **297-Frame Fluid Scroll Scrubber**: High-frequency canvas renderer displaying fluid chocolate and cream cascades synchronised to scroll velocity with adaptive prefetching and nearest-neighbor frame interpolation for zero-flicker performance.
- **Web Audio Generative Ambiance**: Synthesizer creating a velvety sonic background using multi-oscillator pink noise, resonant lowpass filters, and warm harmonic hums.
- **AURA AI Sommelier**: Interactive pairing recommendation engine matching mood, notes, and occasion to bespoke degustation flights.
- **Bespoke Atelier Configurator**: Interactive customizer allowing real-time adjustment of chocolate bases, cryo-infusions (-196°C freeze-dried botanicals, 24K gold flakes), and velvet temperature controls.
- **Haute Cart & Cryogenic Dispatch**: Floating luxury cart system with live pricing calculation and sub-zero dispatch confirmation modal.
- **100% Responsive & Dark-Mode Optimized**: Handcrafted with luxury palette tokens (warm bronze, molten gold, obsidian cream).

---

## 🚀 One-Click Deploy on Vercel

You can deploy this project to [Vercel](https://vercel.com/) with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRitesh492008%2FCREMORIVA)

### Manual Deployment via Vercel Dashboard

1. Push or import this repository: [https://github.com/Ritesh492008/CREMORIVA](https://github.com/Ritesh492008/CREMORIVA)
2. In the [Vercel Dashboard](https://vercel.com/new), select **Add New Project** and import `CREMORIVA`.
3. In **Build and Output Settings**:
   - **Framework Preset**: `Other` (or auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `./` (or leave empty)
4. Click **Deploy**. Vercel will deploy the site to its ultra-fast global Edge CDN in seconds!

### Deployment via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy directly from project folder
vercel
```

---

## ⚡ Edge Performance & Caching Configuration

This repository includes a production-tuned [`vercel.json`](./vercel.json):
- **Asset Rewrites**: Seamless resolution between `./background-animation.agignore/` and `./background-animation/` paths.
- **CDN Immutable Caching**: 297 animation frames are cached on Vercel's global CDN with `Cache-Control: public, max-age=31536000, immutable`, guaranteeing instantaneous, lag-free scrub animations on every visit.
- **Clean URLs**: Clean routing with no trailing slash clutter.

---

## 💻 Local Development

Run the local Node development server with native MIME-type streaming and caching headers:

```bash
# Clone the repository
git clone https://github.com/Ritesh492008/CREMORIVA.git
cd CREMORIVA

# Start local server
npm run dev
# or
npm start
```

Open your browser at `http://localhost:3000` to experience the degustation.

---

## 📁 Repository Structure

```
CREMORIVA/
├── index.html                     # Primary Haute Experience & Master Canvas Stage
├── code.html                      # Standalone degustation template
├── style.css                      # Master luxury stylesheet, animations & tokens
├── script.js                      # Core engine: 297-frame scrubber, audio synth, cart
├── server.js                      # Lightweight local development server
├── vercel.json                    # Vercel deployment, edge caching & route rewrites
├── package.json                   # Project metadata & Vercel build scripts
├── DESIGN.md                      # Haute Patisserie design system tokens & specs
├── LICENSE                        # ISC License
├── .gitignore                     # Git ignore rules for node, vercel & OS artifacts
└── background-animation.agignore/ # 297 ultra-high-definition sequence frames (001-297)
```

---

## 📜 License

This project is licensed under the [ISC License](./LICENSE).  
Crafted with passion for **CREMORIVA**.
