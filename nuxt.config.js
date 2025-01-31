import colors from 'vuetify/es5/util/colors'
import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'local'}` })

export default {
  // Rewrite NODE_ENV to switch firebase settings according to the environment.
  env: {
    NODE_ENV: process.env.NODE_ENV || 'dev',
    API_KEY: process.env.API_KEY,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    PROJECT_ID: process.env.PROJECT_ID,
    DATABASE_URL: process.env.DATABASE_URL,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
    APP_ID: process.env.APP_ID,
    // Google Maps の API を使用するための API_KEY
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    htmlAttrs: {
      lang: 'ja', // 日本語であることを指定（2024-11-12 add）
    },
    titleTemplate: '%s - air-guard',
    title: 'air-guard',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'google', content: 'notranslate' }, // Google翻訳プロンプトを抑止（2024-11-12 add）
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    './plugins/firebase.auth.js',
    './plugins/dayjs.js',
    './plugins/air-vuetify.js',
    './plugins/constants.js',
    './plugins/vue-papa-parse.js',
    './plugins/holiday.js',
    './plugins/placement-sheet.js',
    './plugins/pdf/labor-terms-generator.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'ja', // head.htmlAttrs で設定しても PWA モジュールが上書きしてしまうため再設定
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
        light: {
          // primary: colors.blue.darken2,
          // accent: colors.grey.darken3,
          // secondary: colors.amber.darken3,
          // info: colors.teal.lighten1,
          // warning: colors.amber.base,
          // error: colors.deepOrange.accent4,
          // success: colors.green.accent3,
          primary: '#1B3B6F', // Deep Blue: 主な基調色として、信頼性と安定感を象徴
          secondary: '#6A994E', // Olive Green: 補助色として自然や調和をイメージ
          accent: '#D1495B', // Burnt Orange: アクセントカラーとして、エネルギッシュで暖かみのある色
          info: '#468FAF', // Teal: 情報をクリアに表現する青緑
          warning: '#D4A373', // Golden Yellow: 注意や警告を促す暖かみのある黄色
          error: '#A63A50', // Brick Red: エラーや危険を示す落ち着いた赤
          success: '#6D597A', // Royal Purple: 成功や高級感を象徴する深い紫
          highlight: '#3E4C59', // Steel Gray: 特定の要素を目立たせるニュートラルなグレー
          background: '#f5f5f5',
        },
      },
      options: {
        /**
         * Vuetify のテーマカラーをルートの <html> 要素に含める設定
         * コンポーネントにカラーコードで色を設定しなければならないときに便利な設定
         * ‐ getComputedStyle(document.documentElement).getPropertyValue('--v-parimary-base') で取得可能になる。
         * - インラインスタイルで使う場合は var(--v-primary-base) でも取得可能
         */
        customProperties: true, // css, style でテーマカラーを使えるようにする
      },
    },
    breakpoint: {
      mobileBreakpoint: 'xs',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  router: {
    middleware: ['authenticated'],
  },

  pageTransition: {
    name: 'slide-x-transition',
    mode: 'out-in',
    duration: 300,
  },

  layoutTransition: {
    name: 'slide-x-transition',
    mode: 'out-in',
    duration: 300,
  },
}
