# Conferência local da pré-lista

Este fluxo gratuito reduz o trabalho manual sem consultar APIs externas.

## 1. Exporte o CSV do Firestore

No console Firebase, acesse **Project settings > Service accounts**, gere uma nova chave privada e salve o JSON somente em:

```text
private-data/firebase-service-account.json
```

Para exportar e analisar tudo automaticamente, execute:

```bash
npm run prelista:atualizar
```

O comando cria:

- `private-data/cadastros-firestore.csv`: cópia integral dos cadastros.
- `private-data/resultado-local.csv`: resultado das validações automáticas.
- `private-data/fila-conferencia-receita.csv`: somente cadastros aptos à revisão manual.

A pasta inteira está ignorada pelo Git.

## 2. Ou prepare outro CSV

Exporte os cadastros para um CSV com estas colunas:

```csv
nome,cpf,nascimento,telefone,email
```

A data de nascimento pode estar em `DD/MM/AAAA` ou `AAAA-MM-DD`.

## 3. Faça a análise automática de um CSV avulso

```bash
python tools/validar_pre_lista.py analisar private-data/cadastros-firestore.csv
```

Use este comando somente quando quiser analisar um CSV diferente da exportação do Firestore. Ele cria em `private-data/`:

- `resultado-local.csv`: resultado de CPF, nome completo, telefone, maioridade e duplicidade.
- `fila-conferencia-receita.csv`: somente cadastros aprovados localmente.

## 4. Confira os candidatos na Receita Federal

Abra o link indicado na coluna `link_consulta`. Para cada pessoa da fila:

1. Consulte CPF e data de nascimento no site oficial.
2. Compare o nome exibido no comprovante com o nome cadastrado.
3. Preencha `nome_confere` com `sim` ou `nao`.
4. Preencha `status_receita` com a situação apresentada, como `REGULAR`.
5. Use `observacoes` apenas quando necessário.

Não automatize a consulta pública com scraping. O site utiliza cookies e foi disponibilizado para conferência cadastral individual.

## 5. Consolide a revisão

```bash
python tools/validar_pre_lista.py consolidar private-data/fila-conferencia-receita.csv
```

O comando cria:

- `aprovados.csv`: maiores de idade, nome conferido e CPF regular.
- `pendencias-revisao.csv`: registros ainda não conferidos ou reprovados.

## Privacidade

`private-data/` está no `.gitignore`. Não envie os CSVs para o GitHub e elimine os arquivos quando não forem mais necessários. CPF, nome, nascimento, e-mail e telefone são dados pessoais.

Consulta pública oficial: https://solucoes.receita.fazenda.gov.br/Servicos/cpf/ConsultaSituacao/ConsultaPublica.asp
