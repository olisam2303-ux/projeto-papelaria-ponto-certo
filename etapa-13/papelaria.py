# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v2
#  Etapa 13  |  Projeto de Lógica de Programação - 2º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-13/papelaria.py
#  VERIFICAR:  python etapa-13/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================


# ---------- FUNÇÕES DE REGRA (calculam e devolvem um resultado) ----------
def calcular_frete(___):
    """Compras ABAIXO de R$ 200,00 (e acima de zero) pagam R$ 15,00 de frete."""
    if subtotal > 0 and subtotal < 200:
        return 15
    return 0


def sublinhado_de(texto):
    """Devolve uma linha de '=' do mesmo tamanho do texto."""
    linha = ""
    for letra in texto:
        linha = linha + "="
    return linha


def contar_a_partir_de(valores, limite):
    """Conta quantos valores são maiores ou iguais ao limite."""
    quantos = 0
    for v in valores:
        if v >= limite:
            quantos = quantos + 1
    return quantos


def primeiro_acima(nomes, valores, limite):
    """Devolve o nome do PRIMEIRO item com valor acima do limite (ou "" se não houver)."""
    for i in range(len(valores)):
        if valores[i] > limite:
            return nomes[i]  # o return sai da função na hora, como um break
    return ""


def maior_valor(valores):
    """Devolve o maior valor da lista (a lista não pode estar vazia)."""
    maior = valores[0]
    for v in valores:
        if v > maior:
            maior = v
    return ___


def menor_valor(valores):
    """Devolve o menor valor da lista (a lista não pode estar vazia)."""
    menor = valores[0]
    for v in valores:
        if v < menor:
            menor = v
    return menor


def ordenar(nomes, valores):
    """Bubble Sort: ordena os valores e leva os nomes junto (muda as duas listas)."""
    n = len(valores)
    for passada in range(n - 1):
        for j in range(n - 1 - passada):
            if valores[j] > valores[j + 1]:
                aux = valores[j]
                valores[j] = valores[j + 1]
                valores[j + 1] = aux
                aux = nomes[j]
                nomes[j] = nomes[j + 1]
                nomes[j + 1] = aux


def total_da_linha(linha):
    """Soma todos os valores de uma linha da matriz."""
    total = 0
    for valor in linha:
        total = total + valor
    return total


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
    nome = ___()
    while nome != "":
        preco = float(input("Preço (R$): ").replace(",", "."))
        produtos.append(nome)
        precos.append(preco)
        subtotal = subtotal + preco
        nome = pedir_item()
    quantidade_itens = len(produtos)  # a lista já sabe quantos itens tem

    frete = calcular_frete(___)
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
if __name__ == "___":
    ___()
