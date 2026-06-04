# Sunset Sessions

Landing page da Sunset Sessions desenvolvida com React e Vite.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Checkout Mercado Pago

O checkout usa um gateway separado em `../gateway-pagamento`, mantendo o token do Mercado Pago fora do front-end. O front chama `${VITE_API_BASE_URL}/api/mercadopago/preference`, a API valida o item no Firestore, cria um pedido na colecao `pedidos`, cria a preferencia no Mercado Pago e redireciona o cliente.

Configure no front-end:

```text
VITE_API_BASE_URL=https://seu-gateway.vercel.app
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR... ou TEST...
```

Configure na Vercel do gateway:

```text
MERCADO_PAGO_ACCESS_TOKEN=APP_USR... ou TEST...
MERCADO_PAGO_USE_SANDBOX=true
PUBLIC_SITE_URL=https://seu-front.vercel.app
CORS_ORIGIN=https://seu-front.vercel.app
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

Opcionalmente, defina no gateway:

```text
MERCADO_PAGO_WEBHOOK_URL=https://seu-gateway.vercel.app/api/mercadopago/webhook
MERCADO_PAGO_WEBHOOK_SECRET=assinatura_secreta_do_webhook
```

No Mercado Pago Developers, configure o webhook de pagamentos para:

```text
https://seu-gateway.vercel.app/api/mercadopago/webhook
```

Para testar em sandbox, use credenciais de teste do Mercado Pago e mantenha `MERCADO_PAGO_USE_SANDBOX=true`. Em producao, troque para o access token de producao e defina `MERCADO_PAGO_USE_SANDBOX=false`.

## Validação local da pré-lista

Os cadastros válidos são enviados ao Cloud Firestore. O utilitário em `tools/validar_pre_lista.py` analisa um CSV exportado localmente, sem enviar CPF ou data de nascimento para terceiros. Consulte [tools/README.md](tools/README.md) para executar o fluxo.

## Firebase

Consulte [docs/FIREBASE.md](docs/FIREBASE.md) para configurar o Firestore e publicar gratuitamente no Firebase Hosting.
