<script>
/**
 * ### GDialogLoading
 * @version 1.0.0
 * @date 2024-06-20
 * @autor shisyamo4131
 *
 * 概要:
 * GDialogLoadingコンポーネントは、データを読み込んでいる最中であることをユーザーに通知するための
 * Vuetifyのダイアログコンポーネントです。プログレスバーを表示し、ユーザーに待機状態を示します。
 *
 * 主な機能:
 * - 親コンポーネントから渡されたvalue属性に基づき、ダイアログの表示状態を管理します。
 * - ダイアログの表示状態が変わると、inputイベントを発火して親コンポーネントに通知します。
 *
 * 使用例:
 * <GDialogLoading :value="isLoading" @input="isLoading = $event" />
 *
 * props設定:
 * このコンポーネントは、親コンポーネントから渡される属性（$attrs）を利用してダイアログをカスタマイズします。
 * ダイアログの表示状態はvalue属性によって制御されます。
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このコンポーネントは、Vuetifyライブラリに依存しています。
 */

export default {
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false, // ダイアログの表示状態を管理するフラグ
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    // 親から渡されたvalue属性の変更を監視
    '$attrs.value': {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.dialog = newVal // dialogフラグを更新
      },
      immediate: true,
    },
    // dialogフラグの変更を監視
    dialog(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('input', newVal) // 親コンポーネントに変更を通知
    },
  },
}
</script>

<template>
  <!-- ダイアログコンポーネント -->
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    persistent
    width="300"
    v-on="$listeners"
  >
    <!-- ダイアログのカード -->
    <v-card color="primary" dark>
      <v-card-text class="pt-3">
        データを読み込んでいます。
        <!-- プログレスバー -->
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style>
/* 必要に応じてスタイルを追加 */
</style>
