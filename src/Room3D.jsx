import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { T, ROLES, RECOMMENDATIONS, BUILD_TILES, STATS } from "./cvData";

const HOBBIES = [
  { emoji: "⚽", label: "Football", text: "Lifelong Crystal Palace fan. Yes, I know. No, I can't explain it either. Season ticket holder. The highs are rare but they're worth it." },
  { emoji: "🏃", label: "Running", text: "5k most mornings around Brockwell Park. Slow but consistent. It's the best way to start the day and I'm genuinely unbearable without it." },
  { emoji: "🍳", label: "Cooking", text: "I make everything from scratch. Current obsession is getting the perfect crispy chilli oil. My mates say I should start a food account. I won't." },
  { emoji: "🐶", label: "Mabel", text: "One-year-old cockapoo. Joins me on my 5k runs. She's the real influencer in the house. Yes, that's her following you around this room. She does that." },
  { emoji: "📚", label: "Reading", text: "Mostly non-fiction. Thinking Fast and Slow changed how I interview. Currently enjoying Robot-Proof Recruiter, highly recommend." },
  { emoji: "✈️", label: "Travel", text: "Spent 3 months in Southeast Asia between jobs. Best decision I ever made. Worst sunburn I ever got. Both in Thailand." },
];
const VALUES = [
  { emoji: "💬", label: "Honesty over polish", text: "I'd rather someone tell me I'm wrong than agree with me to be polite. Directness builds trust faster than anything." },
  { emoji: "💪", label: "Doing the work", text: "I'll always be the person who actually followed up. Consistency and reliability compound over time." },
  { emoji: "🌟", label: "Generosity", text: "I share what I know, help where I can, and trust that it comes back around. Karma compounds." },
];
const EDUCATION = [
  { title: "BA (Hons) Business Management", sub: "University of Leeds · 2:1" },
  { title: "First Certified", sub: "CV Sifting Process Enhancement" },
  { title: "LinkedIn Certified", sub: "Recruiter Certification" },
];

/* ---------- canvas texture helpers ---------- */
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function makeTexture(w, h, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
function paintPanelBase(ctx, w, h, accent) {
  ctx.fillStyle = "#FFFEFB";
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, accent + "14");
  grad.addColorStop(0.5, "#FFFFFF00");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, w, 14);
}
function drawPills(ctx, pills, x, y, accent) {
  ctx.font = `600 26px ${FONT}`;
  let px = x;
  for (const p of pills) {
    const tw = ctx.measureText(p).width;
    roundRect(ctx, px, y, tw + 36, 48, 12);
    ctx.fillStyle = accent + "16";
    ctx.fill();
    ctx.strokeStyle = accent + "44";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.fillText(p, px + 18, y + 33);
    px += tw + 52;
  }
}
function rolePanelTexture(role) {
  return makeTexture(1024, 704, (ctx, w, h) => {
    paintPanelBase(ctx, w, h, role.color);
    ctx.fillStyle = "#9C9590";
    ctx.font = `700 24px ${FONT}`;
    ctx.fillText(role.period.toUpperCase() + "  ·  " + role.type.toUpperCase(), 48, 70);
    ctx.fillStyle = "#2D2B28";
    ctx.font = `800 52px ${FONT}`;
    wrapText(ctx, role.title, w - 96).forEach((l, i) => ctx.fillText(l, 48, 135 + i * 58));
    ctx.fillStyle = role.color;
    ctx.font = `800 44px ${FONT}`;
    ctx.fillText("@ " + role.company, 48, 205);
    drawPills(ctx, role.companyPills, 48, 240, role.color);
    ctx.fillStyle = "#6B6560";
    ctx.font = `400 30px ${FONT}`;
    wrapText(ctx, role.roleContext, w - 96).slice(0, 8).forEach((l, i) => ctx.fillText(l, 48, 360 + i * 40));
    ctx.fillStyle = "#C4704B";
    ctx.font = `700 24px ${FONT}`;
    ctx.fillText("WALK UP + CLICK FOR ACHIEVEMENTS", 48, h - 36);
  });
}
function projectPanelTexture(build) {
  return makeTexture(1024, 768, (ctx, w, h) => {
    paintPanelBase(ctx, w, h, build.color);
    ctx.font = "120px serif";
    ctx.fillText(build.icon, 48, 175);
    ctx.fillStyle = build.color;
    ctx.font = `700 26px ${FONT}`;
    ctx.fillText(build.type.toUpperCase(), 48, 235);
    ctx.fillStyle = "#2D2B28";
    ctx.font = `800 54px ${FONT}`;
    wrapText(ctx, build.title, w - 96).forEach((l, i) => ctx.fillText(l, 48, 310 + i * 62));
    ctx.fillStyle = "#6B6560";
    ctx.font = `400 32px ${FONT}`;
    wrapText(ctx, build.desc, w - 96).slice(0, 7).forEach((l, i) => ctx.fillText(l, 48, 440 + i * 44));
    ctx.fillStyle = "#C4704B";
    ctx.font = `700 24px ${FONT}`;
    ctx.fillText("CLICK TO OPEN", 48, h - 36);
  });
}
function tilePanelTexture(tile, accent) {
  return makeTexture(1024, 512, (ctx, w, h) => {
    paintPanelBase(ctx, w, h, accent);
    ctx.font = "90px serif";
    ctx.fillText(tile.emoji, 48, 140);
    ctx.fillStyle = accent;
    ctx.font = `800 44px ${FONT}`;
    ctx.fillText(tile.label, 175, 125);
    ctx.fillStyle = "#6B6560";
    ctx.font = `400 32px ${FONT}`;
    wrapText(ctx, tile.text, w - 96).slice(0, 7).forEach((l, i) => ctx.fillText(l, 48, 220 + i * 44));
  });
}
function recPanelTexture(rec) {
  return makeTexture(1024, 704, (ctx, w, h) => {
    paintPanelBase(ctx, w, h, "#C4704B");
    ctx.fillStyle = "#C4704B22";
    ctx.font = "200px Georgia, serif";
    ctx.fillText("“", w - 170, 190);
    ctx.fillStyle = "#4A4642";
    ctx.font = `italic 400 34px ${FONT}`;
    wrapText(ctx, "“" + rec.text + "”", w - 110).slice(0, 9).forEach((l, i) => ctx.fillText(l, 55, 130 + i * 48));
    ctx.fillStyle = "#2D2B28";
    ctx.font = `800 38px ${FONT}`;
    ctx.fillText(rec.name, 55, h - 120);
    ctx.fillStyle = "#9C9590";
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText(rec.role + "  ·  " + rec.relation, 55, h - 70);
  });
}
function welcomePanelTexture() {
  return makeTexture(1400, 880, (ctx, w, h) => {
    paintPanelBase(ctx, w, h, "#C4704B");
    ctx.fillStyle = "#C4704B";
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText("WELCOME TO THE CV ROOM", 60, 90);
    ctx.fillStyle = "#2D2B28";
    ctx.font = `800 96px ${FONT}`;
    ctx.fillText("Phil Role", 60, 200);
    ctx.fillStyle = "#C4704B";
    ctx.font = `800 52px ${FONT}`;
    ctx.fillText("Head of Talent Acquisition", 60, 275);
    ctx.fillStyle = "#6B6560";
    ctx.font = `400 34px ${FONT}`;
    const summary = "8 years in recruitment. Agency, embedded RPO, then in-house at a £4.5bn fintech hiring 95 engineers with zero agency spend. Now first non-technical hire at an AI recruitment start-up. Promoted at every company.";
    wrapText(ctx, summary, w - 120).forEach((l, i) => ctx.fillText(l, 60, 360 + i * 48));
    ctx.fillStyle = "#2D2B28";
    ctx.font = `700 34px ${FONT}`;
    wrapText(ctx, "Looking for my next role as first or early TA hire at a Series A/B company.", w - 120).forEach((l, i) => ctx.fillText(l, 60, 620 + i * 46));
    ctx.fillStyle = "#9C9590";
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText("Career wall ahead · Projects right · Personal life left · Press P for party mode", 60, h - 60);
  });
}
function statPanelTexture(stat) {
  return makeTexture(512, 512, (ctx, w, h) => {
    paintPanelBase(ctx, w, h, "#C4704B");
    ctx.fillStyle = "#C4704B";
    ctx.textAlign = "center";
    const valText = stat.isText ? stat.value : `${stat.prefix || ""}${stat.value}${stat.suffix || ""}`;
    ctx.font = `800 ${stat.isText ? 72 : 130}px ${FONT}`;
    ctx.fillText(valText, w / 2, h / 2 + (stat.isText ? 20 : 40));
    ctx.fillStyle = "#9C9590";
    ctx.font = `700 34px ${FONT}`;
    wrapText(ctx, stat.label.toUpperCase(), w - 60).forEach((l, i) => ctx.fillText(l, w / 2, h - 110 + i * 42));
  });
}
function sectionSignTexture(text) {
  return makeTexture(1024, 160, (ctx, w, h) => {
    ctx.fillStyle = "#22201D";
    roundRect(ctx, 0, 0, w, h, 24);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.shadowColor = "#FF9E66";
    ctx.shadowBlur = 34;
    ctx.fillStyle = "#FFD9BC";
    ctx.font = `800 64px ${FONT}`;
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 24);
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 24); // double pass = stronger glow
    ctx.shadowBlur = 0;
  });
}
function matTexture() {
  return makeTexture(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#B08968";
    roundRect(ctx, 0, 0, w, h, 40);
    ctx.fill();
    ctx.strokeStyle = "#8B6B4F";
    ctx.lineWidth = 14;
    roundRect(ctx, 24, 24, w - 48, h - 48, 28);
    ctx.stroke();
    ctx.fillStyle = "#3D2E20";
    ctx.textAlign = "center";
    ctx.font = `800 52px ${FONT}`;
    ctx.fillText("Built by a recruiter, for recruiters,", w / 2, h / 2 - 20);
    ctx.fillText("because we deserve better than a Word doc.", w / 2, h / 2 + 50);
  });
}
function footballTexture() {
  return makeTexture(256, 256, (ctx, w, h) => {
    // Crystal Palace stripes
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    const stripe = w / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#C4122E" : "#1B458F";
      ctx.fillRect(i * stripe, 0, stripe * 0.55, h);
    }
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < 5; i++) ctx.fillRect(0, (i * h) / 5, w, 3);
  });
}
function marqueeTexture() {
  return makeTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = "#12002A";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.shadowColor = "#C77DFF";
    ctx.shadowBlur = 26;
    ctx.fillStyle = "#F3D9FF";
    ctx.font = `800 56px ${FONT}`;
    ctx.fillText("👾 CV INVADERS", w / 2, h / 2 + 20);
    ctx.fillText("👾 CV INVADERS", w / 2, h / 2 + 20);
  });
}

