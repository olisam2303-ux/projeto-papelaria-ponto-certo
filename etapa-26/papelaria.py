# ============================================================
#  PAPELARIA PONTO CERTO - SISTEMA (menu, cadastro e vendas)
#  Etapa 26  |  Projeto de Lógica de Programação - 4º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-26/papelaria.py
#  VERIFICAR:  python etapa-26/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Os dados ficam em produtos.csv e vendas.csv, nesta pasta.
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================
import csv
import os

PASTA = os.path.dirname(os.path.abspath(__file__))  # a pasta deste arquivo
ARQ_PRODUTOS = os.path.join(PASTA, "produtos.csv")
ARQ_VENDAS = os.path.join(PASTA, "vendas.csv")
# Cada produto é uma lista [nome, preço]: produtos é uma LISTA DE LISTAS.


# ---------- MENU E ENTRADAS ----------
def mostrar_menu():
    print()
    print("=== PAPELARIA PONTO CERTO - SISTEMA ===")
    print("1 - Cadastrar produto")
    print("2 - Consultar produto")
    print("3 - Listar produtos")
    print("4 - Desempenho de um produto")
    print("5 - Ranking de vendas")
    print("6 - Quiz de treinamento")
    print("7 - Alterar preço")
    print("8 - Registrar venda")
    print("0 - Sair")


def ler_preco(pergunta):
    """Pergunta um preço e só aceita valores maiores que zero (aceita vírgula)."""
    preco = float(input(pergunta).replace(",", "."))
    while preco <= 0:
        print("O preço precisa ser maior que zero.")
        preco = float(input(pergunta).replace(",", "."))
    return preco


# ---------- ETAPA 26: FUNÇÕES QUE TIRAM REPETIÇÃO DO CÓDIGO ----------
def buscar_produto(produtos, nome):
    """Devolve a POSIÇÃO do produto (sem diferenciar maiúsculas) ou -1 se não existir."""
    for i in range(len(produtos)):
        if produtos[i][0].lower() == ___.lower():
            return i
    return ___


def formatar_produto(nome, preco):
    """Texto padrão de um produto, usado na consulta e na listagem."""
    return f"{nome}: R$ {___:.2f}"


# ---------- DADOS INICIAIS DA LOJA ----------
def produtos_iniciais():
    return [["Caderno", 18.5], ["Caneta", 4.5], ["Mochila", 120.0], ["Borracha", 2.0]]


def vendas_iniciais():
    # cada venda é [nome do produto, quantidade vendida]
    return [["Caderno", 40], ["Caderno", 32], ["Caneta", 12], ["Caneta", 15], ["Mochila", 3]]


# ---------- ETAPA 21: CADASTRO E CONSULTA ----------
def cadastrar_produto(produtos):
    nome = input("Nome do produto: ").strip()
    if nome == "":
        print("O nome não pode ficar vazio.")
        return
    if buscar_produto(produtos, nome) != -1:
        print("Produto já cadastrado.")
        return
    preco = ler_preco("Preço (R$): ")
    produtos.append([nome, preco])
    print("Produto cadastrado!")


def consultar_produto(produtos):
    nome_busca = input("Nome do produto: ").strip()
    indice = buscar_produto(___, nome_busca)
    if indice == -1:
        print("Produto não encontrado.")
    else:
        nome = produtos[indice][0]
        preco = produtos[indice][1]
        print(formatar_produto(nome, preco))


# ---------- ETAPA 22: LISTAGEM ----------
def listar_produtos(produtos):
    if len(produtos) == 0:
        print("Nenhum produto cadastrado.")
        return
    for i in range(len(produtos)):
        nome = produtos[i][0]
        preco = produtos[i][1]
        print(f"{i + 1}. " + formatar_produto(nome, preco))


# ---------- ETAPA 23: MÉDIAS, FAIXAS E CLASSIFICAÇÃO ----------
def calcular_media_vendas(vendas, nome):
    """Média das quantidades vendidas do produto, ou None se ele nunca foi vendido."""
    quantidades = []
    for item in vendas:
        if item[0].lower() == nome.lower():
            quantidades.append(item[1])
    if len(quantidades) == 0:
        return None
    return sum(quantidades) / len(quantidades)


def classificar_desempenho(media):
    """Giro do produto: Alto (30 ou mais), Médio (10 ou mais), Baixo ou Sem histórico."""
    if media is None:
        return "Sem histórico"
    if media >= 30:
        return "Alto"
    elif media >= 10:
        return "Médio"
    else:
        return "Baixo"


def consultar_desempenho(vendas):
    nome = input("Nome do produto: ").strip()
    media = calcular_media_vendas(vendas, nome)
    giro = classificar_desempenho(media)
    if media is None:
        print(f"{nome}: {giro}")
    else:
        print(f"{nome}: média de {media:.1f} unidades por venda - giro {giro}")


def pegar_media(resultado):
    """Usada pelo sort: diz que a ordenação é pela média (posição 1)."""
    return resultado[1]


