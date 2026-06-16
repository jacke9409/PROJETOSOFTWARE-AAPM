/* ─── REGISTRO SEGURO DE PLUGINS (GSAP) ──────────────────────── */
const pluginsToRegister = [];
if (typeof ScrollTrigger !== "undefined") pluginsToRegister.push(ScrollTrigger);
if (typeof ScrollSmoother !== "undefined") pluginsToRegister.push(ScrollSmoother);
if (typeof SplitText !== "undefined") pluginsToRegister.push(SplitText);

if (pluginsToRegister.length > 0) {
  gsap.registerPlugin(...pluginsToRegister);
}

/* ─── SCROLL SUAVE SEGURO ─────────────────────────────── */
if (typeof ScrollSmoother !== "undefined" && document.getElementById("smooth-wrapper")) {
  const smoother = ScrollSmoother.create({
    smooth: 1.2,
    effects: true,
  });
}

/* ─── ANIMAÇÕES INSTITUCIONAIS / HOME (GSAP) ──────────────── */
if (document.querySelector(".hero")) {
  gsap.from(".hero", { opacity: 0, duration: 1.2, ease: "power2.out" });

  gsap.from(".hero-esquerda h1", {
    y: 80,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: "power3.out",
  });

  gsap.from(".eyebrow", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.15,
    ease: "power3.out",
  });

  gsap.from(".hero-direita", {
    y: 50,
    opacity: 0,
    duration: 0.9,
    delay: 0.4,
    ease: "power3.out",
  });

  gsap.to(".hero-bg", {
    yPercent: 25,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

/* ─── ANIMAÇÕES INSTITUCIONAIS / HOME (GSAP) ──────────────── */
// Só anima se estiver na página pública que contém o container original de cards
if (document.querySelector(".cards-institucionais-container")) {
  gsap.from(".cards-institucionais-container .card", {
    opacity: 0,
    y: 60,
    filter: "blur(8px)",
    stagger: 0.2,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".cards-institucionais-container",
      start: "top 80%",
      end: "top 40%",
      scrub: false,
    },
  });
}

if (document.querySelector(".secao-sobre")) {
  gsap.from(".sobre-item", {
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: { trigger: ".secao-sobre", start: "top 75%" },
  });
}

if (document.querySelector(".secao-agende")) {
  gsap.from(".secao-agende h2", {
    opacity: 0,
    y: 50,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: ".secao-agende", start: "top 75%" },
  });

  gsap.from(".secao-agende .btn-primary", {
    opacity: 0,
    y: 30,
    duration: 0.7,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: { trigger: ".secao-agende", start: "top 70%" },
  });
}

if (document.querySelector(".titulo-secao")) {
  gsap.from(".titulo-secao h2", {
    opacity: 0,
    x: -40,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".titulo-secao", start: "top 80%" },
  });
}

if (document.querySelector("footer")) {
  gsap.from(".footer-logo h2", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: "footer", start: "top 85%" },
  });
}

if (document.querySelector("header")) {
  gsap.from("header", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
}

/* ─── ANIMAÇÕES DA TELA DE LOGIN ─────────────────────────── */
if (document.querySelector(".card-login")) {
  gsap.from(".login-left .eyebrow", { y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: "power3.out" });
  gsap.from(".login-left h1", { y: 60, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
  gsap.from(".login-desc, .divider, .login-bullets", { y: 30, opacity: 0, duration: 0.7, delay: 0.4, stagger: 0.12, ease: "power3.out" });
  gsap.from(".card-login", { x: 60, opacity: 0, duration: 0.9, delay: 0.3, ease: "power3.out" });
}

/* ─── TOGGLE SENHA (TELA DE LOGIN) ───────────────────────── */
(function() {
  const toggleBtn  = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha");
  const iconEye    = document.getElementById("icon-eye");
  const iconEyeOff = document.getElementById("icon-eye-off");

  if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = senhaInput.type === "password";
      senhaInput.type = isHidden ? "text" : "password";
      if (iconEye && iconEyeOff) {
        iconEye.style.display    = isHidden ? "none"  : "block";
        iconEyeOff.style.display = isHidden ? "block" : "none";
      }
    });
  }
})();

