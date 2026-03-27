let scene, camera, renderer, player, monster, sword;
let step = 0;
const names = ["Phát", "Tuấn Khang DOG", "Khang Nguyễn", "Quốc", "DOG QTHINH", "LOL NKHANG", "SV QTHINH", "LOL QUỐC", "CHÓ THỊNH", "THỊNH LoL"];

function checkLogin() {
    if(document.getElementById('username').value === "emcoyeubminhhong" && 
       document.getElementById('password').value === "emyeubminhlam") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        init3D();
    }
}

function init3D() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ánh sáng leo lét vách núi
    const light = new THREE.PointLight(0xffffff, 2, 50);
    light.position.set(0, 5, 5);
    scene.add(light);

    createMonster();
    createSword();

    camera.position.z = 5;
    animate();
}

function createSword() {
    const group = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.05), new THREE.MeshStandardMaterial({color: 0xaaaaaa}));
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), new THREE.MeshStandardMaterial({color: 0x442200}));
    handle.position.y = -1;
    group.add(blade, handle);
    group.position.set(1.5, -1, -2); // Đặt ở tay phải góc nhìn FPS
    group.rotation.x = Math.PI/4;
    scene.add(group);
    sword = group;
}

function createMonster() {
    if(monster) scene.remove(monster);
    
    const group = new THREE.Group();
    // Bụng bự chảy sệ (Dùng khối cầu méo)
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 16), new THREE.MeshStandardMaterial({color: 0x554433}));
    belly.scale.y = 1.3; belly.position.y = -0.5;
    
    // Đầu biến dạng
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8), new THREE.MeshStandardMaterial({color: 0x332211}));
    head.position.y = 1.2;

    // Tim (Điểm yếu)
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshBasicMaterial({color: 0xff0000}));
    heart.position.set(0, 0.5, 1);
    heart.name = "HEART";

    group.add(belly, head, heart);
    group.position.z = -5;
    scene.add(group);
    monster = group;
    document.getElementById('m-name').innerText = names[step];
}

// Xử lý chém
window.onclick = (e) => {
    // Hiệu ứng chém kiếm
    sword.rotation.z -= 0.5;
    setTimeout(() => sword.rotation.z += 0.5, 100);

    // Kiểm tra trúng tim (Raycaster)
    const mouse = new THREE.Vector2(0, 0); // Giữa màn hình
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(monster.children);

    if(intersects.length > 0 && intersects[0].object.name === "HEART") {
        nextMonster();
    } else {
        // Hồi máu Titan (bốc khói - đơn giản hóa bằng đổi màu)
        monster.children[0].material.color.set(0xff0000);
        setTimeout(() => monster.children[0].material.color.set(0x554433), 500);
    }
}

function nextMonster() {
    step++;
    if(step < 10) {
        document.getElementById('frags').innerText = step;
        createMonster();
    } else {
        showTable();
    }
}

function showTable() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('table-view').classList.remove('hidden');
    const bag = document.getElementById('bag-contents');
    for(let i=0; i<10; i++) {
        const p = document.createElement('div');
        p.className = "piece"; p.innerText = "🧩";
        p.onclick = () => {
            p.style.visibility = "hidden";
            checkWin();
        };
        bag.appendChild(p);
    }
}

let placed = 0;
function checkWin() {
    placed++;
    if(placed === 10) {
        document.getElementById('table-view').classList.add('hidden');
        document.getElementById('letter-fade').classList.remove('hidden');
    }
}

function animate() {
    requestAnimationFrame(animate);
    if(monster) monster.rotation.y += 0.01;
    renderer.render(scene, camera);
}
