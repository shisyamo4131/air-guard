<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <g-navigation-drawer v-model="drawer" app fixed temporary touchless />
    <v-app-bar app color="primary" dark dense fixed flat>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>
        Air Guard
        <span class="text-subtitle-2 ml-2">
          {{ `ver.${$store.state.systems['APP_VERSION']}` }}
        </span>
      </v-toolbar-title>
      <v-spacer />

      <!-- keepAlivePages の有効化スイッチ（開発用） -->
      <v-switch
        v-if="$store.getters['auth/isDeveloper']"
        v-model="keepContents"
        hide-details
        label="KEEP"
      />
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
            <g-btn-cancel icon :disabled="loading" @click="dialog = false" />
            <g-btn-submit
              icon
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
      <g-required-update-dialog />
    </v-main>
  </v-app>
</template>

<script>
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GNavigationDrawer from '~/components/organisms/GNavigationDrawer.vue'
import User from '~/models/User'
import GRequiredUpdateDialog from '~/components/organisms/GRequiredUpdateDialog.vue'
export default {
  name: 'DefaultLayout',
  components: {
    GNavigationDrawer,
    GTextField,
    GBtnCancel,
    GBtnSubmit,
    GRequiredUpdateDialog,
  },
  data() {
    return {
      drawer: false,
      dialog: false,

      // keepAlivePages を有効にするかどうか（開発用）
      keepContents: true,

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
      if (!this.keepContents) return []
      const topLevelPath = this.$route.path.split('/').slice(0, 2).join('/')
      switch (topLevelPath) {
        case '/customers':
          return ['CustomersIndex']
        case '/sites':
          return ['SitesIndex']
        case '/employees':
          return ['EmployeesIndex']
        case '/employee-contracts':
          return ['EmployeeContractsIndex']
        case '/employment-insurances':
          return ['EmploymentInsurancesIndex']
        case '/health-insurances':
          return ['healthInsurancesIndex']
        case '/pensions':
          return ['PensionsIndex']
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
/*****************************************************************************
  テーブルのセルの背景色定義
******************************************************************************/

/* 行のホバー時協調表示解除 */
tr.g-row.g-row-no-hover:hover {
  background-color: transparent !important;
}

/* セルホバー時のデフォルト背景色 */
.g-col:hover {
  background-color: #e0e0e0;
}

/* 土曜セルの背景色 */
.g-col.g-col-sat {
  background-color: #e3f2fd !important;
}

/* 土曜セルのホバー時背景色 */
.g-col.g-col-sat:hover {
  background-color: #bbdefb !important;
}

/* 日曜・祝日セルの背景色 */
.g-col.g-col-sun,
.g-col.g-col-holi {
  background-color: #ffebee !important;
}

/* 日曜・祝日セルのホバー時背景色 */
.g-col.g-col-sun:hover,
.g-col.g-col-holi:hover {
  background-color: #ffcdd2 !important;
}

/* 当日セルの背景色 */
.g-col.g-col-today {
  background-color: #fffde7 !important;
}

/* 当日セルのホバー時背景色 */
.g-col.g-col-today:hover {
  background-color: #fff9c4 !important;
}

/* 過去日付セルの背景色 */
.g-col.g-col-previous {
  background-color: #e0e0e0 !important;
}

/*****************************************************************************
  ダイアログの高さを固定するためのクラスです。
  v-dialog の content-class プロパティに設定すると、ダイアログの高さが固定されます。
  VDataIterator など、ダイアログ内で高さが変わるコンポーネントを使用する際に、
  ダイアログの高さが変わらないように固定します。
  fullscreen の場合は無視されます。
******************************************************************************/
.g-dialog__height--fixed:not(.v-dialog--fullscreen) {
  height: 90% !important;
}

/*****************************************************************************
  トランジションの定義です。
******************************************************************************/
/* フェード */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

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
 * 可変高のデータテーブル用クラス
 */
.flex-table-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
}

.flex-table-container > .v-data-table {
  display: flex;
  flex-grow: 1;
  width: 100%;
  overflow: hidden;
}

.flex-table-container > .v-data-table > .v-data-table__wrapper {
  width: 100%;
}

/* 以下、削除したい */
.flex-table {
  display: flex;
  flex-grow: 1;
  width: 100%;
  overflow: hidden;
}

.flex-table > div {
  width: 100%;
}
/* ここまで */

/*****************************************************************************
 * vue-draggable で ドラッグ用アイコンのポインターを指定
 *****************************************************************************/
.handle {
  cursor: pointer;
}
</style>
