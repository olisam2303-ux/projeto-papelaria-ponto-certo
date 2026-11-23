# ============================================================
#  PAPELARIA PONTO CERTO - Caixa
#  Etapa 1 de 7  |  Projeto de Lógica de Programação - 1º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-01/papelaria.py
#  VERIFICAR:  python etapa-01/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================


# ---------- ETAPA 1: ENTRADA E SUBTOTAL ----------
print("=== PAPELARIA PONTO CERTO ===")

produto = input("Produto: ")
# A linha abaixo já vem pronta: o .replace troca a vírgula por ponto,
# para o programa aceitar tanto 2.50 quanto 2,50.
preco = float(input("Preço unitário (R$): ").replace(",", "."))
quantidade = ___(input("Quantidade: "))

subtotal = ___ * ___


# ---------- RESUMO DA VENDA (já vem pronto) ----------
print("----------------------------------")
print("RESUMO DA VENDA")
print("Produto:", produto)
print("Quantidade:", quantidade)
print(f"Subtotal: R$ {subtotal:.2f}")
print("----------------------------------")
