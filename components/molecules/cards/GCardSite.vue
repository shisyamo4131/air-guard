<script>
import Site from '~/models/Site'
/**
 * ### GSiteCard
 *
 * 現場情報を表示・編集するためのCardコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator: (v) => v instanceof Site,
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title text-truncate d-block"
      >{{ instance.name }}
      <v-chip
        v-if="instance.status === 'expired'"
        color="red"
        label
        x-small
        outlined
      >
        {{ `${$SITE_STATUS[instance.status]}` }}
      </v-chip>
    </v-card-title>
    <v-card-subtitle>
      {{ instance.abbr }}
    </v-card-subtitle>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="primary" label outlined
          ><v-icon left>mdi-domain</v-icon
          >{{ instance.customer?.abbr || '' }}</v-chip
        >
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>

<style></style>
