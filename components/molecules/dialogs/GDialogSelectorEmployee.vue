<script>
/**
 * 従業員選択用コンポーネント
 *
 * @author shisyamo4131
 * @refact 2025-02-12
 */
import AirDialogSelector from '~/components/air/AirDialogSelector.vue'
import GChipGroupKanaFilter from '~/components/atoms/chips/GChipGroupKanaFilter.vue'
import Employee from '~/models/Employee'

const instance = new Employee()

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirDialogSelector, GChipGroupKanaFilter },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 追加で適用するフィルターです。内部でカナフィルターによる検索を行っていますが、
     * さらに絞り込みが必要な場合に使用します。
     * (items, search) => []
     */
    customFilter: {
      type: Function,
      default: (items, search) => items,
      required: false,
    },

    /**
     * AirDialogSelector に引き渡すフェッチャーです。
     * params: { includeExpired }
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
    label: { type: String, default: '従業員選択', required: false },

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
      // ダイアログの開閉状態です。
      dialog: false,

      // 退職者を含めて検索するかどうかのフラグです。
      includeExpired: false,

      // カナフィルターの正規表現用変数です。
      regex: null,

      // 検索文字列です。
      search: null,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * ダイアログの開閉状態を監視します。
     * - ダイアログが終了したらコンポーネントを初期化します。
     */
    dialog(v) {
      if (v) return
      this.includeExpired = false
      this.$refs['kana-filter'].initialize()
      const scrollContainer = this.$refs?.['scroll-container'] || null
      if (scrollContainer) {
        this.$vuetify.goTo(this, { container: scrollContainer })
      }
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * AirDialogSelector に引き渡すカスタムフィルターです。
     * - カナフィルターでの正規表現による絞り込みを行います。
     */
    internalCustomFilter(items, search) {
      return this.customFilter(items, search).filter(
        ({ abbrKana, fullNameKana }) => {
          const regexMatch =
            this.search ||
            !this.regex ||
            this.regex.test(fullNameKana) ||
            this.regex.test(abbrKana)
          return regexMatch
        }
      )
    },
  },
}
</script>

<template>
  <air-dialog-selector
    v-bind="{ ...$attrs, ...$props }"
    v-model="dialog"
    :custom-filter="internalCustomFilter"
    :fetch-params="{ includeExpired }"
    @lazy-search="search = $event"
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
          label="退職者を含める"
        />
      </v-toolbar>
    </template>
    <template #items="{ items, multiple, selectedItem, select }">
      <div class="d-flex" style="height: 100%">
        <div v-if="!search" style="min-width: 48px; max-width: 48px">
          <g-chip-group-kana-filter
            ref="kana-filter"
            :chip-options="{ small: true, label: true }"
            column
            :disabled="!!search"
            :regex.sync="regex"
          />
        </div>
        <v-item-group
          ref="scroll-container"
          class="flex-grow-1 overflow-y-auto"
          :value="selectedItem"
          :multiple="multiple"
          @change="select"
        >
          <v-container>
            <v-row>
              <v-col
                v-for="(item, index) of items"
                :key="index"
                cols="12"
                sm="6"
              >
                <v-item :value="item">
                  <template #default="{ active, toggle }">
                    <v-card
                      :color="active ? 'accent lighten-4' : undefined"
                      outlined
                      @click="toggle"
                    >
                      <v-list-item :value="item" two-line>
                        <v-list-item-content>
                          <v-list-item-title class="text-body-2">
                            {{ `${item.abbr}(${item.fullName})` }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ item.fullNameKana }}
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
                </v-item>
              </v-col>
            </v-row>
          </v-container>
        </v-item-group>
      </div>
    </template>
  </air-dialog-selector>
</template>

<style></style>
