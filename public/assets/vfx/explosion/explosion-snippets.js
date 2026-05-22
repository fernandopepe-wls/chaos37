// =============================================================================
// EXPLOSION CHIBI VFX — paste-ready snippets for index.html
// =============================================================================
// All timing in FRAMES at 60fps fixed timestep.
// Velocities in px/frame. Gravity in px/frame².
// See EXPLOSION_CHIBI.md for placement instructions.
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
// § STATE INIT — paste into arena object literal near index.html:3483
// ─────────────────────────────────────────────────────────────────────────────
//
//   explosionVFXs: [],
//
// And at the 4 reset sites (3586, 3745, 3760, 4990) where arena.slashVFXs = []:
//
//   arena.explosionVFXs = [];



// ─────────────────────────────────────────────────────────────────────────────
// § SPAWN — paste near spawnSlashVFX, around index.html:5131
// ─────────────────────────────────────────────────────────────────────────────

function spawnExplosionVFX(cx, cy, scale){
  if(!arena.explosionVFXs) arena.explosionVFXs = [];
  scale = scale || 1;
  const s = scale;

  const sub = []; // sub-particles, each: {kind, x,y, vx,vy, gy, dragMul, life, lifeFrames, size0,size1, alpha0,alpha1, h0,s0,l0,h1,s1,l1, outline, blend, shape, points, innerRatio, lineW, rot, vrot, seed, easeSize, easeAlpha, easeColor, spawnAt}

  // ── ANTICIPATION (frames 0–6) — small yellow squash dot, shrinks to zero
  sub.push({
    kind:'circle', spawnAt:0,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:6,
    size0:30*s, size1:0, alpha0:1, alpha1:1,
    h0:50, s0:100, l0:85, h1:50, s1:100, l1:85,
    blend:'lighter', shape:'circle', outline:0,
    rot:0, vrot:0, seed:Math.random(),
    easeSize:'easeInQuart', easeAlpha:'lin', easeColor:'lin',
  });

  // ── CLIMAX (spawn at frame 6) ──

  // Core flash — additive softCircle with triple-attack
  sub.push({
    kind:'flash', spawnAt:6,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:11,
    size0:80*s, size1:280*s, alpha0:1, alpha1:0,
    h0:52, s0:100, l0:88, h1:40, s1:100, l1:20,
    blend:'lighter', shape:'softCircle', outline:0,
    rot:0, vrot:0, seed:Math.random(),
    easeSize:'easeOutExpo', easeAlpha:'easeOutExpo', easeColor:'lin',
  });

  // Big 8-point star — hard cut at lifetime
  sub.push({
    kind:'starBig', spawnAt:6,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:27,
    size0:100*s, size1:360*s, alpha0:1, alpha1:1,
    h0:42, s0:100, l0:62, h1:18, s1:95, l1:50,
    blend:'source-over', shape:'star', outline:10, points:8, innerRatio:0.42,
    rot:Math.random()*Math.PI*2, vrot:0, seed:Math.random(),
    easeSize:'easeOutBack', easeAlpha:'lin', easeColor:'easeOutQuad',
  });

  // Inner brighter star — 6 points
  sub.push({
    kind:'starInner', spawnAt:6,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:21,
    size0:50*s, size1:220*s, alpha0:1, alpha1:1,
    h0:52, s0:100, l0:78, h1:38, s1:100, l1:65,
    blend:'source-over', shape:'star', outline:6, points:6, innerRatio:0.55,
    rot:Math.random()*Math.PI*2, vrot:0, seed:Math.random(),
    easeSize:'easeOutBack', easeAlpha:'lin', easeColor:'easeOutQuad',
  });

  // Shockwave ring — outline only, hard cut
  sub.push({
    kind:'shock', spawnAt:6,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:18,
    size0:60*s, size1:480*s, alpha0:1, alpha1:1,
    h0:48, s0:100, l0:88, h1:48, s1:100, l1:88,
    blend:'source-over', shape:'shockwave', lineW:14,
    rot:0, vrot:0, seed:Math.random(),
    easeSize:'easeOutExpo', easeAlpha:'lin', easeColor:'lin',
  });

  // Speedlines — 10 radial
  for(let i=0;i<10;i++){
    const ang = (i/10) * Math.PI*2 + (Math.random()-0.5)*0.16;
    sub.push({
      kind:'speedline', spawnAt:6,
      x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
      life:0, lifeFrames:13,
      size0:80*s, size1:320*s, alpha0:1, alpha1:1,
      h0:52, s0:100, l0:80, h1:52, s1:100, l1:80,
      blend:'source-over', shape:'speedlines', lineW:6,
      rot:ang, vrot:0, seed:Math.random(),
      easeSize:'easeOutExpo', easeAlpha:'lin', easeColor:'lin',
    });
  }

  // ── DISSIPATION (spawn at frame 6) ──

  // 8 orange puffs — hold-then-collapse, color shift to warm gray
  for(let i=0;i<8;i++){
    const ang = (i/8) * Math.PI*2 + (Math.random()-0.5)*0.5;
    const sp = (220 + Math.random()*140) / 60 * s; // px/frame
    sub.push({
      kind:'puffOrange', spawnAt:6,
      x:cx, y:cy,
      vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
      gy:-180/3600, dragMul: 1-4.2/60,
      life:0, lifeFrames:54,
      size0:70*s, size1:140*s, alpha0:1, alpha1:1,
      h0:28, s0:85, l0:58, h1:22, s1:25, l1:55,
      blend:'source-over', shape:'puffCartoon', outline:5,
      rot:0, vrot:(Math.random()*2-1)/60, seed:Math.random(),
      easeSize:'holdThenCollapse', easeAlpha:'lin', easeColor:'easeOutCubic',
    });
  }

  // 5 gray smoke puffs — smooth fade (chibi tail exception)
  for(let i=0;i<5;i++){
    const ang = -Math.PI/2 + (Math.random()-0.5)*2.0;
    const sp = (70 + Math.random()*90) / 60 * s;
    const sz = (90 + Math.random()*30) * s;
    sub.push({
      kind:'puffGray', spawnAt:6,
      x:cx + (Math.random()-0.5)*80*s, y:cy + (Math.random()-0.5)*40*s,
      vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
      gy:-90/3600, dragMul: 1-1.8/60,
      life:0, lifeFrames: 51 + ((Math.random()*12)|0),
      size0:sz, size1:sz*0.75, alpha0:1, alpha1:0,
      h0:25, s0:28, l0:58, h1:22, s1:14, l1:70,
      blend:'source-over', shape:'puffCartoon', outline:4,
      rot:0, vrot:(Math.random()-0.5)/60, seed:Math.random(),
      easeSize:'easeOutQuad', easeAlpha:'fadeLate', easeColor:'smoothstep',
    });
  }

  // 12 debris diamonds — gravity, scale-to-zero
  for(let i=0;i<12;i++){
    const ang = -Math.random()*Math.PI + (Math.random()-0.5)*0.6;
    const sp = (280 + Math.random()*240) / 60 * s;
    sub.push({
      kind:'debris', spawnAt:6,
      x:cx, y:cy,
      vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
      gy:900/3600, dragMul: 1-1.2/60,
      life:0, lifeFrames: 33 + ((Math.random()*12)|0),
      size0:22*s, size1:0, alpha0:1, alpha1:1,
      h0:42, s0:100, l0:62, h1:18, s1:95, l1:45,
      blend:'source-over', shape:'diamond', outline:3,
      rot:Math.random()*Math.PI*2, vrot:(Math.random()*16-8)/60, seed:Math.random(),
      easeSize:'easeInQuart', easeAlpha:'lin', easeColor:'lin',
    });
  }

  // 16 sparkle stars — additive, triple-attack
  for(let i=0;i<16;i++){
    const ang = Math.random() * Math.PI*2;
    const sp = (180 + Math.random()*240) / 60 * s;
    sub.push({
      kind:'sparkle', spawnAt:6,
      x:cx, y:cy,
      vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
      gy:200/3600, dragMul: 1-2.8/60,
      life:0, lifeFrames: 24 + ((Math.random()*15)|0),
      size0:18*s, size1:0, alpha0:1, alpha1:0,
      h0:55, s0:100, l0:82, h1:38, s1:100, l1:10,
      blend:'lighter', shape:'star', outline:0, points:4, innerRatio:0.35,
      rot:0, vrot:(Math.random()*12-6)/60, seed:Math.random(),
      easeSize:'easeInQuart', easeAlpha:'easeOutQuad', easeColor:'smoothstep',
    });
  }

  arena.explosionVFXs.push({
    frame:0,
    lifeFrames:60,
    sub,
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// § TICK — paste near slashVFXs tick, around index.html:5848
// ─────────────────────────────────────────────────────────────────────────────

if(arena.explosionVFXs){
  for(let i=arena.explosionVFXs.length-1;i>=0;i--){
    const vfx = arena.explosionVFXs[i];
    vfx.frame++;
    for(const p of vfx.sub){
      if(vfx.frame < p.spawnAt) continue;
      p.life++;
      p.vx *= p.dragMul;
      p.vy *= p.dragMul;
      p.vy += p.gy;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.vrot;
    }
    if(vfx.frame >= vfx.lifeFrames) arena.explosionVFXs.splice(i,1);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// § DRAW — paste near drawSlashVFXs, around index.html:5971
// ─────────────────────────────────────────────────────────────────────────────

const EXPLOSION_EASE = {
  lin:                t => t,
  easeInQuart:        t => t*t*t*t,
  easeOutQuad:        t => 1-(1-t)**2,
  easeOutCubic:       t => 1-(1-t)**3,
  easeOutExpo:        t => t>=1?1:1-Math.pow(2,-10*t),
  easeOutBack:        t => { const c1=1.70158, c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); },
  smoothstep:         t => t*t*(3-2*t),
  holdThenCollapse:   t => t<0.7 ? 0 : (t-0.7)/0.3,
  fadeLate:           t => { if(t<0.45) return 0; const u=(t-0.45)/0.55; return u*u*(3-2*u); },
};

function _explLerp(a,b,t){ return a + (b-a)*t; }
function _explHsl(h,s,l,a){ return `hsla(${h},${s}%,${l}%,${a==null?1:a})`; }

function _explDrawShape(p, sz, h, s, l){
  const TAU = Math.PI*2;
  ctx.fillStyle = _explHsl(h,s,l);
  switch(p.shape){
    case 'circle':
      ctx.beginPath(); ctx.arc(0,0,sz/2,0,TAU); ctx.fill();
      break;
    case 'softCircle': {
      const g = ctx.createRadialGradient(0,0,0, 0,0,sz/2);
      g.addColorStop(0,   _explHsl(h,s,l,1));
      g.addColorStop(0.5, _explHsl(h,s,l,0.6));
      g.addColorStop(1,   _explHsl(h,s,l,0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0,0,sz/2,0,TAU); ctx.fill();
      break;
    }
    case 'star': {
      const pts=p.points, ir=(sz/2)*p.innerRatio, or=sz/2;
      ctx.beginPath();
      for(let i=0;i<pts*2;i++){
        const r = i%2===0?or:ir;
        const ang = (i/(pts*2))*TAU - Math.PI/2;
        const x = Math.cos(ang)*r, y = Math.sin(ang)*r;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.fill();
      if(p.outline){ ctx.lineWidth=p.outline; ctx.lineJoin='round'; ctx.strokeStyle=_explHsl(18,90,22); ctx.stroke(); }
      break;
    }
    case 'puffCartoon': {
      const r = sz/2, lobes=5;
      ctx.beginPath();
      for(let i=0;i<lobes;i++){
        const ang = (i/lobes)*TAU + p.seed*TAU;
        const lr = r * (0.55 + ((p.seed*17+i)%1)*0.25);
        const lx = Math.cos(ang)*r*0.45, ly = Math.sin(ang)*r*0.45;
        ctx.moveTo(lx+lr, ly); ctx.arc(lx,ly,lr,0,TAU);
      }
      ctx.moveTo(r*0.6,0); ctx.arc(0,0,r*0.7,0,TAU);
      ctx.fill('nonzero');
      if(p.outline){ ctx.lineWidth=p.outline; ctx.strokeStyle=_explHsl(h, Math.min(100,s+15), Math.max(20,l-35)); ctx.stroke(); }
      ctx.fillStyle = _explHsl(h, s-15, Math.min(95,l+20), 0.6);
      ctx.beginPath(); ctx.arc(-r*0.25,-r*0.25, r*0.3, 0, TAU); ctx.fill();
      break;
    }
    case 'diamond': {
      const r = sz/2;
      ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r*0.6,0); ctx.lineTo(0,r); ctx.lineTo(-r*0.6,0); ctx.closePath();
      ctx.fill();
      if(p.outline){ ctx.lineWidth=p.outline; ctx.lineJoin='round'; ctx.strokeStyle=_explHsl(h,s,Math.max(15,l-40)); ctx.stroke(); }
      break;
    }
    case 'shockwave': {
      ctx.lineWidth = p.lineW || 8;
      ctx.strokeStyle = _explHsl(h,s,l);
      ctx.beginPath(); ctx.arc(0,0,sz/2,0,TAU); ctx.stroke();
      ctx.lineWidth = (p.lineW||8)*0.4;
      ctx.strokeStyle = _explHsl(18,85,30);
      ctx.beginPath(); ctx.arc(0,0,sz/2 - (p.lineW||8)*0.6, 0, TAU); ctx.stroke();
      break;
    }
    case 'speedlines': {
      ctx.strokeStyle = _explHsl(h,s,l);
      ctx.lineWidth = p.lineW || 4;
      ctx.lineCap = 'round';
      const r = sz/2;
      ctx.beginPath(); ctx.moveTo(r*0.45,0); ctx.lineTo(r,0); ctx.stroke();
      break;
    }
  }
}

function drawExplosionVFXs(){
  if(!arena.explosionVFXs || !arena.explosionVFXs.length) return;
  ctx.save();
  // back-to-front: alphablended first, additive last
  const drawList = [];
  for(const vfx of arena.explosionVFXs){
    for(const p of vfx.sub){
      if(vfx.frame < p.spawnAt) continue;
      if(p.life >= p.lifeFrames) continue;
      drawList.push(p);
    }
  }
  drawList.sort((a,b)=> (a.blend==='lighter') - (b.blend==='lighter'));
  for(const p of drawList){
    const t = Math.min(1, p.life / p.lifeFrames);
    const sz = _explLerp(p.size0,  p.size1,  EXPLOSION_EASE[p.easeSize](t));
    const a  = _explLerp(p.alpha0, p.alpha1, EXPLOSION_EASE[p.easeAlpha](t));
    const ct = EXPLOSION_EASE[p.easeColor](t);
    const h  = _explLerp(p.h0, p.h1, ct);
    const s  = _explLerp(p.s0, p.s1, ct);
    const l  = _explLerp(p.l0, p.l1, ct);
    if(sz<=0 || a<=0) continue;
    ctx.save();
    ctx.globalCompositeOperation = p.blend;
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    _explDrawShape(p, sz, h, s, l);
    ctx.restore();
  }
  ctx.restore();
}


// ─────────────────────────────────────────────────────────────────────────────
// § RENDER HOOK — add inside renderArena, after drawSlashVFXs (index.html:7086)
// ─────────────────────────────────────────────────────────────────────────────
//
//   drawExplosionVFXs();
//
//
// § USAGE FROM GAMEPLAY CODE
// ─────────────────────────────────────────────────────────────────────────────
//
//   spawnExplosionVFX(enemy.x, enemy.y, 1.0);       // standard
//   spawnExplosionVFX(boss.x, boss.y, 2.0);         // boss boom
//   spawnExplosionVFX(arena.bx, arena.by, 0.6);     // mini hit feedback
//
