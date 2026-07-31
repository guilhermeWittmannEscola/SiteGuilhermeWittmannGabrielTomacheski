/**
 * ============================================================
 * PEGADA HÍDRICA — script.js (criado do zero / refatorado)
 * ============================================================
 * Funcionalidades:
 * - Tema claro/escuro com localStorage + preferência do sistema
 * - Menu mobile (hamburger) com ARIA
 * - Cabeçalho com efeito ao rolar
 * - Botão "voltar ao topo"
 * - Animações de entrada (IntersectionObserver)
 * - Contadores animados no hero
 * - Calculadora com validação e estimativa educativa
 * - Quiz interativo com pontuação e revisão
 * - Desafios com progresso em localStorage
 * - Accordion acessível
 * - Estatísticas vinculadas à calculadora
 * - Toast de feedback
 * ============================================================
 */

(() => {
    "use strict";
  
    /* ---------- Helpers ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  
    const STORAGE = {
      theme: "ph-theme",
      challenges: "ph-challenges",
      lastCalc: "ph-last-calc",
    };
  
    function toast(msg, duration = 2800) {
      const el = $("#toast");
      if (!el) return;
      el.textContent = msg;
      el.classList.add("is-visible");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => el.classList.remove("is-visible"), duration);
    }
  
    function formatNumber(n) {
      return Math.round(n).toLocaleString("pt-BR");
    }
  
    /* ---------- Tema claro / escuro ---------- */
    function initTheme() {
      const toggle = $("#themeToggle");
      const icon = $("#themeIcon");
      const root = document.documentElement;
  
      const saved = localStorage.getItem(STORAGE.theme);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = saved || (prefersDark ? "dark" : "light");
  
      applyTheme(initial);
  
      toggle?.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(STORAGE.theme, next);
        toast(next === "dark" ? "Modo escuro ativado" : "Modo claro ativado");
      });
  
      function applyTheme(mode) {
        if (mode === "dark") {
          root.setAttribute("data-theme", "dark");
          if (icon) icon.textContent = "☀️";
        } else {
          root.removeAttribute("data-theme");
          if (icon) icon.textContent = "🌙";
        }
      }
    }
  
    /* ---------- Menu mobile ---------- */
    function initNav() {
      const hamburger = $("#hamburger");
      const nav = $("#nav");
      const links = $$(".nav__link");
  
      hamburger?.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        hamburger.classList.toggle("is-open", open);
        hamburger.setAttribute("aria-expanded", String(open));
        hamburger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu de navegação");
        document.body.style.overflow = open ? "hidden" : "";
      });
  
      links.forEach((link) => {
        link.addEventListener("click", () => {
          nav?.classList.remove("is-open");
          hamburger?.classList.remove("is-open");
          hamburger?.setAttribute("aria-expanded", "false");
          hamburger?.setAttribute("aria-label", "Abrir menu de navegação");
          document.body.style.overflow = "";
        });
      });
  
      // Fecha ao clicar fora (mobile)
      document.addEventListener("click", (e) => {
        if (!nav?.classList.contains("is-open")) return;
        if (nav.contains(e.target) || hamburger?.contains(e.target)) return;
        nav.classList.remove("is-open");
        hamburger?.classList.remove("is-open");
        hamburger?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    }
  
    /* ---------- Cabeçalho ao rolar + link ativo ---------- */
    function initHeaderScroll() {
      const header = $("#header");
      const sections = $$("main section[id]");
      const links = $$(".nav__link");
  
      const onScroll = () => {
        const y = window.scrollY;
        header?.classList.toggle("is-scrolled", y > 20);
  
        // Link ativo pela seção visível
        let current = "";
        sections.forEach((sec) => {
          const top = sec.offsetTop - 100;
          if (y >= top) current = sec.id;
        });
        links.forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === `#${current}`);
        });
      };
  
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  
    /* ---------- Voltar ao topo ---------- */
    function initBackToTop() {
      const btn = $("#backToTop");
      if (!btn) return;
  
      window.addEventListener(
        "scroll",
        () => {
          const show = window.scrollY > 500;
          btn.hidden = !show;
          btn.classList.toggle("is-visible", show);
        },
        { passive: true }
      );
  
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  
    /* ---------- Reveal ao rolar + contadores ---------- */
    function initRevealAndCounters() {
      const reveals = $$(".reveal");
      const counters = $$("[data-counter]");
  
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => revealObs.observe(el));
  
      // Contadores do hero (uma vez)
      let countersDone = false;
      const counterObs = new IntersectionObserver(
        (entries) => {
          if (countersDone) return;
          if (entries.some((e) => e.isIntersecting)) {
            countersDone = true;
            counters.forEach((el) => animateCounter(el));
            counterObs.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      const heroStats = $(".hero__stats");
      if (heroStats) counterObs.observe(heroStats);
  
      function animateCounter(el) {
        const target = Number(el.dataset.counter) || 0;
        const duration = 1600;
        const start = performance.now();
  
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = Math.round(target * eased);
          el.textContent = formatNumber(value);
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
    }
  
    /* ---------- Accordion acessível ---------- */
    function initAccordion() {
      const items = $$(".accordion__item");
  
      items.forEach((item) => {
        const btn = item.querySelector(".accordion__header");
        const panel = item.querySelector(".accordion__panel");
        if (!btn || !panel) return;
  
        btn.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
  
          // Fecha os outros (comportamento accordion clássico)
          items.forEach((other) => {
            if (other === item) return;
            other.classList.remove("is-open");
            const otherBtn = other.querySelector(".accordion__header");
            const otherPanel = other.querySelector(".accordion__panel");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
            if (otherPanel) {
              otherPanel.hidden = true;
              otherPanel.style.maxHeight = null;
            }
          });
  
          if (isOpen) {
            item.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
            panel.hidden = true;
            panel.style.maxHeight = null;
          } else {
            item.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
            panel.hidden = false;
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      });
    }
  
    /* ---------- Calculadora ---------- */
    /**
     * Estimativa educativa semanal por pessoa.
     * Constantes aproximadas (literatura / médias educativas):
     * - Chuveiro: ~9 L/min
     * - Carne: ~2.500 L por refeição com carne (hambúrguer-like)
     * - Roupa: 2.700 L / peça (camiseta) amortizado
     * - Lavagem de carro: ~200 L (quando feita em casa)
     * - Reutilização: desconto de 12% no total
     * - Uso doméstico base (louça, descarga etc.): ~350 L/semana/pessoa
     */
    const CALC_CONST = {
      litersPerMinuteShower: 9,
      meatMealLiters: 2500,
      clothesItemLiters: 2700,
      carWashLiters: 200,
      domesticBaseWeekly: 350,
      reuseDiscount: 0.12,
    };
  
    function initCalculator() {
      const form = $("#calculatorForm");
      if (!form) return;
  
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        runCalculation();
      });
  
      // Limpa erro ao digitar
      $$("input[type=number]", form).forEach((input) => {
        input.addEventListener("input", () => {
          input.classList.remove("is-invalid");
          const err = $(`#err-${input.id}`);
          if (err) err.textContent = "";
        });
      });
    }
  
    function validateForm() {
      const fields = [
        { id: "banhosPorDia", min: 0, max: 10, label: "banhos por dia" },
        { id: "duracaoBanho", min: 0, max: 120, label: "duração do banho" },
        { id: "consumoCarne", min: 0, max: 21, label: "consumo de carne" },
        { id: "roupasPorMes", min: 0, max: 50, label: "roupas por mês" },
        { id: "pessoasResidencia", min: 1, max: 20, label: "pessoas na residência" },
      ];
  
      let ok = true;
      fields.forEach(({ id, min, max, label }) => {
        const input = $(`#${id}`);
        const err = $(`#err-${id}`);
        const val = input?.value.trim();
        input?.classList.remove("is-invalid");
        if (err) err.textContent = "";
  
        if (val === "" || val === null) {
          ok = false;
          input?.classList.add("is-invalid");
          if (err) err.textContent = `Informe ${label}.`;
          return;
        }
        const num = Number(val);
        if (Number.isNaN(num) || num < min || num > max) {
          ok = false;
          input?.classList.add("is-invalid");
          if (err) err.textContent = `Valor entre ${min} e ${max}.`;
        }
      });
      return ok;
    }
  
    function runCalculation() {
      const banhos = Number($("#banhosPorDia").value);
      const minutos = Number($("#duracaoBanho").value);
      const carne = Number($("#consumoCarne").value);
      const roupas = Number($("#roupasPorMes").value);
      const pessoas = Number($("#pessoasResidencia").value);
      const lavaCarro = formValue("lavaCarro") === "sim";
      const reutiliza = formValue("reutilizaAgua") === "sim";
  
      // Componentes semanais (totais da casa, depois per capita)
      const banhoWeekly = banhos * minutos * CALC_CONST.litersPerMinuteShower * 7;
      const carneWeekly = carne * CALC_CONST.meatMealLiters;
      const roupasWeekly = (roupas * CALC_CONST.clothesItemLiters) / 4.3; // mês ≈ 4,3 semanas
      const carroWeekly = lavaCarro ? CALC_CONST.carWashLiters / 2 : 0; // ~2 lavagens/mês
      const domestic = CALC_CONST.domesticBaseWeekly * pessoas;
  
      let totalWeeklyHouse =
        banhoWeekly * pessoas + // cada pessoa toma banho
        carneWeekly + // consumo de carne já é "por pessoa" no formulário → escala
        roupasWeekly +
        carroWeekly +
        domestic;
  
      // Carne e roupas no form são por pessoa; ajustamos
      totalWeeklyHouse =
        banhoWeekly * pessoas +
        carneWeekly * pessoas +
        roupasWeekly * pessoas +
        carroWeekly +
        domestic;
  
      if (reutiliza) totalWeeklyHouse *= 1 - CALC_CONST.reuseDiscount;
  
      const perPerson = totalWeeklyHouse / pessoas;
  
      // UI: progresso → resultado
      showProgressThenResult(perPerson, {
        banhos,
        minutos,
        carne,
        roupas,
        lavaCarro,
        reutiliza,
      });
    }
  
    function formValue(name) {
      const el = document.querySelector(`input[name="${name}"]:checked`);
      return el ? el.value : "nao";
    }
  
    function showProgressThenResult(liters, habits) {
      const progressWrap = $("#progressWrap");
      const progressFill = $("#progressFill");
      const progressBar = $("#progressBar");
      const resultCard = $("#resultCard");
      const placeholder = $("#resultPlaceholder");
  
      placeholder.hidden = true;
      resultCard.hidden = true;
      progressWrap.hidden = false;
      progressFill.style.width = "0%";
  
      let pct = 0;
      const step = () => {
        pct += 4 + Math.random() * 6;
        if (pct >= 100) {
          pct = 100;
          progressFill.style.width = "100%";
          if (progressBar) progressBar.setAttribute("aria-valuenow", "100");
          setTimeout(() => {
            progressWrap.hidden = true;
            displayResult(liters, habits);
          }, 200);
          return;
        }
        progressFill.style.width = pct + "%";
        if (progressBar) progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  
    function displayResult(liters, habits) {
      const resultCard = $("#resultCard");
      const badge = $("#resultBadge");
      const litersEl = $("#resultLiters");
      const message = $("#resultMessage");
      const tipsList = $("#resultTips");
      const waterLevel = $("#waterLevel");
  
      resultCard.hidden = false;
  
      // Nível: baixo < 8000 | médio 8000–16000 | alto > 16000 (L/semana/pessoa, educativo)
      let level, badgeText, msg;
      if (liters < 8000) {
        level = "low";
        badgeText = "🟢 Baixa";
        msg = "Sua estimativa está abaixo da média educativa. Continue com bons hábitos e refine ainda mais o consumo indireto.";
      } else if (liters < 16000) {
        level = "mid";
        badgeText = "🟡 Moderada";
        msg = "Há espaço para melhorar. Pequenos ajustes no banho, na alimentação e nas compras já reduzem a pegada.";
      } else {
        level = "high";
        badgeText = "🔴 Alta";
        msg = "Sua estimativa está elevada. Priorize reduzir o tempo de banho, o consumo de carne e compras impulsivas de roupa.";
      }
  
      badge.textContent = badgeText;
      message.textContent = msg;
  
      // Animação do número
      animateValue(litersEl, 0, liters, 900);
  
      // Copo d'água (altura máx. ~120)
      const fillRatio = Math.min(1, liters / 22000);
      const h = Math.round(fillRatio * 120);
      if (waterLevel) {
        waterLevel.setAttribute("y", String(130 - h));
        waterLevel.setAttribute("height", String(h));
      }
  
      // Dicas personalizadas
      const tips = buildTips(habits, level);
      tipsList.innerHTML = tips.map((t) => `<li>${t}</li>`).join("");
  
      // Salva e atualiza estatísticas
      const payload = {
        liters: Math.round(liters),
        level,
        ts: Date.now(),
      };
      localStorage.setItem(STORAGE.lastCalc, JSON.stringify(payload));
      updateStats(payload);
  
      toast("Cálculo concluído!");
    }
  
    function buildTips(habits, level) {
      const tips = [];
      if (habits.minutos > 8) {
        tips.push("Reduza o banho para cerca de 5–7 minutos e feche o registro ao ensaboar.");
      }
      if (habits.banhos > 1) {
        tips.push("Avalie se todos os banhos do dia são necessários; um banho eficiente já costuma bastar.");
      }
      if (habits.carne >= 5) {
        tips.push("Experimente dias sem carne ou troque parte das refeições por opções vegetais — a pegada cai bastante.");
      }
      if (habits.roupas >= 3) {
        tips.push("Prefira qualidade a quantidade: cada peça de algodão “carrega” milhares de litros de água virtual.");
      }
      if (habits.lavaCarro) {
        tips.push("Lave o carro em postos com reúso de água ou use balde em vez de mangueira aberta.");
      }
      if (!habits.reutiliza) {
        tips.push("Reutilize água da máquina de lavar ou do banho para regar plantas e limpar áreas externas.");
      }
      if (tips.length < 2) {
        tips.push("Considere captar água da chuva para usos não potáveis.");
        tips.push("Feche a torneira ao escovar os dentes e ao ensaboar a louça.");
      }
      if (level === "high") {
        tips.push("Revise vazamentos: uma torneira pingando pode desperdiçar dezenas de litros por dia.");
      }
      return tips.slice(0, 4);
    }
  
    function animateValue(el, from, to, duration) {
      const start = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = formatNumber(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  
    /* ---------- Estatísticas ---------- */
    function initStats() {
      try {
        const raw = localStorage.getItem(STORAGE.lastCalc);
        if (raw) {
          const data = JSON.parse(raw);
          if (data && typeof data.liters === "number") updateStats(data);
        }
      } catch {
        /* ignore */
      }
    }
  
    function updateStats(data) {
      const empty = $("#statsEmpty");
      const bars = $("#statsBars");
      const subtitle = $("#statsSubtitle");
  
      if (!data || typeof data.liters !== "number") return;
  
      empty.hidden = true;
      bars.hidden = false;
  
      const consumo = data.liters;
      // Economia potencial educativa: ~25% com hábitos conscientes
      const economia = Math.round(consumo * 0.25);
      // Referência média educativa
      const media = 12000;
  
      $("#statConsumo").textContent = formatNumber(consumo) + " L";
      $("#statEconomia").textContent = formatNumber(economia) + " L";
      $("#statMedia").textContent = formatNumber(media) + " L";
  
      if (subtitle) {
        subtitle.textContent =
          "Comparação educativa da sua última estimativa semanal por pessoa com uma referência média e o potencial de economia.";
      }
  
      // Barras proporcionais ao maior valor
      const max = Math.max(consumo, economia, media, 1);
      requestAnimationFrame(() => {
        $("#barConsumo").style.width = (consumo / max) * 100 + "%";
        $("#barEconomia").style.width = (economia / max) * 100 + "%";
        $("#barMedia").style.width = (media / max) * 100 + "%";
      });
    }
  
    /* ---------- Quiz ---------- */
    const QUIZ_DATA = [
      {
        q: "Qual setor consome a maior parte da água doce retirada no mundo?",
        options: ["Indústria", "Uso doméstico", "Agricultura", "Geração de energia"],
        correct: 2,
        explain: "A agricultura responde por cerca de 70% das retiradas de água doce.",
      },
      {
        q: "Aproximadamente quantos litros de água são necessários para produzir 1 kg de carne bovina (média global)?",
        options: ["Cerca de 1.500 L", "Cerca de 5.000 L", "Cerca de 15.400 L", "Cerca de 50.000 L"],
        correct: 2,
        explain: "Médias da Water Footprint Network apontam cerca de 15.400 L por kg de carne bovina.",
      },
      {
        q: "O que é “água virtual”?",
        options: [
          "Água mineral engarrafada",
          "Água usada na produção de um bem, mas que não aparece no produto final",
          "Água de chuva não captada",
          "Água desalinhada de reuso industrial",
        ],
        correct: 1,
        explain: "Água virtual (ou água embutida) é o volume empregado ao longo da cadeia produtiva.",
      },
      {
        q: "Quanto da água do planeta é doce e facilmente acessível para consumo?",
        options: ["Cerca de 10%", "Cerca de 3%", "Menos de 1%", "Cerca de 25%"],
        correct: 2,
        explain: "Cerca de 97% é salgada; da doce, a maior parte está em geleiras. Menos de 1% é facilmente acessível.",
      },
      {
        q: "Qual atitude reduz de forma mais significativa a pegada hídrica pessoal?",
        options: [
          "Tomar banho 30 segundos mais rápido",
          "Reduzir o consumo de produtos de origem animal e de algodão",
          "Desligar a luz ao sair do cômodo",
          "Usar apenas água gelada na louça",
        ],
        correct: 1,
        explain: "O consumo indireto (alimentação e vestuário) costuma dominar a pegada hídrica individual.",
      },
    ];
  
    function initQuiz() {
      const app = $("#quizApp");
      if (!app) return;
  
      let index = 0;
      let score = 0;
      let selected = null;
      const answers = [];
  
      const qEl = $("#quizQuestion");
      const optEl = $("#quizOptions");
      const nextBtn = $("#quizNextBtn");
      const progressText = $("#quizProgressText");
      const progressFill = $("#quizProgressFill");
      const resultBox = $("#quizResult");
      const restartBtn = $("#quizRestartBtn");
  
      function render() {
        resultBox.hidden = true;
        qEl.hidden = false;
        optEl.hidden = false;
        nextBtn.hidden = false;
        nextBtn.disabled = true;
        selected = null;
  
        const item = QUIZ_DATA[index];
        qEl.textContent = item.q;
        progressText.textContent = `Pergunta ${index + 1} de ${QUIZ_DATA.length}`;
        progressFill.style.width = ((index + 1) / QUIZ_DATA.length) * 100 + "%";
  
        optEl.innerHTML = "";
        item.options.forEach((text, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "quiz__option";
          btn.textContent = text;
          btn.addEventListener("click", () => selectOption(i, btn));
          optEl.appendChild(btn);
        });
      }
  
      function selectOption(i, btn) {
        if (selected !== null) return;
        selected = i;
        $$(".quiz__option", optEl).forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        nextBtn.disabled = false;
      }
  
      nextBtn.addEventListener("click", () => {
        if (selected === null) return;
        const item = QUIZ_DATA[index];
        const correct = selected === item.correct;
        if (correct) score++;
        answers.push({ index, selected, correct, explain: item.explain, q: item.q });
  
        // Feedback visual rápido
        const buttons = $$(".quiz__option", optEl);
        buttons.forEach((b, i) => {
          b.disabled = true;
          if (i === item.correct) b.classList.add("is-correct");
          if (i === selected && !correct) b.classList.add("is-wrong");
        });
  
        setTimeout(() => {
          index++;
          if (index >= QUIZ_DATA.length) showResult();
          else render();
        }, 650);
      });
  
      function showResult() {
        qEl.hidden = true;
        optEl.hidden = true;
        nextBtn.hidden = true;
        resultBox.hidden = false;
  
        const title = $("#quizScoreTitle");
        const msg = $("#quizScoreMessage");
        const review = $("#quizReview");
  
        title.textContent = `Você acertou ${score} de ${QUIZ_DATA.length}`;
        if (score === QUIZ_DATA.length) {
          msg.textContent = "Excelente! Você domina os conceitos de consumo consciente de água.";
        } else if (score >= 3) {
          msg.textContent = "Bom resultado! Revise os pontos abaixo para consolidar o conhecimento.";
        } else {
          msg.textContent = "Vale a pena revisitar as seções do site e tentar de novo.";
        }
  
        review.innerHTML = answers
          .map(
            (a) =>
              `<li class="${a.correct ? "is-correct" : "is-wrong"}">${a.q}<br><small>${a.explain}</small></li>`
          )
          .join("");
      }
  
      restartBtn?.addEventListener("click", () => {
        index = 0;
        score = 0;
        answers.length = 0;
        render();
      });
  
      render();
    }
  
    /* ---------- Desafios ---------- */
    const CHALLENGES = [
      { id: "banho5", icon: "🚿", text: "Tomar banhos de no máximo 5–7 minutos" },
      { id: "torneira", icon: "🪥", text: "Fechar a torneira ao escovar os dentes" },
      { id: "carne", icon: "🥗", text: "Ter pelo menos 1 dia sem carne por semana" },
      { id: "roupa", icon: "👕", text: "Evitar compras impulsivas de roupa por 1 mês" },
      { id: "reuso", icon: "♻️", text: "Reutilizar água da máquina ou do banho" },
      { id: "vazamento", icon: "🔧", text: "Verificar e reparar vazamentos em casa" },
    ];
  
    function initChallenges() {
      const list = $("#challengeList");
      if (!list) return;
  
      let done = loadChallenges();
  
      function render() {
        list.innerHTML = "";
        CHALLENGES.forEach((ch) => {
          const isDone = done.includes(ch.id);
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "challenge-item" + (isDone ? " is-done" : "");
          btn.setAttribute("aria-pressed", String(isDone));
          btn.innerHTML = `
            <span class="challenge-item__icon" aria-hidden="true">${ch.icon}</span>
            <span class="challenge-item__text">${ch.text}</span>
            <span class="challenge-item__check" aria-hidden="true">${isDone ? "✓" : ""}</span>
          `;
          btn.addEventListener("click", () => toggle(ch.id));
          li.appendChild(btn);
          list.appendChild(li);
        });
        updateProgress();
      }
  
      function toggle(id) {
        if (done.includes(id)) {
          done = done.filter((x) => x !== id);
        } else {
          done.push(id);
          toast("Desafio marcado! 💧");
        }
        localStorage.setItem(STORAGE.challenges, JSON.stringify(done));
        render();
      }
  
      function updateProgress() {
        const n = done.length;
        const total = CHALLENGES.length;
        const pct = (n / total) * 100;
        const text = $("#challengeProgressText");
        const fill = $("#challengeProgressFill");
        if (text) text.textContent = `${n} de ${total} concluídos`;
        if (fill) fill.style.width = pct + "%";
      }
  
      render();
    }
  
    function loadChallenges() {
      try {
        const raw = localStorage.getItem(STORAGE.challenges);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    }
  
    /* ---------- Init ---------- */
    function init() {
      initTheme();
      initNav();
      initHeaderScroll();
      initBackToTop();
      initRevealAndCounters();
      initAccordion();
      initCalculator();
      initQuiz();
      initChallenges();
      initStats();
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
  
  