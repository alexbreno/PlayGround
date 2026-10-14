/* Minigames 9999-em-1: 9 clones retrô com power-ups. Cada jogo: {title, sub, init(g), update(g,dt), draw(g)}.
   g: {W,H,input,score,lives,over,win,overText,time,data,sfx,addScore,finish} */
(function(){
"use strict";
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function emoji(c,icon,x,y,s){c.font=(s||20)+"px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(icon,x,y);c.textBaseline="alphabetic";}

/* ---------- 1. TANQUE 99 (Battle City) + power-ups ---------- */
const Tank={
title:"TANQUE 99",sub:"Destrua os tanques! Power-ups: ⭐ 🛡 💣 ❤",
init(g){g.data={px:g.W/2,py:g.H-70,dir:-Math.PI/2,cd:0,enemies:[],bullets:[],ebullets:[],parts:[],powers:[],starT:0,shield:0,wave:1,kills:0,spawnT:0,bricks:[]};
 for(let i=0;i<14;i++)g.data.bricks.push({x:60+i*62,y:120,w:44,h:18,hp:2});
 for(let i=0;i<3;i++)spawnEnemy(g);},
update(g,dt){const d=g.data;d.time=(d.time||0)+dt;
 const sp=220*dt,inp=g.input;
 if(inp.left){d.px-=sp;d.dir=Math.PI;} if(inp.right){d.px+=sp;d.dir=0;}
 if(inp.up){d.py-=sp;d.dir=-Math.PI/2;} if(inp.down){d.py+=sp;d.dir=Math.PI/2;}
 d.px=clamp(d.px,20,g.W-20);d.py=clamp(d.py,60,g.H-30);
 d.cd-=dt;d.starT-=dt;d.shield-=dt;
 if((inp.fire||inp.firePressed)&&d.cd<=0){d.cd=d.starT>0?0.13:0.28;d.bullets.push({x:d.px,y:d.py,a:d.dir,sp:460});g.sfx("shoot");}
 for(const b of d.bullets){b.x+=Math.cos(b.a)*b.sp*dt;b.y+=Math.sin(b.a)*b.sp*dt;}
 d.bullets=d.bullets.filter(b=>b.x>0&&b.x<g.W&&b.y>0&&b.y<g.H);
 d.spawnT-=dt;
 if(d.enemies.length<3+d.wave&&d.spawnT<=0){d.spawnT=1.2;spawnEnemy(g);}
 for(const e of d.enemies){e.t-=dt;e.fs-=dt;
  if(e.t<=0){e.t=rand(.5,1.4);const r=Math.random();e.a=r<.3?Math.PI/2:(r<.6?0:(r<.8?Math.PI:-Math.PI/2));}
  e.x+=Math.cos(e.a)*e.sp*dt;e.y+=Math.sin(e.a)*e.sp*dt;
  if(e.x<20||e.x>g.W-20){e.a=Math.PI-e.a;e.x=clamp(e.x,20,g.W-20);}
  if(e.y<50||e.y>g.H-20){e.a=-e.a;e.y=clamp(e.y,50,g.H-20);}
  if(e.fs<=0){e.fs=rand(1,2.4);d.ebullets.push({x:e.x,y:e.y,a:Math.atan2(d.py-e.y,d.px-e.x),sp:200});}
 }
 for(const b of d.ebullets){b.x+=Math.cos(b.a)*b.sp*dt;b.y+=Math.sin(b.a)*b.sp*dt;}
 d.ebullets=d.ebullets.filter(b=>b.x>0&&b.x<g.W&&b.y>0&&b.y<g.H);
 for(const b of d.bullets){
  for(const e of d.enemies){if(!e.dead&&Math.hypot(e.x-b.x,e.y-b.y)<20){e.hp--;b.dead=true;burst(d,e.x,e.y,"#ffd23f");g.sfx("hit");
   if(e.hp<=0){e.dead=true;d.kills++;g.addScore(100);g.sfx("boom");burst(d,e.x,e.y,"#ff2fb3");
    if(Math.random()<.3)d.powers.push({x:e.x,y:e.y,type:["⭐","🛡","💣","❤"][((Math.random()*4)|0)],t:12});
    if(d.kills>=4+d.wave*2){d.wave++;d.kills=0;g.addScore(250);g.toast("ONDA "+d.wave);}}}}
  for(const br of d.bricks){if(br.hp>0&&b.x>br.x&&b.x<br.x+br.w&&b.y>br.y&&b.y<br.y+br.h){br.hp--;b.dead=true;g.sfx("hit");}}
 }
 d.bullets=d.bullets.filter(b=>!b.dead);d.enemies=d.enemies.filter(e=>!e.dead);
 for(const b of d.ebullets){
  if(Math.hypot(d.px-b.x,d.py-b.y)<16){b.dead=true;
   if(d.shield>0){burst(d,d.px,d.py,"#00f0ff");g.sfx("hit");}
   else{g.lives--;g.sfx("boom");burst(d,d.px,d.py,"#00f0ff");if(g.lives<=0)g.finish(false,"TANQUE DESTRUÍDO! Pontos: "+Math.floor(g.score));}}
  for(const br of d.bricks){if(br.hp>0&&b.x>br.x&&b.x<br.x+br.w&&b.y>br.y&&b.y<br.y+br.h){br.hp--;b.dead=true;}}}
 d.ebullets=d.ebullets.filter(b=>!b.dead);
 // coleta de power-ups
 for(const p of d.powers){p.t-=dt;
  if(Math.hypot(d.px-p.x,d.py-p.y)<26){p.got=true;g.collect();
   if(p.type==="⭐"){d.starT=10;g.sfx("rapid");g.toast("⭐ TIRO RÁPIDO!");}
   else if(p.type==="🛡"){d.shield=8;g.sfx("shield");g.toast("🛡 ESCUDO!");}
   else if(p.type==="💣"){for(const e of d.enemies){e.dead=true;d.kills++;g.addScore(100);burst(d,e.x,e.y,"#ff7a00");}g.toast("💣 BOMBA!");g.sfx("mega");}
   else{g.lives=Math.min(5,g.lives+1);g.sfx("life");g.toast("❤ VIDA EXTRA!");}}}
 d.powers=d.powers.filter(p=>!p.got&&p.t>0);
 d.enemies=d.enemies.filter(e=>!e.dead);
 d.parts=d.parts.filter(p=>(p.l-=dt)>0);
 for(const p of d.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;}
 if(!g.over)g.score+=dt*2;
},
draw(g){const c=g.ctx,d=g.data;c.fillStyle="#0b0b14";c.fillRect(0,0,g.W,g.H);
 c.strokeStyle="#2a2a4a";for(let x=0;x<g.W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,g.H);c.stroke();}
 for(const br of d.bricks){if(br.hp>0){c.fillStyle=br.hp>1?"#b3541e":"#7a3a12";c.fillRect(br.x,br.y,br.w,br.h);c.strokeStyle="#ffd23f";c.lineWidth=1;c.strokeRect(br.x,br.y,br.w,br.h);}}
 for(const p of d.powers){const a=.6+Math.sin(d.time*6)*.4;c.globalAlpha=a;
  c.fillStyle="#000a";c.beginPath();c.arc(p.x,p.y,15,0,7);c.fill();emoji(c,p.type,p.x,p.y,22);c.globalAlpha=1;}
 for(const p of d.parts){c.globalAlpha=clamp(p.l*2,0,1);c.fillStyle=p.c;c.fillRect(p.x-3,p.y-3,6,6);}c.globalAlpha=1;
 for(const e of d.enemies)drawTank(c,e.x,e.y,e.a,"#ff3355","#7a0f22");
 drawTank(c,d.px,d.py,d.dir,d.starT>0?"#ffd23f":"#00f0ff","#0a5a66");
 if(d.shield>0){c.strokeStyle="#00f0ff";c.lineWidth=3;c.beginPath();c.arc(d.px,d.py,26+Math.sin(d.time*8)*3,0,7);c.stroke();}
 c.fillStyle="#fff";for(const b of d.bullets){c.fillStyle=d.starT>0?"#ff7a00":"#ffd23f";c.beginPath();c.arc(b.x,b.y,4,0,7);c.fill();}
 for(const b of d.ebullets){c.fillStyle="#ff3355";c.beginPath();c.arc(b.x,b.y,4,0,7);c.fill();}
 let extra="";if(d.starT>0)extra+=" • ⭐";if(d.shield>0)extra+=" • 🛡";
 drawTop(g,"ONDA "+d.wave+" • KILLS "+d.kills+" • VIDAS "+g.lives+extra);
}};
function spawnEnemy(g){const d=g.data;d.enemies.push({x:rand(40,g.W-40),y:rand(60,200),a:Math.PI/2,sp:rand(50,90)+d.wave*12,hp:2,t:0,fs:rand(.5,1.5)});}
function burst(d,x,y,c){for(let i=0;i<10;i++)d.parts.push({x,y,vx:rand(-160,160),vy:rand(-160,160),l:rand(.2,.6),c});}
function drawTank(c,x,y,a,body,dark){c.save();c.translate(x,y);c.rotate(a);
 c.fillStyle=dark;c.fillRect(-14,-11,28,22);c.fillStyle=body;c.fillRect(-11,-8,22,16);
 c.fillStyle="#111";c.fillRect(8,-3,14,6);c.fillStyle=body;c.fillRect(-6,-6,12,12);c.restore();}
function drawTop(g,txt){const c=g.ctx;c.fillStyle="#000c";c.fillRect(0,0,g.W,30);c.fillStyle="#ffd23f";c.font="bold 14px monospace";c.textAlign="left";c.fillText(((g.title||"")+"  •  "+txt).slice(0,64),12,20);}

/* ---------- 2. COBRINHA + maçã dourada ---------- */
const Snake={
title:"COBRINHA",sub:"Coma as frutinhas! Maçã dourada = 150 pts!",
init(g){g.data={snake:[{x:12,y:10},{x:11,y:10},{x:10,y:10}],dir:{x:1,y:0},nd:{x:1,y:0},t:0,step:.11,food:null,gold:null,gt:7,grow:0,N:24,M:16,flash:0};
 placeFood(g);},
update(g,dt){const d=g.data;const inp=g.input;
 if(inp.left&&(d.dir.x!==1))d.nd={x:-1,y:0};else if(inp.right&&(d.dir.x!==-1))d.nd={x:1,y:0};
 else if(inp.up&&(d.dir.y!==1))d.nd={x:0,y:-1};else if(inp.down&&(d.dir.y!==-1))d.nd={x:0,y:1};
 d.t+=dt;d.flash+=dt;
 d.gt-=dt;
 if(d.gt<=0&&!d.gold){d.gold=placeFree(g);if(d.gold)d.goldT=5;}
 if(d.gold){d.goldT-=dt;if(d.goldT<=0){d.gold=null;d.gt=7;}}
 if(d.t>=d.step){d.t=0;d.dir=d.nd;const h={x:d.snake[0].x+d.dir.x,y:d.snake[0].y+d.dir.y};
  if(h.x<0||h.y<0||h.x>=d.N||h.y>=d.M||d.snake.some(s=>s.x===h.x&&s.y===h.y)){g.finish(false,"A COBRA BATEU! Pontos: "+Math.floor(g.score));return;}
  d.snake.unshift(h);let ate=false;
  if(h.x===d.food.x&&h.y===d.food.y){g.addScore(50);g.sfx("eat");d.step=Math.max(.055,d.step-.003);placeFood(g);ate=true;}
  if(d.gold&&h.x===d.gold.x&&h.y===d.gold.y){g.addScore(150);g.sfx("gold");g.collect();g.toast("+150 MAÇÃ DOURADA! 🌟");d.grow+=2;d.gold=null;d.gt=8;ate=true;}
  if(!ate){if(d.grow>0)d.grow--;else d.snake.pop();}}
},
draw(g){const c=g.ctx,d=g.data;c.fillStyle="#06130a";c.fillRect(0,0,g.W,g.H);
 const ox=(g.W-d.N*22)/2,oy=50,s=22;
 c.fillStyle="#0a2412";c.fillRect(ox-6,oy-6,d.N*s+12,d.M*s+12);
 c.strokeStyle="#00ff88";c.lineWidth=2;c.strokeRect(ox-6,oy-6,d.N*s+12,d.M*s+12);
 d.snake.forEach((sg,i)=>{c.fillStyle=i===0?"#ffd23f":(i%2?"#00ff88":"#00cc66");c.fillRect(ox+sg.x*s+1,oy+sg.y*s+1,s-2,s-2);
  if(i===0){c.fillStyle="#000";c.fillRect(ox+sg.x*s+6,oy+sg.y*s+6,4,4);c.fillRect(ox+sg.x*s+12,oy+sg.y*s+6,4,4);}});
 const f=d.food;c.fillStyle="#ff2fb3";const p=3+Math.sin(d.flash*6)*2;
 c.beginPath();c.arc(ox+f.x*s+s/2,oy+f.y*s+s/2,s/2-3+p*.4,0,7);c.fill();
 if(d.gold){c.fillStyle="#ffd23f";c.beginPath();c.arc(ox+d.gold.x*s+s/2,oy+d.gold.y*s+s/2,s/2-1+Math.sin(d.flash*10)*2.5,0,7);c.fill();
  c.fillStyle="#fff";c.font="bold 11px sans-serif";c.textAlign="center";c.fillText("★",ox+d.gold.x*s+s/2,oy+d.gold.y*s+s/2+4);}
 c.fillStyle="#fff";c.font="bold 14px monospace";c.textAlign="left";
 drawTop(g,"COMPRIMENTO "+d.snake.length+"  •  PONTOS "+Math.floor(g.score));
}};
function placeFood(g){const d=g.data;while(true){const f={x:(Math.random()*d.N)|0,y:(Math.random()*d.M)|0};
 if(!d.snake.some(s=>s.x===f.x&&s.y===f.y)){d.food=f;return;}}}
function placeFree(g){const d=g.data;for(let i=0;i<60;i++){const f={x:(Math.random()*d.N)|0,y:(Math.random()*d.M)|0};
 if(!d.snake.some(s=>s.x===f.x&&s.y===f.y)&&(f.x!==d.food.x||f.y!==d.food.y))return f;}return null;}

/* ---------- 3. TIJOLINHOS + power-ups (L/M/Vida) ---------- */
const Bricks={
title:"TIJOLINHOS",sub:"Quebre tudo! Cápsulas: L raquete • M multibola • ❤ vida",
init(g){const cols=8,rows=5,blocks=[];
 for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){let pow=null;const rr=Math.random();
  if(rr<.09)pow="L";else if(rr<.17)pow="M";else if(rr<.22)pow="❤";
  blocks.push({x:70+q*103,y:60+r*30,w:95,h:22,hp:r===0?2:1,pow,c:["#ff2fb3","#ff7a00","#ffd23f","#00f0ff","#00ff88"][r]});}
 g.data={px:g.W/2,bw:110,balls:[{x:g.W/2,y:g.H-90,vx:0,vy:0,stuck:true}],blocks,caps:[],expand:0,t:0};},
update(g,dt){const d=g.data,inp=g.input,sp=460*dt;
 const pw=d.bw*(d.expand>0?1.5:1);
 if(inp.left)d.px-=sp;if(inp.right)d.px+=sp;
 if(inp.pointer.active&&inp.pointer.dx!==0)d.px+=inp.pointer.dx*1.4;
 d.px=clamp(d.px,pw/2+8,g.W-pw/2-8);
 d.expand-=dt;
 const launch=inp.firePressed||inp.pointerTapped;
 if(launch){for(const b of d.balls)if(b.stuck){b.stuck=false;const a=rand(-1,1)*0.9-Math.PI/2;b.vx=Math.cos(a)*360;b.vy=Math.sin(a)*360;}if(d.balls.some(b=>!b.stuck))g.sfx("shoot");}
 for(const b of d.balls){
  if(b.stuck){b.x=d.px;b.y=g.H-90;continue;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<10||b.x>g.W-10){b.vx*=-1;b.x=clamp(b.x,10,g.W-10);g.sfx("hit");}
  if(b.y<40){b.vy*=-1;b.y=40;g.sfx("hit");}
  if(b.vy>0&&b.y>g.H-70&&b.y<g.H-50&&Math.abs(b.x-d.px)<pw/2+8){const off=(b.x-d.px)/(pw/2);const a=-Math.PI/2+off*1.1;const s=Math.min(520,Math.hypot(b.vx,b.vy)+12);b.vx=Math.cos(a)*s;b.vy=Math.sin(a)*s;g.sfx("hit");}
  for(const bl of d.blocks){if(bl.hp>0&&b.x>bl.x&&b.x<bl.x+bl.w&&b.y>bl.y&&b.y<bl.y+bl.h){bl.hp--;b.vy*=-1;g.addScore(50);g.sfx("eat");
   if(bl.pow){d.caps.push({x:bl.x+bl.w/2,y:bl.y+bl.h,vy:130,type:bl.pow,t:9});bl.pow=null;}
   if(d.blocks.every(x=>x.hp<=0)){g.addScore(500);g.finish(true,"FASE LIMPA! Pontos: "+g.score);}break;}}
  if(b.y>g.H+10)b.dead=true;
 }
 d.balls=d.balls.filter(b=>!b.dead);
 if(!d.balls.length){g.lives--;g.sfx("boom");
  if(g.lives<=0)g.finish(false,"SEM BOLAS! Pontos: "+g.score);
  else d.balls=[{x:d.px,y:g.H-90,vx:0,vy:0,stuck:true}];}
 // cápsulas caindo
 for(const k of d.caps){k.y+=k.vy*dt;k.t-=dt;
  if(Math.abs(k.x-d.px)<pw/2+12&&k.y>g.H-72&&k.y<g.H-38){k.got=true;g.collect();
   if(k.type==="L"){d.expand=10;g.sfx("expand");g.toast("🔵 RAQUETE GIGANTE!");}
   else if(k.type==="M"){const fly=d.balls.filter(b=>!b.stuck);
    if(!fly.length){const s=d.balls[0];if(s){s.stuck=false;const a=-Math.PI/2;b0(s,a);}}
    else for(const b of [...fly]){const s1=Math.hypot(b.vx,b.vy);const a0=Math.atan2(b.vy,b.vx);
     for(const da of[-.5,.5])d.balls.push({x:b.x,y:b.y,vx:Math.cos(a0+da)*s1,vy:Math.sin(a0+da)*s1,stuck:false});}
    g.toast("🟣 MULTIBOLA!");g.sfx("multi");}
   else{g.lives=Math.min(5,g.lives+1);g.sfx("life");g.toast("❤ VIDA EXTRA!");}}}
 d.caps=d.caps.filter(k=>!k.got&&k.t>0&&k.y<g.H+20);
},
draw(g){const c=g.ctx,d=g.data;const pw=d.bw*(d.expand>0?1.5:1);
 c.fillStyle="#0d0d22";c.fillRect(0,0,g.W,g.H);
 c.strokeStyle="#33335a";for(let i=0;i<20;i++){c.beginPath();c.moveTo(i*50,0);c.lineTo(i*50-60,g.H);c.stroke();}
 for(const bl of d.blocks){if(bl.hp>0){c.fillStyle=bl.c;c.globalAlpha=bl.hp>1?1:.55;c.fillRect(bl.x,bl.y,bl.w,bl.h);c.globalAlpha=1;c.fillStyle="#ffffff55";c.fillRect(bl.x,bl.y,bl.w,5);
  if(bl.pow){c.fillStyle="#fff";c.font="bold 11px sans-serif";c.textAlign="center";c.fillText(bl.pow==="❤"?"❤":bl.pow,bl.x+bl.w/2,bl.y+bl.h-6);}}}
 for(const k of d.caps){c.fillStyle=k.type==="L"?"#00f0ff":k.type==="M"?"#ff2fb3":"#ff3355";
  c.beginPath();c.arc(k.x,k.y,12,0,7);c.fill();c.fillStyle="#fff";c.font="bold 12px sans-serif";c.textAlign="center";
  c.fillText(k.type==="❤"?"❤":k.type,k.x,k.y+4);}
 c.fillStyle=d.expand>0?"#7df9ff":"#00f0ff";c.fillRect(d.px-pw/2,g.H-60,pw,14);
 for(const b of d.balls){c.fillStyle="#ffd23f";c.beginPath();c.arc(b.x,b.y,8,0,7);c.fill();
  c.fillStyle="#fff";c.beginPath();c.arc(b.x-2,b.y-2,3,0,7);c.fill();}
 drawTop(g,"TIJOLOS "+d.blocks.filter(b=>b.hp>0).length+" • VIDAS "+g.lives+(d.expand>0?" • 🔵"+Math.ceil(d.expand):""));
}};
function b0(s,a){s.vx=Math.cos(a)*360;s.vy=Math.sin(a)*360;}

/* ---------- 4. NAVINHA + power-ups ---------- */
const Nave={
title:"NAVINHA ESPACIAL",sub:"Power-ups: P tiro duplo • S escudo • B bomba • ❤",
init(g){g.data={px:g.W/2,py:g.H-90,shots:[],foes:[],powers:[],parts:[],stars:[],dbl:0,shield:0,wave:1,t:0,ft:0,st:0};
 for(let i=0;i<70;i++)g.data.stars.push({x:Math.random()*g.W,y:Math.random()*g.H,s:rand(.5,2),v:rand(40,160)});},
update(g,dt){const d=g.data,inp=g.input,sp=340*dt;
 if(inp.left)d.px-=sp;if(inp.right)d.px+=sp;if(inp.up)d.py-=sp;if(inp.down)d.py+=sp;
 if(inp.pointer.active){d.px+=inp.pointer.dx*1.5;d.py+=inp.pointer.dy*1.5;}
 d.px=clamp(d.px,24,g.W-24);d.py=clamp(d.py,80,g.H-40);
 d.t+=dt;d.ft-=dt;d.dbl-=dt;d.shield-=dt;
 if(d.ft<=0){d.ft=.16;
  if(d.dbl>0)d.shots.push({x:d.px-12,y:d.py-18},{x:d.px,y:d.py-22},{x:d.px+12,y:d.py-18});
  else d.shots.push({x:d.px-8,y:d.py-18},{x:d.px+8,y:d.py-18});
  g.sfx("shoot");}
 for(const s of d.shots)s.y-=560*dt;
 d.shots=d.shots.filter(s=>s.y>-20);
 d.st-=dt;if(d.st<=0){d.st=Math.max(.35,1.2-d.wave*.12);d.foes.push({x:rand(30,g.W-30),y:-30,vy:rand(80,140)+d.wave*15,vx:rand(-60,60),hp:1+((d.wave/3)|0),t:rand(0,2)});}
 for(const f of d.foes){f.t+=dt;f.y+=f.vy*dt;f.x+=Math.sin(f.t*3)*60*dt;}
 for(const s of d.shots)for(const f of d.foes){if(!f.dead&&!s.dead&&Math.abs(s.x-f.x)<20&&Math.abs(s.y-f.y)<22){s.dead=true;f.hp--;
  if(f.hp<=0){f.dead=true;g.addScore(80);burst(d,f.x,f.y,"#ff7a00");g.sfx("boom");
   if(Math.random()<.25)d.powers.push({x:f.x,y:f.y,vy:130,type:["P","S","B","❤"][((Math.random()*4)|0)],t:10});}}}
 d.shots=d.shots.filter(s=>!s.dead);d.foes=d.foes.filter(f=>!f.dead&&f.y<g.H+40);
 for(const f of d.foes){if(Math.abs(f.x-d.px)<26&&Math.abs(f.y-d.py)<26){d.foes.splice(d.foes.indexOf(f),1);
  if(d.shield>0){burst(d,d.px,d.py,"#00f0ff");g.sfx("hit");}
  else{g.lives--;burst(d,d.px,d.py,"#00f0ff");g.sfx("boom");if(g.lives<=0)g.finish(false,"NAVE ABATIDA! Pontos: "+Math.floor(g.score));}break;}}
 for(const p of d.powers){p.y+=p.vy*dt;p.t-=dt;
  if(Math.abs(p.x-d.px)<28&&Math.abs(p.y-d.py)<28){p.got=true;g.collect();
   if(p.type==="P"){d.dbl=12;g.sfx("rapid");g.toast("🔫 TIRO DUPLO!");}
   else if(p.type==="S"){d.shield=8;g.sfx("shield");g.toast("🛡 ESCUDO!");}
   else if(p.type==="B"){for(const f of d.foes){f.dead=true;g.addScore(80);burst(d,f.x,f.y,"#ff7a00");}g.toast("💥 BOMBA ESPACIAL!");g.sfx("mega");}
   else{g.lives=Math.min(5,g.lives+1);g.sfx("life");g.toast("❤ VIDA EXTRA!");}}}
 d.powers=d.powers.filter(p=>!p.got&&p.t>0&&p.y<g.H+20);
 d.foes=d.foes.filter(f=>!f.dead);
 for(const st of d.stars){st.y+=st.v*dt;if(st.y>g.H){st.y=0;st.x=Math.random()*g.W;}}
 if(!g.over){g.score+=dt*10;if(g.score>d.wave*600){d.wave++;g.toast("ONDA "+d.wave);g.addScore(150);}}
},
draw(g){const c=g.ctx,d=g.data;c.fillStyle="#040410";c.fillRect(0,0,g.W,g.H);
 c.fillStyle="#fff";for(const st of d.stars){c.globalAlpha=.4+st.s*.3;c.fillRect(st.x,st.y,st.s,st.s*3);}c.globalAlpha=1;
 for(const p of d.powers){c.fillStyle="#000a";c.beginPath();c.arc(p.x,p.y,14,0,7);c.fill();
  c.fillStyle=p.type==="❤"?"#ff3355":"#ffd23f";c.font="bold 14px sans-serif";c.textAlign="center";c.fillText(p.type==="❤"?"❤":p.type,p.x,p.y+5);}
 for(const f of d.foes){c.fillStyle="#ff3355";c.beginPath();c.moveTo(f.x,f.y+14);c.lineTo(f.x-14,f.y-10);c.lineTo(f.x+14,f.y-10);c.closePath();c.fill();c.fillStyle="#7a0f22";c.fillRect(f.x-4,f.y-8,8,10);}
 c.fillStyle=d.dbl>0?"#ffd23f":"#00f0ff";c.beginPath();c.moveTo(d.px,d.py-20);c.lineTo(d.px-14,d.py+12);c.lineTo(d.px,d.py+4);c.lineTo(d.px+14,d.py+12);c.closePath();c.fill();
 if(d.shield>0){c.strokeStyle="#00f0ff";c.lineWidth=3;c.beginPath();c.arc(d.px,d.py,30+Math.sin(d.t*8)*3,0,7);c.stroke();}
 c.fillStyle="#ffd23f";c.fillRect(d.px-2,d.py-6,4,10);
 c.fillStyle="#ffd23f";for(const s of d.shots)c.fillRect(s.x-2,s.y-8,4,12);
 let extra="";if(d.dbl>0)extra+=" • 🔫";if(d.shield>0)extra+=" • 🛡";
 drawTop(g,"ONDA "+d.wave+" • VIDAS "+g.lives+" • PONTOS "+Math.floor(g.score)+extra);
}};

/* ---------- 5. CORRIDA TURBO + recompensas ---------- */
const Race={
title:"CORRIDA TURBO",sub:"⛽ pontos • 🛡 protege • ⭐ invencível e quebra tudo!",
init(g){g.data={px:g.W/2,foes:[],items:[],lines:[],t:0,ft:.7,speed:380,dist:0,prot:false,inv:0};
 for(let i=0;i<8;i++)g.data.lines.push({y:i*80});},
update(g,dt){const d=g.data,inp=g.input;
 const sp=420*dt;
 if(inp.left)d.px-=sp;if(inp.right)d.px+=sp;
 if(inp.pointer.active)d.px+=inp.pointer.dx*1.6;
 d.px=clamp(d.px,g.W/2-180,g.W/2+180);
 d.t+=dt;d.speed+=dt*8;d.dist+=d.speed*dt;d.inv-=dt;
 for(const l of d.lines){l.y+=d.speed*dt;if(l.y>g.H)l.y-=8*80;}
 d.ft-=dt;
 if(d.ft<=0){d.ft=Math.max(.3,.8-d.t*.012);const lane=g.W/2+rand(-1,1)*160;const r=Math.random();
  if(r<.55)d.foes.push({x:lane,y:-60,w:44,h:70,c:["#ff3355","#b388ff","#ff7a00"][((Math.random()*3)|0)],v:rand(.5,.8)});
  else d.items.push({x:lane,y:-40,type:r<.68?"⛽":r<.8?"🛡":r<.9?"⭐":"T"});}
 for(const f of d.foes)f.y+=(d.speed*f.v+120)*dt;
 for(const k of d.items)k.y+=d.speed*dt*.9;
 d.foes=d.foes.filter(f=>f.y<g.H+90);d.items=d.items.filter(k=>k.y<g.H+40);
 const P={x:d.px-22,y:g.H-140,w:44,h:70};
 for(const f of d.foes){if(!f.dead&&overlap(P,{x:f.x-22,y:f.y-35,w:44,h:70})){
  if(d.inv>0){f.dead=true;g.addScore(50);burst(d,f.x,f.y,"#ffd23f");g.sfx("boom");g.toast("+50 QUEBROU! ⭐");}
  else if(d.prot){f.dead=true;d.prot=false;burst(d,f.x,f.y,"#00f0ff");g.sfx("hit");g.toast("🛡 Escudo salvou!");}
  else{g.finish(false,"BATIDA! Distância: "+((d.dist/50)|0)+"m • Pontos: "+Math.floor(g.score));return;}}}
 d.foes=d.foes.filter(f=>!f.dead);
 for(const k of d.items){if(!k.dead&&Math.abs(k.x-d.px)<32&&Math.abs(k.y-(g.H-105))<52){k.dead=true;g.collect();
  if(k.type==="T"){g.addScore(60);g.sfx("eat");}
  else if(k.type==="⛽"){g.addScore(100);g.sfx("fuel");g.toast("⛽ +100 COMBUSTÍVEL!");}
  else if(k.type==="🛡"){d.prot=true;g.sfx("shield");g.toast("🛡 ESCUDO ATIVO!");}
  else{d.inv=5;g.sfx("star");g.toast("⭐ INVENCÍVEL! QUEBRE TUDO!");}}}
 d.items=d.items.filter(k=>!k.dead);
 if(!g.over)g.score+=dt*25;
},
draw(g){const c=g.ctx,d=g.data;c.fillStyle="#0a3d1f";c.fillRect(0,0,g.W,g.H);
 c.fillStyle="#2b2b35";c.fillRect(g.W/2-230,0,460,g.H);
 c.fillStyle="#ffd23f";for(let y=-20;y<g.H;y+=60){c.fillRect(g.W/2-235,y,8,30);c.fillRect(g.W/2+227,y,8,30);}
 c.fillStyle="#fff";for(const l of d.lines)c.fillRect(g.W/2-3,l.y,6,36);
 for(const k of d.items){c.fillStyle="#000a";c.beginPath();c.arc(k.x,k.y,14,0,7);c.fill();
  if(k.type==="T"){c.fillStyle="#ffd23f";c.beginPath();c.arc(k.x,k.y,10,0,7);c.fill();c.fillStyle="#7a5a00";c.font="bold 11px monospace";c.textAlign="center";c.fillText("T",k.x,k.y+4);}
  else emoji(c,k.type,k.x,k.y,20);}
 for(const f of d.foes)drawCar(c,f.x,f.y,f.c);
 if(d.inv>0){c.strokeStyle="#ffd23f";c.lineWidth=3;c.beginPath();c.arc(d.px,g.H-105,44+Math.sin(d.t*10)*4,0,7);c.stroke();}
 drawCar(c,d.px,g.H-105,d.prot?"#7df9ff":"#00f0ff");
 let extra="";if(d.prot)extra+=" • 🛡";if(d.inv>0)extra+=" • ⭐"+Math.ceil(d.inv);
 drawTop(g,"VELOCIDADE "+((d.speed/10)|0)+"km/h • PONTOS "+Math.floor(g.score)+extra);
}};
function drawCar(c,x,y,col){c.fillStyle="#00000088";c.fillRect(x-24,y-32,48,76);
 c.fillStyle=col;c.fillRect(x-22,y-35,44,70);c.fillStyle="#111";c.fillRect(x-18,y-20,36,16);
 c.fillStyle="#bff3ff";c.fillRect(x-16,y-28,32,8);c.fillStyle="#222";c.fillRect(x-27,y-25,6,18);c.fillRect(x+21,y-25,6,18);c.fillRect(x-27,y+10,6,18);c.fillRect(x+21,y+10,6,18);}

/* ---------- 6. PONG NEON + orbes ---------- */
const Pong={
title:"PONG NEON",sub:"Pegue os orbes: ★ raquete gigante • ❄ bola lenta!",
init(g){g.data={py:g.H/2,ey:g.H/2,ball:{x:g.W/2,y:g.H/2,vx:Math.random()<.5?-300:300,vy:rand(-160,160)},ps:0,es:0,t:0,orb:null,ot:4,big:0,alt:true};},
update(g,dt){const d=g.data,inp=g.input,sp=380*dt;
 if(inp.up)d.py-=sp;if(inp.down)d.py+=sp;
 if(inp.pointer.active)d.py+=inp.pointer.dy*1.6;
 d.py=clamp(d.py,70,g.H-70);d.big-=dt;
 const PH=d.big>0?78:50;
 const b=d.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;
 if(b.y<40||b.y>g.H-10){b.vy*=-1;b.y=clamp(b.y,40,g.H-10);g.sfx("hit");}
 if(b.vx<0&&b.x<48&&b.x>20&&Math.abs(b.y-d.py)<PH+8){b.vx=Math.abs(b.vx)*1.06;b.vy+=(b.y-d.py)*6;g.sfx("hit");}
 if(b.vx>0&&b.x>g.W-48&&b.x<g.W-20&&Math.abs(b.y-d.ey)<PH+8){b.vx=-Math.abs(b.vx)*1.06;b.vy+=(b.y-d.ey)*6;g.sfx("hit");}
 const err=Math.sin(d.t*1.7)*30;d.ey+=clamp((b.y+err)-d.ey,-1,1)*300*dt;d.ey=clamp(d.ey,70,g.H-70);d.t+=dt;
 // orbe de recompensa no centro
 d.ot-=dt;
 if(d.ot<=0&&!d.orb){d.alt=!d.alt;d.orb={x:g.W/2,y:rand(150,g.H-150),type:d.alt?"★":"❄",t:9};}
 if(d.orb){d.orb.t-=dt;
  if(Math.hypot(b.x-d.orb.x,b.y-d.orb.y)<24){g.sfx("orb");g.collect();
   if(d.orb.type==="★"){d.big=8;g.toast("★ RAQUETE GIGANTE!");}
   else{b.vx*=.6;b.vy*=.6;g.toast("❄ CÂMERA LENTA!");}
   d.orb=null;d.ot=7;}
  else if(d.orb.t<=0){d.orb=null;d.ot=7;}}
 if(b.x<-20){d.es++;g.sfx("boom");resetBall(g,1);if(d.es>=5)g.finish(false,"A IA VENCEU "+d.es+" x "+d.ps);}
 if(b.x>g.W+20){d.ps++;g.addScore(150);g.sfx("eat");resetBall(g,-1);if(d.ps>=5)g.finish(true,"VOCÊ VENCEU "+d.ps+" x "+d.es+"! Pontos: "+g.score);}
},
draw(g){const c=g.ctx,d=g.data;c.fillStyle="#080816";c.fillRect(0,0,g.W,g.H);
 c.strokeStyle="#00f0ff55";c.setLineDash([10,10]);c.beginPath();c.moveTo(g.W/2,30);c.lineTo(g.W/2,g.H);c.stroke();c.setLineDash([]);
 const PH=d.big>0?78:50;
 c.fillStyle="#00f0ff";c.fillRect(24,d.py-PH,12,PH*2);c.fillStyle="#ff2fb3";c.fillRect(g.W-36,d.ey-PH,12,PH*2);
 if(d.orb){const a=.6+Math.sin(d.t*8)*.4;c.globalAlpha=a;
  c.fillStyle=d.orb.type==="★"?"#ffd23f":"#7df9ff";c.beginPath();c.arc(d.orb.x,d.orb.y,16,0,7);c.fill();
  c.fillStyle="#000";c.font="bold 15px sans-serif";c.textAlign="center";c.fillText(d.orb.type==="★"?"★":"❄",d.orb.x,d.orb.y+5);c.globalAlpha=1;}
 const b=d.ball;const grd=c.createRadialGradient(b.x,b.y,2,b.x,b.y,16);grd.addColorStop(0,"#fff");grd.addColorStop(1,"#ffd23f");
 c.fillStyle=grd;c.beginPath();c.arc(b.x,b.y,10,0,7);c.fill();
 c.fillStyle="#fff";c.font="900 40px monospace";c.textAlign="center";c.fillText(d.ps,g.W/2-60,80);c.fillText(d.es,g.W/2+60,80);
 drawTop(g,"VOCÊ "+d.ps+" x "+d.es+" IA — primeiro aos 5"+(d.big>0?" • ★":""));
}};
function resetBall(g,dir){const d=g.data;d.ball={x:g.W/2,y:g.H/2,vx:300*dir,vy:rand(-160,160)};}

/* ---------- 7. BASQUETE (lances livres) ---------- */
const Basket={
title:"🏀 BASQUETE",sub:"Arraste para mirar e solte! Ou ajuste com ◀ ▶ ▲ ▼ e A.",
init(g){g.data={shots:10,baskets:0,ang:50*Math.PI/180,pow:640,t:0,
 hoopX:g.W/2+140,ball:{x:g.W/2-260,y:g.H-140,vx:0,vy:0,fly:false},rim:false,
 drag:null,wasActive:false};},
update(g,dt){const d=g.data,inp=g.input,GG=1000;
 d.t+=dt;
 d.hoopX=g.W/2+140+Math.sin(d.t*.8)*170;
 const b=d.ball;
 // mira teclado
 if(inp.left)d.ang+=1.6*dt;if(inp.right)d.ang-=1.6*dt;
 if(inp.up)d.pow+=260*dt;if(inp.down)d.pow-=260*dt;
 d.ang=clamp(d.ang,15*Math.PI/180,80*Math.PI/180);d.pow=clamp(d.pow,300,950);
 // arrastar (estilingue)
 if(inp.pointer.active&&!b.fly){if(!d.drag)d.drag={x0:inp.pointer.x,y0:inp.pointer.y,moved:false};
  if(Math.hypot(inp.pointer.x-d.drag.x0,inp.pointer.y-d.drag.y0)>12)d.drag.moved=true;}
 else if(d.wasActive&&d.drag&&!b.fly){
  if(d.drag.moved){const vx=(d.drag.x0-inp.pointer.x)*5,vy=(d.drag.y0-inp.pointer.y)*5;
   shootBasket(g,clamp(vx,-700,700),clamp(vy,-950,-200));}
  d.drag=null;inp.pointerTapped=false;}
 d.wasActive=inp.pointer.active;
 if((inp.firePressed||inp.pointerTapped)&&!b.fly&&d.shots>0){
  shootBasket(g,Math.cos(d.ang)*d.pow,-Math.sin(d.ang)*d.pow);inp.pointerTapped=false;}
 if(b.fly){const px=b.x,py=b.y;
  b.vy+=GG*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  const cx=d.hoopX,rw=36;
  // tabela
  if(b.x+12>cx+rw+10&&b.x-12<cx+rw+22&&b.y>70&&b.y<170&&b.vx>0){b.vx*=-.6;b.x=cx+rw+10-12;}
  // aros
  for(const rx of[cx-rw,cx+rw]){const dd=Math.hypot(b.x-rx,b.y-130);
   if(dd<17){const nx=(b.x-rx)/(dd||1),ny=(b.y-130)/(dd||1);d.rim=true;
    const vn=b.vx*nx+b.vy*ny;b.vx=(b.vx-2*vn*nx)*.65;b.vy=(b.vy-2*vn*ny)*.65;
    b.x=rx+nx*17;b.y=130+ny*17;g.sfx("hit");}}
  // cesta?
  if(py<130&&b.y>=130&&Math.abs(b.x-cx)<rw-8&&b.vy>0){
   b.fly=false;d.baskets++;g.addScore(d.rim?100:150);g.sfx("coin");
   g.toast(d.rim?"CESTA! +100 🏀":"NA MOSCA! +150 🔥");d.rim=false;resetBasket(g);checkBasket(g);return;}
  // chão / fora
  if(b.y>g.H-24&&Math.abs(b.vy)<90){b.fly=false;g.toast("Errou...");resetBasket(g);checkBasket(g);return;}
  if(b.y>g.H-24){b.vy*=-.45;b.y=g.H-24;g.sfx("hit");}
  if(b.x<-30||b.x>g.W+30||b.y<-200){b.fly=false;resetBasket(g);checkBasket(g);return;}
 }
},
draw(g){const c=g.ctx,d=g.data;c.fillStyle="#0d1a33";c.fillRect(0,0,g.W,g.H);
 c.fillStyle="#12305e";c.fillRect(60,60,g.W-120,g.H-100);
 c.strokeStyle="#ffffff44";c.lineWidth=3;c.strokeRect(60,60,g.W-120,g.H-100);
 c.beginPath();c.arc(g.W/2,300,70,0,7);c.stroke();
 const cx=d.hoopX;
 c.fillStyle="#222";c.fillRect(cx+52,40,10,100);
 c.fillStyle="#fff";c.fillRect(cx+42,50,10,80);
 c.strokeStyle="#ff8c42";c.lineWidth=5;c.beginPath();c.ellipse(cx,130,36,7,0,0,7);c.stroke();
 c.strokeStyle="#ff8c4244";c.lineWidth=2;
 for(let i=0;i<4;i++){c.beginPath();c.moveTo(cx-30+i*20,137);c.lineTo(cx-24+i*16,168);c.stroke();}
 const b=d.ball;
 if(!b.fly){ // seta de mira
  let ax,ay;
  if(d.drag&&d.drag.moved){ax=(d.drag.x0-inp0(g).x)*5;ay=(d.drag.y0-inp0(g).y)*5;}
  else{ax=Math.cos(d.ang)*d.pow;ay=-Math.sin(d.ang)*d.pow;}
  c.strokeStyle="#ffd23f";c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.moveTo(b.x,b.y);
  c.lineTo(b.x+ax*.25,b.y+ay*.25);c.stroke();c.setLineDash([]);}
 c.fillStyle="#ff8c42";c.beginPath();c.arc(b.x,b.y,13,0,7);c.fill();
 c.strokeStyle="#7a3f00";c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,13,0,7);c.stroke();
 c.beginPath();c.moveTo(b.x-13,b.y);c.lineTo(b.x+13,b.y);c.moveTo(b.x,b.y-13);c.lineTo(b.x,b.y+13);c.stroke();
 drawTop(g,"CESTAS "+d.baskets+" • BOLAS "+d.shots+" • PONTOS "+Math.floor(g.score));
}};
function inp0(g){return g.input.pointer;}
function shootBasket(g,vx,vy){const d=g.data;if(d.shots<=0)return;d.shots--;d.ball.fly=true;d.ball.vx=vx;d.ball.vy=vy;d.rim=false;g.sfx("shoot");}
function resetBasket(g){const d=g.data;d.ball={x:g.W/2-260,y:g.H-140,vx:0,vy:0,fly:false};}
function checkBasket(g){const d=g.data;
 if(d.shots<=0)g.finish(d.baskets>=5,d.baskets+"/10 CESTAS! Pontos: "+g.score);}

