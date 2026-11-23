// Desenha as "telas" do guia (VS Code, terminal, janelas do Windows) em HTML puro.
// Tudo local: nenhuma imagem ou fonte vem da internet.
(function () {
  const T = {};
  const PROMPT = "PS C:\\Users\\aluno\\Documents\\papelaria-ponto-certo>";
  T.PROMPT = PROMPT;

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  T.esc = esc;
  const marca = (n) => (n ? `<span class="marca">${n}</span>` : "");
  T.marca = marca;

  // ---------- realce de sintaxe Python (simples) ----------
  const KW = new Set(["if", "elif", "else", "and", "or", "not", "while", "for", "in", "def", "return", "True", "False", "None", "import", "from", "break"]);
  const FN = new Set(["print", "input", "int", "float", "str", "len", "range", "round"]);
  function realcarLinha(linha) {
    let out = "", i = 0;
    const n = linha.length;
    while (i < n) {
      const ch = linha[i];
      if (ch === "#") { out += `<span class="c">${esc(linha.slice(i))}</span>`; break; }
      if (ch === '"' || ch === "'" || ((ch === "f" || ch === "F") && (linha[i + 1] === '"' || linha[i + 1] === "'"))) {
        let j = i; if (ch === "f" || ch === "F") j++;
        const q = linha[j]; let k = j + 1;
        while (k < n && linha[k] !== q) k++;
        out += `<span class="s">${esc(linha.slice(i, k + 1))}</span>`; i = k + 1; continue;
      }
      if (linha.startsWith("___", i)) { out += `<span class="lac">___</span>`; i += 3; continue; }
      if (/[A-Za-z_À-ú]/.test(ch)) {
        let k = i; while (k < n && /[A-Za-z0-9_À-ú]/.test(linha[k])) k++;
        const w = linha.slice(i, k);
        out += KW.has(w) ? `<span class="k">${w}</span>` : FN.has(w) && linha[k] === "(" ? `<span class="f">${w}</span>` : esc(w);
        i = k; continue;
      }
      if (/[0-9]/.test(ch)) {
        let k = i; while (k < n && /[0-9.]/.test(linha[k])) k++;
        out += `<span class="num">${linha.slice(i, k)}</span>`; i = k; continue;
      }
      out += esc(ch); i++;
    }
    return out;
  }
  T.realcarLinha = realcarLinha;
  T.py = (codigo, claro) => `<pre class="codigo${claro ? " claro" : ""}">${codigo.replace(/\n$/, "").split("\n").map(realcarLinha).join("\n")}</pre>`;
  T.pseudo = (codigo) => {
    const kw = /\b(algoritmo|var|inicio|fimalgoritmo|se|entao|senao|fimse|leia|escreva|e|ou|nao|inteiro|real|caractere|logico)\b/g;
    return `<pre class="codigo claro">${codigo.replace(/\n$/, "").split("\n").map((l) => {
      const p = l.indexOf("//");
      const corpo = p >= 0 ? l.slice(0, p) : l, com = p >= 0 ? l.slice(p) : "";
      return esc(corpo).replace(/"[^"]*"/g, (m) => `<span class="s">${m}</span>`).replace(kw, '<span class="k">$1</span>') + (com ? `<span class="c">${esc(com)}</span>` : "");
    }).join("\n")}</pre>`;
  };
  T.compara = (pseudo, python, rotA = "Pseudocódigo (como na apostila)", rotB = "Python (como no VS Code)") =>
    `<div class="lado-a-lado"><div><div class="rot">${rotA}</div>${T.pseudo(pseudo)}</div><div><div class="rot">${rotB}</div>${T.py(python, true)}</div></div>`;

  // ---------- terminal ----------
  function linhaTerminal(l) {
    if (l.startsWith("$ ")) return `<span class="pr">${esc(PROMPT)} </span><span class="cmd">${esc(l.slice(2))}</span>`;
    if (l === "$") return `<span class="pr">${esc(PROMPT)} </span><span class="cursor"></span>`;
    let h = esc(l);
    h = h.replace(/⟦(.*?)⟧/g, '<span class="dig">$1</span>');
    h = h.replace(/\[ OK \]/g, '<span class="ok">[ OK ]</span>').replace(/\[FALHOU\]/g, '<span class="er">[FALHOU]</span>');
    if (/^\s*DICA:/.test(l) || /^\s{8}\S/.test(l) && !/^\s+\|/.test(l)) h = `<span class="di">${h}</span>`;
    if (/PARABÉNS|CÓDIGO DE CONCLUSÃO/.test(l)) h = `<span class="ok">${h}</span>`;
    if (/^(SyntaxError|NameError|ValueError|TypeError)/.test(l) || /não é reconhecido/.test(l)) h = `<span class="er">${h}</span>`;
    if (/^Ainda não foi desta vez/.test(l)) h = `<span class="am">${h}</span>`;
    return h;
  }
  T.terminalHTML = (linhas) => linhas.map(linhaTerminal).join("\n");

  // ---------- VS Code ----------
  const MENUS = {
    Arquivo: [["Novo Arquivo de Texto", "Ctrl+N"], ["Nova Janela", "Ctrl+Shift+N"], "-", ["Abrir Arquivo...", "Ctrl+O"], ["Abrir Pasta...", "Ctrl+K Ctrl+O"], ["Abrir Recente", "›"], "-", ["Salvar", "Ctrl+S"], ["Salvar como...", "Ctrl+Shift+S"], ["Salvar Tudo", ""], "-", ["Salvamento Automático", ""], "-", ["Sair", ""]],
    Terminal: [["Novo Terminal", ""], ["Dividir Terminal", ""], "-", ["Executar Tarefa...", ""], ["Executar Tarefa de Build...", "Ctrl+Shift+B"]],
  };
  const NOMES_MENU = ["Arquivo", "Editar", "Seleção", "Ver", "Acessar", "Executar", "Terminal", "Ajuda"];

  function arvore(op) {
    const itens = [];
    const pasta = (nome, aberta, mk) => `<div class="vsc-item" style="padding-left:${16}px"><span class="ic">${aberta ? "⌄" : "›"}</span>${esc(nome)}${marca(mk)}</div>`;
    for (let n = 0; n <= 7; n++) {
      const nome = "etapa-0" + n;
      const aberta = op.etapa === n;
      itens.push(pasta(nome, aberta, aberta ? op.marcas.pasta : null));
      if (aberta) {
        const arqs = n === 0 ? ["ola.py", "saida-esperada.txt", "verificar.py"] : ["papelaria.py", "saida-esperada.txt", "verificar.py"];
        for (const a of arqs) {
          const sel = op.arquivoSel === a;
          const ic = a.endsWith(".py") ? '<span class="ic py">py</span>' : '<span class="ic txt">≡</span>';
          itens.push(`<div class="vsc-item${sel ? " sel" : ""}" style="padding-left:34px">${ic}${esc(a)}${sel ? marca(op.marcas.arquivo) : ""}</div>`);
        }
      }
    }
    itens.push(pasta("guia", false));
    itens.push(`<div class="vsc-item" style="padding-left:30px"><span class="ic" style="color:#e37933">&lt;&gt;</span>index.html</div>`);
    itens.push(`<div class="vsc-item" style="padding-left:30px"><span class="ic txt">≡</span>LEIA-ME.txt</div>`);
    return itens.join("");
  }

  function editor(op) {
    const kit = window.KIT && window.KIT[op.etapa];
    let texto = op.codigo != null ? op.codigo : kit ? kit.inicio : "";
    const linhas = texto.replace(/\n$/, "").split("\n");
    let [a, b] = op.linhas || [1, Math.min(linhas.length, 14)];
    if (typeof a === "string") a = T.linhaDe(op.etapa, a);
    if (typeof b === "string") b = T.linhaDe(op.etapa, b);
    a = Math.max(1, a); b = Math.min(linhas.length, b);
    const realce = new Set(op.realce === "lacunas" ? linhas.map((l, i) => (l.includes("___") ? i + 1 : 0)).filter(Boolean) : op.realce || []);
    let h = a > 1 ? `<div class="vsc-reticencias">⋯</div>` : "";
    for (let i = a; i <= b; i++) {
      h += `<div class="vsc-linha${realce.has(i) ? " realce" : ""}"><span class="nl">${i}</span><span>${realcarLinha(linhas[i - 1])}</span></div>`;
    }
    if (b < linhas.length) h += `<div class="vsc-reticencias">⋯</div>`;
    return h;
  }

  T.vscode = function (opcoes) {
    const op = Object.assign({ marcas: {}, pastaAberta: true, arquivoSel: null, aberto: false, terminal: null, menu: null }, opcoes);
    const arq = op.arquivoSel || (op.etapa === 0 ? "ola.py" : "papelaria.py");
    const titulo = op.pastaAberta ? (op.aberto ? `${arq} - papelaria-ponto-certo - Visual Studio Code` : "papelaria-ponto-certo - Visual Studio Code") : "Visual Studio Code";
    let menus = NOMES_MENU.map((m) => `<span class="vsc-menu${op.menu === m ? " aberto" : ""}">${m}${op.menu === m ? marca(op.marcas.menu) : ""}</span>`).join("");
    let drop = "";
    if (op.menu && MENUS[op.menu]) {
      const esquerda = { Arquivo: 32, Terminal: 380 }[op.menu] || 40;
      drop = `<div class="vsc-drop" style="left:${esquerda}px">` + MENUS[op.menu].map((it) => it === "-" ? "<hr>" :
        `<div class="${it[0] === op.item ? "sel" : ""}"><span>${it[0]}${it[0] === op.item ? marca(op.marcas.item) : ""}</span><span class="atalho">${it[1]}</span></div>`).join("") + "</div>";
    }
    const lateral = op.pastaAberta
      ? `<div class="vsc-lateral"><div class="vsc-lateral-tit">EXPLORADOR${marca(op.marcas.explorador)}</div><div class="vsc-pasta">⌄ PAPELARIA-PONTO-CERTO</div>${arvore(op)}</div>`
      : `<div class="vsc-lateral"><div class="vsc-lateral-tit">EXPLORADOR</div><div style="padding:10px 18px;color:#bbb">Você não abriu uma pasta.<div style="margin-top:10px;background:#0e639c;color:#fff;text-align:center;padding:5px;border-radius:3px">Abrir Pasta</div></div></div>`;
    let principal;
    if (op.aberto) {
      principal = `<div class="vsc-abas"><div class="vsc-aba on">${esc(arq)}${marca(op.marcas.aba)} ${op.sujo ? '<span class="ponto" title="não salvo"></span>' : '<span class="x">×</span>'}</div></div><div class="vsc-editor">${editor(op)}</div>`;
    } else {
      principal = `<div class="vsc-vazio">${op.pastaAberta ? "Clique num arquivo do EXPLORADOR para abri-lo." : "Bem-vindo"}</div>`;
    }
    let painel = "";
    if (op.terminal) {
      painel = `<div class="vsc-painel"><div class="vsc-painel-abas"><span>PROBLEMAS</span><span>SAÍDA</span><span>CONSOLE DE DEPURAÇÃO</span><span class="on">TERMINAL${marca(op.marcas.terminal)}</span><span style="margin-left:auto">powershell</span></div><div class="vsc-term">${T.terminalHTML(op.terminal)}</div></div>`;
    }
    return `<div class="tela"><div class="vsc">
      <div class="vsc-titulo"><span class="vsc-icone"></span>${menus}<span class="vsc-nome">${esc(titulo)}</span><span class="vsc-janela">─ ☐ ✕</span>${drop}</div>
      <div class="vsc-corpo"${op.menu ? ' style="min-height:400px"' : ""}><div class="vsc-ativ"><i class="on"></i><i></i><i></i><i></i></div>${lateral}<div class="vsc-principal">${principal}${painel}</div></div>
      <div class="vsc-status"><span>⊗ 0 ⚠ 0</span><span class="dir"><span>UTF-8</span><span>CRLF</span><span>${op.aberto ? "Python" : ""}</span></span></div>
    </div>${op.legenda ? `<p class="tela-legenda">${op.legenda}</p>` : ""}</div>`;
  };

  T.terminal = (linhas, legenda) => `<div class="tela"><div class="vsc"><div class="vsc-painel" style="border:0"><div class="vsc-painel-abas"><span>PROBLEMAS</span><span>SAÍDA</span><span class="on">TERMINAL</span><span style="margin-left:auto">powershell</span></div><div class="vsc-term">${T.terminalHTML(linhas)}</div></div></div>${legenda ? `<p class="tela-legenda">${legenda}</p>` : ""}</div>`;

  T.confianca = () => `<div class="tela"><div class="dialogo-fundo"><div class="dialogo">
      <h4><span class="escudo"></span>Você confia nos autores dos arquivos nesta pasta?</h4>
      <p>O código fornecido será executado. Se você não confiar nos autores, o VS Code abrirá no modo restrito.</p>
      <label>☑ Confiar nos autores de todos os arquivos na pasta pai</label>
      <div class="botoes"><span class="b pri">Sim, confio nos autores${marca(1)}</span><span class="b">Não, não confio nos autores</span></div>
    </div></div><p class="tela-legenda">O texto pode variar um pouco conforme a versão. O botão certo é sempre o azul: <b>Sim, confio nos autores</b> (em inglês: <i>Yes, I trust the authors</i>).</p></div>`;

  T.seletorPasta = () => `<div class="tela"><div class="win">
      <div class="win-tit"><span>Abrir Pasta</span><span>✕</span></div>
      <div class="win-barra"><span>← → ↑</span><span class="win-end">Este Computador › Documentos</span></div>
      <div class="win-corpo"><div class="win-lado"><div>Área de Trabalho</div><div>Downloads</div><div><b>Documentos</b></div><div>Pen drive (E:)</div></div>
      <div class="win-lista"><div><span class="win-pasta"></span>Outras pastas</div><div class="sel"><span class="win-pasta"></span>papelaria-ponto-certo${marca(1)}</div></div></div>
      <div class="win-rodape"><span style="margin-right:auto">Pasta: papelaria-ponto-certo</span><span class="win-b pri">Selecionar pasta${marca(2)}</span><span class="win-b">Cancelar</span></div>
    </div><p class="tela-legenda">Clique <b>uma vez</b> na pasta <b>papelaria-ponto-certo</b> <span class="marca">1</span> e depois em <b>Selecionar pasta</b> <span class="marca">2</span>. Não entre nas subpastas.</p></div>`;

  T.extrair = () => `<div class="tela"><div class="win">
      <div class="win-tit"><span>Downloads</span><span>─ ☐ ✕</span></div>
      <div class="win-corpo" style="min-height:190px"><div class="win-lado"><div>Área de Trabalho</div><div><b>Downloads</b></div><div>Documentos</div></div>
      <div class="win-lista"><div class="sel"><span class="win-zip"></span>papelaria-ponto-certo.zip${marca(1)}</div>
      <div class="win-menu"><div>Abrir</div><div class="sel">Extrair Tudo...${marca(2)}</div><div>Compartilhar</div><div>Copiar como caminho</div><div>Propriedades</div></div></div></div>
    </div><p class="tela-legenda">Clique com o botão <b>direito</b> no arquivo .zip <span class="marca">1</span> e escolha <b>Extrair Tudo...</b> <span class="marca">2</span>. No Windows 11, se não aparecer, clique antes em <b>Mostrar mais opções</b>.</p></div>`;

  T.imprimir = () => `<div class="tela"><div class="win">
      <div class="win-tit"><span>Imprimir</span><span>✕</span></div>
      <div style="padding:14px 16px;display:grid;grid-template-columns:120px 1fr;gap:10px 12px;align-items:center">
        <span>Destino</span><span class="win-end" style="display:flex;justify-content:space-between">Salvar como PDF ⌄ ${marca(1)}</span>
        <span>Páginas</span><span class="win-end">Todas</span>
        <span>Layout</span><span class="win-end">Retrato</span>
      </div>
      <div class="win-rodape"><span class="win-b pri">Salvar${marca(2)}</span><span class="win-b">Cancelar</span></div>
    </div><p class="tela-legenda">Em <b>Destino</b>, escolha <b>Salvar como PDF</b> <span class="marca">1</span> (não escolha uma impressora) e clique em <b>Salvar</b> <span class="marca">2</span>.</p></div>`;

  // número da linha do arquivo inicial da etapa que contém um trecho
  T.linhaDe = (etapa, trecho) => {
    const k = window.KIT && window.KIT[etapa];
    if (!k) return 1;
    const i = k.inicio.split("\n").findIndex((l) => l.includes(trecho));
    return i >= 0 ? i + 1 : 1;
  };

  // caixas de texto
  T.caixa = (tipo, titulo, html) => `<div class="caixa ${tipo}">${titulo ? `<span class="caixa-titulo">${titulo}</span>` : ""}${html}</div>`;
  T.dica = (titulo, html, classe = "") => `<details class="dica ${classe}"><summary>${titulo}</summary>${html}</details>`;
  T.cmd = (c) => `<div class="cmd-linha" style="display:flex;gap:8px;align-items:center;margin:8px 0"><pre class="codigo" style="flex:1;padding:10px 14px">${esc(c)}</pre><button class="botao sec copiar" data-copiar="${esc(c)}" style="margin:0">Copiar</button></div>`;

  window.T = T;
})();
