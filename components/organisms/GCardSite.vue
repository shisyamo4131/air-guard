<script>
/**
 * ### GSiteCard
 *
 * 現場情報を表示・編集するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - propsはモデルで定義されているものを使用しています。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 */
import { props } from '~/models/Site'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title text-truncate d-block"
      >{{ name }}
      <v-chip v-if="status === 'expired'" color="red" label x-small outlined>
        {{ `${$CUSTOMER_STATUS[status]}` }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ abbr }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="primary" label outlined
          ><v-icon left>mdi-domain</v-icon>{{ customer?.abbr || '' }}</v-chip
        >
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>

<style></style>
