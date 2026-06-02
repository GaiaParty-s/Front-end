# Configuração do Firebase

O Firebase Hosting e o Cloud Firestore podem ser usados no plano gratuito Spark para este estágio inicial.

## 1. Crie o projeto

1. Acesse https://console.firebase.google.com/
2. Crie um projeto.
3. Adicione um aplicativo Web.
4. Abra **Project settings > General > Your apps > SDK setup and configuration**.
5. Copie os valores apresentados.

## 2. Configure o front-end

Duplique `.env.example` como `.env` e preencha:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Esses valores identificam o app Web. A proteção dos dados depende das regras do Firestore incluídas em `firestore.rules`. Nunca permita leitura pública da coleção `preLista`.

## 3. Crie o Firestore

1. No console, abra **Build > Firestore Database**.
2. Clique em **Create database**.
3. Selecione uma localização próxima dos usuários.
4. Use o modo de produção.

## 4. Vincule o projeto local

Duplique `.firebaserc.example` como `.firebaserc` e substitua `SEU_PROJECT_ID`.

## 5. Faça login e publique

Use a CLI sob demanda:

```bash
npx firebase-tools login
npm run build
npx firebase-tools deploy
```

O deploy publica:

- O conteúdo compilado de `dist` no Firebase Hosting.
- As regras de segurança de `firestore.rules`.

O Hosting está configurado para SPA: `/pre-lista` e `/checkout` continuam funcionando quando abertas diretamente.

## Privacidade

A coleção `preLista` recebe nome, CPF, nascimento, telefone e e-mail. Esses dados são pessoais:

- Restrinja o acesso ao console Firebase.
- Não compartilhe exportações CSV.
- Exclua os dados quando não forem mais necessários.
- Configure Firebase App Check antes de divulgar amplamente o formulário para reduzir abuso automatizado.

Para exportar os cadastros com uma conta administrativa e alimentar a conferência local, consulte [tools/README.md](../tools/README.md).

Documentação oficial:

- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/docs/hosting/quickstart
