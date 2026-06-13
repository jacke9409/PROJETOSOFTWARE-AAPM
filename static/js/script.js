/* ==========================================================================
   AAPM — SCRIPT PRINCIPAL & GERENCIAMENTO DE PRODUTOS, CATEGORIAS E FORNECEDORES
   ========================================================================== */

"use strict";

// Variáveis de Controle Global
let universoAtual = 'home';
let produtoDeletarId = null;
let produtoDeletarNome = null;

// Variáveis de controle para saber qual formulário está solicitando a imagem da galeria
let modoGaleriaAlvo = null; // 'adicionar' ou 'editar'
let imagemTemporariaSelecionada = null;

// Bancos de dados em memória populados pelo backend (FastAPI/Jinja2)
let PRODUTOS_DB = [];
let CATEGORIAS_DB = []; 
let FORNECEDORES_DB = []; // Variável global de fornecedores mapeada

// ─────────────────────────────────────────────────────────────────────────────
// PARTÍCULAS DE LOGIN (MÓDULO EMBUTIDO)
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG_PARTICULAS = {
    quantidade:    120,    
    velocidadeMin: 1.2,    
    velocidadeMax: 3.8,    
    opacidadeMin:  0.08,
    opacidadeMax:  0.55,
    tamanhoMin:    1,
    tamanhoMax:    2.5,
    cores: [
        'rgba(56,  189, 248, OP)',   // azul ciano
        'rgba(129, 140, 248, OP)',   // violeta
        'rgba(255, 255, 255, OP)',   // branco puro
        'rgba(96,  165, 250, OP)',   // azul médio
    ]
};

let canvas, ctx, particulas = [], rodandoParticulas = false, animFrame;

