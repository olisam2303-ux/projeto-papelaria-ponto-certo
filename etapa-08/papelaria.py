# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v2
#  Etapa 8  |  Projeto de Lógica de Programação - 2º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-08/papelaria.py
#  VERIFICAR:  python etapa-08/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================


print("=== PAPELARIA PONTO CERTO - CAIXA v2 ===")


# ---------- ETAPA 8: VÁRIOS ITENS (while com sentinela) ----------
# O laço repete ENQUANTO o nome do item não for vazio.
# A SENTINELA é apertar só Enter (nome vazio): isso fecha a compra.
quantidade_itens = 0   # CONTADOR: soma 1 a cada item
subtotal = 0           # ACUMULADOR: soma o preço de cada item

nome = input("Item (ou Enter para fechar a compra): ").strip()
while nome ___ "":
    preco = float(input("Preço (R$): ").replace(",", "."))
    quantidade_itens = quantidade_itens + ___
    subtotal = subtotal + ___
    # PARTE B - sem a linha de baixo o laço nunca acaba (veja o guia).
    ___

# Frete (regra do 1º bimestre): compras ABAIXO de R$ 200,00 pagam R$ 15,00.
if subtotal > 0 and subtotal < 200:
    frete = 15
else:
    frete = 0
total = subtotal + frete


# ---------- RESUMO DA VENDA ----------
print("----------------------------------")
print("Itens:", quantidade_itens)
print(f"Subtotal: R$ {subtotal:.2f}")
if quantidade_itens ___ 0:  # protege contra divisão por zero
    print(f"Preço médio por item: R$ {subtotal / quantidade_itens:.2f}")
print(f"Frete: R$ {frete:.2f}")
print(f"TOTAL A PAGAR: R$ {total:.2f}")
print("----------------------------------")
