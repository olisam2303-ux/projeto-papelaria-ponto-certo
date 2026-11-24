// Página "Problemas comuns" (usada pelo guia e pela apostila em PDF).
// ---------- ajuda ----------
window.ajudaHTML = function () {
  const item = (titulo, html) => `<details><summary>${titulo}</summary>${html}</details>`;
  return `<h1>Problemas comuns</h1><p>Procure pelo que apareceu na sua tela. Se nada resolver, chame o professor e mostre a mensagem.</p>
  <div class="problemas">
  ${item("<code>O termo 'python' não é reconhecido...</code> ou abriu a Microsoft Store", `<p>Tente com <code>py</code> no lugar de <code>python</code> (ex.: <code>py etapa-01/papelaria.py</code>). Se também não funcionar, o Python não está instalado neste computador: chame o professor.</p>`)}
  ${item("<code>can't open file ... [Errno 2] No such file or directory</code>", `<p>O Python não achou o arquivo. Confira duas coisas:</p><ol><li>A linha do terminal termina com <b>papelaria-ponto-certo&gt;</b>? Se não, a pasta aberta no VS Code está errada: use <b>Arquivo › Abrir Pasta...</b> e escolha a pasta <b>papelaria-ponto-certo</b>, depois abra um terminal novo.</li><li>O comando está escrito certo? Dica: digite <code>python etapa-0</code> e aperte <kbd>Tab</kbd> para o terminal completar o nome.</li></ol>`)}
  ${item("O verificador diz que ainda tem lacuna <code>___</code>, mas eu já preenchi", `<p>O arquivo não foi salvo. Veja se há uma bolinha ● na aba do arquivo, aperte <kbd>Ctrl</kbd>+<kbd>S</kbd> e rode de novo. Confira também se você está editando o arquivo da <b>pasta da etapa certa</b>.</p>`)}
  ${item("<code>NameError: name '...' is not defined</code>", `<p>Um nome de variável foi escrito diferente de onde ela foi criada. Exemplos: <code>preço</code> no lugar de <code>preco</code>, <code>Quantidade</code> no lugar de <code>quantidade</code>. Se o nome for <code>___</code>, você esqueceu uma lacuna.</p>`)}
  ${item("<code>ValueError: invalid literal for int()</code>", `<p>Na hora de <b>rodar</b>, você digitou algo que não é um número inteiro na quantidade (por exemplo <code>2.5</code>, <code>dois</code> ou deixou em branco). Rode de novo e digite um inteiro. Se aconteceu no <b>verificador</b>, confira se você usou <code>int()</code> e <code>float()</code> nos lugares certos.</p>`)}
  ${item("<code>SyntaxError</code> (erro de escrita)", `<p>Vá até o número da linha indicado. Os erros mais comuns: faltou o <code>:</code> no fim do <code>if</code>/<code>else</code>; usou <code>=</code> no lugar de <code>==</code> para comparar; esqueceu de fechar aspas <code>"</code> ou parênteses <code>)</code>. Às vezes o erro está na linha de cima.</p>`)}
  ${item("<code>IndentationError</code> (recuo)", `<p>Os espaços no começo da linha estão errados. As linhas <b>dentro</b> de um if/else começam com 4 espaços. O <code>if</code>, o <code>elif</code> e o <code>else</code> de um mesmo bloco ficam alinhados entre si.</p>`)}
  ${item("O programa ficou parado e não acontece nada", `<p>Ele está esperando você digitar uma resposta. Para cancelar, clique no terminal e aperte <kbd>Ctrl</kbd>+<kbd>C</kbd>.</p>`)}
  ${item("Cliquei em “Não confio” e o VS Code está em <b>Modo Restrito</b>", `<p>Clique em <b>Modo Restrito</b> na barra azul de baixo (canto esquerdo) e escolha <b>Confiar</b>. Ou feche o VS Code e abra a pasta de novo.</p>`)}
  ${item("O código de conclusão não é aceito no guia", `<ul><li>O código é da etapa certa? Ele começa com <b>E</b> + o número da etapa.</li><li>Você mudou o programa <b>depois</b> de rodar o verificador? Rode o verificador de novo e use o código novo.</li><li>Colou o arquivo <b>inteiro</b>? Use <kbd>Ctrl</kbd>+<kbd>A</kbd> antes do <kbd>Ctrl</kbd>+<kbd>C</kbd>.</li></ul>`)}
  ${item("Perdi o meu progresso no guia (as etapas não aparecem mais como concluídas)", `<p>O guia guarda o progresso só no navegador, e alguns computadores apagam tudo ao sair. Os comprovantes que você já entregou continuam valendo. Para marcar de novo, cole o programa e o código na aba <b>Conferir e entregar</b> da etapa.</p>`)}
  ${item("Apaguei sem querer o meu arquivo ou a pasta", `<p>Pegue a pasta do projeto de novo (zip ou pen drive). Cada etapa começa com o seu próprio arquivo, então você recomeça só a etapa atual.</p>`)}
  </div>
  <h2>O VS Code está em inglês?</h2>
  <table class="tab"><tr><th>No guia (português)</th><th>No VS Code em inglês</th></tr>
  <tr><td>Arquivo › Abrir Pasta...</td><td>File › Open Folder...</td></tr><tr><td>Arquivo › Salvar</td><td>File › Save</td></tr>
  <tr><td>Terminal › Novo Terminal</td><td>Terminal › New Terminal</td></tr><tr><td>EXPLORADOR</td><td>EXPLORER</td></tr>
  <tr><td>Sim, confio nos autores</td><td>Yes, I trust the authors</td></tr><tr><td>Modo Restrito</td><td>Restricted Mode</td></tr></table>
  <h2>Mensagens do Python, traduzidas</h2>
  <table class="tab"><tr><th>Em inglês</th><th>Quer dizer</th></tr>
  <tr><td><code>invalid syntax</code></td><td>escrita inválida</td></tr><tr><td><code>expected ':'</code></td><td>faltou o dois-pontos</td></tr>
  <tr><td><code>Maybe you meant '=='</code></td><td>talvez você quisesse ==</td></tr><tr><td><code>is not defined</code></td><td>não existe (nome desconhecido)</td></tr>
  <tr><td><code>unexpected indent</code></td><td>recuo onde não devia</td></tr><tr><td><code>expected an indented block</code></td><td>faltou o recuo da linha de baixo</td></tr>
  <tr><td><code>invalid literal for int()</code></td><td>esse texto não é um número inteiro</td></tr></table>`;
};