/* ─── VALIDAÇÃO & SUBMIT DO LOGIN ────────────────────────── */
function setError(groupId, show) {
  const group = document.getElementById(groupId);
  if (group) {
    if (show) group.classList.add("has-error");
    else group.classList.remove("has-error");
  }
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const btnLogin = document.getElementById("btn-login");
if (btnLogin) {
  const emailField = document.getElementById("email");
  const senhaField = document.getElementById("senha");
  const btnText   = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const btnArrow  = document.getElementById("btn-arrow");

  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailField.value.trim();
    const senha = senhaField.value;
    let ok = true;

    if (!validarEmail(email)) {
      setError("group-email", true);
      ok = false;
      if (typeof gsap !== "undefined") gsap.fromTo("#group-email", { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } else {
      setError("group-email", false);
    }

    if (senha.length < 1) {
      setError("group-senha", true);
      ok = false;
      if (typeof gsap !== "undefined") gsap.fromTo("#group-senha", { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } else {
      setError("group-senha", false);
    }

    if (!ok) return;

    btnLogin.classList.add("loading");
    if (btnText) btnText.style.display = "none";
    if (btnArrow) btnArrow.style.display = "none";
    if (btnLoader) btnLoader.style.display = "flex";

    try {
      const formData = new FormData();
      formData.append("email", email); 
      formData.append("senha", senha); 

      const response = await fetch("/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        window.location.href = "/dashboard";
        return;
      }

      const errorText = await response.text();
      alert(errorText || "E-mail ou senha incorretos.");
    } catch (error) {
      alert("Erro de conexão. Tente novamente mais tarde.");
    } finally {
      btnLogin.classList.remove("loading");
      if (btnText) btnText.style.display = "inline";
      if (btnArrow) btnArrow.style.display = "block";
      if (btnLoader) btnLoader.style.display = "none";
    }
  });

  if (emailField) emailField.addEventListener("input", () => setError("group-email", false));
  if (senhaField) senhaField.addEventListener("input", () => setError("group-senha", false));
}


/* ─────────────────────────────────────────────────────────────────────────────
   ─── CORE DO PAINEL ADMINISTRATIVO (PRODUTOS & ASSISTENTES) ─────────────────
   ───────────────────────────────────────────────────────────────────────────── */

let escopoGaleriaAtivo = 'adicionar'; 
let produtoIdParaDeletar = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Data Atual Dinâmica no Painel
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const d = new Date();
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = d.toLocaleDateString('pt-BR', opts);
    }

    // 2. Dispara a renderização local de produtos
    carregarProdutosDoBackend();
});

