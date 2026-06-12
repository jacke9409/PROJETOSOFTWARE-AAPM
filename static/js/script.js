/* ==========================================================================
   AAPM — SCRIPT PRINCIPAL & GERENCIAMENTO DE PRODUTOS E CATEGORIAS
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
let CATEGORIAS_DB = []; // 🌟 Variável global de categorias declarada corretamente

// ─────────────────────────────────────────────────────────────────────────────
// 1. INICIALIZAÇÃO DA APLICAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Captura os dados de PRODUTOS injetados pelo backend
    const dadosElemento = document.getElementById("dados-produtos-backend");
    if (dadosElemento && dadosElemento.dataset.produtos) {
        try {
            PRODUTOS_DB = JSON.parse(dadosElemento.dataset.produtos);
        } catch (e) {
            console.error("Erro ao processar dados de produtos do backend:", e);
        }
    }

    // 🌟 CAPTURA OS DADOS DE CATEGORIAS: Busca o elemento de dados que enviamos no HTML de categorias
    const dadosCatElemento = document.getElementById("dados-categorias-backend");
    if (dadosCatElemento && dadosCatElemento.dataset.categorias) {
        try {
            CATEGORIAS_DB = JSON.parse(dadosCatElemento.dataset.categorias);
            window.CATEGORIAS_DB = CATEGORIAS_DB; // Define na window para garantir compatibilidade
        } catch (e) {
            console.error("Erro ao processar dados de categorias do backend:", e);
        }
    }

    // Interceptador do Formulário de Login
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

    // Fecha modais clicando na área escura (overlay)
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", e => {
            if (e.target === overlay) fecharModal(overlay.id);
        });
    });

    // Efeito de loading na grade de produtos: skeletons somem após 900ms
    setTimeout(renderizarCards, 900);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. NAVEGAÇÃO ENTRE UNIVERSOS (GSAP)
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
            gsap.to("#universo-admin", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
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
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-admin", { scale: 0.5, x: "-100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    } 
    else if (universoAtual === 'publico') {
        gsap.to("#universo-home", { scale: 1, x: "0vw", opacity: 1, duration: 1.2, ease: "power2.inOut" });
        gsap.to("#universo-publico", { scale: 0.5, x: "100vw", opacity: 0, duration: 1.2, ease: "power2.inOut" });
    }
    
    universoAtual = 'home';
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
// 3. CONTROLE VISUAL DOS MODAIS
// ─────────────────────────────────────────────────────────────────────────────
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    
    modal.classList.add("visivel");
    if (id !== "modal-galeria-midia") {
        document.body.style.overflow = "hidden";
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("visivel");
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

        gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            delay: i * 0.10,
            ease: "back.out(1.4)"
        });
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
            <span class="prod-card-tamanho">Tamanho: ${p.tamanho}</span>
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
            if (card) {
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

// Variável global para armazenar temporariamente o ID da categoria que será deletada
let categoriaDeletarId = null;

function abrirModalCatAdicionar() {
    const form = document.getElementById("form-cat-adicionar");
    if (form) form.reset(); // Reseta campos antigos

    const modal = document.getElementById('modal-cat-adicionar');
    if (modal) {
        modal.classList.add("visivel");
        document.body.style.overflow = "hidden";
    }
}

// 🌟 NOVA FUNÇÃO: Cadastra nova categoria enviando JSON para a rota POST do FastAPI
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
    // Lê perfeitamente do array mapeado e preenchido pelo DOMContentLoaded
    const cat = CATEGORIAS_DB ? CATEGORIAS_DB.find(x => x.id === idNum) : null;
    
    if (!cat) {
        console.error("Categoria não encontrada para o ID:", idNum);
        return;
    }

    const inputId = document.getElementById("edit-cat-id");
    const inputNome = document.getElementById("edit-cat-nome");

    if (inputId) inputId.value = cat.id;
    if (inputNome) inputNome.value = cat.nome;

    const modal = document.getElementById('modal-cat-editar');
    if (modal) {
        modal.classList.add("visivel");
        document.body.style.overflow = "hidden";
    }
}

// 🌟 NOVA FUNÇÃO: Envia a requisição PUT via JSON para o FastAPI salvar no MySQL
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

    const modal = document.getElementById('modal-cat-deletar');
    if (modal) {
        modal.classList.add("visivel");
        document.body.style.overflow = "hidden";
    }
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
            alert(erroDados.detail || "Erro ao deletar categoria. Verifique se existem produtos vinculados a ela.");
        }
    } catch (erro) {
        console.error("Erro na requisição de exclusão:", erro);
        alert("Erro de conexão com o servidor.");
    } finally {
        categoriaDeletarId = null;
    }
}