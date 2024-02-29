/**
 * firebase.js
 * (c) 2023 shisyamo4131
 *
 * Initialize firebase app and export instances of firebase services.
 * API keys should be configured in '.env.xxx.js' files.
 *
 * ex.)
 * .env.local.js for local using Firebase Emulators.
 * .env.dev.js for development using Firebase Project.
 * .env.prod.js for production using Firebase Project.
 *
 * Learn more about publicRuntimeConfig.
 * https://nuxtjs.org/docs/directory-structure/nuxt-config#runtimeconfig
 *
 * ----------------------------------------------------------------------------
 *  HOW TO USE
 * ----------------------------------------------------------------------------
 * 1. Install cross-env to your project.
 *    npm i cross-env
 *
 * 2. Create '.env.local.js', '.env.dev.js' and '.env.prod.js' at root directory.
 *    Configure API keys in each file. show below.
 *    [.env.dev.js]
 *    -------------------------------------------------------------------------
 *    module.exports = {
 *      apiKey: 'XXXXX',
 *      authDomain: 'XXXXX',
 *      databaseURL: 'XXXXX',
 *      projectId: 'XXXXX',
 *      storageBucket: 'XXXXX',
 *      messagingSenderId: 'XXXXX',
 *      appId: 'XXXXX',
 *      vapidKey: 'XXXXX',
 *    }
 *    -------------------------------------------------------------------------
 *
 * 3. Edit package.json's scripts.
 * 
 * ex.)
  "scripts": {
    "local": "cross-env NUXT_HOST=localhost NUXT_PORT=3000 NODE_ENV=\"local\" nuxt",
    "dev": "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=3000 NODE_ENV=\"dev\" nuxt",
    "prod": "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=3000 NODE_ENV=\"prod\" nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate",
    "generate:dev": "cross-env NODE_ENV=\"dev\" nuxt generate",
    "generate:prod": "cross-env NODE_ENV=\"prod\" nuxt generate",
    "deploy:dev": "npm run generate:dev && firebase use dev && firebase deploy",
    "deploy:prod": "npm run generate:prod && firebase use prod && firebase deploy && firebase use dev",
    "hosting:dev": "npm run generate:dev && firebase use dev && firebase deploy --only hosting",
    "hosting:prod": "npm run generate:prod && firebase use prod && firebase deploy --only hosting && firebase use dev",
    "lint:js": "eslint --ext \".js,.vue\" --ignore-path .gitignore .",
    "lint:prettier": "prettier --check .",
    "lint": "npm run lint:js && npm run lint:prettier",
    "lintfix": "prettier --write --list-different . && npm run lint:js -- --fix"
  },
 *
 * 4. Edit nuxt.config.js
 *
 * - Add the 'env' property as follows.
 *
  env: {
    NODE_ENV: process.env.NODE_ENV || 'dev'
  }
 *
 * note)
 * Even if you use cross-env, you cannot rewrite process.env.NODE_ENV without this setting.
 * https://qiita.com/y-temp4/items/84bb16e2ccf8efaf82fc
 *
 * - Edit the 'plugins' property to load this file.
 *
  plugins: ['./plugins/firebase.js']
 * 
 * @update 2024-02-29 Emulator接続でFirestoreが以下のエラーを返すことがある。
 *                    ---------------------------------------------------
 *                    @firebase/firestore: Firestore (x.xx.x): Could not reach
 *                    Cloud Firestore backend. Backend didn't respond within 10 seconds.
 *                    ---------------------------------------------------
 *                    原因は不明だが、Firestoreの初期化時にexperimentalForceLongPollingを
 *                    有効にすると改善する報告があるものの、firebase v10.7.1では改善されず。
 *                    v10.6.0にダウングレードしたところ、現象が発生しなくなったようなので
 *                    しばらく様子見。
 */

/* eslint-disable */
import { initializeApp } from 'firebase/app'
// import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import {
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const firebaseConfig = require(`@/.env.${process.env.NODE_ENV}.js`)

export default (context, inject) => {
  // Verifing firebase-configuration.
  verifyConfiguration()

  // Announce about connection mode.
  console.log(
    `[firebase.js] Connect to firebase as ${process.env.NODE_ENV} mode.`
  )

  // Initialize firebase.
  const firebaseApp = initializeApp(firebaseConfig)
  const inAuth = getAuth(firebaseApp)
  const inFunctions = getFunctions(firebaseApp)
  // const inFirestore = getFirestore(firebaseApp)
  const inFirestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  })
  const inDatabase = getDatabase(firebaseApp)
  const inStorage = getStorage(firebaseApp)
  const inVapidKey = firebaseConfig?.vapidKey || ''

  /* Connect to emulators if environment is 'local'. */
  if (process.env.NODE_ENV === 'local') {
    console.log('[firebase.js] firebase is using emulators!')
    connectAuthEmulator(inAuth, 'http://localhost:9099')
    connectFunctionsEmulator(inFunctions, 'localhost', 5001)
    connectFirestoreEmulator(inFirestore, 'localhost', 8080)
    connectDatabaseEmulator(inDatabase, 'localhost', 9000)
    connectStorageEmulator(inStorage, 'localhost', 9199)
  }

  /* inject */
  inject('firebase', firebaseApp)
  inject('auth', inAuth)
  inject('functions', inFunctions)
  inject('firestore', inFirestore)
  inject('database', inDatabase)
  inject('storage', inStorage)
  inject('vapidKey', inVapidKey)
}

function verifyConfiguration() {
  const requiredProps = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ]
  requiredProps.forEach((prop) => {
    if (!(prop in firebaseConfig)) {
      throw new Error(
        `[firebase.js] A ${prop} is required but not set in firebase-config.`
      )
    }
  })
  const optionalProps = ['databaseURL', 'vapidKey']
  optionalProps.forEach((prop) => {
    if (!(prop in firebaseConfig)) {
      console.warn(
        `[firebase.js] A ${prop} is not set. If you do not use ${prop}, you can ignore this message.`
      )
    }
  })
}

/* eslint-enable */
