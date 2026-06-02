#!/usr/bin/env python3
"""Analisa localmente uma pré-lista e prepara a conferência manual na Receita."""

from __future__ import annotations

import argparse
import csv
import re
import subprocess
import sys
import unicodedata
from datetime import date, datetime
from pathlib import Path

CONSULTA_RECEITA = (
    "https://solucoes.receita.fazenda.gov.br/Servicos/cpf/"
    "ConsultaSituacao/ConsultaPublica.asp"
)
DEFAULT_OUTPUT = Path("private-data")
FIRESTORE_EXPORT = DEFAULT_OUTPUT / "cadastros-firestore.csv"

ALIASES = {
    "nome": {"nome", "nome completo", "nome_completo"},
    "cpf": {"cpf"},
    "nascimento": {"nascimento", "data nascimento", "data_nascimento", "data de nascimento"},
    "telefone": {"telefone", "whatsapp", "telefone whatsapp", "telefone_whatsapp"},
    "email": {"email", "e mail", "e-mail"},
}


def normalize_header(value: str) -> str:
    text = unicodedata.normalize("NFD", value.strip().lower())
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    return re.sub(r"\s+", " ", text.replace("_", " "))


def digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def masked_cpf(value: str) -> str:
    cpf = digits(value)
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}" if len(cpf) == 11 else value


def valid_cpf(value: str) -> bool:
    cpf = digits(value)
    if len(cpf) != 11 or len(set(cpf)) == 1:
        return False

    def check_digit(length: int) -> int:
        total = sum(int(number) * (length + 1 - index) for index, number in enumerate(cpf[:length]))
        remainder = (total * 10) % 11
        return 0 if remainder == 10 else remainder

    return check_digit(9) == int(cpf[9]) and check_digit(10) == int(cpf[10])


def parse_birth_date(value: str) -> date | None:
    for pattern in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime((value or "").strip(), pattern).date()
        except ValueError:
            continue
    return None


def age_on_today(birth_date: date) -> int:
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def complete_name(value: str) -> bool:
    parts = re.sub(r"\s+", " ", (value or "").strip()).split(" ")
    return len(parts) >= 2 and all(len(re.sub(r"[^A-Za-zÀ-ÖØ-öø-ÿ'-]", "", part)) >= 2 for part in parts)


def detect_columns(fieldnames: list[str] | None) -> dict[str, str]:
    if not fieldnames:
        raise ValueError("O CSV não possui cabeçalho.")
    normalized = {normalize_header(field): field for field in fieldnames}
    columns: dict[str, str] = {}
    for target, aliases in ALIASES.items():
        for alias in aliases:
            if normalize_header(alias) in normalized:
                columns[target] = normalized[normalize_header(alias)]
                break
    missing = [field for field in ("nome", "cpf", "nascimento") if field not in columns]
    if missing:
        raise ValueError(f"Colunas obrigatórias ausentes: {', '.join(missing)}.")
    return columns


