# ============================================================
#  VERIFICADOR DA ETAPA 6 - Papelaria Ponto Certo
#  Como usar (no terminal do VS Code, na pasta do projeto):
#      python etapa-06/verificar.py
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
    dados = ("PPC|" + str(etapa) + "|" + _limpar_codigo(fonte)).encode("utf-8")
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
        self.erro = None        # (tipo, mensagem, linha)
        self.entradas_usadas = 0
        self.demorou = False


def _linha_do_aluno(tb, caminho):
    linha = None
    for quadro in traceback.extract_tb(tb):
        if os.path.abspath(quadro.filename) == os.path.abspath(caminho):
            linha = quadro.lineno
    return linha


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

    def rastro(quadro, evento, arg):
        if quadro.f_code.co_filename == caminho:
            return rastro_local
        return None

    espaco = {"__name__": "__main__", "__file__": caminho,
              "__builtins__": builtins, "input": entrada_falsa}
    try:
        with contextlib.redirect_stdout(buffer):
            sys.settrace(rastro)
            try:
                exec(codigo_compilado, espaco)
            finally:
                sys.settrace(None)
    except Demorou:
        res.demorou = True
    except EntradasAcabaram:
        res.erro = ("EntradasAcabaram", "", None)
    except SystemExit:
        pass
    except BaseException as e:  # erro do programa do aluno
        res.erro = (type(e).__name__, str(e), _linha_do_aluno(e.__traceback__, caminho))
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


def explicar_erro(tipo, mensagem, linha, fonte):
    texto = _texto_da_linha(fonte, linha).strip()
    onde = ("  Linha %s:  %s" % (linha, texto)) if linha else ""
    if tipo == "EntradasAcabaram":
        falhou("Seu programa pediu mais dados (input) do que este teste digita.")
        dica("Confira se você não criou um input() a mais.\n"
             "A ordem das perguntas deve ser a mesma do guia.")
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
        dica("int() só aceita número inteiro (ex.: 3). float() aceita número com ponto (ex.: 2.5).\n"
             "Confira se você usou int() na quantidade e float() no preço.")
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
    caminho = os.path.join(pasta, ARQUIVO)
    print("=" * 60)
    print(" VERIFICADOR - Etapa %s: %s" % (ETAPA, TITULO))
    print(" Arquivo conferido: %s" % caminho)
    print("=" * 60)

    if not os.path.exists(caminho):
        falhou("Não encontrei o arquivo %s nesta pasta." % ARQUIVO)
        dica("Ele precisa estar na mesma pasta que este verificar.py,\n"
             "com o nome exatamente %s." % ARQUIVO)
        return 1
    try:
        with open(caminho, "r", encoding="utf-8-sig") as f:
            fonte = f.read()
    except UnicodeDecodeError:
        falhou("Não consegui ler o arquivo (codificação diferente de UTF-8).")
        dica("No VS Code, clique em 'UTF-8' na barra azul de baixo e escolha\n"
             "'Salvar com Codificação' > 'UTF-8'.")
        return 1

    # 1) lacunas
    titulo("1) Lacunas preenchidas?")
    vazias = [(i + 1, l.strip()) for i, l in enumerate(fonte.split("\n"))
              if "___" in l.split("#")[0]]
    if vazias:
        falhou("Ainda faltam %d lacuna(s) ___ para completar:" % len(vazias))
        for n, l in vazias:
            print("    linha %d:  %s" % (n, l))
        dica("Troque cada ___ pela resposta certa e salve o arquivo (Ctrl+S).")
        return 1
    ok("Nenhuma lacuna ___ sobrando.")

    # 2) escrita (sintaxe)
    titulo("2) O Python consegue ler o programa?")
    try:
        compilado = compile(fonte, caminho, "exec")
        arvore = ast.parse(fonte)
    except SyntaxError as e:
        explicar_sintaxe(e, fonte)
        return 1
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
        res = executar(compilado, caminho, caso["entradas"])
        nome = "Teste %d - %s" % (i, caso["nome"])
        digitado = " / ".join(repr(x) if x == "" else x for x in caso["entradas"])
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
            explicar_erro(res.erro[0], res.erro[1], res.erro[2], fonte)
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
    print(" Seu CÓDIGO DE CONCLUSÃO é:  " + _c(codigo_conclusao(ETAPA, fonte), "negrito"))
    print(" Copie este código e cole no guia, na aba 'Conferir e entregar'.")
    print("=" * 60)
    return 0


# ---------- dados desta etapa ----------
ETAPA = 6
TITULO = 'Cupom de desconto (depuração)'
ARQUIVO = 'papelaria.py'
REGRAS = [
]
DICAS = [('TOTAL A PAGAR:', 'Confira a linha do total: desconto se TIRA (-), frete se SOMA (+).'), ('Cupom:', 'Só o cupom PONTO10 vale R$ 10,00; qualquer outro valor vale 0.')]
CASOS = [
    {'nome': 'cupom PONTO10', 'entradas': ['Caderno', '25', '2', 'n', 'PONTO10'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Caderno', 'Preço unitário (R$): 25', 'Quantidade: 2', 'É estudante? (s/n): n', 'Cupom (ou Enter para pular): PONTO10', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Caderno', 'Quantidade: 2', 'Subtotal: R$ 50.00', 'Desconto por valor: R$ 0.00', 'Desconto estudante: R$ 0.00', 'Cupom: R$ 10.00', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 55.00', 'Brinde: Não', '----------------------------------']},
    {'nome': 'sem cupom (só Enter)', 'entradas': ['Caderno', '25', '2', 'n', ''], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Caderno', 'Preço unitário (R$): 25', 'Quantidade: 2', 'É estudante? (s/n): n', 'Cupom (ou Enter para pular): ', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Caderno', 'Quantidade: 2', 'Subtotal: R$ 50.00', 'Desconto por valor: R$ 0.00', 'Desconto estudante: R$ 0.00', 'Cupom: R$ 0.00', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 65.00', 'Brinde: Não', '----------------------------------']},
    {'nome': 'cupom digitado em minúsculas', 'entradas': ['Caderno', '25', '2', 'n', 'ponto10'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Caderno', 'Preço unitário (R$): 25', 'Quantidade: 2', 'É estudante? (s/n): n', 'Cupom (ou Enter para pular): ponto10', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Caderno', 'Quantidade: 2', 'Subtotal: R$ 50.00', 'Desconto por valor: R$ 0.00', 'Desconto estudante: R$ 0.00', 'Cupom: R$ 10.00', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 55.00', 'Brinde: Não', '----------------------------------']},
    {'nome': 'cupom que não existe', 'entradas': ['Caderno', '25', '2', 'n', 'PONTO5'], 'esperado': ['=== PAPELARIA PONTO CERTO ===', 'Produto: Caderno', 'Preço unitário (R$): 25', 'Quantidade: 2', 'É estudante? (s/n): n', 'Cupom (ou Enter para pular): PONTO5', '----------------------------------', 'RESUMO DA VENDA', 'Produto: Caderno', 'Quantidade: 2', 'Subtotal: R$ 50.00', 'Desconto por valor: R$ 0.00', 'Desconto estudante: R$ 0.00', 'Cupom: R$ 0.00', 'Frete: R$ 15.00', 'TOTAL A PAGAR: R$ 65.00', 'Brinde: Não', '----------------------------------']},
]

if __name__ == "__main__":
    sys.exit(principal())