// Renderiza a grade de produtos baseada no bloco de dados injetado pelo Jinja2
function carregarProdutosDoBackend() {
    const divDados = document.getElementById('dados-produtos-backend');
    const grade = document.getElementById('prod-grade');
    
    if (!divDados || !grade) return; // Evita rodar no site institucional externo

    try {
        const produtos = JSON.parse(divDados.getAttribute('data-produtos') || "[]");
        grade.innerHTML = ""; 

        if (produtos.length === 0) {
            grade.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
                    Nenhum produto cadastrado no momento. ＋ Adicione o primeiro!
                </div>`;
            return;
        }

        produtos.forEach(prod => {
            const statusBadge = prod.disponivel 
                ? '<span class="status-tag disponivel">Disponível</span>' 
                : '<span class="status-tag indisponivel">Indisponível</span>';

            const card = document.createElement('div');
            card.className = 'prod-card';
            card.innerHTML = `
                <div class="prod-card-capa">
                    <img src="${prod.imagem_url || '/static/assets/Camisa malha branca.svg'}" alt="${prod.nome}">
                    ${statusBadge}
                </div>
                <div class="prod-card-corpo">
                    <h3 class="prod-card-titulo">${prod.nome}</h3>
                    <div class="prod-card-detalhes">
                        <span class="prod-card-preco">R$ ${Number(prod.preco).toFixed(2).replace('.', ',')}</span>
                        ${prod.tamanho ? `<span class="prod-card-tamanho">Tam: ${prod.tamanho}</span>` : ''}
                    </div>
                    <div class="prod-card-acoes">
                        <button class="btn-acao-editar" onclick="abrirModalEditar(${JSON.stringify(prod).replace(/"/g, '&quot;')})">✏️ Editar</button>
                        <button class="btn-acao-deletar" onclick="abrirModalDeletar(${prod.id}, '${prod.nome}')">🗑️ Excluir</button>
                    </div>
                </div>
            `;
            grade.appendChild(card);
        });
    } catch (e) {
        console.error("Erro no processamento dos produtos:", e);
        grade.innerHTML = `<div style="grid-column: 1/-1; color: #ff5555;">Erro ao renderizar dados locais.</div>`;
    }
}

/* ─── CONTROLE DE JANELAS MODAIS ────────────────────────── */
function abrirModalAdicionar() {
    document.getElementById('modal-adicionar').classList.add('active');
}

function abrirModalEditar(prod) {
    document.getElementById('edit-id').value = prod.id;
    document.getElementById('edit-nome').value = prod.nome;
    document.getElementById('edit-preco').value = prod.preco;
    
    if (document.getElementById('edit-quantidade')) {
        document.getElementById('edit-quantidade').value = prod.quantidade || 0;
    }
    
    document.getElementById('edit-categoria-id').value = prod.categoria_id || "";
    document.getElementById('edit-tamanho').value = prod.tamanho || "";
    document.getElementById('edit-disponivel').value = prod.disponivel ? "1" : "0";
    
    document.getElementById('img-selecionada-editar').value = prod.imagem_url;
    document.getElementById('preview-img-editar').src = prod.imagem_url || '/static/assets/Camisa malha branca.svg';

    document.getElementById('modal-editar').classList.add('active');
}

function abrirModalDeletar(id, nome) {
    produtoIdParaDeletar = id;
    document.getElementById('deletar-nome-produto').textContent = `"${nome}"`;
    document.getElementById('modal-deletar').classList.add('active');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('active');
}

/* ─── ENVIOS PARA A API DO FASTAPI (/ADMIN/PRODUTOS) ─────── */
async function salvarProduto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const payload = {
        nome: formData.get('nome'),
        preco: parseFloat(formData.get('preco')),
        tamanho: formData.get('tamanho') || "",
        disponivel: parseInt(formData.get('disponivel')),
        categoria_id: formData.get('categoria_id') ? parseInt(formData.get('categoria_id')) : null,
        imagem_url: formData.get('imagem_url')
    };

    try {
        const response = await fetch('/admin/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) window.location.reload();
        else alert("Erro ao criar produto.");
    } catch (err) {
        alert("Erro na conexão com o servidor.");
    }
}

async function atualizarProduto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('id');

    const payload = {
        nome: formData.get('nome'),
        preco: parseFloat(formData.get('preco')),
        tamanho: formData.get('tamanho') || "",
        disponivel: parseInt(formData.get('disponivel')),
        categoria_id: formData.get('categoria_id') ? parseInt(formData.get('categoria_id')) : null,
        imagem_url: formData.get('imagem_url')
    };

    try {
        const response = await fetch(`/admin/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) window.location.reload();
        else alert("Erro ao atualizar dados.");
    } catch (err) {
        alert("Erro na requisição.");
    }
}

async function confirmarDelecao() {
    if (!produtoIdParaDeletar) return;

    try {
        const response = await fetch(`/admin/produtos/${produtoIdParaDeletar}`, {
            method: 'DELETE'
        });

        if (response.ok) window.location.reload();
        else alert("Não foi possível remover o produto.");
    } catch (err) {
        alert("Erro de conexão.");
    }
}

