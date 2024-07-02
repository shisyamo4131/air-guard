<script>
/**
 * ### GCustomerSites
 *
 * `props.customerId`で指定された取引先の現場を一覧表示し、新たな現場を登録するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - 登録されている現場の検索機能を持っています。
 * - 検索用TextFieldが未入力の場合、最新の10件が表示されます。
 * - 検索用TextFieldが入力された場合、該当する現場を表示します。
 * - 新しい現場の登録が可能です。
 *
 * @props
 * @prop {String} customerId - 取引先のドキュメントIDです。
 * @prop {Number} delay - 検索用TextFieldのデバウンス処理の遅延時間です。
 * @prop {String} lazySearch - 検索用TextFieldのデバウンスされた入力値です。.sync修飾子で同期可能です。
 * @prop {String} search - 検索用TextFieldの入力値です。.sync修飾子で同期可能です。
 *
 * @events
 * @event click:row - DataTableの行がクリックされた時にemitされます。
 *
 * @slots
 * スロットはありません。
 *
 * @version 1.1.0
 * @create 2024-06-25
 * @author shisyamo4131
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-02
 *  - GDialogEditorの仕様変更に伴う改修。
 */
import { limit, orderBy, where } from 'firebase/firestore'
import GDataTable from '../atoms/tables/GDataTable.vue'
import GTextFieldSearch from '../molecules/inputs/GTextFieldSearch.vue'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GInputSite from '../molecules/inputs/GInputSite.vue'
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GDataTable,
    GBtnRegistIcon,
    GInputSite,
    GDialogEditor,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    customerId: { type: String, required: true },
    delay: { type: Number, default: 500, required: false },
    lazySearch: { type: String, default: undefined, required: false },
    search: { type: String, default: undefined, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      customer: this.$Customer(),
      internalLazySearch: null,
      internalSearch: null,
      items: [],
      loading: {
        customer: false,
        fetchDocs: false,
      },
      model: this.$Site(),
      page: 1,
      pageCount: 1,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    customerId: {
      async handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.loading.customer = true
        try {
          await this.customer.fetch(newVal)
        } catch (err) {
          // eslint-disable-next-line
          console.error(err)
          alert(err.message)
        } finally {
          this.loading.customer = false
        }
      },
      immediate: true,
    },
    internalLazySearch: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.$emit('update:lazySearch', newVal)
        this.fetchDocs()
      },
      immediate: true,
    },
    internalSearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:search', newVal)
    },
    search: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.internalSearch = newVal
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchDocs() {
      this.items.splice(0)
      if (!this.customerId) return
      this.loading.fetchDocs = true
      try {
        if (!this.internalLazySearch) {
          this.items = await this.model.fetchDocs(undefined, [
            where('customer.docId', '==', this.customerId),
            orderBy('code', 'desc'),
            limit(10),
          ])
        } else {
          this.items = await this.model.fetchDocs(this.internalLazySearch, [
            where('customer.docId', '==', this.customerId),
          ])
        }
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading.fetchDocs = false
      }
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" class="d-flex flex-column" v-on="$listeners">
    <v-card-title class="g-card__title flex-shrink-0">現場</v-card-title>
    <v-toolbar class="flex-grow-0" flat>
      <g-text-field-search
        v-model="internalSearch"
        :delay="delay"
        :lazy-value.sync="internalLazySearch"
      />
      <g-dialog-editor
        :default-item="{ customer }"
        model-id="Site"
        label="現場"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            :disabled="loading.customer || !customer.docId"
            :loading="loading.customer"
            v-bind="attrs"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor>
    </v-toolbar>
    <v-expand-transition>
      <div v-show="!internalSearch && !!items.length" class="py-0 px-4">
        <v-alert class="mb-0" dense type="info" text
          >最新の10件を表示しています。</v-alert
        >
      </div>
    </v-expand-transition>
    <v-container class="d-flex flex-grow-1 overflow-y-hidden">
      <g-data-table
        class="flex-table"
        :headers="[
          { text: 'CODE', value: 'code', width: 84 },
          { text: '現場名', value: 'name' },
        ]"
        :items="items"
        :loading="loading.fetchDocs"
        :mobile-breakpoint="0"
        :page.sync="page"
        sort-by="code"
        sort-desc
        @page-count="pageCount = $event"
        @click:row="$emit('click:row', $event)"
      >
        <template #[`item.name`]="{ item }">
          {{ item.name }}
          <v-chip v-if="item.status === 'expired'" x-small>終了</v-chip>
          <div class="text-caption grey--text text--darken-1">
            {{ item.address }}
          </div>
        </template>
      </g-data-table>
    </v-container>
    <v-container>
      <v-pagination v-model="page" :length="pageCount" />
    </v-container>
  </v-card>
</template>

<style></style>
