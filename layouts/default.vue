<template>
  <v-app :style="{ background: $vuetify.theme.themes.light.background }">
    <g-navigation-drawer v-model="drawer" app fixed bottom />
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
      <!-- <Nuxt keep-alive :keep-alive-props="{ include: keepAlivePages }" /> -->
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GBtnCancelIcon from '~/components/molecules/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/molecules/btns/GBtnSubmitIcon.vue'
import GNavigationDrawer from '~/components/organisms/GNavigationDrawer.vue'
export default {
  name: 'DefaultLayout',
  components: { GNavigationDrawer, GTextField, GBtnCancelIcon, GBtnSubmitIcon },
  data() {
    return {
      drawer: false,
      dialog: false,
      loading: false,
      model: this.$User(),
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
    keepAlivePages() {
      const result = ['CustomersIndex']
      // const result = []
      return result
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

/* v-data-tableのheaders.cellClassに設定 */
.truncate-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
}
</style>
