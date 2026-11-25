# ============================================================
#  VERIFICADOR DA ETAPA 13 - Papelaria Ponto Certo
#  Como usar (no terminal do VS Code, na pasta do projeto):
#      python etapa-13/verificar.py
#  Você NÃO precisa abrir nem alterar este arquivo.
# ============================================================
# ---------------------------------------------------------------
#  MOTOR DO VERIFICADOR - não altere nada daqui para baixo.
# ---------------------------------------------------------------
import ast
import builtins
import contextlib
import io
import os
import sys
import traceback
import unicodedata

LIMITE_DE_LINHAS = 200000  # mais que isso num teste = repetição sem fim


def _preparar_terminal():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    if os.name == "nt":
        try:
            os.system("")  # liga as cores no terminal do Windows
        except Exception:
            pass


_COR = sys.stdout.isatty() and not os.environ.get("NO_COLOR")


def _c(texto, cor):
    if not _COR:
        return texto
    codigos = {"verde": "32", "vermelho": "31", "amarelo": "33", "azul": "36", "negrito": "1"}
    return "\033[" + codigos[cor] + "m" + texto + "\033[0m"


def ok(texto):
    print(_c("[ OK ] ", "verde") + texto)


def falhou(texto):
    print(_c("[FALHOU] ", "vermelho") + texto)


def dica(texto):
    for i, linha in enumerate(texto.split("\n")):
        print(("  DICA: " if i == 0 else "        ") + linha)


def titulo(texto):
    print()
    print(_c(texto, "negrito"))


# ---------- comparacao de textos ----------

def normalizar(linha):
    """Ignora maiúsculas, acentos e espaços sobrando."""
    linha = unicodedata.normalize("NFKD", str(linha))
    linha = "".join(ch for ch in linha if not unicodedata.combining(ch))
    return " ".join(linha.split()).casefold()


# ---------- código de conclusão (igual ao do guia) ----------

_ESPACOS = set(" \t\r\n\f\v ﻿")


def _limpar_codigo(fonte):
    saida = []
    for linha in fonte.split("\n"):
        aspa = None
        for ch in linha:
            if aspa:
                if ch == aspa:
                    aspa = None
                saida.append(ch)
            elif ch == "'" or ch == '"':
                aspa = ch
                saida.append(ch)
            elif ch == "#":
                break
            else:
                saida.append(ch)
    return "".join(ch for ch in saida if ch not in _ESPACOS)


def codigo_conclusao(etapa, fonte):
    # fonte: o texto do programa, ou uma lista de textos (etapas com mais de um arquivo)
    if isinstance(fonte, (list, tuple)):
        limpo = "|".join(_limpar_codigo(f) for f in fonte)
    else:
        limpo = _limpar_codigo(fonte)
    dados = ("PPC|" + str(etapa) + "|" + limpo).encode("utf-8")
    h = 0x811C9DC5
    for b in dados:
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    x = "%08X" % h
    return "E" + str(etapa) + "-" + x[:4] + "-" + x[4:]


# ---------- execução do programa do aluno ----------

class EntradasAcabaram(BaseException):
    pass


class Demorou(BaseException):
    pass


class _Resultado:
    def __init__(self):
        self.saida = ""
        self.erro = None        # (tipo, mensagem, linha, arquivo)
        self.entradas_usadas = 0
        self.demorou = False


def _do_aluno(nome_arquivo, pasta):
    return os.path.dirname(os.path.abspath(nome_arquivo)) == pasta


def _linha_do_aluno(tb, pasta):
    linha, arquivo = None, None
    for quadro in traceback.extract_tb(tb):
        if _do_aluno(quadro.filename, pasta):
            linha, arquivo = quadro.lineno, os.path.basename(quadro.filename)
    return linha, arquivo


def _pasta_temporaria():
    import tempfile
    return tempfile.mkdtemp(prefix="verificador-")


def arquivo_teste(conteudo):
    """Cria um arquivo temporário com o conteúdo dado e devolve o caminho dele."""
    caminho = os.path.join(_pasta_temporaria(), "teste.txt")
    with open(caminho, "w", encoding="utf-8", newline="") as f:
        f.write(conteudo)
    return caminho


def caminho_teste():
    """Devolve o caminho de um arquivo temporário que ainda NÃO existe."""
    return os.path.join(_pasta_temporaria(), "saida.txt")


def ler_texto(caminho):
    with open(caminho, "r", encoding="utf-8") as f:
        return f.read()