/* ─── SELETOR DE IMAGENS DA GALERIA DO CATÁLOGO ──────────── */
async function abrirGaleriaGlobal(escopo) {
    escopoGaleriaAtivo = escopo; 
    const grid = document.getElementById('galeria-grid-dinamico');
    if (!grid) return;

    grid.innerHTML = "<p style='color:rgba(255,255,255,0.5); text-align:center;'>Buscando mídias...</p>";
    document.getElementById('modal-galeria-midia').classList.add('active');

    try {
        const response = await fetch('/admin/assets/imagens'); // Rota GET permitida no backend
        const dados = await response.json();

        grid.innerHTML = "";
        if (!dados.imagens || dados.imagens.length === 0) {
            grid.innerHTML = "<p style='color:rgba(255,255,255,0.4); text-align:center; grid-column:1/-1;'>Nenhum asset encontrado.</p>";
            return;
        }

        dados.imagens.forEach(url => {
            const item = document.createElement('div');
            item.className = 'galeria-item-opcao';
            item.innerHTML = `<img src="${url}" alt="Asset"><div class="check-overlay">✓</div>`;
            item.onclick = () => selecionarItemGaleria(item, url);
            grid.appendChild(item);
        });
    } catch (e) {
        grid.innerHTML = "<p style='color:#ff5555; text-align:center;'>Erro ao abrir galeria.</p>";
    }
}

let urlImagemSelecionadaTemporaria = null;
function selecionarItemGaleria(elemento, url) {
    document.querySelectorAll('.galeria-item-opcao').forEach(el => el.classList.remove('selected'));
    elemento.classList.add('selected');
    urlImagemSelecionadaTemporaria = url;
}

function confirmarEscolhaGaleria() {
    if (!urlImagemSelecionadaTemporaria) {
        fecharModal('modal-galeria-midia');
        return;
    }

    if (escopoGaleriaAtivo === 'adicionar') {
        document.getElementById('img-selecionada-adicionar').value = urlImagemSelecionadaTemporaria;
        document.getElementById('preview-img-adicionar').src = urlImagemSelecionadaTemporaria;
    } else if (escopoGaleriaAtivo === 'editar') {
        document.getElementById('img-selecionada-editar').value = urlImagemSelecionadaTemporaria;
        document.getElementById('preview-img-editar').src = urlImagemSelecionadaTemporaria;
    }

    fecharModal('modal-galeria-midia');
}

async function enviarVenda(event) {
    event.preventDefault();
    
    // Captura os elementos direto para fazer as conversões de tipo corretas
    const inputComprador = document.getElementById('comprador');
    const selectProduto = document.getElementById('produto_id');
    const inputQuantidade = document.getElementById('quantidade');

    if (!selectProduto || selectProduto.value === "") {
        alert("Por favor, selecione um produto válido.");
        return;
    }

    // Pega a opção selecionada no HTML para extrair o data-preco
    const opcaoSelecionada = selectProduto.options[selectProduto.selectedIndex];
    const precoUnitario = parseFloat(opcaoSelecionada.getAttribute('data-preco')) || 0;
    
    const quantidadeValida = parseInt(inputQuantidade.value) || 1;
    const totalCalculado = precoUnitario * quantidadeValida;

    // Monta o objeto com os tipos exatos que o VendaSchema do Pydantic exige
    const payload = {
        comprador: inputComprador.value.trim(),
        produto_id: parseInt(selectProduto.value), // Convertido para int
        quantidade: quantidadeValida,              // Convertido para int
        preco_total: totalCalculado                // Adicionado como float/number
    };

    try {
        const response = await fetch('/admin/vendas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            fecharModalVenda();
            window.location.reload();
        } else {
            const errData = await response.json();
            console.error("Erro retornado pelo FastAPI:", errData);
            alert("Erro ao registrar venda: " + JSON.stringify(errData.detail));
        }
    } catch (err) {
        console.error(err);
        alert("Falha de rede ao registrar venda.");
    }
}

/* ─── REGISTRO SEGURO DE PLUGINS (GSAP) ──────────────────────── */
const pluginsToRegister = [];
if (typeof ScrollTrigger !== "undefined") pluginsToRegister.push(ScrollTrigger);
if (typeof ScrollSmoother !== "undefined") pluginsToRegister.push(ScrollSmoother);
if (typeof SplitText !== "undefined") pluginsToRegister.push(SplitText);

if (pluginsToRegister.length > 0) {
  gsap.registerPlugin(...pluginsToRegister);
}