/* ---------- tiny synth sound kit (no assets) ---------- */
function makeAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.4;
  master.connect(ctx.destination);
  const env = (node, t0, peak, dur) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    node.connect(g).connect(master);
    return g;
  };
  return {
    ctx,
    setMuted(m) { master.gain.value = m ? 0 : 0.4; },
    blip(freq = 880) {
      const t0 = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, t0);
      o.frequency.exponentialRampToValueAtTime(freq * 1.5, t0 + 0.08);
      env(o, t0, 0.25, 0.14);
      o.start(t0); o.stop(t0 + 0.16);
    },
    thump() {
      const t0 = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(150, t0);
      o.frequency.exponentialRampToValueAtTime(40, t0 + 0.16);
      env(o, t0, 0.6, 0.18);
      o.start(t0); o.stop(t0 + 0.2);
    },
    whoosh() {
      const t0 = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(90, t0);
      o.frequency.exponentialRampToValueAtTime(500, t0 + 0.5);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 600;
      o.connect(f);
      env(f, t0, 0.12, 0.55);
      o.start(t0); o.stop(t0 + 0.6);
    },
    hat() {
      const t0 = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = 6000;
      env(o, t0, 0.05, 0.05);
      o.start(t0); o.stop(t0 + 0.06);
    },
  };
}

/* ---------- scene construction ---------- */
const ROOM = { w: 22, d: 14, h: 4.2 };

function addFramedPanel(scene, clickables, { texture, width, height, position, rotationY, data }) {
  const group = new THREE.Group();
  const frameDepth = 0.06;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.14, height + 0.14, frameDepth),
    new THREE.MeshStandardMaterial({ color: 0x8b6b4f, roughness: 0.6 })
  );
  const panelMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 });
  if (data) {
    panelMat.emissive = new THREE.Color(0xffffff);
    panelMat.emissiveMap = texture;
    panelMat.emissiveIntensity = 0;
  }
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), panelMat);
  panel.position.z = frameDepth / 2 + 0.002;
  group.add(frame, panel);
  group.position.copy(position);
  group.rotation.y = rotationY;
  scene.add(group);
  if (data) {
    panel.userData = data;
    frame.userData = data;
    clickables.push(panel, frame);
    data._group = group;
    data._mat = panelMat;
  }
  return group;
}

function buildMabel() {
  const dog = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.95 });
  const darkFur = new THREE.MeshStandardMaterial({ color: 0xb9834e, roughness: 0.95 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), fur);
  body.scale.set(1.45, 1, 1);
  body.position.y = 0.34;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), fur);
  head.position.set(0.38, 0.58, 0);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), darkFur);
  snout.position.set(0.52, 0.53, 0);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), black);
  nose.position.set(0.6, 0.54, 0);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), darkFur);
  earL.scale.set(0.7, 1.5, 0.5);
  earL.position.set(0.33, 0.56, 0.15);
  const earR = earL.clone();
  earR.position.z = -0.15;
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), black);
  eyeL.position.set(0.5, 0.63, 0.07);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.07;
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), darkFur);
  tail.scale.set(2.2, 0.8, 0.8);
  tail.position.set(-0.4, 0.46, 0);
  tail.rotation.z = 0.5;
  const legGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.24, 10);
  [[0.22, 0.1], [0.22, -0.1], [-0.22, 0.1], [-0.22, -0.1]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, darkFur);
    leg.position.set(lx, 0.12, lz);
    dog.add(leg);
  });
  dog.add(body, head, snout, nose, earL, earR, eyeL, eyeR, tail);
  dog.position.set(-8, 0, 3.5);
  return { dog, tail };
}