def _avaliar(expressao, espaco):
    """Executa as linhas de preparação e devolve o valor da ÚLTIMA linha."""
    linhas = [l for l in expressao.strip().split("\n") if l.strip()]
    for l in linhas[:-1]:
        exec(l, espaco)
    return eval(linhas[-1], espaco)


def _rodar(codigo_compilado, caminho, entradas, res, expressao=None):
    buffer = io.StringIO()
    fila = list(entradas)

    def entrada_falsa(pergunta=""):
        buffer.write(str(pergunta))
        if not fila:
            buffer.write("\n")
            raise EntradasAcabaram()
        valor = fila.pop(0)
        res.entradas_usadas += 1
        buffer.write(valor + "\n")
        return valor

    # Conta as linhas executadas do programa do aluno: se passar do limite,
    # é repetição sem fim (funciona igual em qualquer versão do Python).
    passos = [0]

    def rastro_local(quadro, evento, arg):
        if evento == "line":
            passos[0] += 1
            if passos[0] > LIMITE_DE_LINHAS:
                raise Demorou()
        return rastro_local

    pasta = os.path.dirname(os.path.abspath(caminho))

    def rastro(quadro, evento, arg):
        if _do_aluno(quadro.f_code.co_filename, pasta):
            return rastro_local
        return None

    # Outros arquivos do aluno (ex.: regras.py) são importados de novo a cada teste.
    if pasta in sys.path:
        sys.path.remove(pasta)
    sys.path.insert(0, pasta)
    try:
        nomes_da_pasta = set(a[:-3] for a in os.listdir(pasta) if a.endswith(".py"))
    except OSError:
        nomes_da_pasta = set()
    for nome_mod, mod in list(sys.modules.items()):
        arq = getattr(mod, "__file__", None)
        if (arq and _do_aluno(arq, pasta)) or nome_mod in nomes_da_pasta:
            del sys.modules[nome_mod]

    # Teste de função: carrega o arquivo como módulo (o main NÃO roda) e avalia a chamada.
    espaco = {"__name__": "__main__" if expressao is None else "modulo_do_aluno", "__file__": caminho,
              "__builtins__": builtins, "input": entrada_falsa}
    input_original = builtins.input
    try:
        with contextlib.redirect_stdout(buffer):
            builtins.input = entrada_falsa
            sys.settrace(rastro)
            try:
                exec(codigo_compilado, espaco)
                if expressao is not None:
                    espaco.update({"arquivo_teste": arquivo_teste, "caminho_teste": caminho_teste, "ler_texto": ler_texto})
                    res.valor = _avaliar(expressao, espaco)
            finally:
                sys.settrace(None)
                builtins.input = input_original
    except Demorou:
        res.demorou = True
    except EntradasAcabaram:
        res.erro = ("EntradasAcabaram", "", None, None)
    except SystemExit:
        pass
    except BaseException as e:  # erro do programa do aluno
        linha, arquivo = _linha_do_aluno(e.__traceback__, pasta)
        res.erro = (type(e).__name__, str(e), linha, arquivo)
    res.saida = buffer.getvalue()


def executar(codigo_compilado, caminho, entradas, expressao=None):
    res = _Resultado()
    res.valor = None
    _rodar(codigo_compilado, caminho, entradas, res, expressao)
    return res


FECHOU_E_ABRIU = "--- (o programa foi fechado e aberto de novo) ---"


def executar_em_copia(fontes, dados, alvo, execucoes):
    """Roda o programa numa CÓPIA temporária da pasta (os arquivos do aluno nunca são
    alterados). Cada item de execucoes é uma lista de valores digitados; entre uma
    execução e outra o programa é fechado e aberto de novo, na mesma pasta temporária."""
    pasta = _pasta_temporaria()
    for nome, texto in list(fontes.items()) + list(dados.items()):
        with open(os.path.join(pasta, nome), "w", encoding="utf-8", newline="") as f:
            f.write(texto)
    caminho = os.path.join(pasta, alvo)
    compilado = compile(fontes[alvo], caminho, "exec")
    saida, usadas, res = "", 0, None
    for k, entradas in enumerate(execucoes):
        if k > 0:
            saida += FECHOU_E_ABRIU + "\n"
        res = executar(compilado, caminho, entradas)
        saida += res.saida
        usadas += res.entradas_usadas
        if res.erro or res.demorou:
            break
    res.saida = saida
    res.entradas_usadas = usadas
    return res


