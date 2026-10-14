/* Galeria 9999 em 1 — hub com portais/telões (visão de cima) + input touch + áudio + records */
(function(){
"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const W=960,H=540;
const $=id=>document.getElementById(id);
const menu=$("menu"),help=$("help"),prompt=$("prompt"),toastEl=$("toast");
const ticketsEl=$("tickets"),recordEl=$("record"),powersEl=$("powers"),hudGame=$("hud-game");

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);

/* ---------- persist ---------- */
const store={
 get tickets(){return +(localStorage.getItem("gal9999_tickets")||0)},
 set tickets(v){localStorage.setItem("gal9999_tickets",v)},
 get best(){return +(localStorage.getItem("gal9999_best")||0)},
 set best(v){localStorage.setItem("gal9999_best",v)},
 get skin(){return +(localStorage.getItem("gal9999_skin")||0)},
 set skin(v){localStorage.setItem("gal9999_skin",v)},
 get powers(){return +(localStorage.getItem("gal9999_powers")||0)},
 set powers(v){localStorage.setItem("gal9999_powers",v)},
};
const SKINS=[{e:"🧑‍🚀",c:"#00f0ff"},{e:"🥷",c:"#ff2fb3"},{e:"🤖",c:"#ffd23f"},{e:"🧙",c:"#00ff88"}];
let skinIdx=clamp(store.skin||0,0,3);
const skinsBox=$("skins");
SKINS.forEach((s,i)=>{const d=document.createElement("div");d.className="skin"+(i===skinIdx?" on":"");d.textContent=s.e;
 d.onclick=()=>{skinIdx=i;store.skin=i;[...skinsBox.children].forEach((x,j)=>x.classList.toggle("on",j===i));sfx("eat");updateTop();};skinsBox.appendChild(d);});

/* ---------- áudio ---------- */
let AC=null,muted=false;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==="suspended")AC.resume();return AC;}
function tone(f,dur,type,vol,slide){if(muted)return;const a=ac();if(!a)return;
 const o=a.createOscillator(),g=a.createGain();o.type=type||"square";o.frequency.setValueAtTime(f,a.currentTime);
 if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),a.currentTime+dur);
 g.gain.setValueAtTime(vol||.12,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);
 o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur);}
function sfx(n){if(n==="shoot")tone(880,.08,"square",.07,220);
 else if(n==="hit")tone(300,.08,"square",.1,120);
 else if(n==="eat")tone(660,.1,"sine",.12,1320);
 else if(n==="boom")tone(160,.3,"sawtooth",.14,40);
 else if(n==="coin"){tone(990,.09,"square",.1);setTimeout(()=>tone(1320,.15,"square",.1),90);}
 else if(n==="power"){tone(520,.12,"square",.1,1040);setTimeout(()=>tone(780,.12,"square",.1,1560),110);}
 else if(n==="rapid"){tone(700,.07,"square",.09,1400);setTimeout(()=>tone(950,.07,"square",.09,1800),70);}
 else if(n==="shield"){tone(220,.28,"sine",.12,520);}
 else if(n==="mega"){tone(130,.5,"sawtooth",.16,30);setTimeout(()=>tone(90,.4,"square",.12,40),60);}
 else if(n==="life"){[660,880,1174].forEach((f,i)=>setTimeout(()=>tone(f,.12,"sine",.11),i*100));}
 else if(n==="gold"){[880,1174,1568].forEach((f,i)=>setTimeout(()=>tone(f,.1,"triangle",.1),i*80));}
 else if(n==="multi"){[500,700,950].forEach((f,i)=>setTimeout(()=>tone(f,.09,"square",.09),i*70));}
 else if(n==="expand"){tone(300,.22,"square",.1,950);}
 else if(n==="fuel"){tone(150,.16,"sawtooth",.1,420);}
 else if(n==="orb"){tone(1200,.16,"sine",.1,600);}
 else if(n==="star"){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.12,"square",.09),i*90));}
 else if(n==="bull"){tone(1500,.2,"square",.1,2200);}
 else if(n==="hole"){[392,523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.15,"triangle",.11),i*110));}
 else if(n==="splash"){tone(600,.3,"sine",.1,150);}}
