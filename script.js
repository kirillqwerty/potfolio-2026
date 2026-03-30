

// ---------- Автоопределение темы ----------
const intro = document.getElementsByClassName("intro-container")[0];
const background = document.getElementsByClassName("background-wrap")[0]
const utilMenu = document.getElementsByClassName("util-menu")[0]
background.style.opacity = "0";
utilMenu.style.opacity = "0";
setTimeout(() => {
  intro.classList.add("intro-hide");
}, 4000)
setTimeout(()=> {
  background.classList.add("portfolio-reveal");
  utilMenu.classList.add("util-menu-reveal");
  startWebGL();
},3000)

const authorName = document.getElementById("author-name");
// authorName.textContent = translation["author"]["name"][language]

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.dataset["theme"] = "dark";
} else {
  document.documentElement.dataset["theme"] = "light";
}

// startWebGL();

function startWebGL() {
  const container = document.getElementById("particle-background");
  if (!container) {
    console.error("Container element not found!");
    return;
  }

  let theme = document.documentElement.dataset["theme"];
  console.log(theme);
  
  let animationSpeed = 0.1;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const uniforms = {
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_time: { value: 0.0 },
    u_color1: { value: new THREE.Color(0xefefef) },
    u_color2: { value: new THREE.Color(0x1f1f1f) },
    u_prev_color1: { value: new THREE.Color(0xefefef) },
    u_prev_color2: { value: new THREE.Color(0x1f1f1f) },
    u_transition_start: { value: 0.0 }
  };

  // ---------- Функция обновления темы WebGL ----------
  function updateWebGLTheme() {
    uniforms.u_prev_color1.value.copy(uniforms.u_color1.value);
    uniforms.u_prev_color2.value.copy(uniforms.u_color2.value);

    theme = document.documentElement.dataset["theme"];

    if (theme === "light") {
      uniforms.u_color1.value.set(0xefefef);
      uniforms.u_color2.value.set(0x1f1f1f);
    } else {
      uniforms.u_color1.value.set(0x1f1f1f);
      uniforms.u_color2.value.set(0xefefef);
    }

    uniforms.u_transition_start.value = uniforms.u_time.value;
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: getFragmentShader()
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(geometry, material);
  scene.add(quad);

  // ---------- Resize ----------
  function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    uniforms.u_resolution.value.set(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", onWindowResize, false);
  onWindowResize();

  // ---------- Здесь вызываем обновление темы при запуске ----------
  updateWebGLTheme();

  renderer.compile(scene, camera);

  // ---------- Animation loop ----------
  function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value += animationSpeed;
    renderer.render(scene, camera);
  }
  animate();

  // ---------- Shader ----------
  function getFragmentShader() {
    return `
      precision highp float;

      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_prev_color1;
      uniform vec3 u_prev_color2;
      uniform float u_transition_start;

      vec2 random2(vec2 st) {
        st = vec2(dot(st, vec2(127.1,311.7)),
                  dot(st, vec2(269.5,183.3)));
        return -1.0 + 2.0 * fract(sin(st)*43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        vec2 u = f*f*(3.0-2.0*f);

        float a = dot(random2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0));
        float b = dot(random2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0));
        float c = dot(random2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0));
        float d = dot(random2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0));

        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;

        vec2 pos = st * 1.5;
        float n = (noise(pos + u_time*0.02) +
                  noise(pos*1.3 + u_time*0.015) +
                  noise(pos*0.7 - u_time*0.01)) / 3.0;

        float transition_duration = 4.0;
        float t = (u_time - u_transition_start) / transition_duration;
        t = clamp(t, 0.0, 1.0);

        vec3 current_color1 = mix(u_prev_color1, u_color1, t);
        vec3 current_color2 = mix(u_prev_color2, u_color2, t);

        vec3 color = mix(current_color1, current_color2, n);

        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }

  // Делаем функцию доступной снаружи
  window.__updateWebGLTheme = updateWebGLTheme;
}


// ---------- Меню ----------
// const links = document.getElementsByClassName("portfolio-menu-item-link");

// for (let i = 0; i < links.length; i++) {
//   const element = links[i];
//   element.onmouseover = function () {
//     setBlur(links);
//     element.classList.remove("blur-link");
//   }
//   element.onmouseout = function () {
//     unsetBlur(links);
//   }
// }

// function setBlur(links) {
//   for (let i = 0; i < links.length; i++) {
//     links[i].classList.add("blur-link");
//   }
// }

// function unsetBlur(links) {
//   for (let i = 0; i < links.length; i++) {
//     links[i].classList.remove("blur-link");
//   }
// }


// ---------- Переключение темы ----------
function togglePrefferedTheme() {  
  const currentTheme = document.documentElement.dataset["theme"];
  document.documentElement.dataset["theme"] = currentTheme === "light" ? "dark" : "light";
  // Меняем palette WebGL
  window.__updateWebGLTheme();
}

const themeSwitcher = document.getElementById("checkbox-theme");
themeSwitcher.addEventListener("change", togglePrefferedTheme);

let currentLang = navigator.language === "ru-RU" ? "ru" : "eng";


function toggleRuLanguage() {
  currentLang = "ru";
  ruLangSwitcher.checked = true;
  engLangSwitcher.checked = false;
}

function toggleEngLanguage() { 
  currentLang = "eng";
  engLangSwitcher.checked = true;
  ruLangSwitcher.checked = false;
}

const ruLangSwitcher = document.getElementById("checkbox-ru-lang");
const engLangSwitcher = document.getElementById("checkbox-eng-lang");

ruLangSwitcher.addEventListener("change", toggleRuLanguage);
engLangSwitcher.addEventListener("change", toggleEngLanguage);

if (currentLang === "ru") {
  toggleRuLanguage();
} else toggleEngLanguage();
