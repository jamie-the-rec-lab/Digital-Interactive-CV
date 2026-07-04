import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { T, ROLES, RECOMMENDATIONS, BUILD_TILES, STATS } from "./cvData";

const HOBBIES = [
  { emoji: "⚽", label: "Football", text: "Lifelong Crystal Palace fan. Yes, I know. No, I can't explain it either. Season ticket holder. The highs are rare but they're worth it." },
  { emoji: "🏃", label: "Running", text: "5k most mornings around Brockwell Park. Slow but consistent. It's the best way to start the day and I'm genuinely unbearable without it." },
  { emoji: "🍳", label: "Cooking", text: "I make everything from scratch. Current obsession is getting the perfect crispy chilli oil. My mates say I should start a food account. I won't." },
  { emoji: "🐶", label: "Mabel", text: "One-year-old cockapoo. Joins me on my 5k runs. She's the real influencer in the house." },
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
    ctx.fillText("Career wall ahead · Projects to the right · Personal life to the left", 60, h - 60);
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
    ctx.fillStyle = "#2D2B28";
    roundRect(ctx, 0, 0, w, h, 24);
    ctx.fill();
    ctx.fillStyle = "#F5E6D3";
    ctx.textAlign = "center";
    ctx.font = `800 64px ${FONT}`;
    ctx.letterSpacing = "8px";
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 24);
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

/* ---------- scene construction ---------- */
const ROOM = { w: 22, d: 14, h: 4.2 };

function addFramedPanel(scene, clickables, { texture, width, height, position, rotationY, data }) {
  const group = new THREE.Group();
  const frameDepth = 0.06;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.14, height + 0.14, frameDepth),
    new THREE.MeshStandardMaterial({ color: 0x8b6b4f, roughness: 0.6 })
  );
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 })
  );
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
  }
  return group;
}

