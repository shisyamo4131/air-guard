<script>
/**
 * 取引先選択用コンポーネント
 *
 * @author shisyamo4131
 * @refact 2025-02-11
 */
import AirDialogSelector from '~/components/air/AirDialogSelector.vue'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirDialogSelector },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new Customer(),
    }
  },
}
</script>

<template>
  <air-dialog-selector
    v-bind="$attrs"
    max-width="600"
    label="取引先選択"
    :fetcher="async (search) => await instance.fetchDocs(search)"
    :sort-by="['status', 'abbrKana']"
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <template #item="{ active, toggle, item }">
      <v-card :color="active ? 'primary lighten-5' : undefined" @click="toggle">
        <v-list-item :value="item" two-line>
          <v-list-item-content>
            <v-list-item-title class="text-body-2">
              {{ item.abbr }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ item.address1 }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption">
              {{ item.status }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon :color="active ? 'primary' : undefined"
              >mdi-checkbox-{{
                `${active ? 'marked' : 'blank'}`
              }}-outline</v-icon
            >
          </v-list-item-action>
        </v-list-item>
      </v-card>
    </template>
  </air-dialog-selector>
</template>

<style></style>
