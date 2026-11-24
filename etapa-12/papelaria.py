# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v2
#  Etapa 12  |  Projeto de Lógica de Programação - 2º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-12/papelaria.py
#  VERIFICAR:  python etapa-12/verificar.py
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
    produtos.append(nome)
    precos.append(preco)
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
for i in range(len(produtos)):
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
        caros = caros + 1
print("Itens de R$ 50,00 ou mais:", caros)
# BUSCAR: o PRIMEIRO item acima de R$ 100,00 (para conferir com o gerente)
alto_valor = ""
for i in range(len(produtos)):
    if precos[i] > 100:
        alto_valor = produtos[i]
        break  # achou o primeiro: para a busca
if alto_valor != "":
    print("Conferir com o gerente:", alto_valor)

# ---------- ETAPA 11: ESTATÍSTICAS E ORDENAÇÃO (vetores) ----------
if len(precos) > 0:
    # maior e menor preço, olhando um por um (sem usar max e min prontos)
    maior = precos[0]
    menor = precos[0]
    for p in precos:
        if p > maior:
            maior = p
        if p < menor:
            menor = p
    print(f"Item mais caro: R$ {maior:.2f}")
    print(f"Item mais barato: R$ {menor:.2f}")
    # BUBBLE SORT: troca vizinhos fora de ordem. O nome vai junto com o preço!
    n = len(precos)
    for passada in range(n - 1):
        for j in range(n - 1 - passada):
            if precos[j] > precos[j + 1]:
                aux = precos[j]
                precos[j] = precos[j + 1]
                precos[j + 1] = aux
                aux = produtos[j]
                produtos[j] = produtos[j + 1]
                produtos[j + 1] = aux
    print("Do mais barato ao mais caro:")
    for i in range(len(produtos)):
        print(f"  {produtos[i]}: R$ {precos[i]:.2f}")
print("----------------------------------")

# ---------- ETAPA 9: PARCELAMENTO (for com range) ----------
parcelas = int(input("Em quantas parcelas (1 a 6)? "))
if parcelas < 1 or parcelas > 6:
    print("Número de parcelas inválido: será 1 parcela.")
    parcelas = 1
valor_parcela = total / parcelas
for numero in range(1, parcelas + 1):
    print(f"Parcela {numero} de {parcelas}: R$ {valor_parcela:.2f}")

# ---------- ETAPA 12: RELATÓRIO DA SEMANA (matriz) ----------
ver = input("Ver o relatório da semana? (s/n): ").strip().lower()
if ver == "s":
    categorias = ["Cadernos", "Canetas", "Mochilas"]
    dias = ["Seg", "Ter", "Qua", "Qui", "Sex"]
    # vendas[linha][coluna]: linha = categoria, coluna = dia (unidades vendidas)
    vendas = [
        [12, 8, 15, 10, 20],
        [30, 25, 40, 35, 50],
        [2, 1, 3, 0, 4],
    ]
    print("RELATÓRIO DA SEMANA (unidades vendidas)")
    total_geral = 0
    for i in range(len(categorias)):
        total_linha = ___
        for j in range(len(___)):
            total_linha = total_linha + vendas[___][___]
        print(f"{categorias[i]}: {total_linha}")
        total_geral = total_geral + total_linha
    print("Total da semana:", total_geral)
    # melhor dia: soma de cada COLUNA (agora o laço de fora percorre os dias)
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
