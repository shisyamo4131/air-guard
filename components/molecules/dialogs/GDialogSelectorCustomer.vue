<script>
/**
 * 取引先選択用コンポーネント
 *
 * @author shisyamo4131
 * @refact 2025-02-12
 */
import AirDialogSelector from '~/components/air/AirDialogSelector.vue'
import Customer from '~/models/Customer'

const instance = new Customer()

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirDialogSelector },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * AirDialogSelector に引き渡すフェッチャーです。
     */
    fetcher: {
      type: Function,
      default: async (search, params) => {
        const includeExpired = params?.includeExpired
        return await instance.fetchDocs(
          search,
          includeExpired ? undefined : [['where', 'status', '==', 'active']]
        )
      },
    },

    // ダイアログのタイトルです。
    label: { type: String, default: '取引先選択', required: false },

    // ダイアログの最大幅です。
    maxWidth: { type: [String, Number], default: 600, required: false },

    // アイテムの表示順序を指定します。
    sortBy: {
      type: [String, Array],
      default: () => ['status', 'abbrKana'],
      required: false,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      includeExpired: false,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.includeExpired = false
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <air-dialog-selector
    v-bind="{ ...$attrs, ...$props }"
    v-model="dialog"
    :fetch-params="{ includeExpired }"
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <template #search-extension>
      <v-toolbar flat>
        <v-spacer />
        <v-switch
          v-model="includeExpired"
          hide-details
          label="取引終了を含める"
        />
      </v-toolbar>
    </template>
    <template #item="{ active, toggle, item }">
      <v-card
        :color="active ? 'accent lighten-5' : undefined"
        outlined
        @click="toggle"
      >
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
            <v-icon :color="active ? 'accent' : undefined"
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