def ___(produtos, vendas):
    """Monta o ranking [nome, média, giro], mostra na tela e grava em ranking.txt."""
    resultados = []
    for produto in produtos:
        nome = produto[0]
        media = calcular_media_vendas(vendas, nome)
        giro = classificar_desempenho(media)
        if media is None:
            media = 0
        resultados.append([nome, media, giro])
    resultados.sort(key=pegar_media, reverse=True)
    linhas = []
    for i in range(len(resultados)):
        r = resultados[i]
        linhas.append(f"{i + 1}º {r[0]} - média {r[1]:.1f} - giro {r[2]}")
    for linha in linhas:
        print(linha)
    with open(os.path.join(PASTA, "ranking.txt"), "w", encoding="utf-8") as arquivo:
        for linha in linhas:
            arquivo.write(linha + "\n")
    print("Ranking salvo em ranking.txt.")


# ---------- ETAPA 24: QUIZ DE TREINAMENTO DO FUNCIONÁRIO ----------
def quiz_treinamento():
    perguntas = [
        "A partir de quantos reais o frete é grátis?",
        "Qual cupom dá R$ 10,00 de desconto?",
        "Qual opção do menu sai do sistema?",
    ]
    respostas = ["200", "ponto10", "0"]
    pontos = 0
    for i in range(len(perguntas)):
        tentativas = 0
        acertou = False
        while tentativas < 3 and not acertou:
            resposta = input(perguntas[i] + " ").strip().lower()
            tentativas = tentativas + 1
            if resposta == respostas[i]:
                acertou = True
                pontos = pontos + 1
                print("Certo!")
            else:
                print("Errado.")
        if not acertou:
            print("A resposta era:", respostas[i])
    print(f"Pontuação: {pontos} de {len(perguntas)}")
    if pontos == len(perguntas):
        print("Excelente! Pronto para o caixa.")
    elif pontos >= 2:
        print("Bom! Revise o que errou.")
    else:
        print("Estude mais e tente de novo.")


# ---------- ETAPA 25: ALTERAR, VENDER E GUARDAR EM ARQUIVO ----------
def alterar_produto(produtos):
    nome = input("Produto a alterar: ").strip()
    indice = buscar_produto(produtos, nome)
    if indice == -1:
        print("Produto não encontrado.")
        return
    novo_preco = ler_preco("Novo preço (R$): ")
    produtos[indice][1] = novo_preco
    print("Preço alterado!")


def registrar_venda(produtos, vendas):
    nome = input("Produto vendido: ").strip()
    indice = buscar_produto(produtos, nome)
    if indice == -1:
        print("Produto não cadastrado.")
        return
    quantidade = int(input("Quantidade: "))
    vendas.append([produtos[indice][0], quantidade])
    print("Venda registrada!")


def carregar_produtos(caminho):
    """Lê o produtos.csv. Se ele ainda não existe, começa com os produtos iniciais."""
    if not os.path.exists(caminho):
        return produtos_iniciais()
    produtos = []
    with open(caminho, "r", encoding="utf-8", newline="") as arquivo:
        leitor = csv.reader(arquivo)
        next(leitor)
        for linha in leitor:
            produtos.append([linha[0], float(linha[1])])
    return produtos


def salvar_produtos(caminho, produtos):
    with open(caminho, "w", encoding="utf-8", newline="") as arquivo:
        escritor = csv.writer(arquivo)
        escritor.writerow(["nome", "preco"])
        for produto in produtos:
            escritor.writerow(produto)


def carregar_vendas(caminho):
    if not os.path.exists(caminho):
        return vendas_iniciais()
    vendas = []
    with open(caminho, "r", encoding="utf-8", newline="") as arquivo:
        leitor = csv.reader(arquivo)
        next(leitor)
        for linha in leitor:
            vendas.append([linha[0], int(linha[1])])
    return vendas


def salvar_vendas(caminho, vendas):
    with open(caminho, "w", encoding="utf-8", newline="") as arquivo:
        escritor = csv.writer(arquivo)
        escritor.writerow(["produto", "quantidade"])
        for venda in vendas:
            escritor.writerow(venda)


# ---------- PROGRAMA PRINCIPAL: o menu só COORDENA ----------
def main():
    produtos = carregar_produtos(ARQ_PRODUTOS)
    vendas = carregar_vendas(ARQ_VENDAS)
    opcao = ""
    while opcao != "0":
        mostrar_menu()
        opcao = input("Escolha uma opção: ").strip()
        if opcao == "1":
            cadastrar_produto(produtos)
        elif opcao == "2":
            consultar_produto(produtos)
        elif opcao == "3":
            listar_produtos(produtos)
        elif opcao == "4":
            consultar_desempenho(vendas)
        elif opcao == "5":
            mostrar_e_salvar_ranking(produtos, vendas)
        elif opcao == "6":
            quiz_treinamento()
        elif opcao == "7":
            alterar_produto(produtos)
        elif opcao == "8":
            registrar_venda(produtos, vendas)
        elif opcao == "0":
            salvar_produtos(ARQ_PRODUTOS, produtos)
            salvar_vendas(ARQ_VENDAS, vendas)
            print("Dados salvos.")
            print("Até logo!")
        else:
            print("Opção inválida.")


if __name__ == "__main__":
    main()
