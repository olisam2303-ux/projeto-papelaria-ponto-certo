# ============================================================
#  PAPELARIA PONTO CERTO - SISTEMA (menu, cadastro e vendas)
#  Etapa 23  |  Projeto de Lógica de Programação - 4º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-23/papelaria.py
#  VERIFICAR:  python etapa-23/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================
import os

PASTA = os.path.dirname(os.path.abspath(__file__))  # a pasta deste arquivo
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
    print("0 - Sair")


def ler_preco(pergunta):
    """Pergunta um preço e só aceita valores maiores que zero (aceita vírgula)."""
    preco = float(input(pergunta).replace(",", "."))
    while preco <= 0:
        print("O preço precisa ser maior que zero.")
        preco = float(input(pergunta).replace(",", "."))
    return preco


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
    for p in produtos:
        if p[0].lower() == nome.lower():
            print("Produto já cadastrado.")
            return
    preco = ler_preco("Preço (R$): ")
    produtos.append([nome, preco])
    print("Produto cadastrado!")


def consultar_produto(produtos):
    nome_busca = input("Nome do produto: ").strip()
    i = 0
    encontrado = False
    while i < len(produtos) and not encontrado:
        if produtos[i][0].lower() == nome_busca.lower():
            encontrado = True
        else:
            i = i + 1
    if encontrado:
        print(f"{produtos[i][0]}: R$ {produtos[i][1]:.2f}")
    else:
        print("Produto não encontrado.")


# ---------- ETAPA 22: LISTAGEM ----------
def listar_produtos(produtos):
    if len(produtos) == 0:
        print("Nenhum produto cadastrado.")
        return
    for i in range(len(produtos)):
        print(f"{i + 1}. {produtos[i][0]}: R$ {produtos[i][1]:.2f}")


# ---------- ETAPA 23: MÉDIAS, FAIXAS E CLASSIFICAÇÃO ----------
def calcular_media_vendas(vendas, nome):
    """Média das quantidades vendidas do produto, ou None se ele nunca foi vendido."""
    quantidades = []
    for item in vendas:
        if item[0].lower() == nome.lower():
            quantidades.append(item[1])
    if len(quantidades) == 0:
        return None
    return sum(quantidades) / ___


def classificar_desempenho(media):
    """Giro do produto: Alto (30 ou mais), Médio (10 ou mais), Baixo ou Sem histórico."""
    if media is None:
        return "Sem histórico"
    if media >= ___:
        return "Alto"
    elif media >= ___:
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


def mostrar_ranking(produtos, vendas):
    """Monta o ranking [nome, média, giro], mostra na tela e grava em ranking.txt."""
    resultados = []
    for produto in produtos:
        nome = produto[0]
        media = calcular_media_vendas(vendas, nome)
        giro = classificar_desempenho(media)
        if media is None:
            media = 0
        resultados.append([nome, media, giro])
    resultados.sort(key=pegar_media, reverse=___)
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


# ---------- PROGRAMA PRINCIPAL: o menu só COORDENA ----------
def main():
    produtos = produtos_iniciais()
    vendas = vendas_iniciais()
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
            mostrar_ranking(produtos, vendas)
        elif opcao == "0":
            print("Até logo!")
        else:
            print("Opção inválida.")


if __name__ == "__main__":
    main()