$("btn-sound").onclick=e=>{muted=!muted;e.target.textContent=muted?"🔇":"🔊";};
$("btn-crt").onclick=e=>{document.body.classList.toggle("crt");
 const on=document.body.classList.contains("crt");e.target.style.borderColor=on?"#ffd23f":"#444";
 toast(on?"📺 Modo CRT retrô LIGADO":"📺 Modo CRT retrô desligado");};
$("btn-help").onclick=()=>help.style.display="flex";
$("btn-close-help").onclick=()=>help.style.display="none";
function toast(msg,ms){toastEl.textContent=msg;toastEl.style.display="block";clearTimeout(toast._t);toast._t=setTimeout(()=>toastEl.style.display="none",ms||1800);}
function updateTop(){ticketsEl.textContent="🎟️ "+store.tickets+" tickets";recordEl.textContent="🏆 recorde "+store.best;powersEl.textContent="⭐ "+store.powers;}

/* ---------- mundo hub ---------- */
const WORLD={w:1600,h:1080,wall:50};
const MACHINES=[
 {id:"tank",  x:150, y:230,icon:"🛡️",name:"TANQUE 99",color:"#ff7a00"},
 {id:"snake", x:380, y:230,icon:"🐍",name:"COBRINHA",color:"#00ff88"},
 {id:"bricks",x:610, y:230,icon:"🧱",name:"TIJOLINHOS",color:"#ff2fb3"},
 {id:"nave",  x:840, y:230,icon:"🚀",name:"NAVINHA",color:"#00f0ff"},
 {id:"basket",x:1070,y:230,icon:"🏀",name:"BASQUETE",color:"#ff8c42"},
 {id:"tetris",x:1300,y:230,icon:"🟪",name:"TETRIS",color:"#b14aed"},
 {id:"target",x:200, y:560,icon:"🎯",name:"TIRO AO ALVO",color:"#ff4444"},
 {id:"golf",  x:450, y:560,icon:"⛳",name:"GOLFE",color:"#7dd956"},
 {id:"pong",  x:700, y:560,icon:"🏓",name:"PONG",color:"#b388ff"},
 {id:"race",  x:950, y:560,icon:"🏎️",name:"CORRIDA",color:"#ffd23f"},
 {id:"sinuca",x:1200,y:560,icon:"🎱",name:"SINUCA",color:"#9c6b30"},
 {id:"random",x:800, y:830,icon:"🎰",name:"PORTAL ?",color:"#ffffff"},
];
const player={x:800,y:470,vx:0,vy:0,dir:1,walk:0,moving:false};
const npcs=[{x:600,y:700,t:0,a:0,sp:60,c:"#b388ff"},{x:1000,y:760,t:0,a:2,sp:50,c:"#ff7a00"}];
const cam={x:player.x,y:player.y,z:1};

/* ---------- input ---------- */
const keys={};
addEventListener("keydown",e=>{const k=e.key.toLowerCase();keys[k]=true;
 if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
 if(k==="e"||k==="enter")input.interactPressed=true;
 if(k===" "){input.firePressed=true;input.enterPressed=true;}
 if(k==="escape"){if(state!=="game")return;if(exitConfirmOpen())closeExitConfirm();else showExitConfirm();}});
addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false;});
const input={jx:0,jy:0,fire:false,firePressed:false,interactPressed:false,enterPressed:false,
 left:false,right:false,up:false,down:false,pointer:{x:0,y:0,active:false,dx:0,dy:0},pointerTapped:false};
/* joystick */
const joy=$("joy"),stick=$("stick");let joyId=null;
function joyPos(e){const r=joy.getBoundingClientRect();const p=e.touches?e.touches[0]:e;
 let dx=(p.clientX-(r.left+r.width/2))/(r.width/2),dy=(p.clientY-(r.top+r.height/2))/(r.height/2);
 const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}return{dx,dy};}
joy.addEventListener("pointerdown",e=>{joyId=e.pointerId;try{joy.setPointerCapture(e.pointerId);}catch(_){}const p=joyPos(e);input.jx=p.dx;input.jy=p.dy;
 stick.style.transform=`translate(calc(-50% + ${p.dx*34}px),calc(-50% + ${p.dy*34}px))`;});
joy.addEventListener("pointermove",e=>{if(e.pointerId!==joyId&&joyId!==null&&e.pointerType==="mouse"&&e.buttons===0)return;
 const p=joyPos(e);if(joyId===null&&e.pointerType==="mouse")return;input.jx=p.dx;input.jy=p.dy;
 stick.style.transform=`translate(calc(-50% + ${p.dx*34}px),calc(-50% + ${p.dy*34}px))`;});
