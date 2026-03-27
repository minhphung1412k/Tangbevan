let scene, camera, renderer, titan, swordLeft, swordRight, cable, isSwinging = false;
let targetPos = new THREE.Vector3(), frags = 0, isGameOver = false, boostReady = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function checkLogin() {
    if(document.getElementById('password').value === "emyeubminhlam") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        initGame();
    }
}

function initGame() {
    scene = new THREE.Scene();
    // Bầu trời Anime sáng sủa
    scene.background = new THREE.Color(0x87ceeb); 
    scene.fog = new THREE.Fog(0x87ceeb, 1, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ánh sáng mặt trời (God Rays)
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(50, 100, 50);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    // Ngọn núi và mặt đất phủ rêu
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({color: 0x228b22}); // Xanh rêu
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // Tạo rừng cây dày đặc
    for(let i=0; i<150; i++) {
        createTree(Math.random()*200-100, Math.random()*200-100);
    }

    // Tạo đôi tay cầm song kiếm
    createSwords();
    
    camera.position.set(0, 3, 10);
    document.getElementById('snd-forest').play();
    
    spawnTitan();
    animate();
}

function createTree(x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 15), new THREE.MeshStandardMaterial({color: 0x4b2d12}));
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(4, 8, 8), new THREE.MeshStandardMaterial({color: 0x006400}));
    leaves.position.y = 10;
    const tree = new THREE.Group();
    tree.add(trunk, leaves);
    tree.position.set(x, 7.5, z);
    scene.add(tree);
}

function createSwords() {
    const swordGeo = new THREE.BoxGeometry(0.1, 0.1, 2);
    const swordMat = new THREE.MeshStandardMaterial({color: 0xaaaaaa, metalness: 0.8});
    swordLeft = new THREE.Mesh(swordGeo, swordMat);
    swordRight = new THREE.Mesh(swordGeo, swordMat);
    camera.add(swordLeft);
    camera.add(swordRight);
    swordLeft.position.set(-0.8, -0.5, -1.5);
    swordRight.position.set(0.8, -0.5, -1.5);
}

function spawnTitan() {
    if(titan) scene.remove(titan);
    titan = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({color: 0xedc9af}); // Màu da
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1, 6), bodyMat);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 1.5), bodyMat);
    head.position.y = 4;
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({color: 0xff0000}));
    heart.position.set(0, 2, 0.8);
    heart.name = "TIM";
    titan.add(body, head, heart);
    titan.position.set(Math.random()*40-20, 3, camera.position.z - 40);
    scene.add(titan);
}

// Logic điều khiển & Âm thanh nhân tạo
function playSynth(freq, type, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

window.addEventListener('keydown', (e) => {
    if(e.code === 'KeyE') startSwing();
    if(e.code === 'ShiftLeft') boost();
});
document.getElementById('btn-hook').onclick = startSwing;
document.getElementById('btn-boost').onclick = boost;

function startSwing() {
    if(isGameOver) return;
    playSynth(600, 'sawtooth', 0.2); // Tiếng đu dây nhân tạo
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    targetPos.copy(camera.position).addScaledVector(dir, 35);
    isSwinging = true;
}

function boost() {
    if(!boostReady || isGameOver) return;
    playSynth(150, 'sine', 0.5); // Tiếng Gas
    camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), 12);
    boostReady = false;
    document.getElementById('btn-boost').classList.add('dimmed');
    setTimeout(() => { boostReady = true; document.getElementById('btn-boost').classList.remove('dimmed'); }, 5000);
}

function animate() {
    if(isGameOver) return;
    requestAnimationFrame(animate);

    // AI Titan đuổi bắt
    const dist = camera.position.distanceTo(titan.position);
    if(dist < 20) {
        titan.lookAt(camera.position);
        titan.translateZ(0.1 + (frags * 0.05));
    }
    if(dist < 3.5) { // Bị Titan bóp nát
        isGameOver = true;
        document.getElementById('snd-blood').play();
        document.getElementById('blood-overlay').style.opacity = "1";
        document.getElementById('death-screen').classList.remove('hidden');
    }

    if(isSwinging) {
        camera.position.lerp(targetPos, 0.08);
        if(camera.position.distanceTo(targetPos) < 2) isSwinging = false;
    }

    // Nhịp thở của thanh kiếm
    swordLeft.position.y = -0.5 + Math.sin(Date.now()*0.005)*0.02;
    swordRight.position.y = -0.5 + Math.sin(Date.now()*0.005)*0.02;

    renderer.render(scene, camera);
}

window.onclick = () => {
    if(isGameOver) return;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0,0), camera);
    const hits = ray.intersectObjects(titan.children);
    
    if(hits.length > 0 && hits[0].object.name === "TIM") {
        document.getElementById('snd-slash').play();
        document.getElementById('snd-blood').play();
        killTitan();
    }
}

function killTitan() {
    // Hiệu ứng bốc hơi
    let steam = 0;
    const timer = setInterval(() => {
        titan.scale.multiplyScalar(0.9);
        titan.position.y += 0.5;
        steam++;
        if(steam > 20) {
            clearInterval(timer);
            frags++;
            document.getElementById('frags').innerText = frags;
            if(frags < 10) spawnTitan();
            else alert("MẢNH CHÌA KHÓA CUỐI CÙNG ĐÃ XUẤT HIỆN TRONG TIM!");
        }
    }, 100);
}
