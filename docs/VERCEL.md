# Deploy secundário na Vercel

A Vercel pode hospedar uma cópia do front-end. Os cadastros continuam sendo enviados para o mesmo Cloud Firestore configurado pelas variáveis `VITE_FIREBASE_*`.

## Publicar pela CLI

```bash
npx vercel login
npm run deploy:vercel
```

Na primeira publicação:

- Confirme a pasta atual como raiz do projeto.
- Use o preset `Vite`.
- Configure as variáveis `VITE_FIREBASE_*` no painel da Vercel ou aceite o envio das variáveis locais quando solicitado.

## Publicar pelo GitHub

Também é possível importar o repositório em https://vercel.com/new e preencher as variáveis em **Project Settings > Environment Variables**.

## Rotas internas

O arquivo `vercel.json` redireciona as rotas da SPA para `index.html`, permitindo abrir `/pre-lista` e `/checkout` diretamente.

## Domínio

Use uma hospedagem como origem principal do domínio. A segunda URL funciona como alternativa manual. Para failover automático, seria necessário configurar DNS ou um proxy externo com monitoramento de disponibilidade.
