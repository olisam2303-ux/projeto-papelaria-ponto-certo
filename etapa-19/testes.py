# ============================================================
#  testes.py - TESTES AUTOMÁTICOS do Caixa v3 (Etapa 19)
#  Cada assert confere se uma função devolve o resultado certo.
# ------------------------------------------------------------
#  RODAR OS TESTES:  python etapa-19/testes.py
# ============================================================
from papelaria import (
    soma, media, posicao_de, quantos_acima,
    totais_das_linhas, totais_das_colunas,
    aplicar_desconto, registrar_venda, faixa_da_venda,
    ler_registro, hora_cheia, linha_do_recibo,
)

# ---------- Testes das etapas anteriores (já estavam prontos) ----------
assert soma([10, 20, 30]) == 60
assert soma([]) == 0
assert media([10, 20]) == 15
assert media([]) == 0
assert posicao_de([5, 8, 8], 8) == 1
assert posicao_de([5], 9) == -1
assert quantos_acima([1, 5, 10], 4) == 2
assert totais_das_linhas([[1, 2], [3, 4]]) == [3, 7]
assert totais_das_colunas([[1, 2], [3, 4]]) == [4, 6]
assert aplicar_desconto(200, 10) == 180
assert registrar_venda(100, 42.5) == 142.5

# ---------- TDD: estes testes foram escritos ANTES da função faixa_da_venda ----------
assert faixa_da_venda(49.99) == "pequena"
assert faixa_da_venda(50) == "média"
assert faixa_da_venda(199.99) == "média"
assert faixa_da_venda(200) == "grande"

# ---------- SEUS TESTES: escreva 2 testes novos (veja o guia) ----------
assert faixa_da_venda(0) == "pequena"
assert media([5, 15]) == 10

# ---------- Testes da Etapa 19 (textos) ----------
assert ler_registro("  09:15 | ana souza | 42.50 | pix ") == ["09:15", "Ana Souza", 42.5, "PIX"]
assert hora_cheia("14:05") == 14
assert hora_cheia("09:15") == 9
assert linha_do_recibo("Ana", 5) == "Ana            R$     5.00"

print("Todos os testes passaram!")
