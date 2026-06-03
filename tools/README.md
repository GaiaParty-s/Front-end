# Conferencia da pre-lista

Este fluxo usa `private-data/ResultadoConsulta.csv` como fonte da consulta automatizada e publica somente os dados seguros para a pagina de consulta por CPF.

## 1. Chave do Firebase

No console Firebase, acesse **Project settings > Service accounts**, gere uma chave privada e salve o JSON somente em:

```text
private-data/firebase-service-account.json
```

## 2. Resultado da automacao

Para baixar somente cadastros que ainda nao possuem `validacaoConsulta`, execute:

```bash
npm run export:prelista
```

Isso gera:

```text
private-data/cadastros-firestore.csv
```

Para auditar a base inteira sem filtrar, use:

```bash
npm run export:prelista:todos
```

Salve o CSV da automacao em:

```text
private-data/ResultadoConsulta.csv
```

Se o arquivo vier misturado, sem cabecalho ou com linhas em formatos diferentes, padronize no formato completo da automacao antes:

```bash
npm run prelista:padronizar-resultado
```

Esse comando cria um backup automatico e padroniza o CSV expandido com 18 colunas.

Colunas esperadas:

```csv
nome,cpf,nascimento,nome_confere,status_receita,conferido_em,observacoes,processado
```

Campos opcionais aceitos:

```csv
link_consulta,telefone,nascimento_banco,menor_de_idade,na_pre_lista,data_inscricao,digito_verificador,comprovante_emitido,comprovante_emitido_data,consultas_consumidas
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