const joyEnd=()=>{joyId=null;input.jx=0;input.jy=0;stick.style.transform="translate(-50%,-50%)";};
joy.addEventListener("pointerup",joyEnd);joy.addEventListener("pointercancel",joyEnd);
/* botões */
function bindBtn(id,down,up){const el=$(id);
 el.addEventListener("pointerdown",e=>{e.preventDefault();down();});
 el.addEventListener("pointerup",e=>{e.preventDefault();up&&up();});
 el.addEventListener("pointerleave",()=>up&&up());}
bindBtn("btnA",()=>{input.fire=true;input.firePressed=true;},()=>input.fire=false);
bindBtn("btnB",()=>{input.fire=true;input.firePressed=true;},()=>input.fire=false);
bindBtn("btnE",()=>{input.interactPressed=true;});
/* toque no canvas (arrastar nos minigames) */
let ptrId=null,lastP=null;
function toLogical(e){const r=canvas.getBoundingClientRect();const p=e.touches?e.touches[0]:e;
 return{x:(p.clientX-r.left)/r.width*W,y:(p.clientY-r.top)/r.height*H};}
canvas.addEventListener("pointerdown",e=>{ptrId=e.pointerId;lastP=toLogical(e);
 input.pointer.x=lastP.x;input.pointer.y=lastP.y;input.pointer.active=true;input.pointer.dx=0;input.pointer.dy=0;});
canvas.addEventListener("pointermove",e=>{if(e.pointerId!==ptrId)return;const p=toLogical(e);
 input.pointer.dx=p.x-lastP.x;input.pointer.dy=p.y-lastP.y;input.pointer.x=p.x;input.pointer.y=p.y;lastP=p;});
const ptrEnd=e=>{if(e.pointerId!==ptrId)return;ptrId=null;lastP=null;input.pointer.active=false;input.pointer.dx=0;input.pointer.dy=0;};
canvas.addEventListener("pointerup",e=>{ptrEnd(e);input.pointerTapped=true;setTimeout(()=>input.pointerTapped=false,120);});
canvas.addEventListener("pointercancel",ptrEnd);
function pollKeys(){input.left=!!(keys["a"]||keys["arrowleft"])||input.jx<-.35;
 input.right=!!(keys["d"]||keys["arrowright"])||input.jx>.35;
 input.up=!!(keys["w"]||keys["arrowup"])||input.jy<-.35;
 input.down=!!(keys["s"]||keys["arrowdown"])||input.jy>.35;
 if(keys[" "])input.fire=true;}

/* ---------- sessão de minigame ---------- */
let state="menu",G=null,gameId=null,overAt=0;
const META={tank:{n:"🛡️ TANQUE 99"},snake:{n:"🐍 COBRINHA"},bricks:{n:"🧱 TIJOLINHOS"},
 nave:{n:"🚀 NAVINHA"},race:{n:"🏎️ CORRIDA TURBO"},pong:{n:"🏓 PONG NEON"},
 basket:{n:"🏀 BASQUETE"},target:{n:"🎯 TIRO AO ALVO"},golf:{n:"⛳ GOLFE"},
 sinuca:{n:"🎱 SINUCA"},tetris:{n:"🟪 TETRIS"}};
const POOL=["tank","snake","bricks","nave","race","pong","basket","target","golf","sinuca","tetris"];
function startGame(id){let wasRandom=false;
 if(id==="random"){wasRandom=true;id=POOL[(Math.random()*POOL.length)|0];}
 gameId=id;const Def=window.MiniGames[id];
 G={W,H,ctx,input,score:0,lives:3,over:false,win:false,overText:"",time:0,data:{},title:META[id].n,powers:0,
  sfx,addScore:v=>{G.score+=v;},toast:t=>toast(t),
  collect(){G.powers++;store.powers=store.powers+1;updateTop();
   if(store.powers%25===0)toast("⭐ "+store.powers+" power-ups coletados no total!");},finish:(win,msg)=>{if(G.over)return;G.win=win;G.over=true;G.overText=msg;overAt=performance.now();sfx(win?"coin":"boom");}};
 Def.init(G);state="game";hudGame.style.display="flex";prompt.style.display="none";removeGameOver();
 toast(wasRandom?("🌀 O portal te levou para "+META[id].n+"!"):(Def.sub||""),2600);}
