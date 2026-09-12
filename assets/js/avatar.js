// 3D avatar for the hero section. Degrades in stages:
//   1. No WebGL, or nothing loads at all → static portrait image.
//   2. GLB loads, but has no arm bones (e.g. the bundled half-body demo
//      model) → procedural idle breathing + head-turn greeting only.
//   3. GLB loads with a full arm/shoulder rig → a procedural wave gesture,
//      then cross-fades into a looping idle animation. The idle clip is
//      retargeted from a Mixamo/Ready Player Me FBX onto the avatar's own
//      skeleton by stripping the "mixamorig" bone-name prefix — RPM avatars
//      use plain Mixamo-compatible names (Hips, Spine, LeftArm, …), so the
//      renamed tracks bind straight onto the loaded model.
//
// Every stage is wrapped so a failure anywhere (network, parse, missing
// bones) just falls through to the next, simpler stage rather than leaving
// a blank hero.

import { AVATAR_GLB_URL, AVATAR_DEMO_GLB, AVATAR_IDLE_FBX, AVATAR_PORTRAIT } from "./data.js";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

function showPortraitFallback(mount) {
  mount.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "avatar-portrait";
  const img = new Image();
  img.alt = "Aayush Bisht";
  img.onerror = () => {
    wrap.textContent = "AB";
    wrap.style.fontSize = "4rem";
    wrap.style.fontFamily = "var(--font-display)";
    wrap.style.color = "var(--accent)";
  };
  img.src = AVATAR_PORTRAIT;
  wrap.appendChild(img);
  mount.appendChild(wrap);
}

export async function initAvatar(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsWebGL()) {
    showPortraitFallback(mount);
    return;
  }

  let THREE, GLTFLoader, FBXLoader;
  try {
    [THREE, { GLTFLoader }, { FBXLoader }] = await Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/loaders/FBXLoader.js"),
    ]);
  } catch (e) {
    showPortraitFallback(mount);
    return;
  }

  const glbUrl = AVATAR_GLB_URL || AVATAR_DEMO_GLB;
  let gltf;
  try {
    gltf = await new GLTFLoader().loadAsync(glbUrl);
  } catch (e) {
    showPortraitFallback(mount);
    return;
  }

  // ---- Scene setup -------------------------------------------------------
  const width = mount.clientWidth || 400;
  const height = mount.clientHeight || 500;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(1.2, 2, 2);
  const fill = new THREE.DirectionalLight(0x5b8cff, 0.7);
  fill.position.set(-2, 0.5, 1);
  const rim = new THREE.DirectionalLight(0x4ade9f, 1.4);
  rim.position.set(-0.5, 1.5, -2);
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(key, fill, rim, ambient);

  const model = gltf.scene;
  scene.add(model);

  // Frame the camera on the model's head/chest region.
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  // Pull back and aim slightly lower than the crown: framing tight on the
  // head alone filled the whole hero with a face at small viewport widths.
  const headY = box.max.y - size.y * 0.18;
  camera.position.set(center.x, headY, size.z + size.y * 1.05 + 0.5);
  camera.lookAt(center.x, headY - size.y * 0.12, center.z);

  // ---- Find skeleton bones ------------------------------------------------
  const bones = {};
  model.traverse((obj) => {
    if (obj.isBone) bones[obj.name] = obj;
  });
  const hasArm = !!(bones.RightArm && bones.RightForeArm);
  const head = bones.Head || null;
  const spine = bones.Spine || bones.Spine1 || bones.Spine2 || null;

  const mixer = new THREE.AnimationMixer(model);
  let idleAction = null;

  // ---- Try to load + retarget a real mocap idle clip ----------------------
  async function tryLoadIdleClip() {
    if (!hasArm) return null; // half-body demo model: skip, use procedural instead
    try {
      const fbx = await new FBXLoader().loadAsync(AVATAR_IDLE_FBX);
      const clip = fbx.animations && fbx.animations[0];
      if (!clip) return null;

      const retargeted = clip.clone();
      let matched = 0;
      retargeted.tracks = retargeted.tracks
        .map((track) => {
          const [rawBone, prop] = track.name.split(".");
          const boneName = rawBone.replace(/^mixamorig:?/i, "");
          if (!bones[boneName]) return null;
          matched++;
          const newTrack = track.clone();
          newTrack.name = `${boneName}.${prop}`;
          return newTrack;
        })
        .filter(Boolean);

      if (matched < 4) return null; // not enough of the skeleton matched
      return retargeted;
    } catch (e) {
      return null;
    }
  }

  function playProceduralWaveThenIdle() {
    if (!hasArm || reduceMotion) {
      playIdleBreathing();
      return;
    }
    const rightArm = bones.RightArm;
    const rightFore = bones.RightForeArm;
    const startArm = rightArm.rotation.clone();
    const startFore = rightFore.rotation.clone();
    const wavePhase = { t: 0 };
    const duration = 1600;
    const startTime = performance.now();

    function waveTick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const lift = Math.sin(t * Math.PI) * 1.1;
      const shake = Math.sin(t * Math.PI * 6) * 0.35 * Math.sin(t * Math.PI);
      rightArm.rotation.z = startArm.z - lift;
      rightArm.rotation.x = startArm.x + 0.2;
      rightFore.rotation.z = startFore.z - shake;
      if (t < 1) {
        requestAnimationFrame(waveTick);
      } else {
        rightArm.rotation.copy(startArm);
        rightFore.rotation.copy(startFore);
        playIdleBreathing();
      }
    }
    requestAnimationFrame(waveTick);
  }

  let breathingRaf;
  function playIdleBreathing() {
    if (idleAction) {
      idleAction.reset().fadeIn(0.5).play();
      return;
    }
    if (reduceMotion) return;
    const start = performance.now();
    function tick(now) {
      const t = (now - start) / 1000;
      if (spine) spine.rotation.x = Math.sin(t * 0.9) * 0.02;
      if (head) {
        head.rotation.y = Math.sin(t * 0.35) * 0.09;
        head.rotation.x = Math.sin(t * 0.5) * 0.03;
      }
      breathingRaf = requestAnimationFrame(tick);
    }
    breathingRaf = requestAnimationFrame(tick);
  }

  tryLoadIdleClip().then((clip) => {
    if (clip) {
      idleAction = mixer.clipAction(clip);
      idleAction.setLoop(THREE.LoopRepeat);
      idleAction.clampWhenFinished = true;
    }
    playProceduralWaveThenIdle();
  });

  // ---- Mouse parallax on head ---------------------------------------------
  let targetYaw = 0, targetPitch = 0;
  if (head && !reduceMotion) {
    window.addEventListener("mousemove", (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetYaw = nx * 0.18;
      targetPitch = ny * 0.08;
    });
  }

  // ---- Render loop ----------------------------------------------------------
  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    const delta = clock.getDelta();
    mixer.update(delta);
    if (head && !reduceMotion && !idleAction) {
      // procedural parallax layers on top of the breathing tick when no clip
    }
    if (head) {
      head.rotation.y += (targetYaw - head.rotation.y) * 0.04;
      head.rotation.x += (targetPitch - head.rotation.x) * 0.04;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  function onResize() {
    const w = mount.clientWidth || width;
    const h = mount.clientHeight || height;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) animate();
  });
}