/* ─── SCROLL SUAVE SEGURO ─────────────────────────────── */
if (typeof ScrollSmoother !== "undefined" && document.getElementById("smooth-wrapper")) {
  const smoother = ScrollSmoother.create({
    smooth: 1.2,
    effects: true,
  });
}

/* ─── ANIMAÇÕES INSTITUCIONAIS / HOME (GSAP) ──────────────── */
if (document.querySelector(".hero")) {
  gsap.from(".hero", { opacity: 0, duration: 1.2, ease: "power2.out" });

  gsap.from(".hero-esquerda h1", {
    y: 80,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: "power3.out",
  });

  gsap.from(".eyebrow", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.15,
    ease: "power3.out",
  });

  gsap.from(".hero-direita", {
    y: 50,
    opacity: 0,
    duration: 0.9,
    delay: 0.4,
    ease: "power3.out",
  });

  gsap.to(".hero-bg", {
    yPercent: 25,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

/* ─── ANIMAÇÕES INSTITUCIONAIS / HOME (GSAP) ──────────────── */
if (document.querySelector(".cards-institucionais-container")) {
  gsap.from(".cards-institucionais-container .card", {
    opacity: 0,
    y: 60,
    filter: "blur(8px)",
    stagger: 0.2,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".cards-institucionais-container",
      start: "top 80%",
      end: "top 40%",
      scrub: false,
    },
  });
}

if (document.querySelector(".secao-sobre")) {
  gsap.from(".sobre-item", {
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: { trigger: ".secao-sobre", start: "top 75%" },
  });
}

if (document.querySelector(".secao-agende")) {
  gsap.from(".secao-agende h2", {
    opacity: 0,
    y: 50,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: ".secao-agende", start: "top 75%" },
  });

  gsap.from(".secao-agende .btn-primary", {
    opacity: 0,
    y: 30,
    duration: 0.7,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: { trigger: ".secao-agende", start: "top 70%" },
  });
}

if (document.querySelector(".titulo-secao")) {
  gsap.from(".titulo-secao h2", {
    opacity: 0,
    x: -40,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".titulo-secao", start: "top 80%" },
  });
}

if (document.querySelector("footer")) {
  gsap.from(".footer-logo h2", {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: "footer", start: "top 85%" },
  });
}

if (document.querySelector("header")) {
  gsap.from("header", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" });
}

/* ─── ANIMAÇÕES DA TELA DE LOGIN ─────────────────────────── */
if (document.querySelector(".card-login")) {
  gsap.from(".login-left .eyebrow", { y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: "power3.out" });
  gsap.from(".login-left h1", { y: 60, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
  gsap.from(".login-desc, .divider, .login-bullets", { y: 30, opacity: 0, duration: 0.7, delay: 0.4, stagger: 0.12, ease: "power3.out" });
  gsap.from(".card-login", { x: 60, opacity: 0, duration: 0.9, delay: 0.3, ease: "power3.out" });
}

/* ─── TOGGLE SENHA (TELA DE LOGIN) ───────────────────────── */
(function() {
  const toggleBtn  = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha");
  const iconEye    = document.getElementById("icon-eye");
  const iconEyeOff = document.getElementById("icon-eye-off");

  if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = senhaInput.type === "password";
      senhaInput.type = isHidden ? "text" : "password";
      if (iconEye && iconEyeOff) {
        iconEye.style.display    = isHidden ? "none"  : "block";
        iconEyeOff.style.display = isHidden ? "block" : "none";
      }
    });
  }
})();

