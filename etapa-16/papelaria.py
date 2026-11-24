# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v3: FECHAMENTO DO DIA
#  Etapa 16  |  Projeto de Lógica de Programação - 3º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-16/papelaria.py
#  VERIFICAR:  python etapa-16/verificar.py
#  (Se no seu computador funcionou "py", use py no lugar de python.)
#  Este programa não faz perguntas: ele analisa as vendas do dia.
#  Siga o passo a passo do guia e salve sempre com Ctrl+S.
# ============================================================

# Valor total de cada venda de hoje (um vetor de números reais).
TOTAIS_DO_DIA = [42.5, 177.5, 15.0, 230.0, 64.9, 15.0]


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
        soma_linha = ___
        for valor in linha:
            soma_linha = soma_linha + valor
        totais.___(soma_linha)
    return totais


def totais_das_colunas(matriz):
    """Devolve uma lista com a soma de cada COLUNA (o laço de fora percorre as colunas)."""
    totais = []
    for j in range(len(matriz[0])):
        soma_coluna = 0
        for i in range(len(___)):
            soma_coluna = soma_coluna + matriz[___][___]
        totais.append(soma_coluna)
    return totais


# ---------- PROGRAMA PRINCIPAL ----------
def main():
    print("=== PAPELARIA PONTO CERTO - FECHAMENTO DO DIA ===")
    totais = TOTAIS_DO_DIA
    print("Vendas do dia:", len(totais))
    print(f"Total do dia: R$ {soma(totais):.2f}")
    print(f"Média por venda: R$ {media(totais):.2f}")
    print("Vendas acima da média:", quantos_acima(totais, media(totais)))
    posicao = posicao_de(totais, 15.0)
    if posicao != -1:
        print("A primeira venda de R$ 15,00 foi a de número", posicao + 1)
    if posicao_de(totais, 999.0) == -1:
        print("Nenhuma venda de R$ 999,00 hoje.")

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