function endGameToHub(){state="hub";hudGame.style.display="none";closeExitConfirm();
 if(G&&G.score>0){const tk=clamp(Math.floor(G.score/120),1,15)+(G.win?5:0);
  store.tickets=store.tickets+tk;
  if(Math.floor(G.score)>store.best)store.best=Math.floor(G.score);
  updateTop();toast(`🎟️ +${tk} tickets! Total: ${store.tickets}`,2600);}
 G=null;gameId=null;removeGameOver();}
$("btn-exit").onclick=()=>showExitConfirm();
function exitConfirmOpen(){return !!$("exit-confirm");}
function closeExitConfirm(){const o=$("exit-confirm");if(o)o.remove();}
function showExitConfirm(){if(state!=="game"||!G||exitConfirmOpen())return;sfx("hit");
 const d=document.createElement("div");
 d.className="overlay";d.id="exit-confirm";
 d.innerHTML=`<div class="card"><h1>🚪 <span class="a">Sair do jogo?</span></h1>
 <p>Você tem certeza que quer sair?<br>Seus pontos viram tickets 🎟️ (agora: <b>${Math.floor(G.score)} pts</b>)</p>
 <button class="bigbtn" id="btn-yes-exit">✅ SIM, SAIR</button><br>
 <button class="vbtn" id="btn-no-exit" style="margin-top:10px">❌ CONTINUAR JOGANDO</button></div>`;
 $("stage").appendChild(d);
 $("btn-yes-exit").onclick=()=>endGameToHub();
 $("btn-no-exit").onclick=()=>{closeExitConfirm();sfx("eat");};}
function removeGameOver(){const o=$("gameover");if(o)o.remove();}
function showGameOver(){if($("gameover"))return;const d=document.createElement("div");
 d.className="overlay";d.id="gameover";
 d.innerHTML=`<div class="card"><h1>${G.win?"🏆 <span class='c'>VITÓRIA!</span>":"💥 <span class='b'>FIM DE JOGO</span>"}</h1>
 <p>${G.overText}<br>Pontuação: <b>${Math.floor(G.score)}</b>${G.powers>0?("<br>⭐ Power-ups coletados: <b>"+G.powers+"</b>"):""}</p>
 <button class="bigbtn" id="btn-again">↻ JOGAR DE NOVO</button><br>
 <button class="vbtn" id="btn-hub" style="margin-top:10px">🚶 VOLTAR AO FLIPERAMA</button></div>`;
 $("stage").appendChild(d);
 $("btn-again").onclick=()=>{removeGameOver();startGame(gameId);};
 $("btn-hub").onclick=()=>endGameToHub();}

/* ---------- update hub ---------- */
function collide(nx,ny){const m=WORLD.wall;
 if(nx< m+16||nx>WORLD.w-m-16||ny<260||ny>WORLD.h-m-16)return true;
 for(const mc of MACHINES){if(nx>mc.x-65&&nx<mc.x+65&&ny>mc.y-50&&ny<mc.y+50)return true;}
 return false;}
function updateHub(dt){pollKeys();
 let dx=(input.right?1:0)-(input.left?1:0)+input.jx,dy=(input.down?1:0)-(input.up?1:0)+input.jy;
 const mg=Math.hypot(dx,dy);if(mg>1){dx/=mg;dy/=mg;}
 const sp=260;player.moving=mg>.15;player.walk+=dt*(player.moving?10:0);
 if(dx!==0)player.dir=dx>0?1:-1;
 const nx=player.x+dx*sp*dt,ny=player.y+dy*sp*dt;
 if(!collide(nx,player.y))player.x=nx;if(!collide(player.x,ny))player.y=ny;
 for(const n of npcs){n.t-=dt;if(n.t<=0){n.t=2+Math.random()*3;n.a=Math.random()*Math.PI*2;}
  const qx=n.x+Math.cos(n.a)*n.sp*dt,qy=n.y+Math.sin(n.a)*n.sp*dt;
  if(!collide(qx,qy)){n.x=qx;n.y=qy;}}
 cam.z+=(0.95-cam.z)*Math.min(1,dt*4);
 cam.x+=(player.x-cam.x)*Math.min(1,dt*6);cam.y+=(player.y-cam.y)*Math.min(1,dt*6);
 // interação: portais entram com ESPAÇO / ENTER / E
 let near=null,best=1e9;
 for(const mc of MACHINES){const d=dist(player.x,player.y,mc.x,mc.y+70);
  if(d<120&&d<best){best=d;near=mc;}}
 if(near){
  prompt.style.display="block";
  prompt.textContent=`${near.icon} ${near.id==="random"?"PORTAL ALEATÓRIO 🎰":"PORTAL "+near.name} • ESPAÇO / ENTER!`;
  if(input.interactPressed||input.enterPressed){input.interactPressed=false;input.enterPressed=false;sfx("coin");startGame(near.id);return;}}
 else prompt.style.display="none";
 input.interactPressed=false;input.enterPressed=false;
}