def iguais(a, b):
    """Compara resultados aceitando diferenças minúsculas de arredondamento."""
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) < 1e-6
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(iguais(x, y) for x, y in zip(a, b))
    return a == b


# ---------- explicações amigáveis ----------

def _texto_da_linha(fonte, n):
    linhas = fonte.split("\n")
    if n and 1 <= n <= len(linhas):
        return linhas[n - 1]
    return ""


def explicar_sintaxe(e, fonte):
    n = e.lineno
    texto = _texto_da_linha(fonte, n)
    falhou("O Python não conseguiu ler o seu programa (erro de escrita).")
    print("  Linha %s:  %s" % (n, texto.strip()))
    msg = (e.msg or "").lower()
    limpo = texto.strip()
    sem_comentario = limpo.split("#")[0].strip()
    primeira = sem_comentario.split(" ")[0].split("(")[0] if sem_comentario else ""
    if isinstance(e, IndentationError) or "indent" in msg:
        if "expected an indented block" in msg:
            dica("Depois de uma linha que termina com : (if, else, elif...),\n"
                 "a linha de baixo precisa começar mais para a direita (4 espaços ou Tab).")
        elif "unexpected indent" in msg:
            dica("Esta linha está mais para a direita do que deveria.\n"
                 "Apague os espaços do começo até ela ficar alinhada com as linhas vizinhas.")
        else:
            dica("O recuo (espaços no começo da linha) está diferente das linhas do mesmo bloco.\n"
                 "Deixe-a alinhada com a linha de cima que faz parte do mesmo bloco.")
        return
    if primeira in ("if", "elif", "while", "for") and "=" in sem_comentario:
        tirando = sem_comentario
        for op in ("==", "!=", "<=", ">="):
            tirando = tirando.replace(op, "")
        if "=" in tirando:
            dica("Para COMPARAR, use == (dois sinais de igual).\n"
                 "Um = sozinho serve para GUARDAR um valor numa variável.")
            return
    if primeira in ("if", "elif", "else", "while", "for", "def") and not sem_comentario.endswith(":"):
        dica("Faltou o sinal de dois-pontos : no final desta linha.")
        return
    if "never closed" in msg or "unterminated" in msg or "eol while" in msg or "eof" in msg:
        dica("Algum parêntese ( ou aspas \" ficou aberto sem fechar.\n"
             "Confira esta linha e a linha de cima.")
        return
    if "___" in texto:
        dica("Ainda tem lacuna ___ nesta linha.")
        return
    dica("Compare esta linha (e a linha logo acima dela) com o exemplo do guia.\n"
         "Procure: dois-pontos no fim do if/else, aspas fechadas, parênteses fechados.")


