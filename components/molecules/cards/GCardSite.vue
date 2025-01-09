<script>
/**
 * 現場情報を表示するカードコンポーネントです。
 * @author shisyamo4131
 */
import GCardColorIndicator from '../../atoms/cards/GCardColorIndicator.vue'
import { vueProps } from '~/models/propsDefinition/Site'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardColorIndicator, GBtnEdit },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,

  computed: {
    period() {
      return `${this.startDate || ''} - ${this.endDate || ''}`
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title>
      <span>{{ abbr }}</span>
      <span v-if="abbrNumber" class="ml-2">【{{ abbrNumber }}】</span>
    </v-card-title>
    <v-card-subtitle>{{ abbrKana }}</v-card-subtitle>
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <g-card-color-indicator label="現場名" outlined :value="name" />
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator
            :item="customer"
            item-text="abbr"
            label="取引先"
            outlined
          />
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator label="住所" outlined :value="address" />
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator label="期間" outlined :value="period" />
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator
            label="警備種別"
            outlined
            :value="$SECURITY_TYPE[securityType]"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-card-text v-if="remarks">
      {{ remarks }}
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-spacer />
      <g-btn-edit color="primary" small @click="$emit('click:edit')" />
    </v-card-actions>
  </v-card>
</template>

<style></style>