function buildArcade(scene, clickables, screenState) {
  const cab = new THREE.Group();
  const purple = new THREE.MeshStandardMaterial({ color: 0x2a1245, roughness: 0.5, metalness: 0.2 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x160a26, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.9), purple);
  body.position.y = 0.9;
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.95), dark);
  top.position.y = 2.05;
  const marquee = new THREE.Mesh(
    new THREE.PlaneGeometry(1.04, 0.26),
    new THREE.MeshBasicMaterial({ map: marqueeTexture() })
  );
  marquee.position.set(0, 2.08, 0.48);
  // animated screen
  const sCanvas = document.createElement("canvas");
  sCanvas.width = 256; sCanvas.height = 256;
  screenState.ctx = sCanvas.getContext("2d");
  screenState.tex = new THREE.CanvasTexture(sCanvas);
  screenState.tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 0.72),
    new THREE.MeshBasicMaterial({ map: screenState.tex })
  );
  screen.position.set(0, 1.5, 0.46);
  screen.rotation.x = -0.12;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.42), dark);
  deck.position.set(0, 1.02, 0.55);
  const stick = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc4122e, roughness: 0.3 }));
  stick.position.set(-0.2, 1.14, 0.55);
  cab.add(body, top, marquee, screen, deck, stick);
  cab.position.set(9.6, 0, 5.7);
  cab.rotation.y = -Math.PI * 0.72;
  scene.add(cab);
  const invaders = BUILD_TILES.find((b) => b.title === "CV Invaders");
  const data = { kind: "project", build: invaders, _group: cab, _mat: null };
  [body, top, marquee, screen, deck].forEach((m) => { m.userData = data; clickables.push(m); });
  return cab;
}

function drawArcadeFrame(s, t) {
  const { ctx } = s;
  const W = 256, H = 256;
  ctx.fillStyle = "#04010c";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#8bffb0";
  ctx.font = "700 14px monospace";
  ctx.fillText("AGENCY 0   IN-HOUSE ∞", 24, 22);
  const step = Math.floor(t * 1.6);
  const offX = (step % 8) < 4 ? (step % 4) * 8 : (3 - (step % 4)) * 8;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      ctx.fillStyle = ["#c77dff", "#8bffb0", "#ffd166"][r];
      const x = 34 + c * 32 + offX, y = 48 + r * 30 + ((step >> 3) % 2) * 4;
      ctx.fillRect(x, y, 18, 12);
      ctx.fillRect(x - 4, y + 4, 4, 4);
      ctx.fillRect(x + 18, y + 4, 4, 4);
    }
  }
  const shipX = 118 + Math.sin(t * 1.3) * 80;
  ctx.fillStyle = "#ff5f5f";
  ctx.fillRect(shipX, 220, 24, 10);
  ctx.fillRect(shipX + 9, 212, 6, 8);
  if ((step % 6) < 2) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(shipX + 11, 130, 2, 82);
  }
  s.tex.needsUpdate = true;
}

