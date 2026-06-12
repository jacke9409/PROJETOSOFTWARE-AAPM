const universoScroll = document.getElementById('universoScroll');

// Guardamos os índices dos painéis: 0 = Login, 1 = Centro, 2 = Público
let painelAtual = 1; 
const totalPaineis = 3;
let emTransicao = false;

// Função direta para mover via cliques nas setas indicadores
function moverParaPainel(indice) {
    if (indice < 0 || indice >= totalPaineis) return;
    painelAtual = indice;
    
    // Multiplica o índice por -100vh para deslocar a visualização verticalmente
    universoScroll.style.transform = `translateY(-${indice * 100}vh)`;
}

// Intercepta o scroll da roda do mouse (Wheel) para dar o efeito magnético 360°
window.addEventListener('wheel', (e) => {
    if (emTransicao) return;

    if (e.deltaY > 0) {
        // Scroll para Baixo
        if (painelAtual < totalPaineis - 1) {
            painelAtual++;
            executarMudanca();
        }
    } else if (e.deltaY < 0) {
        // Scroll para Cima
        if (painelAtual > 0) {
            painelAtual--;
            executarMudanca();
        }
    }
}, { passive: true });

function executarMudanca() {
    emTransicao = true;
    universoScroll.style.transform = `translateY(-${painelAtual * 100}vh)`;
    
    // Trava temporariamente para evitar saltos múltiplos bruscos de tela
    setTimeout(() => {
        emTransicao = false;
    }, 800); // Tempo batendo com o '0.8s' definido no CSS transition
}

// Suporte opcional para arrastar em telas de toque (Touch)
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    if (emTransicao) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffY) > 50) { // Sensibilidade mínima de movimento
        if (diffY > 0 && painelAtual < totalPaineis - 1) {
            painelAtual++;
            executarMudanca();
        } else if (diffY < 0 && painelAtual > 0) {
            painelAtual--;
            executarMudanca();
        }
    }
}, { passive: true });