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
 * @version 1.0.0
 * @create 2024-06-25
 * @author shisyamo4131
 *
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
    <v-card-title class="g-card__title">{{ value }}</v-card-title>
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
