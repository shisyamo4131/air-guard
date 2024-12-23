<script>
/**
 * 健康保険資格情報を表示するためのカードコンポーネントです。
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: undefined, required: false },
    acquisitionDate: { type: String, default: undefined, required: false },
    standardMonthlyAmount: {
      type: Number,
      default: undefined,
      required: false,
    },
    policyNumber: { type: String, default: undefined, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    date() {
      if (!this.acquisitionDate) return null
      return this.$dayjs(this.acquisitionDate).format('YYYY年MM月DD日')
    },
    amount() {
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
            {{ date }}
          </v-list-item-title>
          <!-- 標準報酬月額は一旦不可視に -->
          <!--
          <v-list-item-subtitle> 標準報酬月額 </v-list-item-subtitle>
          <v-list-item-title class="pb-2">
            {{ amount }}
          </v-list-item-title>
          -->
          <v-list-item-subtitle> 被保険者整理番号 </v-list-item-subtitle>
          <v-list-item-title>
            {{ policyNumber }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style></style>
