# ============================================================
#  PAPELARIA PONTO CERTO - Caixa
#  Etapa 6 de 7  |  Projeto de Lógica de Programação - 1º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-06/papelaria.py
#  VERIFICAR:  python etapa-06/verificar.py
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
if subtotal > 100:
    if subtotal > 500:
        desconto = subtotal * 0.10
    else:
        desconto = subtotal * 0.05
else:
    desconto = 0


# ---------- ETAPA 4: ESTUDANTE E BRINDE (E / OU) ----------
# O .strip().lower() já vem pronto: tira espaços e deixa tudo minúsculo.
estudante = input("É estudante? (s/n): ").strip().lower()

# Regra 1 (E): é estudante E o subtotal é de pelo menos R$ 50,00
#              -> desconto extra de R$ 5,00
if estudante == "s" and subtotal >= 50:
    desconto_estudante = 5
else:
    desconto_estudante = 0

# Regra 2 (OU): 10 unidades ou mais OU subtotal de pelo menos R$ 300,00
#               -> o cliente ganha um brinde
if quantidade >= 10 or subtotal >= 300:
    brinde = "Sim"
else:
    brinde = "Não"


# ---------- ETAPA 5: ESTOQUE (SE simples) ----------
estoque = 40  # unidades disponíveis do produto

# PARTE A - se a quantidade pedida for MAIOR que o estoque, avise.
if quantidade > estoque:
    print("ATENÇÃO: estoque insuficiente! Temos só", estoque, "unidades.")

# PARTE B - pedidos grandes (30 unidades ou mais) recebem um aviso.
if quantidade >= 30:
    print("Aviso: pedido grande, separar com antecedência.")


# ---------- ETAPA 6: CUPOM DE DESCONTO ----------
# ATENÇÃO: nesta etapa o programa chegou com 3 ERROS para você consertar.
# Dois deles o próprio Python mostra. O terceiro só o verificador encontra.
# Regra: quem digitar o cupom PONTO10 ganha R$ 10,00 de desconto.
#        Quem só apertar Enter (sem cupom) não ganha nada.
# O .strip().upper() já vem pronto: tira espaços e deixa tudo MAIÚSCULO.
cupom = input("Cupom (ou Enter para pular): ").strip().upper()

if cupom = "PONTO10":
    desconto_cupom = 10
else
    desconto_cupom = 0


# ---------- CÁLCULO DO TOTAL ----------
total = subtotal - desconto - desconto_estudante + desconto_cupom + frete


# ---------- RESUMO DA VENDA (já vem pronto) ----------
print("----------------------------------")
print("RESUMO DA VENDA")
print("Produto:", produto)
print("Quantidade:", quantidade)
print(f"Subtotal: R$ {subtotal:.2f}")
print(f"Desconto por valor: R$ {desconto:.2f}")
print(f"Desconto estudante: R$ {desconto_estudante:.2f}")
print(f"Cupom: R$ {desconto_cupom:.2f}")
print(f"Frete: R$ {frete:.2f}")
print(f"TOTAL A PAGAR: R$ {total:.2f}")
print("Brinde:", brinde)
print("----------------------------------")
