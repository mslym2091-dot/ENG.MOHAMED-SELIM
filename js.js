import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// ========================================
// 1. إعداد المشهد ثلاثي الأبعاد
// ========================================

const background = document.getElementById('three-background');

let scene, camera, renderer;
let nucleus, electrons = [];
let animationId;
let pointerX = 0;
let pointerY = 0;

function init3D() {
  if (!background) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#050816');

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 13;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  background.appendChild(renderer.domElement);

  // إضاءة المشهد
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));

  const blueLight = new THREE.PointLight(0x00d9ff, 30);
  blueLight.position.set(4, 3, 5);
  scene.add(blueLight);

  const purpleLight = new THREE.PointLight(0x9333ff, 25);
  purpleLight.position.set(-4, -2, 3);
  scene.add(purpleLight);

  // نواة الذرة
  const nucleusGeometry = new THREE.IcosahedronGeometry(1.1, 2);

  const nucleusMaterial = new THREE.MeshStandardMaterial({
    color: 0x168cff,
    emissive: 0x083dff,
    emissiveIntensity: 2.5,
    metalness: 0.4,
    roughness: 0.2,
    flatShading: true
  });

  nucleus = new THREE.Mesh(
    nucleusGeometry,
    nucleusMaterial
  );

  scene.add(nucleus);

  // غلاف مضيء حول النواة
  const glowGeometry = new THREE.SphereGeometry(1.35, 32, 32);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00d9ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide
  });

  nucleus.add(
    new THREE.Mesh(glowGeometry, glowMaterial)
  );

  // مدارات الإلكترونات
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const orbitSettings = [
    { x: 1.1, y: 0.3, z: 0.1, color: 0x00e5ff },
    { x: -0.7, y: 1.0, z: 0.8, color: 0xb45cff },
    { x: 0.4, y: -1.1, z: -0.5, color: 0x458bff }
  ];

  orbitSettings.forEach((settings, index) => {
    const orbit = new THREE.Group();

    orbit.rotation.set(
      settings.x,
      settings.y,
      settings.z
    );

    const curve = new THREE.EllipseCurve(
      0, 0,
      3.1, 1.65,
      0, Math.PI * 2,
      false,
      0
    );

    const points = curve.getPoints(180);

    const orbitGeometry = new THREE.BufferGeometry()
      .setFromPoints(points);

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: settings.color,
      transparent: true,
      opacity: 0.65
    });

    const orbitLine = new THREE.Line(
      orbitGeometry,
      orbitMaterial
    );

    orbit.add(orbitLine);
    orbitGroup.add(orbit);

    // الإلكترون
    const electronGeometry = new THREE.SphereGeometry(
      0.12, 16, 16
    );

    const electronMaterial = new THREE.MeshBasicMaterial({
      color: settings.color
    });

    const electron = new THREE.Mesh(
      electronGeometry,
      electronMaterial
    );

    const electronGlow = new THREE.PointLight(
      settings.color, 2, 2
    );

    electron.add(electronGlow);
    orbit.add(electron);

    electrons.push({
      mesh: electron,
      orbit,
      phase: index * 2.1,
      speed: 0.65 + index * 0.2
    });
  });

  // نجوم وجسيمات فضائية
  const starCount = 1600;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] =
      (Math.random() - 0.5) * 100;

    starPositions[i * 3 + 1] =
      (Math.random() - 0.5) * 70;

    starPositions[i * 3 + 2] =
      (Math.random() - 0.5) * 70;
  }

  const starGeometry = new THREE.BufferGeometry();

  starGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(starPositions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0x9bdfff,
    size: 0.07,
    transparent: true,
    opacity: 0.8
  });

  const stars = new THREE.Points(
    starGeometry,
    starMaterial
  );

  scene.add(stars);

  // جسيمات بنفسجية إضافية
  const dustPositions = new Float32Array(240 * 3);

  for (let i = 0; i < 240; i++) {
    dustPositions[i * 3] =
      (Math.random() - 0.5) * 30;

    dustPositions[i * 3 + 1] =
      (Math.random() - 0.5) * 20;

    dustPositions[i * 3 + 2] =
      (Math.random() - 0.5) * 12;
  }

  const dustGeometry = new THREE.BufferGeometry();

  dustGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(dustPositions, 3)
  );

  const dustMaterial = new THREE.PointsMaterial({
    color: 0xc084fc,
    size: 0.035,
    transparent: true,
    opacity: 0.65
  });

  const dust = new THREE.Points(
    dustGeometry,
    dustMaterial
  );

  scene.add(dust);

  // الحركة المستمرة
  const clock = new THREE.Clock();

  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    nucleus.rotation.x = time * 0.12;
    nucleus.rotation.y = time * 0.2;

    orbitGroup.rotation.y = time * 0.04;
    stars.rotation.y = time * 0.002;
    dust.rotation.z = time * 0.008;

    electrons.forEach((item) => {
      const angle = time * item.speed + item.phase;

      item.mesh.position.set(
        Math.cos(angle) * 3.1,
        Math.sin(angle) * 1.65,
        0
      );
    });

    // استجابة هادئة لحركة الماوس
    camera.position.x +=
      (pointerX * 0.8 - camera.position.x) * 0.025;

    camera.position.y +=
      (-pointerY * 0.8 - camera.position.y) * 0.025;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
}

// ========================================
// 2. تغيير حجم المشهد
// ========================================

