<script>
/**
 * ### GChipEmployee
 * 社員の簡易情報を表示するChipコンポーネントです。
 *
 * - licensedプロパティがtrueの場合、ラベルの前に'mdi-circle-double'アイコンを表示します。
 * - continuousプロパティがtrueの場合、ラベルの後に'mdi-star'アイコンを表示します。
 * - errorsプロパティにエラーが含まれる場合、ラベルの後に'mdi-alert-circle'アイコンを表示し、Chipの色をERRORに設定して、ツールチップにエラー内容を表示します。
 *
 * @component
 * @example
 * <GChipEmployee :docId="employeeId" :errors="errorList" :licensed="true" :continuous="false" />
 *
 * @props {Array} errors - エラーメッセージの配列
 * @props {Boolean} licensed - ライセンスがあるかどうか
 * @props {Boolean} continuous - 連続勤務かどうか
 * @props {String} docId - 社員のドキュメントID
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    docId: { type: String, required: true },
    errors: { type: Array, default: () => [], required: false },
    licensed: { type: Boolean, default: false, required: false },
    continuous: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    abbr() {
      const employee = this.$store.getters['masters/Employee'](this.docId)
      return employee?.abbr || undefined
    },
    color() {
      if (this.errors.length) return 'error'
      return 'primary'
    },
  },
}
</script>

<template>
  <v-chip v-bind="$attrs" :color="color" label v-on="$listeners">
    <div class="d-flex" style="width: 96px">
      <v-icon v-if="licensed" color="amber lighten-2" left x-small
        >mdi-circle-double</v-icon
      >
      <div class="text-truncate">
        <span v-if="abbr">{{ abbr }}</span>
        <v-progress-circular v-else :size="16" :width="2" indeterminate />
      </div>
      <div class="ml-auto">
        <v-tooltip v-if="errors.length" top>
          <template #activator="{ attrs, on }">
            <v-icon v-bind="attrs" small v-on="on">mdi-alert-circle</v-icon>
          </template>
          <ul v-for="(error, index) of errors" :key="index">
            <li>{{ error }}</li>
          </ul>
        </v-tooltip>
        <v-icon v-else-if="continuous" color="red" small>mdi-star</v-icon>
      </div>
    </div>
  </v-chip>
</template>

<style></style>
