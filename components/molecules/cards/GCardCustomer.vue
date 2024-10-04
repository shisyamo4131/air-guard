<script>
/**
 * ## GCardCustomer
 *
 * 取引先情報を表示・編集するためのCardコンポーネントです。
 *
 * #### 機能詳細
 * - データモデル定義をpropsで受け取ります。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import { vueProps } from '~/models/propsDefinition/Customer'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title"
      >{{ name1 }}
      <v-chip v-if="status === 'expired'" color="red" label x-small outlined>
        {{ `${$CUSTOMER_STATUS[status]}` }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ name2 }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="blue" label small outlined>
          {{ `${$DEADLINE[deadline]}締め` }}
        </v-chip>
        <v-chip color="green" label small outlined>
          {{ `${depositMonth}ヶ月後 ${$DEADLINE[depositDate]}回収` }}
        </v-chip>
        <v-chip color="red" label small outlined
          ><v-icon x-small left>mdi-phone</v-icon>
          {{ `${tel}` }}
        </v-chip>
        <v-chip v-if="fax" color="brown" label small outlined
          ><v-icon x-small left>mdi-fax</v-icon>
          {{ `${fax}` }}
        </v-chip>
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>

<style></style>
