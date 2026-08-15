import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const COR_INATIVO = 0xb5766a;
const COR_ATIVO = 0x2b7fff;

// Malha anatomica real (Z-Anatomy / BodyParts3D, CC BY-SA 4.0), ja recortada e
// simplificada so para os 20 agrupamentos musculares do gerador. Carregada uma
// unica vez e reaproveitada entre todos os bonecos da pagina.
let promessaModelo = null;
function carregarModelo() {
  if (!promessaModelo) promessaModelo = fetch('/modelo-anatomico.json').then((r) => r.json());
  return promessaModelo;
}

function construirMesh(grupo, cor) {
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute('position', new THREE.Float32BufferAttribute(grupo.posicoes, 3));
  geometria.setAttribute('normal', new THREE.Float32BufferAttribute(grupo.normais, 3));
  geometria.setIndex(grupo.indices);

  const material = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.55, metalness: 0 });
  return new THREE.Mesh(geometria, material);
}

export function criarBoneco(container, slugsAtivos) {
  const largura = container.clientWidth || 320;
  const altura = 360;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, largura / altura, 0.1, 10);
  camera.position.set(0.75, 1.0, 2.1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(largura, altura);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5568, 0.6));

  const luzChave = new THREE.DirectionalLight(0xfff2e0, 1.15);
  luzChave.position.set(1.2, 2.2, 1.6);
  luzChave.castShadow = true;
  luzChave.shadow.mapSize.set(1024, 1024);
  luzChave.shadow.camera.near = 0.5;
  luzChave.shadow.camera.far = 5;
  luzChave.shadow.camera.left = -0.6;
  luzChave.shadow.camera.right = 0.6;
  luzChave.shadow.camera.top = 1.6;
  luzChave.shadow.camera.bottom = -0.6;
  luzChave.shadow.radius = 3;
  scene.add(luzChave);

  const luzPreenchimento = new THREE.DirectionalLight(0xdce8ff, 0.45);
  luzPreenchimento.position.set(-1.5, 0.8, 1);
  scene.add(luzPreenchimento);

  const luzContorno = new THREE.DirectionalLight(0xffffff, 0.5);
  luzContorno.position.set(-0.5, 1.2, -2);
  scene.add(luzContorno);

  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 32),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = 0.03;
  chao.receiveShadow = true;
  scene.add(chao);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.82, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 3.2;
  controls.minPolarAngle = Math.PI * 0.15;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.2;
  controls.update();

  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });

  let ativo = true;

  carregarModelo().then((modelo) => {
    if (!ativo) return;
    for (const [slug, grupo] of Object.entries(modelo)) {
      const ativoNaSessao = slugsAtivos.includes(slug);
      const mesh = construirMesh(grupo, ativoNaSessao ? COR_ATIVO : COR_INATIVO);
      if (ativoNaSessao) {
        mesh.material.emissive = new THREE.Color(COR_ATIVO);
        mesh.material.emissiveIntensity = 0.25;
      }
      mesh.castShadow = true;
      scene.add(mesh);
    }
  });

  function animar() {
    if (!ativo) return;
    requestAnimationFrame(animar);
    controls.update();
    renderer.render(scene, camera);
  }
  animar();

  return {
    destruir() {
      ativo = false;
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

window.criarBoneco = criarBoneco;
