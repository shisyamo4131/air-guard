<script>
/**
 * ### GSimpleTableEmployeeBasic
 *
 * 従業員の基本情報を表示するSimpleTableコンポーネントです。
 *
 * @author shisyamo4131
 * @create 2024-07-02
 * @version 1.0.0
 *
 * 更新履歴:
 * version 1.0.1 - 2027-07-03
 *  - 血液型が正常に表示されていなかったのを修正。
 */
import ja from 'dayjs/locale/ja'
import { vueProps } from '~/models/propsDefinition/Employee'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    age() {
      const from = this.$dayjs(this.birth)
      const to = this.$dayjs()
      return to.diff(from, 'y')
    },
    birthJa() {
      return this.$dayjs(this.birth).locale(ja).format('YYYY年MM月DD日')
    },
    hireDateJa() {
      return this.$dayjs(this.hireDate).locale(ja).format('YYYY年MM月DD日')
    },
  },
}
</script>

<template>
  <v-simple-table class="info-table">
    <tbody>
      <tr>
        <td>CODE</td>
        <td>{{ code }}</td>
      </tr>
      <tr>
        <td>入社日</td>
        <td>{{ hireDateJa }}</td>
      </tr>
      <tr>
        <td>生年月日</td>
        <td>{{ birthJa }}</td>
      </tr>
      <tr>
        <td>年齢</td>
        <td>{{ `${age} 歳` }}</td>
      </tr>
      <tr>
        <td>性別</td>
        <td>
          <v-icon :color="gender === 'male' ? 'blue' : 'pink'" small>{{
            `mdi-gender-${gender}`
          }}</v-icon
          >{{ `${gender === 'male' ? '男性' : '女性'}` }}
        </td>
      </tr>
      <tr>
        <td>血液型</td>
        <td>{{ bloodType }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<style scoped>
.info-table td:nth-child(2) {
  text-align: right;
}
</style>
