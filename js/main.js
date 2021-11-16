const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// 전역 변수
const start_position = 3;
const end_position = -start_position;
const text = document.querySelector('.text');
const TIME_LIMIT = 10;
let gameStat = 'loading';
let isLookingBackward = true;
const newGame = document.querySelector('.newGame');

function createCube(size, positionX, rotationY = 0, color = 0xfbc851) {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = positionX;
  cube.rotation.y = rotationY;
  scene.add(cube);
  return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Doll {
  constructor() {
    loader.load('../models/scene.gltf', (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.3, 0.3, 0.3);
      gltf.scene.position.set(0, -1, 0);
      this.doll = gltf.scene;
    });
  }

  lookBackward() {
    // this.doll.rotation.y = -3.15;
    gsap.to(this.doll.rotation, { y: -3.15, duration: 0.45 });
    setTimeout(() => (isLookingBackward = true), 150);
    if (gameStat !== 'over') {
      text.textContent = '무궁화 꽃이...';
      text.classList = 'text greenLight';
    }
  }

  lookForward() {
    // this.doll.rotation.y = 0;
    gsap.to(this.doll.rotation, { y: 0, duration: 0.45 });
    setTimeout(() => (isLookingBackward = false), 450);
    if (gameStat !== 'over') {
      text.textContent = '피었습니다!';
      text.classList = 'text redLight';
    }
  }

  async start() {
    this.lookBackward();
    await delay(Math.random() * 1000 + 1000);
    this.lookForward();
    await delay(Math.random() * 750 + 750);
    this.start();
  }
}

function createTrack() {
  createCube(
    { w: start_position * 2 + 0.2, h: 1.5, d: 1 },
    0,
    0,
    0xe5a716
  ).position.z = -1;
  createCube({ w: 0.2, h: 1.5, d: 1 }, start_position, -0.35);
  createCube({ w: 0.2, h: 1.5, d: 1 }, end_position, 0.35);
}

createTrack();

class Player {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.2, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.z = 1;
    sphere.position.x = start_position;
    scene.add(sphere);
    this.player = sphere;
    this.playerInfo = {
      positionX: start_position,
      velocity: 0,
    };
  }
  run() {
    this.playerInfo.velocity = 0.03;
  }

  stop() {
    gsap.to(this.playerInfo, { velocity: 0, duration: 0.2 });
  }

  check() {
    if (this.playerInfo.velocity > 0 && !isLookingBackward) {
      text.textContent = '당신은 총에 맞았습니다...';
      text.classList = 'text redLight';
      gameStat = 'over';
      newGame.textContent = '새로고침(F5)으로 재도전할 수 있어요!';
    }
    if (this.playerInfo.positionX < end_position + 0.4) {
      text.textContent = '당신은 생존했습니다!';
      text.classList = 'text greenLight';
      gameStat = 'over';
      newGame.textContent = '새로고침(F5)으로 재도전할 수 있어요!';
    }
  }

  update() {
    this.check();
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  }
}

const player = new Player();

let doll = new Doll();

async function init() {
  await delay(1000);
  text.textContent = '게임 시작까지 3초';
  newGame.textContent = '스페이스 바(Space Bar)로 움직일 수 있어요!';
  await delay(1000);
  text.textContent = '게임 시작까지 2초';
  await delay(1000);
  text.textContent = '게임 시작까지 1초';
  await delay(1000);
  text.textContent = '출발!!!';
  text.classList = 'text redLight';
  newGame.textContent = '';
  await delay(1000);

  startGame();
}

function startGame() {
  gameStat = 'started';
  let progressBar = createCube({ w: 5, h: 0.1, d: 0 }, 0, 0, 0xff0000);
  progressBar.position.y = 3;
  gsap.to(progressBar.scale, { x: 0, duration: TIME_LIMIT, ease: 'none' });
  doll.start();
  setTimeout(() => {
    if (gameStat !== 'over') {
      text.textContent = '시간 안에 도착하지 못했습니다...';
      text.classList = 'text redLight';
      newGame.textContent = '새로고침(F5)으로 재도전할 수 있어요!';
      gameStat = 'over';
    }
  }, TIME_LIMIT * 1000);
}

init();

function animate() {
  if (gameStat === 'over') return;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  player.update();
}
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', (e) => {
  if (gameStat !== 'started') {
    return;
  }
  if (e.key === ' ') {
    player.run();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    player.stop();
  }
});