function buildScene(scene, clickables) {
  scene.background = new THREE.Color(0xe8e4de);
  scene.fog = new THREE.Fog(0xe8e4de, 18, 40);

  // floor
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
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // rug
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshStandardMaterial({ color: 0xdccbb4, roughness: 1 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, 0);
  scene.add(rug);

  // welcome mat
  const mat = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.7),
    new THREE.MeshStandardMaterial({ map: matTexture(), roughness: 1, transparent: true })
  );
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(0, 0.02, 4.6);
  scene.add(mat);

  // ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.w, ROOM.d),
    new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 1 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.h;
  scene.add(ceiling);

  // walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f2, roughness: 0.95 });
  const mkWall = (w, x, z, ry) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, ROOM.h), wallMat);
    wall.position.set(x, ROOM.h / 2, z);
    wall.rotation.y = ry;
    scene.add(wall);
  };
  mkWall(ROOM.w, 0, -ROOM.d / 2, 0);            // north
  mkWall(ROOM.w, 0, ROOM.d / 2, Math.PI);       // south
  mkWall(ROOM.d, ROOM.w / 2, 0, -Math.PI / 2);  // east
  mkWall(ROOM.d, -ROOM.w / 2, 0, Math.PI / 2);  // west

  // skirting
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

  // lights
  scene.add(new THREE.AmbientLight(0xfff4e6, 0.9));
  const hemi = new THREE.HemisphereLight(0xfffaf0, 0xc9b591, 0.55);
  scene.add(hemi);
  [-6.5, 0, 6.5].forEach((x) => {
    const p = new THREE.PointLight(0xffe9d0, 22, 18, 1.8);
    p.position.set(x, ROOM.h - 0.4, 0);
    scene.add(p);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff2dd })
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, ROOM.h - 0.01, 0);
    scene.add(disc);
  });

  // section signs
  addFramedPanel(scene, clickables, { texture: sectionSignTexture("My Career"), width: 4, height: 0.62, position: new THREE.Vector3(0, 3.75, -ROOM.d / 2 + 0.05), rotationY: 0 });
  addFramedPanel(scene, clickables, { texture: sectionSignTexture("My Projects"), width: 4, height: 0.62, position: new THREE.Vector3(ROOM.w / 2 - 0.05, 3.75, 0), rotationY: -Math.PI / 2 });
  addFramedPanel(scene, clickables, { texture: sectionSignTexture("My Personal Life"), width: 4.6, height: 0.62, position: new THREE.Vector3(-ROOM.w / 2 + 0.05, 3.75, 0), rotationY: Math.PI / 2 });

  // career wall (north)
  ROLES.forEach((role, i) => {
    const x = -8.1 + i * 5.4;
    addFramedPanel(scene, clickables, {
      texture: rolePanelTexture(role),
      width: 3.5, height: 2.4,
      position: new THREE.Vector3(x, 2.05, -ROOM.d / 2 + 0.08),
      rotationY: 0,
      data: { kind: "role", role },
    });
  });

  // projects wall (east)
  BUILD_TILES.forEach((build, i) => {
    const z = -5.5 + i * 2.2;
    addFramedPanel(scene, clickables, {
      texture: projectPanelTexture(build),
      width: 1.9, height: 1.45,
      position: new THREE.Vector3(ROOM.w / 2 - 0.08, 2.05, z),
      rotationY: -Math.PI / 2,
      data: { kind: "project", build },
    });
  });

  // personal wall (west): hobbies top row, values bottom row
  HOBBIES.forEach((tile, i) => {
    const z = -5.5 + i * 2.2;
    addFramedPanel(scene, clickables, {
      texture: tilePanelTexture(tile, "#5B8C6A"),
      width: 1.9, height: 0.95,
      position: new THREE.Vector3(-ROOM.w / 2 + 0.08, 2.6, z),
      rotationY: Math.PI / 2,
      data: { kind: "tile", tile, heading: "When I'm not recruiting" },
    });
  });
  VALUES.forEach((tile, i) => {
    const z = -4.4 + i * 4.4;
    addFramedPanel(scene, clickables, {
      texture: tilePanelTexture(tile, "#8B6BAD"),
      width: 2.9, height: 1.45,
      position: new THREE.Vector3(-ROOM.w / 2 + 0.08, 1.35, z),
      rotationY: Math.PI / 2,
      data: { kind: "tile", tile, heading: "My operating system" },
    });
  });

  // south wall: welcome centre, recommendations flanking
  addFramedPanel(scene, clickables, {
    texture: welcomePanelTexture(),
    width: 4.6, height: 2.9,
    position: new THREE.Vector3(0, 2.15, ROOM.d / 2 - 0.08),
    rotationY: Math.PI,
    data: { kind: "welcome" },
  });
  RECOMMENDATIONS.forEach((rec, i) => {
    const x = i < 2 ? -8.5 + (i % 2) * 2.9 : 5.6 + (i % 2) * 2.9;
    addFramedPanel(scene, clickables, {
      texture: recPanelTexture(rec),
      width: 2.6, height: 1.8,
      position: new THREE.Vector3(x, 2.05, ROOM.d / 2 - 0.08),
      rotationY: Math.PI,
      data: { kind: "rec", rec },
    });
  });

  // stat pedestals mid-room
  const pedestals = [];
  STATS.forEach((stat, i) => {
    const x = -4.8 + i * 3.2;
    const z = -2.2;
    const ped = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.05, 0.72),
      new THREE.MeshStandardMaterial({ color: 0xefe9df, roughness: 0.8 })
    );
    ped.position.set(x, 0.525, z);
    scene.add(ped);
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.06),
      new THREE.MeshStandardMaterial({ map: statPanelTexture(stat), roughness: 0.7 })
    );
    plaque.position.set(x, 1.55, z);
    plaque.rotation.x = -0.28;
    scene.add(plaque);
    pedestals.push({ x, z, half: 0.55 });
  });
  return pedestals;
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
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const stateRef = useRef({});
  const joyRef = useRef(null);

  // keep latest UI state readable inside the render loop
  stateRef.current.focus = focus;
  stateRef.current.started = started;
  stateRef.current.paused = paused;

  useEffect(() => {
    const mount = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.05, 100);
    camera.rotation.order = "YXZ";
    camera.position.set(0, 1.62, 5.6);

    const clickables = [];
    const pedestals = buildScene(scene, clickables);

    const keys = {};
    let yaw = 0, pitch = 0; // yaw 0 faces the career wall across the room
    const move = { joyX: 0, joyY: 0 };
    const raycaster = new THREE.Raycaster();
    const center = new THREE.Vector2(0, 0);
    let lastHover = "";

    const onKey = (e, down) => {
      keys[e.code] = down;
      if (down && (e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "Space")) e.preventDefault();
    };
    const kd = (e) => onKey(e, true);
    const ku = (e) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    // mouse look via pointer lock
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

    // touch look + joystick
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
          if (!lookTouch.moved) tryOpenExhibit(); // tap = interact
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
        setFocus({ ...hits[0].object.userData });
        if (document.pointerLockElement) document.exitPointerLock();
        return true;
      }
      return false;
    };
    const onClick = (e) => {
      if (!stateRef.current.started || stateRef.current.focus) return;
      if (isTouch) return; // touch handled in touchend
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
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const s = stateRef.current;
      const canMove = s.started && !s.focus;

      camera.rotation.y = yaw;
      camera.rotation.x = pitch;

      if (canMove) {
        const speed = keys["ShiftLeft"] || keys["ShiftRight"] ? 5.2 : 3.1;
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
        // wall clamp
        camera.position.x = Math.max(-ROOM.w / 2 + 0.5, Math.min(ROOM.w / 2 - 0.5, camera.position.x));
        camera.position.z = Math.max(-ROOM.d / 2 + 0.5, Math.min(ROOM.d / 2 - 0.5, camera.position.z));
        // pedestal push-out
        for (const p of pedestals) {
          const dx = camera.position.x - p.x, dz = camera.position.z - p.z;
          const r = p.half + 0.35;
          if (Math.abs(dx) < r && Math.abs(dz) < r) {
            if (Math.abs(dx) > Math.abs(dz)) camera.position.x = p.x + Math.sign(dx) * r;
            else camera.position.z = p.z + Math.sign(dz) * r;
          }
        }
        camera.position.y = 1.62;

        // hover label
        raycaster.setFromCamera(center, camera);
        const hits = raycaster.intersectObjects(clickables, false);
        let label = "";
        if (hits.length && hits[0].distance < 6.5) {
          const d = hits[0].object.userData;
          if (d?.kind === "role") label = `${d.role.title} @ ${d.role.company}`;
          else if (d?.kind === "project") label = d.build.title;
          else if (d?.kind === "rec") label = `Recommendation · ${d.rec.name}`;
          else if (d?.kind === "tile") label = d.tile.label;
          else if (d?.kind === "welcome") label = "About Phil";
        }
        if (label !== lastHover) { lastHover = label; setHoverLabel(label); }
      }
      if (import.meta.env.DEV) {
        window.__roomDebug = { x: camera.position.x, z: camera.position.z, yaw, pitch, locked: document.pointerLockElement === renderer.domElement, hover: lastHover };
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
    setStarted(true);
    setPaused(false);
    if (!isTouch) mountRef.current?.querySelector("canvas")?.requestPointerLock();
  };
  const closeFocus = () => {
    setFocus(null);
    if (!isTouch) mountRef.current?.querySelector("canvas")?.requestPointerLock();
  };

  const btnStyle = {
    padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
    background: T.accent, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: FONT,
    boxShadow: "0 4px 16px rgba(196,112,75,0.4)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#E8E4DE", overflow: "hidden", fontFamily: FONT }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* crosshair */}
      {started && !focus && !paused && (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, marginLeft: -3, marginTop: -3, borderRadius: "50%", background: hoverLabel ? T.accent : "rgba(45,43,40,0.55)", boxShadow: hoverLabel ? `0 0 0 4px ${T.accent}33` : "none", pointerEvents: "none", transition: "background 0.15s ease" }} />
      )}
      {/* hover label */}
      {started && !focus && hoverLabel && (
        <div style={{ position: "absolute", left: "50%", top: "56%", transform: "translateX(-50%)", padding: "7px 14px", borderRadius: 10, background: "rgba(45,43,40,0.85)", color: "#F5E6D3", fontSize: 13, fontWeight: 600, pointerEvents: "none" }}>
          {hoverLabel} &middot; {isTouch ? "tap" : "click"} to read
        </div>
      )}
      {/* controls hint */}
      {started && !focus && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", padding: "7px 16px", borderRadius: 10, background: "rgba(250,249,247,0.85)", color: T.textMid, fontSize: 12, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {isTouch ? "Left stick to move · drag to look · tap exhibits to read" : "WASD / arrows to move · mouse to look · Shift to run · Esc for cursor"}
        </div>
      )}
      {/* exit link */}
      <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}
        style={{ position: "absolute", top: 12, right: 12, padding: "8px 14px", borderRadius: 10, background: "rgba(45,43,40,0.8)", color: "#F5E6D3", fontSize: 12, fontWeight: 600, textDecoration: "none", zIndex: 70 }}>
        Exit to classic CV
      </a>

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
          <p style={{ fontSize: 12, color: T.textLight, marginTop: 18, maxWidth: 420, lineHeight: 1.6 }}>
            {isTouch
              ? "Use the joystick (bottom-left) to walk, drag anywhere else to look around, and tap an exhibit to read it."
              : "WASD or arrow keys to walk, mouse to look around, click any exhibit to read the details. Esc frees your cursor."}
          </p>
        </div>
      )}

      <OverlayDetail focus={focus} onClose={closeFocus} />
    </div>
  );
}