/* ---------- 8. TIRO AO ALVO ---------- */
const Target={
title:"🎯 TIRO AO ALVO",sub:"Mire e atire! Centro vale o dobro. 45 segundos!",
init(g){g.data={time:45,cx:g.W/2,cy:g.H/2,cd:0,targets:[],st:.4,t:0,puffs:[]};},
update(g,dt){const d=g.data,inp=g.input,sp=460*dt;
 if(inp.left)d.cx-=sp;if(inp.right)d.cx+=sp;if(inp.up)d.cy-=sp;if(inp.down)d.cy+=sp;
 if(inp.pointer.active){d.cx+=inp.pointer.dx*1.4;d.cy+=inp.pointer.dy*1.4;}
 d.cx=clamp(d.cx,20,g.W-20);d.cy=clamp(d.cy,50,g.H-20);
 d.t+=dt;d.cd-=dt;d.time-=dt;
 if(d.time<=0){g.finish(g.score>=800,"TEMPO ESGOTADO! Pontos: "+g.score);return;}
 d.st-=dt;
 if(d.st<=0){d.st=rand(.5,.95);const r=Math.random();
  d.targets.push({x:rand(70,g.W-70),y:rand(90,g.H-70),vx:rand(-90,90),vy:rand(-60,60),
   r:r<.15?20:r<.5?30:40,type:r<.15?"star":r<.5?"bull":"ring",t:r<.15?2:rand(2.5,4)});}
 for(const tg of d.targets){tg.t-=dt;tg.x+=tg.vx*dt;tg.y+=tg.vy*dt;
  if(tg.x<50||tg.x>g.W-50)tg.vx*=-1;if(tg.y<70||tg.y>g.H-40)tg.vy*=-1;}
 d.targets=d.targets.filter(t=>t.t>0);
 d.puffs=d.puffs.filter(p=>(p.l-=dt)>0);
 if((inp.firePressed||inp.pointerTapped)&&d.cd<=0){d.cd=.25;inp.pointerTapped=false;
  let hit=null,hi=-1;
  for(let i=d.targets.length-1;i>=0;i--){const tg=d.targets[i];
   if(Math.hypot(d.cx-tg.x,d.cy-tg.y)<tg.r){hit=tg;hi=i;break;}}
  if(hit){d.targets.splice(hi,1);
   let pts=hit.type==="star"?300:hit.type==="bull"?200:100;
   if(Math.hypot(d.cx-hit.x,d.cy-hit.y)<hit.r*.35){pts*=2;g.sfx("bull");g.toast("NO CENTRO! +"+pts+" 🎯");}
   g.addScore(pts);g.sfx("boom");d.puffs.push({x:hit.x,y:hit.y,l:.4,c:"#ffd23f"});}
  else{g.sfx("hit");d.puffs.push({x:d.cx,y:d.cy,l:.25,c:"#888"});}}
},
draw(g){const c=g.ctx,d=g.data;
 const gr=c.createLinearGradient(0,0,0,g.H);gr.addColorStop(0,"#1a0f2e");gr.addColorStop(1,"#0a0a18");
 c.fillStyle=gr;c.fillRect(0,0,g.W,g.H);
 c.strokeStyle="#ffffff22";c.lineWidth=2;
 for(let i=0;i<5;i++){c.beginPath();c.moveTo(0,120+i*90);c.lineTo(g.W,120+i*90);c.stroke();}
 for(const tg of d.targets){const a=clamp(tg.t,0,1);c.globalAlpha=a;
  if(tg.type==="star"){emoji(c,"⭐",tg.x,tg.y,tg.r*2.4);}
  else{const R=tg.r;
   c.fillStyle="#ff4444";c.beginPath();c.arc(tg.x,tg.y,R,0,7);c.fill();
   c.fillStyle="#fff";c.beginPath();c.arc(tg.x,tg.y,R*.65,0,7);c.fill();
   c.fillStyle="#ff4444";c.beginPath();c.arc(tg.x,tg.y,R*.35,0,7);c.fill();
   if(tg.type==="bull"){c.fillStyle="#ffd23f";c.beginPath();c.arc(tg.x,tg.y,R*.15,0,7);c.fill();}}
  c.globalAlpha=1;}
 for(const p of d.puffs){c.globalAlpha=clamp(p.l*2.5,0,1);c.strokeStyle=p.c;c.lineWidth=3;
  c.beginPath();c.arc(p.x,p.y,(0.4-p.l)*60+8,0,7);c.stroke();c.globalAlpha=1;}
 // mira
 c.strokeStyle="#00ff88";c.lineWidth=2.5;
 c.beginPath();c.arc(d.cx,d.cy,18,0,7);c.stroke();
 c.beginPath();c.moveTo(d.cx-28,d.cy);c.lineTo(d.cx-10,d.cy);c.moveTo(d.cx+10,d.cy);c.lineTo(d.cx+28,d.cy);
 c.moveTo(d.cx,d.cy-28);c.lineTo(d.cx,d.cy-10);c.moveTo(d.cx,d.cy+10);c.lineTo(d.cx,d.cy+28);c.stroke();
 c.fillStyle="#00ff88";c.fillRect(d.cx-1,d.cy-1,3,3);
 // barra de tempo
 c.fillStyle="#333";c.fillRect(12,34,g.W-24,8);
 c.fillStyle=d.time>10?"#00ff88":"#ff4444";c.fillRect(12,34,(g.W-24)*clamp(d.time/45,0,1),8);
 drawTop(g,"TEMPO "+Math.ceil(d.time)+"s • PONTOS "+Math.floor(g.score)+(g.score>=800?" • META BATIDA!":""));
}};

