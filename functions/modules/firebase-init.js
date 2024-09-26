// firebase-init.js (Firebaseの初期化モジュール)
import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

// Firebaseアプリの初期化
initializeApp()

// グローバルオプションの設定
setGlobalOptions({ region: 'asia-northeast1' })
