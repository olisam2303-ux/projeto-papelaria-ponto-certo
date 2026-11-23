# ============================================================
#  PAPELARIA PONTO CERTO - Caixa
#  Etapa 2 de 7  |  Projeto de Lógica de Programação - 1º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-02/papelaria.py
#  VERIFICAR:  python etapa-02/verificar.py
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
if subtotal ___ 200:
    frete = ___
else:
    frete = ___


# ---------- CÁLCULO DO TOTAL ----------
total = subtotal + frete


# ---------- RESUMO DA VENDA (já vem pronto) ----------
print("----------------------------------")
print("RESUMO DA VENDA")
print("Produto:", produto)
print("Quantidade:", quantidade)
print(f"Subtotal: R$ {subtotal:.2f}")
print(f"Frete: R$ {frete:.2f}")
print(f"TOTAL A PAGAR: R$ {total:.2f}")
print("----------------------------------")
