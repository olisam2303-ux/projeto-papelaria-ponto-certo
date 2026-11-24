# ============================================================
#  PAPELARIA PONTO CERTO - Caixa v3: FECHAMENTO DO DIA
#  Etapa 15  |  Projeto de Lógica de Programação - 3º bimestre
# ------------------------------------------------------------
#  RODAR:      python etapa-15/papelaria.py
#  VERIFICAR:  python etapa-15/verificar.py
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
    while i ___ len(valores):
        total = total + valores[i]
        i = ___
    return total


def media(valores):
    """Média dos valores. Vetor vazio: devolve 0 (para não dividir por zero)."""
    if len(valores) == 0:
        return 0
    return soma(valores) / ___


def posicao_de(valores, alvo):
    """BUSCA LINEAR: devolve a posição do alvo no vetor, ou -1 se não encontrar."""
    i = 0
    while i < len(valores) and valores[i] ___ alvo:
        i = i + 1
    if i < len(valores):
        return i
    return ___


def quantos_acima(valores, limite):
    """Conta quantos valores são MAIORES que o limite."""
    contador = 0
    for v in valores:
        if v > limite:
            contador = contador + 1
    return contador


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


if __name__ == "__main__":
    main()
