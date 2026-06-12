let universoAtual = 'home';

// ==========================================
// FUNÇÃO: VIAJAR PARA UM UNIVERSO (ADMIN OU PÚBLICO)
// ==========================================
function viajarPara(destino) {
    if (universoAtual !== 'home') return;
    universoAtual = destino;

    if (destino === 'admin') {
        document.getElementById("universo-admin").style.display = "flex";

        // Câmera dá zoom e entra no universo da Esquerda (Admin / Formulário)
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
        // Câmera dá zoom e entra no universo da Direita (Público/Dashboard/Catálogo)
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

    // Garante que o bloco de login fique visível novamente ao deslogar
    document.getElementById("universo-admin").style.display = "flex";

    if (universoAtual === 'admin') {
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-admin", { scale: 0.5, x: "-100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    } 
    else if (universoAtual === 'publico') {
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-publico", { scale: 0.5, x: "100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    }
    
    universoAtual = 'home';
}

// ==========================================
// FUNÇÃO: EXPANDIR / DESTACAR CARD DE PRODUTO
// ==========================================
function destacarProduto(elemento) {
    if (elemento.classList.contains('expandido')) {
        gsap.to(elemento, { scale: 1, zIndex: 1, duration: 0.4, ease: "back.out(1.7)" });
        elemento.classList.remove('expandido');
    } else {
        gsap.to(elemento, { scale: 1.2, zIndex: 100, duration: 0.4, ease: "back.out(1.7)" });
        elemento.classList.add('expandido');
    }
}

// ==========================================
// INTERCEPTADOR DE LOGIN - REDIRECIONAMENTO DE VERDADE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const formularioLogin = document.querySelector("#universo-admin form");

    if (formularioLogin) {
        formularioLogin.addEventListener("submit", async function(event) {
            event.preventDefault(); // Impede o recarregamento padrão do formulário

            // Captura os inputs do formulário (username e password)
            const dadosFormulario = new FormData(this);

            try {
                // Envia exatamente para a rota configurada no seu main.py
                const resposta = await fetch("/auth/login", {
                    method: "POST",
                    body: dadosFormulario
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    console.log("Sucesso! Bem-vindo,", dados.nome);

                    // 🟢 REDIRECIONAMENTO REAL: Redireciona o navegador para a página administrativa restrita
                    window.location.href = "/dashboard";

                } else {
                    // Trata o erro 401 do FastAPI
                    alert("⚠️ E-mail ou senha incorretos! Por favor, utilize os acessos gerados no seed.");
                }
            } catch (erro) {
                console.error("Erro crítico na requisição:", erro);
                alert("⚠️ Não foi possível conectar ao servidor do sistema. Verifique se o Uvicorn está rodando.");
            }
        });
    }
});