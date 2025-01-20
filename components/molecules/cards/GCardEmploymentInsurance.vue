<script>
/**
 * 雇用保険資格情報を表示するためのカードコンポーネントです。
 * @author shisyamo4131
 */
import { vueProps } from '~/models/propsDefinition/EmploymentInsurance'

export default {
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
          <v-list-item-subtitle> 被保険者整理番号 </v-list-item-subtitle>
          <v-list-item-title>
            {{ policyNumber }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <slot name="actions" />
  </v-card>
</template>

<style></style>
