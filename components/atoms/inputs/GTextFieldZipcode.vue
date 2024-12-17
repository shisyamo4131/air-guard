<script>
/**
 * 郵便番号入力用テキストフィールドコンポーネントです。
 * - 入力された郵便番号に該当する住所を `loaded` イベントで取得可能です。
 * @author shisyamo4131
 */
import ARenderlessZipcode from '../renderless/ARenderlessZipcode.vue'
import GTextField from './GTextField.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, ARenderlessZipcode },
}
</script>

<template>
  <a-renderless-zipcode v-bind="$attrs" v-on="$listeners">
    <template #default="{ attrs, on }">
      <g-text-field
        class="center-input"
        style="max-width: 96px"
        v-bind="attrs"
        label="郵便番号"
        v-on="on"
      />
    </template>
  </a-renderless-zipcode>
</template>

<style></style>