function criarCanvasParticulas() {
    const universoAdmin = document.getElementById('universo-admin');
    if (!universoAdmin) return false;

    const existente = document.getElementById('canvas-particulas');
    if (existente) existente.remove();

    canvas = document.createElement('canvas');
    canvas.id = 'canvas-particulas';
    canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    `;
    universoAdmin.insertBefore(canvas, universoAdmin.firstChild);
    ctx = canvas.getContext('2d');
    redimensionarCanvas();
    return true;
}

function redimensionarCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function criarParticula() {
    const op = (Math.random() * (CONFIG_PARTICULAS.opacidadeMax - CONFIG_PARTICULAS.opacidadeMin) + CONFIG_PARTICULAS.opacidadeMin).toFixed(2);
    const corBase = CONFIG_PARTICULAS.cores[Math.floor(Math.random() * CONFIG_PARTICULAS.cores.length)];
    return {
        x:           Math.random() * (canvas ? canvas.width : window.innerWidth),
        y:           Math.random() * -window.innerHeight, 
        velocidade:  Math.random() * (CONFIG_PARTICULAS.velocidadeMax - CONFIG_PARTICULAS.velocidadeMin) + CONFIG_PARTICULAS.velocidadeMin,
        tamanho:     Math.random() * (CONFIG_PARTICULAS.tamanhoMax - CONFIG_PARTICULAS.tamanhoMin) + CONFIG_PARTICULAS.tamanhoMin,
        cor:         corBase.replace('OP', op),
        comprimento: Math.random() * 18 + 8, 
        oscilacao:   Math.random() * 0.5 - 0.25, 
    };
}

function iniciarEstruturaParticulas() {
    particulas = [];
    for (let i = 0; i < CONFIG_PARTICULAS.quantidade; i++) {
        const p = criarParticula();
        p.y = Math.random() * (canvas ? canvas.height : window.innerHeight); 
        particulas.push(p);
    }
}

function desenharParticulas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particulas.forEach(p => {
        ctx.save();
        ctx.strokeStyle = p.cor;
        ctx.lineWidth   = p.tamanho;
        ctx.lineCap     = 'round';

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.oscilacao * 4, p.y + p.comprimento);
        ctx.stroke();
        ctx.restore();

        p.y += p.velocidade;
        p.x += p.oscilacao * 0.3;

        if (p.y > canvas.height + p.comprimento) {
            const nova = criarParticula();
            p.x           = nova.x;
            p.y           = -p.comprimento - Math.random() * 50;
            p.velocidade  = nova.velocidade;
            p.tamanho     = nova.tamanho;
            p.cor         = nova.cor;
            p.comprimento = nova.comprimento;
            p.oscilacao   = nova.oscilacao;
        }
    });
}

function loopParticulas() {
    if (!rodandoParticulas) return;
    desenharParticulas();
    animFrame = requestAnimationFrame(loopParticulas);
}

const particulasLogin = {
    iniciar: () => {
        if (!criarCanvasParticulas()) return;
        iniciarEstruturaParticulas();
        rodandoParticulas = true;
        loopParticulas();
    },
    parar: () => {
        rodandoParticulas = false;
        cancelAnimationFrame(animFrame);
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

window.addEventListener('resize', () => {
    if (rodandoParticulas) {
        redimensionarCanvas();
        iniciarEstruturaParticulas();
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// 1. INICIALIZAÇÃO DA APLICAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const dadosElemento = document.getElementById("dados-produtos-backend");
    if (dadosElemento && dadosElemento.dataset.produtos) {
        try {
            PRODUTOS_DB = JSON.parse(dadosElemento.dataset.produtos);
        } catch (e) {
            console.error("Erro ao processar dados de produtos do backend:", e);
        }
    }

    const dadosCatElemento = document.getElementById("dados-categorias-backend");
    if (dadosCatElemento && dadosCatElemento.dataset.categorias) {
        try {
            CATEGORIAS_DB = JSON.parse(dadosCatElemento.dataset.categorias);
            window.CATEGORIAS_DB = CATEGORIAS_DB; 
        } catch (e) {
            console.error("Erro ao processar dados de categorias do backend:", e);
        }
    }

    const dadosFornElemento = document.getElementById("dados-fornecedores-backend");
    if (dadosFornElemento && dadosFornElemento.dataset.fornecedores) {
        try {
            FORNECEDORES_DB = JSON.parse(dadosFornElemento.dataset.fornecedores);
            window.FORNECEDORES_DB = FORNECEDORES_DB;
        } catch (e) {
            console.error("Erro ao processar dados de fornecedores do backend:", e);
        }
    }

    const formularioLogin = document.querySelector("#universo-admin form");
    if (formularioLogin) {
        formularioLogin.addEventListener("submit", async function(event) {
            event.preventDefault();
            const dadosFormulario = new FormData(this);

            try {
                const resposta = await fetch("/auth/login", {
                    method: "POST",
                    body: dadosFormulario
                });

                if (resposta.ok) {
                    const dados = await resposta.json();
                    console.log("Sucesso! Bem-vindo,", dados.nome);
                    window.location.href = "/dashboard";
                } else {
                    alert("⚠️ E-mail ou senha incorretos! Por favor, utilize os acessos gerados no seed.");
                }
            } catch (erro) {
                console.error("Erro crítico na requisição:", erro);
                alert("⚠️ Não foi possível conectar ao servidor do sistema. Verifique se o Uvicorn está rodando.");
            }
        });
    }

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", e => {
            if (e.target === overlay) fecharModal(overlay.id);
        });
    });

    setTimeout(renderizarCards, 900);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. NAVEGAÇÃO ENTRE UNIVERSOS & ABAS (GSAP + PARTÍCULAS)
// ─────────────────────────────────────────────────────────────────────────────
function viajarPara(destino) {
    if (universoAtual !== 'home') return;
    universoAtual = destino;

    if (destino === 'admin') {
        const adminEnv = document.getElementById("universo-admin");
        if (adminEnv) adminEnv.style.display = "flex";

        if (document.getElementById("universo-home")) {
            gsap.to("#universo-home", { scale: 2, x: "100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
        }
        if (adminEnv) {
            gsap.to("#universo-admin", { 
                scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut",
                onComplete: () => {
                    particulasLogin.iniciar();
                }
            });
        }
    } 
    else if (destino === 'publico') {
        if (document.getElementById("universo-home")) {
            gsap.to("#universo-home", { scale: 2, x: "-100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
        }
        if (document.getElementById("universo-publico")) {
            gsap.to("#universo-publico", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        }
    }
}

function voltarAoInicio() {
    if (universoAtual === 'home') return;

    const adminEnv = document.getElementById("universo-admin");
    if (adminEnv) adminEnv.style.display = "flex";

    if (universoAtual === 'admin') {
        particulasLogin.parar();
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-admin", { scale: 0.5, x: "-100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    } 
    else if (universoAtual === 'publico') {
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-publico", { scale: 0.5, x: "100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    }
    
    universoAtual = 'home';
}

function trocarAbasDashboard(elemento, abaId) {
    document.querySelectorAll(".menu-item").forEach(btn => btn.classList.remove("ativo"));
    if (elemento) elemento.classList.add("ativo");

    document.querySelectorAll(".aba-painel").forEach(aba => {
        aba.style.display = "none";
        aba.classList.remove("ativa");
    });

    const abaAlvo = document.getElementById(abaId);
    if (abaAlvo) {
        abaAlvo.style.display = "block";
        abaAlvo.classList.add("ativa");
        gsap.fromTo(abaAlvo, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
}

function destacarProduto(elemento) {
    if (elemento.classList.contains('expandido')) {
        gsap.to(elemento, { scale: 1, zIndex: 1, duration: 0.4, ease: "back.out(1.7)" });
        elemento.classList.remove('expandido');
    } else {
        gsap.to(elemento, { scale: 1.2, zIndex: 100, duration: 0.4, ease: "back.out(1.7)" });
        elemento.classList.add('expandido');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONTROLE VISUAL DOS MODAIS (Ajustado para classe .active do CSS + fallback display)
// ─────────────────────────────────────────────────────────────────────────────
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) {
        console.error(`Erro: O modal com id '${id}' não foi encontrado no HTML.`);
        return;
    }
    
    modal.classList.add("active");
    modal.style.display = "flex"; // Força exibição independente de restrições do CSS básico
    
    if (id !== "modal-galeria-midia") {
        document.body.style.overflow = "hidden";
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
    
    if (id !== "modal-galeria-midia") {
        document.body.style.overflow = "";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RENDERIZAÇÃO DA GRADE DE PRODUTOS
// ─────────────────────────────────────────────────────────────────────────────
function renderizarCards() {
    const grade = document.getElementById("prod-grade");
    if (!grade) return;

    grade.innerHTML = "";

    if (!PRODUTOS_DB || PRODUTOS_DB.length === 0) {
        grade.innerHTML = `
            <div class="prod-vazio">
                <span>📦</span>
                Nenhum produto cadastrado ainda.<br>
                Clique em <strong>Adicionar Produto</strong> para começar.
            </div>`;
        return;
    }

    PRODUTOS_DB.forEach((produto, i) => {
        const card = criarCard(produto, i);
        grade.appendChild(card);

        if (typeof gsap !== "undefined") {
            gsap.to(card, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.5, delay: i * 0.10,
                ease: "back.out(1.4)"
            });
        } else {
            card.style.opacity = "1";
        }
    });
}

function criarCard(p, i) {
    const card = document.createElement("div");
    card.className = "prod-card";
    card.dataset.id = p.id;
    card.style.animationDelay = (i * 0.6) + "s";

    const imgHtml = p.imagem_url ? `<img src="${p.imagem_url}" alt="${p.nome}">` : `📦`;
    const precoFormatado = parseFloat(p.preco).toFixed(2).replace(".", ",");
    const nomeSeguro     = p.nome.replace(/'/g, "\\'");

    card.innerHTML = `
        <div class="prod-card-img">${imgHtml}</div>
        <div class="prod-card-body">
            <h4 title="${p.nome}">${p.nome}</h4>
            <span class="prod-card-tamanho">Tamanho: ${p.tamanho || "N/A"}</span>
            <span class="prod-card-preco">R$ ${precoFormatado}</span>
            <span class="prod-card-status ${p.disponivel ? 'status-ok' : 'status-off'}">
                ${p.disponivel ? "Disponível" : "Indisponível"}
            </span>
        </div>
        <div class="prod-card-acoes">
            <button class="btn-card-acao btn-editar" onclick="abrirModalEditar(${p.id})">✏️ Editar</button>
            <button class="btn-card-acao btn-deletar" onclick="abrirModalDeletar(${p.id}, '${nomeSeguro}')">🗑️</button>
        </div>
    `;
    return card;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GALERIA DE MÍDIAS
// ─────────────────────────────────────────────────────────────────────────────
async function abrirGaleriaGlobal(modo) {
    modoGaleriaAlvo = modo; 
    
    const galeriaGrid = document.getElementById("galeria-grid-dinamico");
    if (!galeriaGrid) return;

    const inputId = modo === 'adicionar' ? "img-selecionada-adicionar" : "img-selecionada-editar";
    const inputHidden = document.getElementById(inputId);
    const imagemAtual = inputHidden ? inputHidden.value : "";
    imagemTemporariaSelecionada = imagemAtual; 

    abrirModal("modal-galeria-midia");

    galeriaGrid.innerHTML = `<p style="color:rgba(255,255,255,0.4); font-size:0.85rem; grid-column:1/-1; text-align:center; padding: 20px;">✨ Escaneando repositório de mídias...</p>`;

    try {
        const resp = await fetch("/admin/assets/imagens");
        const dados = await resp.json();
        const imagens = dados.imagens;

        galeriaGrid.innerHTML = "";

        if (!imagens || imagens.length === 0) {
            galeriaGrid.innerHTML = `<p style="color:rgba(255,255,255,0.4); font-size:0.85rem; grid-column:1/-1; text-align:center;">Nenhuma imagem encontrada na pasta /static/assets/</p>`;
            return;
        }

        imagens.forEach(src => {
            const item = document.createElement("div");
            item.className = "galeria-item";

            if (imagemAtual && src === imagemAtual) {
                item.classList.add("selecionada");
            }

            item.innerHTML = `<img src="${src}" alt="Asset">`;

            item.addEventListener("click", () => {
                galeriaGrid.querySelectorAll(".galeria-item").forEach(i => i.classList.remove("selecionada"));
                item.classList.add("selecionada");
                imagemTemporariaSelecionada = src;
            });

            galeriaGrid.appendChild(item);
        });

    } catch (e) {
        console.error("Erro ao buscar imagens do servidor:", e);
        galeriaGrid.innerHTML = `<p style="color:#ff6b6b; font-size:0.85rem; grid-column:1/-1; text-align:center;">💥 Erro ao carregar as mídias. Verifique a API do servidor.</p>`;
    }
}

function confirmarEscolhaGaleria() {
    if (!imagemTemporariaSelecionada) {
        fecharModal("modal-galeria-midia");
        return;
    }

    if (modoGaleriaAlvo === 'adicionar') {
        const inputHidden = document.getElementById("img-selecionada-adicionar");
        const previewImg = document.getElementById("preview-img-adicionar");
        if (inputHidden) inputHidden.value = imagemTemporariaSelecionada;
        if (previewImg) previewImg.src = imagemTemporariaSelecionada;
    } 
    else if (modoGaleriaAlvo === 'editar') {
        const inputHidden = document.getElementById("img-selecionada-editar");
        const previewImg = document.getElementById("preview-img-editar");
        if (inputHidden) inputHidden.value = imagemTemporariaSelecionada;
        if (previewImg) previewImg.src = imagemTemporariaSelecionada;
    }

    fecharModal("modal-galeria-midia");
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. OPERAÇÕES DE PRODUTOS (ADICIONAR, EDITAR, DELETAR)
// ─────────────────────────────────────────────────────────────────────────────
function abrirModalAdicionar() {
    const form = document.getElementById("form-adicionar");
    if (form) form.reset();

    const inputImg = document.getElementById("img-selecionada-adicionar");
    if (inputImg) inputImg.value = "/static/assets/Camisa malha branca.svg";

    const previewImg = document.getElementById("preview-img-adicionar");
    if (previewImg) previewImg.src = "/static/assets/Camisa malha branca.svg";

    abrirModal("modal-adicionar");
}

async function salvarProduto(event) {
    event.preventDefault();
    const form = document.getElementById("form-adicionar");
    if (!form) return;
    
    const dados = Object.fromEntries(new FormData(form));

    try {
        const resp = await fetch("/admin/produtos", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(dados)
        });

        if (resp.ok) {
            fecharModal("modal-adicionar");
            location.reload();
        } else {
            alert("Erro ao salvar produto. Verifique os dados fornecidos.");
        }
    } catch(e) {
        console.error(e);
        alert("Erro de conexão com o servidor.");
    }
}

function abrirModalEditar(id) {
    const p = PRODUTOS_DB.find(x => x.id === id);
    if (!p) return;

    if (document.getElementById("edit-id")) document.getElementById("edit-id").value = p.id;
    if (document.getElementById("edit-nome")) document.getElementById("edit-nome").value = p.nome;
    if (document.getElementById("edit-preco")) document.getElementById("edit-preco").value = p.preco;
    if (document.getElementById("edit-quantidade")) document.getElementById("edit-quantidade").value = p.quantidade || 0;
    if (document.getElementById("edit-tamanho")) document.getElementById("edit-tamanho").value = p.tamanho;
    if (document.getElementById("edit-disponivel")) document.getElementById("edit-disponivel").value = p.disponivel ? "1" : "0";
    if (document.getElementById("edit-categoria-id")) document.getElementById("edit-categoria-id").value = p.categoria_id || "";
    
    const inputImg = document.getElementById("img-selecionada-editar");
    if (inputImg) inputImg.value = p.imagem_url || "/static/assets/Camisa malha branca.svg";

    const previewImg = document.getElementById("preview-img-editar");
    if (previewImg) previewImg.src = p.imagem_url || "/static/assets/Camisa malha branca.svg";

    abrirModal("modal-editar");
}

async function atualizarProduto(event) {
    event.preventDefault();
    const form = document.getElementById("form-editar");
    if (!form) return;

    const dados = Object.fromEntries(new FormData(form));
    const id = dados.id;

    try {
        const resp = await fetch(`/admin/produtos/${id}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(dados)
        });

        if (resp.ok) {
            fecharModal("modal-editar");
            location.reload();
        } else {
            alert("Erro ao atualizar produto.");
        }
    } catch(e) {
        console.error(e);
        alert("Erro de conexão com o servidor.");
    }
}

