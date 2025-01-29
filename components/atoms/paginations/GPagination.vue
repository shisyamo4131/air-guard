<script>
/**
 * プロジェクトで使用するページネーションコンポーネントです。
 * - 本来 VPagination はコンテナに自動的に収まるはずですが、なぜかはみ出てしまうケースがあります。
 * - この状況に対応したコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-01-29
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントのコンテナサイズを調整するためのプロパティです。
     * - 11 以上にするとはみ出てしまうかもしれません。
     */
    cols: { type: [String, Number], default: 10, required: false },
  },
}
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :cols="cols">
        <v-pagination v-bind="$attrs" v-on="$listeners" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style></style>