/* ---------- desenho hub (visão de cima) ---------- */
let T=0;
function drawFloorOrtho(){const z=cam.z;
 const ox=W/2-cam.x*z,oy=H/2-cam.y*z;
 ctx.fillStyle="#0c0c1e";ctx.fillRect(0,0,W,H);
 const x0=Math.max(WORLD.wall, cam.x-W/2/z-40),x1=Math.min(WORLD.w-WORLD.wall,cam.x+W/2/z+40);
 const y0=Math.max(0,cam.y-H/2/z-40),y1=Math.min(WORLD.h,cam.y+H/2/z+40);
 for(let ty=Math.floor(y0/40)*40;ty<y1;ty+=40)for(let tx=Math.floor(x0/40)*40;tx<x1;tx+=40){
  const sx=tx*z+ox,sy=ty*z+oy,s=40*z;
  const odd=((tx+ty)/40)%2===0;
  ctx.fillStyle=odd?"#151532":"#101024";ctx.fillRect(sx,sy,s+1,s+1);
  if((tx/40+ty/40)%8===0){ctx.fillStyle="#00f0ff11";ctx.fillRect(sx,sy,s+1,s+1);}}
 return{ox,oy,z};}
function drawHub(){T+=1/60;
 const{ox,oy,z}=drawFloorOrtho();
 const P=(x,y)=>[x*z+ox,y*z+oy];
 // tapete central
 {const[a,b]=P(300,640);const cw=1000*z,ch=260*z;
  ctx.fillStyle="#3d0f2e";ctx.fillRect(a,b,cw,ch);
  ctx.strokeStyle="#ff2fb366";ctx.lineWidth=2;ctx.strokeRect(a+4,b+4,cw-8,ch-8);
  for(let i=0;i<8;i++){ctx.fillStyle=i%2?"#ff2fb322":"#00f0ff18";ctx.fillRect(a+14,b+14+i*(ch-28)/8,cw-28,(ch-28)/8-6);}}
 // portais (ordenados por y)
 const ents=[...MACHINES.map(m=>({...m,kind:"m"})),{kind:"p"},...npcs.map(n=>({...n,kind:"n"}))];
 ents.sort((a,b)=>((a.kind==="p"?player.y:a.y)-(b.kind==="p"?player.y:b.y)));
 for(const e of ents){
  if(e.kind==="m"){const[sx,sy]=P(e.x-52,e.y-44);const w=104*z,h=88*z;
   // anel do portal no chão (frente da máquina)
   const[rx,ry]=P(e.x,e.y+62);const pulse=1+Math.sin(T*4+e.x)*.12;
   ctx.globalAlpha=.55+Math.sin(T*4+e.x)*.3;ctx.strokeStyle=e.color;ctx.lineWidth=Math.max(2,3*z);
   ctx.beginPath();ctx.ellipse(rx,ry,34*z*pulse,11*z*pulse,0,0,7);ctx.stroke();
   ctx.globalAlpha=.14;ctx.fillStyle=e.color;
   ctx.beginPath();ctx.ellipse(rx,ry,34*z*pulse,11*z*pulse,0,0,7);ctx.fill();ctx.globalAlpha=1;
   // telão multimídia acima da máquina
   drawScreen(e,P,z);
   ctx.fillStyle="#00000066";ctx.beginPath();ctx.ellipse(sx+w/2,sy+h+8,w*.5,8*z,0,0,7);ctx.fill();
   ctx.fillStyle="#1a1a30";ctx.fillRect(sx,sy,w,h);
   ctx.fillStyle=e.color;ctx.fillRect(sx,sy,w,18*z);
   ctx.fillStyle="#000";ctx.font=`900 ${Math.max(9,11*z)}px sans-serif`;ctx.textAlign="center";
   ctx.fillText(`${e.icon} ${e.name}`,sx+w/2,sy+13*z);
   ctx.fillStyle="#05050f";ctx.fillRect(sx+8*z,sy+24*z,w-16*z,36*z);
   ctx.fillStyle=e.color+"44";ctx.fillRect(sx+8*z,sy+24*z,w-16*z,36*z);
   // porta do fliperama (arco brilhante)
   ctx.strokeStyle=e.color;ctx.lineWidth=Math.max(2,3*z);
   ctx.strokeRect(sx+22*z,sy+32*z,w-44*z,54*z);
   ctx.fillStyle=e.color;ctx.globalAlpha=.5+Math.sin(T*5+e.x)*.3;
   ctx.fillRect(sx+22*z,sy+32*z,w-44*z,4*z);ctx.globalAlpha=1;
   neon(e.color,sx,sy,w,h,z);
   ctx.fillStyle="#fff";ctx.font=`${Math.max(9,10*z)}px sans-serif`;
   ctx.fillText(`${e.icon} ${e.id==="random"?"PORTAL ALEATÓRIO 🎰":"PORTAL "+e.name}`,...P(e.x,e.y+88));
  }else if(e.kind==="p"){drawPlayer(...P(player.x,player.y),z);}
  else{const[sx,sy]=P(e.x,e.y);drawNpc(sx,sy,z,e.c);}}
 // paredes
 drawWalls(P,z);
 ctx.fillStyle="#ffffff88";ctx.font="12px monospace";ctx.textAlign="left";
 ctx.fillText("🌀 Ache os portais — ESPAÇO ou ENTER para entrar!",12,H-12);
}
/* telão multimídia com prévia animada do jogo */
function drawScreen(e,P,z){const pw=140*z,ph=64*z;const[cx2,cy2]=P(e.x,e.y-44);
 const sx=cx2-pw/2,sy=cy2-ph-8*z;
 ctx.fillStyle="#00000066";ctx.fillRect(sx+4,sy+5,pw,ph);
 ctx.fillStyle="#0a0a18";ctx.fillRect(sx,sy,pw,ph);
 drawPreview(sx+4,sy+4,pw-8,ph-8,e.id);
 ctx.strokeStyle=e.color;ctx.lineWidth=2;ctx.strokeRect(sx,sy,pw,ph);
 ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(sx+pw-8,sy+8,3+Math.sin(T*6)*1.5,0,7);ctx.fill();
}
function drawPreview(x,y,w,h,id){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 ctx.fillStyle="#060614";ctx.fillRect(x,y,w,h);const t=T;
 const dot=(dx,dy,c,s)=>{ctx.fillStyle=c;ctx.fillRect(x+dx,y+dy,s||6,s||6);};
 if(id==="tank"){for(let i=0;i<5;i++)dot((t*40+i*37)%w,10+i*12,"#ff7a00",7);
  dot(w/2-6,h-16,"#00f0ff",10);dot(w/2-2,h-34-(t*30%20),"#ffd23f",4);}
 else if(id==="snake"){for(let i=0;i<8;i++)dot((t*50-i*12+w*2)%w,h/2+Math.sin(t*4-i*.7)*14,i?"#00ff88":"#ffd23f",7);
  dot((t*97)%w,(t*61)%h,"#ff2fb3",7);}
 else if(id==="bricks"){for(let r=0;r<2;r++)for(let q=0;q<6;q++){ctx.fillStyle=["#ff2fb3","#00f0ff"][r];ctx.fillRect(x+4+q*(w-8)/6,y+4+r*10,(w-8)/6-3,7);}
  const bx=(t*70)%(w-10);dot(bx,h-14-(Math.abs((t*70)%(2*(h-24))-(h-24))),"#ffd23f",6);
  ctx.fillStyle="#00f0ff";ctx.fillRect(x+w/2-14,y+h-8,28,4);}
 else if(id==="nave"){for(let i=0;i<12;i++)dot((i*53)%w,(t*60+i*31)%h,"#ffffff",2);
  dot(w/2-5,h-16,"#00f0ff",10);dot(w/2-2,h-30-(t*80%30),"#ffd23f",4);
  dot((t*30)%w,10+((t*40)%(h/2)),"#ff3355",7);}
 else if(id==="race"){ctx.fillStyle="#2b2b35";ctx.fillRect(x+w/2-16,y,32,h);
  ctx.fillStyle="#fff";for(let i=0;i<4;i++)ctx.fillRect(x+w/2-1,((t*90+i*30)%(h+20))-10,2,12);
  dot(w/2-22+((t*25)%30),h-22,"#ff3355",9);dot(w/2-5,h-20,"#00f0ff",10);}
 else if(id==="pong"){ctx.fillStyle="#00f0ff";ctx.fillRect(x+4,h/2-12+Math.sin(t*3)*10,4,24);
  ctx.fillStyle="#ff2fb3";ctx.fillRect(x+w-8,h/2-12+Math.cos(t*3)*10,4,24);
  dot((t*80)%w,h/2+Math.sin(t*5)*12,"#ffd23f",6);}
 else if(id==="basket"){ctx.strokeStyle="#ff8c42";ctx.lineWidth=3;
  ctx.strokeRect(x+w-30,y+8,22,30);ctx.beginPath();ctx.ellipse(x+w-19,y+40,14,4,0,0,7);ctx.stroke();
  dot(w/2-4+Math.sin(t*2)*10,h-12-Math.abs(Math.sin(t*3))*(h-26),"#ff8c42",9);}
 else if(id==="target"){const cx=x+w/2,cy=y+h/2,r=8+((t*22)%(Math.min(w,h)/2-4));
  ["#ff4444","#fff","#ff4444"].forEach((cc,i)=>{ctx.strokeStyle=cc;ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(cx,cy,10+i*9,0,7);ctx.stroke();});
  ctx.strokeStyle="#ffd23f";ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();}
 else if(id==="golf"){ctx.fillStyle="#1d6b1d";ctx.fillRect(x,y,w,h);
  ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w-24,y+10);ctx.lineTo(x+w-24,y+h-16);ctx.stroke();
  dot(w-28,h-20,"#ff4444",5);dot((t*40)%(w-40),h/2+Math.sin(t*2)*10,"#fff",6);}
 else if(id==="sinuca"){ctx.fillStyle="#0f5c2e";ctx.fillRect(x,y,w,h);
  ctx.fillStyle="#000";for(const[px,py]of[[6,6],[w-6,6],[6,h-6],[w-6,h-6],[w/2,5],[w/2,h-5]]){ctx.beginPath();ctx.arc(x+px,y+py,4,0,7);ctx.fill();}
  dot(w/2-20+Math.sin(t*2)*14,h/2,"#fff",7);dot(w/2+22,h/2+Math.cos(t*1.6)*10,"#ff4444",6);dot(w/2+34,h/2-8,"#ffd23f",6);}
 else if(id==="tetris"){const bw2=w/7;for(let i=0;i<4;i++){ctx.fillStyle=["#ff2fb3","#ffd23f","#00f0ff","#00ff88"][i];
   ctx.fillRect(x+8+i*(bw2+2),y+h-12-((t*30+i*17)%(h-16)),bw2,bw2);}}
 else{const cols=["#ff2fb3","#ffd23f","#00f0ff","#00ff88"];ctx.fillStyle=cols[((t)|0)%4];
  ctx.font=`900 ${Math.max(12,h*.5)}px sans-serif`;ctx.textAlign="center";ctx.fillText("?",x+w/2,y+h*.72);}
 ctx.restore();}
