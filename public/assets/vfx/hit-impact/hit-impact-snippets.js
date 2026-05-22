// =============================================================================
// HIT-IMPACT CHIBI VFX — paste-ready snippets for index.html
// =============================================================================
// All timing in FRAMES at 60fps fixed timestep.
// Velocities in px/frame. Drag and gravity converted from per-second units.
// See HIT_IMPACT_CHIBI.md for placement instructions.
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
// § STATE INIT — paste into arena object literal near index.html:3483
// ─────────────────────────────────────────────────────────────────────────────
//
//   hitImpactVFXs: [],
//
// And at the 4 reset sites (3586, 3745, 3760, 4990) where arena.slashVFXs = []:
//
//   arena.hitImpactVFXs = [];


// ─────────────────────────────────────────────────────────────────────────────
// § SPAWN — paste near spawnSlashVFX, around index.html:5131
// ─────────────────────────────────────────────────────────────────────────────

function spawnHitImpactVFX(cx, cy, scale){
  if(!arena.hitImpactVFXs) arena.hitImpactVFXs = [];
  scale = scale || 1;
  const s = scale;

  const sub = [];

  // ── WHITE STAR GROW (frames 0–4) — pop in with easeOutBack ──
  sub.push({
    kind:'flashGrow', spawnAt:0,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:4,
    size0:0, size1:20*s, alpha0:1, alpha1:1,
    h0:195, s0:25, l0:95, h1:195, s1:25, l1:95,
    blend:'source-over', shape:'star', outline:4, points:6, innerRatio:0.42,
    rot:Math.random()*Math.PI*2, vrot:0, seed:Math.random(),
    easeSize:'easeOutBack', easeAlpha:'lin', easeColor:'lin',
  });

  // ── WHITE STAR COLLAPSE (frames 4–12) — scale-to-zero, color shifts cyan ──
  sub.push({
    kind:'flashCollapse', spawnAt:4,
    x:cx, y:cy, vx:0, vy:0, gy:0, dragMul:1,
    life:0, lifeFrames:8,
    size0:20*s, size1:0, alpha0:1, alpha1:1,
    h0:195, s0:25, l0:95, h1:190, s1:60, l1:70,
    blend:'source-over', shape:'star', outline:4, points:6, innerRatio:0.42,
    rot:Math.random()*Math.PI*2, vrot:0, seed:Math.random(),
    easeSize:'easeInQuart', easeAlpha:'lin', easeColor:'easeOutQuad',
  });

  // ── 2 GOLD DIAMOND DOTS — opposite directions, snappy fade ──
  const baseAng = Math.random() * Math.PI*2;
  for(let i=0;i<2;i++){
    const ang = baseAng + i*Math.PI + (Math.random()-0.5)*0.3;
    const sp = (220 + Math.random()*80) / 60 * s;  // px/frame
    sub.push({
      kind:'goldDot', spawnAt:0,
      x:cx, y:cy,
      vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp,
      gy:0, dragMul: 1-2.5/60,
      life:0, lifeFrames:13,
      size0:10*s, size1:2*s, alpha0:1, alpha1:1,
      h0:50, s0:90, l0:70, h1:42, s1:85, l1:55,
      blend:'source-over', shape:'diamond', outline:2,
      rot:Math.random()*Math.PI*2, vrot:(Math.random()*10-5)/60, seed:Math.random(),
      easeSize:'easeOutQuad', easeAlpha:'lin', easeColor:'easeOutQuad',
    });
  }

  arena.hitImpactVFXs.push({
    frame:0,
    lifeFrames:13,
    sub,
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// § TICK — paste near slashVFXs tick, around index.html:5848
// ─────────────────────────────────────────────────────────────────────────────

if(arena.hitImpactVFXs){
  for(let i=arena.hitImpactVFXs.length-1;i>=0;i--){
    const vfx = arena.hitImpactVFXs[i];
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
    if(vfx.frame >= vfx.lifeFrames) arena.hitImpactVFXs.splice(i,1);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// § DRAW — paste near drawSlashVFXs, around index.html:5971
// ─────────────────────────────────────────────────────────────────────────────

const HITIMPACT_EASE = {
  lin:          t => t,
  easeInQuart:  t => t*t*t*t,
  easeOutQuad:  t => 1-(1-t)**2,
  easeOutExpo:  t => t>=1?1:1-Math.pow(2,-10*t),
  easeOutBack:  t => { const c1=1.70158, c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); },
};

function _hitLerp(a,b,t){ return a + (b-a)*t; }
function _hitHsl(h,s,l,a){ return `hsla(${h},${s}%,${l}%,${a==null?1:a})`; }

function _hitDrawShape(p, sz, h, s, l){
  const TAU = Math.PI*2;
  ctx.fillStyle = _hitHsl(h,s,l);
  switch(p.shape){
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
      if(p.outline){
        ctx.lineWidth = p.outline; ctx.lineJoin = 'round';
        ctx.strokeStyle = _hitHsl(h, Math.min(100,s+5), Math.max(15,l-40));
        ctx.stroke();
      }
      break;
    }
    case 'diamond': {
      const r = sz/2;
      ctx.beginPath();
      ctx.moveTo(0,-r); ctx.lineTo(r*0.6,0); ctx.lineTo(0,r); ctx.lineTo(-r*0.6,0);
      ctx.closePath(); ctx.fill();
      if(p.outline){
        ctx.lineWidth = p.outline; ctx.lineJoin = 'round';
        ctx.strokeStyle = _hitHsl(h, s, Math.max(15, l-40));
        ctx.stroke();
      }
      break;
    }
  }
}

function drawHitImpactVFXs(){
  if(!arena.hitImpactVFXs || !arena.hitImpactVFXs.length) return;
  ctx.save();
  for(const vfx of arena.hitImpactVFXs){
    for(const p of vfx.sub){
      if(vfx.frame < p.spawnAt) continue;
      if(p.life >= p.lifeFrames) continue;
      const t = Math.min(1, p.life / p.lifeFrames);
      const sz = _hitLerp(p.size0,  p.size1,  HITIMPACT_EASE[p.easeSize](t));
      const a  = _hitLerp(p.alpha0, p.alpha1, HITIMPACT_EASE[p.easeAlpha](t));
      const ct = HITIMPACT_EASE[p.easeColor](t);
      const h  = _hitLerp(p.h0, p.h1, ct);
      const sv = _hitLerp(p.s0, p.s1, ct);
      const l  = _hitLerp(p.l0, p.l1, ct);
      if(sz<=0 || a<=0) continue;
      ctx.save();
      ctx.globalCompositeOperation = p.blend;
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      _hitDrawShape(p, sz, h, sv, l);
      ctx.restore();
    }
  }
  ctx.restore();
}


// ─────────────────────────────────────────────────────────────────────────────
// § RENDER HOOK — add inside renderArena, after drawSlashVFXs (index.html:7086)
// ─────────────────────────────────────────────────────────────────────────────
//
//   drawHitImpactVFXs();
//
//
// § USAGE FROM GAMEPLAY CODE
// ─────────────────────────────────────────────────────────────────────────────
//
//   spawnHitImpactVFX(target.x, target.y, 1.0);   // standard melee hit
//   spawnHitImpactVFX(target.x, target.y, 0.7);   // minor tick / DoT
//   spawnHitImpactVFX(target.x, target.y, 1.6);   // crit / heavy hit
//
