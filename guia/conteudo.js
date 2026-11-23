// Conteúdo das etapas do 1º bimestre: TEORIA (separada) + PRÁTICA passo a passo.
// Os códigos mostrados vêm de dados-gerados.js (gerado pelo build a partir dos arquivos reais do kit).
window.montarGuia = function () {
  const { py, compara, caixa, dica, cmd, vscode, terminal, linhaDe, esc } = window.T;
  const K = window.KIT;

  // ---------- testes (lidos da saída esperada gerada) ----------
  function testesDe(n) {
    const txt = K[n].saida;
    const partes = txt.split(/^---- Teste (\d+) - (.*?) -*$/m);
    const lista = [];
    for (let i = 1; i < partes.length; i += 3) {
      const corpo = partes[i + 2].replace(/^\n/, "").split("\n");
      const ent = corpo[0].replace("Valores digitados: ", "").split(" / ").map((x) => (x === "(só Enter)" ? "" : x));
      const linhas = corpo.slice(2).filter((l, j, arr) => !(j === arr.length - 1 && l === ""));
      while (linhas.length && linhas[linhas.length - 1] === "") linhas.pop();
      lista.push({ num: Number(partes[i]), nome: partes[i + 1], entradas: ent, linhas });
    }
    return lista;
  }
  // marca no terminal o que o aluno digita
  function transcricao(n, t) {
    const fila = t.entradas.filter((e) => e !== "");
    return t.linhas.map((l) => {
      if (fila.length && l.includes(":") && l.endsWith(": " + fila[0])) {
        const v = fila.shift();
        return l.slice(0, l.length - v.length) + "⟦" + v + "⟧";
      }
      return l;
    });
  }
  const arquivoDe = (n) => K[n].arquivo;
  const tituloKit = (n) => K[n].saida.split("\n")[0].replace(/^SAÍDA ESPERADA - ETAPA \d+: /, "");
  const pasta = (n) => "etapa-0" + n;

  // ---------- fluxogramas (SVG) ----------
  function fluxo(passos, largura = 740) {
    const cx = 350; let y = 10; let svg = "";
    const txt = (x, yy, t, peso = 400) => `<text x="${x}" y="${yy}" text-anchor="middle" font-size="13" font-weight="${peso}" fill="#1f2430">${esc(t)}</text>`;
    const forma = (tipo, x, yy, w, h, t) => {
      let s = "";
      if (tipo === "ini" || tipo === "fim") s = `<rect x="${x - w / 2}" y="${yy}" width="${w}" height="${h}" rx="${h / 2}" fill="#e6f4f2" stroke="#0f766e" stroke-width="2"/>`;
      else if (tipo === "es") s = `<polygon points="${x - w / 2 + 14},${yy} ${x + w / 2},${yy} ${x + w / 2 - 14},${yy + h} ${x - w / 2},${yy + h}" fill="#fff1e8" stroke="#c2410c" stroke-width="2"/>`;
      else s = `<rect x="${x - w / 2}" y="${yy}" width="${w}" height="${h}" rx="4" fill="#fff" stroke="#5b6271" stroke-width="2"/>`;
      return s + txt(x, yy + h / 2 + 5, t, tipo === "ini" || tipo === "fim" ? 700 : 400);
    };
    const seta = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5b6271" stroke-width="2" marker-end="url(#ponta)"/>`;
    const linha = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5b6271" stroke-width="2"/>`;
    passos.forEach((p, i) => {
      if (p.t === "dec") {
        const h = 70, w = 220;
        svg += `<polygon points="${cx},${y} ${cx + w / 2},${y + h / 2} ${cx},${y + h} ${cx - w / 2},${y + h / 2}" fill="#f1efff" stroke="#6d5bd0" stroke-width="2"/>` + txt(cx, y + h / 2 + 5, p.txt, 700);
        const bx = 630, by = y + h / 2 - 22;
        svg += linha(cx + w / 2, y + h / 2, bx - 85, y + h / 2) + `<polygon points="${bx - 85},${y + h / 2} ${bx - 93},${y + h / 2 - 5} ${bx - 93},${y + h / 2 + 5}" fill="#5b6271"/>`;
        svg += `<text x="${cx + w / 2 + 12}" y="${y + h / 2 - 8}" font-size="13" font-weight="700" fill="#15803d">Sim</text>`;
        svg += forma(p.sim.t, bx, by, 170, 44, p.sim.txt);
        const fundo = y + h + 34;
        svg += linha(bx, by + 44, bx, fundo) + linha(bx, fundo, cx + 4, fundo);
        if (p.nao) {
          const nx = 105;
          svg += linha(cx - w / 2, y + h / 2, nx + 85, y + h / 2);
          svg += `<text x="${cx - w / 2 - 44}" y="${y + h / 2 - 8}" font-size="13" font-weight="700" fill="#b91c1c">Não</text>`;
          svg += forma(p.nao.t, nx, by, 170, 44, p.nao.txt);
          svg += linha(nx, by + 44, nx, fundo) + linha(nx, fundo, cx - 4, fundo);
          svg += linha(cx, fundo, cx, fundo);
        } else {
          svg += seta(cx, y + h, cx, fundo - 2);
          svg += `<text x="${cx + 8}" y="${y + h + 22}" font-size="13" font-weight="700" fill="#b91c1c">Não</text>`;
        }
        svg += `<circle cx="${cx}" cy="${fundo}" r="4" fill="#5b6271"/>`;
        y = fundo;
        if (i < passos.length - 1) { svg += seta(cx, y, cx, y + 22); y += 24; }
      } else {
        const h = 44, w = p.t === "es" ? 260 : 230;
        svg += forma(p.t, cx, y, w, h, p.txt);
        y += h;
        if (i < passos.length - 1) { svg += seta(cx, y, cx, y + 22); y += 24; }
      }
    });
    return `<svg viewBox="0 0 ${largura} ${y + 12}" role="img" style="max-width:${largura}px;width:100%;display:block;margin:10px auto;background:#fff;border:1px solid #e3ded3;border-radius:10px">
      <defs><marker id="ponta" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5b6271"/></marker></defs>${svg}</svg>`;
  }

  // ---------- passos que se repetem em toda etapa ----------
  function passoAbrir(n) {
    const a = arquivoDe(n);
    return {
      titulo: `Abra o arquivo ${pasta(n)}/${a}`,
      html: `<ol class="faca">
        <li>Abra o <b>VS Code</b>. Se a pasta <b>papelaria-ponto-certo</b> não aparecer no EXPLORADOR (à esquerda), abra-a pelo menu <b>Arquivo › Abrir Pasta...</b> (veja a Etapa 0, Passo 2).</li>
        <li>No EXPLORADOR, clique na pasta <b>${pasta(n)}</b> <span class="marca">1</span> para abri-la.</li>
        <li>Clique <b>uma vez</b> no arquivo <b>${a}</b> <span class="marca">2</span>. Ele abre no meio da tela, numa aba <span class="marca">3</span>.</li>
      </ol>
      ${vscode({ etapa: n, arquivoSel: a, aberto: true, marcas: { pasta: 1, arquivo: 2, aba: 3 }, linhas: [1, 10],
        legenda: `As linhas que começam com <code>#</code> são <b>comentários</b>: o Python ignora, servem para explicar. Leia o cabeçalho: ele lembra os comandos desta etapa.` })}
      ${caixa("atencao", "Trabalhe sempre no arquivo da etapa certa", `<p>Cada etapa tem a <b>sua própria pasta</b> e o seu próprio <code>${a}</code>, que já começa com tudo o que foi feito nas etapas anteriores. Não copie arquivos de uma pasta para outra.</p>`)}`,
    };
  }
  function passoSalvar() {
    return {
      titulo: "Salve o arquivo (Ctrl+S)",
      html: `<p>Enquanto o arquivo tem mudanças não salvas, aparece uma <b>bolinha ●</b> na aba, no lugar do <b>×</b>. <b>O Python só enxerga o que está salvo.</b></p>
      <ol class="faca"><li>Aperte <kbd>Ctrl</kbd> + <kbd>S</kbd> (ou use o menu <b>Arquivo › Salvar</b>).</li><li>Confira: a bolinha ● virou <b>×</b>.</li></ol>
      ${caixa("info", "Dica de ouro", "<p>Criou o hábito de salvar a cada mudança? Metade dos problemas some. Se o verificador disser que ainda tem lacuna que você já preencheu, quase sempre é porque o arquivo não foi salvo.</p>")}`,
    };
  }
  function passoRodar(n, extra = "") {
    const t = testesDe(n)[0];
    const c = `python ${pasta(n)}/${arquivoDe(n)}`;
    const digitar = t.entradas.map((e) => (e === "" ? "<b>(só aperte Enter)</b>" : `<code>${esc(e)}</code>`)).join(", depois ");
    return {
      titulo: "Rode o seu programa e teste você mesmo",
      html: `<ol class="faca">
        <li>Se o terminal não estiver aberto embaixo, abra pelo menu <b>Terminal › Novo Terminal</b>.</li>
        <li>Digite o comando abaixo e aperte <kbd>Enter</kbd> (ou clique em <b>Copiar</b> e cole no terminal com o botão direito do mouse ou <kbd>Ctrl</kbd>+<kbd>V</kbd>):${cmd(c)}</li>
        <li>O programa vai fazer perguntas. Digite ${digitar}, apertando <kbd>Enter</kbd> depois de cada resposta.</li>
        <li>Compare o resultado com a tela abaixo. Os valores em <span style="color:#1d6fa5;font-weight:700">azul</span> são os que você digita.</li>
      </ol>
      ${terminal(["$ " + c, ...transcricao(n, t), "$"], `Tela esperada para o <b>Teste 1 - ${esc(t.nome)}</b>. Os outros testes estão no arquivo <code>saida-esperada.txt</code> da pasta ${pasta(n)}.`)}
      ${extra}
      ${dica("Apareceu uma mensagem de erro em vermelho?", `<p>Leia a <b>última linha</b>: ela diz o tipo do erro. A linha de cima mostra <b>onde</b> (o número da linha). Corrija, salve e rode de novo. Os erros mais comuns estão na página <a href="#ajuda">Problemas comuns</a>.</p>`, "problema")}
      ${dica("O programa ficou parado esperando?", `<p>Ele está esperando você digitar uma resposta. Se quiser cancelar a execução, clique no terminal e aperte <kbd>Ctrl</kbd> + <kbd>C</kbd>.</p>`)}`,
    };
  }
  function passoVerificar(n) {
    const c = `python ${pasta(n)}/verificar.py`;
    return {
      titulo: "Rode o verificador",
      html: `<p>O <code>verificar.py</code> testa o seu programa sozinho com várias compras diferentes (não só a do passo anterior) e diz se está tudo certo.</p>
      ${cmd(c)}
      ${terminal(["$ " + c, "============================================================", ` VERIFICADOR - Etapa ${n}: ${tituloKit(n)}`, "============================================================", "", "1) Lacunas preenchidas?", "[ OK ] Nenhuma lacuna ___ sobrando.", "", "2) O Python consegue ler o programa?", "[ OK ] Sem erros de escrita.", "  (...)", "", "============================================================", ` PARABÉNS! A Etapa ${n} está completa.`, ` Seu CÓDIGO DE CONCLUSÃO é:  E${n}-XXXX-XXXX`, " Copie este código e cole no guia, na aba 'Conferir e entregar'.", "============================================================", "$"],
        "Quando tudo está certo, aparece PARABÉNS e um código de conclusão (o seu terá letras e números no lugar dos X).")}
      ${caixa("info", "Apareceu [FALHOU]?", `<p>Calma, é para isso que o verificador existe. Ele mostra <b>qual teste falhou</b>, a linha que <b>deveria aparecer</b>, a que <b>apareceu</b> e uma <b>DICA</b>. Corrija, salve com <kbd>Ctrl</kbd>+<kbd>S</kbd> e rode o verificador de novo, quantas vezes precisar.</p>`)}
      <p>Com o código de conclusão na tela, vá para a aba <a href="#etapa-${n}/entregar"><b>3 · Conferir e entregar</b></a>.</p>`,
    };
  }

  const E = [];

  // =====================================================================
  // ETAPA 0
  // =====================================================================
  E[0] = {
    n: 0, semana: "Antes da Semana 01", tema: "Preparando o ambiente",
    titulo: "Testando o ambiente",
    resumo: "Abrir o projeto no VS Code, conhecer o terminal e rodar o primeiro programa.",
    objetivos: ["Entender a diferença entre o VS Code (editor) e o Python (quem executa).", "Abrir a pasta do projeto e o terminal.", "Rodar um programa e o verificador pela primeira vez."],
    teoria: `
<h2>1. Duas ferramentas, dois papéis</h2>
<p>Para programar em Python no computador da escola usamos duas coisas diferentes, que trabalham juntas:</p>
<table class="tab"><tr><th></th><th>O que é</th><th>Comparando com a vida real</th></tr>
<tr><td><b>VS Code</b></td><td>Um <b>editor</b>: o lugar onde você escreve e organiza os arquivos do programa.</td><td>O <b>caderno</b> onde você escreve a receita.</td></tr>
<tr><td><b>Python</b></td><td>O <b>intérprete</b>: o programa que lê o seu arquivo e executa as instruções, uma por uma.</td><td>O <b>cozinheiro</b> que lê a receita e faz o bolo.</td></tr></table>
${caixa("info", "Por isso precisamos do terminal", "<p>O VS Code não executa nada sozinho. Para pedir ao Python que execute o seu arquivo, usamos o <b>terminal</b>: uma janela onde se digitam comandos. O comando <code>python etapa-00/ola.py</code> quer dizer: <i>“Python, execute o arquivo ola.py que está na pasta etapa-00”</i>.</p>")}

<h2>2. A pasta do projeto</h2>
<p>Todo o projeto fica numa pasta chamada <b>papelaria-ponto-certo</b>. Dentro dela há uma pasta para cada etapa:</p>
${py(`papelaria-ponto-certo/
    index.html            <- este guia (abre no navegador, funciona sem internet)
    etapa-00/
        ola.py            <- o programa que VOCÊ completa
        verificar.py      <- o conferidor (você só roda, não mexe)
        saida-esperada.txt  <- o que deve aparecer na tela, para comparar
    etapa-01/
        papelaria.py      <- a partir daqui o programa é o caixa da papelaria
        verificar.py
        saida-esperada.txt
    ... até etapa-07/`, true)}
<table class="tab"><tr><th>Arquivo</th><th>Para que serve</th><th>Você altera?</th></tr>
<tr><td><code>papelaria.py</code> (ou <code>ola.py</code>)</td><td>O programa da etapa. Já vem quase pronto, com algumas <b>lacunas</b> para você completar.</td><td class="v">SIM</td></tr>
<tr><td><code>verificar.py</code></td><td>Testa o seu programa com várias compras e mostra se está certo. No final dá um <b>código de conclusão</b>.</td><td class="f">NÃO</td></tr>
<tr><td><code>saida-esperada.txt</code></td><td>Mostra exatamente o que deve aparecer no terminal em cada teste, para você comparar.</td><td class="f">NÃO</td></tr></table>

<h2>3. As lacunas ___</h2>
<p>Nos arquivos das etapas você vai encontrar <b>três sublinhados seguidos</b>: <code>___</code>. Cada um é um espaço em branco que <b>você</b> deve trocar pela resposta certa, como num exercício de completar. Exemplo:</p>
${py(`nome = ___("Digite seu primeiro nome: ")`)}
<p>Enquanto houver uma lacuna, o programa não funciona, e o verificador avisa em qual linha ela está.</p>

<h2>4. O ciclo de trabalho (repita em todas as etapas)</h2>
<div class="ciclo">
  <div><b>Completar</b>Troque as lacunas no arquivo.</div>
  <div><b>Salvar</b><kbd>Ctrl</kbd>+<kbd>S</kbd>. O Python só enxerga o que foi salvo.</div>
  <div><b>Rodar</b><code>python etapa-0N/papelaria.py</code> e teste digitando valores.</div>
  <div><b>Verificar</b><code>python etapa-0N/verificar.py</code> até aparecer PARABÉNS.</div>
</div>
${caixa("atencao", "Guarde o seu trabalho", "<p>Em muitos computadores de escola os arquivos são apagados quando você sai da conta. Antes de sair, <b>gere o comprovante em PDF</b> (aba 3 de cada etapa) e, se puder, copie a pasta para um pen drive. Se perder a pasta, não tem problema: cada etapa começa do zero com o arquivo dela.</p>")}`,
    quiz: [
      { p: "Quem EXECUTA as instruções do seu programa?", ops: ["O VS Code", "O Python", "O verificar.py", "O navegador"], certa: 1, expl: "O VS Code é só o editor (o caderno). Quem lê e executa é o Python, chamado pelo terminal." },
      { p: "Você preencheu a lacuna, mas o verificador diz que ela continua lá. O que provavelmente aconteceu?", ops: ["O Python está com defeito", "O arquivo não foi salvo (Ctrl+S)", "Precisa reiniciar o computador", "O verificador está errado"], certa: 1, expl: "O Python lê o arquivo do disco. Se você não salvou, ele ainda vê a versão antiga, com a lacuna." },
      { p: "Qual arquivo você NÃO deve alterar?", ops: ["ola.py", "papelaria.py", "verificar.py", "Nenhum deles pode ser alterado"], certa: 2, expl: "O verificar.py é o conferidor. Você só roda ele. Quem você completa é o ola.py (Etapa 0) ou o papelaria.py (Etapas 1 a 7)." },
    ],
    pratica: [
      {
        titulo: "Pegue a pasta do projeto",
        html: `<p>O professor vai indicar <b>uma</b> destas formas (as duas funcionam sem internet depois):</p>
        <table class="tab"><tr><th>Como você recebe</th><th>O que fazer</th></tr>
        <tr><td><b>Arquivo .zip</b> (baixado do site uma vez, ou copiado do pen drive)</td><td>Copie o <code>papelaria-ponto-certo.zip</code> para <b>Documentos</b>, clique com o botão direito nele e escolha <b>Extrair Tudo...</b> e depois <b>Extrair</b>.</td></tr>
        <tr><td><b>Pasta pronta</b> (pen drive ou pasta da rede)</td><td>Copie a pasta <code>papelaria-ponto-certo</code> inteira para <b>Documentos</b>.</td></tr></table>
        ${window.T.extrair()}
        ${caixa("atencao", "Confira antes de seguir", "<p>Abrindo a pasta <b>papelaria-ponto-certo</b> no Windows, você deve ver as pastas <code>etapa-00</code> a <code>etapa-07</code>, a pasta <code>guia</code> e os arquivos <code>index.html</code> e <code>LEIA-ME.txt</code>. Se aparecer <b>outra</b> pasta papelaria-ponto-certo dentro dela, é essa de dentro que você vai usar.</p>")}`,
      },
      {
        titulo: "Abra a pasta no VS Code",
        html: `<ol class="faca"><li>Abra o <b>Visual Studio Code</b> (menu Iniciar › digite <i>code</i>).</li>
        <li>Clique no menu <b>Arquivo</b> <span class="marca">1</span> e depois em <b>Abrir Pasta...</b> <span class="marca">2</span>.</li></ol>
        ${vscode({ pastaAberta: false, menu: "Arquivo", item: "Abrir Pasta...", marcas: { menu: 1, item: 2 }, legenda: "Menu desenhado de forma simplificada: no seu VS Code ele tem mais opções. Se o VS Code estiver em inglês: <b>File › Open Folder...</b>" })}
        <ol class="faca" start="3"><li>Na janela que abrir, vá até <b>Documentos</b>, selecione a pasta <b>papelaria-ponto-certo</b> e clique em <b>Selecionar pasta</b>.</li></ol>
        ${window.T.seletorPasta()}`,
      },
      {
        titulo: "Diga ao VS Code que você confia na pasta",
        html: `<p>Na primeira vez, o VS Code pergunta se você confia nos arquivos. Como foi o professor que preparou a pasta, clique no botão azul.</p>
        ${window.T.confianca()}
        <p>Pronto: a pasta aparece no <b>EXPLORADOR</b>, à esquerda, com as pastas das etapas.</p>
        ${vscode({ etapa: -1, marcas: { explorador: 1 }, legenda: "O EXPLORADOR <span class='marca'>1</span> mostra as pastas e os arquivos do projeto." })}
        ${dica("Apareceu um aviso pedindo para instalar uma extensão do Python?", "<p>Pode fechar (clique no <b>×</b> do aviso). Neste projeto não usamos extensões: tudo é feito pelo terminal.</p>")}`,
      },
      {
        titulo: "Abra o terminal e confira o Python",
        html: `<ol class="faca"><li>Clique no menu <b>Terminal</b> <span class="marca">1</span> e depois em <b>Novo Terminal</b> <span class="marca">2</span>.</li></ol>
        ${vscode({ etapa: -1, menu: "Terminal", item: "Novo Terminal", marcas: { menu: 1, item: 2 }, terminal: ["$"], legenda: "Em inglês: <b>Terminal › New Terminal</b>. O terminal aparece na parte de baixo da janela." })}
        <ol class="faca" start="2"><li>Confira se a linha do terminal termina com <b>papelaria-ponto-certo&gt;</b>. O começo do caminho muda de computador para computador.</li>
        <li>Digite o comando abaixo e aperte <kbd>Enter</kbd>:${cmd("python --version")}</li></ol>
        ${terminal(["$ python --version", "Python 3.12.7", "$"], "Deu certo: aparece <b>Python 3.</b> e mais números (a versão pode ser outra, desde que comece com 3).")}
        ${dica("Apareceu “O termo 'python' não é reconhecido...” ou abriu a Microsoft Store?", `<p>Feche a Microsoft Store, se ela abriu, e tente o comando <b>py</b>:</p>${cmd("py --version")}
          ${terminal(["$ python --version", "python : O termo 'python' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa operável. (...)", "$ py --version", "Python 3.12.7", "$"])}
          <p>Se com <b>py</b> funcionou, <b>use py no lugar de python em todos os comandos</b> deste guia (por exemplo: <code>py etapa-00/ola.py</code>).</p>
          <p>Se <b>nenhum dos dois</b> funcionou, o Python não está instalado neste computador: chame o professor.</p>`, "problema")}`,
      },
      {
        titulo: "Complete a lacuna do ola.py",
        html: `<ol class="faca"><li>No EXPLORADOR, abra a pasta <b>etapa-00</b> e clique em <b>ola.py</b>.</li>
        <li>Encontre a linha com a lacuna <code>___</code> (destacada em amarelo abaixo).</li></ol>
        ${vscode({ etapa: 0, arquivoSel: "ola.py", aberto: true, linhas: [8, 11], realce: "lacunas" })}
        <ol class="faca" start="3"><li>Apague os três sublinhados <code>___</code> e escreva no lugar a palavra <b>input</b> (tudo minúsculo). A linha fica assim:</li></ol>
        ${py(`nome = input("Digite seu primeiro nome: ")`)}
        ${caixa("pense", "Entenda o que você escreveu", "<p><code>input</code> significa <i>entrada</i>: o programa <b>para</b>, mostra a pergunta e <b>espera</b> você digitar algo e apertar Enter. O que você digitar fica guardado na variável <code>nome</code>.</p>")}`,
      },
      passoSalvar(),
      passoRodar(0),
      passoVerificar(0),
    ],
  };

  // =====================================================================
  // ETAPA 1
  // =====================================================================
  E[1] = {
    n: 1, semana: "Semana 01", tema: "Introdução à estrutura básica de programação",
    titulo: "Entrada e subtotal",
    resumo: "O caixa pergunta o produto, o preço e a quantidade e calcula o subtotal.",
    objetivos: ["Explicar o que é um algoritmo e o modelo entrada → processamento → saída.", "Usar variáveis e escolher o tipo certo: texto, inteiro ou real.", "Converter o que foi digitado com int() e float() e fazer uma conta."],
    teoria: `
<h2>1. O que é um algoritmo</h2>
<p>Um <b>algoritmo</b> é uma sequência <b>finita</b> e <b>ordenada</b> de passos para resolver um problema. É como uma receita: se você trocar a ordem dos passos (assar antes de misturar), o resultado dá errado.</p>
<p>No caixa da papelaria, o algoritmo de uma venda simples é:</p>
${py(`1. Perguntar o nome do produto
2. Perguntar o preço de uma unidade
3. Perguntar a quantidade
4. Calcular: subtotal = preço x quantidade
5. Mostrar o resumo da venda`, true)}

<h2>2. Entrada, processamento e saída</h2>
<p>Quase todo programa segue este modelo:</p>
<table class="tab"><tr><th>Parte</th><th>O que acontece</th><th>No caixa da papelaria</th><th>Em Python</th></tr>
<tr><td><b>Entrada</b></td><td>O programa recebe dados.</td><td>Produto, preço e quantidade.</td><td><code>input()</code></td></tr>
<tr><td><b>Processamento</b></td><td>O programa faz contas e decisões.</td><td>Calcular o subtotal.</td><td><code>subtotal = preco * quantidade</code></td></tr>
<tr><td><b>Saída</b></td><td>O programa mostra o resultado.</td><td>Mostrar o resumo.</td><td><code>print()</code></td></tr></table>

<h2>3. O fluxograma do caixa</h2>
<p>O mesmo algoritmo, desenhado com os símbolos de fluxograma da apostila: <b>oval</b> = início/fim, <b>paralelogramo</b> = entrada/saída, <b>retângulo</b> = processamento.</p>
${fluxo([{ t: "ini", txt: "Início" }, { t: "es", txt: "Ler produto, preço e quantidade" }, { t: "proc", txt: "subtotal = preço × quantidade" }, { t: "es", txt: "Mostrar o resumo da venda" }, { t: "fim", txt: "Fim" }], 700)}

<h2>4. Variáveis e tipos de dados</h2>
<p>Uma <b>variável</b> é uma caixinha com nome, onde o programa guarda um valor. Cada valor tem um <b>tipo</b>:</p>
<table class="tab"><tr><th>Tipo</th><th>Em Python</th><th>No pseudocódigo</th><th>Exemplo na papelaria</th></tr>
<tr><td>Texto</td><td><code>str</code></td><td><code>caractere</code></td><td><code>produto = "Caderno"</code></td></tr>
<tr><td>Número inteiro</td><td><code>int</code></td><td><code>inteiro</code></td><td><code>quantidade = 3</code> (não existe meio caderno)</td></tr>
<tr><td>Número real (com casas decimais)</td><td><code>float</code></td><td><code>real</code></td><td><code>preco = 12.50</code></td></tr></table>
${caixa("atencao", "Regra importante: o input() SEMPRE devolve texto", `<p>Mesmo que a pessoa digite <code>3</code>, o Python recebe o texto <code>"3"</code>. E texto não serve para fazer conta: <code>"3" * 2</code> dá <code>"33"</code> (o texto repetido), e não 6!</p><p>Por isso convertemos: <code>int(...)</code> transforma o texto em <b>inteiro</b> e <code>float(...)</code> transforma em <b>número real</b>.</p>`)}
${compara(`algoritmo "Caixa"
var
   produto: caractere
   preco: real
   quantidade: inteiro
   subtotal: real
inicio
   escreva("Produto: ")
   leia(produto)
   escreva("Preço unitário: ")
   leia(preco)
   escreva("Quantidade: ")
   leia(quantidade)
   subtotal <- preco * quantidade
   escreva("Subtotal: ", subtotal)
fimalgoritmo`, `produto = input("Produto: ")
preco = float(input("Preço unitário: "))
quantidade = int(input("Quantidade: "))

subtotal = preco * quantidade

print("Subtotal:", subtotal)`)}
<p>Repare: no Python o <code>escreva</code> + <code>leia</code> viram uma linha só (<code>input</code> já mostra a pergunta). O <code>&lt;-</code> do pseudocódigo vira <code>=</code>, e a multiplicação é o <code>*</code> (asterisco).</p>

<h2>5. Duas linhas que já vêm prontas no projeto</h2>
<p>No seu <code>papelaria.py</code> algumas partes já vêm escritas. Você não precisa saber fazê-las agora, só entender para que servem:</p>
<table class="tab"><tr><th>Trecho</th><th>Para que serve</th></tr>
<tr><td><code>.replace(",", ".")</code></td><td>Troca a vírgula por ponto. O Python usa <b>ponto</b> nos números (12.50). Assim, se alguém digitar 12,50, o programa entende do mesmo jeito.</td></tr>
<tr><td><code>f"Subtotal: R$ {subtotal:.2f}"</code></td><td>Mostra o número com <b>duas casas decimais</b> (37.50 em vez de 37.5). Você vai estudar isso na Semana 19.</td></tr></table>`,
    quiz: [
      { p: "Qual é o tipo certo para guardar a QUANTIDADE de cadernos?", ops: ["Texto (str)", "Inteiro (int)", "Real (float)"], certa: 1, expl: "Quantidade é contada em unidades inteiras: não existe 2,5 cadernos. Use int()." },
      { p: "O cliente digitou 4 na quantidade, e o programa fez quantidade * 2 SEM converter. O que aparece?", ops: ["8", "44", "Um erro sempre", "4.0"], certa: 1, expl: "Sem converter, quantidade é o texto \"4\". Texto vezes 2 repete o texto: \"44\". Por isso usamos int()." },
      { p: "Calcular o subtotal é qual parte do modelo?", ops: ["Entrada", "Processamento", "Saída"], certa: 1, expl: "Contas e decisões são processamento. Entrada é ler os dados e saída é mostrar o resultado." },
    ],
    pratica: [
      passoAbrir(1),
      {
        titulo: "Encontre as lacunas desta etapa",
        html: `<p>Role o arquivo até a parte <b>ETAPA 1: ENTRADA E SUBTOTAL</b>. São <b>3 lacunas</b>, em 2 linhas (destacadas em amarelo):</p>
        ${vscode({ etapa: 1, aberto: true, linhas: [12, 21], realce: "lacunas" })}
        ${caixa("info", "O que já está pronto", `<p>A pergunta do <b>produto</b> (texto, não precisa converter) e a do <b>preço</b> (já convertida com <code>float</code>) estão prontas. Use a linha do preço como <b>modelo</b> para a da quantidade.</p>`)}`,
      },
      {
        titulo: `Lacuna 1 (linha ${linhaDe(1, "quantidade = ___")}): converter a quantidade`,
        html: `<p>A linha está assim:</p>${py(`quantidade = ___(input("Quantidade: "))`)}
        ${caixa("pense", "Pense antes de escrever", "<p>1. O que o <code>input()</code> devolve: texto ou número?<br>2. A quantidade pode ter casas decimais?<br>3. Que função transforma um texto em <b>número inteiro</b>?</p>")}
        ${dica("Dica 1", "<p>Olhe a linha de cima, do preço: ela usa <code>float(...)</code> porque o preço pode ter centavos. A quantidade é diferente.</p>")}
        ${dica("Dica 2", "<p>A função que converte para <b>inteiro</b> tem 3 letras e vem da palavra em inglês <i>integer</i>.</p>")}`,
      },
      {
        titulo: `Lacunas 2 e 3 (linha ${linhaDe(1, "subtotal = ___")}): calcular o subtotal`,
        html: `${py(`subtotal = ___ * ___`)}
        <p>O subtotal é o valor dos produtos: <b>preço de uma unidade × quantidade</b>. Troque cada <code>___</code> pelo <b>nome de uma variável</b> que já existe no programa.</p>
        ${caixa("atencao", "Use os nomes exatamente como foram criados", "<p>As variáveis se chamam <code>preco</code> (sem cedilha e sem acento) e <code>quantidade</code>. Se escrever <code>preço</code> ou <code>Preco</code>, o Python acha que é outra variável e dá erro (<code>NameError</code>).</p>")}
        ${dica("Dica", "<p>Exemplo do teste: 3 cadernos de R$ 12,50 devem dar subtotal de R$ 37,50, porque 12.50 × 3 = 37.50.</p>")}`,
      },
      passoSalvar(),
      passoRodar(1),
      passoVerificar(1),
    ],
  };

  // =====================================================================
  // ETAPA 2
  // =====================================================================
  E[2] = {
    n: 2, semana: "Semana 02", tema: "Introdução às estruturas de decisão simples",
    titulo: "Frete (SE / SENÃO)",
    resumo: "O caixa decide se a compra paga frete de R$ 15,00 ou se o frete é grátis.",
    objetivos: ["Reconhecer as três estruturas: sequência, seleção e repetição.", "Usar os comparadores >, <, >=, <=, == e !=.", "Escrever uma decisão com if / else e testar o caso limite."],
    teoria: `
<h2>1. Sequência, seleção e repetição</h2>
<p>Todo programa é montado com três estruturas: <b>sequência</b> (um passo depois do outro, como na Etapa 1), <b>seleção</b> (escolher um caminho conforme uma condição) e <b>repetição</b> (fazer de novo várias vezes, no 2º bimestre). Nesta etapa começa a <b>seleção</b>.</p>

<h2>2. Comparadores: perguntas de Sim ou Não</h2>
<p>Uma <b>condição</b> é uma comparação que só pode dar <b>Verdadeiro</b> (<code>True</code>) ou <b>Falso</b> (<code>False</code>).</p>
<table class="tab"><tr><th>Significado</th><th>Pseudocódigo</th><th>Python</th><th>Exemplo com subtotal = 200</th><th>Resultado</th></tr>
<tr><td>maior que</td><td><code>&gt;</code></td><td><code>&gt;</code></td><td><code>subtotal &gt; 200</code></td><td class="f">False</td></tr>
<tr><td>menor que</td><td><code>&lt;</code></td><td><code>&lt;</code></td><td><code>subtotal &lt; 200</code></td><td class="f">False</td></tr>
<tr><td>maior ou igual</td><td><code>&gt;=</code></td><td><code>&gt;=</code></td><td><code>subtotal &gt;= 200</code></td><td class="v">True</td></tr>
<tr><td>menor ou igual</td><td><code>&lt;=</code></td><td><code>&lt;=</code></td><td><code>subtotal &lt;= 200</code></td><td class="v">True</td></tr>
<tr><td>igual</td><td><code>=</code></td><td><code>==</code> (dois sinais!)</td><td><code>subtotal == 200</code></td><td class="v">True</td></tr>
<tr><td>diferente</td><td><code>&lt;&gt;</code></td><td><code>!=</code></td><td><code>subtotal != 200</code></td><td class="f">False</td></tr></table>
${caixa("atencao", "O caso limite", "<p>Repare que, com subtotal exatamente 200, <code>&lt;</code> e <code>&lt;=</code> dão respostas <b>diferentes</b>. Por isso sempre testamos o valor que fica <b>na fronteira</b> da regra. Programadores chamam isso de <b>teste de limite</b>.</p>")}

<h2>3. SE / SENÃO (if / else)</h2>
<p>A regra do frete da papelaria é: <b>compras abaixo de R$ 200,00 pagam R$ 15,00 de frete; de R$ 200,00 para cima o frete é grátis.</b></p>
${fluxo([{ t: "es", txt: "subtotal já calculado" }, { t: "dec", txt: "subtotal < 200?", sim: { t: "proc", txt: "frete = 15" }, nao: { t: "proc", txt: "frete = 0" } }, { t: "proc", txt: "total = subtotal + frete" }])}
${compara(`se subtotal < 200 entao
   frete <- 15
senao
   frete <- 0
fimse
total <- subtotal + frete`, `if subtotal < 200:
    frete = 15
else:
    frete = 0

total = subtotal + frete`)}
<h3>As 3 regras de escrita do if em Python</h3>
<ol><li>A linha do <code>if</code> e a do <code>else</code> terminam com <b>dois-pontos</b> <code>:</code>.</li>
<li>O que fica <b>dentro</b> do if (ou do else) é escrito <b>mais para a direita</b>: 4 espaços ou a tecla Tab. Isso se chama <b>recuo</b> (ou indentação), e é ele que diz ao Python o que faz parte de cada caminho.</li>
<li>Não existe <code>fimse</code>: o bloco termina quando o recuo volta para a esquerda.</li></ol>
${caixa("info", "Só um caminho é executado", "<p>No if/else, o Python executa <b>ou</b> o bloco do if, <b>ou</b> o bloco do else, nunca os dois. Depois, continua normalmente na linha seguinte, sem recuo.</p>")}`,
    quiz: [
      { p: "Com subtotal = 200, quanto fica o frete pela regra da papelaria?", ops: ["R$ 15,00", "R$ 0,00 (grátis)", "R$ 200,00"], certa: 1, expl: "Paga frete só ABAIXO de 200. Com exatamente 200 a condição subtotal < 200 é falsa, então vai para o else: frete = 0." },
      { p: "Qual destas linhas está escrita certo em Python?", ops: ["if subtotal < 200", "if subtotal < 200:", "se subtotal < 200 entao", "if (subtotal < 200) fimse"], certa: 1, expl: "Em Python a linha do if termina com dois-pontos. O 'se ... entao' é pseudocódigo." },
      { p: "Para comparar se dois valores são IGUAIS em Python, usamos:", ops: ["=", "==", "===", "<>"], certa: 1, expl: "Um = sozinho guarda um valor numa variável. Para comparar, são dois: ==." },
    ],
    pratica: [
      passoAbrir(2),
      {
        titulo: "Encontre a parte ETAPA 2: FRETE",
        html: `<p>A Etapa 1 já vem resolvida no arquivo. Role até a parte nova, <b>ETAPA 2: FRETE</b>. São 3 lacunas:</p>
        ${vscode({ etapa: 2, aberto: true, linhas: ["ETAPA 2: FRETE", linhaDe(2, "ETAPA 2: FRETE") + 7], realce: "lacunas" })}
        <p>Repare que o arquivo também ganhou a parte <b>CÁLCULO DO TOTAL</b> (<code>total = subtotal + frete</code>) e duas linhas novas no resumo: <b>Frete</b> e <b>TOTAL A PAGAR</b>. Elas já vêm prontas.</p>`,
      },
      {
        titulo: `Lacuna 1 (linha ${linhaDe(2, "if subtotal ___")}): o comparador`,
        html: `${py(`if subtotal ___ 200:`)}
        <p>Releia a regra no comentário logo acima da linha: <b>compras ABAIXO de R$ 200,00 pagam frete</b>. A linha deve perguntar: <i>“o subtotal é menor que 200?”</i></p>
        ${caixa("pense", "Pense", "<p>Com subtotal de exatamente 200, a compra paga frete? Escolha o comparador que dá <b>False</b> para 200 e <b>True</b> para 199,99.</p>")}
        ${dica("Dica", "<p>Volte na tabela de comparadores da Teoria e olhe a última coluna (resultado com subtotal = 200).</p>")}`,
      },
      {
        titulo: `Lacunas 2 e 3 (linhas ${linhaDe(2, "frete = ___")} e ${linhaDe(2, "frete = ___") + 2}): o valor do frete em cada caminho`,
        html: `${py(`if subtotal ___ 200:
    frete = ___
else:
    frete = ___`)}
        <ul><li>A primeira lacuna é o caminho do <b>Sim</b> (a condição é verdadeira: a compra é pequena).</li>
        <li>A segunda é o caminho do <b>Não</b> (o <code>else</code>: a compra é de 200 ou mais).</li></ul>
        <p>Escreva só o <b>número</b>, sem <code>R$</code> e sem vírgula: por exemplo <code>15</code>.</p>
        ${caixa("atencao", "Não mexa no recuo", "<p>As linhas <code>frete = ...</code> já estão com 4 espaços no começo. Mantenha assim: é o recuo que coloca cada linha dentro do seu caminho.</p>")}`,
      },
      passoSalvar(),
      passoRodar(2, `${caixa("pense", "Teste também o limite", "<p>Rode o programa de novo e digite <code>Agenda</code>, <code>50</code> e <code>4</code> (subtotal de exatamente R$ 200,00). O frete precisa ser <b>R$ 0.00</b>. Confira no <code>saida-esperada.txt</code>, Teste 2.</p>")}`),
      passoVerificar(2),
    ],
  };

  // =====================================================================
  // ETAPA 3
  // =====================================================================
  E[3] = {
    n: 3, semana: "Semana 03", tema: "Decisões simples, compostas e aninhadas",
    titulo: "Desconto por valor (SE dentro de SE)",
    resumo: "Compras acima de R$ 100,00 ganham 5% de desconto, e acima de R$ 500,00 ganham 10%.",
    objetivos: ["Fazer o rastreamento (trace) de um programa com decisões.", "Escrever um SE dentro de outro SE (decisão aninhada).", "Calcular porcentagem em Python (5% = 0.05)."],
    teoria: `
<h2>1. Quando uma pergunta só não basta</h2>
<p>A nova regra da papelaria tem <b>três</b> resultados possíveis:</p>
<table class="tab"><tr><th>Subtotal</th><th>Desconto</th></tr>
<tr><td>até R$ 100,00</td><td>nenhum (0)</td></tr><tr><td>acima de R$ 100,00 (até 500)</td><td>5%</td></tr><tr><td>acima de R$ 500,00</td><td>10%</td></tr></table>
<p>Um if/else só escolhe entre <b>dois</b> caminhos. Para três, uma solução é colocar uma <b>segunda pergunta dentro da primeira</b>: primeiro perguntamos <i>“passou de 100?”</i>. Só se passou, perguntamos <i>“passou de 500?”</i>. Isso é uma <b>decisão aninhada</b>: um SE dentro de outro SE.</p>
${compara(`se subtotal > 100 entao
   se subtotal > 500 entao
      desconto <- subtotal * 0.10
   senao
      desconto <- subtotal * 0.05
   fimse
senao
   desconto <- 0
fimse`, `if subtotal > 100:
    if subtotal > 500:
        desconto = subtotal * 0.10
    else:
        desconto = subtotal * 0.05
else:
    desconto = 0`)}
${caixa("info", "O recuo mostra quem está dentro de quem", "<p>O segundo <code>if</code> tem 4 espaços: ele está <b>dentro</b> do primeiro. As linhas do desconto de 10% e de 5% têm 8 espaços: estão dentro do segundo. O último <code>else</code> (sem recuo) pertence ao <b>primeiro</b> if.</p>")}

<h2>2. Porcentagem em Python</h2>
<p><b>5%</b> quer dizer 5 de cada 100, ou seja, <b>5 ÷ 100 = 0.05</b>. Do mesmo jeito, <b>10% = 0.10</b>. Para calcular 5% de 150: <code>150 * 0.05</code> = <code>7.5</code>.</p>
${caixa("atencao", "Erro comum", "<p>Escrever <code>subtotal * 5</code> calcula <b>5 vezes</b> o subtotal (500%), e não 5%!</p>")}

<h2>3. “Acima de” é diferente de “a partir de”</h2>
<p><b>Acima de 100</b> não inclui o 100: usamos <code>&gt;</code>. Se a regra dissesse <i>“a partir de 100”</i>, incluiria o 100 e usaríamos <code>&gt;=</code>. Na nossa regra, uma compra de <b>exatamente R$ 100,00 não ganha desconto</b>.</p>

<h2>4. Rastreamento (trace): seja o computador</h2>
<p>Fazer o <b>trace</b> é seguir o programa linha por linha, anotando o valor das variáveis, para prever o resultado <b>antes</b> de rodar. Veja com três compras:</p>
<table class="tab"><tr><th>subtotal</th><th>subtotal &gt; 100?</th><th>subtotal &gt; 500?</th><th>caminho</th><th>desconto</th></tr>
<tr><td>80</td><td class="f">False</td><td>(nem pergunta)</td><td>else de fora</td><td>0</td></tr>
<tr><td>150</td><td class="v">True</td><td class="f">False</td><td>else de dentro</td><td>150 × 0.05 = 7.5</td></tr>
<tr><td>600</td><td class="v">True</td><td class="v">True</td><td>if de dentro</td><td>600 × 0.10 = 60</td></tr></table>
<h2>5. O novo total</h2>
<p>Agora o desconto entra na conta: <b>total = subtotal − desconto + frete</b>. O frete continua olhando o <b>subtotal</b> (o valor dos produtos, antes do desconto).</p>`,
    quiz: [
      { p: "Com subtotal = 100 (exatamente), qual é o desconto?", ops: ["0", "5", "10"], certa: 0, expl: "A regra é ACIMA de 100 (>). 100 > 100 é False, então vai para o else de fora: desconto = 0." },
      { p: "Como se escreve 10% para fazer a conta em Python?", ops: ["10", "0.10", "1.0", "10%"], certa: 1, expl: "10% = 10 ÷ 100 = 0.10. O símbolo % não serve para isso em Python." },
      { p: "Com subtotal = 80, o programa chega a perguntar 'subtotal > 500?'", ops: ["Sim", "Não"], certa: 1, expl: "A segunda pergunta está DENTRO da primeira. Como 80 > 100 é falso, o Python pula o bloco inteiro e vai direto ao else de fora." },
    ],
    pratica: [
      passoAbrir(3),
      {
        titulo: "Encontre a parte ETAPA 3: DESCONTO POR VALOR",
        html: `${vscode({ etapa: 3, aberto: true, linhas: ["ETAPA 3: DESCONTO", linhaDe(3, "ETAPA 3: DESCONTO") + 12], realce: "lacunas" })}
        <p>São <b>5 lacunas</b> aqui e mais <b>1</b> na parte <b>CÁLCULO DO TOTAL</b>, no fim do arquivo. A estrutura do SE dentro de SE (os <code>if</code>, os <code>else</code> e o recuo) <b>já está pronta</b>: você completa os números.</p>`,
      },
      {
        titulo: "Lacunas dos limites (as duas perguntas)",
        html: `${py(`if subtotal > ___:
    if subtotal > ___:`)}
        ${caixa("pense", "Pense", "<p>A pergunta de <b>fora</b> decide se a compra ganha <b>algum</b> desconto. A de <b>dentro</b> só acontece para quem já ganhou desconto, e decide se é o desconto <b>maior</b>. Qual limite vai em cada uma?</p>")}
        ${dica("Dica", "<p>Leia o comentário da regra no próprio arquivo (as 3 linhas que começam com <code># Regra:</code>). O primeiro if usa o limite menor.</p>")}`,
      },
      {
        titulo: "Lacunas das porcentagens e do “sem desconto”",
        html: `${py(`        desconto = subtotal * ___
    else:
        desconto = subtotal * ___
else:
    desconto = ___`)}
        <ul><li>A 1ª linha está dentro do <b>if de dentro</b>: a compra passou do limite maior.</li>
        <li>A 2ª está no <b>else de dentro</b>: passou do limite menor, mas não do maior.</li>
        <li>A 3ª está no <b>else de fora</b>: não ganhou desconto nenhum.</li></ul>
        ${dica("Dica", "<p>Escreva as porcentagens na forma decimal (com ponto). Volte na Teoria, parte 2, se tiver dúvida.</p>")}`,
      },
      {
        titulo: `Lacuna do total (linha ${linhaDe(3, "total = subtotal - ___")})`,
        html: `${py(`total = subtotal - ___ + frete`)}<p>O que deve ser <b>tirado</b> do subtotal? Escreva o nome da variável que você acabou de calcular.</p>`,
      },
      passoSalvar(),
      passoRodar(3, caixa("pense", "Faça o trace antes de rodar", "<p>Antes de digitar <code>Calculadora</code>, <code>75</code> e <code>2</code>, calcule no papel: subtotal, desconto, frete e total. Depois rode e veja se o computador concorda com você. Confira os 5 testes no <code>saida-esperada.txt</code>.</p>")),
      passoVerificar(3),
    ],
  };

  // =====================================================================
  // ETAPA 4
  // =====================================================================
  E[4] = {
    n: 4, semana: "Semana 04", tema: "Operadores relacionais, lógicos e tabelas-verdade",
    titulo: "Estudante e brinde (E / OU)",
    resumo: "Estudantes ganham R$ 5,00 de desconto, e compras grandes ganham um brinde.",
    objetivos: ["Combinar duas condições com E (and) e OU (or).", "Montar e ler uma tabela-verdade.", "Escolher entre and e or a partir de uma regra escrita em português."],
    teoria: `
<h2>1. Juntando duas perguntas numa só</h2>
<p>Às vezes uma decisão depende de <b>duas</b> condições ao mesmo tempo. Para juntá-las usamos os <b>operadores lógicos</b>:</p>
<table class="tab"><tr><th>Operador</th><th>Pseudocódigo</th><th>Python</th><th>Quando dá Verdadeiro?</th></tr>
<tr><td>E</td><td><code>e</code></td><td><code>and</code></td><td>Só quando as <b>duas</b> condições são verdadeiras.</td></tr>
<tr><td>OU</td><td><code>ou</code></td><td><code>or</code></td><td>Quando <b>pelo menos uma</b> é verdadeira.</td></tr>
<tr><td>NÃO</td><td><code>nao</code></td><td><code>not</code></td><td>Inverte: verdadeiro vira falso e vice-versa.</td></tr></table>

<h2>2. Tabelas-verdade</h2>
<p>A tabela-verdade mostra o resultado para <b>todas</b> as combinações possíveis. A = <i>“é estudante”</i>, B = <i>“subtotal ≥ 50”</i>:</p>
<div class="lado-a-lado"><table class="tab"><tr><th>A</th><th>B</th><th>A <b>and</b> B</th></tr>
<tr><td class="v">V</td><td class="v">V</td><td class="v">V</td></tr><tr><td class="v">V</td><td class="f">F</td><td class="f">F</td></tr><tr><td class="f">F</td><td class="v">V</td><td class="f">F</td></tr><tr><td class="f">F</td><td class="f">F</td><td class="f">F</td></tr></table>
<table class="tab"><tr><th>A</th><th>B</th><th>A <b>or</b> B</th></tr>
<tr><td class="v">V</td><td class="v">V</td><td class="v">V</td></tr><tr><td class="v">V</td><td class="f">F</td><td class="v">V</td></tr><tr><td class="f">F</td><td class="v">V</td><td class="v">V</td></tr><tr><td class="f">F</td><td class="f">F</td><td class="f">F</td></tr></table></div>
${caixa("info", "Jeito fácil de lembrar", "<p><b>and</b> é exigente: precisa de <b>tudo</b>. <b>or</b> é bonzinho: basta <b>um</b>.</p>")}

<h2>3. As duas regras novas da papelaria</h2>
<table class="tab"><tr><th>Regra</th><th>Em português</th><th>Palavra-chave</th></tr>
<tr><td>Desconto estudante (R$ 5,00)</td><td>É estudante <b>E</b> o subtotal é de pelo menos R$ 50,00.</td><td>E → <code>and</code></td></tr>
<tr><td>Brinde</td><td>Levou 10 unidades ou mais <b>OU</b> o subtotal é de pelo menos R$ 300,00.</td><td>OU → <code>or</code></td></tr></table>
${compara(`se (estudante = "s") e (subtotal >= 50) entao
   desconto_estudante <- 5
senao
   desconto_estudante <- 0
fimse`, `if estudante == "s" and subtotal >= 50:
    desconto_estudante = 5
else:
    desconto_estudante = 0`)}

<h2>4. Comparando textos</h2>
<p>A resposta do cliente é um texto: comparamos com <code>estudante == "s"</code>, com o <code>s</code> entre aspas. Para o programa aceitar <code>s</code>, <code>S</code> ou <code> s </code> (com espaço), a linha do input já vem com <code>.strip().lower()</code>: o <code>.strip()</code> tira os espaços e o <code>.lower()</code> deixa tudo minúsculo.</p>`,
    quiz: [
      { p: "Cliente estudante, com subtotal de R$ 30,00. Ganha o desconto de estudante?", ops: ["Sim", "Não"], certa: 1, expl: "A regra usa E: precisa ser estudante E ter subtotal ≥ 50. A segunda condição é falsa, então tudo é falso." },
      { p: "Cliente levou 12 lápis e gastou R$ 18,00. Ganha brinde?", ops: ["Sim", "Não"], certa: 0, expl: "A regra do brinde usa OU: basta UMA condição. 12 ≥ 10 é verdadeiro, então ganha." },
      { p: "Na tabela-verdade do AND, quantas linhas dão Verdadeiro?", ops: ["0", "1", "2", "3"], certa: 1, expl: "Só uma: quando as duas condições são verdadeiras (V e V)." },
    ],
    pratica: [
      passoAbrir(4),
      {
        titulo: "Encontre a parte ETAPA 4: ESTUDANTE E BRINDE",
        html: `${vscode({ etapa: 4, aberto: true, linhas: ["ETAPA 4: ESTUDANTE", linhaDe(4, "brinde = \"Não\"")], realce: "lacunas" })}
        <p>Repare na linha nova com <code>input</code>: o programa agora faz <b>4 perguntas</b> (produto, preço, quantidade e se é estudante). São <b>2 lacunas</b>, e em cada uma vai um <b>operador lógico</b>.</p>`,
      },
      {
        titulo: `Lacuna 1 (linha ${linhaDe(4, 'estudante == "s" ___')}): a regra do estudante`,
        html: `${py(`if estudante == "s" ___ subtotal >= 50:`)}
        ${caixa("pense", "Pense", "<p>Leia a regra em voz alta: <i>“é estudante ___ o subtotal é de pelo menos 50”</i>. O cliente precisa cumprir <b>as duas</b> coisas, ou basta uma?</p>")}
        ${dica("Dica", "<p>Escreva o operador em Python, em letras minúsculas e em inglês (não escreva <code>e</code> nem <code>E</code>).</p>")}`,
      },
      {
        titulo: `Lacuna 2 (linha ${linhaDe(4, "quantidade >= 10 ___")}): a regra do brinde`,
        html: `${py(`if quantidade >= 10 ___ subtotal >= 300:`)}
        ${caixa("pense", "Pense", "<p>Quem leva 12 lápis baratos ganha brinde? E quem leva 2 mochilas caras (R$ 300,00)? Se as <b>duas</b> respostas são <b>sim</b>, basta <b>uma</b> condição ser verdadeira.</p>")}`,
      },
      passoSalvar(),
      passoRodar(4, caixa("pense", "Monte a sua tabela-verdade", "<p>Rode mais 3 vezes, mudando só as respostas: estudante <code>s</code> com 2 cadernos de 25 (subtotal 50); estudante <code>n</code> com 2 cadernos de 25; estudante <code>s</code> com 2 cadernos de 20 (subtotal 40). Anote em qual caso aparece <b>Desconto estudante: R$ 5.00</b>. Isso confere com a tabela do AND?</p>")),
      passoVerificar(4),
    ],
  };

  // =====================================================================
  // ETAPA 5
  // =====================================================================
  E[5] = {
    n: 5, semana: "Semana 05", tema: "Estruturas de decisão simples: o comando SE",
    titulo: "Estoque (SE simples)",
    resumo: "O caixa avisa quando falta estoque e quando o pedido é grande. Aqui você escreve um SE inteiro sozinho!",
    objetivos: ["Usar o SE simples (if sem else).", "Representar uma decisão simples no fluxograma.", "Escrever um if completo do zero: condição, dois-pontos e bloco com recuo."],
    teoria: `
<h2>1. SE simples: fazer algo só quando for verdade</h2>
<p>Nem toda decisão precisa de um <b>senão</b>. Às vezes queremos fazer algo <b>apenas</b> quando a condição é verdadeira e, caso contrário, <b>não fazer nada</b> e seguir em frente. Isso é o <b>SE simples</b>: um <code>if</code> sem <code>else</code>.</p>
<p>Exemplo da papelaria: a loja tem <b>40 unidades</b> em estoque. <i>Se</i> o cliente pedir <b>mais</b> do que isso, o caixa mostra um aviso. Se não, não mostra nada.</p>
${fluxo([{ t: "es", txt: "quantidade já lida" }, { t: "dec", txt: "quantidade > estoque?", sim: { t: "es", txt: "Mostrar aviso" } }, { t: "proc", txt: "continua o programa" }])}
${compara(`se quantidade > estoque entao
   escreva("ATENÇÃO: estoque insuficiente!")
fimse`, `if quantidade > estoque:
    print("ATENÇÃO: estoque insuficiente!")`)}
${caixa("info", "No fluxograma", "<p>O losango tem duas saídas, mas só a do <b>Sim</b> passa por uma ação. A do <b>Não</b> vai direto para o ponto de encontro: é o caminho “não faz nada”.</p>")}

<h2>2. Anatomia de um if: as 4 partes</h2>
<p>Nesta etapa você vai escrever um <code>if</code> <b>inteiro</b>, sem lacunas para guiar. Ele sempre tem 4 partes:</p>
<table class="tab"><tr><th>#</th><th>Parte</th><th>No exemplo</th></tr>
<tr><td>1</td><td>A palavra <code>if</code></td><td><code>if</code></td></tr>
<tr><td>2</td><td>A condição (uma comparação)</td><td><code>quantidade &gt; estoque</code></td></tr>
<tr><td>3</td><td>Dois-pontos no final da linha</td><td><code>:</code></td></tr>
<tr><td>4</td><td>Na linha de baixo, <b>com 4 espaços</b>, o que fazer</td><td><code>&nbsp;&nbsp;&nbsp;&nbsp;print("...")</code></td></tr></table>

<h2>3. print com vírgulas</h2>
<p>O <code>print</code> pode mostrar vários itens separados por vírgula. Ele coloca um espaço entre eles:</p>
${py(`print("Temos só", estoque, "unidades.")
# mostra: Temos só 40 unidades.`)}

<h2>4. Vários SE simples seguidos são independentes</h2>
<p>Dois <code>if</code> simples, um embaixo do outro, são <b>perguntas separadas</b>: os dois podem ser verdadeiros, só um, ou nenhum. Com 45 canetas, por exemplo, aparecem os <b>dois</b> avisos.</p>`,
    quiz: [
      { p: "No SE simples, o que acontece quando a condição é FALSA?", ops: ["O programa dá erro", "Executa o bloco do else", "Não faz nada e segue para a próxima linha", "O programa termina"], certa: 2, expl: "Sem else, quando a condição é falsa o Python simplesmente pula o bloco e continua." },
      { p: "Com estoque = 40 e quantidade = 40, aparece o aviso de estoque insuficiente (quantidade > estoque)?", ops: ["Sim", "Não"], certa: 1, expl: "40 > 40 é falso. Com exatamente 40 ainda dá para vender: o estoque é suficiente." },
      { p: "Qual destas linhas está completa e correta?", ops: ["if quantidade >= 30", "if quantidade >= 30:", "if quantidade => 30:", "if: quantidade >= 30"], certa: 1, expl: "A condição vem depois do if e a linha termina com dois-pontos. O operador é >= (e não =>)." },
    ],
    pratica: [
      passoAbrir(5),
      {
        titulo: "Encontre a parte ETAPA 5: ESTOQUE",
        html: `${vscode({ etapa: 5, aberto: true, linhas: ["ETAPA 5: ESTOQUE", linhaDe(5, "ETAPA 5: ESTOQUE") + 11], realce: "lacunas" })}
        <p>São duas partes: na <b>PARTE A</b> você completa uma lacuna; na <b>PARTE B</b> a lacuna <code>___</code> ocupa a linha inteira, porque é ali que <b>você vai escrever um if completo</b>.</p>`,
      },
      {
        titulo: `PARTE A (linha ${linhaDe(5, "if quantidade ___ estoque")}): o comparador do estoque`,
        html: `${py(`if quantidade ___ estoque:`)}
        <p>O aviso deve aparecer quando o cliente pedir <b>MAIS</b> do que o estoque.</p>
        ${caixa("pense", "Pense no limite", "<p>Com exatamente 40 unidades pedidas e 40 em estoque, falta produto? A resposta decide entre <code>&gt;</code> e <code>&gt;=</code>.</p>")}`,
      },
      {
        titulo: `PARTE B (linha ${K[5].inicio.split("\n").findIndex((l) => l.trim() === "___") + 1}): escreva o seu if, passo a passo`,
        html: `<p>A regra está no comentário: <b>quando a quantidade for 30 ou mais, mostrar exatamente esta mensagem:</b></p>
        ${py(`Aviso: pedido grande, separar com antecedência.`, true)}
        <ol class="faca">
          <li><b>Apague</b> os três sublinhados <code>___</code> dessa linha.</li>
          <li>No lugar, escreva <code>if</code>, um espaço e a <b>condição</b>: compare <code>quantidade</code> com <code>30</code>. <i>“30 ou mais”</i> usa qual comparador?</li>
          <li>Termine a linha com <b>dois-pontos</b> <code>:</code> e aperte <kbd>Enter</kbd>.</li>
          <li>O VS Code já coloca o cursor <b>recuado</b> (4 espaços) na linha de baixo. Se não colocar, aperte <kbd>Tab</kbd> uma vez.</li>
          <li>Escreva o <code>print(...)</code> com a mensagem entre aspas, <b>exatamente</b> como acima, com o ponto final.</li>
        </ol>
        <p>Use o if da PARTE A, logo acima, como <b>modelo</b>: ele tem a mesma forma.</p>
        ${caixa("atencao", "Confira o recuo", "<p>A linha do <code>if</code> começa <b>encostada na esquerda</b>, sem espaços, alinhada com o <code>if</code> da PARTE A. A linha do <code>print</code> começa com <b>4 espaços</b>.</p>")}
        ${dica("Dica: como fica a forma (sem a resposta)", py(`if quantidade ?? 30:
    print("...mensagem...")`))}`,
      },
      passoSalvar(),
      passoRodar(5, caixa("pense", "Teste os 4 casos", "<p>Rode com 5, 30, 45 e 40 canetas (preço 2, estudante n). Com 45 devem aparecer os <b>dois</b> avisos; com 40, só o de pedido grande; com 5, nenhum. Compare com o <code>saida-esperada.txt</code>.</p>")),
      passoVerificar(5),
    ],
  };

  // =====================================================================
  // ETAPA 6
  // =====================================================================
  const l6a = linhaDe(6, 'if cupom = "PONTO10"');
  const l6b = l6a + 2;
  const t6 = testesDe(6)[0];
  const l6total = t6.linhas.filter((l) => l.trim()).findIndex((l) => l.startsWith("TOTAL")) + 1;
  const total6 = t6.linhas.find((l) => l.startsWith("TOTAL"));
  const total6errado = "TOTAL A PAGAR: R$ " + (parseFloat(total6.split("R$ ")[1]) + 20).toFixed(2);
  E[6] = {
    n: 6, semana: "Semana 06", tema: "Criação de programas com decisão: ajustes e depuração",
    titulo: "Cupom de desconto (depuração)",
    resumo: "O programa chegou com 3 erros. Você vira detetive de bugs e conserta um de cada vez.",
    objetivos: ["Diferenciar erro de sintaxe, erro de execução e erro de lógica.", "Ler uma mensagem de erro do Python e achar a linha do problema.", "Depurar com método: um erro por vez, testando depois de cada correção."],
    teoria: `
<h2>1. Todo programador erra (e depura)</h2>
<p><b>Depurar</b> (em inglês, <i>debug</i>) é encontrar e corrigir os erros de um programa. Programadores profissionais passam boa parte do tempo fazendo isso. O segredo não é nunca errar, e sim ter um <b>método</b>.</p>

<h2>2. Os três tipos de erro</h2>
<table class="tab"><tr><th>Tipo</th><th>O que acontece</th><th>Quem avisa</th><th>Exemplo</th></tr>
<tr><td><b>Sintaxe</b> (escrita)</td><td>O Python nem começa: não entende o que foi escrito.</td><td>O Python, com <code>SyntaxError</code>.</td><td>Faltou o <code>:</code> no if.</td></tr>
<tr><td><b>Execução</b></td><td>O programa começa, mas <b>para no meio</b>.</td><td>O Python, com <code>NameError</code>, <code>ValueError</code>...</td><td>Nome de variável escrito errado.</td></tr>
<tr><td><b>Lógica</b></td><td>O programa roda até o fim, mas o <b>resultado está errado</b>.</td><td><b>Ninguém!</b> Só testes encontram.</td><td>Somou o desconto em vez de subtrair.</td></tr></table>
${caixa("atencao", "O erro de lógica é o mais perigoso", "<p>Ele não mostra nenhuma mensagem vermelha. Por isso existe o <code>verificar.py</code>: ele compara o resultado com o que deveria dar.</p>")}

<h2>3. Como ler uma mensagem de erro do Python</h2>
${terminal([`$ python etapa-06/papelaria.py`, `  File "C:\\Users\\aluno\\Documents\\papelaria-ponto-certo\\etapa-06\\papelaria.py", line ${l6a}`, `    if cupom = "PONTO10":`, `       ^^^^^^^^^^^^^^^^^`, `SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?`, "$"], "Mensagem real do Python 3.12. Em outras versões o texto pode mudar um pouco, mas as partes são as mesmas.")}
<table class="tab"><tr><th>Parte</th><th>O que diz</th></tr>
<tr><td><code>line ${l6a}</code></td><td><b>Onde</b>: o número da linha. No VS Code, o número aparece à esquerda de cada linha.</td></tr>
<tr><td><code>if cupom = "PONTO10":</code> e os <code>^^^</code></td><td>A linha com problema, e os chapéus apontam o trecho suspeito.</td></tr>
<tr><td>Última linha</td><td><b>O quê</b>: o tipo do erro e uma explicação em inglês. <i>Maybe you meant '=='</i> quer dizer <i>“Talvez você quisesse dizer ==”</i>.</td></tr></table>
${caixa("info", "Às vezes o erro está na linha de CIMA", "<p>Se a linha indicada parece certa, olhe a anterior: um parêntese ou aspas que não foram fechados só são percebidos na linha seguinte.</p>")}

<h2>4. O método do detetive</h2>
<ol><li><b>Rode</b> o programa.</li><li><b>Leia</b> a última linha da mensagem (o quê) e o número da linha (onde).</li><li><b>Vá até a linha</b> no VS Code e compare com um trecho que funciona (um if de outra etapa, por exemplo).</li><li>Corrija <b>um erro só</b>, <b>salve</b> e <b>rode de novo</b>.</li><li>Quando não houver mais mensagem vermelha, rode o <b>verificador</b> para caçar os erros de lógica.</li></ol>
${caixa("info", "Por que um de cada vez?", "<p>O Python para no <b>primeiro</b> erro de sintaxe que encontra. Quando você corrige esse, ele mostra o próximo. É normal ver uma mensagem nova depois de corrigir: é sinal de progresso!</p>")}`,
    quiz: [
      { p: "O programa rodou até o fim, mas o TOTAL saiu errado. Que tipo de erro é?", ops: ["Sintaxe", "Execução", "Lógica"], certa: 2, expl: "Rodou até o fim sem mensagem, mas com resultado errado: erro de lógica. Só um teste encontra." },
      { p: "Na mensagem do Python, onde está o NÚMERO da linha com problema?", ops: ["Na última linha", "Depois da palavra line", "Nos chapéus ^^^", "Não aparece"], certa: 1, expl: "A linha com File \"...\", line N diz onde. A última linha diz o tipo do erro." },
      { p: "Você corrigiu um erro de sintaxe e, ao rodar de novo, apareceu OUTRA mensagem. Isso significa que:", ops: ["Você piorou o programa", "O Python achou o próximo erro: você avançou", "Precisa desfazer a correção"], certa: 1, expl: "O Python mostra um erro de sintaxe por vez. Uma mensagem nova, em outra linha, quer dizer que o primeiro erro foi resolvido." },
    ],
    pratica: [
      passoAbrir(6),
      {
        titulo: "Conheça o caso: a parte ETAPA 6: CUPOM",
        html: `${vscode({ etapa: 6, aberto: true, linhas: ["ETAPA 6: CUPOM", l6b + 1] })}
        <p>A regra: quem digitar o cupom <b>PONTO10</b> ganha <b>R$ 10,00</b> de desconto, e quem só apertar Enter não ganha nada. O estagiário escreveu este trecho, mas deixou <b>3 erros</b> no arquivo: <b>2 de sintaxe</b> (o Python vai mostrar) e <b>1 de lógica</b> (só o verificador vai encontrar).</p>
        ${caixa("atencao", "Nesta etapa não há lacunas ___", "<p>Você não vai completar nada: vai <b>consertar</b>. Não apague nem reescreva o trecho inteiro, corrija só o que está errado.</p>")}`,
      },
      {
        titulo: "Erro 1: rode e leia a mensagem",
        html: `${cmd("python etapa-06/papelaria.py")}
        <p>O programa nem começa: o Python mostra um <b>SyntaxError</b>.</p>
        ${terminal([`$ python etapa-06/papelaria.py`, `  File "C:\\Users\\aluno\\Documents\\papelaria-ponto-certo\\etapa-06\\papelaria.py", line ${l6a}`, `    if cupom = "PONTO10":`, `       ^^^^^^^^^^^^^^^^^`, `SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?`, "$"])}
        <ol class="faca"><li>Vá até a <b>linha ${l6a}</b>.</li><li>Pergunte-se: esta linha quer <b>guardar</b> um valor ou <b>comparar</b> dois valores? Qual sinal serve para cada coisa? (Teoria da Etapa 2.)</li><li>Corrija, salve (<kbd>Ctrl</kbd>+<kbd>S</kbd>) e rode de novo.</li></ol>`,
      },
      {
        titulo: "Erro 2: uma mensagem nova (bom sinal!)",
        html: `<p>Ao rodar de novo, o Python aponta <b>outra linha</b>:</p>
        ${terminal([`$ python etapa-06/papelaria.py`, `  File "C:\\Users\\aluno\\Documents\\papelaria-ponto-certo\\etapa-06\\papelaria.py", line ${l6b}`, `    else`, `        ^`, `SyntaxError: expected ':'`, "$"])}
        <p><i>expected ':'</i> quer dizer <i>“era esperado o sinal :”</i>. Compare a linha ${l6b} com qualquer <code>else</code> das etapas anteriores, no mesmo arquivo. Corrija, salve e rode.</p>
        ${caixa("ok", "Como saber que os erros de sintaxe acabaram", "<p>O programa começa a fazer as perguntas (Produto, Preço...). Responda até o fim: ele vai mostrar o resumo. Mas atenção: <b>ainda falta um erro</b>.</p>")}`,
      },
      {
        titulo: "Erro 3: o erro de lógica (use o verificador)",
        html: `${cmd("python etapa-06/verificar.py")}
        <p>O verificador vai mostrar <b>[FALHOU]</b> em um teste, com a linha que <b>deveria aparecer</b> e a que <b>apareceu</b>:</p>
        ${terminal(["3) Testes com compras de verdade", "[FALHOU] Teste 1 - cupom PONTO10", "  Valores digitados: " + t6.entradas.join(" / "), `  A diferença está na linha ${l6total} da saída:`, "    Deveria aparecer:  " + total6, "    Apareceu:          " + total6errado, "  DICA: Confira a linha do total: desconto se TIRA (-), frete se SOMA (+)."])}
        ${caixa("pense", "Investigue como detetive", "<p>O total saiu <b>R$ 20,00 a mais</b> do que deveria. O cupom vale R$ 10,00. Que erro numa conta faz a diferença ser exatamente o <b>dobro</b> do cupom? Procure na parte <b>CÁLCULO DO TOTAL</b>.</p>")}
        ${dica("Dica", "<p>Em vez de tirar os R$ 10,00, a linha está fazendo outra coisa com eles. Compare o sinal antes de <code>desconto_cupom</code> com o sinal antes de <code>desconto</code>.</p>")}`,
      },
      passoVerificar(6),
    ],
  };

  // =====================================================================
  // ETAPA 7
  // =====================================================================
  E[7] = {
    n: 7, semana: "Semana 07", tema: "Decisão composta: SE/SENÃO, E/OU e SE-SENÃO-SE",
    titulo: "Forma de pagamento (SE-SENÃO-SE)",
    resumo: "O cliente escolhe Dinheiro, PIX ou Cartão, e o caixa decide se a venda é concluída. Fim do Caixa v1!",
    objetivos: ["Escolher entre várias opções com if / elif / else.", "Usar o else como “opção padrão” para entradas inválidas.", "Juntar SE/SENÃO e E (and) para decidir a situação final da venda."],
    teoria: `
<h2>1. Mais de dois caminhos: SE-SENÃO-SE</h2>
<p>Na Etapa 3 usamos um SE dentro de outro para ter três caminhos. Quando as opções são uma <b>lista de escolhas</b> (como num menu), fica mais claro usar o <b>SE-SENÃO-SE</b>: em Python, <code>elif</code> (abreviação de <i>else if</i>, “senão, se”).</p>
${compara(`se opcao = "1" entao
   forma <- "Dinheiro"
senao se opcao = "2" entao
   forma <- "PIX"
senao se opcao = "3" entao
   forma <- "Cartão"
senao
   forma <- "Inválida"
fimse`, `if opcao == "1":
    forma = "Dinheiro"
elif opcao == "2":
    forma = "PIX"
elif opcao == "3":
    forma = "Cartão"
else:
    forma = "Inválida"`)}
<h3>Como o Python lê</h3>
<ol><li>Testa as condições <b>de cima para baixo</b>.</li><li>Na <b>primeira</b> que for verdadeira, executa o bloco dela e <b>pula todo o resto</b>.</li><li>Se nenhuma for verdadeira, executa o <code>else</code>: a <b>opção padrão</b>.</li></ol>
${caixa("info", "O else protege o programa", "<p>E se o cliente digitar 9? Nenhuma condição é verdadeira, e o <code>else</code> pega esse caso: a forma fica <b>Inválida</b>. Sempre pense no que acontece com uma entrada que você não esperava.</p>")}
${caixa("atencao", "elif não é if", "<p>Vários <code>if</code> separados fazem várias perguntas <b>independentes</b> (como na Etapa 5). Com <code>elif</code>, as perguntas formam <b>uma corrente só</b>: apenas um bloco é executado.</p>")}

<h2>2. Por que a opção é comparada com "1" (entre aspas)?</h2>
<p>O <code>input()</code> devolve texto, e aqui não convertemos para número: comparamos texto com texto. <code>opcao == "1"</code> funciona, mas <code>opcao == 1</code> (sem aspas) <b>nunca</b> seria verdadeiro.</p>

<h2>3. A situação final da venda: SE/SENÃO + E</h2>
<p>A venda só é <b>concluída</b> se o pagamento for válido <b>E</b> houver estoque. Juntamos tudo o que aprendemos:</p>
${compara(`se (forma <> "Inválida") e (quantidade <= estoque) entao
   situacao <- "VENDA CONCLUÍDA"
senao
   situacao <- "VENDA CANCELADA"
fimse`, `if forma != "Inválida" and quantidade <= estoque:
    situacao = "VENDA CONCLUÍDA"
else:
    situacao = "VENDA CANCELADA"`)}
<h2>4. O Caixa v1 está completo!</h2>
<p>Com esta etapa, o programa usa <b>tudo</b> do 1º bimestre: entrada e saída, variáveis e tipos, SE/SENÃO, SE aninhado, E/OU, SE simples, depuração e SE-SENÃO-SE. No 2º bimestre, o caixa vai aprender a <b>repetir</b>: vender vários produtos na mesma compra.</p>`,
    quiz: [
      { p: "O cliente digitou 2. Quantas condições do if/elif o Python chega a testar?", ops: ["1", "2", "3", "Todas, mais o else"], certa: 1, expl: "Testa opcao == \"1\" (falso) e opcao == \"2\" (verdadeiro). Achou a primeira verdadeira, executa e pula o resto." },
      { p: "O cliente digitou 9. Qual bloco é executado?", ops: ["O do if", "O do primeiro elif", "O do segundo elif", "O do else"], certa: 3, expl: "Nenhuma condição é verdadeira, então o Python executa a opção padrão: o else." },
      { p: "Pagamento válido, mas 45 unidades com estoque de 40. Qual é a situação?", ops: ["VENDA CONCLUÍDA", "VENDA CANCELADA"], certa: 1, expl: "A regra usa AND: precisa das duas condições. Falta estoque, então vai para o else." },
    ],
    pratica: [
      passoAbrir(7),
      {
        titulo: "Encontre a parte ETAPA 7: FORMA DE PAGAMENTO",
        html: `${vscode({ etapa: 7, aberto: true, linhas: ["ETAPA 7: FORMA", linhaDe(7, 'situacao = "VENDA CANCELADA"')], realce: "lacunas" })}
        <p>O programa agora faz <b>6 perguntas</b>: produto, preço, quantidade, estudante, cupom e forma de pagamento. São <b>4 lacunas</b>.</p>`,
      },
      {
        titulo: "Lacunas 1, 2 e 3: a corrente de escolhas",
        html: `${py(`if opcao == "1":
    forma = "Dinheiro"
___ opcao == "2":
    forma = "PIX"
___ opcao == "3":
    forma = "Cartão"
___:
    forma = "Inválida"`)}
        ${caixa("pense", "Pense", "<p>As duas primeiras lacunas continuam a corrente com uma <b>nova condição</b>. A última não tem condição nenhuma: é a <b>opção padrão</b>, que pega tudo o que sobrou. Que palavra do Python faz cada papel?</p>")}
        ${dica("Dica", "<p>Volte na Teoria, parte 1: o código em Python ao lado do pseudocódigo tem exatamente essa forma.</p>")}`,
      },
      {
        titulo: `Lacuna 4 (linha ${linhaDe(7, 'forma != "Inválida" ___')}): a situação da venda`,
        html: `${py(`if forma != "Inválida" ___ quantidade <= estoque:`)}
        <p>Releia o comentário acima da linha: a venda é concluída se o pagamento for válido <b>___</b> houver estoque.</p>`,
      },
      passoSalvar(),
      passoRodar(7, caixa("pense", "Experimente as entradas inválidas", "<p>Rode de novo e escolha a opção <code>9</code>. Depois peça <code>45</code> unidades. Nos dois casos deve aparecer <b>VENDA CANCELADA</b>. Um bom programa não quebra com entradas estranhas.</p>")),
      passoVerificar(7),
    ],
    fim: `${caixa("ok", "🎉 Você construiu o Caixa v1 da Papelaria Ponto Certo!", "<p>Abra o seu <code>etapa-07/papelaria.py</code> e role do começo ao fim: cada parte foi uma semana de aula. Guarde o comprovante desta etapa, porque ele mostra o programa inteiro.</p>")}`,
  };

  return E;
};
