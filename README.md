# RN Learning Mobile

Bare React Native 0.86 application using React Navigation and Adobe Commerce/Magento GraphQL.

## Documentation

- [Bare React Native migration](docs/BARE_REACT_NATIVE_MIGRATION.md)
- [Complete app and code guide](docs/COMPLETE_APP_GUIDE.md)
- [Adobe Commerce GraphQL map](docs/ADOBE_COMMERCE_GRAPHQL.md)

## Start

```bash
cp .env.example .env
npm install
npm start
```

In a second terminal, with an Android emulator or device available:

```bash
npm run android
```

Create a debug APK with `npm run android:debug-apk`. The output is `android/app/build/outputs/apk/debug/app-debug.apk`.
