let universoAtual = 'home';

// ==========================================
// FUNÇÃO: VIAJAR PARA UM UNIVERSO (ADMIN OU PÚBLICO)
// ==========================================
function viajarPara(destino) {
    if (universoAtual !== 'home') return;
    universoAtual = destino;

    if (destino === 'admin') {
        // Câmera dá zoom e entra no universo da Esquerda (Admin)
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
        // Câmera dá zoom e entra no universo da Direita (Público/Catálogo)
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

// ==========================================
// FUNÇÃO: VOLTAR AO INÍCIO (O SEU BOTÃO SAIR CORRIGIDO!)
// ==========================================
function voltarAoInicio() {
    if (universoAtual === 'home') return;

    if (universoAtual === 'admin') {
        // Traz a home de volta e joga o admin para a esquerda
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-admin", { scale: 0.5, x: "-100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    } 
    else if (universoAtual === 'publico') {
        // Traz a home de volta e joga o painel público para a direita
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-publico", { scale: 0.5, x: "100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    }
    
    // Reseta o estado do universo atual de volta para a Home
    universoAtual = 'home';
}

// ==========================================
// FUNÇÃO: SELEÇÃO DE ABAS INTERNAS DO DASHBOARD
// ==========================================
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

// ==========================================
// FUNÇÃO: EXPANDIR / DESTACAR CARD DE PRODUTO
// ==========================================
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