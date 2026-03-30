// Three.js 3D Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0); // Transparent background

// Wait for the container to be ready
function init3D() {
    const container = document.getElementById('threejs-canvas');
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        setTimeout(init3D, 100);
    }
}
init3D();

// Lighting - High intensity for visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

let model;
const loader = new THREE.GLTFLoader();

// Load your custom 3D model
const modelUrl = 'yoga.glb'; 
// Note: If you renamed your model file, make sure the name above matches exactly.

loader.load(
    modelUrl,
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // --- 1. NORMALIZATION: Force model to standard size ---
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim; // We force it to be 5 units large
        model.scale.set(scale, scale, scale);

        // --- 2. CENTERING: Move model origin to its center ---
        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;

        // --- 3. CAMERA: Fixed distance for consistent visuals ---
        camera.position.z = 10;
        
        console.log('Model normalized and centered!');
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
    }
);

camera.position.z = 8; 

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    // Subtle rotation limits (approx 30 degrees)
    targetX = mouseY * 0.5; 
    targetY = mouseX * 0.5;
});

// Animation Loop
const animate = () => {
    requestAnimationFrame(animate);
    
    if (model) {
        model.rotation.x += (targetX - model.rotation.x) * 0.05;
        model.rotation.y += (targetY - model.rotation.y) * 0.05;
    }
    
    renderer.render(scene, camera);
};
animate();

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Original Landing Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // Cursor Glow Implementation
    const cursorGlow = document.querySelector('.cursor-glow');
    
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;
            const targetContent = document.querySelector(targetId);
            
            if (targetContent) {
                targetContent.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Refined Book Interaction Logic
function setupBook() {
    const pages = document.querySelectorAll('.page');
    let currentPage = 1;

    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            // Don't flip if clicking a link
            if (e.target.tagName === 'A' || e.target.closest('a')) return;

            // Check if clicking the right half (to flip forward)
            const rect = page.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const isRightSide = clickX > rect.width / 2;

            if (isRightSide && index + 1 === currentPage) {
                // Flip forward
                page.classList.add('flipped');
                setTimeout(() => {
                    page.style.zIndex = index + 1;
                }, 500); // Change zIndex mid-flip
                currentPage++;
            } else if (!isRightSide && index + 1 === currentPage - 1) {
                // Flip backward
                page.classList.remove('flipped');
                setTimeout(() => {
                    page.style.zIndex = pages.length - index + 1;
                }, 500);
                currentPage--;
            }
        });
    });
}

setupBook();