function buildScene(scene, clickables) {
  scene.background = new THREE.Color(0xe8e4de);
  scene.fog = new THREE.Fog(0xe8e4de, 18, 40);
  const datas = [];
  const dots = [];
  const reg = (data, x, z, color) => { datas.push(data); dots.push({ x, z, color }); };

  // floor — glossy wood
  const floorTex = makeTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#C9B591";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#B39F7B";
    ctx.lineWidth = 4;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(0, (i * h) / 8); ctx.lineTo(w, (i * h) / 8); ctx.stroke();
    }
    ctx.strokeStyle = "#BFAA85";
    for (let i = 0; i < 8; i++) {
      const off = (i % 2) * (w / 4);
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.moveTo(((j * w) / 2 + off) % w, (i * h) / 8);
        ctx.lineTo(((j * w) / 2 + off) % w, ((i + 1) * h) / 8);
        ctx.stroke();
      }
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(8, 5);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.w, ROOM.d),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.35, metalness: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshStandardMaterial({ color: 0xdccbb4, roughness: 1 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, 0);
  scene.add(rug);

  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.7),
    new THREE.MeshStandardMaterial({ map: matTexture(), roughness: 1, transparent: true })
  );
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(0, 0.02, 4.6);
  scene.add(mat);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.w, ROOM.d),
    new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 1 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.h;
  scene.add(ceiling);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f2, roughness: 0.95 });
  const mkWall = (w, x, z, ry) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, ROOM.h), wallMat);
    wall.position.set(x, ROOM.h / 2, z);
    wall.rotation.y = ry;
    scene.add(wall);
  };
  mkWall(ROOM.w, 0, -ROOM.d / 2, 0);
  mkWall(ROOM.w, 0, ROOM.d / 2, Math.PI);
  mkWall(ROOM.d, ROOM.w / 2, 0, -Math.PI / 2);
  mkWall(ROOM.d, -ROOM.w / 2, 0, Math.PI / 2);

  const skirtMat = new THREE.MeshStandardMaterial({ color: 0x8b6b4f, roughness: 0.7 });
  [
    [ROOM.w, 0, -ROOM.d / 2 + 0.03, 0],
    [ROOM.w, 0, ROOM.d / 2 - 0.03, 0],
    [ROOM.d, ROOM.w / 2 - 0.03, 0, Math.PI / 2],
    [ROOM.d, -ROOM.w / 2 + 0.03, 0, Math.PI / 2],
  ].forEach(([len, x, z, ry]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.05), skirtMat);
    s.position.set(x, 0.09, z);
    s.rotation.y = ry;
    scene.add(s);
  });

  // lights (returned so party mode can recolor them)
  scene.add(new THREE.AmbientLight(0xfff4e6, 0.55));
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xc9b591, 0.3));
  const partyLights = [];
  [-6.5, 0, 6.5].forEach((x) => {
    const p = new THREE.PointLight(0xffe9d0, 22, 18, 1.8);
    p.position.set(x, ROOM.h - 0.4, 0);
    scene.add(p);
    partyLights.push(p);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff2dd })
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, ROOM.h - 0.01, 0);
    scene.add(disc);
  });

  // neon section signs
  addFramedPanel(scene, clickables, { texture: sectionSignTexture("My Career"), width: 4, height: 0.62, position: new THREE.Vector3(0, 3.75, -ROOM.d / 2 + 0.05), rotationY: 0 });
  addFramedPanel(scene, clickables, { texture: sectionSignTexture("My Projects"), width: 4, height: 0.62, position: new THREE.Vector3(ROOM.w / 2 - 0.05, 3.75, 0), rotationY: -Math.PI / 2 });
  addFramedPanel(scene, clickables, { texture: sectionSignTexture("My Personal Life"), width: 4.6, height: 0.62, position: new THREE.Vector3(-ROOM.w / 2 + 0.05, 3.75, 0), rotationY: Math.PI / 2 });

  // career wall (north) + brass picture lights
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe3ba });
  ROLES.forEach((role, i) => {
    const x = -8.1 + i * 5.4;
    const data = { kind: "role", role };
    addFramedPanel(scene, clickables, {
      texture: rolePanelTexture(role),
      width: 3.5, height: 2.4,
      position: new THREE.Vector3(x, 2.05, -ROOM.d / 2 + 0.08),
      rotationY: 0,
      data,
    });
    reg(data, x, -ROOM.d / 2, role.color);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.12), lampMat);
    lamp.position.set(x, 3.4, -ROOM.d / 2 + 0.16);
    scene.add(lamp);
  });

  // projects wall (east)
  BUILD_TILES.forEach((build, i) => {
    const z = -5.5 + i * 2.2;
    const data = { kind: "project", build };
    addFramedPanel(scene, clickables, {
      texture: projectPanelTexture(build),
      width: 1.9, height: 1.45,
      position: new THREE.Vector3(ROOM.w / 2 - 0.08, 2.05, z),
      rotationY: -Math.PI / 2,
      data,
    });
    reg(data, ROOM.w / 2, z, build.color);
  });

  // personal wall (west)
  HOBBIES.forEach((tile, i) => {
    const z = -5.5 + i * 2.2;
    const data = { kind: "tile", tile, heading: "When I'm not recruiting" };
    addFramedPanel(scene, clickables, {
      texture: tilePanelTexture(tile, "#5B8C6A"),
      width: 1.9, height: 0.95,
      position: new THREE.Vector3(-ROOM.w / 2 + 0.08, 2.6, z),
      rotationY: Math.PI / 2,
      data,
    });
    reg(data, -ROOM.w / 2, z, "#5B8C6A");
  });
  VALUES.forEach((tile, i) => {
    const z = -4.4 + i * 4.4;
    const data = { kind: "tile", tile, heading: "My operating system" };
    addFramedPanel(scene, clickables, {
      texture: tilePanelTexture(tile, "#8B6BAD"),
      width: 2.9, height: 1.45,
      position: new THREE.Vector3(-ROOM.w / 2 + 0.08, 1.35, z),
      rotationY: Math.PI / 2,
      data,
    });
    reg(data, -ROOM.w / 2, z, "#8B6BAD");
  });

  // south wall
  const welcomeData = { kind: "welcome" };
  addFramedPanel(scene, clickables, {
    texture: welcomePanelTexture(),
    width: 4.6, height: 2.9,
    position: new THREE.Vector3(0, 2.15, ROOM.d / 2 - 0.08),
    rotationY: Math.PI,
    data: welcomeData,
  });
  reg(welcomeData, 0, ROOM.d / 2, "#C4704B");
  RECOMMENDATIONS.forEach((rec, i) => {
    const x = i < 2 ? -8.5 + (i % 2) * 2.9 : 5.6 + (i % 2) * 2.9;
    const data = { kind: "rec", rec };
    addFramedPanel(scene, clickables, {
      texture: recPanelTexture(rec),
      width: 2.6, height: 1.8,
      position: new THREE.Vector3(x, 2.05, ROOM.d / 2 - 0.08),
      rotationY: Math.PI,
      data,
    });
    reg(data, x, ROOM.d / 2, "#C4704B");
  });

  // stat pedestals
  const pedestals = [];
  const plaques = [];
  STATS.forEach((stat, i) => {
    const x = -4.8 + i * 3.2;
    const z = -2.2;
    const ped = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.05, 0.72),
      new THREE.MeshStandardMaterial({ color: 0xefe9df, roughness: 0.6, metalness: 0.1 })
    );
    ped.position.set(x, 0.525, z);
    scene.add(ped);
    const data = { kind: "stat", stat };
    const plaqueMat = new THREE.MeshStandardMaterial({ map: statPanelTexture(stat), roughness: 0.7 });
    plaqueMat.emissive = new THREE.Color(0xffffff);
    plaqueMat.emissiveMap = plaqueMat.map;
    plaqueMat.emissiveIntensity = 0;
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.06), plaqueMat);
    plaque.position.set(x, 1.55, z);
    plaque.rotation.x = -0.28;
    plaque.userData = data;
    data._group = plaque;
    data._mat = plaqueMat;
    clickables.push(plaque);
    scene.add(plaque);
    plaques.push(plaque);
    pedestals.push({ x, z, half: 0.55 });
    reg(data, x, z, "#C4704B");
  });
  // arcade cabinet counts as an obstacle
  pedestals.push({ x: 9.6, z: 5.7, half: 0.8 });

  return { pedestals, datas, dots, partyLights, plaques };
}

