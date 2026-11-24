# ============================================================
#  VERIFICADOR DA ETAPA 2 - Papelaria Ponto Certo
#  Como usar (no terminal do VS Code, na pasta do projeto):
#      python etapa-02/verificar.py
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


def _rodar(codigo_compilado, caminho, entradas, res):
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
    if pasta not in sys.path:
        sys.path.insert(0, pasta)
    for nome_mod, mod in list(sys.modules.items()):
        arq = getattr(mod, "__file__", None)
        if arq and _do_aluno(arq, pasta):
            del sys.modules[nome_mod]

    espaco = {"__name__": "__main__", "__file__": caminho,
              "__builtins__": builtins, "input": entrada_falsa}
    input_original = builtins.input
    try:
        with contextlib.redirect_stdout(buffer):
            builtins.input = entrada_falsa
            sys.settrace(rastro)
            try:
                exec(codigo_compilado, espaco)
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


def executar(codigo_compilado, caminho, entradas):
    res = _Resultado()
    _rodar(codigo_compilado, caminho, entradas, res)
    return res


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
        falhou("O programa não conseguiu converter um valor digitado.")
        if onde:
            print(onde)
        texto_ruim = mensagem.split(": ", 1)[1] if ": " in mensagem else ""
        if texto_ruim and not any(ch.isdigit() for ch in texto_ruim):
            dica("O programa tentou transformar em número o texto %s.\n"
                 "Isso acontece quando a ORDEM das perguntas está errada: por exemplo,\n"
                 "o while pediu outro preço sem antes perguntar o próximo item." % texto_ruim)
        else:
            dica("int() só aceita número inteiro (ex.: 3). float() aceita número com ponto (ex.: 2.5).\n"
                 "Confira se você usou int() na quantidade e float() no preço.")
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
        res = executar(compilados[alvo], os.path.join(pasta, alvo), caso["entradas"])
        nome = "Teste %d - %s" % (i, caso["nome"])
        digitado = " / ".join(repr(x) if x == "" else x for x in caso["entradas"]) or "(nenhum)"
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
ETAPA = 2
TITULO = 'Frete (SE / SENÃO)'
ARQUIVO = 'papelaria.py'
REGRAS = [
    (lambda a: tem_else(a), 'Usa SE / SENÃO (if / else).', 'O frete precisa de um if com else.'),
]
DICAS = [('Frete:', 'Releia a regra: ABAIXO de 200 paga 15; 200 OU MAIS é grátis (0).\nCuidado com o teste de exatamente R$ 200,00: < e <= dão resultados diferentes.'), ('TOTAL A PAGAR:', 'O total desta etapa é subtotal + frete.')]
CASOS = [
    {'nome': 'compra de R$ 37,50 (paga frete)', 'entradas': ['Caderno', '12.50', '3'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Caderno', 'Preço unitário (R$): 12.50', 'Quantidade: 3', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Caderno', 'Quantidade: 3', 'Subtotal: R$ 37.50', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 52.50', '----------------------------------']},
    {'nome': 'compra de exatamente R$ 200,00 (limite)', 'entradas': ['Agenda', '50', '4'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Agenda', 'Preço unitário (R$): 50', 'Quantidade: 4', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Agenda', 'Quantidade: 4', 'Subtotal: R$ 200.00', 'Frete: R$ 0.00', 'TOTAL A PAGAR: R$ 200.00', '----------------------------------']},
    {'nome': 'compra de R$ 250,00 (frete grátis)', 'entradas': ['Mochila', '125', '2'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Mochila', 'Preço unitário (R$): 125', 'Quantidade: 2', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Mochila', 'Quantidade: 2', 'Subtotal: R$ 250.00', 'Frete: R$ 0.00', 'TOTAL A PAGAR: R$ 250.00', '----------------------------------']},
    {'nome': 'compra de R$ 3,00 (paga frete)', 'entradas': ['Lápis', '1.50', '2'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Lápis', 'Preço unitário (R$): 1.50', 'Quantidade: 2', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Lápis', 'Quantidade: 2', 'Subtotal: R$ 3.00', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 18.00', '----------------------------------']},
]

if __name__ == "__main__":
    sys.exit(principal())
