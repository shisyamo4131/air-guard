<script>
/**
 * 現場選択用コンポーネント
 *
 * @author shisyamo4131
 * @refact 2025-02-12
 */
import AirDialogSelector from '~/components/air/AirDialogSelector.vue'
import Site from '~/models/Site'

const instance = new Site()

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
    label: { type: String, default: '現場選択', required: false },

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
      selectedCustomerId: null,
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
  methods: {
    /**
     * 引数で受け取った配列から重複のない取引先オブジェクトを抽出して配列で返します。
     * - VChipGroup による取引先選択に使用する配列です。
     */
    customers(items) {
      const result = items.reduce((acc, item) => {
        if (!acc.some(({ docId }) => docId === item.customer.docId)) {
          acc.push(item.customer)
        }
        return acc
      }, [])
      return result.sort((a, b) => a.abbrKana.localeCompare(b.abbrKana))
    },

    /**
     * AirDialogSelector に引き渡すカスタムフィルターです。
     * - data.selectedCustomerId でフィルタリングを行います。
     */
    customFilter(items, search) {
      if (!this.selectedCustomerId) return items
      return items.filter(
        ({ customerId }) => customerId === this.selectedCustomerId
      )
    },

    /**
     * AirDialogSelector の再クエリが完了した時の処理です。
     * - data.selectedCustomerId を初期化します。
     */
    onSelectorReloaded() {
      this.selectedCustomerId = null
    },
  },
}
</script>

<template>
  <air-dialog-selector
    v-bind="{ ...$attrs, ...$props }"
    v-model="dialog"
    :custom-filter="customFilter"
    :fetch-params="{ includeExpired }"
    @reloaded="onSelectorReloaded"
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <template #search-extension="{ items }">
      <v-toolbar flat>
        <v-spacer />
        <v-switch
          v-model="includeExpired"
          hide-details
          label="稼働終了を含める"
        />
      </v-toolbar>
      <v-toolbar v-if="items.length > 0" flat>
        <v-chip-group
          v-model="selectedCustomerId"
          active-class="primary--text"
          center-active
          show-arrows
        >
          <v-chip
            v-for="(item, index) of customers(items)"
            :key="index"
            :value="item.docId"
            >{{ item.abbr }}</v-chip
          >
        </v-chip-group>
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
              {{ item.address }}
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