function neon(color,sx,sy,w,h,z){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(sx,sy,w,h);
 ctx.fillStyle=color;ctx.globalAlpha=.5+Math.sin(T*5)*.3;
 ctx.fillRect(sx,sy,w,3);ctx.globalAlpha=1;}
function drawPlayer(sx,sy,z){ctx.fillStyle="#00000066";ctx.beginPath();ctx.ellipse(sx,sy+14*z,14*z,5*z,0,0,7);ctx.fill();
 const bob=player.moving?Math.sin(player.walk)*3*z:0;const col=SKINS[skinIdx].c;
 ctx.fillStyle=col;ctx.fillRect(sx-9*z,sy-12*z+bob*.3,18*z,20*z);
 ctx.fillStyle="#f2c89b";ctx.beginPath();ctx.arc(sx,sy-20*z+bob*.3,9*z,0,7);ctx.fill();
 ctx.fillStyle="#222";ctx.fillRect(sx-9*z,sy-26*z+bob*.3,18*z,6*z);
 ctx.fillStyle="#fff";const ex=player.dir*3*z;ctx.fillRect(sx-4*z+ex,sy-21*z+bob*.3,3*z,3*z);ctx.fillRect(sx+2*z+ex,sy-21*z+bob*.3,3*z,3*z);
 ctx.fillStyle="#00000055";ctx.fillRect(sx-9*z,sy+8*z,7*z,6*z);ctx.fillRect(sx+2*z,sy+8*z,7*z,6*z);}
