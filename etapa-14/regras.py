# ============================================================
#  regras.py - as REGRAS da Papelaria Ponto Certo (Etapa 14)
#  Este módulo só CALCULA: não pergunta nada e não mostra a venda.
#  Quem usa estas funções é o papelaria.py, pelo import.
# ------------------------------------------------------------
#  TESTAR ESTE MÓDULO:  python etapa-14/regras.py
# ============================================================


def calcular_frete(subtotal):
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
    return maior


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


# ---------- TESTES: só rodam quando ESTE arquivo é executado ----------
# assert = "garanta que". Se a conta der diferente, o Python para com AssertionError.
if __name__ == "__main__":
    assert calcular_frete(0) == 0
    assert calcular_frete(50) == 15
    assert calcular_frete(199.99) == ___
    assert calcular_frete(200) == ___
    assert sublinhado_de("Ana") == "==="
    assert contar_a_partir_de([10, 50, 80], 50) == 2
    assert primeiro_acima(["lápis", "mochila", "agenda"], [2, 150, 120], 100) == "mochila"
    assert maior_valor([3, 9, 2]) == ___
    assert menor_valor([3, 9, 2]) == 2
    nomes = ["caneta", "agenda", "borracha"]
    valores = [30, 10, 20]
    ordenar(nomes, valores)
    assert valores == [10, 20, 30]
    assert nomes == ["agenda", "borracha", "caneta"]
    assert total_da_linha([12, 8, 15, 10, 20]) == 65
    print("Todos os testes de regras.py passaram!")
