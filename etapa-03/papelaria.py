# ============================================================
#  PAPELARIA PONTO CERTO - Caixa
#  Etapa 3 de 7  |  Projeto de Lógica de Programação - 1º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-03/papelaria.py
#  VERIFICAR:  python etapa-03/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================


# ---------- ETAPA 1: ENTRADA E SUBTOTAL ----------
print("=== PAPELARIA PONTO CERTO ===")

produto = input("Produto: ")
# A linha abaixo já vem pronta: o .replace troca a vírgula por ponto,
# para o programa aceitar tanto 2.50 quanto 2,50.
preco = float(input("Preço unitário (R$): ").replace(",", "."))
quantidade = int(input("Quantidade: "))

subtotal = preco * quantidade


# ---------- ETAPA 2: FRETE (SE / SENÃO) ----------
# Regra: compras ABAIXO de R$ 200,00 pagam R$ 15,00 de frete.
#        Compras de R$ 200,00 ou mais têm frete grátis (R$ 0).
if subtotal < 200:
    frete = 15
else:
    frete = 0


# ---------- ETAPA 3: DESCONTO POR VALOR (SE dentro de SE) ----------
# Regra: subtotal ACIMA de R$ 500,00 -> 10% de desconto
#        subtotal ACIMA de R$ 100,00 ->  5% de desconto
#        até R$ 100,00               ->  sem desconto
if subtotal > ___:
    if subtotal > ___:
        desconto = subtotal * ___
    else:
        desconto = subtotal * ___
else:
    desconto = ___


# ---------- CÁLCULO DO TOTAL ----------
total = subtotal - ___ + frete


# ---------- RESUMO DA VENDA (já vem pronto) ----------
print("----------------------------------")
print("RESUMO DA VENDA")
print("Produto:", produto)
print("Quantidade:", quantidade)
print(f"Subtotal: R$ {subtotal:.2f}")
print(f"Desconto por valor: R$ {desconto:.2f}")
print(f"Frete: R$ {frete:.2f}")
print(f"TOTAL A PAGAR: R$ {total:.2f}")
print("----------------------------------")
