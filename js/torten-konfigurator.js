import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   TIER DATA — 8 Etagen, jeweils Boden (Biskuit) + Füllung
--------------------------------------------------------- */
// Each tier pairs a Bisquit (Boden) with a Füllung — using ONLY the flavours offered in the
// order form. Bisquit ∈ {Hell, Kakao, Haselnuss, Kokos, Eierlikör, Mohn};
// Füllung ∈ {Erdbeer, Himbeer, Kiwi, Kirsch, Schokolade, Vanille, Pfirsich, Ananas, Kokos,
//            Eierlikör, Maracuja, Mango, Heidelbeer}.  (name = Bisquit, filling = Füllung)
const TIERS = [
  { name:"Kakao",     sponge:"Dunkler Kakaobiskuit aus bester Kuvertüre — saftig und intensiv im Geschmack.", spongeColor:"#4a3222", spongeCrumb:"#5a3d29",
    filling:"Kirsch", fillingDesc:"Fruchtige Kirschfüllung mit ganzen Sauerkirschen und feiner Säure.", fillingColor:"#6e2230",
    exterior:"marble", base:"#f2ead9" },
  { name:"Hell",      sponge:"Klassischer heller Biskuit mit Bourbon-Vanille — locker und butterzart.", spongeColor:"#f0dfae", spongeCrumb:"#eccf8f",
    filling:"Erdbeer", fillingDesc:"Sommerliche Erdbeerfüllung aus sonnengereiften Früchten.", fillingColor:"#d94b5a",
    exterior:"ruffle", base:"#f4ecd9" },
  { name:"Haselnuss", sponge:"Feiner Haselnussbiskuit mit gerösteten, gemahlenen Haselnüssen.", spongeColor:"#b98c5a", spongeCrumb:"#a97c4a",
    filling:"Schokolade", fillingDesc:"Samtige Schokoladencreme aus dunkler Kuvertüre.", fillingColor:"#573824",
    exterior:"linen", base:"#f2e9d6" },
  { name:"Hell",      sponge:"Heller Biskuit, fein und butterzart — der klassische Boden.", spongeColor:"#f0dfae", spongeCrumb:"#eccf8f",
    filling:"Vanille", fillingDesc:"Zarte Vanillecreme mit echtem Bourbon-Vanillemark.", fillingColor:"#ecd7a2",
    exterior:"dotted", base:"#f6efdd" },
  { name:"Mohn",      sponge:"Zarter Mohnbiskuit mit fein gemahlenem Blaumohn und Zitrusnote.", spongeColor:"#cfc4b2", spongeCrumb:"#bcae97",
    filling:"Himbeer", fillingDesc:"Frische Himbeerfüllung — fruchtig-säuerlich und intensiv.", fillingColor:"#c93f63",
    exterior:"plain", base:"#f6ecec" },
  { name:"Hell",      sponge:"Heller Biskuit mit feiner Krume, luftig aufgeschlagen.", spongeColor:"#f0dfae", spongeCrumb:"#eccf8f",
    filling:"Maracuja", fillingDesc:"Exotische Maracujacreme — spritzig und erfrischend.", fillingColor:"#eeb93f",
    exterior:"damask", base:"#f7f0d8" },
  { name:"Kakao",     sponge:"Kakaobiskuit, zartbitter und aromatisch, mit feiner Krume.", spongeColor:"#4a3222", spongeCrumb:"#5a3d29",
    filling:"Kiwi", fillingDesc:"Fruchtige Kiwifüllung mit lebendiger, frischer Note.", fillingColor:"#8ba85c",
    exterior:"plain", base:"#f0f0e2" },
  { name:"Kokos",     sponge:"Lockerer Kokosbiskuit mit feinen Kokosraspeln — der krönende Boden.", spongeColor:"#f4ecd9", spongeCrumb:"#e7dcc4",
    filling:"Heidelbeer", fillingDesc:"Aromatische Heidelbeerfüllung mit dezenter Beerensüße.", fillingColor:"#5b3a6b",
    exterior:"plain", base:"#f8f4ea" },
];

/* ---------------------------------------------------------
   BASIC THREE.JS SETUP
--------------------------------------------------------- */
const canvas = document.getElementById("tkGl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:"high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2ead9);
scene.fog = new THREE.Fog(0xf2ead9, 9, 26);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 3.2, 11);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const hemi = new THREE.HemisphereLight(0xfff6e6, 0xd8c39a, 1.0);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff2da, 2.1);
key.position.set(4.5, 7.5, 5.5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xdce8ff, 0.55);
fill.position.set(-6, 3, -4);
scene.add(fill);
const rim = new THREE.PointLight(0xffe2a8, 1.1, 14, 2);
rim.position.set(-3, 4, -3);
scene.add(rim);
// soft warm bounce light from below, so undersides of tiers/rings never go pure black
const bounce = new THREE.PointLight(0xffe9c2, 0.9, 12, 2);
bounce.position.set(0, -3.5, 3);
scene.add(bounce);

