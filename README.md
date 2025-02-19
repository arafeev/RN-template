# React Native Starter App

Welcome to the React Native Starter App! This project serves as a template for creating new React Native applications using React Native CLI. It includes essential features like React Navigation, Redux Toolkit, RTK Query, AsyncStorage for authentication persistence, and handling private and public routes.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (or [Yarn](https://yarnpkg.com/)).
- You have installed [React Native CLI](https://reactnative.dev/docs/environment-setup).
- You have set up the development environment for [iOS](https://reactnative.dev/docs/environment-setup#ios-development-environment) and/or [Android](https://reactnative.dev/docs/environment-setup#android-development-environment) as per the official React Native documentation.

## Project Structure

Here is an overview of the project structure:

```plaintext
react-native-starter-app
├── android/                # Native Android code
├── ios/                    # Native iOS code
├── src/                    # Source code for the React Native app
│   ├── assets/             # Asset files (images, fonts, etc.)
│   ├── components/         # Reusable components
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── store/              # Manage state using Redux Toolkit and API Service using RTK Query
│   ├── utils/              # Styling files
│   └── hooks               # Entry point of the application
├── .gitignore              # Git ignore file
├── App.js                  # Entry point for the React Native app
├── app.json                # Configuration file for the app
├── babel.config.js         # Babel configuration
├── index.js                # Entry point for the React Native app
├── metro.config.js         # Metro bundler configuration
├── package.json            # NPM dependencies and scripts
├── README.md               # Project documentation
└── yarn.lock               # Yarn lock file
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/apelmahmudDev/react-native-starter
   ```

2. Navigate to the project directory:

   ```bash
   cd react-native-starter
   ```

3. Install the dependencies:

   If you are using npm:

   ```bash
   npm install
   ```

   If you are using Yarn:

   ```bash
   yarn install
   ```

## Running the App

### iOS

1. Navigate to the `ios` directory and install the CocoaPods dependencies:

   ```bash
   cd ios
   pod install
   cd ..
   ```

2. Run the app:

   ```bash
   npx react-native run-ios
   ```

### Android

1. Start the Android emulator or connect your Android device.

2. Run the app:

   ```bash
   npx react-native run-android
   ```

## Contributing

Contributions are always welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

---

Thank you for using the React Native Starter App! If you have any questions or need further assistance, feel free to open an issue on GitHub. Happy coding!