def explicar_erro(tipo, mensagem, linha, fonte, arquivo=None):
    texto = _texto_da_linha(fonte, linha).strip()
    onde = ("  %sLinha %s:  %s" % ((arquivo + ", ") if arquivo else "", linha, texto)) if linha else ""
    if tipo == "EntradasAcabaram":
        falhou("Seu programa pediu mais dados (input) do que este teste digita.")
        dica("Confira se você não criou um input() a mais (a ordem das perguntas\n"
             "deve ser a mesma do guia). Se a pergunta se repete sem parar, o while\n"
             "não está perguntando o PRÓXIMO item no fim de cada volta.")
        return
    if tipo == "AssertionError":
        falhou("Um teste (assert) não passou: o resultado da função não é o esperado.")
        if onde:
            print(onde)
        dica("Calcule à mão o que a função deveria devolver para esses valores\n"
             "e compare com o número escrito depois do ==.")
        return
    if tipo == "NameError":
        nome = mensagem.split("'")[1] if "'" in mensagem else mensagem
        falhou("O programa usou o nome '%s', mas ele não existe." % nome)
        if onde:
            print(onde)
        if nome == "___":
            dica("Você deixou uma lacuna ___ sem preencher.")
        else:
            dica("Confira se o nome foi escrito IGUAL ao lugar onde a variável foi criada\n"
                 "(maiúsculas, acentos e sublinhado contam), ou se a variável foi criada\n"
                 "em todos os caminhos do if/else.")
        return
    if tipo == "ValueError":
        falhou("O programa não conseguiu transformar um texto em número.")
        if onde:
            print(onde)
        texto_ruim = mensagem.split(": ", 1)[1] if ": " in mensagem else ""
        if texto_ruim:
            print("  Texto que não virou número: %s" % texto_ruim)
        if texto_ruim and not any(ch.isdigit() for ch in texto_ruim):
            dica("Esse texto não tem número nenhum. Se ele veio do teclado, a ORDEM das\n"
                 "perguntas está errada (ex.: o while pediu outro preço sem antes perguntar\n"
                 "o próximo item). Se veio de um arquivo, confira se o cabeçalho foi pulado.")
        else:
            dica("int() só aceita número inteiro (ex.: 3). float() aceita número com ponto (ex.: 2.5).\n"
                 "Se o texto veio de um fatiamento [início:fim] ou de um split, confira os índices.")
        return
    if tipo == "UnboundLocalError":
        nome = mensagem.split("'")[1] if "'" in mensagem else "?"
        falhou("A variável '%s' foi usada antes de receber um valor." % nome)
        if onde:
            print(onde)
        dica("Crie (ou zere) a variável ANTES de usá-la: por exemplo, o contador\n"
             "recebe 0 antes do laço que soma nele.")
        return
    if tipo == "AttributeError":
        falhou("O programa usou um comando que não existe para esse tipo de valor.")
        if onde:
            print(onde)
        dica("Ex.: .lower() só existe para texto. Confira se a lista guarda os dados na\n"
             "ordem certa ([nome, preço]) e se você não trocou um texto por um número.\n"
             "(Mensagem do Python: %s)" % mensagem)
        return
    if tipo == "IndexError":
        falhou("O programa tentou usar uma posição que não existe na lista.")
        if onde:
            print(onde)
        dica("Em Python a primeira posição é 0 e a última é len(lista) - 1.\n"
             "Numa matriz, o primeiro índice é a LINHA e o segundo a COLUNA: vendas[i][j].")
        return
    if tipo == "TypeError":
        falhou("O programa tentou fazer uma conta com tipos que não combinam.")
        if onde:
            print(onde)
        dica("Provavelmente um valor ficou como TEXTO. Tudo que vem do input() é texto:\n"
             "converta com int(...) ou float(...) antes de fazer contas.\n"
             "(Mensagem do Python: %s)" % mensagem)
        return
    if tipo == "ZeroDivisionError":
        falhou("O programa tentou dividir por zero.")
        if onde:
            print(onde)
        return
    falhou("O programa parou com um erro: %s: %s" % (tipo, mensagem))
    if onde:
        print(onde)
    dica("Leia a linha indicada e compare com o exemplo do guia.")


# ---------- regras de estrutura (usadas pelas etapas) ----------

def tem_no(arvore, classe):
    return any(isinstance(n, classe) for n in ast.walk(arvore))


def tem_operador_logico(arvore, classe_op):
    return any(isinstance(n, ast.BoolOp) and isinstance(n.op, classe_op) for n in ast.walk(arvore))


def tem_if_dentro_de_if(arvore):
    for n in ast.walk(arvore):
        if isinstance(n, ast.If):
            for filho in n.body:
                if tem_no(filho, ast.If):
                    return True
    return False


def tem_elif(arvore):
    for n in ast.walk(arvore):
        if isinstance(n, ast.If) and len(n.orelse) == 1 and isinstance(n.orelse[0], ast.If):
            return True
    return False


def tem_else(arvore):
    return any(isinstance(n, ast.If) and n.orelse for n in ast.walk(arvore))


def if_compara_com(arvore, numero):
    for n in ast.walk(arvore):
        if isinstance(n, ast.If):
            for m in ast.walk(n.test):
                if isinstance(m, ast.Constant) and m.value == numero and not isinstance(m.value, bool):
                    return True
    return False


def tem_chamada(arvore, nome):
    for n in ast.walk(arvore):
        if isinstance(n, ast.Call):
            f = n.func
            if (isinstance(f, ast.Name) and f.id == nome) or (isinstance(f, ast.Attribute) and f.attr == nome):
                return True
    return False


def tem_for_com_range(arvore):
    return any(isinstance(n, ast.For) and tem_chamada(n.iter, "range") for n in ast.walk(arvore))


def tem_for_dentro_de_for(arvore):
    for n in ast.walk(arvore):
        if isinstance(n, (ast.For, ast.While)):
            for filho in n.body:
                if tem_no(filho, ast.For):
                    return True
    return False


def tem_funcao(arvore, nome):
    return any(isinstance(n, ast.FunctionDef) and n.name == nome for n in ast.walk(arvore))