def read_csv(path: Path) -> tuple[list[dict[str, str]], dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        sample = file.read(4096)
        file.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;")
        except csv.Error:
            dialect = csv.excel
        rows = list(csv.DictReader(file, dialect=dialect))
    return rows, detect_columns(list(rows[0]) if rows else None)


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def analyze(input_path: Path, output_dir: Path) -> None:
    rows, columns = read_csv(input_path)
    cpf_count: dict[str, int] = {}
    for row in rows:
        cpf = digits(row.get(columns["cpf"], ""))
        cpf_count[cpf] = cpf_count.get(cpf, 0) + 1

    results: list[dict[str, str]] = []
    review_queue: list[dict[str, str]] = []
    for index, row in enumerate(rows, start=2):
        cpf = digits(row.get(columns["cpf"], ""))
        birth_date = parse_birth_date(row.get(columns["nascimento"], ""))
        issues: list[str] = []
        if not complete_name(row.get(columns["nome"], "")):
            issues.append("nome incompleto")
        if not valid_cpf(cpf):
            issues.append("cpf inválido")
        if cpf_count.get(cpf, 0) > 1:
            issues.append("cpf duplicado")
        if not birth_date:
            issues.append("nascimento inválido")
        elif not 18 <= age_on_today(birth_date) <= 120:
            issues.append("idade fora da faixa permitida")
        phone = digits(row.get(columns.get("telefone", ""), ""))
        if "telefone" in columns and len(phone) not in (10, 11):
            issues.append("telefone inválido")

        result = dict(row)
        result.update(
            {
                "linha_origem": str(index),
                "cpf_formatado": masked_cpf(cpf),
                "status_local": "APROVADO" if not issues else "REPROVADO",
                "motivos": "; ".join(issues),
            }
        )
        results.append(result)

        if not issues:
            review_queue.append(
                {
                    "nome": row[columns["nome"]].strip(),
                    "cpf": masked_cpf(cpf),
                    "nascimento": birth_date.strftime("%d/%m/%Y"),
                    "nome_confere": "",
                    "status_receita": "",
                    "conferido_em": "",
                    "observacoes": "",
                    "link_consulta": CONSULTA_RECEITA,
                }
            )

    result_fields = list(rows[0]) + ["linha_origem", "cpf_formatado", "status_local", "motivos"] if rows else []
    write_csv(output_dir / "resultado-local.csv", result_fields, results)
    write_csv(
        output_dir / "fila-conferencia-receita.csv",
        ["nome", "cpf", "nascimento", "nome_confere", "status_receita", "conferido_em", "observacoes", "link_consulta"],
        review_queue,
    )
    print(f"Análise concluída: {len(results)} cadastro(s), {len(review_queue)} aguardando conferência manual.")
    print(f"Arquivos gerados em: {output_dir.resolve()}")


def consolidate(review_path: Path, output_dir: Path) -> None:
    with review_path.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    required = {"nome", "cpf", "nascimento", "nome_confere", "status_receita"}
    if not rows or not required.issubset(rows[0]):
        raise ValueError("A fila de conferência está vazia ou possui colunas obrigatórias ausentes.")

    approved: list[dict[str, str]] = []
    pending: list[dict[str, str]] = []
    for row in rows:
        name_matches = normalize_header(row.get("nome_confere", "")) in {"sim", "s", "ok"}
        regular = normalize_header(row.get("status_receita", "")) == "regular"
        (approved if name_matches and regular else pending).append(row)

    fields = list(rows[0])
    write_csv(output_dir / "aprovados.csv", fields, approved)
    write_csv(output_dir / "pendencias-revisao.csv", fields, pending)
    print(f"Consolidação concluída: {len(approved)} aprovado(s), {len(pending)} pendência(s).")


def update_from_firestore(output_dir: Path) -> None:
    npm_command = "npm.cmd" if sys.platform == "win32" else "npm"
    print("Exportando cadastros do Firestore...")
    try:
        subprocess.run([npm_command, "run", "export:prelista"], check=True)
    except FileNotFoundError as error:
        raise ValueError("O npm não foi encontrado. Confirme a instalação do Node.js.") from error
    except subprocess.CalledProcessError as error:
        raise ValueError(
            "A exportação falhou. Confirme a chave private-data/firebase-service-account.json."
        ) from error

    export_path = output_dir / FIRESTORE_EXPORT.name
    print("Analisando cadastros exportados...")
    analyze(export_path, output_dir)
    print("Fila pronta para conferência manual na Receita Federal.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("acao", choices=("atualizar", "analisar", "consolidar"))
    parser.add_argument("arquivo", type=Path, nargs="?")
    parser.add_argument("--saida", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    try:
        if args.acao == "atualizar":
            update_from_firestore(args.saida)
        elif not args.arquivo:
            raise ValueError(f"A ação {args.acao} exige o caminho de um arquivo CSV.")
        elif args.acao == "analisar":
            analyze(args.arquivo, args.saida)
        else:
            consolidate(args.arquivo, args.saida)
    except (OSError, ValueError) as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
