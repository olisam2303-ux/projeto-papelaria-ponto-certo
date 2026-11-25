# ============================================================
#  PAPELARIA PONTO CERTO - SISTEMA (menu, cadastro e vendas)
#  Etapa 21  |  Projeto de Lógica de Programação - 4º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-21/papelaria.py
#  VERIFICAR:  python etapa-21/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================
# Cada produto é uma lista [nome, preço]: produtos é uma LISTA DE LISTAS.


# ---------- MENU E ENTRADAS ----------
def mostrar_menu():
    print()
    print("=== PAPELARIA PONTO CERTO - SISTEMA ===")
    print("1 - Cadastrar produto")
    print("2 - Consultar produto")
    print("0 - Sair")


def ler_preco(pergunta):
    """Pergunta um preço e só aceita valores maiores que zero (aceita vírgula)."""
    preco = float(input(pergunta).replace(",", "."))
    while preco ___ 0:
        print("O preço precisa ser maior que zero.")
        preco = float(input(pergunta).replace(",", "."))
    return preco


# ---------- ETAPA 21: CADASTRO E CONSULTA ----------
def cadastrar_produto(produtos):
    nome = input("Nome do produto: ").strip()
    preco = ler_preco("Preço (R$): ")
    produtos.append([___, ___])
    print("Produto cadastrado!")


def consultar_produto(produtos):
    nome_busca = input("Nome do produto: ").strip()
    i = 0
    encontrado = False
    while i < len(produtos) and not encontrado:
        if produtos[i][0] ___ nome_busca:
            encontrado = True
        else:
            i = i + 1
    if encontrado:
        print(f"{produtos[i][0]}: R$ {produtos[i][1]:.2f}")
    else:
        print("Produto não encontrado.")


# ---------- PROGRAMA PRINCIPAL: o menu só COORDENA ----------
def main():
    produtos = []
    opcao = ""
    while opcao ___ "0":
        mostrar_menu()
        opcao = input("Escolha uma opção: ").strip()
        if opcao == "1":
            cadastrar_produto(produtos)
        ___ opcao == "2":
            consultar_produto(produtos)
        elif opcao == "0":
            print("Até logo!")
        else:
            print("Opção inválida.")


if __name__ == "__main__":
    main()