function drawNpc(sx,sy,z,c){ctx.fillStyle="#00000066";ctx.beginPath();ctx.ellipse(sx,sy+12*z,12*z,4*z,0,0,7);ctx.fill();
 ctx.fillStyle=c;ctx.fillRect(sx-8*z,sy-10*z,16*z,18*z);
 ctx.fillStyle="#f2c89b";ctx.beginPath();ctx.arc(sx,sy-17*z,8*z,0,7);ctx.fill();}
function drawWalls(P,z){for(const[wx,wy,ww,wh]of[[0,120,WORLD.w,50],[0,170,50,WORLD.h],[WORLD.w-50,170,50,WORLD.h]]){
 const[sx,sy]=P(wx,wy);ctx.fillStyle="#2c2c5e";ctx.fillRect(sx,sy,ww*z,wh*z);
 ctx.fillStyle="#00f0ff";ctx.fillRect(sx,sy,ww*z,3);}}

/* ---------- loop ---------- */
let last=performance.now(),started=false;
function frame(now){requestAnimationFrame(frame);let dt=(now-last)/1000;last=now;dt=Math.min(dt,.033);
 if(!started){drawHub();drawAttract();return;}
 if(state==="hub"){updateHub(dt);drawHub();}
 else if(state==="game"&&G){const paused=exitConfirmOpen();
  if(!paused){pollKeys();
   input.fire=input.fire||!!keys[" "];
   if(!G.over){G.time+=dt;G.data.t=(G.data.t||0)+dt;
    window.MiniGames[gameId].update(G,dt);}}
  window.MiniGames[gameId].draw(G);
  if(G.score>store.best){store.best=Math.floor(G.score);updateTop();}
  if(!paused&&G.over&&!$("gameover")&&now-overAt>1400)showGameOver();
  if(!paused&&G.over&&(window.MiniGames[gameId].drawOver!==false))drawGameOverDim();
  input.firePressed=false;input.enterPressed=false;input.pointerTapped=false;input.pointer.dx=0;input.pointer.dy=0;return;}
 input.firePressed=false;input.enterPressed=false;input.pointerTapped=false;input.pointer.dx=0;input.pointer.dy=0;}
