<script>
/**
 * 健康保険資格情報を表示するためのカードコンポーネントです。
 * @author shisyamo4131
 */
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import { vueProps } from '~/models/propsDefinition/HealthInsurance'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnEdit },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: undefined, required: false },
    ...vueProps,
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedDate() {
      if (!this.acquisitionDate) return null
      return this.$dayjs(this.acquisitionDate).format('YYYY年MM月DD日')
    },
    computedAmount() {
      return this.standardMonthlyAmount != null
        ? `${this.standardMonthlyAmount.toLocaleString()} 円`
        : `- 円`
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs">
    <v-list>
      <v-list-item>
        <v-list-item-icon>
          <v-icon :color="color" x-large>mdi-card-account-details</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-subtitle> 資格取得日 </v-list-item-subtitle>
          <v-list-item-title class="pb-2">
            {{ computedDate }}
          </v-list-item-title>
          <!-- 標準報酬月額は一旦不可視に -->
          <!--
          <v-list-item-subtitle> 標準報酬月額 </v-list-item-subtitle>
          <v-list-item-title class="pb-2">
            {{ computedAmount }}
          </v-list-item-title>
          -->
          <v-list-item-subtitle> 被保険者整理番号 </v-list-item-subtitle>
          <v-list-item-title>
            {{ policyNumber }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-actions class="justify-end">
      <g-btn-edit :color="color" small dark @click="$emit('click:edit')" />
    </v-card-actions>
  </v-card>
</template>

<style></style>
