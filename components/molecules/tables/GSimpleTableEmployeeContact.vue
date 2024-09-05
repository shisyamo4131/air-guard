<script>
/**
 * ### GSimpleTableEmployeeBasic
 *
 * 従業員の連絡先情報を表示するSimpleTableコンポーネントです。
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
        <td>電話番号</td>
        <td>{{ tel }}</td>
      </tr>
      <tr>
        <td>携帯番号</td>
        <td>{{ mobile }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style scoped>
.info-table td:nth-child(2) {
  text-align: right;
}
</style>
