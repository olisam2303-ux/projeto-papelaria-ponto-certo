# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v3: FECHAMENTO DO DIA
#  Etapa 19  |  Projeto de Lógica de Programação - 3º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-19/papelaria.py
#  VERIFICAR:  python etapa-19/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  TESTAR:     python etapa-19/testes.py
#  Este programa não faz perguntas: ele analisa as vendas do dia.
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================

# Registro do dia, do jeito que o sistema antigo grava: hora | cliente | total | pagamento.
# Repare na bagunça: espaços sobrando, maiúsculas e minúsculas misturadas.
REGISTRO_DO_DIA = [
    "  09:15 | ana souza   | 42.50  | pix",
    "10:02|BRUNO LIMA|177.50|cartao",
    "11:40 | carla dias | 15.00 | dinheiro ",
    "14:05 | davi rocha | 230.00 | PIX",
    "15:30 | Elisa Prado | 64.90 | cartao",
    "17:55 | fabio nunes | 15.00 | dinheiro",
]


# ---------- ETAPA 15: VETORES - percurso, busca e estatísticas ----------
def soma(valores):
    """Soma todos os valores, percorrendo o vetor com while."""
    total = 0
    i = 0
    while i < len(valores):
        total = total + valores[i]
        i = i + 1
    return total


def media(valores):
    """Média dos valores. Vetor vazio: devolve 0 (para não dividir por zero)."""
    if len(valores) == 0:
        return 0
    return soma(valores) / len(valores)


def posicao_de(valores, alvo):
    """BUSCA LINEAR: devolve a posição do alvo no vetor, ou -1 se não encontrar."""
    i = 0
    while i < len(valores) and valores[i] != alvo:
        i = i + 1
    if i < len(valores):
        return i
    return -1


def quantos_acima(valores, limite):
    """Conta quantos valores são MAIORES que o limite."""
    contador = 0
    for v in valores:
        if v > limite:
            contador = contador + 1
    return contador


# ---------- ETAPA 16: MATRIZ - a planilha de vendas ----------
def totais_das_linhas(matriz):
    """Devolve uma lista com a soma de cada LINHA da matriz."""
    totais = []
    for linha in matriz:
        soma_linha = 0
        for valor in linha:
            soma_linha = soma_linha + valor
        totais.append(soma_linha)
    return totais


def totais_das_colunas(matriz):
    """Devolve uma lista com a soma de cada COLUNA (o laço de fora percorre as colunas)."""
    totais = []
    for j in range(len(matriz[0])):
        soma_coluna = 0
        for i in range(len(matriz)):
            soma_coluna = soma_coluna + matriz[i][j]
        totais.append(soma_coluna)
    return totais


# ---------- ETAPA 17: FUNÇÕES, PARÂMETROS E ESCOPO ----------
def aplicar_desconto(valor, percentual):
    """Devolve o valor com o desconto aplicado. Ex.: (200, 10) -> 180.0"""
    return valor - valor * percentual / 100


def registrar_venda(total_atual, valor):
    """Devolve o novo total. Não mexe em nada fora da função."""
    novo_total = total_atual + valor
    return novo_total


# ---------- ETAPA 18: TDD - a função nasceu DEPOIS dos testes (veja testes.py) ----------
def faixa_da_venda(valor):
    """Menos de 50: "pequena". De 50 até menos de 200: "média". 200 ou mais: "grande"."""
    if valor < 50:
        return "pequena"
    elif valor < 200:
        return "média"
    return "grande"


# ---------- ETAPA 19: TEXTOS - fatiamento, métodos e f-strings ----------
def ler_registro(linha):
    """'09:15 | ana souza | 42.50 | pix'  ->  ['09:15', 'Ana Souza', 42.5, 'PIX']"""
    partes = linha.split(___)
    hora = partes[0].strip()
    cliente = partes[1].strip().___()
    total = float(partes[2].strip())
    pagamento = partes[3].strip().upper()
    return [hora, cliente, total, pagamento]


