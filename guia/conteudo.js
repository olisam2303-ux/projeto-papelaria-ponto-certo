// Conteúdo das etapas (1º, 2º e 3º bimestres): TEORIA (separada) + PRÁTICA passo a passo.
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
      const comando = corpo[0].startsWith("Comando:") || corpo[0].startsWith("Chamada:") || corpo[0].includes("(nenhum");
      const ent = comando ? [] : corpo[0].replace("Valores digitados: ", "").split(" / ").map((x) => (x === "(só Enter)" ? "" : x));
      const linhas = corpo.slice(2).filter((l, j, arr) => !(j === arr.length - 1 && l === ""));
      while (linhas.length && linhas[linhas.length - 1] === "") linhas.pop();
      lista.push({ num: Number(partes[i]), nome: partes[i + 1], entradas: ent, linhas, funcao: corpo[0].startsWith("Chamada:") });
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
  const pasta = (n) => window.T.pastaDe(n);

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
  function passoRodar(n, extra = "", qual = 0) {
    const t = testesDe(n)[qual];
    const c = `python ${pasta(n)}/${arquivoDe(n)}`;
    const digitar = t.entradas.map((e) => (e === "" ? "<b>(só aperte Enter)</b>" : `<code>${esc(e)}</code>`)).join(", depois ");
    return {
      titulo: "Rode o seu programa e teste você mesmo",
      html: `<ol class="faca">
        <li>Se o terminal não estiver aberto embaixo, abra pelo menu <b>Terminal › Novo Terminal</b>.</li>
        <li>Digite o comando abaixo e aperte <kbd>Enter</kbd> (ou clique em <b>Copiar</b> e cole no terminal com o botão direito do mouse ou <kbd>Ctrl</kbd>+<kbd>V</kbd>):${cmd(c)}</li>
        ${t.entradas.length ? `<li>O programa vai fazer perguntas. Digite ${digitar}, apertando <kbd>Enter</kbd> depois de cada resposta.</li>
        <li>Compare o resultado com a tela abaixo. Os valores em <span style="color:#1d6fa5;font-weight:700">azul</span> são os que você digita.</li>` : `<li>Este programa <b>não faz perguntas</b>: ele analisa as vendas e mostra o relatório direto.</li>
        <li>Compare o resultado com a tela abaixo, linha por linha.</li>`}
      </ol>
      ${terminal(["$ " + c, ...transcricao(n, t), "$"], `Tela esperada para o <b>Teste ${t.num} - ${esc(t.nome)}</b>. Os outros testes estão no arquivo <code>saida-esperada.txt</code> da pasta ${pasta(n)}.`)}
      ${extra}
      ${dica("Apareceu uma mensagem de erro em vermelho?", `<p>Leia a <b>última linha</b>: ela diz o tipo do erro. A linha de cima mostra <b>onde</b> (o número da linha). Corrija, salve e rode de novo. Os erros mais comuns estão na página <a href="#ajuda">Problemas comuns</a>.</p>`, "problema")}
      ${t.entradas.length ? dica("O programa ficou parado esperando?", `<p>Ele está esperando você digitar uma resposta. Se quiser cancelar a execução, clique no terminal e aperte <kbd>Ctrl</kbd> + <kbd>C</kbd>.</p>`) : ""}`,
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
        html: `<p>O professor vai indicar <b>uma</b> destas formas (todas funcionam sem internet depois):</p>
        <table class="tab"><tr><th>Como você recebe</th><th>O que fazer</th></tr>
        <tr><td><b>Instalador</b> <code>Instalar_Papelaria_Ponto_Certo.exe</code> (do site ou do pen drive)</td><td>Dê dois cliques nele, confira a pasta (o normal é <b>Documentos</b>) e clique em <b>Instalar</b>. No fim ele oferece abrir o guia e deixa um atalho na Área de Trabalho. Se você já tinha o projeto, ele só atualiza e <b>mantém os seus programas</b>.</td></tr>
        <tr><td><b>Arquivo .zip</b> (baixado do site uma vez, ou copiado do pen drive)</td><td>Copie o <code>papelaria-ponto-certo.zip</code> para <b>Documentos</b>, clique com o botão direito nele e escolha <b>Extrair Tudo...</b> e depois <b>Extrair</b>.</td></tr>
        <tr><td><b>Pasta pronta</b> (pen drive ou pasta da rede)</td><td>Copie a pasta <code>papelaria-ponto-certo</code> inteira para <b>Documentos</b>.</td></tr></table>
        ${dica("Apareceu “O Windows protegeu o computador” ao abrir o instalador?", "<p>É um aviso do Windows para programas baixados que não são de uma empresa conhecida. Se foi o professor que indicou o instalador, clique em <b>Mais informações</b> e depois em <b>Executar assim mesmo</b>. Se o computador da escola <b>bloquear</b> o instalador, use o arquivo <b>.zip</b> (linha de baixo da tabela).</p>")}
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

  // =====================================================================
  // 2º BIMESTRE · O CAIXA QUE REPETE (Caixa v2)
  // =====================================================================
  const svgWhile = `<svg viewBox="0 0 640 330" role="img" style="max-width:640px;width:100%;display:block;margin:10px auto;background:#fff;border:1px solid #e3ded3;border-radius:10px">
    <defs><marker id="pw" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5b6271"/></marker></defs>
    <g font-family="Segoe UI, sans-serif" font-size="13" fill="#1f2430" text-anchor="middle">
      <polygon points="214,14 470,14 456,56 200,56" fill="#fff1e8" stroke="#c2410c" stroke-width="2"/><text x="335" y="40">Perguntar o 1º item (nome)</text>
      <line x1="335" y1="56" x2="335" y2="82" stroke="#5b6271" stroke-width="2" marker-end="url(#pw)"/>
      <polygon points="335,84 455,124 335,164 215,124" fill="#f1efff" stroke="#6d5bd0" stroke-width="2"/><text x="335" y="129" font-weight="700">nome != "" ?</text>
      <line x1="335" y1="164" x2="335" y2="190" stroke="#5b6271" stroke-width="2" marker-end="url(#pw)"/><text x="350" y="182" font-weight="700" fill="#15803d" text-anchor="start">Sim</text>
      <rect x="215" y="192" width="240" height="74" rx="4" fill="#fff" stroke="#5b6271" stroke-width="2"/>
      <text x="335" y="212">perguntar o preço</text><text x="335" y="230">contador + 1 · acumulador + preço</text><text x="335" y="248" font-weight="700">perguntar o PRÓXIMO item</text>
      <polyline points="215,229 120,229 120,124 213,124" fill="none" stroke="#5b6271" stroke-width="2" marker-end="url(#pw)"/><text x="120" y="216" fill="#5b6271">volta</text>
      <polyline points="455,124 560,124 560,300 337,300" fill="none" stroke="#5b6271" stroke-width="2" marker-end="url(#pw)"/><text x="575" y="116" font-weight="700" fill="#b91c1c">Não</text>
      <rect x="235" y="284" width="100" height="32" rx="16" fill="#e6f4f2" stroke="#0f766e" stroke-width="2"/><text x="285" y="305" font-weight="700">Resumo</text>
    </g></svg>`;

  // ---------------------------------------------------------------- ETAPA 8
  E[8] = {
    n: 8, semana: "Semana 08", tema: "Estruturas de repetição: o laço while (enquanto)",
    titulo: "Vários itens (while com sentinela)",
    resumo: "Nasce o Caixa v2: a compra agora tem quantos itens o cliente quiser, até apertar Enter.",
    objetivos: ["Usar o while para repetir enquanto uma condição for verdadeira.", "Criar um contador e um acumulador.", "Encerrar a entrada de dados com uma sentinela e evitar o laço infinito."],
    teoria: `
<h2>1. Por que repetir?</h2>
<p>O Caixa v1 vendia <b>um</b> produto por compra. Na vida real o cliente chega com cadernos, canetas, uma mochila... e o caixa não sabe quantos itens são. Precisamos de uma <b>estrutura de repetição</b>: um bloco de código que roda várias vezes. Cada volta se chama <b>iteração</b>.</p>
${caixa("info", "Começa o Caixa v2", "<p>A partir desta etapa o programa é um caixa novo, o <b>Caixa v2</b>. Ele reaproveita a regra do frete do 1º bimestre e, a cada semana, ganha uma parte nova, até a Etapa 14.</p>")}

<h2>2. O laço while (enquanto)</h2>
<p>O <code>while</code> testa a condição <b>antes</b> de cada volta: se for verdadeira, executa o bloco e testa de novo; se for falsa, sai do laço e segue o programa. Se a condição já começar falsa, o bloco roda <b>zero</b> vezes.</p>
${compara(`enquanto nome <> "" faca
   escreva("Preço: ")
   leia(preco)
   ...
fimenquanto`, `while nome != "":
    preco = float(input("Preço (R$): "))
    ...`)}
<p>Como no <code>if</code>: a linha do <code>while</code> termina com <b>dois-pontos</b>, e o bloco que se repete fica <b>recuado</b> 4 espaços.</p>
${svgWhile}

<h2>3. Contador e acumulador</h2>
<table class="tab"><tr><th></th><th>O que faz</th><th>No caixa</th></tr>
<tr><td><b>Contador</b></td><td>Soma um valor <b>fixo</b> (normalmente 1) a cada volta.</td><td><code>quantidade_itens = quantidade_itens + 1</code></td></tr>
<tr><td><b>Acumulador</b></td><td>Soma um valor que <b>muda</b> a cada volta.</td><td><code>subtotal = subtotal + preco</code></td></tr></table>
<p>Os dois <b>começam em 0 antes do laço</b>. Veja o rastreamento (trace) de uma compra com 3 itens:</p>
<table class="tab"><tr><th>Volta</th><th>nome</th><th>preco</th><th>quantidade_itens</th><th>subtotal</th></tr>
<tr><td>antes</td><td>Caderno</td><td>-</td><td>0</td><td>0</td></tr>
<tr><td>1ª</td><td>Caderno</td><td>25</td><td>1</td><td>25</td></tr>
<tr><td>2ª</td><td>Caneta</td><td>2.50</td><td>2</td><td>27.50</td></tr>
<tr><td>3ª</td><td>Mochila</td><td>150</td><td>3</td><td>177.50</td></tr>
<tr><td>sai</td><td>"" (Enter)</td><td>-</td><td>3</td><td>177.50</td></tr></table>
${caixa("info", "Atalho que você vai ver por aí", "<p><code>x = x + 1</code> também pode ser escrito <code>x += 1</code>. Neste projeto usamos a forma longa, que deixa claro o que acontece.</p>")}

<h2>4. A sentinela: como o laço sabe que acabou</h2>
<p>A <b>sentinela</b> é um valor especial que encerra a entrada de dados. No nosso caixa, é apertar <b>só Enter</b> no nome do item (texto vazio <code>""</code>). O padrão tem duas perguntas iguais:</p>
<ol><li>Pergunta o <b>primeiro</b> item <b>antes</b> do <code>while</code>.</li><li>Pergunta o <b>próximo</b> item <b>no fim</b> do bloco do <code>while</code>.</li></ol>

<h2>5. O laço infinito</h2>
<p>Se a variável da condição <b>nunca muda</b> dentro do laço, a condição nunca fica falsa e o programa não para. Sem a pergunta do próximo item, o <code>nome</code> continua sempre "Caderno". É o bug mais comum com <code>while</code>.</p>
${caixa("atencao", "Travou?", "<p>Clique no terminal e aperte <kbd>Ctrl</kbd> + <kbd>C</kbd> para interromper o programa. Depois procure qual variável da condição não está mudando.</p>")}

<h2>6. Cuidado com a divisão por zero</h2>
<p>O preço médio é <code>subtotal / quantidade_itens</code>. Se o cliente apertar Enter logo de cara, <code>quantidade_itens</code> é 0, e dividir por zero dá erro (<code>ZeroDivisionError</code>). Por isso a média só é calculada <b>se houver pelo menos um item</b>.</p>`,
    quiz: [
      { p: "No código, qual variável é o ACUMULADOR?", ops: ["quantidade_itens", "subtotal", "nome", "frete"], certa: 1, expl: "subtotal soma o preço (um valor que muda) a cada volta. quantidade_itens soma sempre 1: é o contador." },
      { p: "Por que o programa ficaria preso para sempre sem a última linha do while?", ops: ["Porque o preço nunca muda", "Porque o nome nunca muda, e a condição nome != \"\" nunca fica falsa", "Porque falta o dois-pontos", "Porque o subtotal fica grande demais"], certa: 1, expl: "A condição depende do nome. Se o próximo nome não é perguntado, ele continua igual e o laço não acaba." },
      { p: "O cliente apertou Enter logo no primeiro item. Quantas vezes o bloco do while roda?", ops: ["0", "1", "2", "Infinitas"], certa: 0, expl: "O while testa antes. Com o nome vazio a condição já começa falsa, e o bloco não roda nenhuma vez." },
    ],
    pratica: [
      passoAbrir(8),
      {
        titulo: "Conheça o Caixa v2",
        html: `<p>O arquivo é novo e mais curto que o Caixa v1. Role e identifique as 3 partes: <b>ETAPA 8</b> (o laço), o <b>frete</b> (regra do 1º bimestre, já pronta) e o <b>RESUMO</b>. São <b>5 lacunas</b>.</p>
        ${vscode({ etapa: 8, aberto: true, linhas: ["ETAPA 8:", linhaDe(8, "PARTE B") + 1], realce: "lacunas" })}`,
      },
      {
        titulo: `Lacuna 1 (linha ${linhaDe(8, 'while nome ___')}): a condição do while`,
        html: `${py(`while nome ___ "":`)}
        <p>O laço deve continuar <b>enquanto o nome NÃO for vazio</b>. Qual comparador do Python significa “diferente”?</p>
        ${dica("Dica", "<p>Volte na tabela de comparadores da Etapa 2. O “diferente” do pseudocódigo é <code>&lt;&gt;</code>; no Python tem 2 caracteres e começa com ponto de exclamação.</p>")}`,
      },
      {
        titulo: "Lacunas 2 e 3: o contador e o acumulador",
        html: `${py(`    quantidade_itens = quantidade_itens + ___
    subtotal = subtotal + ___`)}
        ${caixa("pense", "Pense", "<p>A cada volta entra <b>um</b> item a mais: quanto o contador soma? E o subtotal deve somar o quê, a cada item? (É uma variável que acabou de ser perguntada na linha de cima.)</p>")}`,
      },
      {
        titulo: `Lacuna 4 (linha ${linhaDe(8, "PARTE B") + 1}): PARTE B, a linha que impede o laço infinito`,
        html: `<p>A linha toda é a lacuna. Nela vai a pergunta do <b>próximo item</b>, igualzinha à que aparece <b>antes</b> do <code>while</code>:</p>
        ${py(`nome = input("Item (ou Enter para fechar a compra): ").strip()`, true)}
        <ol class="faca"><li>Apague o <code>___</code>, mas <b>mantenha os 4 espaços</b> do começo (a linha precisa estar dentro do while).</li><li>Escreva (ou copie e cole) a linha acima.</li></ol>
        ${caixa("atencao", "Sem esta linha...", "<p>...o <code>nome</code> nunca muda e o programa pede o preço para sempre. O verificador percebe isso e avisa.</p>")}`,
      },
      {
        titulo: `Lacuna 5 (linha ${linhaDe(8, "if quantidade_itens ___")}): proteger a média`,
        html: `${py(`if quantidade_itens ___ 0:  # protege contra divisão por zero`)}
        <p>A média só pode ser calculada se houver <b>pelo menos 1 item</b>. Que comparador deixa passar 1, 2, 3... mas barra o 0?</p>`,
      },
      passoSalvar(),
      passoRodar(8, caixa("pense", "Teste a sentinela e a compra vazia", "<p>Rode de novo e aperte <b>Enter</b> logo no primeiro item. Devem aparecer <b>Itens: 0</b>, sem a linha do preço médio e sem erro. Depois teste 4 agendas de 50 (frete grátis).</p>")),
      passoVerificar(8),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 9
  E[9] = {
    n: 9, semana: "Semana 09", tema: "Estruturas de repetição: o laço for e a função range()",
    titulo: "Parcelamento (for com range)",
    resumo: "O caixa sublinha o nome do cliente e mostra as parcelas uma por uma.",
    objetivos: ["Percorrer um texto com for.", "Gerar sequências de números com range(início, fim).", "Escolher entre for e while."],
    teoria: `
<h2>1. O laço for: um para cada</h2>
<p>O <code>for</code> repete o bloco <b>uma vez para cada item</b> de uma coleção. A cada volta, a <b>variável de controle</b> recebe o item da vez. Um <b>texto</b> também é uma coleção: de letras (e espaços).</p>
${compara(`para i de 1 ate 3 faca
   escreva("Parcela ", i)
fimpara`, `for numero in range(1, 4):
    print("Parcela", numero)`)}
${py(`for letra in "Ana":
    print(letra)
# mostra A, depois n, depois a (uma por linha)`)}

<h2>2. A função range()</h2>
<p><code>range</code> gera uma sequência de números inteiros. Ela <b>para ANTES do fim</b>:</p>
<table class="tab"><tr><th>Código</th><th>Gera</th></tr>
<tr><td><code>range(5)</code></td><td>0, 1, 2, 3, 4</td></tr>
<tr><td><code>range(1, 5)</code></td><td>1, 2, 3, 4</td></tr>
<tr><td><code>range(1, 5 + 1)</code></td><td>1, 2, 3, 4, 5</td></tr>
<tr><td><code>range(0, 11, 2)</code></td><td>0, 2, 4, 6, 8, 10 (de 2 em 2: o 3º número é o <b>passo</b>)</td></tr></table>
${caixa("atencao", "O erro “off-by-one” (um a mais ou a menos)", "<p>Para mostrar as parcelas de <b>1 até parcelas</b>, o fim do range precisa ser <code>parcelas + 1</code>. Com <code>range(1, parcelas)</code> falta a última parcela. Com <code>range(0, parcelas)</code> aparece uma “Parcela 0”.</p>")}

<h2>3. Acumulador de texto</h2>
<p>Dá para acumular texto do mesmo jeito que números: <code>+</code> junta (concatena) textos. Para sublinhar o nome do cliente, juntamos um <code>"="</code> para cada letra:</p>
${py(`sublinhado = ""
for letra in "Ana":
    sublinhado = sublinhado + "="
print(sublinhado)   # ===`)}

<h2>4. for ou while?</h2>
<table class="tab"><tr><th>Use</th><th>Quando</th><th>No caixa</th></tr>
<tr><td><code>for</code></td><td>Você sabe quantas voltas (ou tem uma coleção para percorrer).</td><td>As parcelas: são exatamente <code>parcelas</code> voltas.</td></tr>
<tr><td><code>while</code></td><td>Não sabe quantas voltas: depende de uma condição.</td><td>Os itens: até o cliente apertar Enter.</td></tr></table>
<p>As parcelas também usam uma decisão do 1º bimestre: <code>if parcelas &lt; 1 or parcelas &gt; 6</code> corrige um número inválido para 1.</p>`,
    quiz: [
      { p: "Quais números range(1, 4) gera?", ops: ["1, 2, 3, 4", "1, 2, 3", "0, 1, 2, 3", "4"], certa: 1, expl: "O range para ANTES do fim: começa no 1 e vai até 3." },
      { p: "Quantas voltas tem: for letra in \"Ana Lu\"?", ops: ["2", "5", "6", "7"], certa: 2, expl: "São 6 caracteres: A, n, a, espaço, L, u. O espaço também conta." },
      { p: "Para repetir até o cliente digitar \"sair\", qual laço é mais adequado?", ops: ["for com range", "while", "Tanto faz"], certa: 1, expl: "Não dá para saber quantas voltas serão: depende do que for digitado. Esse é o caso do while." },
    ],
    pratica: [
      passoAbrir(9),
      {
        titulo: "O que mudou no arquivo",
        html: `<p>A Etapa 8 já vem resolvida. Há duas novidades: o programa pergunta o <b>nome do cliente</b> logo no começo, e no fim pergunta em <b>quantas parcelas</b>. São <b>3 lacunas</b> em 2 linhas.</p>
        ${vscode({ etapa: 9, aberto: true, linhas: ["ETAPA 9: o nome", linhaDe(9, "print(sublinhado)")], realce: "lacunas" })}`,
      },
      {
        titulo: `Lacuna 1 (linha ${linhaDe(9, "for letra in ___")}): percorrer o nome do cliente`,
        html: `${py(`for letra in ___:
    sublinhado = sublinhado + "="`)}
        <p>O sublinhado deve ter um <code>=</code> para <b>cada letra do nome do cliente</b>. Qual variável guarda esse nome? Escreva o nome da variável, <b>sem aspas</b>.</p>
        ${caixa("atencao", "Com aspas é outra coisa", "<p><code>for letra in \"cliente\"</code> percorreria a palavra <i>cliente</i> (7 letras), e não o nome digitado.</p>")}`,
      },
      {
        titulo: `Lacunas 2 e 3 (linha ${linhaDe(9, "range(___, ___)")}): o range das parcelas`,
        html: `${vscode({ etapa: 9, aberto: true, linhas: ["ETAPA 9: PARCELAMENTO", linhaDe(9, "range(___, ___)") + 1], realce: "lacunas" })}
        ${py(`for numero in range(___, ___):`)}
        ${caixa("pense", "Pense", "<p>Com 3 parcelas, queremos ver Parcela 1, Parcela 2 e Parcela 3. Onde o range deve <b>começar</b>? E, lembrando que ele para <b>antes</b> do fim, qual deve ser o <b>fim</b> para incluir a última parcela?</p>")}
        ${dica("Dica", "<p>O fim é uma conta pequena com a variável <code>parcelas</code>. Releia a tabela do range na Teoria.</p>")}`,
      },
      passoSalvar(),
      passoRodar(9, caixa("pense", "Teste o inválido", "<p>Rode de novo e peça <code>7</code> parcelas. Deve aparecer <b>Número de parcelas inválido</b> e uma única parcela. Teste também um nome com sobrenome: o espaço também ganha um <code>=</code>.</p>")),
      passoVerificar(9),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 10
  E[10] = {
    n: 10, semana: "Semana 10", tema: "Repetição aninhada, eficiência e listas",
    titulo: "Nota, contagem e busca (listas)",
    resumo: "Os itens ficam guardados em listas: o caixa imprime a nota, conta os itens caros e busca o primeiro de alto valor.",
    objetivos: ["Guardar valores numa lista com append e acessá-los pelo índice.", "Percorrer duas listas paralelas com range(len(...)).", "Contar com if dentro do for e parar uma busca com break."],
    teoria: `
<h2>1. Listas: vários valores com um nome só</h2>
<p>Até aqui o preço de cada item era esquecido na volta seguinte. Uma <b>lista</b> guarda todos, em ordem:</p>
${py(`precos = []            # lista vazia
precos.append(25)      # [25]
precos.append(2.5)     # [25, 2.5]
print(precos[0])       # 25   -> a PRIMEIRA posição é 0
print(len(precos))     # 2    -> quantos itens a lista tem`)}
<table class="tab"><tr><th>Comando</th><th>O que faz</th></tr>
<tr><td><code>lista.append(x)</code></td><td>Acrescenta <code>x</code> no fim da lista.</td></tr>
<tr><td><code>lista[i]</code></td><td>O item da posição <code>i</code> (começa em 0).</td></tr>
<tr><td><code>len(lista)</code></td><td>Quantidade de itens. A última posição é <code>len(lista) - 1</code>.</td></tr></table>

<h2>2. Listas paralelas</h2>
<p>O caixa usa <b>duas</b> listas: <code>produtos</code> (nomes) e <code>precos</code>. O item da posição <code>i</code> de uma corresponde ao da mesma posição na outra: <code>produtos[1]</code> custa <code>precos[1]</code>. Para percorrer as duas juntas, o <code>for</code> passa pelos <b>índices</b>:</p>
${py(`for i in range(len(produtos)):
    print(f"{i + 1}. {produtos[i]}: R$ {precos[i]:.2f}")`)}
<p>Na nota, aparece <code>i + 1</code> porque as pessoas contam a partir de 1, e o Python a partir de 0.</p>

<h2>3. Contar: if dentro do for</h2>
${compara(`caros <- 0
para cada p em precos faca
   se p >= 50 entao
      caros <- caros + 1
   fimse
fimpara`, `caros = 0
for p in precos:
    if p >= 50:
        caros = caros + 1`)}

<h2>4. Buscar e parar: break</h2>
<p>Para achar o <b>primeiro</b> item acima de R$ 100,00, não precisamos olhar o resto da lista depois de encontrá-lo. O <code>break</code> <b>interrompe o laço na hora</b> (no Visualg, <code>interrompa</code>). Sem ele, a busca continuaria e acabaria guardando o <b>último</b> item caro, e não o primeiro.</p>
${caixa("info", "Eficiência", "<p>Numa lista com 1.000 itens, se o procurado está na posição 3, o <code>break</code> evita 997 comparações inúteis. Quanto mais cedo o laço para, menos trabalho o computador faz.</p>")}

<h2>5. Laço dentro de laço (aninhado)</h2>
<p>Um <code>for</code> pode ficar dentro de outro: para cada volta do de fora, o de dentro roda <b>inteiro</b>. Com 3 voltas fora e 4 dentro, o bloco interno roda 3 × 4 = 12 vezes. Você vai usar isso na próxima etapa, para ordenar a lista.</p>`,
    quiz: [
      { p: "Depois de precos = [25, 2.5, 150], quanto vale precos[1]?", ops: ["25", "2.5", "150", "Dá erro"], certa: 1, expl: "A primeira posição é 0. Então precos[0] é 25 e precos[1] é 2.5." },
      { p: "Sem o break, a busca do item acima de R$ 100,00 guardaria:", ops: ["O primeiro item caro", "O último item caro", "Nenhum item"], certa: 1, expl: "Sem parar, o laço continua e cada item caro encontrado substitui o anterior. Fica o último." },
      { p: "Um for de 3 voltas com outro for de 5 voltas dentro. Quantas vezes o bloco de dentro roda?", ops: ["8", "15", "5", "3"], certa: 1, expl: "Para cada uma das 3 voltas de fora, o de dentro roda 5 vezes: 3 × 5 = 15." },
    ],
    pratica: [
      passoAbrir(10),
      {
        titulo: "Lacunas 1 e 2: guardar cada item nas listas",
        html: `${vscode({ etapa: 10, aberto: true, linhas: [linhaDe(10, "produtos = []"), linhaDe(10, "PRÓXIMO item") + 1], realce: "lacunas" })}
        <p>As listas <code>produtos</code> e <code>precos</code> são criadas vazias antes do laço. Dentro do <code>while</code>, cada item precisa ser guardado:</p>
        ${py(`    produtos.___(nome)
    precos.append(___)`)}
        ${dica("Dica", "<p>O comando que acrescenta no fim da lista está na tabela da Teoria. Na segunda linha, qual variável guarda o preço que acabou de ser digitado?</p>")}`,
      },
      {
        titulo: `Lacuna 3 (linha ${linhaDe(10, "range(___(produtos))")}): o range da nota`,
        html: `${py(`for i in range(___(produtos)):`)}
        <p>O <code>for</code> precisa passar por todos os índices: 0, 1, 2... até o último. Que função diz <b>quantos itens</b> a lista tem?</p>`,
      },
      {
        titulo: "Lacunas 4 e 5: contar e parar a busca",
        html: `${vscode({ etapa: 10, aberto: true, linhas: ["ETAPA 10: CONTAGEM", linhaDe(10, 'print("Conferir com o gerente:"')], realce: "lacunas" })}
        ${py(`        caros = ___`)}
        <p>Quando o preço é 50 ou mais, o contador <code>caros</code> ganha <b>mais 1</b>. Escreva a conta completa (como o contador da Etapa 8).</p>
        ${py(`        ___  # achou o primeiro: para a busca`)}
        <p>Quando acha o primeiro item acima de R$ 100,00, o laço deve <b>parar</b>. Qual palavra do Python faz isso? Mantenha o recuo.</p>`,
      },
      passoSalvar(),
      passoRodar(10, caixa("pense", "Teste o break", "<p>Rode com <code>Mochila 150</code>, <code>Calculadora 120</code> e <code>Caderno 25</code>. Deve aparecer <b>Conferir com o gerente: Mochila</b> (o primeiro). Se aparecer Calculadora, o break não está funcionando.</p>")),
      passoVerificar(10),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 11
  E[11] = {
    n: 11, semana: "Semana 11", tema: "Vetores: acesso, busca, ordenação e estatísticas",
    titulo: "Estatísticas e ordenação (vetores)",
    resumo: "O caixa descobre o item mais caro e o mais barato e ordena a compra com o Bubble Sort.",
    objetivos: ["Achar o maior e o menor valor de um vetor sem funções prontas.", "Ordenar com o Bubble Sort, trocando vizinhos com uma variável auxiliar.", "Manter listas paralelas certas durante a ordenação."],
    teoria: `
<h2>1. Vetor, lista: o mesmo papel</h2>
<p>Na apostila, <b>vetor</b> é um conjunto de valores do mesmo tipo com um nome só e posições numeradas. Em Python, a <b>lista</b> faz esse papel. No Visualg, a primeira posição é 1; no Python, é <b>0</b>.</p>

<h2>2. Maior e menor: olhar um por um</h2>
<p>A ideia: “o maior até agora é o primeiro”. Depois, olhando os outros, sempre que aparecer um valor <b>maior</b> que ele, esse passa a ser o maior.</p>
${compara(`maior <- precos[1]
para i de 1 ate n faca
   se precos[i] > maior entao
      maior <- precos[i]
   fimse
fimpara`, `maior = precos[0]
for p in precos:
    if p > maior:
        maior = p`)}
${caixa("atencao", "Por que não começar com zero?", "<p>Para o maior até funcionaria com preços, mas para o <b>menor</b> não: nenhum preço é menor que 0, e o resultado ficaria errado. Começar com o primeiro item funciona sempre.</p>")}
<p>O Python tem <code>max()</code> e <code>min()</code> prontos, mas nesta etapa o objetivo é entender o <b>algoritmo</b>: por isso o verificador não aceita as funções prontas.</p>

<h2>3. Bubble Sort (ordenação por bolha)</h2>
<p>Compara cada par de <b>vizinhos</b>; se estiverem fora de ordem, <b>troca</b>. A cada passada, o maior valor “borbulha” até o fim. Com <code>n</code> itens, bastam <code>n - 1</code> passadas.</p>
<table class="tab"><tr><th>Passada</th><th>Comparação</th><th>Lista</th></tr>
<tr><td>início</td><td></td><td>[25, 2.5, 150]</td></tr>
<tr><td>1</td><td>25 &gt; 2.5? sim, troca</td><td>[2.5, 25, 150]</td></tr>
<tr><td>1</td><td>25 &gt; 150? não</td><td>[2.5, 25, 150]</td></tr>
<tr><td>2</td><td>2.5 &gt; 25? não</td><td>[2.5, 25, 150] ✓ ordenada</td></tr></table>

<h2>4. A troca precisa de uma variável auxiliar</h2>
<p>Para trocar dois copos de suco você precisa de um terceiro copo vazio. Com variáveis é igual:</p>
${py(`aux = precos[j]
precos[j] = precos[j + 1]
precos[j + 1] = aux`)}
${caixa("atencao", "Listas paralelas: troque as duas!", "<p>Se trocar só os preços, os nomes ficam no lugar antigo e a nota diz que o caderno custa R$ 2,50. Toda troca em <code>precos</code> precisa da mesma troca em <code>produtos</code>.</p>")}`,
    quiz: [
      { p: "Para achar o MENOR preço, quando a variável menor deve ser trocada?", ops: ["Quando p > menor", "Quando p < menor", "Sempre", "Nunca"], certa: 1, expl: "O menor só muda quando aparece um valor ainda menor que ele." },
      { p: "Na lista [40, 20], o Bubble Sort compara 40 > 20. O que acontece?", ops: ["Nada", "Troca: fica [20, 40]", "Remove o 40", "Para a ordenação"], certa: 1, expl: "Os vizinhos estão fora de ordem (o maior vem antes), então são trocados." },
      { p: "Para que serve a variável aux na troca?", ops: ["Contar as trocas", "Guardar um valor para ele não se perder", "Somar os preços", "Parar o laço"], certa: 1, expl: "Sem ela, ao copiar um valor por cima do outro, o primeiro se perde. A aux guarda uma cópia durante a troca." },
    ],
    pratica: [
      passoAbrir(11),
      {
        titulo: "Encontre a parte ETAPA 11",
        html: `${vscode({ etapa: 11, aberto: true, linhas: ["ETAPA 11:", linhaDe(11, "produtos[j + 1] = aux")], realce: "lacunas" })}
        <p>Tudo fica dentro de <code>if len(precos) &gt; 0:</code>: numa compra vazia não existe maior nem menor. São <b>4 lacunas</b>.</p>`,
      },
      {
        titulo: "Lacunas 1 e 2: maior e menor",
        html: `${py(`        if p ___ maior:
            maior = p
        if p < menor:
            menor = ___`)}
        ${caixa("pense", "Pense", "<p>A primeira lacuna é um comparador: quando <code>p</code> deve virar o novo maior? Na segunda, o <code>if</code> já está pronto: <b>quem</b> passa a ser o menor?</p>")}`,
      },
      {
        titulo: "Lacunas 3 e 4: o Bubble Sort",
        html: `${py(`            if precos[j] ___ precos[j + 1]:
                aux = precos[j]
                precos[j] = precos[j + 1]
                precos[j + 1] = aux
                aux = produtos[j]
                produtos[j] = ___
                produtos[j + 1] = aux`)}
        <ul><li><b>Lacuna 3:</b> queremos do mais barato ao mais caro. Os vizinhos estão fora de ordem quando o da esquerda é ___ que o da direita?</li>
        <li><b>Lacuna 4:</b> a troca dos nomes é igual à dos preços, 3 linhas acima. Compare as duas e complete.</li></ul>
        ${dica("Dica", "<p>Desenhe numa folha a lista [25, 2.5, 150] e faça as trocas à mão, como na tabela da Teoria.</p>")}`,
      },
      passoSalvar(),
      passoRodar(11),
      passoVerificar(11),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 12
  E[12] = {
    n: 12, semana: "Semana 12", tema: "Matrizes (arrays bidimensionais)",
    titulo: "Relatório da semana (matriz)",
    resumo: "No fim da venda, o caixa pode mostrar o relatório da semana, calculado de uma matriz.",
    objetivos: ["Representar uma tabela como matriz (lista de listas).", "Acessar uma célula com [linha][coluna].", "Somar por linha e por coluna com laços aninhados, reiniciando o acumulador."],
    teoria: `
<h2>1. Matriz: uma tabela com linhas e colunas</h2>
<p>A papelaria anotou quantas unidades vendeu de cada categoria em cada dia da semana:</p>
<table class="tab"><tr><th>vendas</th><th>Seg (0)</th><th>Ter (1)</th><th>Qua (2)</th><th>Qui (3)</th><th>Sex (4)</th></tr>
<tr><th>Cadernos (0)</th><td>12</td><td>8</td><td>15</td><td>10</td><td>20</td></tr>
<tr><th>Canetas (1)</th><td>30</td><td>25</td><td>40</td><td>35</td><td>50</td></tr>
<tr><th>Mochilas (2)</th><td>2</td><td>1</td><td>3</td><td>0</td><td>4</td></tr></table>
<p>É uma <b>matriz 3 × 5</b> (3 linhas, 5 colunas). Em Python, é uma <b>lista de listas</b>: cada linha é uma lista.</p>
${py(`vendas = [
    [12, 8, 15, 10, 20],   # linha 0: Cadernos
    [30, 25, 40, 35, 50],  # linha 1: Canetas
    [2, 1, 3, 0, 4],       # linha 2: Mochilas
]
print(vendas[1][4])   # 50 -> linha 1 (Canetas), coluna 4 (Sex)`)}
${caixa("info", "Primeiro a linha, depois a coluna", "<p><code>vendas[i][j]</code>: <code>i</code> é a linha e <code>j</code> é a coluna. Trocar a ordem dá outro valor, ou erro (<code>IndexError</code>), porque só existem 3 linhas.</p>")}

<h2>2. Percorrer a matriz: um for dentro do outro</h2>
${compara(`para i de 1 ate 3 faca
   total_linha <- 0
   para j de 1 ate 5 faca
      total_linha <- total_linha + vendas[i, j]
   fimpara
   escreva(categorias[i], total_linha)
fimpara`, `for i in range(len(categorias)):
    total_linha = 0
    for j in range(len(dias)):
        total_linha = total_linha + vendas[i][j]
    print(categorias[i], total_linha)`)}
<p>O <code>for</code> de fora escolhe a <b>linha</b>; o de dentro passa por todas as <b>colunas</b> dela.</p>
${caixa("atencao", "Reinicie o acumulador!", "<p><code>total_linha = 0</code> fica <b>dentro</b> do for de fora: cada categoria começa a soma do zero. Se ficar fora, as Canetas somam também os Cadernos (180 + 65 = 245).</p>")}

<h2>3. Somar uma coluna (o melhor dia)</h2>
<p>Para o total de cada <b>dia</b>, invertemos os laços: o de fora percorre as colunas (<code>j</code>) e o de dentro as linhas (<code>i</code>). Sexta: 20 + 50 + 4 = <b>74</b> unidades, o melhor dia.</p>`,
    quiz: [
      { p: "Na matriz da Teoria, quanto vale vendas[2][0]?", ops: ["12", "2", "30", "0"], certa: 1, expl: "Linha 2 (Mochilas), coluna 0 (Seg): 2." },
      { p: "Quantas células tem uma matriz 3 × 5?", ops: ["8", "15", "35", "53"], certa: 1, expl: "3 linhas × 5 colunas = 15 células." },
      { p: "Onde deve ficar total_linha = 0 para somar cada linha separadamente?", ops: ["Antes dos dois for", "Dentro do for de fora, antes do de dentro", "Dentro do for de dentro", "Depois dos dois for"], certa: 1, expl: "Cada linha começa do zero, então a soma é zerada no começo de cada volta do for de fora." },
    ],
    pratica: [
      passoAbrir(12),
      {
        titulo: "Encontre a parte ETAPA 12",
        html: `${vscode({ etapa: 12, aberto: true, linhas: ["ETAPA 12:", linhaDe(12, 'print("Total da semana:"')], realce: "lacunas" })}
        <p>O relatório só aparece se a pessoa responder <code>s</code>. A matriz <code>vendas</code> já está pronta. São <b>4 lacunas</b>, em 3 linhas, todas na soma por categoria.</p>`,
      },
      {
        titulo: "Lacuna 1: reiniciar a soma de cada linha",
        html: `${py(`        total_linha = ___`)}<p>Com quanto cada categoria começa a soma?</p>`,
      },
      {
        titulo: "Lacuna 2: o for das colunas",
        html: `${py(`        for j in range(len(___)):`)}<p>O <code>j</code> percorre as <b>colunas</b>. Cada coluna é um <b>dia</b>. Qual lista tem um item para cada coluna?</p>`,
      },
      {
        titulo: "Lacunas 3 e 4: acessar a célula",
        html: `${py(`            total_linha = total_linha + vendas[___][___]`)}
        <p>Primeiro a <b>linha</b> (a categoria da vez, do for de fora), depois a <b>coluna</b> (o dia da vez, do for de dentro). Quais são as variáveis de controle desses dois laços?</p>`,
      },
      passoSalvar(),
      passoRodar(12, caixa("pense", "Confira com a tabela", "<p>Os totais devem dar Cadernos 65, Canetas 180 e Mochilas 10 (total 255), e o melhor dia é Sex, com 74. Faça a soma da primeira linha à mão e compare.</p>")),
      passoVerificar(12),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 13
  E[13] = {
    n: 13, semana: "Semana 13", tema: "Funções e procedimentos: modularização",
    titulo: "Funções (modularização)",
    resumo: "O mesmo caixa, agora dividido em funções com nome. Ele faz exatamente o que fazia na Etapa 12.",
    objetivos: ["Criar funções com def, parâmetros e return.", "Diferenciar função (devolve valor) de procedimento (só executa).", "Usar o bloco if __name__ == \"__main__\"."],
    teoria: `
<h2>1. Por que modularizar?</h2>
<p>O Caixa v2 passou de 140 linhas, numa sequência só. Fica difícil achar onde está cada regra. <b>Modularizar</b> é dividir o programa em <b>funções</b>: blocos com nome, cada um com uma tarefa. É como uma cozinha com estações: cada uma faz uma parte.</p>
${caixa("info", "Refatorar não muda o resultado", "<p>Nesta etapa o caixa faz <b>exatamente</b> o que fazia na Etapa 12, com os mesmos testes e as mesmas telas. Melhorar a organização sem mudar o comportamento se chama <b>refatoração</b>.</p>")}

<h2>2. Anatomia de uma função</h2>
${compara(`Funcao calcular_frete(subtotal: real): real
inicio
   se (subtotal > 0) e (subtotal < 200) entao
      retorne 15
   fimse
   retorne 0
FimFuncao`, `def calcular_frete(subtotal):
    if subtotal > 0 and subtotal < 200:
        return 15
    return 0`)}
<table class="tab"><tr><th>Parte</th><th>No exemplo</th><th>O que é</th></tr>
<tr><td><code>def</code></td><td><code>def</code></td><td>“Vou definir uma função.”</td></tr>
<tr><td>Nome</td><td><code>calcular_frete</code></td><td>Em <b>snake_case</b>: minúsculas, palavras separadas por _.</td></tr>
<tr><td>Parâmetro</td><td><code>subtotal</code></td><td>Nome que recebe o valor enviado na chamada.</td></tr>
<tr><td><code>return</code></td><td><code>return 15</code></td><td>Devolve o resultado e <b>sai</b> da função na hora.</td></tr></table>
<p>Na <b>chamada</b>, o valor enviado é o <b>argumento</b>: <code>frete = calcular_frete(subtotal)</code>.</p>

<h2>3. Função ou procedimento?</h2>
<table class="tab"><tr><th></th><th>Devolve valor?</th><th>No caixa</th></tr>
<tr><td><b>Função</b></td><td>Sim, com <code>return</code>.</td><td><code>calcular_frete</code>, <code>maior_valor</code></td></tr>
<tr><td><b>Procedimento</b></td><td>Não: só executa uma ação.</td><td><code>mostrar_relatorio</code>, <code>ordenar</code></td></tr></table>

<h2>4. Escopo: cada função tem suas variáveis</h2>
<p>Uma variável criada <b>dentro</b> de uma função só existe lá dentro (é <b>local</b>). O <code>maior</code> de <code>maior_valor</code> não conflita com nada fora dela. Por isso as funções recebem o que precisam por <b>parâmetros</b> e entregam o resultado por <b>return</b>.</p>

<h2>5. DRY e o bloco __main__</h2>
<p>A pergunta “Item (ou Enter...)” aparecia <b>duas vezes</b> no while. Agora existe a função <code>pedir_item()</code>, chamada nos dois lugares. Esse é o princípio <b>DRY</b> (<i>Don't Repeat Yourself</i>): cada regra em um lugar só.</p>
${py(`if __name__ == "__main__":
    main()`)}
<p>Este bloco quer dizer: “só rode o caixa se <b>este arquivo</b> foi executado diretamente”. Na próxima etapa, outro arquivo vai importar funções daqui, e esse bloco evita que o caixa comece sozinho.</p>`,
    quiz: [
      { p: "Em frete = calcular_frete(subtotal), o subtotal é:", ops: ["O parâmetro", "O argumento", "O retorno", "O nome da função"], certa: 1, expl: "O valor enviado na chamada é o argumento. O parâmetro é o nome que aparece na linha do def." },
      { p: "Qual nome segue a convenção snake_case?", ops: ["CalcularFrete", "calcularfrete", "calcular_frete", "Calcular-Frete"], certa: 2, expl: "snake_case usa letras minúsculas e palavras separadas por sublinhado." },
      { p: "O que acontece com as linhas de uma função logo depois de um return?", ops: ["Rodam normalmente", "Não rodam: o return sai da função", "Rodam duas vezes", "Dão erro"], certa: 1, expl: "O return devolve o valor e encerra a função na hora." },
    ],
    pratica: [
      passoAbrir(13),
      {
        titulo: "O mapa do arquivo: quem é quem",
        html: `<p>Role o arquivo de cima a baixo. Ele tem 3 partes:</p>
        <table class="tab"><tr><th>Parte</th><th>Funções</th></tr>
        <tr><td><b>Funções de regra</b> (calculam e devolvem)</td><td><code>calcular_frete</code>, <code>sublinhado_de</code>, <code>contar_a_partir_de</code>, <code>primeiro_acima</code>, <code>maior_valor</code>, <code>menor_valor</code>, <code>ordenar</code>, <code>total_da_linha</code></td></tr>
        <tr><td><b>Funções da tela</b> (perguntam e mostram)</td><td><code>pedir_item</code>, <code>mostrar_relatorio</code></td></tr>
        <tr><td><b>Programa principal</b></td><td><code>main</code> e o bloco <code>if __name__ == "__main__":</code></td></tr></table>
        <p>Compare com a Etapa 12: o código de cada função é o mesmo trecho que antes ficava solto. São <b>6 lacunas</b>.</p>`,
      },
      {
        titulo: "Lacunas 1 e 2: definir e devolver",
        html: `${vscode({ etapa: 13, aberto: true, linhas: [linhaDe(13, "def calcular_frete") - 1, linhaDe(13, "def calcular_frete") + 4], realce: "lacunas" })}
        ${py(`def calcular_frete(___):`)}
        <p>Que valor a função precisa <b>receber</b> para decidir o frete? Olhe o corpo da função: qual variável ela usa nas comparações?</p>
        ${py(`    return ___`)}
        <p>(Linha ${linhaDe(13, "    return ___")}, no fim de <code>maior_valor</code>.) A função procurou o maior valor e o guardou numa variável. O que ela deve <b>devolver</b>?</p>`,
      },
      {
        titulo: "Lacunas 3 e 4: chamar as funções no main",
        html: `${vscode({ etapa: 13, aberto: true, linhas: [linhaDe(13, "def main():"), linhaDe(13, "frete = calcular_frete(___)")], realce: "lacunas" })}
        ${py(`    nome = ___()`)}
        <p>Qual função pergunta o próximo item? (Ela já é usada no fim do while: copie o mesmo nome.)</p>
        ${py(`    frete = calcular_frete(___)`)}
        <p>O frete depende do valor dos produtos. Qual variável do <code>main</code> guarda esse valor?</p>`,
      },
      {
        titulo: "Lacunas 5 e 6: o bloco __main__",
        html: `${py(`if __name__ == "___":
    ___()`)}
        <p>O nome especial tem 2 sublinhados de cada lado (veja a Teoria). Na linha de baixo, chame a função que roda o caixa inteiro.</p>
        ${caixa("atencao", "Se nada aparecer na tela...", "<p>...o programa definiu as funções, mas ninguém chamou o <code>main()</code>. É o erro mais comum quando se começa a usar funções.</p>")}`,
      },
      passoSalvar(),
      passoRodar(13, caixa("ok", "Mesma tela da Etapa 12", "<p>A saída deve ser idêntica à da Etapa 12. Essa é a prova de que a refatoração não mudou o comportamento do caixa.</p>")),
      passoVerificar(13),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 14
  E[14] = {
    n: 14, semana: "Semana 14", tema: "Revisão integrada e modularização",
    titulo: "Dois módulos e testes",
    resumo: "As regras vão para um módulo próprio, o regras.py, com testes automáticos. Fim do Caixa v2!",
    objetivos: ["Separar o programa em dois módulos: regras e tela.", "Importar funções com from ... import.", "Escrever testes com assert e fazer revisão de código em dupla."],
    teoria: `
<h2>1. Um módulo é um arquivo .py</h2>
<p>Um <b>módulo</b> é um arquivo Python com funções que outros arquivos podem usar. Nesta etapa o caixa fica em <b>dois</b> arquivos, na mesma pasta:</p>
<table class="tab"><tr><th>Arquivo</th><th>Papel</th><th>Tem</th></tr>
<tr><td><code>regras.py</code></td><td><b>Lógica</b>: só calcula. Não pergunta nada nem mostra a venda.</td><td>As 8 funções de regra e os testes.</td></tr>
<tr><td><code>papelaria.py</code></td><td><b>Tela</b>: conversa com o cliente.</td><td><code>pedir_item</code>, <code>mostrar_relatorio</code> e <code>main</code>.</td></tr></table>
<p>Vantagem: dá para testar as regras sem digitar uma compra inteira, e mudar a tela sem mexer nas regras.</p>

<h2>2. Importar</h2>
${py(`from regras import calcular_frete, maior_valor
frete = calcular_frete(150)   # usa a função que está no regras.py`)}
<p>O nome depois de <code>from</code> é o nome do arquivo <b>sem</b> o <code>.py</code>. Os dois arquivos precisam estar na <b>mesma pasta</b>.</p>

<h2>3. Testes automáticos com assert</h2>
<p><code>assert</code> quer dizer “garanta que”. Se a condição for verdadeira, nada acontece; se for falsa, o Python para com <code>AssertionError</code>:</p>
${py(`assert calcular_frete(50) == 15    # passa em silêncio
assert calcular_frete(50) == 0     # AssertionError!`)}
<p>Os testes ficam no fim do <code>regras.py</code>, dentro do <code>if __name__ == "__main__":</code>. Eles rodam quando você executa <code>python etapa-14/regras.py</code>, mas <b>não</b> quando o <code>papelaria.py</code> importa o módulo.</p>
${caixa("info", "Teste os limites", "<p>Os bons testes ficam nas fronteiras das regras: frete com 0, com 199,99 e com exatamente 200. São os casos em que um <code>&lt;</code> trocado por <code>&lt;=</code> aparece.</p>")}

<h2>4. Revisão de código (code review)</h2>
<p>Em equipes de software, ninguém publica código sem que um colega leia. Use este roteiro com a sua dupla:</p>
<table class="tab"><tr><th>Pergunta</th></tr>
<tr><td>Os nomes das funções e variáveis dizem o que elas fazem?</td></tr>
<tr><td>Alguma regra aparece repetida em dois lugares (fere o DRY)?</td></tr>
<tr><td>Cada função faz uma coisa só?</td></tr>
<tr><td>Os testes cobrem os valores de limite?</td></tr></table>
<p>O feedback deve ser <b>assertivo</b>: aponte o trecho, explique o problema e sugira uma melhora, sempre sobre o código e não sobre a pessoa.</p>`,
    quiz: [
      { p: "Para usar maior_valor do arquivo regras.py, qual linha está certa?", ops: ["import regras.py", "from regras import maior_valor", "from regras.py import maior_valor", "include regras"], certa: 1, expl: "O nome do módulo vai sem o .py: from regras import maior_valor." },
      { p: "O que acontece quando um assert é falso?", ops: ["Nada", "O Python para com AssertionError", "Ele vira verdadeiro", "O teste é pulado"], certa: 1, expl: "assert falso interrompe o programa com AssertionError, mostrando a linha do teste que falhou." },
      { p: "Por que os testes do regras.py não rodam quando o papelaria.py importa o módulo?", ops: ["Porque estão comentados", "Porque estão dentro do if __name__ == \"__main__\"", "Porque o import ignora asserts", "Porque estão em outra pasta"], certa: 1, expl: "Importado, o módulo tem __name__ igual a \"regras\". O bloco só roda quando o arquivo é executado diretamente." },
    ],
    pratica: [
      passoAbrir(14),
      {
        titulo: "Abra também o regras.py",
        html: `<p>Nesta etapa a pasta <b>etapa-14</b> tem <b>dois</b> programas. Abra os dois (cada um fica numa aba do VS Code).</p>
        ${vscode({ etapa: 14, arquivoSel: "regras.py", aberto: true, linhas: [1, 13], marcas: { arquivo: 1 } })}
        <p>São <b>4 lacunas</b>: 1 no <code>papelaria.py</code> e 3 nos testes do <code>regras.py</code>.</p>`,
      },
      {
        titulo: `Lacuna 1, no papelaria.py (linha ${linhaDe(14, "from ___ import")}): importar as regras`,
        html: `${vscode({ etapa: 14, aberto: true, linhas: [linhaDe(14, "As REGRAS"), linhaDe(14, "from ___ import") + 3], realce: "lacunas" })}
        <p>De qual módulo vêm as funções? Escreva o nome do arquivo <b>sem</b> o <code>.py</code>.</p>`,
      },
      {
        titulo: "Lacunas 2, 3 e 4, no regras.py: os resultados esperados",
        html: `${vscode({ etapa: 14, arquivoSel: "regras.py", aberto: true, linhas: [linhaDe(14, 'if __name__ == "__main__":', "regras.py"), linhaDe(14, "menor_valor([3, 9, 2])", "regras.py")], realce: "lacunas" })}
        ${py(`    assert calcular_frete(199.99) == ___
    assert calcular_frete(200) == ___
    assert maior_valor([3, 9, 2]) == ___`)}
        <p>Calcule <b>à mão</b> o que cada função deve devolver e escreva o número. Releia a regra do frete na função <code>calcular_frete</code>, no começo do arquivo.</p>`,
      },
      passoSalvar(),
      {
        titulo: "Rode os testes do módulo",
        html: `${cmd("python etapa-14/regras.py")}
        ${terminal(["$ python etapa-14/regras.py", "Todos os testes de regras.py passaram!", "$"], "Se algum assert falhar, aparece AssertionError com o número da linha do teste.")}`,
      },
      passoRodar(14, "", 1),
      passoVerificar(14),
      {
        titulo: "Revisão de código em dupla",
        html: `<p>Troque de computador com um colega que também terminou e leia o <code>regras.py</code> dele com o roteiro da Teoria (parte 4). Anote:</p>
        <ul><li>uma coisa que está <b>bem feita</b> e por quê;</li><li>uma <b>sugestão</b> de melhora, com a linha.</li></ul>
        <p>Use essas anotações na reflexão da aba <b>Conferir e entregar</b>.</p>`,
      },
    ],
    fim: caixa("ok", "🎉 Você construiu o Caixa v2 da Papelaria Ponto Certo!", "<p>Ele aceita compras de qualquer tamanho, imprime a nota, calcula estatísticas, ordena, parcela e mostra o relatório da semana, em dois módulos testados. No 3º bimestre, o caixa vai aprender a <b>guardar</b> as vendas em arquivos e planilhas.</p>"),
  };

  // =====================================================================
  // 3º BIMESTRE · O FECHAMENTO DO DIA (Caixa v3)
  // =====================================================================
  const exemploFalhaFuncao = (n, nome, chamada, deveria, devolveu, d) => terminal([
    "[FALHOU] Teste 4 - " + nome, "  Chamada:           " + chamada, "  Deveria devolver:  " + deveria, "  Devolveu:          " + devolveu, "  DICA: " + d],
    "Exemplo de falha num teste de função: o verificador chamou a função com esses valores e conferiu o que ela devolveu.");

  // ---------------------------------------------------------------- ETAPA 15
  E[15] = {
    n: 15, semana: "Semana 15", tema: "Vetores em Python: percurso, busca e estatísticas",
    titulo: "Estatísticas do dia (vetores)",
    resumo: "Nasce o Caixa v3: no fim do dia, ele soma, tira a média e procura vendas num vetor.",
    objetivos: ["Percorrer um vetor com while, usando um índice e uma condição de parada.", "Fazer uma busca linear que devolve a posição (ou -1).", "Calcular estatísticas simples sem funções prontas."],
    teoria: `
<h2>1. O Caixa v3: o fechamento do dia</h2>
<p>Nos bimestres anteriores o caixa atendia <b>um cliente</b>. Agora, no fim do expediente, o dono quer saber <b>como foi o dia</b>: total vendido, média, vendas grandes... O Caixa v3 <b>não faz perguntas</b>: ele recebe as vendas do dia e mostra os relatórios.</p>
${caixa("info", "Já começa organizado em funções", "<p>Como você aprendeu na Etapa 13, o programa tem <b>funções</b> (cada uma com uma tarefa) e o <code>main()</code>. Isso permite ao verificador <b>testar cada função sozinha</b>, com vários valores diferentes: é assim que os programadores testam programas de verdade.</p>")}

<h2>2. Vetor: revisão rápida</h2>
<table class="tab"><tr><th>Código</th><th>Resultado</th></tr>
<tr><td><code>totais = [42.5, 177.5, 15.0]</code></td><td>um vetor com 3 vendas</td></tr>
<tr><td><code>totais[0]</code></td><td>42.5 (a primeira posição é 0)</td></tr>
<tr><td><code>len(totais)</code></td><td>3</td></tr>
<tr><td><code>totais[3]</code></td><td><b>IndexError</b>: a última posição é <code>len - 1</code> = 2</td></tr></table>

<h2>3. Percorrer com while: índice e condição de parada</h2>
<p>O <code>for</code> é o jeito mais curto de percorrer, mas o <code>while</code> mostra o que acontece por dentro: um <b>índice</b> <code>i</code> começa em 0, avança de 1 em 1, e a <b>condição de parada</b> <code>i &lt; len(valores)</code> impede passar do fim.</p>
${compara(`total <- 0
i <- 1
enquanto i <= n faca
   total <- total + valores[i]
   i <- i + 1
fimenquanto`, `total = 0
i = 0
while i < len(valores):
    total = total + valores[i]
    i = i + 1`)}
${caixa("atencao", "Python começa no 0", "<p>No Visualg o índice vai de 1 até n (<code>&lt;=</code>). No Python vai de 0 até <code>len - 1</code>, por isso a condição é <code>i &lt; len(valores)</code>. Com <code>&lt;=</code> o laço tenta ler uma posição que não existe (IndexError). Sem o <code>i = i + 1</code>, o laço nunca acaba.</p>")}

<h2>4. Busca linear</h2>
<p>Procurar um valor olhando posição por posição, do começo ao fim, até achar. A condição tem <b>duas partes</b>:</p>
${py(`i = 0
while i < len(valores) and valores[i] != alvo:
    i = i + 1
# saiu do laço: ou achou (valores[i] == alvo) ou acabou o vetor`)}
<ul><li><code>i &lt; len(valores)</code>: ainda há posições para olhar;</li><li><code>valores[i] != alvo</code>: ainda não achou.</li></ul>
<p>A ordem importa: o Python testa da esquerda para a direita e, com <code>and</code>, para no primeiro falso. Assim, quando <code>i</code> chega ao fim, ele nem tenta ler <code>valores[i]</code>. Se não achar, a função devolve <b>-1</b>, uma posição que não existe: é a convenção para “não encontrado”.</p>

<h2>5. Estatísticas</h2>
<table class="tab"><tr><th>Função</th><th>O que devolve</th></tr>
<tr><td><code>soma(valores)</code></td><td>a soma de todos</td></tr>
<tr><td><code>media(valores)</code></td><td>soma ÷ quantidade, ou 0 se o vetor estiver vazio</td></tr>
<tr><td><code>posicao_de(valores, alvo)</code></td><td>a posição do 1º valor igual ao alvo, ou -1</td></tr>
<tr><td><code>quantos_acima(valores, limite)</code></td><td>quantos valores são maiores que o limite</td></tr></table>
<p>Nesta etapa o verificador não aceita <code>sum()</code> nem <code>.index()</code> prontos: o objetivo é escrever o algoritmo.</p>`,
    quiz: [
      { p: "Com valores = [4, 7], qual condição percorre o vetor sem dar IndexError?", ops: ["while i <= len(valores):", "while i < len(valores):", "while i < len(valores) + 1:", "while i != 0:"], certa: 1, expl: "As posições são 0 e 1. Com i < 2 o laço para antes do 2, que não existe." },
      { p: "posicao_de([5, 8, 8], 8) devolve:", ops: ["1", "2", "8", "-1"], certa: 0, expl: "A busca para no PRIMEIRO 8 encontrado, na posição 1." },
      { p: "Por que media([]) deve devolver 0 antes de dividir?", ops: ["Porque 0 é a média de qualquer vetor", "Para não dividir por zero (len([]) é 0)", "Porque o Python exige", "Para economizar memória"], certa: 1, expl: "Dividir por len([]) seria dividir por zero, e o programa pararia com ZeroDivisionError." },
    ],
    pratica: [
      passoAbrir(15),
      {
        titulo: "Conheça o Caixa v3",
        html: `<p>O arquivo é novo. Role e encontre: o vetor <code>TOTAIS_DO_DIA</code> (as vendas de hoje), as <b>4 funções</b> da Etapa 15 e o <code>main()</code>, que monta o relatório. São <b>5 lacunas</b>, todas dentro das funções.</p>
        ${vscode({ etapa: 15, aberto: true, linhas: [linhaDe(15, "TOTAIS_DO_DIA = ") - 1, linhaDe(15, "return soma(valores) /")], realce: "lacunas" })}`,
      },
      {
        titulo: `Lacunas 1 e 2 (linhas ${linhaDe(15, "while i ___ len")} e ${linhaDe(15, "i = ___")}): o percurso da soma`,
        html: `${py(`    while i ___ len(valores):
        total = total + valores[i]
        i = ___`)}
        ${caixa("pense", "Pense", "<p>1. Que comparador faz o laço parar <b>antes</b> de <code>len(valores)</code>? (Releia o quadro “Python começa no 0”.)<br>2. Para ir à próxima posição, quanto <code>i</code> deve valer? Escreva a conta completa.</p>")}`,
      },
      {
        titulo: `Lacuna 3 (linha ${linhaDe(15, "return soma(valores) /")}): a média`,
        html: `${py(`    return soma(valores) / ___`)}<p>Média = soma ÷ <b>quantidade</b> de valores. Qual função diz quantos valores o vetor tem?</p>`,
      },
      {
        titulo: "Lacunas 4 e 5: a busca linear",
        html: `${vscode({ etapa: 15, aberto: true, linhas: [linhaDe(15, "def posicao_de"), linhaDe(15, "    return ___")], realce: "lacunas" })}
        <ul><li><b>Lacuna 4:</b> o laço continua enquanto o valor da posição for <b>diferente</b> do alvo. Qual comparador?</li>
        <li><b>Lacuna 5:</b> se o laço acabou sem achar, o que a função devolve? (Releia a Teoria, parte 4.)</li></ul>`,
      },
      passoSalvar(),
      passoRodar(15),
      {
        titulo: "Rode o verificador (agora ele também testa as funções)",
        html: `${cmd("python etapa-15/verificar.py")}
        <p>Primeiro ele roda o programa inteiro e compara o relatório. Depois <b>chama cada função</b> com valores diferentes, inclusive casos difíceis, como um vetor vazio. Se uma falhar, ele mostra a chamada, o que deveria devolver e o que devolveu:</p>
        ${exemploFalhaFuncao(15, "média de um vetor vazio", "media([])", "0", "(o programa parou com erro)", "Vetor vazio: a função devolve 0 antes de dividir.")}
        <p>Com <b>PARABÉNS</b> e o código de conclusão na tela, vá para a aba <a href="#etapa-15/entregar"><b>3 · Conferir e entregar</b></a>.</p>`,
      },
    ],
  };

  // ---------------------------------------------------------------- ETAPA 16
  E[16] = {
    n: 16, semana: "Semana 16", tema: "Matrizes: percurso, agregação e planilha de vendas",
    titulo: "Planilha da semana (matriz)",
    resumo: "O fechamento ganha a planilha da semana: total de cada dia e de cada forma de pagamento.",
    objetivos: ["Representar uma planilha como matriz (lista de listas).", "Somar cada linha e cada coluna com laços aninhados e devolver o resultado numa lista.", "Ler uma tabela alinhada com f-strings."],
    teoria: `
<h2>1. A planilha da semana</h2>
<p>O dono anota quanto entrou (em R$) em cada dia, por forma de pagamento. Cada <b>linha</b> é um dia e cada <b>coluna</b> é uma forma de pagamento:</p>
<table class="tab"><tr><th></th><th>Dinheiro (0)</th><th>PIX (1)</th><th>Cartão (2)</th></tr>
<tr><th>Seg (0)</th><td>120.00</td><td>340.50</td><td>210.00</td></tr>
<tr><th>Ter (1)</th><td>95.00</td><td>410.00</td><td>180.50</td></tr>
<tr><th>Qua (2)</th><td>150.50</td><td>290.00</td><td>260.00</td></tr>
<tr><th>Qui (3)</th><td>80.00</td><td>505.50</td><td>199.90</td></tr>
<tr><th>Sex (4)</th><td>210.00</td><td>620.00</td><td>330.00</td></tr></table>
<p>Em Python, é uma <b>lista de listas</b>: <code>planilha[1][2]</code> é a linha 1 (Ter), coluna 2 (Cartão) = 180.50.</p>

<h2>2. Somar cada linha: o total de cada dia</h2>
${compara(`para i de 1 ate 5 faca
   soma_linha <- 0
   para j de 1 ate 3 faca
      soma_linha <- soma_linha + m[i, j]
   fimpara
   // guarda soma_linha
fimpara`, `totais = []
for linha in matriz:
    soma_linha = 0
    for valor in linha:
        soma_linha = soma_linha + valor
    totais.append(soma_linha)`)}
<p>A função <b>devolve uma lista</b> com um total por linha: <code>totais_das_linhas([[1, 2], [3, 4]])</code> devolve <code>[3, 7]</code>.</p>
${caixa("atencao", "O acumulador renasce a cada linha", "<p><code>soma_linha = 0</code> fica <b>dentro</b> do laço de fora. Se ficar fora, a terça soma também a segunda (e o verificador mostra 1356.00 no lugar de 685.50).</p>")}

<h2>3. Somar cada coluna: o total de cada forma de pagamento</h2>
<p>Agora o laço de <b>fora</b> escolhe a coluna <code>j</code> e o de <b>dentro</b> passa por todas as linhas <code>i</code>:</p>
${py(`for j in range(len(matriz[0])):      # quantas colunas: o tamanho da 1ª linha
    soma_coluna = 0
    for i in range(len(matriz)):     # quantas linhas
        soma_coluna = soma_coluna + matriz[i][j]
    totais.append(soma_coluna)`)}
<p><code>len(matriz)</code> é o número de <b>linhas</b>; <code>len(matriz[0])</code> é o número de <b>colunas</b>.</p>

<h2>4. Tabelas alinhadas com f-string</h2>
<p>A planilha aparece alinhada porque o f-string reserva espaço: <code>{valor:&gt;10.2f}</code> = número com 2 casas, alinhado à <b>direita</b> em 10 espaços; <code>{texto:&lt;6}</code> = texto alinhado à <b>esquerda</b> em 6. Você vai estudar isso a fundo na Etapa 19.</p>`,
    quiz: [
      { p: "Na planilha da Teoria, quanto vale planilha[4][1]?", ops: ["620.00", "210.00", "505.50", "330.00"], certa: 0, expl: "Linha 4 (Sex), coluna 1 (PIX): 620.00." },
      { p: "Para uma matriz de 5 linhas e 3 colunas, quanto vale len(matriz[0])?", ops: ["5", "3", "15", "0"], certa: 1, expl: "matriz[0] é a primeira linha, que tem 3 valores: o número de colunas." },
      { p: "totais_das_colunas([[1, 2], [3, 4]]) devolve:", ops: ["[3, 7]", "[4, 6]", "[10]", "[1, 2, 3, 4]"], certa: 1, expl: "Coluna 0: 1 + 3 = 4. Coluna 1: 2 + 4 = 6." },
    ],
    pratica: [
      passoAbrir(16),
      {
        titulo: "Encontre a parte ETAPA 16",
        html: `${vscode({ etapa: 16, aberto: true, linhas: ["ETAPA 16:", linhaDe(16, "matriz[___][___]") + 2], realce: "lacunas" })}
        <p>São 2 funções novas, com <b>5 lacunas</b> em 4 linhas. A planilha e a impressão da tabela já estão prontas no <code>main()</code>.</p>`,
      },
      {
        titulo: "Lacunas 1 e 2: totais das linhas",
        html: `${py(`        soma_linha = ___
        ...
        totais.___(soma_linha)`)}
        <p>Com quanto cada linha começa a soma? E qual comando acrescenta o total da linha no fim da lista <code>totais</code>?</p>`,
      },
      {
        titulo: "Lacunas 3, 4 e 5: totais das colunas",
        html: `${py(`        for i in range(len(___)):
            soma_coluna = soma_coluna + matriz[___][___]`)}
        <ul><li>O laço de dentro passa por todas as <b>linhas</b>: o tamanho de quê dá o número de linhas?</li><li>Na célula, primeiro a <b>linha</b>, depois a <b>coluna</b>. Quais variáveis guardam cada uma?</li></ul>
        ${dica("Dica", "<p>Releia a parte 3 da Teoria. Faça à mão a coluna 0 da matriz [[1, 2], [3, 4]]: o resultado precisa ser 4.</p>")}`,
      },
      passoSalvar(),
      passoRodar(16, caixa("pense", "Confira um total à mão", "<p>Some a linha da segunda-feira: 120 + 340,50 + 210 = 670,50. A coluna Total da linha Seg mostra isso?</p>")),
      passoVerificar(16),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 17
  E[17] = {
    n: 17, semana: "Semana 17", tema: "Funções, escopo e revisão por pares",
    titulo: "Funções e escopo",
    resumo: "O caixa ganha o desconto VIP e a conferência do caixa, com funções sem efeito colateral.",
    objetivos: ["Criar funções reutilizáveis com parâmetros e retorno.", "Explicar escopo local e global e evitar efeito colateral.", "Revisar o código de um colega com feedback assertivo."],
    teoria: `
<h2>1. Funções reutilizáveis</h2>
<p>Uma boa função recebe <b>tudo</b> o que precisa pelos parâmetros e entrega o resultado pelo <code>return</code>. Assim, ela pode ser usada em qualquer lugar, com quaisquer valores:</p>
${py(`def aplicar_desconto(valor, percentual):
    return valor - valor * percentual / 100

aplicar_desconto(200, 10)   # 180.0
aplicar_desconto(80, 25)    # 60.0`)}

<h2>2. Escopo: onde cada variável existe</h2>
<table class="tab"><tr><th>Escopo</th><th>Onde é criada</th><th>Onde pode ser usada</th></tr>
<tr><td><b>Local</b></td><td>Dentro de uma função</td><td>Só dentro dela; some quando a função termina.</td></tr>
<tr><td><b>Global</b></td><td>Fora de qualquer função</td><td>Pode ser lida em todo o arquivo.</td></tr></table>
<p>Veja o que acontece quando uma função tenta <b>mudar</b> uma variável global:</p>
${py(`total_do_caixa = 0

def registrar_venda(valor):
    total_do_caixa = total_do_caixa + valor   # UnboundLocalError!`)}
<p>Ao ver <code>total_do_caixa = ...</code> dentro da função, o Python entende que é uma variável <b>local nova</b>, e ela ainda não tem valor quando a conta é feita. Existe o comando <code>global</code> para “forçar”, mas ele cria <b>efeito colateral</b>: a função mexe escondido em algo de fora, e fica difícil saber quem mudou o quê. Neste projeto o verificador não aceita <code>global</code>.</p>

<h2>3. A solução: receber e devolver</h2>
${py(`def registrar_venda(total_atual, valor):
    novo_total = total_atual + valor
    return novo_total

total_do_caixa = 0
for valor in totais:
    total_do_caixa = registrar_venda(total_do_caixa, valor)`)}
<p>A função recebe o total atual, calcula e <b>devolve</b> o novo total. Quem chama decide onde guardar. Uma função assim, que só depende dos parâmetros, é fácil de <b>testar</b>: <code>registrar_venda(100, 42.5)</code> sempre devolve 142.5.</p>
${caixa("info", "Procedimento ou função?", "<p>A função <b>devolve</b> um valor (<code>return</code>). O procedimento só <b>executa</b> uma ação, como mostrar algo na tela. O <code>main()</code> é um procedimento; <code>aplicar_desconto</code> é uma função.</p>")}

<h2>4. Revisão por pares e feedback assertivo</h2>
<p>Antes de um código ir para o sistema de verdade, um colega lê e avalia. Use este checklist:</p>
<table class="tab"><tr><th>Critério</th></tr><tr><td>Cada função faz uma tarefa só e tem um nome que diz qual é.</td></tr><tr><td>Recebe os dados por parâmetro e devolve com return (sem global).</td></tr><tr><td>Não repete código que já existe em outra função (DRY).</td></tr></table>
<p>O feedback <b>assertivo</b> é claro e respeitoso e sempre traz uma sugestão: <i>“Na linha 40 o 10 está escrito direto; o que acha de transformar em parâmetro?”</i> Evite: <i>“tá errado”</i> (vago) ou <i>“seu código é ruim”</i> (ataca a pessoa).</p>`,
    quiz: [
      { p: "Uma variável criada dentro de uma função é:", ops: ["Global", "Local", "Constante", "Parâmetro sempre"], certa: 1, expl: "Ela só existe dentro da função e some quando a função termina." },
      { p: "O que é efeito colateral?", ops: ["Um erro de sintaxe", "Quando a função altera algo fora dela, escondido", "Quando a função devolve um valor", "Um teste automático"], certa: 1, expl: "Mudar variáveis de fora (por exemplo, com global) torna o programa difícil de entender e testar." },
      { p: "Qual é um feedback assertivo?", ops: ["\"Isso está horrível.\"", "\"Não entendi nada.\"", "\"Na função X, o 100 aparece duas vezes; que tal criar uma variável para ele?\"", "\"Faz de novo.\""], certa: 2, expl: "É específico (onde), explica o problema e sugere uma melhoria, sem atacar a pessoa." },
    ],
    pratica: [
      passoAbrir(17),
      {
        titulo: "Lacunas 1 e 2: as funções da etapa",
        html: `${vscode({ etapa: 17, aberto: true, linhas: ["ETAPA 17:", linhaDe(17, "    return ___") + 1], realce: "lacunas" })}
        ${py(`    return valor - valor * ___ / 100`)}<p>Qual parâmetro diz <b>quantos por cento</b> de desconto?</p>
        ${py(`    novo_total = total_atual + valor
    return ___`)}<p>O que a função deve <b>devolver</b>?</p>`,
      },
      {
        titulo: "Lacunas 3 e 4: usando as funções no main",
        html: `${vscode({ etapa: 17, aberto: true, linhas: [linhaDe(17, "total_do_caixa = 0"), linhaDe(17, "desconto VIP")], realce: "lacunas" })}
        <ul><li><b>Lacuna 3:</b> a cada venda, <code>registrar_venda</code> recebe o total <b>atual</b> do caixa. Qual variável guarda esse total?</li>
        <li><b>Lacuna 4:</b> o desconto VIP é de quantos por cento? (Leia o texto do print.)</li></ul>`,
      },
      passoSalvar(),
      passoRodar(17, caixa("pense", "A conferência bate?", "<p>A linha <b>Conferência do caixa</b> deve mostrar o mesmo valor do <b>Total do dia</b>: são dois jeitos diferentes de chegar ao mesmo número.</p>")),
      passoVerificar(17),
      {
        titulo: "Revisão por pares",
        html: `<p>Com um colega que também terminou, troquem de computador e leiam as funções da Etapa 17 com o checklist da Teoria (parte 4). Cada um escreve <b>um elogio</b> e <b>uma sugestão</b>, apontando a linha e usando feedback assertivo. Use isso na reflexão da entrega.</p>`,
      },
    ],
  };

  // ---------------------------------------------------------------- ETAPA 18
  E[18] = {
    n: 18, semana: "Semana 18", tema: "Depuração e testes: breakpoints, testes unitários e TDD",
    titulo: "Testes e TDD",
    resumo: "O projeto ganha o testes.py. A nova função faixa_da_venda nasce depois dos testes (TDD), e você escreve testes seus.",
    objetivos: ["Escrever testes unitários com assert.", "Aplicar o ciclo do TDD: vermelho, verde, refatorar.", "Usar os testes para encontrar regressões."],
    teoria: `
<h2>1. Bug, depuração e os tipos de erro</h2>
<p>Lembra da Etapa 6? Erros de <b>sintaxe</b> e de <b>execução</b> o Python mostra. O <b>erro de lógica</b> (o programa roda, mas a conta está errada) só aparece quando alguém <b>confere o resultado</b>. Depurar é investigar a causa: rodar de novo, olhar valores, achar a linha, corrigir.</p>
${caixa("info", "O depurador do VS Code (se tiver a extensão Python)", "<p>Clique à esquerda do número de uma linha para criar um <b>breakpoint</b> (bolinha vermelha) e aperte <kbd>F5</kbd>: o programa pausa ali. Com <kbd>F10</kbd> ele anda uma linha por vez, e o painel <b>Variáveis</b> mostra o valor de cada uma. Se o seu computador não tiver a extensão, um <code>print</code> temporário com o valor da variável faz o mesmo papel.</p>")}

<h2>2. Teste unitário com assert</h2>
<p>Um <b>teste unitário</b> confere automaticamente se <b>uma</b> função devolve o resultado esperado para certos valores:</p>
${py(`assert soma([10, 20, 30]) == 60      # passa em silêncio
assert media([]) == 0                # passa em silêncio
assert soma([1, 1]) == 3             # AssertionError: o teste falhou!`)}
<p>O arquivo <code>testes.py</code> junta vários testes. Ele <b>importa</b> as funções do <code>papelaria.py</code> (como na Etapa 14) e, se todos passarem, mostra <b>Todos os testes passaram!</b>.</p>

<h2>3. TDD: o teste vem antes do código</h2>
<p>No <b>TDD</b> (desenvolvimento guiado por testes) primeiro se escreve o teste do que a função <b>deve</b> fazer, e só depois a função:</p>
<table class="tab"><tr><th>Fase</th><th>O que acontece</th></tr>
<tr><td style="color:#b91c1c"><b>Vermelho</b></td><td>O teste existe, mas a função ainda não (ou está incompleta): o teste falha.</td></tr>
<tr><td style="color:#15803d"><b>Verde</b></td><td>Escreve-se o mínimo de código para o teste passar.</td></tr>
<tr><td><b>Refatorar</b></td><td>Melhora-se o código (nomes, organização) e os testes continuam verdes.</td></tr></table>
<p>Os testes da <code>faixa_da_venda</code> já estão no <code>testes.py</code>; a função está incompleta. Repare que eles testam os <b>limites</b>: 49,99, 50, 199,99 e 200, os valores em que um <code>&lt;</code> trocado por <code>&lt;=</code> aparece.</p>
${compara(`Funcao faixa_da_venda(valor: real): caractere
inicio
   se valor < 50 entao
      retorne "pequena"
   senao se valor < 200 entao
      retorne "média"
   fimse
   retorne "grande"
FimFuncao`, `def faixa_da_venda(valor):
    if valor < 50:
        return "pequena"
    elif valor < 200:
        return "média"
    return "grande"`)}

<h2>4. Regressão</h2>
<p>Uma <b>regressão</b> é um erro que aparece numa parte que funcionava, depois de uma mudança em outro lugar. Por isso os testes antigos <b>continuam</b> no <code>testes.py</code>: a cada mudança você roda todos e descobre na hora se quebrou algo.</p>`,
    quiz: [
      { p: "O que acontece quando um assert é verdadeiro?", ops: ["Mostra OK na tela", "Nada: o programa segue", "Para o programa", "Repete o teste"], certa: 1, expl: "assert verdadeiro passa em silêncio. Só o falso interrompe, com AssertionError." },
      { p: "No TDD, a primeira coisa a escrever é:", ops: ["A função completa", "O teste", "O main", "A documentação"], certa: 1, expl: "Primeiro o teste (vermelho), depois o código mínimo (verde), depois a refatoração." },
      { p: "Pela regra, faixa_da_venda(200) deve devolver:", ops: ["\"pequena\"", "\"média\"", "\"grande\"", "200"], certa: 2, expl: "\"média\" é só de 50 até MENOS de 200. Com exatamente 200 é \"grande\"." },
    ],
    pratica: [
      passoAbrir(18),
      {
        titulo: "Abra o testes.py",
        html: `<p>A pasta <b>etapa-18</b> agora tem o <code>testes.py</code>. Abra-o e leia: são os testes das etapas anteriores, os 4 testes do TDD da <code>faixa_da_venda</code> e 2 lacunas onde <b>você</b> vai escrever testes.</p>
        ${vscode({ etapa: 18, arquivoSel: "testes.py", aberto: true, linhas: [linhaDe(18, "TDD:", "testes.py"), linhaDe(18, 'print("Todos', "testes.py")], realce: "lacunas", marcas: { arquivo: 1 } })}`,
      },
      {
        titulo: "Lacunas 1 e 2, no testes.py: os seus testes",
        html: `<p>Cada lacuna vira uma linha de teste, no formato:</p>
        ${py(`assert nome_da_funcao(valores) == resultado_esperado`, true)}
        <ol class="faca"><li>Escolha uma função do projeto (soma, media, posicao_de, faixa_da_venda...).</li><li>Escolha valores que <b>ainda não</b> foram testados.</li><li>Calcule <b>à mão</b> o resultado esperado e escreva depois do <code>==</code>.</li></ol>
        ${dica("Ideias", "<ul><li>a faixa de um valor bem pequeno;</li><li>a média de dois números que você calcula de cabeça;</li><li>a busca de um valor na última posição.</li></ul>")}
        ${caixa("atencao", "Sem recuo", "<p>As linhas de teste começam encostadas na esquerda, como as outras linhas <code>assert</code> do arquivo.</p>")}`,
      },
      {
        titulo: "Lacunas 3 e 4, no papelaria.py: faça os testes ficarem verdes",
        html: `${vscode({ etapa: 18, aberto: true, linhas: [linhaDe(18, "def faixa_da_venda"), linhaDe(18, "def faixa_da_venda") + 6], realce: "lacunas" })}
        ${py(`    elif valor ___ 200:
        return "média"
    return ___`)}
        <p>Releia a regra no comentário da função e os 4 testes do TDD. Qual comparador faz 199,99 ser “média”, mas 200 não? E o que sobra para devolver no final?</p>`,
      },
      passoSalvar(),
      {
        titulo: "Rode os testes (do vermelho ao verde)",
        html: `${cmd("python etapa-18/testes.py")}
        ${terminal(["$ python etapa-18/testes.py", "Todos os testes passaram!", "$"], "Verde! Se algum falhar, aparece AssertionError com o número da linha do assert.")}
        ${dica("Apareceu AssertionError num teste SEU?", "<p>Ou o resultado que você calculou está errado, ou a função tem um bug. Refaça a conta à mão: os dois lados do <code>==</code> precisam ser iguais.</p>", "problema")}`,
      },
      passoRodar(18, "", 1),
      passoVerificar(18),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 19
  E[19] = {
    n: 19, semana: "Semana 19", tema: "Manipulação de textos: fatiamento, métodos e f-strings",
    titulo: "Registro do dia (textos)",
    resumo: "As vendas chegam como linhas de texto bagunçadas, e o caixa arruma, recorta e formata os recibos.",
    objetivos: ["Recortar textos com fatiamento [início:fim].", "Usar split, strip, title e upper para arrumar dados.", "Alinhar valores com f-strings."],
    teoria: `
<h2>1. Os dados agora vêm como texto</h2>
<p>O sistema antigo da papelaria grava cada venda numa linha de texto, assim (repare na bagunça):</p>
${py(`"  09:15 | ana souza   | 42.50  | pix"`, true)}
<p>Para fazer contas, o caixa precisa <b>desmontar</b> cada linha em hora, cliente, total e pagamento, e arrumar cada parte. Esse trabalho se chama <b>parsing</b>.</p>

<h2>2. Texto é sequência: índices e fatiamento</h2>
<table class="tab"><tr><th>Código (hora = "09:15")</th><th>Resultado</th></tr>
<tr><td><code>hora[0]</code></td><td>"0" (o primeiro caractere)</td></tr>
<tr><td><code>hora[-1]</code></td><td>"5" (índice negativo conta do fim)</td></tr>
<tr><td><code>hora[0:2]</code></td><td>"09": do 0 até ANTES do 2 (como o range)</td></tr>
<tr><td><code>hora[3:5]</code></td><td>"15" (os minutos)</td></tr>
<tr><td><code>int(hora[0:2])</code></td><td>9 (agora é número)</td></tr></table>

<h2>3. Métodos que arrumam textos</h2>
<table class="tab"><tr><th>Método</th><th>Exemplo</th><th>Resultado</th></tr>
<tr><td><code>split("|")</code></td><td><code>"a|b|c".split("|")</code></td><td><code>["a", "b", "c"]</code> (uma lista)</td></tr>
<tr><td><code>strip()</code></td><td><code>"  ana  ".strip()</code></td><td><code>"ana"</code> (tira os espaços das pontas)</td></tr>
<tr><td><code>title()</code></td><td><code>"ana souza".title()</code></td><td><code>"Ana Souza"</code></td></tr>
<tr><td><code>upper()</code></td><td><code>"pix".upper()</code></td><td><code>"PIX"</code></td></tr>
<tr><td><code>replace(a, b)</code></td><td><code>"2,50".replace(",", ".")</code></td><td><code>"2.50"</code> (você usa desde a Etapa 1!)</td></tr></table>
<p>Os métodos podem ser encadeados: <code>partes[1].strip().title()</code> primeiro tira os espaços, depois arruma as maiúsculas.</p>

<h2>4. Desmontando uma linha, passo a passo</h2>
<table class="tab"><tr><th>Passo</th><th>Resultado</th></tr>
<tr><td><code>partes = linha.split("|")</code></td><td><code>["  09:15 ", " ana souza   ", " 42.50  ", " pix"]</code></td></tr>
<tr><td><code>partes[0].strip()</code></td><td><code>"09:15"</code></td></tr>
<tr><td><code>partes[1].strip().title()</code></td><td><code>"Ana Souza"</code></td></tr>
<tr><td><code>float(partes[2].strip())</code></td><td><code>42.5</code></td></tr>
<tr><td><code>partes[3].strip().upper()</code></td><td><code>"PIX"</code></td></tr></table>

<h2>5. f-strings que alinham</h2>
${py(`f"{cliente:<15}R$ {total:>8.2f}"
# 'Ana            R$     5.00'`)}
<p><code>:&lt;15</code> alinha o texto à <b>esquerda</b> num espaço de 15; <code>:&gt;8.2f</code> alinha o número à <b>direita</b> num espaço de 8, com 2 casas. É assim que os recibos ficam em colunas.</p>`,
    quiz: [
      { p: "Se hora = \"14:05\", quanto vale hora[0:2]?", ops: ["\"14\"", "\"14:\"", "\"4:\"", "14"], certa: 0, expl: "Do índice 0 até antes do 2: os caracteres 0 e 1, \"14\". Ainda é texto; int() transforma em número." },
      { p: "\"a; b\".split(\";\") resulta em:", ops: ["[\"a\", \"b\"]", "[\"a\", \" b\"]", "\"a b\"", "[\"a;\", \"b\"]"], certa: 1, expl: "O split só corta no ponto e vírgula; o espaço continua no segundo pedaço. Para tirar, use strip()." },
      { p: "\"  bruno LIMA \".strip().title() dá:", ops: ["\"BRUNO LIMA\"", "\"bruno lima\"", "\"Bruno Lima\"", "\"  Bruno Lima \""], certa: 2, expl: "strip tira os espaços das pontas e title deixa maiúscula só a primeira letra de cada palavra." },
    ],
    pratica: [
      passoAbrir(19),
      {
        titulo: "Os dados mudaram",
        html: `<p>O vetor <code>TOTAIS_DO_DIA</code> saiu. No lugar dele há o <code>REGISTRO_DO_DIA</code>, com as linhas bagunçadas, e o <code>main()</code> monta os totais a partir delas. São <b>5 lacunas</b> em 4 linhas, nas funções da Etapa 19.</p>
        ${vscode({ etapa: 19, aberto: true, linhas: [linhaDe(19, "REGISTRO_DO_DIA = ["), linhaDe(19, "REGISTRO_DO_DIA = [") + 7] })}`,
      },
      {
        titulo: "Lacunas 1 e 2: desmontar e arrumar",
        html: `${vscode({ etapa: 19, aberto: true, linhas: [linhaDe(19, "def ler_registro"), linhaDe(19, "return [hora, cliente, total, pagamento]")], realce: "lacunas" })}
        <ul><li><b>Lacuna 1:</b> qual caractere separa as partes da linha? Escreva-o entre aspas.</li><li><b>Lacuna 2:</b> qual método deixa “ana souza” como “Ana Souza”? (Só o nome, sem os parênteses.)</li></ul>`,
      },
      {
        titulo: `Lacunas 3 e 4 (linha ${linhaDe(19, "hora[___:___]")}): recortar as horas`,
        html: `${py(`    return int(hora[___:___])`)}<p>Em <code>"09:15"</code>, as horas são os <b>2 primeiros</b> caracteres. Onde o fatiamento começa e onde termina (lembre que o fim fica de fora)?</p>`,
      },
      {
        titulo: `Lacuna 5 (linha ${linhaDe(19, 'R$ {___:>8.2f}')}): o valor no recibo`,
        html: `${py(`    return f"{cliente:<15}R$ {___:>8.2f}"`)}<p>Depois de “R$” vem o <b>valor</b> da venda. Qual parâmetro da função é esse valor?</p>`,
      },
      passoSalvar(),
      {
        titulo: "Rode os testes",
        html: `${cmd("python etapa-19/testes.py")}<p>O <code>testes.py</code> ganhou testes das funções novas. Precisa aparecer <b>Todos os testes passaram!</b>.</p>`,
      },
      passoRodar(19, "", 1),
      passoVerificar(19),
    ],
  };

  // ---------------------------------------------------------------- ETAPA 20
  E[20] = {
    n: 20, semana: "Semana 20", tema: "Arquivos e planilhas: leitura, escrita e CSV",
    titulo: "Arquivos e CSV",
    resumo: "As vendas vêm de uma planilha CSV, e o caixa grava o resumo e o histórico em arquivos. Fim do Caixa v3!",
    objetivos: ["Abrir arquivos com with open() e o encoding certo.", "Escolher entre os modos \"r\", \"w\" e \"a\".", "Ler uma planilha CSV pulando o cabeçalho."],
    teoria: `
<h2>1. Por que arquivos?</h2>
<p>Tudo o que fica em variáveis e listas <b>some</b> quando o programa termina. Para guardar as vendas e os resumos de um dia para o outro, o programa precisa <b>ler e escrever arquivos</b> no disco.</p>

<h2>2. with open(): abrir e fechar sozinho</h2>
${py(`with open("resumo.txt", "w", encoding="utf-8") as arquivo:
    arquivo.write("Total: R$ 544.90\\n")
# aqui o arquivo já foi fechado automaticamente`)}
<p>O <code>with</code> garante que o arquivo seja <b>fechado</b> no fim do bloco, mesmo se der erro. O <code>encoding="utf-8"</code> faz os acentos (Relatório, Média) saírem certos.</p>

<h2>3. Os modos de abertura</h2>
<table class="tab"><tr><th>Modo</th><th>Para</th><th>Se o arquivo já existe</th><th>No caixa</th></tr>
<tr><td><code>"r"</code></td><td>ler</td><td>lê do começo</td><td>ler o <code>vendas.csv</code></td></tr>
<tr><td><code>"w"</code></td><td>escrever</td><td><b>apaga tudo</b> e escreve de novo</td><td>o <code>resumo.txt</code> (sempre o do dia)</td></tr>
<tr><td><code>"a"</code></td><td>acrescentar</td><td>escreve <b>no fim</b>, mantendo o que havia</td><td>o <code>historico.txt</code> (um registro por fechamento)</td></tr></table>
${caixa("atencao", "write não pula linha", "<p><code>arquivo.write(\"a\")</code> seguido de <code>arquivo.write(\"b\")</code> grava <code>ab</code>. Para cada item ficar numa linha, acrescente <code>\"\\n\"</code> (quebra de linha) no fim.</p>")}

<h2>4. CSV: uma planilha em texto</h2>
<p>CSV é um arquivo de texto em que cada linha é uma linha da planilha e as colunas são separadas por vírgula. A primeira linha é o <b>cabeçalho</b>, com os nomes das colunas. O Excel e o LibreOffice abrem esse formato.</p>
${py(`hora,cliente,total,pagamento
09:15,ana souza,42.50,pix
10:02,BRUNO LIMA,177.50,cartao`, true)}
${py(`import csv
with open(caminho, "r", encoding="utf-8", newline="") as arquivo:
    leitor = csv.reader(arquivo)
    next(leitor)                 # pula o cabeçalho
    for linha in leitor:         # linha = ["09:15", "ana souza", "42.50", "pix"]
        total = float(linha[2])`)}
<p>O <code>next(leitor)</code> “consome” a primeira linha. Sem ele, o programa tentaria transformar a palavra <code>"total"</code> em número, e o resultado seria um <code>ValueError</code>.</p>

<h2>5. Onde ficam os arquivos</h2>
<p>A linha pronta <code>PASTA = os.path.dirname(os.path.abspath(__file__))</code> descobre a pasta onde o <code>papelaria.py</code> está. Assim o programa encontra o <code>vendas.csv</code> e cria o <code>resumo.txt</code> e o <code>historico.txt</code> <b>na pasta etapa-20</b>, não importa de onde você rodou o comando.</p>`,
    quiz: [
      { p: "Para guardar um histórico que cresce a cada fechamento, sem perder os anteriores, o modo é:", ops: ["\"r\"", "\"w\"", "\"a\"", "\"x\""], certa: 2, expl: "\"a\" (append) acrescenta no fim. \"w\" apagaria o histórico a cada vez." },
      { p: "Para que serve o next(leitor) antes do for?", ops: ["Para fechar o arquivo", "Para pular o cabeçalho", "Para ler a última linha", "Para criar o arquivo"], certa: 1, expl: "A primeira linha do CSV tem os nomes das colunas, não é uma venda." },
      { p: "O que o with garante?", ops: ["Que o arquivo exista", "Que o arquivo seja fechado no fim do bloco", "Que o arquivo seja CSV", "Que não haja acentos"], certa: 1, expl: "Ao sair do bloco with, o Python fecha o arquivo automaticamente." },
    ],
    pratica: [
      passoAbrir(20),
      {
        titulo: "Abra o vendas.csv",
        html: `<p>No EXPLORADOR, clique em <b>vendas.csv</b> <span class="marca">1</span>. São as mesmas vendas das etapas anteriores, agora numa planilha. <b>Não altere</b> este arquivo.</p>
        ${vscode({ etapa: 20, arquivoSel: "vendas.csv", aberto: true, codigo: "hora,cliente,total,pagamento\n09:15,ana souza,42.50,pix\n10:02,BRUNO LIMA,177.50,cartao\n11:40,carla dias,15.00,dinheiro\n14:05,davi rocha,230.00,PIX\n15:30,Elisa Prado,64.90,cartao\n17:55,fabio nunes,15.00,dinheiro", linhas: [1, 7], marcas: { arquivo: 1 } })}`,
      },
      {
        titulo: "Lacunas 1 e 2: ler o CSV",
        html: `${vscode({ etapa: 20, aberto: true, linhas: [linhaDe(20, "def ler_vendas"), linhaDe(20, "def ler_vendas") + 8], realce: "lacunas" })}
        <ul><li><b>Lacuna 1:</b> o modo de abertura para <b>ler</b> (uma letra, entre as aspas que já estão lá).</li><li><b>Lacuna 2:</b> a função que pula a primeira linha do leitor.</li></ul>`,
      },
      {
        titulo: "Lacunas 3, 4 e 5: escrever o resumo e o histórico",
        html: `${vscode({ etapa: 20, aberto: true, linhas: [linhaDe(20, "def salvar_resumo"), linhaDe(20, "def registrar_historico") + 4], realce: "lacunas" })}
        <ul><li><b>Lacuna 3:</b> o resumo é sempre recriado do zero. Qual modo apaga e escreve de novo?</li>
        <li><b>Lacuna 4:</b> o que precisa ir no fim de cada linha para pular para a próxima? (Entre aspas.)</li>
        <li><b>Lacuna 5:</b> o histórico <b>acrescenta</b> no fim. Qual modo?</li></ul>`,
      },
      passoSalvar(),
      passoRodar(20),
      {
        titulo: "Veja os arquivos criados (e rode de novo)",
        html: `<ol class="faca"><li>No EXPLORADOR, dentro de <b>etapa-20</b>, apareceram <b>resumo.txt</b> e <b>historico.txt</b>. Abra os dois.</li>
        <li>Rode o programa <b>mais uma vez</b> e abra os arquivos de novo.</li></ol>
        ${caixa("pense", "O que mudou?", "<p>O <code>resumo.txt</code> continua com 3 linhas (o modo <code>\"w\"</code> apagou e escreveu de novo). O <code>historico.txt</code> ganhou uma linha a mais (o modo <code>\"a\"</code> acrescentou). Essa é a diferença entre os dois modos, na prática.</p>")}`,
      },
      passoVerificar(20),
    ],
    fim: caixa("ok", "🎉 Você construiu o Caixa v3 da Papelaria Ponto Certo!", "<p>O fechamento do dia lê uma planilha CSV, arruma os dados, calcula estatísticas, monta a planilha da semana, tem testes automáticos e grava os resultados em arquivos. No 4º bimestre, a Papelaria ganha um <b>sistema com menu</b>, cadastro de produtos e muito mais.</p>"),
  };

  return E;
};