def tem_import(arvore, modulo):
    for n in ast.walk(arvore):
        if isinstance(n, ast.Import) and any(a.name == modulo for a in n.names):
            return True
        if isinstance(n, ast.ImportFrom) and n.module == modulo:
            return True
    return False


def tem_bloco_main(arvore):
    for n in ast.walk(arvore):
        if isinstance(n, ast.If) and isinstance(n.test, ast.Compare):
            partes = [n.test.left] + list(n.test.comparators)
            if any(isinstance(p, ast.Name) and p.id == "__name__" for p in partes) and \
               any(isinstance(p, ast.Constant) and p.value == "__main__" for p in partes):
                return True
    return False


def conta_no(arvore, classe):
    return sum(1 for n in ast.walk(arvore) if isinstance(n, classe))


def nao_usa(arvore, *nomes):
    return not any(tem_chamada(arvore, nome) for nome in nomes)


# ---------- programa principal do verificador ----------

def _comparavel(linha):
    n = normalizar(linha)
    while n.endswith(".") or n.endswith("!"):
        n = n[:-1].rstrip()
    return n


def _conferir_caso(caso, res):
    """Compara linha por linha (ignorando linhas em branco).
    Devolve None se tudo bate, ou (posicao, esperada, obtida)."""
    obtidas = [l for l in res.saida.split("\n") if l.strip()]
    esperadas = [l for l in caso["esperado"] if l.strip()]
    for i in range(max(len(obtidas), len(esperadas))):
        e = esperadas[i] if i < len(esperadas) else None
        o = obtidas[i] if i < len(obtidas) else None
        if e is None or o is None or _comparavel(e) != _comparavel(o):
            return (i + 1, e, o)
    return None


def _dica_da_linha(esperada, obtida):
    for prefixo, texto in DICAS:
        p = normalizar(prefixo)
        if (esperada and normalizar(esperada).startswith(p)) or (obtida and normalizar(obtida).startswith(p)):
            return texto
    return None


