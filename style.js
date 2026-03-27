let scene, camera, renderer, titan, swordLeft, swordRight, isSwinging = false;
let targetPos = new THREE.Vector3(), frags = 0, isGameOver = false, boostReady = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 1. HÀM KIỂM TRA ĐĂNG NHẬP (QUAN TRỌNG ĐỂ HIỆN GAME)
function checkLogin() {
    const pass = document.getElementById('password').value;
    if(pass === "emyeubminhlam") {
        // Ẩn màn hình đăng nhập
        document.getElementById('login-screen').classList.add('hidden');
        // Hiện giao diện game
        document.getElementById('game-ui').classList.remove('hidden');
        // Chạy game
        initGame();
    } else {
        alert("Mật khẩu chưa đúng rồi vợ ơi! ❤️");
    }
}

function initGame() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Bầu trời Anime
    scene.fog = new THREE.Fog(0x87ceeb, 1, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ánh sáng
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Mặt đất rêu phong
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500),
        new THREE.MeshStandardMaterial({color: 0x1a3c15})
    );
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // Tạo rừng cây dày
    for(let i=0; i<100; i++) {
        createTree(Math.random()*160-80, Math.random()*160-80);
    }

    createSwords();
    
    // Phát nhạc rừng
    const bg = document.getElementById('snd-forest');
    bg.volume = 0.3;
    bg.play();
    
    spawnTitan();
    animate();
}

function createTree(x, z) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 15), new THREE.MeshStandardMaterial({color: 0x3d2b1f}));
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(4, 10, 8), new THREE.MeshStandardMaterial({color: 0x0a4d1c}));
    leaves.position.y = 8;
    tree.add(trunk, leaves);
    tree.position.set(x, 7.5, z);
    scene.add(tree);
}

function createSwords() {
    const mat = new THREE.MeshStandardMaterial({color: 0xcccccc, metalness: 0.9, roughness: 0.1});
    swordLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2), mat);
    swordRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2), mat);
    camera.add(swordLeft, swordRight);
    swordLeft.position.set(-0.7, -0.5, -1.2);
    swordRight.position.set(0.7, -0.5, -1.2);
    scene.add(camera);
}

function spawnTitan() {
    if(titan) scene.remove(titan);
    titan = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({color: 0xffdbac});
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 5), bodyMat);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 1.2), bodyMat);
    head.position.y = 3.2;
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.4), new THREE.MeshBasicMaterial({color: 0xff0000}));
    heart.position.set(0, 1.5, 0.6);
    heart.name = "TIM";
    titan.add(body, head, heart);
    titan.position.set(Math.random()*40-20, 2.5, camera.position.z - 35);
    scene.add(titan);
}

// Âm thanh tổng hợp (Synth) cho bộ cơ động
function playActionSound(freq, dur) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(g); g.connect(audioCtx.destination);
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function startSwing() {
    if(isGameOver) return;
    playActionSound(800, 0.2); // Tiếng "Xoẹt"
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    targetPos.copy(camera.position).addScaledVector(dir, 30);
    isSwinging = true;
}

function boost() {
    if(!boostReady || isGameOver) return;
    playActionSound(200, 0.4); // Tiếng Gas
    camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), 10);