/* ---------------------------------------------------------
   REAL PHOTO TEXTURES
   Neutral, evenly-lit close-up photos (crumb, cream, buttercream) that
   get tinted per tier further down, so the live flavour-colour preview
   in the configurator keeps working.
--------------------------------------------------------- */
function loadImage(src){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
const [texCrumbLight, texCrumbCocoa, texCream, texIcing] = await Promise.all([
  loadImage("assets/img/textures/crumb-light.jpg"),
  loadImage("assets/img/textures/crumb-cocoa.jpg"),
  loadImage("assets/img/textures/cream-filling.jpg"),
  loadImage("assets/img/textures/buttercream-exterior.jpg"),
]);

/* ---------------------------------------------------------
   CANVAS TEXTURE HELPERS
--------------------------------------------------------- */
function makeCanvas(size=512){
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return { c, ctx: c.getContext("2d") };
}
function toTexture(c, repeatY=1){
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// derives a normal map directly from a finished color canvas: reads its own
// luminance as a height field and turns the local gradient into a surface
// normal, so crumb pores and cream swirls actually catch light and cast
// tiny shadows instead of just being a flat painted-on photo.
// `heightBias(x,y)` lets a caller sculpt extra height into the field before
// the gradient is taken — e.g. a soft rounded ridge for a filling that should
// bulge outward, on top of the photo's own fine grain.
function canvasToNormalMap(srcCanvas, strength=2.2, heightBias=null){
  const w = srcCanvas.width, h = srcCanvas.height;
  const srcData = srcCanvas.getContext("2d").getImageData(0,0,w,h).data;
  const lum = new Float32Array(w*h);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i = y*w+x, o = i*4;
      lum[i] = (0.299*srcData[o] + 0.587*srcData[o+1] + 0.114*srcData[o+2]) / 255;
      if(heightBias) lum[i] += heightBias(x,y);
    }
  }
  const at = (x,y) => lum[Math.min(h-1,Math.max(0,y))*w + Math.min(w-1,Math.max(0,x))];
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const outCtx = out.getContext("2d");
  const outImg = outCtx.createImageData(w,h);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const dx = (at(x+1,y) - at(x-1,y)) * strength;
      const dy = (at(x,y+1) - at(x,y-1)) * strength;
      let nx=-dx, ny=-dy, nz=1;
      const len = Math.sqrt(nx*nx+ny*ny+nz*nz);
      nx/=len; ny/=len; nz/=len;
      const o=(y*w+x)*4;
      outImg.data[o]   = (nx*0.5+0.5)*255;
      outImg.data[o+1] = (ny*0.5+0.5)*255;
      outImg.data[o+2] = (nz*0.5+0.5)*255;
      outImg.data[o+3] = 255;
    }
  }
  outCtx.putImageData(outImg,0,0);
  return out;
}
function toNormalTexture(c, repeatY=1){
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, repeatY);
  return tex; // normal maps stay in linear space — no sRGB colorSpace
}

