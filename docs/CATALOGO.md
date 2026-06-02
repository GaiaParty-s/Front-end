# Gerenciamento de produtos e ingressos

O site lê as coleções `Produtos` e `ingressos` do Cloud Firestore. A escrita pública continua bloqueada. O nome `Produtos` respeita a capitalização usada no projeto Firebase.

## Baixar dados atuais

```bash
npm run catalogo:baixar
```

O comando cria:

```text
private-data/catalogo.json
```

## Editar

Abra `private-data/catalogo.json` e altere os campos desejados. Exemplo:

```json
{
  "produto": [
    {
      "id": "1",
      "categoria": "Vodka",
      "descricao": "Garrafa 1L",
      "imagem": "/produtos/vodka-absolut.jpg",
      "nome": "Vodka Absolut",
      "preco": 140,
      "tipo": "produto",
      "ativo": true
    }
  ],
  "ingressos": [
    {
      "id": "1",
      "ativo": true,
      "dataLimite": "10 jun",
      "esgotado": false,
      "nome": "1º lote",
      "preco": 50
    }
  ]
}
```

Campos úteis:

- `ativo: false`: oculta produto ou ingresso no site.
- `esgotado: true`: mantém o ingresso visível como esgotado.
- `estoque`: opcional; mostra aviso de últimas unidades quando for menor ou igual a 5.
- `itens`: opcional; lista os itens de um combo.

## Publicar alterações

```bash
npm run catalogo:publicar
```

O comando atualiza ou cria os documentos listados no JSON. Ele não exclui documentos ausentes; use `ativo: false` para ocultá-los.