/* ─── VALIDAÇÃO & SUBMIT DO LOGIN ────────────────────────── */
function setError(groupId, show) {
  const group = document.getElementById(groupId);
  if (group) {
    if (show) group.classList.add("has-error");
    else group.classList.remove("has-error");
  }
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const btnLogin = document.getElementById("btn-login");
if (btnLogin) {
  const emailField = document.getElementById("email");
  const senhaField = document.getElementById("senha");
  const btnText   = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const btnArrow  = document.getElementById("btn-arrow");

  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailField.value.trim();
    const senha = senhaField.value;
    let ok = true;

    if (!validarEmail(email)) {
      setError("group-email", true);
      ok = false;
      if (typeof gsap !== "undefined") gsap.fromTo("#group-email", { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } else {
      setError("group-email", false);
    }

    if (senha.length < 1) {
      setError("group-senha", true);
      ok = false;
      if (typeof gsap !== "undefined") gsap.fromTo("#group-senha", { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } else {
      setError("group-senha", false);
    }

    if (!ok) return;

    btnLogin.classList.add("loading");
    if (btnText) btnText.style.display = "none";
    if (btnArrow) btnArrow.style.display = "none";
    if (btnLoader) btnLoader.style.display = "flex";

    try {
      const formData = new FormData();
      formData.append("email", email); 
      formData.append("senha", senha); 

      const response = await fetch("/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        window.location.href = "/dashboard";
        return;
      }

      const errorText = await response.text();
      alert(errorText || "E-mail ou senha incorretos.");
    } catch (error) {
      alert("Erro de conexão. Tente novamente mais tarde.");
    } finally {
      btnLogin.classList.remove("loading");
      if (btnText) btnText.style.display = "inline";
      if (btnArrow) btnArrow.style.display = "block";
      if (btnLoader) btnLoader.style.display = "none";
    }
  });

  if (emailField) emailField.addEventListener("input", () => setError("group-email", false));
  if (senhaField) senhaField.addEventListener("input", () => setError("group-senha", false));
}


/* ─────────────────────────────────────────────────────────────────────────────
   ─── CORE DO PAINEL ADMINISTRATIVO (PRODUTOS & ASSISTENTES) ─────────────────
   ───────────────────────────────────────────────────────────────────────────── */

let escopoGaleriaAtivo = 'adicionar'; 
let produtoIdParaDeletar = null;

document.addEventListener("DOMContentLoaded", () => {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const d = new Date();
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = d.toLocaleDateString('pt-BR', opts);
    }

    carregarProdutosDoBackend();
});

function carregarProdutosDoBackend() {
    const divDados = document.getElementById('dados-produtos-backend');
    const grade = document.getElementById('prod-grade');
    
    if (!divDados || !grade) return; 

    try {
        const produtos = JSON.parse(divDados.getAttribute('data-produtos') || "[]");
        grade.innerHTML = ""; 

        if (produtos.length === 0) {
            grade.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
                    Nenhum produto cadastrado no momento. ＋ Adicione o primeiro!
                </div>`;
            return;
        }

        produtos.forEach(prod => {
            const statusBadge = prod.disponivel 
                ? '<span class="status-tag disponivel">Disponível</span>' 
                : '<span class="status-tag indisponivel">Indisponível</span>';

            const card = document.createElement('div');
            card.className = 'prod-card';
            card.innerHTML = `
                <div class="prod-card-capa">
                    <img src="${prod.imagem_url || '/static/assets/Camisa malha branca.svg'}" alt="${prod.nome}">
                    ${statusBadge}
                </div>
                <div class="prod-card-corpo">
                    <h3 class="prod-card-titulo">${prod.nome}</h3>
                    <div class="prod-card-detalhes">
                        <span class="prod-card-preco">R$ ${Number(prod.preco).toFixed(2).replace('.', ',')}</span>
                        ${prod.tamanho ? `<span class="prod-card-tamanho">Tam: ${prod.tamanho}</span>` : ''}
                    </div>
                    <div class="prod-card-acoes">
                        <button class="btn-acao-editar" onclick="abrirModalEditar(${JSON.stringify(prod).replace(/"/g, '&quot;')})">✏️ Editar</button>
                        <button class="btn-acao-deletar" onclick="abrirModalDeletar(${prod.id}, '${prod.nome}')">🗑️ Excluir</button>
                    </div>
                </div>
            `;
            grade.appendChild(card);
        });
    } catch (e) {
        console.error("Erro no processamento dos produtos:", e);
        grade.innerHTML = `<div style="grid-column: 1/-1; color: #ff5555;">Erro ao renderizar dados locais.</div>`;
    }
}

/* ─── CONTROLE DE JANELAS MODAIS ────────────────────────── */
function abrirModalAdicionar() {
    document.getElementById('modal-adicionar').classList.add('active');
}

function abrirModalEditar(prod) {
    document.getElementById('edit-id').value = prod.id;
    document.getElementById('edit-nome').value = prod.nome;
    document.getElementById('edit-preco').value = prod.preco;
    
    if (document.getElementById('edit-quantidade')) {
        document.getElementById('edit-quantidade').value = prod.quantidade || 0;
    }
    
    document.getElementById('edit-categoria-id').value = prod.categoria_id || "";
    document.getElementById('edit-tamanho').value = prod.tamanho || "";
    document.getElementById('edit-disponivel').value = prod.disponivel ? "1" : "0";
    
    document.getElementById('img-selecionada-editar').value = prod.imagem_url;
    document.getElementById('preview-img-editar').src = prod.imagem_url || '/static/assets/Camisa malha branca.svg';

    document.getElementById('modal-editar').classList.add('active');
}

function abrirModalDeletar(id, nome) {
    produtoIdParaDeletar = id;
    document.getElementById('deletar-nome-produto').textContent = `"${nome}"`;
    document.getElementById('modal-deletar').classList.add('active');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('active');
}

/* ─── ENVIOS PARA A API DO FASTAPI (/ADMIN/PRODUTOS) ─────── */
async function salvarProduto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const payload = {
        nome: formData.get('nome'),
        preco: parseFloat(formData.get('preco')),
        tamanho: formData.get('tamanho') || "",
        disponivel: parseInt(formData.get('disponivel')),
        categoria_id: formData.get('categoria_id') ? parseInt(formData.get('categoria_id')) : null,
        imagem_url: formData.get('imagem_url')
    };

    try {
        const response = await fetch('/admin/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) window.location.reload();
        else alert("Erro ao criar produto.");
    } catch (err) {
        alert("Erro na conexão com o servidor.");
    }
}

async function atualizarProduto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('id');

    const payload = {
        nome: formData.get('nome'),
        preco: parseFloat(formData.get('preco')),
        tamanho: formData.get('tamanho') || "",
        disponivel: parseInt(formData.get('disponivel')),
        categoria_id: formData.get('categoria_id') ? parseInt(formData.get('categoria_id')) : null,
        imagem_url: formData.get('imagem_url')
    };

    try {
        const response = await fetch(`/admin/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) window.location.reload();
        else alert("Erro ao atualizar dados.");
    } catch (err) {
        alert("Erro na requisição.");
    }
}