window.addEventListener('resize', () => {
  if (!camera || !renderer) return;

  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// ========================================
// 3. تحريك المشهد بالماوس
// ========================================

window.addEventListener('pointermove', (event) => {
  pointerX =
    (event.clientX / window.innerWidth - 0.5) * 2;

  pointerY =
    (event.clientY / window.innerHeight - 0.5) * 2;
});

// ========================================
// 4. إدارة المحاضرات
// ========================================

const form = document.getElementById('lectureForm');
const titleInput = document.getElementById('lectureTitle');
const chapterInput = document.getElementById('lectureChapter');
const linkInput = document.getElementById('youtubeLink');
const lectureList = document.getElementById('lecture-list');
const searchInput = document.getElementById('searchLecture');
const formMessage = document.getElementById('formMessage');

const STORAGE_KEY = 'nexus_physics_lectures_v1';

let lectures = [];

try {
  const savedLectures = localStorage.getItem(STORAGE_KEY);
  const parsed = savedLectures
    ? JSON.parse(savedLectures)
    : [];

  if (Array.isArray(parsed)) {
    lectures = parsed.filter((item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.chapter === 'string' &&
      typeof item.url === 'string' &&
      getYouTubeId(item.url)
    );
  }
} catch (error) {
  console.warn('تعذر تحميل المحاضرات المحفوظة.', error);
}

// التحقق من رابط يوتيوب
function getYouTubeId(value) {
  try {
    const url = new URL(value);

    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1).split('/')[0] || null;
    }

    if (
      url.hostname === 'www.youtube.com' ||
      url.hostname === 'youtube.com' ||
      url.hostname === 'm.youtube.com'
    ) {
      if (url.pathname === '/watch') {
        return url.searchParams.get('v');
      }

      const match = url.pathname.match(
        /^\/(?:embed|shorts)\/([a-zA-Z0-9_-]+)/
      );

      return match ? match[1] : null;
    }

    return null;
  } catch {
    return null;
  }
}

// حفظ المحاضرات على نفس المتصفح
function saveLectures() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(lectures)
    );

    return true;
  } catch (error) {
    console.error('تعذر حفظ المحاضرات.', error);
    return false;
  }
}

// عرض المحاضرات
function renderLectures(query = '') {
  if (!lectureList) return;

  lectureList.replaceChildren();

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = lectures.filter((lecture) =>
    `${lecture.title} ${lecture.chapter}`
      .toLowerCase()
      .includes(normalizedQuery)
  );

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';

    const icon = document.createElement('span');
    icon.textContent = '⚛️';

    const heading = document.createElement('h3');
    heading.textContent = normalizedQuery
      ? 'مش لاقيين المحاضرة دي'
      : 'لسه مفيش محاضرات';

    const description = document.createElement('p');
    description.textContent = normalizedQuery
      ? 'جرّب كلمة بحث مختلفة.'
      : 'أضف أول محاضرة من لوحة إدارة المحاضرات.';

    empty.append(icon, heading, description);
    lectureList.appendChild(empty);

    return;
  }

  filtered.forEach((lecture) => {
    const card = document.createElement('article');
    card.className = 'lecture-card';

    const icon = document.createElement('div');
    icon.className = 'lecture-icon';
    icon.textContent = '⚛';

    const heading = document.createElement('h3');
    heading.textContent = lecture.title;

    const chapter = document.createElement('p');
    chapter.textContent = lecture.chapter;

    const watchButton = document.createElement('a');
    watchButton.className = 'btn primary';
    watchButton.textContent = '▶ مشاهدة المحاضرة';
    watchButton.href = lecture.url;
    watchButton.target = '_blank';
    watchButton.rel = 'noopener noreferrer';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-lecture';
    deleteButton.type = 'button';
    deleteButton.textContent = 'حذف المحاضرة';

    deleteButton.addEventListener('click', () => {
      const confirmed = window.confirm(
        'متأكد إنك عايز تحذف المحاضرة من المتصفح ده؟'
      );

      if (!confirmed) return;

      const previous = lectures;

      lectures = lectures.filter(
        (item) => item.id !== lecture.id
      );

      if (!saveLectures()) {
        lectures = previous;
        formMessage.textContent =
          'تعذر الحفظ. لم يتم تأكيد الحذف.';
        return;
      }

      renderLectures(searchInput?.value || '');

      if (formMessage) {
        formMessage.textContent = 'تم حذف المحاضرة.';
      }
    });

    card.append(
      icon,
      heading,
      chapter,
      watchButton,
      deleteButton
    );

    lectureList.appendChild(card);
  });
}

// إضافة محاضرة
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const chapter = chapterInput.value.trim();
    const url = linkInput.value.trim();

    if (!title || !chapter || !getYouTubeId(url)) {
      formMessage.textContent =
        'اكتب اسم المحاضرة والباب ورابط يوتيوب صحيح.';
      return;
    }

    const lecture = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
      title,
      chapter,
      url
    };

    lectures.unshift(lecture);

    if (!saveLectures()) {
      lectures.shift();

      formMessage.textContent =
        'تعذر حفظ المحاضرة في المتصفح.';
      return;
    }

    form.reset();
    searchInput.value = '';

    renderLectures();

    formMessage.textContent =
      'تمت إضافة المحاضرة وحفظها على هذا المتصفح.';

    document.getElementById('lectures')
      ?.scrollIntoView({ behavior: 'smooth' });
  });
}

// البحث
if (searchInput) {
  searchInput.addEventListener('input', () => {
    renderLectures(searchInput.value);
  });
}

// ========================================
// 5. بدء تشغيل الموقع
// ========================================

renderLectures();

try {
  init3D();
} catch (error) {
  console.error('تعذر تشغيل الخلفية ثلاثية الأبعاد:', error);
}