<script>
/**
 * システムのバージョンアップを促すためのダイアログコンポーネントです。
 *
 * - Vuex.systems を参照してアプリのバージョンと Firestore のバージョンを比較し、
 *   アプリのバージョンが古ければ強制的に起動されます。
 * - layouts コンポーネントに実装します。
 * - PC 表示の場合は更新（再読み込み）を、モバイル表示の場合は再起動を要求します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * Vuex.systems の isLatest を参照し、アプリのバージョンが古ければ true を返します。
     * ダイアログを起動するトリガーです。
     */
    dialog() {
      return !this.$store.getters['systems/isLatest']
    },

    /**
     * ダイアログのメッセージです。
     */
    message() {
      const isMobile = this.$vuetify.breakpoint.mobile
      const message = isMobile ? `再起動` : `更新（再読み込み）`
      return `${message}`
    },

    /**
     * アプリに求められるバージョンです。
     * Vuex.systems の version を返します。
     */
    requiredVersion() {
      return this.$store.state.systems.version
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * アプリをリロードします。
     * - PWA では Service Worker を介してキャッシュが更新されるため、
     *   ページのリロードで新しいバージョンが適用されます。
     */
    reloadApp() {
      this.loading = true
      window.location.reload(true) // キャッシュを無視してリロード
    },
  },
}
</script>

<template>
  <v-dialog
    :value="dialog"
    max-width="360"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar color="info" dark dense flat>
        <v-icon style="transform: scaleX(-1)" left>mdi-chat-alert</v-icon>
        <v-toolbar-title>更新が必要です</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="pt-5">
        新しいバージョン{{ ` (ver ${requiredVersion}) ` }}が提供されています。
        現在のバージョンのままでは使用できません。 {{ message }}をしてください。
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          block
          color="info"
          :disabled="loading"
          :loading="loading"
          @click="reloadApp"
        >
          {{ message }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