async function confirmarDelecao() {
    if (!produtoIdParaDeletar) return;

    try {
        const response = await fetch(`/admin/produtos/${produtoIdParaDeletar}`, {
            method: 'DELETE'
        });

        if (response.ok) window.location.reload();
        else alert("Não foi possível remover o produto.");
    } catch (err) {
        alert("Erro de conexão.");
    }
}

/* ─── SELETOR DE IMAGENS DA GALERIA DO CATÁLOGO ──────────── */
async function abrirGaleriaGlobal(escopo) {
    escopoGaleriaAtivo = escopo; 
    const grid = document.getElementById('galeria-grid-dinamico');
    if (!grid) return;

    grid.innerHTML = "<p style='color:rgba(255,255,255,0.5); text-align:center;'>Buscando mídias...</p>";
    document.getElementById('modal-galeria-midia').classList.add('active');

    try {
        const response = await fetch('/admin/assets/imagens'); 
        const dados = await response.json();

        grid.innerHTML = "";
        if (!dados.imagens || dados.imagens.length === 0) {
            grid.innerHTML = "<p style='color:rgba(255,255,255,0.4); text-align:center; grid-column:1/-1;'>Nenhum asset encontrado.</p>";
            return;
        }

        dados.imagens.forEach(url => {
            const item = document.createElement('div');
            item.className = 'galeria-item-opcao';
            item.innerHTML = `<img src="${url}" alt="Asset"><div class="check-overlay">✓</div>`;
            item.onclick = () => selecionarItemGaleria(item, url);
            grid.appendChild(item);
        });
    } catch (e) {
        grid.innerHTML = "<p style='color:#ff5555; text-align:center;'>Erro ao abrir galeria.</p>";
    }
}