/* ---------- 9. GOLFE (3 buracos) ---------- */
const GolfHoles=[
 {bx:150,by:430,cx:810,cy:140,par:3,walls:[{x:440,y:180,w:30,h:220}],sand:[{x:600,y:330,w:140,h:90}],water:[{x:300,y:110,w:120,h:70}]},
 {bx:810,by:430,cx:150,cy:140,par:3,walls:[{x:200,y:300,w:400,h:30},{x:640,y:120,w:30,h:200}],sand:[{x:350,y:140,w:120,h:80}],water:[{x:650,y:350,w:130,h:80}]},
 {bx:480,by:450,cx:480,cy:110,par:4,walls:[{x:250,y:180,w:30,h:240},{x:680,y:180,w:30,h:240}],sand:[{x:400,y:260,w:160,h:90}],water:[{x:150,y:380,w:120,h:70},{x:690,y:380,w:120,h:70}]},
];
const Golf={
title:"⛳ GOLFE",sub:"Arraste para mirar e solte! 3 buracos, poucas tacadas!",
init(g){g.data={hi:0,st:0,total:0,parT:GolfHoles.reduce((a,h)=>a+h.par,0),
 ball:{x:0,y:0,vx:0,vy:0},rest:{x:0,y:0},ang:-Math.PI/2,pow:400,drag:null,wasActive:false};
 setupHole(g);},
update(g,dt){const d=g.data,inp=g.input,H=GolfHoles[d.hi],b=d.ball;
 if(inp.left)d.ang-=1.8*dt;if(inp.right)d.ang+=1.8*dt;
 if(inp.up)d.pow+=320*dt;if(inp.down)d.pow-=320*dt;
 d.pow=clamp(d.pow,120,900);
 const stopped=Math.hypot(b.vx,b.vy)<14;
 if(inp.pointer.active&&stopped){if(!d.drag)d.drag={x0:inp.pointer.x,y0:inp.pointer.y,moved:false};
  if(Math.hypot(inp.pointer.x-d.drag.x0,inp.pointer.y-d.drag.y0)>12)d.drag.moved=true;}
 else if(d.wasActive&&d.drag&&stopped){
  if(d.drag.moved){const vx=(d.drag.x0-inp.pointer.x)*5,vy=(d.drag.y0-inp.pointer.y)*5;
   golfShoot(g,clamp(vx,-850,850),clamp(vy,-850,850));}
  d.drag=null;inp.pointerTapped=false;}
 d.wasActive=inp.pointer.active;
 if((inp.firePressed||inp.pointerTapped)&&stopped){golfShoot(g,Math.cos(d.ang)*d.pow,Math.sin(d.ang)*d.pow);inp.pointerTapped=false;}
 if(!stopped){
  const inSand=H.sand.some(s=>b.x>s.x&&b.x<s.x+s.w&&b.y>s.y&&b.y<s.y+s.h);
  const fr=inSand?4.5:1.1;
  b.vx-=b.vx*fr*dt;b.vy-=b.vy*fr*dt;
  if(Math.hypot(b.vx,b.vy)<14){b.vx=b.vy=0;d.rest={x:b.x,y:b.y};}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  // bordas
  if(b.x<92||b.x>g.W-92){b.vx*=-.7;b.x=clamp(b.x,92,g.W-92);g.sfx("hit");}
  if(b.y<82||b.y>g.H-42){b.vy*=-.7;b.y=clamp(b.y,82,g.H-42);g.sfx("hit");}
  for(const wl of H.walls){ // quinas simples: reflete eixo dominante
   if(b.x>wl.x-8&&b.x<wl.x+wl.w+8&&b.y>wl.y-8&&b.y<wl.y+wl.h+8){
    const dxl=Math.min(b.x-(wl.x-8),(wl.x+wl.w+8)-b.x),dyt=Math.min(b.y-(wl.y-8),(wl.y+wl.h+8)-b.y);
    if(dxl<dyt)b.vx*=-.7;else b.vy*=-.7;
    b.x+=b.vx*dt*2;b.y+=b.vy*dt*2;g.sfx("hit");}}
  for(const wt of H.water){if(b.x>wt.x&&b.x<wt.x+wt.w&&b.y>wt.y&&b.y<wt.y+wt.h){
   d.st++;d.total++;b.x=d.rest.x;b.y=d.rest.y;b.vx=b.vy=0;g.sfx("splash");g.toast("💦 NA ÁGUA! +1 tacada");break;}}
  const dc=Math.hypot(b.x-H.cx,b.y-H.cy),sp2=Math.hypot(b.vx,b.vy);
  if((dc<12)||(dc<18&&sp2<250)){ // embocou!
   const pts=Math.max(50,250-(d.st-H.par)*40);
   g.addScore(pts);g.sfx("hole");g.toast("⛳ NA CAÇAPA! +"+pts);
   d.hi++;
   if(d.hi>=GolfHoles.length)g.finish(d.total<=d.parT+3,"FIM DE JOGO! "+d.total+" tacadas (par "+d.parT+") • Pontos: "+g.score);
   else{d.st=0;setupHole(g);}
   return;}
 }
},
draw(g){const c=g.ctx,d=g.data,H=GolfHoles[Math.min(d.hi,GolfHoles.length-1)];
 c.fillStyle="#0a2a12";c.fillRect(0,0,g.W,g.H);
 c.fillStyle="#1d7a2d";c.fillRect(80,70,g.W-160,g.H-130);
 c.strokeStyle="#fff";c.lineWidth=3;c.strokeRect(80,70,g.W-160,g.H-130);
 for(const s of H.sand){c.fillStyle="#d9c27a";c.fillRect(s.x,s.y,s.w,s.h);}
 for(const w of H.water){c.fillStyle="#2277ff";c.fillRect(w.x,w.y,w.w,w.h);
  c.strokeStyle="#7db9ff";c.lineWidth=2;c.strokeRect(w.x,w.y,w.w,w.h);}
 for(const wl of H.walls){c.fillStyle="#5a3a1a";c.fillRect(wl.x,wl.y,wl.w,wl.h);}
 const b=d.ball,stopped=Math.hypot(b.vx,b.vy)<14;
 // buraco + bandeira
 c.fillStyle="#000";c.beginPath();c.arc(H.cx,H.cy,13,0,7);c.fill();
 c.strokeStyle="#fff";c.lineWidth=3;c.beginPath();c.moveTo(H.cx,H.cy);c.lineTo(H.cx,H.cy-46);c.stroke();
 c.fillStyle="#ff3355";c.beginPath();c.moveTo(H.cx,H.cy-46);c.lineTo(H.cx+26,H.cy-38);c.lineTo(H.cx,H.cy-30);c.closePath();c.fill();
 if(stopped){let ax,ay;
  if(d.drag&&d.drag.moved){ax=(d.drag.x0-g.input.pointer.x)*5;ay=(d.drag.y0-g.input.pointer.y)*5;}
  else{ax=Math.cos(d.ang)*d.pow;ay=Math.sin(d.ang)*d.pow;}
  const m=Math.hypot(ax,ay),ux=ax/(m||1),uy=ay/(m||1);
  c.strokeStyle="#ffd23f";c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.moveTo(b.x,b.y);
  c.lineTo(b.x+ux*Math.min(140,m*.18),b.y+uy*Math.min(140,m*.18));c.stroke();c.setLineDash([]);}
 c.fillStyle="#fff";c.beginPath();c.arc(b.x,b.y,9,0,7);c.fill();
 c.fillStyle="#ccc";c.beginPath();c.arc(b.x-2,b.y-2,3,0,7);c.fill();
 drawTop(g,"BURACO "+Math.min(d.hi+1,3)+"/3 • TACADAS "+d.st+" (par "+H.par+") • TOTAL "+d.total+" • PONTOS "+Math.floor(g.score));
}};
function setupHole(g){const d=g.data,H=GolfHoles[d.hi];
 d.ball={x:H.bx,y:H.by,vx:0,vy:0};d.rest={x:H.bx,y:H.by};
 d.ang=Math.atan2(H.cy-H.by,H.cx-H.bx);d.pow=400;}
