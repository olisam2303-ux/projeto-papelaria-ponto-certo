// Funcionamento do guia: navegação, progresso, testes rápidos, validação e comprovante.
(function () {
  const T = window.T;
  const ETAPAS = window.montarGuia();
  const TOTAL = ETAPAS.length;
  const CHAVE = "papelaria_ponto_certo_v1";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = T.esc;

  // ---------- progresso salvo no navegador ----------
  function ler() {
    try { return Object.assign({ aluno: { nome: "", turma: "" }, etapas: {}, passos: {} }, JSON.parse(localStorage.getItem(CHAVE) || "{}")); }
    catch (e) { return { aluno: { nome: "", turma: "" }, etapas: {}, passos: {} }; }
  }
  let estado = ler();
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* navegador sem armazenamento */ } }
  const concluida = (n) => !!(estado.etapas[n] && estado.etapas[n].codigo);
  // próxima etapa: a seguinte à última concluída (quem começou no 2º bimestre não volta para a Etapa 0)
  const proxima = () => { let ult = -1; for (let n = 0; n < TOTAL; n++) if (concluida(n)) ult = n; return Math.min(ult + 1, TOTAL - 1); };
  const BIMESTRES = [
    { b: 1, nome: "1º bimestre · O Caixa", semanas: "Semanas 01 a 07", pdf: "Apostila_Guia_Papelaria_Ponto_Certo_1bim.pdf" },
    { b: 2, nome: "2º bimestre · O Caixa que repete", semanas: "Semanas 08 a 14", pdf: "Apostila_Guia_Papelaria_Ponto_Certo_2bim.pdf" },
    { b: 3, nome: "3º bimestre · O Fechamento do dia", semanas: "Semanas 15 a 20", pdf: "Apostila_Guia_Papelaria_Ponto_Certo_3bim.pdf" },
  ];
  const bimDe = (n) => (n <= 7 ? 1 : n <= 14 ? 2 : 3);

  // ---------- código de conclusão (idêntico ao do verificar.py) ----------
  const ESPACOS = new Set([" ", "\t", "\r", "\n", "\f", "\v", " ", "﻿"]);
  function limparCodigo(fonte) {
    let saida = "";
    for (const linha of fonte.replace(/\r\n?/g, "\n").split("\n")) {
      let aspa = null;
      for (const ch of linha) {
        if (aspa) { if (ch === aspa) aspa = null; saida += ch; }
        else if (ch === "'" || ch === '"') { aspa = ch; saida += ch; }
        else if (ch === "#") break;
        else saida += ch;
      }
    }
    return [...saida].filter((c) => !ESPACOS.has(c)).join("");
  }
  function codigoConclusao(etapa, fonte) {
    // fonte: o texto do programa, ou uma lista de textos (etapas com mais de um arquivo)
    const limpo = Array.isArray(fonte) ? fonte.map((f) => limparCodigo(f.replace(/^﻿/, ""))).join("|") : limparCodigo(fonte.replace(/^﻿/, ""));
    const bytes = new TextEncoder().encode("PPC|" + etapa + "|" + limpo);
    let h = 0x811c9dc5;
    for (const b of bytes) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
    const x = h.toString(16).toUpperCase().padStart(8, "0");
    return "E" + etapa + "-" + x.slice(0, 4) + "-" + x.slice(4);
  }
  window.codigoConclusao = codigoConclusao; // usado nos testes automáticos

  // ---------- partes comuns ----------
  function statusDe(n) {
    if (concluida(n)) return '<span class="status feito">✓ Concluída</span>';
    if (n === proxima()) return '<span class="status agora">Fazer agora</span>';
    return '<span class="status depois">A fazer</span>';
  }
  function barra() {
    const feitas = ETAPAS.filter((e) => concluida(e.n)).length;
    return `<div class="barra-progresso" aria-label="progresso"><span style="width:${(100 * feitas) / TOTAL}%"></span></div><div class="pequeno">${feitas} de ${TOTAL} etapas concluídas</div>`;
  }
  function quizHTML(n, q, i) {
    return `<div class="quiz" data-quiz="${n}-${i}"><div class="perg">${i + 1}. ${q.p}</div><div class="ops">${q.ops
      .map((o, j) => `<button class="op" data-certa="${j === q.certa ? 1 : 0}">${String.fromCharCode(65 + j)}) ${esc(o)}</button>`).join("")}</div>
      <div class="expl"></div><template>${q.expl}</template></div>`;
  }
  function testes(n) {
    const partes = window.KIT[n].saida.split(/^(---- Teste \d+ - .*?) -*$/m);
    let h = "";
    for (let i = 1; i < partes.length; i += 2) {
      h += `<details class="saida"${i === 1 ? " open" : ""}><summary>${esc(partes[i].replace("---- ", ""))}</summary><pre class="codigo">${esc(partes[i + 1].replace(/^\n/, "").replace(/\n+$/, ""))}</pre></details>`;
    }
    return h;
  }

  // ---------- página inicial ----------
  function paginaInicio() {
    const p = proxima();
    const t7 = window.KIT[7].saida.split(/^---- Teste \d+ - .*$/m)[2] || "";
    const tela = t7.replace(/^\n/, "").split("\n").slice(2).filter(Boolean);
    return `
    <section class="capa">
      <div>
        <span class="etiqueta">Lógica de Programação · 1º, 2º e 3º bimestres</span>
        <h1>Projeto Papelaria Ponto Certo</h1>
        <p class="sub">Uma etapa por semana, você constrói em Python o <b>caixa de uma papelaria</b>. No 1º bimestre nasce o <b>Caixa v1</b> (uma venda com decisões); no 2º, o <b>Caixa v2</b> (várias compras, listas, matriz e funções); no 3º, o <b>Caixa v3</b> (o fechamento do dia, com testes, textos e arquivos).</p>
        ${barra()}
        <a class="botao" href="#etapa-${p}">${p > 0 ? "Continuar: Etapa " + p : "Começar pela Etapa 0"} →</a>
        ${BIMESTRES.map((x) => `<a class="botao sec" href="${x.pdf}" target="_blank" rel="noopener">📄 Apostila ${x.b}º bim.</a>`).join(" ")}
        <a class="botao sec" href="#ajuda">Problemas comuns</a>
      </div>
      <div>${T.terminal(tela.slice(0, 30), "O Caixa v1, no fim do 1º bimestre (uma venda com PIX).")}</div>
    </section>

    <h2>Como cada etapa funciona</h2>
    <p>Toda etapa tem <b>3 abas</b>, sempre na mesma ordem:</p>
    <div class="ciclo">
      <div><b>📘 Teoria</b>O conteúdo da semana explicado com exemplos da papelaria, pseudocódigo e Python lado a lado, e um teste rápido.</div>
      <div><b>🛠 Prática</b>O passo a passo, com as telas do VS Code: abrir o arquivo, completar as lacunas, salvar e rodar.</div>
      <div><b>✅ Conferir</b>Rodar o verificador até aparecer PARABÉNS e o código de conclusão.</div>
      <div><b>📄 Entregar</b>Colar o código no guia e gerar o comprovante em PDF para entregar ao professor.</div>
    </div>
    ${T.caixa("info", "Funciona sem internet", "<p>Este guia, os programas e os verificadores ficam todos na pasta <b>papelaria-ponto-certo</b>. Depois de copiar a pasta para o computador, nada precisa de internet. Só é preciso ter o <b>VS Code</b> e o <b>Python</b> instalados.</p>" +
      (location.protocol === "file:" ? "" : `<p><a class="botao" href="Instalar_Papelaria_Ponto_Certo.exe" download>⬇ Instalador para Windows (.exe)</a> <a class="botao sec" href="papelaria-ponto-certo.zip" download>⬇ Pasta do projeto (.zip)</a></p><p class="pequeno">Baixe uma vez só (ou pegue no pen drive do professor) e siga a Etapa 0. O instalador copia tudo para Documentos e cria um atalho do guia; o .zip é a alternativa se o computador bloquear programas.</p>`))}

    <h2>As etapas</h2>
    ${BIMESTRES.map((x) => `<h3>${x.nome} <span class="pequeno">(${x.semanas})</span></h3><div class="mapa">${ETAPAS.filter((e) => bimDe(e.n) === x.b).map((e) => `<a class="etapa-card" href="#etapa-${e.n}">${statusDe(e.n)}<div class="num">Etapa ${e.n} · ${e.semana}</div><h3>${esc(e.titulo)}</h3><p>${e.resumo}</p></a>`).join("")}</div>`).join("")}

    <h2>Seus dados</h2>
    <div class="cartao"><p>Eles aparecem no comprovante de cada etapa. Ficam guardados só neste navegador.</p>
      <div class="duas-col"><div><label class="campo" for="nomeAluno">Nome completo</label><input class="txt" id="nomeAluno" value="${esc(estado.aluno.nome)}" autocomplete="name"></div>
      <div><label class="campo" for="turmaAluno">Turma</label><input class="txt" id="turmaAluno" value="${esc(estado.aluno.turma)}" placeholder="ex.: 1º C"></div></div>
    </div>`;
  }

  // ---------- página da etapa ----------
  function paginaEtapa(n, aba) {
    const e = ETAPAS[n];
    if (!e) return paginaInicio();
    aba = ["teoria", "pratica", "entregar"].includes(aba) ? aba : "teoria";
    const anteriorPendente = n > 0 && !concluida(n - 1);
    const abas = [["teoria", "📘 Teoria", 1], ["pratica", "🛠 Prática passo a passo", 2], ["entregar", "✅ Conferir e entregar", 3]]
      .map(([id, rot, k]) => `<a class="aba${aba === id ? " ativa" : ""}" href="#etapa-${n}/${id}"><span class="n">${k}</span>${rot}</a>`).join("");
    let corpo = "";
    if (aba === "teoria") {
      corpo = `<div class="caixa info" style="margin-top:20px"><span class="caixa-titulo">Nesta etapa você vai aprender a</span><ul style="margin:4px 0 0">${e.objetivos.map((o) => `<li>${o}</li>`).join("")}</ul></div>
        ${e.teoria}
        <h2>Teste rápido</h2><p>Responda antes de ir para a prática. Se errar, leia a explicação e volte na parte da teoria correspondente.</p>
        ${e.quiz.map((q, i) => quizHTML(n, q, i)).join("")}
        <div class="nav-etapas"><span></span><a class="botao" href="#etapa-${n}/pratica">Ir para a Prática →</a></div>`;
    } else if (aba === "pratica") {
      corpo = `<p style="margin-top:20px">Siga os passos <b>na ordem</b>. Ao terminar cada um, marque <b>Feito</b>.</p>` +
        e.pratica.map((p, i) => {
          const id = `${n}-${i}`;
          const feito = !!estado.passos[id];
          return `<section class="passo${feito ? " feito" : ""}" id="passo-${id}"><div class="passo-cab"><div class="passo-num"><span>${i + 1}</span></div><h3>${p.titulo}</h3>
            <label class="marcar"><input type="checkbox" data-passo="${id}"${feito ? " checked" : ""}> Feito</label></div><div class="passo-corpo">${p.html}</div></section>`;
        }).join("") +
        `<div class="nav-etapas"><a class="botao sec" href="#etapa-${n}/teoria">← Teoria</a><a class="botao" href="#etapa-${n}/entregar">Conferir e entregar →</a></div>`;
    } else {
      corpo = paginaEntregar(n);
    }
    const aviso = anteriorPendente && aba !== "teoria"
      ? T.caixa("atencao", `A Etapa ${n - 1} ainda não foi concluída neste navegador`, `<div class="aviso-ordem"><span>O ideal é seguir a ordem. Se você já fez a Etapa ${n - 1} em outro computador, ou se o professor pediu para pular, pode continuar normalmente: o arquivo desta etapa já começa com as anteriores prontas.</span><a class="botao sec" href="#etapa-${n - 1}">Ir para a Etapa ${n - 1}</a></div>`)
      : "";
    return `
      <div class="cab-etapa"><div class="grande">${n}</div><div style="flex:1;min-width:260px">
        <div class="chips"><span class="chip">${e.semana}</span><span class="chip">Apostila: ${e.tema}</span><span class="chip">Pasta: ${T.pastaDe(n)}</span>${concluida(n) ? '<span class="chip" style="background:#e9f7ee;color:#15803d">✓ Concluída</span>' : ""}</div>
        <h1>${esc(e.titulo)}</h1><p class="sub" style="color:#5b6271;margin:0">${e.resumo}</p></div></div>
      ${aviso}
      <nav class="abas">${abas}</nav>
      <div class="painel">${corpo}</div>
      <div class="nav-etapas">${n > 0 ? `<a class="botao sec" href="#etapa-${n - 1}">← Etapa ${n - 1}</a>` : "<span></span>"}${n < TOTAL - 1 ? `<a class="botao sec" href="#etapa-${n + 1}">Etapa ${n + 1} →</a>` : `<a class="botao sec" href="#inicio">Início</a>`}</div>`;
  }

  function paginaEntregar(n) {
    const e = ETAPAS[n];
    const reg = estado.etapas[n] || {};
    const arq = window.KIT[n].arquivo;
    return `
      <h2>1. Confira com o verificador</h2>
      <p>No terminal do VS Code, rode o verificador desta etapa e corrija até aparecer <b>PARABÉNS</b>:</p>
      ${T.cmd(`python ${T.pastaDe(n)}/verificar.py`)}
      <p class="pequeno">Se no seu computador funciona <code>py</code>, use <code>py ${T.pastaDe(n)}/verificar.py</code>.</p>

      <h2>2. Compare com a saída esperada</h2>
      <p>É o mesmo conteúdo do arquivo <code>${T.pastaDe(n)}/saida-esperada.txt</code>. Rode <code>python ${T.pastaDe(n)}/${arq}</code>, digite os valores de um teste e veja se o seu terminal fica igual.</p>
      ${testes(n)}

      <h2>3. Entregue</h2>
      ${reg.codigo ? T.caixa("ok", `Etapa ${n} validada em ${esc(reg.data || "")}`, `<p>Código <b>${esc(reg.codigo)}</b>. Você pode gerar o comprovante de novo quando quiser, ou validar outra vez se mudar o programa.</p>`) : ""}
      <form class="cartao" id="formEntrega" autocomplete="off">
        <div class="duas-col"><div><label class="campo" for="fNome">Nome completo</label><input class="txt" id="fNome" required value="${esc(estado.aluno.nome)}"></div>
        <div><label class="campo" for="fTurma">Turma</label><input class="txt" id="fTurma" required value="${esc(estado.aluno.turma)}"></div></div>
        ${arquivosDe(n).map((a, i) => `<label class="campo" for="fPrograma${i}">Cole aqui o seu ${esc(a)} inteiro</label>
        <p class="pequeno" style="margin:0 0 6px">No VS Code, clique dentro do arquivo <b>${esc(a)}</b>, aperte <kbd>Ctrl</kbd>+<kbd>A</kbd> (seleciona tudo) e <kbd>Ctrl</kbd>+<kbd>C</kbd> (copia). Aqui, clique na caixa e aperte <kbd>Ctrl</kbd>+<kbd>V</kbd>.</p>
        <textarea class="txt mono" id="fPrograma${i}" data-programa="${i}" required spellcheck="false">${esc(programasDe(reg)[i] || "")}</textarea>`).join("")}
        <label class="campo" for="fCodigo">Código de conclusão mostrado pelo verificador</label>
        <input class="txt" id="fCodigo" required placeholder="E${n}-XXXX-XXXX" value="${esc(reg.codigo || "")}" style="font-family:var(--mono);max-width:260px;text-transform:uppercase">
        <label class="campo" for="fReflexao">Em 2 a 4 linhas: o que você aprendeu nesta etapa?</label>
        <textarea class="txt" id="fReflexao" required minlength="40" rows="3" placeholder="Escreva com as suas palavras. Ex.: para que serve o comando novo e um cuidado que você precisou ter.">${esc(reg.reflexao || "")}</textarea>
        <button class="botao" type="submit">Validar minha etapa</button>
        <div id="resultado" aria-live="polite"></div>
      </form>
      <div id="areaPdf"${reg.codigo ? "" : ' style="display:none"'}>
        <h2>4. Gere o comprovante em PDF</h2>
        <button class="botao laranja" id="btnPdf" type="button">📄 Gerar comprovante (PDF)</button>
        ${T.imprimir()}
        <p>Entregue o PDF do jeito que o professor pedir (AVA, Central de Entregas ou outro).</p>
      </div>
      ${e.fim || ""}`;
  }

  const arquivosDe = (n) => (window.KIT[n].arquivos ? window.KIT[n].arquivos.map((x) => x.nome) : [window.KIT[n].arquivo]);
  const programasDe = (reg) => (reg.programas ? reg.programas : reg.programa ? [reg.programa] : []);

  // ---------- comprovante ----------
  function montarComprovante(n) {
    const reg = estado.etapas[n];
    const e = ETAPAS[n];
    $("#comprovante").innerHTML = `
      <h1>Comprovante · Etapa ${n}: ${esc(e.titulo)}</h1>
      <div>Projeto Papelaria Ponto Certo · Lógica de Programação · ${bimDe(n)}º bimestre · ${esc(e.semana)}</div>
      <div class="linha-dados"><div><b>Aluno(a):</b> ${esc(reg.nome)}</div><div><b>Turma:</b> ${esc(reg.turma)}</div>
      <div><b>Validado em:</b> ${esc(reg.data)}</div><div><b>Código de conclusão:</b> ${esc(reg.codigo)}</div></div>
      <div class="selo">✓ Programa aprovado pelo verificador da Etapa ${n}</div>
      <div class="bloco"><h3>O que aprendi</h3><p>${esc(reg.reflexao).replace(/\n/g, "<br>")}</p></div>
      ${arquivosDe(n).map((a, i) => `<div class="bloco"><h3>Programa entregue (${esc(a)})</h3><pre>${esc(programasDe(reg)[i] || "")}</pre></div>`).join("")}`;
  }

  // ---------- roteamento ----------
  function rota() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ""));
    const m = h.match(/^etapa-(\d+)(?:\/(\w+))?/);
    let html, ativo = "inicio";
    if (m) { html = paginaEtapa(Number(m[1]), m[2]); ativo = "etapas"; document.title = `Etapa ${m[1]} · Papelaria Ponto Certo`; }
    else if (h === "ajuda") { html = window.ajudaHTML(); ativo = "ajuda"; document.title = "Problemas comuns · Papelaria Ponto Certo"; }
    else { html = paginaInicio(); document.title = "Projeto Papelaria Ponto Certo"; }
    $("main").innerHTML = html;
    document.querySelectorAll(".topo nav a").forEach((a) => a.classList.toggle("ativo", a.dataset.nav === ativo));
    $("#linkEtapaAtual").href = "#etapa-" + proxima();
    window.scrollTo(0, 0);
  }

  // ---------- eventos ----------
  document.addEventListener("click", (ev) => {
    const op = ev.target.closest(".quiz button.op");
    if (op) {
      const q = op.closest(".quiz");
      if (q.classList.contains("respondido")) return;
      q.classList.add("respondido");
      const certa = op.dataset.certa === "1";
      op.classList.add(certa ? "certa" : "errada");
      q.querySelectorAll("button.op").forEach((b) => { if (b.dataset.certa === "1") b.classList.add("certa"); });
      q.querySelector(".expl").innerHTML = T.caixa(certa ? "ok" : "erro", certa ? "Certo!" : "Ainda não.", `<p>${q.querySelector("template").innerHTML}</p>`);
      return;
    }
    const cp = ev.target.closest("button.copiar");
    if (cp) {
      const texto = cp.dataset.copiar;
      const ok = () => { cp.textContent = "Copiado ✓"; setTimeout(() => (cp.textContent = "Copiar"), 1500); };
      const reserva = () => { const t = document.createElement("textarea"); t.value = texto; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); ok(); } catch (e) {} t.remove(); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(ok, reserva); else reserva();
      return;
    }
    if (ev.target.id === "btnPdf") {
      const m = location.hash.match(/etapa-(\d+)/);
      if (m && estado.etapas[m[1]]) { montarComprovante(Number(m[1])); window.print(); }
    }
  });
  document.addEventListener("change", (ev) => {
    const c = ev.target.closest("input[data-passo]");
    if (c) {
      estado.passos[c.dataset.passo] = c.checked; salvar();
      c.closest(".passo").classList.toggle("feito", c.checked);
    }
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.id === "nomeAluno" || ev.target.id === "fNome") { estado.aluno.nome = ev.target.value; salvar(); }
    if (ev.target.id === "turmaAluno" || ev.target.id === "fTurma") { estado.aluno.turma = ev.target.value; salvar(); }
  });
  document.addEventListener("submit", (ev) => {
    if (ev.target.id !== "formEntrega") return;
    ev.preventDefault();
    const n = Number(location.hash.match(/etapa-(\d+)/)[1]);
    const nome = $("#fNome").value.trim(), turma = $("#fTurma").value.trim();
    const programas = [...document.querySelectorAll("textarea[data-programa]")].map((t) => t.value);
    const programa = programas.join("\n"), reflexao = $("#fReflexao").value.trim();
    const digitado = $("#fCodigo").value.trim().toUpperCase().replace(/\s+/g, "");
    const res = $("#resultado");
    const erro = (t, h) => { res.innerHTML = T.caixa("erro", t, h); };
    if (programas.some((p) => !p.trim())) return erro(programas.length > 1 ? "Falta colar um dos arquivos." : "Falta colar o programa.", "");
    if (programa.includes("___")) return erro("O programa colado ainda tem lacuna ___.", "<p>Complete, salve, rode o verificador e copie de novo.</p>");
    const m = digitado.match(/^E(\d+)-[0-9A-F]{4}-[0-9A-F]{4}$/);
    if (!m) return erro("O código de conclusão está incompleto.", `<p>Ele tem este formato: <b>E${n}-XXXX-XXXX</b> (letra E, número da etapa, e dois grupos de 4 letras ou números). Copie direto do terminal.</p>`);
    if (Number(m[1]) !== n) return erro(`Este código é da Etapa ${m[1]}, não da Etapa ${n}.`, `<p>Rode <code>python ${T.pastaDe(n)}/verificar.py</code> e use o código que ele mostrar.</p>`);
    if (codigoConclusao(n, programas.length > 1 ? programas : programas[0]) !== digitado) {
      return erro("O código não combina com o programa colado.", `<ul><li>Você mudou o programa <b>depois</b> de rodar o verificador? Salve, rode o verificador de novo e copie o código novo.</li><li>Colou o arquivo <b>inteiro</b> (<kbd>Ctrl</kbd>+<kbd>A</kbd> antes de <kbd>Ctrl</kbd>+<kbd>C</kbd>)? E o arquivo é o da pasta <b>${T.pastaDe(n)}</b>?</li><li>Confira se digitou o código sem trocar letras (ex.: 0 e O, 8 e B).</li></ul>`);
    }
    const agora = new Date();
    estado.aluno = { nome, turma };
    estado.etapas[n] = { codigo: digitado, programa, programas, reflexao, nome, turma, data: agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    salvar();
    rota();
    const r2 = $("#resultado");
    if (r2) r2.innerHTML = T.caixa("ok", `Etapa ${n} validada! ✓`, `<p>Agora gere o comprovante em PDF (abaixo) e entregue.${n < TOTAL - 1 ? ` Depois, siga para a <a href="#etapa-${n + 1}">Etapa ${n + 1}</a>.` : ""}</p>`);
    const area = $("#areaPdf"); if (area) area.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  window.addEventListener("hashchange", rota);
  window.addEventListener("storage", () => { estado = ler(); });
  rota();
})();
