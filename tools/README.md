# Conferencia da pre-lista

Este fluxo usa `private-data/ResultadoConsulta.csv` como fonte da consulta automatizada e publica somente os dados seguros para a pagina de consulta por CPF.

## 1. Chave do Firebase

No console Firebase, acesse **Project settings > Service accounts**, gere uma chave privada e salve o JSON somente em:

```text
private-data/firebase-service-account.json
```

## 2. Resultado da automacao

Salve o CSV da automacao em:

```text
private-data/ResultadoConsulta.csv
```

Colunas esperadas:

```csv
nome,cpf,nascimento,nome_confere,status_receita,conferido_em,observacoes,processado
```

Campos opcionais aceitos:

```csv
telefone,email
```

Se `nome`, `nascimento`, `telefone` ou `email` forem corrigidos no CSV, o comando atualiza a collection `preLista`. Campos opcionais ausentes nao sobrescrevem os dados que ja existem no banco.

## 3. Normalizar e publicar

Execute:

```bash
npm run prelista:producao
```

O comando:

- le `ResultadoConsulta.csv`;
- valida CPF, nome completo e maioridade em 04/07/2026;
- atualiza `nome`, `nascimento`, `telefone`, `email`, `status` e `validacaoConsulta` na collection `preLista`;
- recria a collection `preListaPublica`;
- gera `private-data/resultado-local.csv` para auditoria local.

## Privacidade

`private-data/` esta no `.gitignore`. Nao envie CSVs, CPFs, e-mails, telefones ou chaves privadas para o GitHub.