function golfShoot(g,vx,vy){const d=g.data;if(Math.hypot(vx,vy)<40)return;
 d.ball.vx=vx;d.ball.vy=vy;d.st++;d.total++;g.sfx("shoot");}

/* ---------- 10. SINUCA (encaça pe as 6 em 15 tacadas) ---------- */
const Sinuca={
title:"🎱 SINUCA",sub:"Arraste para mirar e solte! 15 tacadas para 6 bolas.",
init(g){const T={x:120,y:96,w:720,h:368};
 const pockets=[{x:T.x+14,y:T.y+14},{x:T.x+T.w/2,y:T.y+10},{x:T.x+T.w-14,y:T.y+14},
  {x:T.x+14,y:T.y+T.h-14},{x:T.x+T.w/2,y:T.y+T.h-10},{x:T.x+T.w-14,y:T.y+T.h-14}];
 const cols=["#ff4444","#ffd23f","#00f0ff","#ff2fb3","#00ff88","#ff8c42"];
 const balls=[{x:T.x+180,y:T.y+T.h/2,vx:0,vy:0,cue:true,c:"#fff"}];
 const ax=T.x+T.w-200,ay=T.y+T.h/2;let k=0;
 for(let r=0;r<3;r++)for(let i=0;i<=r;i++){k++;balls.push({x:ax+r*24,y:ay+(i-r/2)*26,vx:0,vy:0,cue:false,c:cols[(k-1)%6],n:k});}
 g.data={T,pockets,balls,shots:15,potted:0,ang:0,pow:420,drag:null,wasActive:false,msg:""};},
update(g,dt){const d=g.data,inp=g.input,b=d.balls;
 const moving=b.some(o=>Math.hypot(o.vx,o.vy)>6);
 if(inp.left)d.ang-=1.8*dt;if(inp.right)d.ang+=1.8*dt;
 if(inp.up)d.pow+=320*dt;if(inp.down)d.pow-=320*dt;
 d.pow=clamp(d.pow,120,900);
 const cue=b[0];
 if(inp.pointer.active&&!moving){if(!d.drag)d.drag={x0:inp.pointer.x,y0:inp.pointer.y,moved:false};
  if(Math.hypot(inp.pointer.x-d.drag.x0,inp.pointer.y-d.drag.y0)>12)d.drag.moved=true;}
 else if(d.wasActive&&d.drag&&!moving){
  if(d.drag.moved)shootCue(g,(d.drag.x0-inp.pointer.x)*5,(d.drag.y0-inp.pointer.y)*5);
  d.drag=null;inp.pointerTapped=false;}
 d.wasActive=inp.pointer.active;
 if((inp.firePressed||inp.pointerTapped)&&!moving&&cue.live!==false){shootCue(g,Math.cos(d.ang)*d.pow,Math.sin(d.ang)*d.pow);inp.pointerTapped=false;}
 if(moving){
  for(const o of b){o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx-=o.vx*1.1*dt;o.vy-=o.vy*1.1*dt;
   if(Math.hypot(o.vx,o.vy)<6){o.vx=o.vy=0;}}
  // caçapas ANTES das tabelas (elas ficam na borda)
  for(const o of b){if(o.dead)continue;
   for(const pk of d.pockets){if(Math.hypot(o.x-pk.x,o.y-pk.y)<17){o.dead=true;o.vx=o.vy=0;
    if(o.cue){g.score=Math.max(0,g.score-50);g.sfx("boom");g.toast("❌ BRANCA ENCAÇAPADA! -50");
     o.dead=false;o.x=d.T.x+180;o.y=d.T.y+d.T.h/2;}
    else{d.potted++;g.addScore(100);g.sfx("coin");g.toast("🎱 +100! ("+d.potted+"/6)");}
    break;}}}
  // tabelas (com abertura na boca das caçapas)
  const L=d.T.x+24,R=d.T.x+d.T.w-24,U=d.T.y+24,D=d.T.y+d.T.h-24;
  const nearMouth=o=>d.pockets.some(pk=>Math.hypot(o.x-pk.x,o.y-pk.y)<36);
  for(const o of b){if(o.dead)continue;
   if((o.x<L+11||o.x>R-11)&&!nearMouth(o)){o.vx*=-.75;o.x=clamp(o.x,L+11,R-11);g.sfx("hit");}
   if((o.y<U+11||o.y>D-11)&&!nearMouth(o)){o.vy*=-.75;o.y=clamp(o.y,U+11,D-11);g.sfx("hit");}
   // trava de segurança: nunca sai da mesa
   if(o.x<d.T.x+2||o.x>d.T.x+d.T.w-2){o.vx*=-.7;o.x=clamp(o.x,d.T.x+2,d.T.x+d.T.w-2);}
   if(o.y<d.T.y+2||o.y>d.T.y+d.T.h-2){o.vy*=-.7;o.y=clamp(o.y,d.T.y+2,d.T.y+d.T.h-2);}}
  // bola-bola (massas iguais)
  for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){const a=b[i],c2=b[j];
   if(a.dead||c2.dead)continue;
   const dx=c2.x-a.x,dy=c2.y-a.y,dd=Math.hypot(dx,dy);
   if(dd>0&&dd<22){const nx=dx/dd,ny=dy/dd,ov=(22-dd)/2;
    a.x-=nx*ov;a.y-=ny*ov;c2.x+=nx*ov;c2.y+=ny*ov;
    const p=(a.vx-c2.vx)*nx+(a.vy-c2.vy)*ny;
    if(p>0){a.vx-=p*nx;a.vy-=p*ny;c2.vx+=p*nx;c2.vy+=p*ny;g.sfx("hit");}}}
  if(!b.some(o=>Math.hypot(o.vx,o.vy)>6)){
   if(d.potted>=6){g.addScore(d.shots*20);g.finish(true,"MESA LIMPA! Tacadas restantes: "+d.shots+" • Pontos: "+g.score);}
   else if(d.shots<=0)g.finish(false,"SEM TACADAS! "+d.potted+"/6 bolas • Pontos: "+g.score);}
 }
},
draw(g){const c=g.ctx,d=g.data,T=d.T;
 c.fillStyle="#0a0a18";c.fillRect(0,0,g.W,g.H);
 c.fillStyle="#5a3a1a";c.fillRect(T.x-14,T.y-14,T.w+28,T.h+28);
 c.fillStyle="#0f5c2e";c.fillRect(T.x,T.y,T.w,T.h);
 c.strokeStyle="#ffffff33";c.lineWidth=2;
 c.beginPath();c.moveTo(T.x+T.w/2,T.y+8);c.lineTo(T.x+T.w/2,T.y+T.h-8);c.stroke();
 for(const pk of d.pockets){c.fillStyle="#000";c.beginPath();c.arc(pk.x,pk.y,16,0,7);c.fill();
  c.strokeStyle="#888";c.lineWidth=2;c.beginPath();c.arc(pk.x,pk.y,16,0,7);c.stroke();}
 const cue=d.balls[0],moving=d.balls.some(o=>Math.hypot(o.vx,o.vy)>6);
 if(!moving&&!cue.dead){let ax,ay;
  if(d.drag&&d.drag.moved){ax=(d.drag.x0-g.input.pointer.x)*5;ay=(d.drag.y0-g.input.pointer.y)*5;}
  else{ax=Math.cos(d.ang)*d.pow;ay=Math.sin(d.ang)*d.pow;}
  const m=Math.hypot(ax,ay),ux=ax/(m||1),uy=ay/(m||1);
  c.strokeStyle="#c9a227";c.lineWidth=5;c.beginPath();c.moveTo(cue.x-ux*30,cue.y-uy*30);c.lineTo(cue.x-ux*(30+Math.min(90,m*.12)),cue.y-uy*(30+Math.min(90,m*.12)));c.stroke();
  c.strokeStyle="#ffd23f";c.lineWidth=2;c.setLineDash([6,5]);c.beginPath();c.moveTo(cue.x,cue.y);
  c.lineTo(cue.x+ux*70,cue.y+uy*70);c.stroke();c.setLineDash([]);}
 for(const o of d.balls){if(o.dead)continue;
  c.fillStyle="#00000055";c.beginPath();c.arc(o.x+2,o.y+3,11,0,7);c.fill();
  c.fillStyle=o.c;c.beginPath();c.arc(o.x,o.y,11,0,7);c.fill();
  c.fillStyle="#fff";c.beginPath();c.arc(o.x,o.y,4.5,0,7);c.fill();
  if(!o.cue){c.fillStyle="#000";c.font="bold 9px sans-serif";c.textAlign="center";c.fillText(o.n,o.x,o.y+3);}}
 drawTop(g,"BOLAS "+d.potted+"/6 • TACADAS "+d.shots+" • PONTOS "+Math.floor(g.score));
}};
function shootCue(g,vx,vy){const d=g.data;if(d.shots<=0||Math.hypot(vx,vy)<40)return;
 d.shots--;const cue=d.balls[0];cue.vx=clamp(vx,-850,850);cue.vy=clamp(vy,-850,850);g.sfx("shoot");}