let urlImagemSelecionadaTemporaria = null;
function selecionarItemGaleria(elemento, url) {
    document.querySelectorAll('.galeria-item-opcao').forEach(el => el.classList.remove('selected'));
    elemento.classList.add('selected');
    urlImagemSelecionadaTemporaria = url;
}

function confirmarEscolhaGaleria() {
    if (!urlImagemSelecionadaTemporaria) {
        fecharModal('modal-galeria-midia');
        return;
    }

    if (escopoGaleriaAtivo === 'adicionar') {
        document.getElementById('img-selecionada-adicionar').value = urlImagemSelecionadaTemporaria;
        document.getElementById('preview-img-adicionar').src = urlImagemSelecionadaTemporaria;
    } else if (escopoGaleriaAtivo === 'editar') {
        document.getElementById('img-selecionada-editar').value = urlImagemSelecionadaTemporaria;
        document.getElementById('preview-img-editar').src = urlImagemSelecionadaTemporaria;
    }

    fecharModal('modal-galeria-midia');
}

async function enviarVenda(event) {
    event.preventDefault();
    
    const inputComprador = document.getElementById('comprador');
    const selectProduto = document.getElementById('produto_id');
    const inputQuantidade = document.getElementById('quantidade');

    if (!selectProduto || selectProduto.value === "") {
        alert("Por favor, selecione um produto válido.");
        return;
    }

    const opcaoSelecionada = selectProduto.options[selectProduto.selectedIndex];
    const precoUnitario = parseFloat(opcaoSelecionada.getAttribute('data-preco')) || 0;
    
    const quantidadeValida = parseInt(inputQuantidade.value) || 1;
    const totalCalculado = precoUnitario * quantidadeValida;

    const payload = {
        comprador: inputComprador.value.trim(),
        produto_id: parseInt(selectProduto.value), 
        quantidade: quantidadeValida,              
        preco_total: totalCalculado                
    };

    try {
        const response = await fetch('/admin/vendas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            const errData = await response.json();
            alert("Erro ao registrar venda: " + JSON.stringify(errData.detail));
        }
    } catch (err) {
        alert("Falha de rede ao registrar venda.");
    }
}


/* ─────────────────────────────────────────────────────────────────────────────
   ─── BLOCO NOVO: GERENCIAMENTO DE FORNECEDORES (AJAX / REST) ─────────────────
   ───────────────────────────────────────────────────────────────────────────── */

async function salvarFornecedor(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const payload = {
        nome_fantasia: formData.get('nome_fantasia'),
        cnpj: formData.get('cnpj'),
        telefone: formData.get('telefone'),
        email: formData.get('email') || null,
        localidade: formData.get('localidade'),
        nome_contato: formData.get('nome_contato') || null
    };

    try {
        const response = await fetch('/admin/fornecedores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const erro = await response.json();
            alert("Erro ao salvar: " + (erro.detail || "Verifique os dados enviados."));
        }
    } catch (err) {
        alert("Erro na conexão com o servidor.");
    }
}

async function atualizarFornecedor(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('id');

    const payload = {
        nome_fantasia: formData.get('nome_fantasia'),
        cnpj: formData.get('cnpj'),
        telefone: formData.get('telefone'),
        email: formData.get('email') || null,
        localidade: formData.get('localidade'),
        nome_contato: formData.get('nome_contato') || null
    };

    try {
        const response = await fetch(`/admin/fornecedores/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const erro = await response.json();
            alert("Erro ao atualizar: " + (erro.detail || "Erro inesperado."));
        }
    } catch (err) {
        alert("Erro ao atualizar dados.");
    }
}

async function deletarFornecedor(id) {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;

    try {
        const response = await fetch(`/admin/fornecedores/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Fornecedor removido com sucesso!");
            window.location.reload();
        } else {
            const erro = await response.json();
            alert("Erro ao remover: " + (erro.detail || "Operação inválida."));
        }
    } catch (err) {
        alert("Falha de rede ao tentar remover.");
    }
}