// draw a single, seamless crop of a photo into a rect: picks a source window
// matching the rect's aspect ratio (no stretching) at a random offset, so
// repeated calls with the same photo don't look identical — and there are no
// tile seams, unlike repeating small squares across the rect.
function drawPhotoCrop(ctx, img, x, y, w, h){
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const targetAspect = w / h;
  let sw, sh;
  if (iw / ih > targetAspect) { sh = ih; sw = ih * targetAspect; }
  else { sw = iw; sh = iw / targetAspect; }
  const sx = Math.random() * (iw - sw);
  const sy = Math.random() * (ih - sh);
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function hexLuminance(hex){
  const n = parseInt(hex.replace('#',''), 16);
  const r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  return (0.299*r + 0.587*g + 0.114*b)/255;
}
// recolor a rect toward `color` while keeping the photo's own light/dark grain:
// 'color' blend swaps hue+saturation but keeps the photo's luminance, then a
// light 'multiply' pass nudges the overall darkness the rest of the way
function tintRect(ctx, x, y, w, h, color, alpha=0.5){
  ctx.save();
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
function shadeRect(ctx, x, y, w, h, color, alpha=0.22){
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
// draws a photographic band matching a target flavour colour: crossfades
// between a light and a dark reference photo based on how dark the target
// is, then tints the result toward the exact hex.
function drawFlavorTexture(ctx, x, y, w, h, targetColor, lightImg, darkImg){
  const lum = hexLuminance(targetColor);
  const mixDark = Math.min(1, Math.max(0, (0.82 - lum) / (0.82 - 0.18)));
  drawPhotoCrop(ctx, lightImg, x, y, w, h);
  if(mixDark > 0.02){
    ctx.save();
    ctx.globalAlpha = mixDark;
    drawPhotoCrop(ctx, darkImg, x, y, w, h);
    ctx.restore();
  }
  tintRect(ctx, x, y, w, h, targetColor, 0.5);
  shadeRect(ctx, x, y, w, h, targetColor, mixDark > 0.5 ? 0.28 : 0.14);
}

function exteriorTexture(type, base){
  const { c, ctx } = makeCanvas(512);
  drawPhotoCrop(ctx, texIcing, 0, 0, 512, 512);
  tintRect(ctx, 0, 0, 512, 512, base, 0.55);
  shadeRect(ctx, 0, 0, 512, 512, base, 0.16);

  if(type === "marble"){
    for(let i=0;i<26;i++){
      ctx.strokeStyle = `rgba(198,165,92,${0.06+Math.random()*0.14})`;
      ctx.lineWidth = 0.6+Math.random()*1.6;
      ctx.beginPath();
      let x = Math.random()*512, y=0;
      ctx.moveTo(x,y);
      for(let s=0;s<6;s++){
        x += (Math.random()-0.5)*140;
        y += 512/6;
        ctx.bezierCurveTo(x+40,y-40,x-40,y+10,x,y);
      }
      ctx.stroke();
    }
  } else if(type === "ruffle"){
    for(let y=0;y<512;y+=14){
      const grad = ctx.createLinearGradient(0,y,0,y+14);
      grad.addColorStop(0,"rgba(0,0,0,0.05)");
      grad.addColorStop(0.5,"rgba(255,255,255,0.22)");
      grad.addColorStop(1,"rgba(0,0,0,0.07)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      for(let x=0;x<=512;x+=8){
        const yy = y + Math.sin((x*0.05)+y)*3;
        if(x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
      }
      ctx.lineTo(512,y+14); ctx.lineTo(0,y+14); ctx.closePath();
      ctx.fill();
    }
  } else if(type === "linen"){
    for(let y=0;y<512;y+=3){
      ctx.strokeStyle = `rgba(255,255,255,${Math.random()*0.10})`;
      ctx.beginPath(); ctx.moveTo(0,y+Math.random()*2); ctx.lineTo(512,y+Math.random()*2); ctx.stroke();
      ctx.strokeStyle = `rgba(0,0,0,${Math.random()*0.05})`;
      ctx.beginPath(); ctx.moveTo(0,y+1); ctx.lineTo(512,y+1); ctx.stroke();
    }
  } else if(type === "dotted"){
    for(let y=18;y<512;y+=34){
      for(let x=18;x<512;x+=34){
        ctx.beginPath();
        ctx.arc(x + (y%68===18?17:0), y, 3.2, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + (y%68===18?17:0)+1, y+1, 3.2, 0, Math.PI*2);
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fill();
      }
    }
  } else if(type === "damask"){
    ctx.strokeStyle = "rgba(198,165,92,0.16)"; ctx.lineWidth = 1.4;
    const step=44;
    for(let y=-step;y<512+step;y+=step){
      for(let x=-step;x<512+step;x+=step){
        ctx.beginPath();
        ctx.moveTo(x, y+step/2); ctx.lineTo(x+step/2,y); ctx.lineTo(x+step,y+step/2); ctx.lineTo(x+step/2,y+step); ctx.closePath();
        ctx.stroke();
      }
    }
  } else { // plain
    for(let i=0;i<4000;i++){
      ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.03})`;
      ctx.fillRect(Math.random()*512, Math.random()*512, 1,1);
    }
  }
  const normalMap = toNormalTexture(canvasToNormalMap(c, 1.6), 1);
  return { tex: toTexture(c, 1), normalMap };
}

function cutFaceTexture(tier){
  const { c, ctx } = makeCanvas(256);
  // bands bottom(y=256) -> top(y=0): sponge / filling / sponge / filling / sponge
  const segs = [
    { kind:"sponge",  color: tier.spongeColor, h: 0.30 },
    { kind:"filling", color: tier.fillingColor, h: 0.10 },
    { kind:"sponge",  color: tier.spongeCrumb || tier.spongeColor, h:0.30 },
    { kind:"filling", color: tier.fillingColor, h: 0.10 },
    { kind:"sponge",  color: tier.spongeColor, h: 0.20 },
  ];
  let y = 256;
  const bandsPx = [];
  segs.forEach(seg=>{
    const hpx = seg.h*256;
    const top = y-hpx;
    if(seg.kind==="sponge"){
      drawFlavorTexture(ctx, 0, top, 256, hpx+0.5, seg.color, texCrumbLight, texCrumbCocoa);
    } else {
      drawFlavorTexture(ctx, 0, top, 256, hpx+0.5, seg.color, texCream, texCrumbCocoa);
    }
    bandsPx.push({top, h:hpx, color:seg.color});
    y -= hpx;
  });
  // crumb speckle on sponge bands
  bandsPx.forEach((b,i)=>{
    if(i===1||i===3) return; // filling bands: skip speckle, add sheen instead
    for(let s=0;s<180;s++){
      ctx.fillStyle = `rgba(0,0,0,${0.03+Math.random()*0.05})`;
      ctx.fillRect(Math.random()*256, b.top+Math.random()*b.h, 1.4,1.4);
    }
  });
  bandsPx.forEach((b,i)=>{
    if(i!==1 && i!==3) return;
    // light gloss only — the real sense of volume now comes from the bulge
    // sculpted into the normal map below, not from a painted gradient
    const grad = ctx.createLinearGradient(0,b.top,0,b.top+b.h);
    grad.addColorStop(0,"rgba(255,255,255,0.14)");
    grad.addColorStop(0.5,"rgba(255,255,255,0.02)");
    grad.addColorStop(1,"rgba(0,0,0,0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(0,b.top,256,b.h);
  });
  // sculpt a soft, rounded bulge into the filling bands — a real cream/fruit
  // layer squeezes out slightly past the sponge, it doesn't sit flush — so the
  // normal map should curve outward there instead of just following the photo
  const fillingBands = bandsPx.filter((b,i)=> i===1 || i===3);
  const bulgeAmp = 0.16;
  const heightBias = (x,y) => {
    for(const b of fillingBands){
      if(y>=b.top && y<=b.top+b.h) return Math.sin(Math.PI*(y-b.top)/b.h)*bulgeAmp;
    }
    return 0;
  };
  const normalMap = toNormalTexture(canvasToNormalMap(c, 1.8, heightBias), 1);
  return { tex: toTexture(c,1), normalMap, bandsPx: bandsPx.map(b=>({...b, topFrac: b.top/256, hFrac: b.h/256})) };
}

// matte gold texture for the trim rings between tiers — almost solid colour,
// just enough grain to not look like flat CG plastic, no shiny highlight band
// (that reads as "polished", not the soft matte metal look we want here).
function goldRingTexture(){
  const { c, ctx } = makeCanvas(256);
  ctx.fillStyle = "#c8a24d";
  ctx.fillRect(0,0,256,256);
  for(let i=0;i<3500;i++){
    const x = Math.random()*256, y = Math.random()*256;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,244,214,${Math.random()*0.07})`
      : `rgba(70,48,18,${Math.random()*0.07})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  const normalMap = toNormalTexture(canvasToNormalMap(c, 0.4), 1);
  return { tex: toTexture(c,1), normalMap };
}

function maskTexture(bandsPx, indices){
  const { c, ctx } = makeCanvas(256);
  ctx.clearRect(0,0,256,256);
  indices.forEach(i=>{
    const b = bandsPx[i];
    ctx.fillStyle = "rgba(230,190,110,1)";
    ctx.fillRect(0, b.top-1, 256, b.h+2);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------------------------------------------------------
   BUILD CAKE
--------------------------------------------------------- */
const cakeGroup = new THREE.Group();
scene.add(cakeGroup);

const N = TIERS.length;
const tierHeight = 0.62;
const ringHeight = 0.045;
const radii = [];
for(let i=0;i<N;i++){
  const t = i/(N-1);
  radii.push(0.95 + (2.45-0.95) * Math.pow(1-t, 1.2));
}

let curY = 0;
const tierMeta = [];
const { tex: goldTex, normalMap: goldNormal } = goldRingTexture();
const goldMat = new THREE.MeshStandardMaterial({
  color:0xffffff, map: goldTex, normalMap: goldNormal,
  metalness:0.6, roughness:0.58, // higher roughness = soft matte metal, not a mirror-polished look
  emissive:0x3a2a10, emissiveIntensity:0.22 // guarantees the trim never goes black at grazing/underside angles
});

const GAP_START = 3*Math.PI/2; // wedge missing between 270deg and 360deg
const GAP_LEN = Math.PI*0.58; // wider than 90 deg so the camera never grazes the solid wall at close range
const cylThetaStart = GAP_START + GAP_LEN; // wraps to 0
const cylThetaLen = Math.PI*2 - GAP_LEN;

for(let i=0;i<N;i++){
  const tier = TIERS[i];
  const r = radii[i];
  const yCenter = curY + tierHeight/2;

  // gold ring at base of tier
  if(i>0){
    const ringGeo = new THREE.CylinderGeometry(r*1.012, r*1.012, ringHeight, 64);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.position.y = curY + ringHeight/2;
    cakeGroup.add(ring);
    curY += ringHeight;
  }

  const yc = curY + tierHeight/2;
  const { tex: exteriorMap, normalMap: exteriorNormal } = exteriorTexture(tier.exterior, tier.base);

  // WHOLE (frosted) mesh
  const wholeGeo = new THREE.CylinderGeometry(r, r, tierHeight, 56);
  const wholeMat = new THREE.MeshStandardMaterial({
    color: tier.base, map: exteriorMap, normalMap: exteriorNormal,
    roughness:0.42, metalness:0.06,
    transparent:false, opacity:1
  });
  const wholeMesh = new THREE.Mesh(wholeGeo, wholeMat);
  wholeMesh.position.y = yc;
  cakeGroup.add(wholeMesh);

  // rounded piped-icing bead along the top rim, so the edge reads as a soft,
  // closed lip rather than a sharp cylinder-to-cap line
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.034, 10, 64), wholeMat);
  rim.rotation.x = Math.PI/2;
  rim.position.y = curY + tierHeight;
  cakeGroup.add(rim);

  // CUT body (270deg cylinder, missing wedge)
  const cutGeo = new THREE.CylinderGeometry(r, r, tierHeight, 56, 1, false, cylThetaStart, cylThetaLen);
  const cutMat = new THREE.MeshStandardMaterial({
    color: tier.base, map: exteriorMap, normalMap: exteriorNormal,
    roughness:0.42, metalness:0.06,
    transparent:false, opacity:1
  });
  const cutMesh = new THREE.Mesh(cutGeo, cutMat);
  cutMesh.position.y = yc;
  cutMesh.visible = false;
  cakeGroup.add(cutMesh);

  // cut faces (two, at the wedge edges) + overlay highlight masks
  const { tex: faceTex, normalMap: faceNormal, bandsPx } = cutFaceTexture(tier);
  const faceMeshes = [];
  const overlayMeshes = { sponge:[], filling:[] };

  [GAP_START, GAP_START+GAP_LEN].forEach((theta, idx)=>{
    const faceGeo = new THREE.PlaneGeometry(r, tierHeight);
    faceGeo.translate(r/2, 0, 0);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex, normalMap: faceNormal, roughness:0.6, metalness:0.0,
      transparent:false, opacity:1, side: THREE.DoubleSide
    });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.y = yc;
    face.rotation.y = theta + (idx===0? Math.PI : 0);
    face.visible = false;
    cakeGroup.add(face);
    faceMeshes.push(face);

    // highlight overlays only on primary face (idx 0) to keep it light
    if(idx===0){
      const spongeMaskTex = maskTexture(bandsPx, [0,2,4]);
      const fillingMaskTex = maskTexture(bandsPx, [1,3]);
      [ ["sponge", spongeMaskTex], ["filling", fillingMaskTex] ].forEach(([key, mtex])=>{
        const oGeo = new THREE.PlaneGeometry(r, tierHeight);
        oGeo.translate(r/2, 0, 0.002);
        const oMat = new THREE.MeshBasicMaterial({
          map:mtex, transparent:true, opacity:0, blending:THREE.AdditiveBlending,
          depthWrite:false, side:THREE.DoubleSide
        });
        const oMesh = new THREE.Mesh(oGeo, oMat);
        oMesh.position.y = yc;
        oMesh.rotation.y = theta + Math.PI;
        cakeGroup.add(oMesh);
        overlayMeshes[key].push(oMesh);
      });
    }
  });

  tierMeta.push({ tier, yCenter: yc, wholeMat, cutMat, faceMeshes, overlayMeshes, r });
  curY += tierHeight;
}

const totalHeight = curY;

// floral topper: cluster of simple "rose" spheres + cascade down one side
function makeFlowerCluster(scale=1){
  const g = new THREE.Group();
  const petalMat = new THREE.MeshStandardMaterial({ color:0xfbf6ec, roughness:0.45, metalness:0.05 });
  const leafMat = new THREE.MeshStandardMaterial({ color:0x8fa06a, roughness:0.6 });
  for(let i=0;i<5;i++){
    const s = (0.09 + Math.random()*0.05)*scale;
    const sph = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 10), petalMat);
    sph.position.set((Math.random()-0.5)*0.16*scale, (Math.random()-0.5)*0.1*scale, (Math.random()-0.5)*0.16*scale);
    g.add(sph);
  }
  for(let i=0;i<3;i++){
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.03*scale, 0.09*scale, 6), leafMat);
    leaf.position.set((Math.random()-0.5)*0.2*scale, -0.03*scale, (Math.random()-0.5)*0.2*scale);
    leaf.rotation.z = Math.random()*Math.PI;
    g.add(leaf);
  }
  return g;
}
// all floral decoration lives in its own group so it can be hidden as a whole
// while the cake is opened up for the close-up cut-away journey
const decorGroup = new THREE.Group();
cakeGroup.add(decorGroup);

const topper = makeFlowerCluster(1.3);
topper.position.set(0, totalHeight + 0.12, 0);
decorGroup.add(topper);

const cascadeAngle = GAP_START + GAP_LEN/2 + Math.PI; // opposite the cut, decorative side
let cy = totalHeight*0.15;
while(cy < totalHeight*0.98){
  const fl = makeFlowerCluster(0.85 + Math.random()*0.3);
  const rr = radii[Math.min(N-1, Math.floor((cy/totalHeight)*N))]*1.0;
  fl.position.set(Math.cos(cascadeAngle)*rr, cy, Math.sin(cascadeAngle)*rr);
  decorGroup.add(fl);
  cy += totalHeight/ (N*1.15);
}

cakeGroup.position.y = -totalHeight/2; // center vertically

/* ---------------------------------------------------------
   CAMERA / SCROLL CHOREOGRAPHY
--------------------------------------------------------- */
const heroEl = document.getElementById("tkHero");
const outroEl = document.getElementById("tkOutro");
const panelEl = document.getElementById("tkPanel");
const panelKicker = document.getElementById("tkPanelKicker");
const panelTitle = document.getElementById("tkPanelTitle");
const panelText = document.getElementById("tkPanelText");
const panelTag = document.getElementById("tkPanelTag");
const dotsEl = document.getElementById("tkDots");

for(let i=0;i<N;i++){
  const d = document.createElement("div");
  d.className = "tk-dot"; d.dataset.i = i;
  dotsEl.appendChild(d);
}
const dotEls = [...dotsEl.querySelectorAll(".tk-dot")];

const REVEAL_START = 0.06, REVEAL_END = 0.13;
const JOURNEY_START = 0.13, JOURNEY_END = 0.82;
const OUTRO_START = 0.82;       // no gap after the journey → continuous camera
const OUTRO_SETTLE = 0.955;     // pull-back motion completes here, then the frame is held

// easing helpers
const easeInOutCubic = t => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;

function tierY(i){ return tierMeta[i].yCenter + cakeGroup.position.y; }
const yMid = (tierY(0) + tierY(N-1)) / 2;
const flashEl = document.getElementById("tkFlash");

let lastSeg = -1;
let cutRevealed = false;

function updateScene(p){
  // --- camera path ---
  if(p <= REVEAL_START){
    // HERO: whole cake centered in frame, gentle idle motion while text is read
    const local = p/REVEAL_START;
    const y = yMid;
    const angle = Math.PI*0.17 + local*0.04;
    const dist = 13.5 - local*0.7;
    camera.position.set(Math.sin(angle)*dist, y + 0.9, Math.cos(angle)*dist);
    camera.lookAt(0, y - 0.15, 0);
  } else if(p <= REVEAL_END){
    // TRANSITION: dolly in + rotate toward the wedge, descend to the base tier
    const local = (p-REVEAL_START)/(REVEAL_END-REVEAL_START);
    const eased = local*local*(3-2*local); // smoothstep
    const y = THREE.MathUtils.lerp(yMid, tierY(0), eased);
    const dist = THREE.MathUtils.lerp(12.8, 4.5, eased);
    const angle = THREE.MathUtils.lerp(Math.PI*0.21, GAP_START+GAP_LEN/2, eased);
    const heightOffset = THREE.MathUtils.lerp(0.9, 0.05, eased);
    camera.position.set(Math.sin(angle)*dist, y+heightOffset, Math.cos(angle)*dist);
    camera.lookAt(0, y - (1-eased)*0.15, 0);
  } else if(p <= JOURNEY_END){
    // JOURNEY: travel up along the cut face, tier by tier
    const local = (p-JOURNEY_START)/(JOURNEY_END-JOURNEY_START);
    const y = THREE.MathUtils.lerp(tierY(0), tierY(N-1), local);
    // scale distance with the current tier's radius so every tier — big base or
    // small top — fills the frame to a similarly large, close-up degree
    const idxFloat = local*(N-1);
    const i0 = Math.floor(idxFloat), i1 = Math.min(N-1, i0+1), rFrac = idxFloat-i0;
    const curR = THREE.MathUtils.lerp(radii[i0], radii[i1], rFrac);
    // purely proportional to radius (no flat offset) so the on-screen size stays
    // constant across tiers instead of shrinking for the smaller top layers
    const dist = Math.max(curR*1.55, 1.3) - Math.sin(local*Math.PI)*0.15;
    const angle = GAP_START+GAP_LEN/2;
    // slight elevation + downward look so the tier's top surface is glimpsed,
    // reading as a solid, closed piece instead of a flat cut-out card;
    // scaled with `dist` so the tilt angle stays consistent across tier sizes
    camera.position.set(Math.sin(angle)*dist, y+dist*0.05, Math.cos(angle)*dist);
    camera.lookAt(0, y-dist*0.014, 0);
  } else {
    // OUTRO: one continuous, eased pull-back from the top tier to a full hero view.
    const local = THREE.MathUtils.clamp((p-OUTRO_START)/(OUTRO_SETTLE-OUTRO_START), 0, 1);
    const eased = easeInOutCubic(local);
    const angle = THREE.MathUtils.lerp(GAP_START+GAP_LEN/2, GAP_START+GAP_LEN/2 - 0.28, eased); // gentle 3/4 drift
    const dist = THREE.MathUtils.lerp(4.5, 15.5, eased);
    const camY = THREE.MathUtils.lerp(tierY(N-1)+0.02, yMid, eased);
    const lookY = THREE.MathUtils.lerp(tierY(N-1), yMid, eased);
    camera.position.set(Math.sin(angle)*dist, camY, Math.cos(angle)*dist);
    camera.lookAt(0, lookY, 0);
  }

  // --- whole/cut swap, each hidden behind a soft veil so the change is never a visible pop ---
  const revealMid = (REVEAL_START+REVEAL_END)/2;
  const CLOSE_AT = OUTRO_START + 0.035; // ~0.855, inside the breath before the headline appears
  const shouldBeCut = p >= revealMid && p < CLOSE_AT;

  if(shouldBeCut !== cutRevealed){
    const opening = shouldBeCut; // false → we're closing the cake for the finale
    cutRevealed = shouldBeCut;
    tierMeta.forEach(tm=>{
      tm.wholeMat.visible = !cutRevealed;
      tm.cutMat.visible = cutRevealed;
      tm.faceMeshes.forEach(f=> f.visible = cutRevealed);
    });
    decorGroup.visible = !cutRevealed; // flowers/pearls only make sense on the whole, uncut cake
    gsap.fromTo(flashEl,
      { opacity: opening ? 0.5 : 0.7 },
      { opacity:0, duration: opening ? 0.7 : 1.0, ease:"power2.out", overwrite:true });
  }

  // --- HUD visibility ---
  const heroOpacity = 1 - THREE.MathUtils.clamp(p/0.05, 0, 1);
  heroEl.style.opacity = heroOpacity;
  heroEl.style.transform = `translateY(${-heroOpacity*-20+ (1-heroOpacity)*-20}px)`;
  heroEl.style.pointerEvents = heroOpacity > 0.5 ? "auto":"none";

  const inJourney = p >= JOURNEY_START-0.01 && p <= JOURNEY_END+0.01;
  const PANEL_HIDE = JOURNEY_END - 0.015;   // ~0.805
  const OUTRO_TEXT_IN = OUTRO_START + 0.05; // ~0.87
  panelEl.classList.toggle("is-visible", p >= JOURNEY_START-0.01 && p < PANEL_HIDE);
  dotsEl.classList.toggle("is-visible", p >= JOURNEY_START-0.01 && p < PANEL_HIDE);
  outroEl.classList.toggle("is-visible", p >= OUTRO_TEXT_IN);

  if(inJourney){
    const local = THREE.MathUtils.clamp((p-JOURNEY_START)/(JOURNEY_END-JOURNEY_START),0,1);
    const segFloat = local * N * 2;
    const segIndex = Math.min(N*2-1, Math.floor(segFloat));
    const tierIndex = Math.floor(segIndex/2);
    const phase = segIndex % 2; // 0 = Boden, 1 = Füllung

    if(segIndex !== lastSeg){
      lastSeg = segIndex;
      const tier = TIERS[tierIndex];
      panelKicker.textContent = `Etage ${tierIndex+1} · ${phase===0?"Boden":"Füllung"}`;
      panelTitle.textContent = phase===0 ? tier.name : tier.filling;
      panelText.textContent = phase===0 ? tier.sponge : tier.fillingDesc;
      panelTag.textContent = `Etage ${tierIndex+1} von ${N}`;
      dotEls.forEach((d,i)=> d.classList.toggle("is-active", i===tierIndex));

      tierMeta.forEach((tm,i)=>{
        const active = i===tierIndex;
        gsap.to(tm.overlayMeshes.sponge.map(m=>m.material), { opacity: active&&phase===0?0.4:0, duration:0.4, overwrite:true });
        gsap.to(tm.overlayMeshes.filling.map(m=>m.material), { opacity: active&&phase===1?0.4:0, duration:0.4, overwrite:true });
      });
    }
  } else {
    if(lastSeg !== -1){
      lastSeg = -1;
      tierMeta.forEach(tm=>{
        tm.overlayMeshes.sponge.forEach(m=> m.material.opacity=0);
        tm.overlayMeshes.filling.forEach(m=> m.material.opacity=0);
      });
    }
  }
}

/* smoothing */
let rawProgress = 0;
let smoothProgress = 0;
let progressInitialized = false;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Progress is driven purely by the sticky track's scroll position — no pinning, so there is
// nothing to "release" and no blank gap: when the track ends, the sticky stage scrolls away
// on its own and the contact section (next in flow) takes over seamlessly.
ScrollTrigger.create({
  trigger: ".tk-scene-track",
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: self => {
    if(!progressInitialized || Math.abs(self.progress - rawProgress) > 0.22) smoothProgress = self.progress;
    progressInitialized = true;
    rawProgress = self.progress;
  }
});

// Pause the render loop whenever the scene has scrolled out of view (i.e. we're in the form),
// so no GPU is wasted; resume the moment any part of it returns.
let sceneVisible = true;
new IntersectionObserver(([e])=>{ sceneVisible = e.isIntersecting; }, { threshold: 0 })
  .observe(document.querySelector(".tk-scene-sticky"));

function animate(){
  requestAnimationFrame(animate);
  if(!sceneVisible) return; // scene off-screen (reading the form) → skip rendering
  var smoothing = reduceMotion ? 1 : 0.09; // no lag under reduced-motion: jump straight to target
  smoothProgress += (rawProgress - smoothProgress) * smoothing;
  updateScene(smoothProgress);
  if(!reduceMotion){
    const t = performance.now()*0.00003;
    cakeGroup.rotation.y = Math.sin(t*0.6)*0.015; // ultra subtle idle sway
  }
  renderer.render(scene, camera);
}
updateScene(0);
animate();

window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ScrollTrigger.refresh();
});

/* ---------------------------------------------------------
   CONTACT FORM — flavour lists, tier diagram, per-tier selects
--------------------------------------------------------- */
// Only the flavours offered on the real order form:
const FUELLUNGEN = ["Erdbeer","Himbeer","Kiwi","Kirsch","Schokolade","Vanille","Pfirsich","Ananas","Kokos","Eierlikör","Maracuja","Mango","Heidelbeer"];
const BISQUITS   = ["Hell","Kakao","Haselnuss","Kokos","Eierlikör","Mohn"];
const NUM_TIERS  = 8;

function optionList(items){
  return ['<option value="">nicht gewählt</option>']
    .concat(items.map(x=>`<option>${x}</option>`)).join("");
}

// --- schematic cake diagram (tier 1 bottom → 8 top), matching the order form ---
(function buildDiagram(){
  const el = document.getElementById("tkTierDiagram");
  if(!el) return;
  const W = 200, topPad = 10, th = 30, gap = 4;
  const H = topPad*2 + NUM_TIERS*th + (NUM_TIERS-1)*gap;
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for(let i=0;i<NUM_TIERS;i++){          // i=0 → top tier (8),  i=7 → bottom tier (1)
    const num = NUM_TIERS - i;
    const w = 70 + i*15;                  // widest at the bottom
    const x = (W - w)/2;
    const y = topPad + i*(th+gap);
    const ry = 5;
    s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w}" height="${th}" rx="${ry}" ry="${ry}" fill="#ffffff" stroke="#2b241c" stroke-width="1.2"/>`;
    s += `<line x1="${(x+7).toFixed(1)}" y1="${y+th/2}" x2="${(x+w-7).toFixed(1)}" y2="${y+th/2}" stroke="#c6a55c" stroke-width="1.6"/>`;
    s += `<text x="${(x-12).toFixed(1)}" y="${y+th/2+4}" font-family="Georgia,serif" font-size="13" fill="#2b241c" text-anchor="end">${num}</text>`;
  }
  s += `</svg>`;
  el.innerHTML = s;
})();

// --- per-tier Füllung + Bisquit selects, ordered 8 → 1 like the order form ---
(function buildTierSelects(){
  const grid = document.getElementById("tkTiersGrid");
  if(!grid) return;
  let html = "";
  for(let t=NUM_TIERS; t>=1; t--){
    html += `<div class="tk-field">
        <label for="tk-fuellung${t}">Füllung ${t}</label>
        <select id="tk-fuellung${t}">${optionList(FUELLUNGEN)}</select>
      </div>
      <div class="tk-field">
        <label for="tk-bisquit${t}">Bisquit ${t}</label>
        <select id="tk-bisquit${t}">${optionList(BISQUITS)}</select>
      </div>`;
  }
  grid.innerHTML = html;
})();

/* ---------------------------------------------------------
   FORMULAR-VERSAND — öffnet das E-Mail-Programm des Kunden mit
   vorausgefüllter Anfrage (mailto:), genau wie der bisherige
   "Tortenanfragen"-Link auf dieser Seite. Diese statische Website hat
   kein Server-Backend, daher ist mailto: der bestehende Versand-Weg
   (siehe auch der Hinweis auf kontakt.html).
--------------------------------------------------------- */
const ORDER_RECIPIENT = "hochzeitstorten@baeckerei-eichholz.de";

function fieldValue(id){
  const el = document.getElementById(id);
  if(!el) return "";
  return (el.value || "").trim();
}

function radioValue(name){
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

function checkboxLabel(id, label){
  const el = document.getElementById(id);
  return el && el.checked ? label : "Nein";
}

function buildOrderMailBody(){
  const lines = [];
  const add = (label, value) => { if(value) lines.push(`${label}: ${value}`); };

  add("Datum der Feierlichkeit", fieldValue("tk-datum"));
  add("Name der Torte", fieldValue("tk-tortenname"));
  add("Größe der Torte", fieldValue("tk-groesse"));
  add("Form der Torte", fieldValue("tk-form"));
  add("Dekorations-/Blumenmaterial", fieldValue("tk-deko"));
  add("Farbe der Dekoration/Blume", fieldValue("tk-dekofarbe"));
  add("Art der Blume", fieldValue("tk-blumenart"));
  add("Art des Tortengestells", fieldValue("tk-gestell"));
  add("Brautpaar gewünscht", fieldValue("tk-brautpaar"));
  add("Brautpaar-Nummer", fieldValue("tk-brautpaarnr"));

  lines.push("");
  lines.push("Tortenfüllungen (Etage 8 oben → Etage 1 unten):");
  for(let t=NUM_TIERS; t>=1; t--){
    const fuellung = fieldValue(`tk-fuellung${t}`);
    const bisquit = fieldValue(`tk-bisquit${t}`);
    if(fuellung || bisquit){
      lines.push(`  Etage ${t}: Bisquit ${bisquit || "-"} / Füllung ${fuellung || "-"}`);
    }
  }

  lines.push("");
  add("Ort der Feierlichkeit", fieldValue("tk-ort"));
  add("Lieferung gewünscht", fieldValue("tk-lieferung"));
  add("Zeit der Anlieferung/Abholung", fieldValue("tk-zeit"));

  lines.push("");
  lines.push("Anschrift:");
  add("Anrede", radioValue("tk-anrede"));
  add("Name", fieldValue("tk-aname"));
  add("Firma", fieldValue("tk-firma"));
  add("Anschrift", fieldValue("tk-anschrift"));
  add("Telefon", fieldValue("tk-telefon"));
  add("Rückruf gewünscht", checkboxLabel("tk-rueckruf", "Ja"));
  add("Fax", fieldValue("tk-fax"));
  add("E-Mail", fieldValue("tk-email"));

  lines.push("");
  lines.push("Nachricht:");
  lines.push(fieldValue("tk-nachricht") || "-");

  return lines.join("\n");
}

const orderForm = document.getElementById("tkOrderForm");
if(orderForm){
  orderForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    const original = btn.textContent;

    const tortenname = fieldValue("tk-tortenname");
    const subject = `Tortenanfrage${tortenname ? " – " + tortenname : ""}`;
    const body = buildOrderMailBody();
    const mailtoUrl = `mailto:${ORDER_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    btn.textContent = "Ihr E-Mail-Programm öffnet sich…";
    setTimeout(()=> btn.textContent = original, 3200);
  });
}