function drawGameOverDim(){if(!$("gameover")){ctx.fillStyle="#00000088";ctx.fillRect(0,0,W,H);
 ctx.fillStyle=G.win?"#00ff88":"#ff3355";ctx.font="900 34px sans-serif";ctx.textAlign="center";
 ctx.fillText(G.win?"🏆 VITÓRIA!":"💥 FIM DE JOGO",W/2,H/2-30);
 ctx.fillStyle="#fff";ctx.font="bold 17px sans-serif";ctx.fillText(G.overText,W/2,H/2+4);}}
function drawAttract(){ctx.fillStyle="#00000055";ctx.fillRect(0,0,W,H);}
$("btn-play").onclick=()=>{ac();sfx("coin");menu.style.display="none";started=true;state="hub";toast("Ande até um portal e aperte ESPAÇO ou ENTER! 🌀");};
function fitCanvas(){const stage=$("stage");const r=stage.getBoundingClientRect();
 const s=Math.min(r.width/W,r.height/H);canvas.style.width=(W*s)+"px";canvas.style.height=(H*s)+"px";}
addEventListener("resize",fitCanvas);fitCanvas();
window.__gal={player,MACHINES,startGame,endGameToHub,get state(){return state},get G(){return G},get score(){return G?G.score:0}};
updateTop();requestAnimationFrame(frame);
})();
