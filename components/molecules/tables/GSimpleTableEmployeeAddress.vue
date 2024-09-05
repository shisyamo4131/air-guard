<script>
/**
 * ### GSimpleTableEmployeeBasic
 *
 * 従業員の住所情報を表示するSimpleTableコンポーネントです。
 *
 * @author shisyamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
import { vueProps } from '~/models/propsDefinition/Employee'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
}
</script>

<template>
  <v-simple-table class="info-table">
    <tbody>
      <tr>
        <td>郵便番号</td>
        <td>{{ zipcode }}</td>
      </tr>
      <tr>
        <td>住所1</td>
        <td>{{ address1 }}</td>
      </tr>
      <tr>
        <td>住所2</td>
        <td>{{ address2 }}</td>
      </tr>
      <tr>
        <td>送付先</td>
        <td>
          {{ hasSendAddress ? '上記と異なる' : '登録住所' }}
        </td>
      </tr>
      <tr v-if="hasSendAddress">
        <td>郵便番号</td>
        <td>{{ sendZipcode }}</td>
      </tr>
      <tr v-if="hasSendAddress">
        <td>住所1</td>
        <td>{{ sendAddress1 }}</td>
      </tr>
      <tr v-if="hasSendAddress">
        <td>住所2</td>
        <td>{{ sendAddress2 }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style scoped>
.info-table td:nth-child(2) {
  text-align: right;
}
</style>