function abrirModalDeletar(id, nome) {
    produtoDeletarId = id;
    produtoDeletarNome = nome;
    
    const txtNome = document.getElementById("deletar-nome-produto");
    if (txtNome) txtNome.textContent = `"${nome}"?`;
    
    abrirModal("modal-deletar");
}

async function confirmarDelecao() {
    if (!produtoDeletarId) return;

    try {
        const resp = await fetch(`/admin/produtos/${produtoDeletarId}`, {
            method: "DELETE"
        });

        if (resp.ok) {
            fecharModal("modal-deletar");

            const card = document.querySelector(`.prod-card[data-id="${produtoDeletarId}"]`);
            if (card && typeof gsap !== "undefined") {
                gsap.to(card, {
                    opacity: 0, scale: 0.7, y: -20,
                    duration: 0.4,
                    ease: "back.in(1.4)",
                    onComplete: () => {
                        card.remove();
                        const idx = PRODUTOS_DB.findIndex(p => p.id === produtoDeletarId);
                        if (idx !== -1) PRODUTOS_DB.splice(idx, 1);
                        produtoDeletarId = null;
                        produtoDeletarNome = null;

                        if (PRODUTOS_DB.length === 0) {
                            const grade = document.getElementById("prod-grade");
                            if (grade) {
                                grade.innerHTML = `<div class="prod-vazio"><span>📦</span>Nenhum produto cadastrado ainda.</div>`;
                            }
                        }
                    }
                });
            } else {
                location.reload();
            }
        } else {
            alert("Erro ao deletar produto.");
        }
    } catch(e) {
        console.error(e);
        alert("Erro de conexão com o servidor.");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GERENCIAMENTO EXCLUSIVO DE CATEGORIAS (AAPM SENAI BRÁS)
// ─────────────────────────────────────────────────────────────────────────────
let categoriaDeletarId = null;

function abrirModalCatAdicionar() {
    const form = document.getElementById("form-cat-adicionar");
    if (form) form.reset(); 

    abrirModal('modal-cat-adicionar');
}

async function salvarCategoria(event) {
    event.preventDefault();
    const nomeInput = document.getElementById("cat-nome");
    if (!nomeInput) return;

    const dados = { nome: nomeInput.value };

    try {
        const resp = await fetch("/admin/categorias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (resp.ok) {
            fecharModal("modal-cat-adicionar");
            location.reload();
        } else {
            const erro = await resp.json().catch(() => ({}));
            alert(erro.detail || "Erro ao salvar a categoria.");
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        alert("Erro de conexão com o servidor.");
    }
}

function abrirModalCatEditar(id) {
    const idNum = parseInt(id, 10);
    const cat = CATEGORIAS_DB ? CATEGORIAS_DB.find(x => x.id === idNum) : null;
    
    if (!cat) {
        console.error("Categoria não encontrada para o ID:", idNum);
        return;
    }

    const inputId = document.getElementById("edit-cat-id");
    const inputNome = document.getElementById("edit-cat-nome");

    if (inputId) inputId.value = cat.id;
    if (inputNome) inputNome.value = cat.nome;

    abrirModal('modal-cat-editar');
}

async function atualizarCategoria(event) {
    event.preventDefault();
    const idInput = document.getElementById("edit-cat-id");
    const nomeInput = document.getElementById("edit-cat-nome");
    
    if (!idInput || !nomeInput) return;
    
    const id = idInput.value;
    const dados = { nome: nomeInput.value };

    try {
        const resp = await fetch(`/admin/categorias/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (resp.ok) {
            fecharModal("modal-cat-editar");
            location.reload();
        } else {
            alert("Erro ao atualizar categoria.");
        }
    } catch(e) {
        console.error(e);
        alert("Erro de conexão com o servidor.");
    }
}

function abrirModalCatDeletar(id, nome) {
    categoriaDeletarId = id;
    
    const txtNome = document.getElementById('deletar-nome-categoria');
    if (txtNome) txtNome.textContent = `"${nome}"?`;

    abrirModal('modal-cat-deletar');
}

async function confirmarDelecaoCategoria() {
    if (!categoriaDeletarId) return;

    try {
        const resposta = await fetch(`/admin/categorias/${categoriaDeletarId}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            fecharModal("modal-cat-deletar");
            location.reload();
        } else {
            const erroDados = await resposta.json().catch(() => ({}));
            alert(erroDados.detail || "Não é possível deletar esta categoria pois existem produtos vinculados a ela.");
        }
    } catch (erro) {
        console.error("Erro na requisição de exclusão:", erro);
        alert("Erro de conexão com o servidor.");
    } finally {
        categoriaDeletarId = null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. GERENCIAMENTO EXCLUSIVO DE FORNECEDORES
// ─────────────────────────────────────────────────────────────────────────────
let fornecedorDeletarId = null;

function abrirModalFornAdicionar() {
    const form = document.getElementById("form-forn-adicionar");
    if (form) form.reset(); 
    abrirModal("modal-forn-adicionar");
}

async function salvarFornecedor(event) {
    event.preventDefault();
    const form = document.getElementById("form-forn-adicionar");
    if (!form) return;

    const dadosForm = new FormData(form);
    const dados = Object.fromEntries(dadosForm);

    try {
        const resp = await fetch("/admin/fornecedores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (resp.ok) {
            fecharModal("modal-forn-adicionar");
            location.reload();
        } else {
            const erro = await resp.json().catch(() => ({}));
            alert(erro.detail || "Erro ao salvar o fornecedor. Verifique se o CNPJ é único.");
        }
    } catch (e) {
        console.error("Erro ao conectar ao servidor:", e);
        alert("Erro de conexão com o servidor.");
    }
}

function abrirModalFornEditar(id) {
    const idNum = parseInt(id, 10);
    const forn = FORNECEDORES_DB ? FORNECEDORES_DB.find(x => x.id === idNum) : null;

    if (!forn) {
        console.error("Fornecedor não encontrado localmente para o ID:", idNum);
        return;
    }

    if (document.getElementById("edit-forn-id")) document.getElementById("edit-forn-id").value = forn.id;
    if (document.getElementById("edit-forn-nome")) document.getElementById("edit-forn-nome").value = forn.nome_fantasia;
    if (document.getElementById("edit-forn-cnpj")) document.getElementById("edit-forn-cnpj").value = forn.cnpj;
    if (document.getElementById("edit-forn-telefone")) document.getElementById("edit-forn-telefone").value = forn.telefone;
    if (document.getElementById("edit-forn-email")) document.getElementById("edit-forn-email").value = forn.email || "";
    if (document.getElementById("edit-forn-localidade")) document.getElementById("edit-forn-localidade").value = forn.localidade;
    if (document.getElementById("edit-forn-contato")) document.getElementById("edit-forn-contato").value = forn.nome_contato || "";

    abrirModal("modal-forn-editar");
}

async function atualizarFornecedor(event) {
    event.preventDefault();
    const form = document.getElementById("form-forn-editar");
    if (!form) return;

    const dadosForm = new FormData(form);
    const dados = Object.fromEntries(dadosForm);
    const id = dados.id;

    try {
        const resp = await fetch(`/admin/fornecedores/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (resp.ok) {
            fecharModal("modal-forn-editar");
            location.reload();
        } else {
            const erro = await resp.json().catch(() => ({}));
            alert(erro.detail || "Erro ao atualizar os dados do fornecedor.");
        }
    } catch (e) {
        console.error("Erro de comunicação com a API:", e);
        alert("Erro de conexão com o servidor.");
    }
}

function abrirModalFornDeletar(id, nome) {
    fornecedorDeletarId = id;
    
    const txtNome = document.getElementById("deletar-nome-fornecedor");
    if (txtNome) txtNome.textContent = `"${nome}"?`;

    abrirModal("modal-forn-deletar");
}

async function confirmarDelecaoFornecedor() {
    if (!fornecedorDeletarId) return;

    try {
        const resp = await fetch(`/admin/fornecedores/${fornecedorDeletarId}`, {
            method: "DELETE"
        });

        if (resp.ok) {
            fecharModal("modal-forn-deletar");

            const btnId = document.querySelector(`button[data-id="${fornecedorDeletarId}"]`);
            const linha = document.getElementById(`linha-fornecedor-${fornecedorDeletarId}`) || (btnId ? btnId.closest('tr') : null);
            if (linha && typeof gsap !== "undefined") {
                gsap.to(linha, {
                    opacity: 0, x: -30, duration: 0.35, ease: "power2.in",
                    onComplete: () => {
                        linha.remove();
                        location.reload(); 
                    }
                });
            } else {
                location.reload();
            }
        } else {
            const erro = await resp.json().catch(() => ({}));
            alert(erro.detail || "Erro ao deletar fornecedor.");
        }
    } catch (e) {
        console.error("Erro ao enviar comando DELETE:", e);
        alert("Erro de conexão com o servidor.");
    } finally { 
        fornecedorDeletarId = null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. GERENCIAMENTO DE VENDAS E EMISSÃO DE EXTRATO
// ─────────────────────────────────────────────────────────────────────────────
function abrirModalVenda() {
    const formVenda = document.getElementById('form-nova-venda');
    if (formVenda) formVenda.reset();
    
    const labelTotal = document.getElementById('label-total-venda');
    if (labelTotal) labelTotal.textContent = "R$ 0,00";
    
    abrirModal('modal-venda');
}

function fecharModalVenda() {
    fecharModal('modal-venda');
}

function calcularPrecoTotal() {
    const selectProduto = document.getElementById('produto_id');
    if (!selectProduto) return 0.0;
    
    const opcaoSelecionada = selectProduto.options[selectProduto.selectedIndex];
    const quantidadeInput = document.getElementById('quantidade');
    const quantidade = quantidadeInput ? (parseInt(quantidadeInput.value) || 1) : 1;

    if (!opcaoSelecionada || !opcaoSelecionada.dataset.preco) {
        return 0.0;
    }

    const precoUnitario = parseFloat(opcaoSelecionada.dataset.preco);
    return precoUnitario * quantidade;
}

function atualizarTotalFormatado() {
    const total = calcularPrecoTotal();
    const labelTotal = document.getElementById('label-total-venda');
    if (labelTotal) {
        labelTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

async function enviarVenda(event) {
    event.preventDefault();
    const precoTotalCalculado = calcularPrecoTotal();
    
    if (precoTotalCalculado <= 0) {
        alert("Por favor, selecione um produto válido.");
        return;
    }

    const form = document.getElementById('form-nova-venda');
    if (!form) return;

    const dadosForm = new FormData(form);
    const payload = Object.fromEntries(dadosForm);

    try {
        const resp = await fetch("/admin/vendas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            fecharModal("modal-venda");
            location.reload();
        } else {
            const erro = await resp.json().catch(() => ({}));
            alert(erro.detail || "Erro ao processar a venda. Verifique se há estoque suficiente.");
        }
    } catch (e) {
        console.error("Erro ao registrar venda:", e);
        alert("Erro de conexão com o servidor.");
    }
}