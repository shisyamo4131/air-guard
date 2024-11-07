<script>
/**
 * ## GDialogRequiredSystemUpdate
 *
 * システムのバージョンアップを促すためのダイアログコンポーネントです。
 *
 * - PC 表示の場合は更新（再読み込み）を、モバイル表示の場合は再起動を要求します。
 *
 * @author shisyamo4131
 */
export default {
  computed: {
    dialog() {
      return this.$store.getters['systems/isLatest']
    },

    message() {
      const isMobile = this.$vuetify.breakpoint.mobile
      const message = isMobile ? `再起動` : `更新（再読み込み）`
      return `${message}をしてください。`
    },

    requiredVersion() {
      return this.$store.state.systems.version
    },
  },
}
</script>

<template>
  <v-dialog :value="dialog" max-width="360" persistent>
    <v-card>
      <v-toolbar color="error" dark dense flat>
        <v-icon left>mdi-chat-alert</v-icon>
        <v-toolbar-title>更新が必要です</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="pt-5">
        新しいバージョン{{ ` (ver ${requiredVersion}) ` }}が提供されています。
        現在のバージョンのままでは使用できません。
        {{ message }}
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style></style>
