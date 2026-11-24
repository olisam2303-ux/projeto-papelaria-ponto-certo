# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v2
#  Etapa 14  |  Projeto de Lógica de Programação - 2º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-14/papelaria.py
#  VERIFICAR:  python etapa-14/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Nesta etapa o programa tem 2 arquivos: este e o regras.py.
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================


# As REGRAS (os cálculos) agora moram no módulo regras.py, na mesma pasta.
from ___ import (
    calcular_frete, sublinhado_de, contar_a_partir_de, primeiro_acima,
    maior_valor, menor_valor, ordenar, total_da_linha,
)


# ---------- FUNÇÕES DA TELA (perguntam e mostram) ----------
def pedir_item():
    """Pergunta o próximo item. Só Enter (texto vazio) fecha a compra."""
    return input("Item (ou Enter para fechar a compra): ").strip()


def mostrar_relatorio():
    """Mostra o relatório da semana a partir da matriz de vendas."""
    categorias = ["Cadernos", "Canetas", "Mochilas"]
    dias = ["Seg", "Ter", "Qua", "Qui", "Sex"]
    vendas = [
        [12, 8, 15, 10, 20],
        [30, 25, 40, 35, 50],
        [2, 1, 3, 0, 4],
    ]
    print("RELATÓRIO DA SEMANA (unidades vendidas)")
    total_geral = 0
    for i in range(len(categorias)):
        total_linha = total_da_linha(vendas[i])
        print(f"{categorias[i]}: {total_linha}")
        total_geral = total_geral + total_linha
    print("Total da semana:", total_geral)
    melhor_dia = ""
    maior_dia = -1
    for j in range(len(dias)):
        soma_dia = 0
        for i in range(len(categorias)):
            soma_dia = soma_dia + vendas[i][j]
        if soma_dia > maior_dia:
            maior_dia = soma_dia
            melhor_dia = dias[j]
    print(f"Melhor dia: {melhor_dia} ({maior_dia} unidades)")


# ---------- PROGRAMA PRINCIPAL ----------
def main():
    print("=== PAPELARIA PONTO CERTO - CAIXA v2 ===")
    cliente = input("Nome do cliente: ").strip()

    produtos = []
    precos = []
    subtotal = 0
    nome = pedir_item()
    while nome != "":
        preco = float(input("Preço (R$): ").replace(",", "."))
        produtos.append(nome)
        precos.append(preco)
        subtotal = subtotal + preco
        nome = pedir_item()
    quantidade_itens = len(produtos)  # a lista já sabe quantos itens tem

    frete = calcular_frete(subtotal)
    total = subtotal + frete

    print("----------------------------------")
    print(cliente)
    print(sublinhado_de(cliente))
    print("NOTA:")
    for i in range(len(produtos)):
        print(f"{i + 1}. {produtos[i]}: R$ {precos[i]:.2f}")
    print("Itens:", quantidade_itens)
    print(f"Subtotal: R$ {subtotal:.2f}")
    if quantidade_itens > 0:
        print(f"Preço médio por item: R$ {subtotal / quantidade_itens:.2f}")
    print(f"Frete: R$ {frete:.2f}")
    print(f"TOTAL A PAGAR: R$ {total:.2f}")
    print("Itens de R$ 50,00 ou mais:", contar_a_partir_de(precos, 50))
    alto_valor = primeiro_acima(produtos, precos, 100)
    if alto_valor != "":
        print("Conferir com o gerente:", alto_valor)
    if len(precos) > 0:
        print(f"Item mais caro: R$ {maior_valor(precos):.2f}")
        print(f"Item mais barato: R$ {menor_valor(precos):.2f}")
        ordenar(produtos, precos)
        print("Do mais barato ao mais caro:")
        for i in range(len(produtos)):
            print(f"  {produtos[i]}: R$ {precos[i]:.2f}")
    print("----------------------------------")

    parcelas = int(input("Em quantas parcelas (1 a 6)? "))
    if parcelas < 1 or parcelas > 6:
        print("Número de parcelas inválido: será 1 parcela.")
        parcelas = 1
    valor_parcela = total / parcelas
    for numero in range(1, parcelas + 1):
        print(f"Parcela {numero} de {parcelas}: R$ {valor_parcela:.2f}")

    ver = input("Ver o relatório da semana? (s/n): ").strip().lower()
    if ver == "s":
        mostrar_relatorio()


# Só roda o caixa quando ESTE arquivo é executado (e não quando é importado).
if __name__ == "__main__":
    main()