def principal():
    _preparar_terminal()
    pasta = os.path.dirname(os.path.abspath(__file__))
    arquivos = list(globals().get("ARQUIVOS") or [ARQUIVO])
    varios = len(arquivos) > 1
    caminhos = [os.path.join(pasta, a) for a in arquivos]
    print("=" * 60)
    print(" VERIFICADOR - Etapa %s: %s" % (ETAPA, TITULO))
    if varios:
        print(" Arquivos conferidos: %s" % ", ".join(arquivos))
        print(" Na pasta: %s" % pasta)
    else:
        print(" Arquivo conferido: %s" % caminhos[0])
    print("=" * 60)

    fontes = {}
    for a, caminho in zip(arquivos, caminhos):
        if not os.path.exists(caminho):
            falhou("Não encontrei o arquivo %s nesta pasta." % a)
            dica("Ele precisa estar na mesma pasta que este verificar.py,\n"
                 "com o nome exatamente %s." % a)
            return 1
        try:
            with open(caminho, "r", encoding="utf-8-sig") as f:
                fontes[a] = f.read()
        except UnicodeDecodeError:
            falhou("Não consegui ler o arquivo %s (codificação diferente de UTF-8)." % a)
            dica("No VS Code, clique em 'UTF-8' na barra azul de baixo e escolha\n"
                 "'Salvar com Codificação' > 'UTF-8'.")
            return 1

    # 1) lacunas
    titulo("1) Lacunas preenchidas?")
    vazias = []
    for a in arquivos:
        for i, l in enumerate(fontes[a].split("\n")):
            if "___" in l.split("#")[0]:
                vazias.append((a, i + 1, l.strip()))
    if vazias:
        falhou("Ainda faltam %d lacuna(s) ___ para completar:" % len(vazias))
        for a, n, l in vazias:
            print("    %slinha %d:  %s" % ((a + ", ") if varios else "", n, l))
        dica("Troque cada ___ pela resposta certa e salve o arquivo (Ctrl+S).")
        return 1
    ok("Nenhuma lacuna ___ sobrando.")

    # 2) escrita (sintaxe)
    titulo("2) O Python consegue ler o programa?")
    compilados, corpo = {}, []
    for a, caminho in zip(arquivos, caminhos):
        try:
            compilados[a] = compile(fontes[a], caminho, "exec")
            corpo.extend(ast.parse(fontes[a]).body)
        except SyntaxError as e:
            if varios:
                print("  (no arquivo %s)" % a)
            explicar_sintaxe(e, fontes[a])
            return 1
    arvore = ast.Module(body=corpo, type_ignores=[])
    ok("Sem erros de escrita.")

    # 3) estrutura
    if REGRAS:
        titulo("3) O programa usa o que esta etapa pede?")
        for verificar_regra, texto_ok, texto_falha in REGRAS:
            if verificar_regra(arvore):
                ok(texto_ok)
            else:
                falhou(texto_falha)
                return 1

    # 4) testes
    titulo("%d) Testes com compras de verdade" % (4 if REGRAS else 3))
    todos_ok = True
    for i, caso in enumerate(CASOS, 1):
        alvo = caso.get("arquivo") or arquivos[0]
        nome = "Teste %d - %s" % (i, caso["nome"])
        if "expressao" in caso:  # teste de função: chama e confere o que ela devolve
            res = executar(compilados[alvo], os.path.join(pasta, alvo), [], caso["expressao"])
            chamada = caso["expressao"].strip().split("\n")[-1]
            if res.demorou or res.erro or not iguais(res.valor, caso["valor"]):
                falhou(nome)
                print("  Chamada:           " + chamada)
                print("  Deveria devolver:  " + repr(caso["valor"]))
                if res.demorou:
                    print("  Devolveu:          (não terminou: repetição sem fim?)")
                    dica("Confira se a variável do while muda dentro da repetição.")
                elif res.erro:
                    print("  Devolveu:          (o programa parou com erro)")
                    arq_erro = res.erro[3] if res.erro[3] in fontes else alvo
                    explicar_erro(res.erro[0], res.erro[1], res.erro[2], fontes[arq_erro], arq_erro if varios else None)
                else:
                    print("  Devolveu:          " + repr(res.valor))
                    if caso.get("dica"):
                        dica(caso["dica"])
                todos_ok = False
                break
            ok(nome)
            continue
        execucoes = caso.get("execucoes") or [caso["entradas"]]
        if globals().get("EM_COPIA"):
            dados = {}
            for d in globals().get("DADOS_NOMES", []):
                with open(os.path.join(pasta, d), "r", encoding="utf-8", newline="") as f:
                    dados[d] = f.read()
            res = executar_em_copia(fontes, dados, alvo, execucoes)
        else:
            res = executar(compilados[alvo], os.path.join(pasta, alvo), execucoes[0])
        digitado = "  ||  (abriu de novo) ".join(
            " / ".join(repr(x) if x == "" else x for x in ent) or "(nenhum)" for ent in execucoes)
        if res.demorou:
            falhou(nome)
            print("  O programa não terminou: parece uma repetição sem fim.")
            dica("Confira se a condição do while um dia fica falsa\n"
                 "(a variável dela precisa mudar dentro da repetição).")
            todos_ok = False
            break
        if res.erro:
            print(_c("[FALHOU] ", "vermelho") + nome)
            print("  Valores digitados: " + digitado)
            arq_erro = res.erro[3] if res.erro[3] in fontes else alvo
            explicar_erro(res.erro[0], res.erro[1], res.erro[2], fontes[arq_erro], arq_erro if varios else None)
            todos_ok = False
            break
        problema = _conferir_caso(caso, res)
        if problema:
            pos, esperada, obtida = problema
            falhou(nome)
            print("  Valores digitados: " + digitado)
            print("  A diferença está na linha %d da saída:" % pos)
            print("    Deveria aparecer:  " + (esperada if esperada is not None else "(nada - o programa já devia ter terminado)"))
            print("    Apareceu:          " + (obtida if obtida is not None else "(nada - faltou esta linha)"))
            texto = _dica_da_linha(esperada, obtida)
            if texto:
                dica(texto)
            dica("Abra o arquivo saida-esperada.txt desta pasta e compare com o\n"
                 "seu terminal (procure o %s)." % ("Teste %d" % i))
            todos_ok = False
            break
        ok(nome)

    print()
    if not todos_ok:
        print(_c("Ainda não foi desta vez. Corrija, salve (Ctrl+S) e rode o verificador de novo.", "amarelo"))
        return 1
    print("=" * 60)
    print(_c(" PARABÉNS! A Etapa %s está completa." % ETAPA, "verde"))
    codigo = codigo_conclusao(ETAPA, [fontes[a] for a in arquivos] if varios else fontes[arquivos[0]])
    print(" Seu CÓDIGO DE CONCLUSÃO é:  " + _c(codigo, "negrito"))
    print(" Copie este código e cole no guia, na aba 'Conferir e entregar'.")
    print("=" * 60)
    return 0