def hora_cheia(hora):
    """'09:15' -> 9   (só a parte das horas, como número)"""
    return int(hora[___:___])


def linha_do_recibo(cliente, total):
    """Nome alinhado à esquerda em 15 espaços e valor alinhado à direita em 8."""
    return f"{cliente:<15}R$ {___:>8.2f}"


# ---------- PROGRAMA PRINCIPAL ----------
def main():
    print("=== PAPELARIA PONTO CERTO - FECHAMENTO DO DIA ===")
    vendas = []
    for linha in REGISTRO_DO_DIA:
        vendas.append(ler_registro(linha))
    totais = []
    for venda in vendas:
        totais.append(venda[2])
    print("Vendas do dia:", len(totais))
    print(f"Total do dia: R$ {soma(totais):.2f}")
    print(f"Média por venda: R$ {media(totais):.2f}")
    print("Vendas acima da média:", quantos_acima(totais, media(totais)))
    posicao = posicao_de(totais, 15.0)
    if posicao != -1:
        print("A primeira venda de R$ 15,00 foi a de número", posicao + 1)
    if posicao_de(totais, 999.0) == -1:
        print("Nenhuma venda de R$ 999,00 hoje.")
    pequenas = 0
    medias = 0
    grandes = 0
    for valor in totais:
        faixa = faixa_da_venda(valor)
        if faixa == "pequena":
            pequenas = pequenas + 1
        elif faixa == "média":
            medias = medias + 1
        else:
            grandes = grandes + 1
    print(f"Vendas pequenas: {pequenas} | médias: {medias} | grandes: {grandes}")

    # Conferência: refaz o total chamando registrar_venda uma vez por venda.
    total_do_caixa = 0
    for valor in totais:
        total_do_caixa = registrar_venda(total_do_caixa, valor)
    print(f"Conferência do caixa: R$ {total_do_caixa:.2f}")
    vip = aplicar_desconto(media(totais), 10)
    print(f"Média com o desconto VIP de 10%: R$ {vip:.2f}")

    print("RECIBOS DO DIA")
    for venda in vendas:
        print(venda[0] + "  " + linha_do_recibo(venda[1], venda[2]) + "  " + venda[3])
    for forma in ["DINHEIRO", "PIX", "CARTAO"]:
        total_forma = 0
        for venda in vendas:
            if venda[3] == forma:
                total_forma = total_forma + venda[2]
        print(f"Total em {forma}: R$ {total_forma:.2f}")
    manha = 0
    for venda in vendas:
        if hora_cheia(venda[0]) < 12:
            manha = manha + 1
    print("Vendas de manhã (antes das 12h):", manha)
    print("Vendas à tarde:", len(vendas) - manha)

    print("PLANILHA DA SEMANA (R$)")
    dias = ["Seg", "Ter", "Qua", "Qui", "Sex"]
    planilha = [          # linha = dia, coluna = forma de pagamento
        [120.0, 340.5, 210.0],
        [95.0, 410.0, 180.5],
        [150.5, 290.0, 260.0],
        [80.0, 505.5, 199.9],
        [210.0, 620.0, 330.0],
    ]
    por_dia = totais_das_linhas(planilha)
    por_forma = totais_das_colunas(planilha)
    print(f"{'Dia':<6}{'Dinheiro':>10}{'PIX':>10}{'Cartão':>10}{'Total':>10}")
    for i in range(len(dias)):
        print(f"{dias[i]:<6}{planilha[i][0]:>10.2f}{planilha[i][1]:>10.2f}{planilha[i][2]:>10.2f}{por_dia[i]:>10.2f}")
    print(f"{'Total':<6}{por_forma[0]:>10.2f}{por_forma[1]:>10.2f}{por_forma[2]:>10.2f}{soma(por_dia):>10.2f}")


if __name__ == "__main__":
    main()
