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

## Validação local da pré-lista

Os cadastros válidos são enviados ao Cloud Firestore. O utilitário em `tools/validar_pre_lista.py` analisa um CSV exportado localmente, sem enviar CPF ou data de nascimento para terceiros. Consulte [tools/README.md](tools/README.md) para executar o fluxo.

## Firebase

Consulte [docs/FIREBASE.md](docs/FIREBASE.md) para configurar o Firestore e publicar gratuitamente no Firebase Hosting.