/* ---------- 11. TETRIS ---------- */
const SHAPES=[
 {m:[[1,1,1,1]],c:"#00f0ff"},{m:[[1,1],[1,1]],c:"#ffd23f"},{m:[[0,1,0],[1,1,1]],c:"#b14aed"},
 {m:[[0,1,1],[1,1,0]],c:"#00ff88"},{m:[[1,1,0],[0,1,1]],c:"#ff4444"},
 {m:[[1,0,0],[1,1,1]],c:"#3f7dff"},{m:[[0,0,1],[1,1,1]],c:"#ff8c42"}];
const Tetris={
title:"🟪 TETRIS",sub:"◀ ▶ move • ▲/A gira • ▼ desce rápido. Complete linhas!",
init(g){const grid=[];for(let y=0;y<20;y++)grid.push(new Array(10).fill(null));
 g.data={grid,cur:null,next:(Math.random()*7)|0,score0:0,lines:0,level:1,dropT:0,repT:0,repDir:0,prevUp:false,prevFire:false,flash:0};
 tetSpawn(g);},
update(g,dt){const d=g.data,inp=g.input;
 const iv=Math.max(.08,.8-(d.level-1)*.09);
 // mover com repetição
 let dir=0;if(inp.left)dir=-1;else if(inp.right)dir=1;
 if(dir!==0){d.repT-=dt;if(d.repDir!==dir){d.repDir=dir;d.repT=.16;tetMove(g,dir);}
  else if(d.repT<=0){d.repT=.11;tetMove(g,dir);}}
 else{d.repDir=0;d.repT=0;}
 // girar (borda de subida: ▲ ou A/espaço)
 const upEdge=inp.up&&!d.prevUp,fireEdge=inp.firePressed&&!d.prevFire;
 d.prevUp=inp.up;d.prevFire=inp.firePressed;
 if((upEdge||fireEdge)&&d.cur){const r=tetRot(d.cur.m);
  if(!tetHit(g,d.cur.x,d.cur.y,r)){d.cur.m=r;g.sfx("hit");}}
 // gravidade (+ desce rápido)
 d.dropT-=dt*(inp.down?14:1);
 while(d.dropT<=0){d.dropT+=iv;
  if(!tetHit(g,d.cur.x,d.cur.y+1,d.cur.m))d.cur.y++;
  else{tetLock(g);if(g.over)return;}}
},
draw(g){const c=g.ctx,d=g.data,cell=22,ox=(g.W-220)/2,oy=64;
 c.fillStyle="#0a0a1c";c.fillRect(0,0,g.W,g.H);
 c.fillStyle="#000";c.fillRect(ox-4,oy-4,228,448);
 c.strokeStyle="#b14aed";c.lineWidth=3;c.strokeRect(ox-4,oy-4,228,448);
 for(let y=0;y<20;y++)for(let x=0;x<10;x++){const v=d.grid[y][x];
  if(v){c.fillStyle=v;c.fillRect(ox+x*cell+1,oy+y*cell+1,cell-2,cell-2);
   c.fillStyle="#ffffff44";c.fillRect(ox+x*cell+1,oy+y*cell+1,cell-2,4);}}
 if(d.cur)tetCells(d.cur).forEach(([x,y])=>{c.fillStyle=d.cur.c;
  c.fillRect(ox+(d.cur.x+x)*cell+1,oy+(d.cur.y+y)*cell+1,cell-2,cell-2);
  c.fillStyle="#ffffff55";c.fillRect(ox+(d.cur.x+x)*cell+1,oy+(d.cur.y+y)*cell+1,cell-2,4);});
 // próxima peça
 c.fillStyle="#000";c.fillRect(ox+250,oy,120,110);c.strokeStyle="#ffd23f";c.lineWidth=2;c.strokeRect(ox+250,oy,120,110);
 c.fillStyle="#fff";c.font="bold 12px sans-serif";c.textAlign="center";c.fillText("PRÓXIMA",ox+310,oy+18);
 const nx=SHAPES[d.next];nx.m.forEach((row,ry)=>row.forEach((v,rx)=>{if(v){c.fillStyle=nx.c;
  c.fillRect(ox+310-((row.length*16)/2)+rx*16,oy+34+ry*16,14,14);}}));
 // stats
 c.fillStyle="#fff";c.font="bold 15px monospace";c.textAlign="left";
 c.fillText("PONTOS",60,150);c.fillStyle="#ffd23f";c.font="900 24px monospace";c.fillText(""+Math.floor(g.score),60,178);
 c.fillStyle="#fff";c.font="bold 15px monospace";c.fillText("LINHAS",60,230);c.fillStyle="#00f0ff";c.font="900 24px monospace";c.fillText(""+d.lines,60,258);
 c.fillStyle="#fff";c.font="bold 15px monospace";c.fillText("NÍVEL",60,310);c.fillStyle="#00ff88";c.font="900 24px monospace";c.fillText(""+d.level,60,338);
 c.fillStyle="#888";c.font="12px sans-serif";c.fillText("◀ ▶ move",60,390);c.fillText("▲/A gira",60,408);c.fillText("▼ desce",60,426);
 drawTop(g,"PONTOS "+Math.floor(g.score)+" • LINHAS "+d.lines+" • NÍVEL "+d.level);
}};
function tetCells(p){const o=[];p.m.forEach((row,y)=>row.forEach((v,x)=>{if(v)o.push([x,y]);}));return o;}
function tetRot(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
function tetHit(g,px,py,m){const d=g.data;
 for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++){if(!m[y][x])continue;
  const gx=px+x,gy=py+y;
  if(gx<0||gx>9||gy>19||(gy>=0&&d.grid[gy][gx]))return true;}
 return false;}