# ---------- dados desta etapa ----------
ETAPA = 13
TITULO = 'Funções (modularização)'
ARQUIVO = 'papelaria.py'
REGRAS = [
    (lambda a: tem_funcao(a, 'calcular_frete'), 'Tem a função calcular_frete.', 'Falta a função calcular_frete.'),
    (lambda a: tem_funcao(a, 'main'), 'Tem a função main.', 'Falta a função main.'),
    (lambda a: tem_bloco_main(a), 'Usa o bloco if __name__ == "__main__".', 'Falta o bloco if __name__ == "__main__".'),
]
DICAS = [('=== PAPELARIA', 'O programa não mostrou nada? Confira se o main() é chamado no fim,\ndentro do bloco if __name__ == "__main__":'), ('Preço (R$)', 'O while deve repetir ENQUANTO o nome NÃO for vazio (!=).'), ('Itens:', 'O CONTADOR soma 1 a cada volta do while (um item a mais).'), ('Subtotal:', 'O ACUMULADOR soma o PREÇO de cada item a cada volta do while.'), ('Preço médio', 'Média = subtotal / quantidade de itens, e só quando houver pelo menos 1 item.'), ('Frete:', 'Frete: R$ 15,00 para compras acima de zero e abaixo de R$ 200,00.'), ('Parcela', 'range(início, fim) PARA ANTES do fim: para ir de 1 até parcelas,\no fim precisa ser parcelas + 1.'), ('=', "O sublinhado tem um '=' para cada letra (e espaço) do nome do cliente:\no for deve percorrer o texto do cliente."), ('Itens de R$ 50', 'Conte só os preços >= 50: o contador soma 1 dentro do if.'), ('Conferir com o gerente', 'A busca deve PARAR no primeiro item acima de R$ 100,00 (break).'), ('Item mais caro', 'O maior é trocado quando aparece um valor MAIOR que ele (>).'), ('Item mais barato', 'O menor é trocado quando aparece um valor MENOR que ele.'), ('Cadernos:', 'Cada linha da matriz precisa começar a soma do ZERO (total_linha = 0\nDENTRO do primeiro for) e somar vendas[i][j].'), ('Canetas:', 'Cada linha da matriz precisa começar a soma do ZERO (total_linha = 0\nDENTRO do primeiro for).'), ('Total da semana', 'O total da semana soma o total de cada linha.')]
CASOS = [
    {'nome': '3 itens, 3 parcelas, com relatório', 'entradas': ['Ana', 'Caderno', '25', 'Caneta', '2,50', 'Mochila', '150', '', '3', 's'], 'esperado': ['=== PAPELARIA PONTO CERTO - CAIXA v2 ===', 'Nome do cliente: Ana', 'Item (ou Enter para fechar a compra): Caderno', 'Preço (R$): 25', 'Item (ou Enter para fechar a compra): Caneta', 'Preço (R$): 2,50', 'Item (ou Enter para fechar a compra): Mochila', 'Preço (R$): 150', 'Item (ou Enter para fechar a compra): ', '----------------------------------', 'Ana', '===', 'NOTA:', '1. Caderno: R$ 25.00', '2. Caneta: R$ 2.50', '3. Mochila: R$ 150.00', 'Itens: 3', 'Subtotal: R$ 177.50', 'Preço médio por item: R$ 59.17', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 192.50', 'Itens de R$ 50,00 ou mais: 1', 'Conferir com o gerente: Mochila', 'Item mais caro: R$ 150.00', 'Item mais barato: R$ 2.50', 'Do mais barato ao mais caro:', '  Caneta: R$ 2.50', '  Caderno: R$ 25.00', '  Mochila: R$ 150.00', '----------------------------------', 'Em quantas parcelas (1 a 6)? 3', 'Parcela 1 de 3: R$ 64.17', 'Parcela 2 de 3: R$ 64.17', 'Parcela 3 de 3: R$ 64.17', 'Ver o relatório da semana? (s/n): s', 'RELATÓRIO DA SEMANA (unidades vendidas)', 'Cadernos: 65', 'Canetas: 180', 'Mochilas: 10', 'Total da semana: 255', 'Melhor dia: Sex (74 unidades)']},
    {'nome': 'compra vazia (só Enter)', 'entradas': ['Carla', '', '2', 'n'], 'esperado': ['=== PAPELARIA PONTO CERTO - CAIXA v2 ===', 'Nome do cliente: Carla', 'Item (ou Enter para fechar a compra): ', '----------------------------------', 'Carla', '=====', 'NOTA:', 'Itens: 0', 'Subtotal: R$ 0.00', 'Frete: R$ 0.00', 'TOTAL A PAGAR: R$ 0.00', 'Itens de R$ 50,00 ou mais: 0', '----------------------------------', 'Em quantas parcelas (1 a 6)? 2', 'Parcela 1 de 2: R$ 0.00', 'Parcela 2 de 2: R$ 0.00', 'Ver o relatório da semana? (s/n): n']},
    {'nome': '4 agendas = R$ 200,00, parcelas inválidas', 'entradas': ['Ana Paula', 'Agenda', '50', 'Agenda', '50', 'Agenda', '50', 'Agenda', '50', '', '7', 'n'], 'esperado': ['=== PAPELARIA PONTO CERTO - CAIXA v2 ===', 'Nome do cliente: Ana Paula', 'Item (ou Enter para fechar a compra): Agenda', 'Preço (R$): 50', 'Item (ou Enter para fechar a compra): Agenda', 'Preço (R$): 50', 'Item (ou Enter para fechar a compra): Agenda', 'Preço (R$): 50', 'Item (ou Enter para fechar a compra): Agenda', 'Preço (R$): 50', 'Item (ou Enter para fechar a compra): ', '----------------------------------', 'Ana Paula', '=========', 'NOTA:', '1. Agenda: R$ 50.00', '2. Agenda: R$ 50.00', '3. Agenda: R$ 50.00', '4. Agenda: R$ 50.00', 'Itens: 4', 'Subtotal: R$ 200.00', 'Preço médio por item: R$ 50.00', 'Frete: R$ 0.00', 'TOTAL A PAGAR: R$ 200.00', 'Itens de R$ 50,00 ou mais: 4', 'Item mais caro: R$ 50.00', 'Item mais barato: R$ 50.00', 'Do mais barato ao mais caro:', '  Agenda: R$ 50.00', '  Agenda: R$ 50.00', '  Agenda: R$ 50.00', '  Agenda: R$ 50.00', '----------------------------------', 'Em quantas parcelas (1 a 6)? 7', 'Número de parcelas inválido: será 1 parcela.', 'Parcela 1 de 1: R$ 200.00', 'Ver o relatório da semana? (s/n): n']},
    {'nome': 'dois itens acima de R$ 100,00', 'entradas': ['Davi', 'Mochila', '150', 'Calculadora', '120', 'Caderno', '25', '', '1', 'S'], 'esperado': ['=== PAPELARIA PONTO CERTO - CAIXA v2 ===', 'Nome do cliente: Davi', 'Item (ou Enter para fechar a compra): Mochila', 'Preço (R$): 150', 'Item (ou Enter para fechar a compra): Calculadora', 'Preço (R$): 120', 'Item (ou Enter para fechar a compra): Caderno', 'Preço (R$): 25', 'Item (ou Enter para fechar a compra): ', '----------------------------------', 'Davi', '====', 'NOTA:', '1. Mochila: R$ 150.00', '2. Calculadora: R$ 120.00', '3. Caderno: R$ 25.00', 'Itens: 3', 'Subtotal: R$ 295.00', 'Preço médio por item: R$ 98.33', 'Frete: R$ 0.00', 'TOTAL A PAGAR: R$ 295.00', 'Itens de R$ 50,00 ou mais: 2', 'Conferir com o gerente: Mochila', 'Item mais caro: R$ 150.00', 'Item mais barato: R$ 25.00', 'Do mais barato ao mais caro:', '  Caderno: R$ 25.00', '  Calculadora: R$ 120.00', '  Mochila: R$ 150.00', '----------------------------------', 'Em quantas parcelas (1 a 6)? 1', 'Parcela 1 de 1: R$ 295.00', 'Ver o relatório da semana? (s/n): S', 'RELATÓRIO DA SEMANA (unidades vendidas)', 'Cadernos: 65', 'Canetas: 180', 'Mochilas: 10', 'Total da semana: 255', 'Melhor dia: Sex (74 unidades)']},
]

if __name__ == "__main__":
    sys.exit(principal())
