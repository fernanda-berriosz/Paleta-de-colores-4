const paletteContainer = document.getElementById('palette-container');
const generateBtn = document.getElementById('generate-btn');
const appContainer = document.querySelector('.app-container');
const harmonySelect = document.getElementById('harmony-select');
const countButtons = document.querySelectorAll('.count-btn');

let colorsCount = 4; 
// NUEVO: Aquí guardaremos el estado de la paleta actual (color y si está bloqueado)
let currentPalette = []; 

// Función auxiliar para convertir HSL a HEX
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Genera o actualiza la paleta respetando los candados
function generatePalette() {
    const harmony = harmonySelect.value;
    const baseHue = Math.floor(Math.random() * 360);
    const saturation = 85; 
    const lightness = 60;

    const nextPalette = [];

    for (let i = 0; i < colorsCount; i++) {
        // NUEVO: Si ya existía un color en esta posición y está BLOQUEADO, lo conservamos
        if (currentPalette[i] && currentPalette[i].isLocked) {
            nextPalette.push(currentPalette[i]);
            continue; // Saltamos a la siguiente vuelta del ciclo
        }

        // Si no está bloqueado, calculamos un nuevo color matemáticamente
        let currentHue = baseHue;
        let currentLightness = lightness;

        if (harmony === 'analogous') {
            currentHue = (baseHue + (i * 30)) % 360;
        } 
        else if (harmony === 'complementary') {
            const half = Math.ceil(colorsCount / 2);
            if (i >= half) {
                currentHue = (baseHue + 180) % 360;
            }
            currentLightness = i % 2 === 0 ? lightness : lightness - 15;
        } 
        else if (harmony === 'monochromatic') {
            currentLightness = 30 + (i * (60 / colorsCount)); 
        }
        else if (harmony === 'random') {
            currentHue = Math.floor(Math.random() * 360);
        }

        const hexColor = hslToHex(currentHue, saturation, currentLightness);
        
        // Guardamos el color como un objeto con su estado de candado inicializado en falso
        nextPalette.push({
            hex: hexColor,
            isLocked: false
        });
    }

    // Actualizamos nuestra paleta global y la dibujamos
    currentPalette = nextPalette;
    renderPalette();
}

// Función encargada exclusivamente de dibujar los elementos en el HTML
function renderPalette() {
    paletteContainer.innerHTML = ''; // Limpiamos la pantalla

    currentPalette.forEach((colorObj, index) => {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');

        // Estructura interna: Ahora incluye el botón del candado interactivo
        swatch.innerHTML = `
            <button class="lock-btn ${colorObj.isLocked ? 'locked' : ''}">
                ${colorObj.isLocked ? '🔒' : '🔓'}
            </button>
            <div class="color-box" style="background-color: ${colorObj.hex}"></div>
            <span class="color-label">${colorObj.hex}</span>
        `;

        // EVENTO 1: Al hacer clic en el candado, cambiamos su estado
        const lockBtn = swatch.querySelector('.lock-btn');
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que al hacer clic en el candado también se copie el color
            colorObj.isLocked = !colorObj.isLocked; // Volteamos el estado (true <-> false)
            renderPalette(); // Redibujamos para actualizar el icono y los estilos
        });

        // EVENTO 2: Al hacer clic en cualquier otra parte de la tarjeta, se copia el color
        swatch.addEventListener('click', () => copyToClipboard(colorObj.hex, swatch));

        paletteContainer.appendChild(swatch);
    });

    // Ajustamos el fondo dinámico con el primer y último color de la paleta actual
    if (currentPalette.length > 0) {
        appContainer.style.background = `linear-gradient(135deg, ${currentPalette[0].hex} 0%, ${currentPalette[currentPalette.length - 1].hex} 100%)`;
    }
}

// Función de copiado (Se mantiene igual)
function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const label = element.querySelector('.color-label');
        const originalText = label.innerText;
        label.innerText = '¡Copiado!';
        label.style.color = '#00b074';
        
        setTimeout(() => {
            label.innerText = originalText;
            label.style.color = '';
        }, 1000);
    });
}

// Lógica de botones de cantidad (Se adapta para limpiar candados si reduce el tamaño)
countButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        countButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        colorsCount = parseInt(e.target.getAttribute('data-count'));
        // Si el usuario reduce la cantidad, acortamos la paleta actual para limpiar estados viejos
        currentPalette = currentPalette.slice(0, colorsCount); 
        
        generatePalette();
    });
});

// EVENTOS GENERALES
generateBtn.addEventListener('click', generatePalette);
harmonySelect.addEventListener('change', generatePalette);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        generatePalette();
    }
});

// Inicialización
document.querySelector('[data-count="4"]').classList.add('active');
generatePalette();