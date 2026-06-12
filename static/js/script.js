let universoAtual = 'home';

function viajarPara(destino) {
    if (universoAtual !== 'home') return;
    universoAtual = destino;

    if (destino === 'admin') {
        // Câmera dá zoom e entra no universo da Esquerda
        gsap.to("#universo-home", { 
            scale: 2, 
            x: "100vw", 
            opacity: 0, 
            duration: 1.2, 
            ease: "power2.inOut" 
        });
        gsap.to("#universo-admin", { 
            scale: 1, 
            x: "0vw", 
            opacity: 1, 
            duration: 1.2, 
            ease: "power2.inOut" 
        });
    } 
    else if (destino === 'publico') {
        // Câmera dá zoom e entra no universo da Direita
        gsap.to("#universo-home", { 
            scale: 2, 
            x: "-100vw", 
            opacity: 0, 
            duration: 1.2, 
            ease: "power2.inOut" 
        });
        gsap.to("#universo-publico", { 
            scale: 1, 
            x: "0vw", 
            opacity: 1, 
            duration: 1.2, 
            ease: "power2.inOut" 
        });
    }
}

function voltarAoInicio() {
    if (universoAtual === 'home') return;

    if (universoAtual === 'admin') {
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1, ease: "power2.out" });
        gsap.to("#universo-admin", { scale: 0.5, x: "-100vw", opacity: 0, duration: 1, ease: "power2.out" });
    } 
    else if (universoAtual === 'publico') {
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1, ease: "power2.out" });
        gsap.to("#universo-publico", { scale: 0.5, x: "100vw", opacity: 0, duration: 1, ease: "power2.out" });
    }
    
    universoAtual = 'home';
}

// Animação interativa: Quando clica no produto, ele expande na tela
function destacarProduto(elemento) {
    // Se o card já estiver gigante, volta ao normal
    if (elemento.classList.contains('expandido')) {
        gsap.to(elemento, { scale: 1, zIndex: 1, duration: 0.4, ease: "back.out(1.7)" });
        elemento.classList.remove('expandido');
    } else {
        // Faz o card vir para frente e crescer
        gsap.to(elemento, { scale: 1.2, zIndex: 100, duration: 0.4, ease: "back.out(1.7)" });
        elemento.classList.add('expandido');
    }
}
// Inclua este bloco junto às suas funções do script.js existente

function trocarAbasDashboard(itemClicado, idAbaDestino) {
    // 1. Remover a classe "ativo" de todos os botões da barra lateral
    const itensMenu = document.querySelectorAll('.item-menu');
    itensMenu.forEach(item => item.classList.remove('ativo'));

    // 2. Adicionar a classe "ativo" no botão que recebeu o clique
    itemClicado.classList.add('ativo');

    // 3. Ocultar todos os painéis de conteúdo das abas
    const paineis = document.querySelectorAll('.aba-painel');
    paineis.forEach(painel => painel.classList.add('oculta-aba'));

    // 4. Mostrar apenas o painel correspondente à aba selecionada
    const abaAlvo = document.getElementById(idAbaDestino);
    if (abaAlvo) {
        abaAlvo.classList.remove('oculta-aba');
    }
}