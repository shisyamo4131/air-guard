<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <g-navigation-drawer v-model="drawer" app fixed bottom temporary />
    <v-app-bar app color="primary" dark dense fixed flat>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Air Guard</v-toolbar-title>
      <v-spacer />
      <v-dialog v-model="dialog" max-width="360" persistent>
        <template #activator="{ attrs, on }">
          <v-btn v-bind="attrs" icon v-on="on"><v-icon>mdi-cog</v-icon></v-btn>
        </template>
        <v-card>
          <v-toolbar color="primary" dark flat dense>
            <v-toolbar-title>ユーザー情報</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-4">
            <v-form ref="form" :disabled="loading">
              <g-text-field v-model="model.uid" label="UID" disabled />
              <g-text-field v-model="model.displayName" label="表示名" />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <g-btn-cancel-icon :disabled="loading" @click="dialog = false" />
            <g-btn-submit-icon
              :disabled="loading"
              :loading="loading"
              color="primary"
              @click="submit"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-app-bar>
    <v-main>
      <Nuxt keep-alive :keep-alive-props="{ include: keepAlivePages }" />
    </v-main>
  </v-app>
</template>

<script>
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GNavigationDrawer from '~/components/organisms/GNavigationDrawer.vue'
import User from '~/models/User'
export default {
  name: 'DefaultLayout',
  components: { GNavigationDrawer, GTextField, GBtnCancelIcon, GBtnSubmitIcon },
  data() {
    return {
      drawer: false,
      dialog: false,
      loading: false,
      model: new User(),
    }
  },
  computed: {
    containerClass() {
      const result = {}
      if (this.$vuetify.breakpoint.smAndDown) {
        result['pa-0'] = true
      }
      return result
    },
    /**
     * keepAliveを適用するページを制御します。
     * - $route.pathを参照し、表示しているページのカテゴリに応じてキャッシュするページを切り替えます。
     */
    keepAlivePages() {
      const topLevelPath = this.$route.path.split('/').slice(0, 2).join('/')
      switch (topLevelPath) {
        case '/customers':
          return ['CustomersIndex']
        case '/sites':
          return ['SitesIndex']
        // case '/employees':
        //   return ['EmployeesIndex', 'EmployeeDetail']
        default:
          return []
      }
    },
  },
  watch: {
    dialog: {
      handler(v) {
        !v || this.initialize()
      },
    },
  },
  methods: {
    initialize() {
      this.model.initialize(this.$store.state.auth.data)
      this.$refs.form?.resetValidation()
      // this.scrollTarget?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    },
    async submit() {
      if (!this.validate()) return
      try {
        this.loading = true
        await this.model.update()
        this.dialog = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    validate() {
      const result = this.$refs.form.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
  },
}
</script>

<style>
.firebase-emulator-warning {
  display: none;
}

.center-input input {
  text-align: center;
}

.right-input input {
  text-align: right;
}

.g-card__title:before {
  content: '';
  position: absolute;
  left: 4px;
  /*bottom: -15px; /*線の上下位置*/
  display: inline-block;
  width: 5px; /*線の長さ*/
  height: 32px; /*線の太さ*/
  /* -webkit-transform: translateX(-50%);
  /* transform: translateX(-50%); /*位置調整*/
  background-color: #0d47a1; /*線の色*/
  border-radius: 2px; /*線の丸み*/
}

.g-card__title {
  display: block;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* SITE-OPERATION-SCHEDULE */
.g-list-item--site-operation-schedule-day > .v-list-item__content,
.g-list-item--site-operation-schedule-night > .v-list-item__content {
  padding-left: 12px;
}

.g-list-item--site-operation-schedule-day > .v-list-item__content::before,
.g-list-item--site-operation-schedule-night > .v-list-item__content::before {
  content: '';
  position: absolute;
  left: 60px;
  /*bottom: -15px; /*線の上下位置*/
  display: inline-block;
  width: 4px; /*線の長さ*/
  height: 36px; /*線の太さ*/
  /* -webkit-transform: translateX(-50%);
  /* transform: translateX(-50%); /*位置調整*/
  border-radius: 2px; /*線の丸み*/
}

.g-list-item--site-operation-schedule-day > .v-list-item__content::before {
  background-color: #2196f3; /*線の色*/
}

.g-list-item--site-operation-schedule-night > .v-list-item__content::before {
  background-color: #f44336; /*線の色*/
}

/* v-data-tableのheaders.cellClassに設定 */
.truncate-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}

/**
 * 親コンテナにdisplay: flexとheightが指定されていること。
 */
.flex-table {
  display: flex;
  flex-grow: 1;
  width: 100%;
}

.flex-table > div {
  width: 100%;
}

/*****************************************************************************
 * arrangement-table (配置管理用テーブル) 
 *****************************************************************************/
#arrangement-table > div > table > thead > tr > th {
  text-align: center;
  min-width: 240px;
  max-width: 240px;
}

#arrangement-table > div > table > tbody > tr:nth-child(odd) td[colspan] {
  background-color: lightgrey;
}

#arrangement-table > div > table > tbody > tr:nth-child(odd) td[colspan] div {
  display: inline-block;
  position: sticky;
  left: 16px;
  z-index: 1 !important; /* 他の要素より前面に表示 */
  /* box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1); */ /* 境界線を強調するための影 */
}

/*****************************************************************************
 * vue-draggable で ドラッグ用アイコンのポインターを指定
 *****************************************************************************/
.handle {
  cursor: pointer;
}
</style>
