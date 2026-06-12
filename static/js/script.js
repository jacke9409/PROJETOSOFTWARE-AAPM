const wrapper = document.getElementById('panoramaWrapper');
const background = document.querySelector('.panorama-background');

let isDragging = false;
let startX = 0;
let currentTranslate = -100; // Começa em -100vw (Centro)
let targetTranslate = -100;

// Mapeamento de posições das telas
const posicoes = {
    'login': 0,        // Tela da Esquerda (0vw)
    'centro': -100,    // Tela do Meio (-100vw)
    'visualizacao': -200 // Tela da Direita (-200vw)
};

// Função acionada pelos links da Navbar
function moverPara(local) {
    if (posicoes[local] !== undefined) {
        currentTranslate = posicoes[local];
        background.style.transform = `translateX(${currentTranslate}vw)`;
    }
}

// Eventos de Arrastar com o Mouse (Drag)
wrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const diffX = e.clientX - startX;
    
    // Se arrastar bastante para a direita, vai para a esquerda (Login)
    if (diffX > 150 && currentTranslate < 0) {
        currentTranslate += 100;
        background.style.transform = `translateX(${currentTranslate}vw)`;
        isDragging = false;
    } 
    // Se arrastar bastante para a esquerda, vai para a direita (Visualização)
    else if (diffX < -150 && currentTranslate > -200) {
        currentTranslate -= 100;
        background.style.transform = `translateX(${currentTranslate}vw)`;
        isDragging = false;
    }
});