<script>
/**
 * 健康保険情報を表示するためのカードコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-02-10
 */
import { vueProps } from '~/models/HealthInsurance'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: { ...vueProps },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedAcquisitionDate() {
      return this.acquisitionDate
        ? this.$dayjs(this.acquisitionDate).format('YYYY年MM月DD日')
        : 'N/A'
    },
  },
}
</script>

<template>
  <v-card outlined>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle> 資格取得日 </v-list-item-subtitle>
          <v-list-item-title class="pb-2">
            {{ computedAcquisitionDate }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-subtitle> 被保険者整理番号 </v-list-item-subtitle>
          <v-list-item-title>
            {{ `${policyNumber || '-'}` }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style></style>
