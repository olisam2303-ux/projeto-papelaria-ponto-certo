# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v2
#  Etapa 10  |  Projeto de Lógica de Programação - 2º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-10/papelaria.py
#  VERIFICAR:  python etapa-10/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================


print("=== PAPELARIA PONTO CERTO - CAIXA v2 ===")
cliente = input("Nome do cliente: ").strip()


# ---------- ETAPA 8: VÁRIOS ITENS (while com sentinela) ----------
# O laço repete ENQUANTO o nome do item não for vazio.
# A SENTINELA é apertar só Enter (nome vazio): isso fecha a compra.
produtos = []  # lista com os NOMES dos itens
precos = []    # lista com os PREÇOS dos itens (mesma posição do nome)
quantidade_itens = 0   # CONTADOR: soma 1 a cada item
subtotal = 0           # ACUMULADOR: soma o preço de cada item

nome = input("Item (ou Enter para fechar a compra): ").strip()
while nome != "":
    preco = float(input("Preço (R$): ").replace(",", "."))
    produtos.___(nome)
    precos.append(___)
    quantidade_itens = quantidade_itens + 1
    subtotal = subtotal + preco
    # Pergunta o PRÓXIMO item. Sem esta linha, o laço nunca acaba!
    nome = input("Item (ou Enter para fechar a compra): ").strip()

# Frete (regra do 1º bimestre): compras ABAIXO de R$ 200,00 pagam R$ 15,00.
if subtotal > 0 and subtotal < 200:
    frete = 15
else:
    frete = 0
total = subtotal + frete


# ---------- RESUMO DA VENDA ----------
print("----------------------------------")
# ETAPA 9: o nome do cliente sublinhado com "=" (for percorrendo um texto)
print(cliente)
sublinhado = ""
for letra in cliente:
    sublinhado = sublinhado + "="
print(sublinhado)
# ETAPA 10: a nota, item por item (for percorrendo as listas pelo índice)
print("NOTA:")
for i in range(___(produtos)):
    print(f"{i + 1}. {produtos[i]}: R$ {precos[i]:.2f}")
print("Itens:", quantidade_itens)
print(f"Subtotal: R$ {subtotal:.2f}")
if quantidade_itens > 0:  # protege contra divisão por zero
    print(f"Preço médio por item: R$ {subtotal / quantidade_itens:.2f}")
print(f"Frete: R$ {frete:.2f}")
print(f"TOTAL A PAGAR: R$ {total:.2f}")

# ---------- ETAPA 10: CONTAGEM E BUSCA NAS LISTAS ----------
# CONTAR: quantos itens custam R$ 50,00 ou mais
caros = 0
for p in precos:
    if p >= 50:
        caros = ___
print("Itens de R$ 50,00 ou mais:", caros)
# BUSCAR: o PRIMEIRO item acima de R$ 100,00 (para conferir com o gerente)
alto_valor = ""
for i in range(len(produtos)):
    if precos[i] > 100:
        alto_valor = produtos[i]
        ___  # achou o primeiro: para a busca
if alto_valor != "":
    print("Conferir com o gerente:", alto_valor)
print("----------------------------------")

# ---------- ETAPA 9: PARCELAMENTO (for com range) ----------
parcelas = int(input("Em quantas parcelas (1 a 6)? "))
if parcelas < 1 or parcelas > 6:
    print("Número de parcelas inválido: será 1 parcela.")
    parcelas = 1
valor_parcela = total / parcelas
for numero in range(1, parcelas + 1):
    print(f"Parcela {numero} de {parcelas}: R$ {valor_parcela:.2f}")
