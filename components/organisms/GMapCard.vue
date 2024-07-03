<script>
/**
 * ### GMapCard
 *
 * `props.value`で与えられた住所をもとにGoogleマップを表示するCardコンポーネントです。
 *
 * @props
 * @prop {String} value - 住所です。
 *
 * @events
 * イベントはありません。
 *
 * @slots
 * スロットはありません。
 *
 * @author shisyamo4131
 * @version 1.0.1
 *
 * 更新履歴:
 * version 1.0.1 - 2024-07-03
 *  - v-card-titleのクラスに`d-block`、`text-truncate`を設定。
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: { type: String, required: true },
  },
}
</script>

<template>
  <v-card class="d-flex flex-column" v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title d-block text-truncate">{{
      value
    }}</v-card-title>
    <v-card-text class="d-flex flex-grow-1">
      <iframe
        :src="`https://maps.google.com/maps?output=embed&q=${value}&t=m&hl=ja&z=12`"
        width="100%"
        height="auto"
        frameborder="0"
        style="border: 0"
        allowfullscreen=""
      />
    </v-card-text>
  </v-card>
</template>

<style></style>