/* ---------- overlay content ---------- */
function OverlayDetail({ focus, onClose }) {
  if (!focus) return null;
  const card = {
    background: T.bg, borderRadius: 14, maxWidth: 620, width: "100%",
    maxHeight: "82vh", overflowY: "auto", padding: "28px 26px",
    border: `1px solid ${T.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    fontFamily: FONT, color: T.text,
  };
  const closeBtn = (
    <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: T.card, color: T.textLight, fontSize: 18, cursor: "pointer" }}>&times;</button>
  );
  let body = null;
  if (focus.kind === "role") {
    const r = focus.role;
    body = (
      <>
        <div style={{ fontSize: 11, color: T.textLight, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{r.period} &middot; {r.type} &middot; {r.duration}</div>
        <h2 style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 800 }}>{r.title} <span style={{ color: r.color }}>@ {r.company}</span></h2>
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{r.companyDesc}</p>
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65 }}><b style={{ color: T.accent }}>My role: </b>{r.roleContext}</p>
        <h4 style={{ fontSize: 11, color: T.accent, letterSpacing: 1.5, textTransform: "uppercase", margin: "16px 0 8px" }}>Achievements</h4>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {r.highlights.map((h, i) => <li key={i} style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, marginBottom: 6 }}>{h}</li>)}
        </ul>
        {r.progression && <p style={{ fontSize: 13, color: T.textMid, marginTop: 12 }}><b style={{ color: T.text }}>{r.progression.count}x promotion:</b> {r.progression.path}</p>}
        {r.leaving && <p style={{ fontSize: 12, color: T.textLight }}><b style={{ color: T.textMid }}>Reason for leaving:</b> {r.leaving}</p>}
      </>
    );
  } else if (focus.kind === "project") {
    const b = focus.build;
    body = (
      <>
        <div style={{ fontSize: 30, marginBottom: 6 }}>{b.icon}</div>
        <div style={{ fontSize: 11, color: b.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>{b.type}</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800 }}>{b.title}</h2>
        <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>{b.desc}</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "14px 0" }}>
          {b.tags?.map((t) => <span key={t} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, background: b.color + "12", color: b.color, border: `1px solid ${b.color}30` }}>{t}</span>)}
        </div>
        {b.url && <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "10px 22px", borderRadius: 10, background: T.accent, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>{b.linkLabel} &rarr;</a>}
      </>
    );
  } else if (focus.kind === "rec") {
    const r = focus.rec;
    body = (
      <>
        <p style={{ fontSize: 16, color: T.textMid, lineHeight: 1.75, fontStyle: "italic" }}>&ldquo;{r.text}&rdquo;</p>
        <p style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 2px" }}>{r.name}</p>
        <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>{r.role} &middot; {r.relation}</p>
      </>
    );
  } else if (focus.kind === "tile") {
    const t2 = focus.tile;
    body = (
      <>
        <div style={{ fontSize: 11, color: T.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>{focus.heading}</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800 }}>{t2.emoji} {t2.label}</h2>
        <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>{t2.text}</p>
      </>
    );
  } else if (focus.kind === "stat") {
    const s = focus.stat;
    body = (
      <>
        <div style={{ fontSize: 11, color: T.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>By the numbers</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 42, fontWeight: 800, color: T.accent }}>{s.isText ? s.value : `${s.prefix || ""}${s.value}${s.suffix || ""}`}</h2>
        <p style={{ fontSize: 14, color: T.textMid, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</p>
      </>
    );
  } else if (focus.kind === "welcome") {
    body = (
      <>
        <h2 style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 800 }}>Phil Role</h2>
        <p style={{ fontSize: 15, color: T.accent, fontWeight: 700, margin: "0 0 12px" }}>Head of Talent Acquisition</p>
        <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7 }}>
          8 years in recruitment. Started in high-volume agency, moved into embedded RPO across VC-backed startups, then went in-house at a &pound;4.5bn fintech hiring 95 engineers with zero agency spend. Now at an early-stage AI recruitment start-up as the first non-technical hire. Promoted at every company.
        </p>
        <p style={{ fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.7 }}>Looking for my next role as first or early TA hire at a Series A/B company.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, margin: "14px 0" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "10px 6px", background: T.card, borderRadius: 10, border: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.accent }}>{s.isText ? s.value : `${s.prefix || ""}${s.value}${s.suffix || ""}`}</div>
              <div style={{ fontSize: 9, color: T.textLight, textTransform: "uppercase", letterSpacing: 0.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <h4 style={{ fontSize: 11, color: T.accent, letterSpacing: 1.5, textTransform: "uppercase", margin: "8px 0" }}>Education</h4>
        {EDUCATION.map((e) => (
          <p key={e.title} style={{ fontSize: 13, color: T.textMid, margin: "4px 0" }}><b style={{ color: T.text }}>{e.title}</b> &middot; {e.sub}</p>
        ))}
      </>
    );
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,15,10,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ ...card, position: "relative" }} onClick={(e) => e.stopPropagation()}>
        {closeBtn}
        {body}
        <p style={{ fontSize: 11, color: T.textFaint, marginTop: 18, marginBottom: 0 }}>Close to keep exploring the room</p>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function Room3D() {
  const mountRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [focus, setFocus] = useState(null);
  const [hoverLabel, setHoverLabel] = useState("");
  const [party, setParty] = useState(false);
  const [muted, setMuted] = useState(false);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const stateRef = useRef({});
  const joyRef = useRef(null);
  const fadeRef = useRef(null);
  const minimapRef = useRef(null);
  const audioRef = useRef(null);

  stateRef.current.focus = focus;
  stateRef.current.started = started;
  stateRef.current.paused = paused;
  stateRef.current.party = party;
  stateRef.current.muted = muted;

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35; // subtle PBR sheen only — the room has its own lights

    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.05, 100);
    camera.rotation.order = "YXZ";
    camera.position.set(0, 1.62, 5.6);

    const clickables = [];
    const { pedestals, datas, dots, partyLights, plaques } = buildScene(scene, clickables);

    // ---- Mabel ----
    const { dog, tail } = buildMabel();
    scene.add(dog);
    const mabelTile = HOBBIES.find((h) => h.label === "Mabel");
    const mabelData = { kind: "tile", tile: mabelTile, heading: "When I'm not recruiting", _group: null, _mat: null };
    dog.traverse((o) => { if (o.isMesh) { o.userData = mabelData; clickables.push(o); } });
    datas.push(mabelData);
    let dogYaw = 0;

    // ---- football ----
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 18),
      new THREE.MeshStandardMaterial({ map: footballTexture(), roughness: 0.4 })
    );
    ball.position.set(6, 0.22, 3.5);
    scene.add(ball);
    const ballVel = new THREE.Vector3();

    // ---- arcade cabinet ----
    const screenState = {};
    buildArcade(scene, clickables, screenState);
    let lastArcade = 0;

    // ---- hologram (First logo, rounded corners via canvas) ----
    const holo = new THREE.Group();
    {
      const img = new Image();
      img.src = import.meta.env.BASE_URL + "first-logo.png";
      img.onload = () => {
        const tex = makeTexture(512, 512, (ctx, w, h) => {
          roundRect(ctx, 0, 0, w, h, 90);
          ctx.clip();
          ctx.drawImage(img, 0, 0, w, h);
        });
        const logo = new THREE.Mesh(
          new THREE.PlaneGeometry(1.3, 1.3),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        holo.add(logo);
      };
    }
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.02, 10, 60),
      new THREE.MeshBasicMaterial({ color: 0xc4704b })
    );
    ring1.rotation.x = Math.PI / 2;
    const ring2 = ring1.clone();
    ring2.scale.setScalar(1.18);
    ring2.rotation.x = Math.PI / 2.6;
    holo.add(ring1, ring2);
    holo.position.set(0, 2.7, 0);
    scene.add(holo);

    // ---- dust motes ----
    const dustCount = 250;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * ROOM.w;
      dustPos[i * 3 + 1] = Math.random() * ROOM.h;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * ROOM.d;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xffe9c9, size: 0.035, transparent: true, opacity: 0.4, depthWrite: false,
    }));
    scene.add(dust);

    // ---- confetti ----
    const confCount = 400;
    const confPos = new Float32Array(confCount * 3);
    const confVel = new Float32Array(confCount);
    const confCol = new Float32Array(confCount * 3);
    const palette = [new THREE.Color(0xc4704b), new THREE.Color(0x5b8c6a), new THREE.Color(0x5b7fa6), new THREE.Color(0x8b6bad), new THREE.Color(0xffd166)];
    const seedConf = (i) => {
      confPos[i * 3] = (Math.random() - 0.5) * (ROOM.w - 2);
      confPos[i * 3 + 1] = ROOM.h - 0.2 + Math.random() * 1.5;
      confPos[i * 3 + 2] = (Math.random() - 0.5) * (ROOM.d - 2);
      confVel[i] = 0.6 + Math.random() * 1.1;
      const c = palette[(Math.random() * palette.length) | 0];
      confCol[i * 3] = c.r; confCol[i * 3 + 1] = c.g; confCol[i * 3 + 2] = c.b;
    };
    for (let i = 0; i < confCount; i++) { seedConf(i); confPos[i * 3 + 1] = -1; }
    const confGeo = new THREE.BufferGeometry();
    confGeo.setAttribute("position", new THREE.BufferAttribute(confPos, 3));
    confGeo.setAttribute("color", new THREE.BufferAttribute(confCol, 3));
    const confetti = new THREE.Points(confGeo, new THREE.PointsMaterial({
      size: 0.07, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false,
    }));
    confetti.visible = false;
    scene.add(confetti);
    let confettiActive = false;
    const burstConfetti = () => {
      for (let i = 0; i < confCount; i++) seedConf(i);
      confetti.visible = true;
      confettiActive = true;
    };
    stateRef.current.burst = burstConfetti;

    const keys = {};
    let yaw = 0, pitch = 0; // yaw 0 faces the career wall across the room
    const move = { joyX: 0, joyY: 0 };
    const raycaster = new THREE.Raycaster();
    const center = new THREE.Vector2(0, 0);
    let lastHover = "";
    let hoveredData = null;
    let introT = 1; // 0..1, <1 = fly-in cinematic playing
    stateRef.current.startIntro = () => { introT = 0; };

    const onKey = (e, down) => {
      keys[e.code] = down;
      if (down && (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "Space")) e.preventDefault();
      if (down && e.code === "KeyP" && stateRef.current.started) {
        setParty((p) => {
          if (!p) { burstConfetti(); audioRef.current?.whoosh(); }
          return !p;
        });
      }
      if (down && e.code === "KeyM") setMuted((m) => !m);
      if (down && e.code === "Escape" && stateRef.current.focus) setFocus(null);
    };
    const kd = (e) => onKey(e, true);
    const ku = (e) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const onMouseMove = (e) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      // Chrome fires a bogus giant delta on the first event after locking — drop it
      if (Math.abs(e.movementX) > 200 || Math.abs(e.movementY) > 200) return;
      yaw -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;
      pitch = Math.max(-1.35, Math.min(1.35, pitch));
    };
    document.addEventListener("mousemove", onMouseMove);
    const onLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      if (!locked && stateRef.current.started && !stateRef.current.focus && !isTouch) setPaused(true);
      if (locked) setPaused(false);
    };
    document.addEventListener("pointerlockchange", onLockChange);

    let lookTouch = null, joyTouch = null, joyOrigin = null;
    const joyEl = joyRef.current;
    const onTouchStart = (e) => {
      for (const t of e.changedTouches) {
        if (joyEl && joyEl.contains(document.elementFromPoint(t.clientX, t.clientY))) {
          joyTouch = t.identifier;
          joyOrigin = { x: t.clientX, y: t.clientY };
        } else if (lookTouch === null) {
          lookTouch = { id: t.identifier, x: t.clientX, y: t.clientY, moved: false };
        }
      }
    };
    const onTouchMove = (e) => {
      for (const t of e.changedTouches) {
        if (joyTouch === t.identifier && joyOrigin) {
          move.joyX = Math.max(-1, Math.min(1, (t.clientX - joyOrigin.x) / 50));
          move.joyY = Math.max(-1, Math.min(1, (t.clientY - joyOrigin.y) / 50));
        } else if (lookTouch && lookTouch.id === t.identifier) {
          yaw -= (t.clientX - lookTouch.x) * 0.005;
          pitch -= (t.clientY - lookTouch.y) * 0.005;
          pitch = Math.max(-1.35, Math.min(1.35, pitch));
          if (Math.abs(t.clientX - lookTouch.x) + Math.abs(t.clientY - lookTouch.y) > 8) lookTouch.moved = true;
          lookTouch.x = t.clientX; lookTouch.y = t.clientY;
        }
      }
    };
    const onTouchEnd = (e) => {
      for (const t of e.changedTouches) {
        if (joyTouch === t.identifier) { joyTouch = null; joyOrigin = null; move.joyX = 0; move.joyY = 0; }
        if (lookTouch && lookTouch.id === t.identifier) {
          if (!lookTouch.moved) tryOpenExhibit();
          lookTouch = null;
        }
      }
    };
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    const tryOpenExhibit = (point = center) => {
      raycaster.setFromCamera(point, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length && hits[0].distance < 6.5 && hits[0].object.userData?.kind) {
        audioRef.current?.blip();
        setFocus({ ...hits[0].object.userData });
        if (document.pointerLockElement) document.exitPointerLock();
        return true;
      }
      return false;
    };
    const onClick = (e) => {
      if (!stateRef.current.started || stateRef.current.focus) return;
      if (isTouch) return;
      if (document.pointerLockElement !== renderer.domElement) {
        // no pointer lock (denied or unsupported): raycast where the user clicked
        const rect = renderer.domElement.getBoundingClientRect();
        const nd = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        if (!tryOpenExhibit(nd)) renderer.domElement.requestPointerLock();
        return;
      }
      tryOpenExhibit();
    };
    renderer.domElement.addEventListener("click", onClick);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const vel = new THREE.Vector3();
    let bobT = 0;
    let lastBeat = 0;
    const baseLightColor = new THREE.Color(0xffe9d0);
    const tmpColor = new THREE.Color();
    const lerpAngle = (a, b, t) => {
      let d = (b - a) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      return a + d * t;
    };

    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.elapsedTime;
      const s = stateRef.current;
      const canMove = s.started && !s.focus && introT >= 1;

      // cinematic fly-in
      if (introT < 1) {
        introT = Math.min(1, introT + dt / 1.9);
        const e = 1 - Math.pow(1 - introT, 3);
        camera.position.set(0, 3.5 - e * 1.88, 6.55 - e * 0.95);
        pitch = -0.62 * (1 - e);
        yaw = 0;
        if (fadeRef.current) fadeRef.current.style.opacity = String(Math.max(0, 1 - introT * 2.5));
      }

      camera.rotation.y = yaw;
      camera.rotation.x = pitch;

      let speedMag = 0;
      if (canMove) {
        const sprint = keys["ShiftLeft"] || keys["ShiftRight"];
        const speed = sprint ? 5.2 : 3.1;
        let fwd = (keys["KeyW"] || keys["ArrowUp"] ? 1 : 0) - (keys["KeyS"] || keys["ArrowDown"] ? 1 : 0);
        let strafe = (keys["KeyD"] || keys["ArrowRight"] ? 1 : 0) - (keys["KeyA"] || keys["ArrowLeft"] ? 1 : 0);
        fwd += -move.joyY;
        strafe += move.joyX;
        const len = Math.hypot(fwd, strafe) || 1;
        const target = new THREE.Vector3(strafe / Math.max(len, 1), 0, -fwd / Math.max(len, 1))
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
          .multiplyScalar(speed);
        vel.lerp(target, 1 - Math.pow(0.0001, dt));
        camera.position.addScaledVector(vel, dt);
        speedMag = vel.length();
        camera.position.x = Math.max(-ROOM.w / 2 + 0.5, Math.min(ROOM.w / 2 - 0.5, camera.position.x));
        camera.position.z = Math.max(-ROOM.d / 2 + 0.5, Math.min(ROOM.d / 2 - 0.5, camera.position.z));
        for (const p of pedestals) {
          const dx = camera.position.x - p.x, dz = camera.position.z - p.z;
          const r = p.half + 0.35;
          if (Math.abs(dx) < r && Math.abs(dz) < r) {
            if (Math.abs(dx) > Math.abs(dz)) camera.position.x = p.x + Math.sign(dx) * r;
            else camera.position.z = p.z + Math.sign(dz) * r;
          }
        }
        // head bob + sprint FOV kick
        bobT += dt * (4 + speedMag * 1.6);
        camera.position.y = 1.62 + Math.sin(bobT) * Math.min(0.035, speedMag * 0.015);
        const targetFov = 72 + Math.min(8, sprint ? speedMag * 1.6 : 0);
        if (Math.abs(camera.fov - targetFov) > 0.05) {
          camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 6);
          camera.updateProjectionMatrix();
        }

        // hover raycast
        raycaster.setFromCamera(center, camera);
        const hits = raycaster.intersectObjects(clickables, false);
        let label = "";
        hoveredData = null;
        if (hits.length && hits[0].distance < 6.5) {
          const d = hits[0].object.userData;
          if (d?.kind) hoveredData = d;
          if (d?.kind === "role") label = `${d.role.title} @ ${d.role.company}`;
          else if (d?.kind === "project") label = d.build.title;
          else if (d?.kind === "rec") label = `Recommendation · ${d.rec.name}`;
          else if (d?.kind === "tile") label = d === mabelData ? "Mabel 🐶" : d.tile.label;
          else if (d?.kind === "stat") label = d.stat.label;
          else if (d?.kind === "welcome") label = "About Phil";
        }
        if (label !== lastHover) { lastHover = label; setHoverLabel(label); }
      }

      // exhibit hover glow + scale
      for (const d of datas) {
        if (d._mat) {
          const targetI = d === hoveredData ? 0.55 : 0;
          d._mat.emissiveIntensity += (targetI - d._mat.emissiveIntensity) * Math.min(1, dt * 8);
        }
        if (d._group && d.kind !== "stat") {
          const targetS = d === hoveredData ? 1.045 : 1;
          const cur = d._group.scale.x;
          d._group.scale.setScalar(cur + (targetS - cur) * Math.min(1, dt * 8));
        }
      }

      // Mabel follows the player
      {
        const dx = camera.position.x - dog.position.x;
        const dz = camera.position.z - dog.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 1.7 && s.started) {
          const step = Math.min(2.7, dist) * dt;
          dog.position.x += (dx / dist) * step;
          dog.position.z += (dz / dist) * step;
          dogYaw = lerpAngle(dogYaw, Math.atan2(dz, dx), Math.min(1, dt * 6));
          dog.position.y = Math.abs(Math.sin(t * 9)) * 0.06; // trot bounce
        } else {
          dogYaw = lerpAngle(dogYaw, Math.atan2(dz, dx), Math.min(1, dt * 3));
          dog.position.y *= 0.8;
        }
        dog.rotation.y = -dogYaw;
        const wagSpeed = dist < 2.5 ? 14 : 7;
        tail.rotation.y = Math.sin(t * wagSpeed) * 0.6;
      }

      // football physics + kicking
      {
        const pdx = ball.position.x - camera.position.x;
        const pdz = ball.position.z - camera.position.z;
        const pd = Math.hypot(pdx, pdz);
        if (pd < 0.65 && canMove) {
          const kick = 2.2 + speedMag * 1.1;
          ballVel.x = (pdx / (pd || 1)) * kick;
          ballVel.z = (pdz / (pd || 1)) * kick;
          audioRef.current?.thump();
        }
        ball.position.x += ballVel.x * dt;
        ball.position.z += ballVel.z * dt;
        const lim = { x: ROOM.w / 2 - 0.3, z: ROOM.d / 2 - 0.3 };
        if (Math.abs(ball.position.x) > lim.x) { ball.position.x = Math.sign(ball.position.x) * lim.x; ballVel.x *= -0.75; }
        if (Math.abs(ball.position.z) > lim.z) { ball.position.z = Math.sign(ball.position.z) * lim.z; ballVel.z *= -0.75; }
        for (const p of pedestals) {
          const bx = ball.position.x - p.x, bz = ball.position.z - p.z;
          const r = p.half + 0.22;
          if (Math.abs(bx) < r && Math.abs(bz) < r) {
            if (Math.abs(bx) > Math.abs(bz)) { ball.position.x = p.x + Math.sign(bx) * r; ballVel.x *= -0.7; }
            else { ball.position.z = p.z + Math.sign(bz) * r; ballVel.z *= -0.7; }
          }
        }
        ballVel.multiplyScalar(Math.pow(0.35, dt));
        const rollSpeed = Math.hypot(ballVel.x, ballVel.z);
        if (rollSpeed > 0.01) {
          const axis = new THREE.Vector3(ballVel.z, 0, -ballVel.x).normalize();
          ball.rotateOnWorldAxis(axis, (rollSpeed * dt) / 0.22);
        }
      }

      // hologram
      holo.rotation.y += dt * (s.party ? 2.4 : 0.5);
      holo.position.y = 2.7 + Math.sin(t * 1.2) * 0.08;
      ring2.rotation.z += dt * 0.8;

      // dust drift
      {
        const arr = dustGeo.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          arr[i * 3 + 1] += Math.sin(t * 0.4 + i) * 0.0006;
          arr[i * 3] += Math.cos(t * 0.3 + i * 1.7) * 0.0005;
        }
        dustGeo.attributes.position.needsUpdate = true;
      }

      // confetti fall
      if (confettiActive) {
        const arr = confGeo.attributes.position.array;
        let alive = 0;
        for (let i = 0; i < confCount; i++) {
          if (arr[i * 3 + 1] > 0) {
            arr[i * 3 + 1] -= confVel[i] * dt;
            arr[i * 3] += Math.sin(t * 3 + i) * 0.004;
            alive++;
          } else if (s.party) {
            seedConf(i);
            alive++;
          }
        }
        confGeo.attributes.position.needsUpdate = true;
        if (!alive && !s.party) { confettiActive = false; confetti.visible = false; }
      }

      // arcade screen animation (~8fps is plenty)
      if (screenState.ctx && t - lastArcade > 0.12) {
        lastArcade = t;
        drawArcadeFrame(screenState, t);
      }

      // party lights + spinning stat plaques + beat
      if (s.party) {
        partyLights.forEach((p, i) => {
          tmpColor.setHSL((t * 0.25 + i * 0.33) % 1, 0.85, 0.6);
          p.color.copy(tmpColor);
          p.intensity = 26 + Math.sin(t * 8 + i) * 8;
        });
        plaques.forEach((pl, i) => { pl.rotation.y += dt * (1.5 + i * 0.3); });
        if (t - lastBeat > 0.46 && !s.muted) {
          lastBeat = t;
          audioRef.current?.thump();
          if (((t / 0.46) | 0) % 2) audioRef.current?.hat();
        }
      } else {
        partyLights.forEach((p) => {
          p.color.lerp(baseLightColor, Math.min(1, dt * 3));
          p.intensity += (22 - p.intensity) * Math.min(1, dt * 3);
        });
        plaques.forEach((pl) => {
          pl.rotation.y = lerpAngle(pl.rotation.y, 0, Math.min(1, dt * 4));
        });
      }

      // minimap
      const mm = minimapRef.current;
      if (mm && s.started) {
        const c2 = mm.getContext("2d");
        const sc = 6;
        const W = ROOM.w * sc, H = ROOM.d * sc;
        c2.clearRect(0, 0, mm.width, mm.height);
        c2.fillStyle = "rgba(34,32,29,0.78)";
        c2.beginPath();
        c2.roundRect(0, 0, W, H, 8);
        c2.fill();
        const mx = (x) => (x + ROOM.w / 2) * sc;
        const mz = (z) => (z + ROOM.d / 2) * sc;
        for (const d of dots) {
          c2.fillStyle = d.color;
          c2.beginPath();
          c2.arc(mx(d.x), mz(d.z), 2.4, 0, Math.PI * 2);
          c2.fill();
        }
        c2.fillStyle = "#C4122E";
        c2.beginPath(); c2.arc(mx(ball.position.x), mz(ball.position.z), 2.2, 0, Math.PI * 2); c2.fill();
        c2.fillStyle = "#D9A066";
        c2.beginPath(); c2.arc(mx(dog.position.x), mz(dog.position.z), 2.6, 0, Math.PI * 2); c2.fill();
        c2.save();
        c2.translate(mx(camera.position.x), mz(camera.position.z));
        c2.rotate(-yaw);
        c2.fillStyle = "#FFD9BC";
        c2.beginPath();
        c2.moveTo(0, -5); c2.lineTo(3.6, 4); c2.lineTo(-3.6, 4);
        c2.closePath(); c2.fill();
        c2.restore();
      }

      if (import.meta.env.DEV) {
        window.__roomDebug = { x: camera.position.x, z: camera.position.z, yaw, pitch, locked: document.pointerLockElement === renderer.domElement, hover: lastHover, party: s.party, intro: introT };
        window.__teleport = (x, z, newYaw) => { introT = 1; camera.position.x = x; camera.position.z = z; if (newYaw !== undefined) yaw = newYaw; };
      }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      if (document.pointerLockElement) document.exitPointerLock();
      audioRef.current?.ctx.close().catch(() => {});
      audioRef.current = null;
      pmrem.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => { m.map?.dispose(); m.dispose(); });
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enter = () => {
    if (!audioRef.current) {
      audioRef.current = makeAudio();
      audioRef.current?.setMuted(stateRef.current.muted);
    }
    audioRef.current?.ctx.resume().catch(() => {});
    if (!started) {
      stateRef.current.startIntro?.();
      stateRef.current.burst?.();
      audioRef.current?.whoosh();
    }
    setStarted(true);
    setPaused(false);
    if (!isTouch) mountRef.current?.querySelector("canvas")?.requestPointerLock();
  };
  const closeFocus = () => {
    setFocus(null);
    if (!isTouch) mountRef.current?.querySelector("canvas")?.requestPointerLock();
  };
  const toggleParty = () => {
    setParty((p) => {
      if (!p) { stateRef.current.burst?.(); audioRef.current?.whoosh(); }
      return !p;
    });
  };

  const btnStyle = {
    padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
    background: T.accent, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: FONT,
    boxShadow: "0 4px 16px rgba(196,112,75,0.4)",
  };
  const chipStyle = {
    padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer",
    background: "rgba(45,43,40,0.8)", color: "#F5E6D3", fontSize: 13, fontWeight: 600, fontFamily: FONT,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#E8E4DE", overflow: "hidden", fontFamily: FONT }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 140px rgba(45,30,20,0.35)" }} />
      {/* intro fade */}
      <div ref={fadeRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "#1a1410", opacity: 0 }} />

      {/* crosshair */}
      {started && !focus && !paused && (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: "50%", background: hoverLabel ? T.accent : "rgba(45,43,40,0.55)", boxShadow: hoverLabel ? `0 0 0 4px ${T.accent}33` : "none", pointerEvents: "none", transition: "background 0.15s ease" }} />
      )}
      {started && !focus && hoverLabel && (
        <div style={{ position: "absolute", left: "50%", top: "56%", transform: "translateX(-50%)", padding: "7px 14px", borderRadius: 10, background: "rgba(45,43,40,0.85)", color: "#F5E6D3", fontSize: 13, fontWeight: 600, pointerEvents: "none" }}>
          {hoverLabel} &middot; {isTouch ? "tap" : "click"} to read
        </div>
      )}
      {started && !focus && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", padding: "7px 16px", borderRadius: 10, background: "rgba(250,249,247,0.85)", color: T.textMid, fontSize: 12, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {isTouch ? "Left stick to move · drag to look · tap exhibits" : "WASD move · mouse look · Shift run · P party · M mute · Esc cursor"}
        </div>
      )}

      {/* top-right controls */}
      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 70 }}>
        {started && (
          <>
            <button onClick={toggleParty} style={{ ...chipStyle, background: party ? T.accent : chipStyle.background }} title="Party mode (P)">🎉</button>
            <button onClick={() => setMuted((m) => !m)} style={chipStyle} title="Mute (M)">{muted ? "🔇" : "🔊"}</button>
          </>
        )}
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }} style={{ ...chipStyle, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Exit to classic CV
        </a>
      </div>

      {/* minimap */}
      {started && !focus && (
        <canvas ref={minimapRef} width={132} height={84} style={{ position: "absolute", right: 14, bottom: 14, zIndex: 50, pointerEvents: "none", opacity: 0.92 }} />
      )}

      {/* touch joystick */}
      {isTouch && started && !focus && (
        <div ref={joyRef} style={{ position: "absolute", left: 24, bottom: 28, width: 110, height: 110, borderRadius: "50%", background: "rgba(45,43,40,0.18)", border: "2px solid rgba(45,43,40,0.3)", zIndex: 50, touchAction: "none" }}>
          <div style={{ position: "absolute", inset: 32, borderRadius: "50%", background: "rgba(196,112,75,0.65)" }} />
        </div>
      )}
      {!isTouch && <div ref={joyRef} style={{ display: "none" }} />}

      {/* start / pause overlays */}
      {(!started || (paused && !focus)) && (
        <div style={{ position: "absolute", inset: 0, zIndex: 65, background: "rgba(232,228,222,0.82)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 13, color: T.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{started ? "Paused" : "The CV Room"}</div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: T.text, margin: "0 0 6px", letterSpacing: -1 }}>Phil Role</h1>
          <p style={{ fontSize: 16, color: T.textMid, margin: "0 0 22px" }}>Head of Talent Acquisition &middot; walk around my CV</p>
          <button style={btnStyle} onClick={enter}>{started ? "Resume walking" : isTouch ? "Tap to enter" : "Click to enter"}</button>
          <p style={{ fontSize: 12, color: T.textLight, marginTop: 18, maxWidth: 460, lineHeight: 1.6 }}>
            {isTouch
              ? "Joystick (bottom-left) to walk, drag to look, tap exhibits to read. Find Mabel the cockapoo, kick the football, and try the 🎉 button."
              : "WASD to walk, mouse to look, click exhibits to read. Kick the football, say hi to Mabel the cockapoo, check the arcade in the corner — and press P when you're ready to celebrate."}
          </p>
        </div>
      )}

      <OverlayDetail focus={focus} onClose={closeFocus} />
    </div>
  );
}
