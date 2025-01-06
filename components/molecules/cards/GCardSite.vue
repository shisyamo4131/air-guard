<script>
/**
 * 現場情報を表示するカードコンポーネントです。
 * @author shisyamo4131
 */
import GCardColorIndicator from '../../atoms/cards/GCardColorIndicator.vue'
import { vueProps } from '~/models/propsDefinition/Site'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardColorIndicator },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: vueProps,
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title>{{ abbr }}</v-card-title>
    <v-card-subtitle>{{ abbrKana }}</v-card-subtitle>
    <v-container fluid>
      <v-row dense>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator
            index="0"
            :item="customer"
            item-text="abbr"
            label="取引先"
            outlined
          />
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator
            index="1"
            label="住所"
            outlined
            :value="address"
          />
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <g-card-color-indicator
            index="2"
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
  </v-card>
</template>

<style></style>
