/* ─── REGISTRO SEGURO DE PLUGINS ──────────────────────── */
// Verifica se os plugins existem antes de registrá-los para não travar o script
const pluginsToRegister = [];
if (typeof ScrollTrigger !== "undefined") pluginsToRegister.push(ScrollTrigger);
if (typeof ScrollSmoother !== "undefined") pluginsToRegister.push(ScrollSmoother);
if (typeof SplitText !== "undefined") pluginsToRegister.push(SplitText);

if (pluginsToRegister.length > 0) {
  gsap.registerPlugin(...pluginsToRegister);
}

/* ─── SCROLL SUAVE SEGURO ─────────────────────────────── */
// Só cria o scroll suave se o plugin pago estiver carregado e o container existir
if (typeof ScrollSmoother !== "undefined" && document.getElementById("smooth-wrapper")) {
  const smoother = ScrollSmoother.create({
    smooth: 1.2,
    effects: true,
  });
}

/* ─── ANIMAÇÕES HERO ─────────────────────────────────── */
// Garante que as animações rodem se os elementos existirem na tela atual
if (document.querySelector(".hero")) {
  gsap.from(".hero", {
    opacity: 0,
    duration: 1.2,
    ease: "power2.out",
  });

  gsap.from(".hero-esquerda h1", {
    y: 80,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: "power3.out",
  });
}
/* ─── ANIMAÇÕES HERO ─────────────────────────────────── */
// entrada do hero inteiro
gsap.from(".hero", {
  opacity: 0,
  duration: 1.2,
  ease: "power2.out",
});

// titulo entra de baixo
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

// lado direito entra de baixo
gsap.from(".hero-direita", {
  y: 50,
  opacity: 0,
  duration: 0.9,
  delay: 0.4,
  ease: "power3.out",
});

// parallax no fundo do hero (data-speed já cuida via ScrollSmoother)
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

/* ─── ANIMAÇÕES CARDS ────────────────────────────────── */
gsap.from(".card", {
  opacity: 0,
  y: 60,
  filter: "blur(8px)",
  stagger: 0.2,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".cards",
    start: "top 80%",
    end: "top 40%",
    scrub: false,
  },
});

/* ─── ANIMAÇÕES NÚMEROS ──────────────────────────────── */
gsap.from(".sobre-item", {
  opacity: 0,
  y: 40,
  stagger: 0.15,
  duration: 0.7,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".secao-sobre",
    start: "top 75%",
  },
});

/* ─── SEÇÃO AGENDAR ──────────────────────────────────── */
gsap.from(".secao-agende h2", {
  opacity: 0,
  y: 50,
  duration: 0.9,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".secao-agende",
    start: "top 75%",
  },
});

gsap.from(".secao-agende .btn-primary", {
  opacity: 0,
  y: 30,
  duration: 0.7,
  delay: 0.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".secao-agende",
    start: "top 70%",
  },
});

/* ─── TÍTULO SECAO PRODUTOS ─────────────────────────── */
gsap.from(".titulo-secao h2", {
  opacity: 0,
  x: -40,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".titulo-secao",
    start: "top 80%",
  },
});

/* ─── FOOTER LOGO ────────────────────────────────────── */
gsap.from(".footer-logo h2", {
  opacity: 0,
  y: 40,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: "footer",
    start: "top 85%",
  },
});

/* ─── ANIMAÇÕES DE ENTRADA ───────────────────────────── */
gsap.from("header", {
  y: -30,
  opacity: 0,
  duration: 0.7,
  ease: "power3.out",
});

gsap.from(".login-left .eyebrow", {
  y: 30,
  opacity: 0,
  duration: 0.7,
  delay: 0.1,
  ease: "power3.out",
});

gsap.from(".login-left h1", {
  y: 60,
  opacity: 0,
  duration: 0.8,
  delay: 0.2,
  ease: "power3.out",
});

gsap.from(".login-desc, .divider, .login-bullets", {
  y: 30,
  opacity: 0,
  duration: 0.7,
  delay: 0.4,
  stagger: 0.12,
  ease: "power3.out",
});

gsap.from(".card-login", {
  x: 60,
  opacity: 0,
  duration: 0.9,
  delay: 0.3,
  ease: "power3.out",
});


/* ─── TOGGLE SENHA ───────────────────────────────────── */
// Usamos uma função autoinvocável para garantir o escopo isolado
(function() {
  const toggleBtn  = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha");
  const iconEye    = document.getElementById("icon-eye");
  const iconEyeOff = document.getElementById("icon-eye-off");

  if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Evita qualquer comportamento de submit indesejado
      
      const isHidden = senhaInput.type === "password";
      senhaInput.type   = isHidden ? "text" : "password";
      
      if (iconEye && iconEyeOff) {
        iconEye.style.display    = isHidden ? "none"  : "block";
        iconEyeOff.style.display = isHidden ? "block" : "none";
      }
    });
  }
})();

/* ─── VALIDAÇÃO ──────────────────────────────────────── */
function setError(groupId, show) {
  const group = document.getElementById(groupId);
  if (show) {
    group.classList.add("has-error");
  } else {
    group.classList.remove("has-error");
  }
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/* ─── SUBMIT CORRIGIDO ───────────────────────────────── */
const loginRoute = "/auth/login";
const dashboardRoute = "/dashboard";
const btnLogin = document.getElementById("btn-login");
const btnText   = document.getElementById("btn-text");
const btnLoader = document.getElementById("btn-loader");
const btnArrow  = document.getElementById("btn-arrow");
const emailField = document.getElementById("email");
const senhaField = document.getElementById("senha");

if (btnLogin && emailField && senhaField) {
  // O (e) foi adicionado aqui para capturar o evento de clique
  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault(); // <-- Bloqueia o navegador de recarregar a página bruto e dar erro

    const email = emailField.value.trim();
    const senha = senhaField.value;

    let ok = true;

    // Validação do E-mail
    if (!validarEmail(email)) {
      setError("group-email", true);
      ok = false;
      gsap.fromTo("#group-email", { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } else {
      setError("group-email", false);
    }

    // Validação da Senha
    if (senha.length < 1) {
      setError("group-senha", true);
      ok = false;
      gsap.fromTo("#group-senha", { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
    } else {
      setError("group-senha", false);
    }

    // Se houver erro de validação, para a execução aqui
    if (!ok) return;

    // Ativa o estado de carregamento visual no botão
    btnLogin.classList.add("loading");
    btnText.style.display   = "none";
    btnArrow.style.display  = "none";
    btnLoader.style.display = "flex";

    try {
      const formData = new FormData();
      // Chaves alteradas para corresponder exatamente ao que o seu main.py espera
      formData.append("email", email); 
      formData.append("senha", senha); 

      const response = await fetch(loginRoute, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Redireciona para o painel administrativo caso o login seja válido
        window.location.href = dashboardRoute;
        return;
      }

      const errorText = await response.text();
      alert(errorText || "E-mail ou senha incorretos.");
    } catch (error) {
      alert("Erro de conexão. Tente novamente mais tarde.");
    } finally {
      // Restaura o botão ao estado original caso falhe
      btnLogin.classList.remove("loading");
      btnText.style.display   = "inline";
      btnArrow.style.display  = "block";
      btnLoader.style.display = "none";
    }
  });

  /* ─── LIMPA ERRO AO DIGITAR ──────────────────────────── */
  emailField.addEventListener("input", () => setError("group-email", false));
  senhaField.addEventListener("input", () => setError("group-senha", false));
}

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa a data atual no cabeçalho
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const d = new Date();
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = d.toLocaleDateString('pt-BR', opts);
    }
});