function tetMove(g,dir){const d=g.data;if(d.cur&&!tetHit(g,d.cur.x+dir,d.cur.y,d.cur.m)){d.cur.x+=dir;g.sfx("hit");}}
function tetSpawn(g){const d=g.data;const s=SHAPES[d.next];d.next=(Math.random()*7)|0;
 d.cur={m:s.m.map(r=>r.slice()),c:s.c,x:3,y:s.m.length>2?0:-0};
 if(tetHit(g,d.cur.x,d.cur.y,d.cur.m)){d.cur=null;g.finish(false,"TOPO! Linhas: "+d.lines+" • Pontos: "+g.score);}}
function tetLock(g){const d=g.data,p=d.cur;
 tetCells(p).forEach(([x,y])=>{if(p.y+y>=0)d.grid[p.y+y][p.x+x]=p.c;});
 g.sfx("hit");let n=0;
 for(let y=19;y>=0;y--){if(d.grid[y].every(v=>v)){d.grid.splice(y,1);d.grid.unshift(new Array(10).fill(null));n++;y++;}}
 if(n>0){const pts=[0,40,100,300,1200][n]*d.level;g.addScore(pts);d.lines+=n;
  const nl=1+((d.lines/10)|0);if(nl>d.level){d.level=nl;g.toast("⚡ NÍVEL "+nl+"!");g.sfx("rapid");}
  if(n===4){g.toast("🟪 TETRIS! +"+pts);g.sfx("star");}else g.sfx("gold");}
 tetSpawn(g);}

window.MiniGames={tank:Tank,snake:Snake,bricks:Bricks,nave:Nave,race:Race,pong:Pong,basket:Basket,target:Target,golf:Golf,sinuca:Sinuca,tetris:Tetris};
})();
