<script>
/**
 * ### GCardSites
 *
 * 現場情報を一覧表示するカードコンポーネントです。
 *
 * #### 機能詳細
 * - `props.items`で受け取った配列を一覧表示します。
 * - 登録ボタンをクリックすると`click:regist`イベントがemitされます。
 * - DataTableの行をクリックすると`click:row`イベントがemitされます。
 * - `props.showLast`がtrueになるとアラートが表示されます。
 * - 検索用TextFieldに入力された値はupdateイベントで受け取ることができます。
 *
 * #### 注意事項
 * 1. `props.showLast`は「最新の10件を表示していること」を通知するためのものです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * #### 更新履歴
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
import GDataTable from '../../atoms/tables/GDataTable.vue'
import GTextFieldSearch from '../inputs/GTextFieldSearch.vue'
import GBtnRegistIcon from '../../atoms/btns/GBtnRegistIcon.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextFieldSearch,
    GDataTable,
    GBtnRegistIcon,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    delay: { type: Number, default: 500, required: false },
    items: { type: Array, default: () => [], required: false },
    lazySearch: { type: String, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
    search: { type: String, default: undefined, required: false },

    showLast: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      page: 1,
      pageCount: 1,
    }
  },
}
</script>

<template>
  <v-card v-bind="$attrs" class="d-flex flex-column" v-on="$listeners">
    <v-card-title class="g-card__title flex-shrink-0">現場</v-card-title>
    <v-toolbar class="flex-grow-0" flat>
      <g-text-field-search
        :value="search"
        :delay="delay"
        :lazy-value="lazySearch"
        @input="$emit('update:search', $event)"
        @update:lazyValue="$emit('update:lazySearch', $event)"
      />
      <g-btn-regist-icon color="primary" @click="$emit('click:regist')" />
    </v-toolbar>
    <v-expand-transition>
      <div v-show="showLast && items.length" class="py-0 px-4">
        <v-alert class="mb-0" dense type="info" text
          >最新の10件を表示しています。</v-alert
        >
      </div>
      <slot name="alert" />
    </v-expand-transition>
    <v-container class="d-flex flex-grow-1 overflow-y-hidden">
      <g-data-table
        class="flex-table"
        :headers="[
          { text: 'CODE', value: 'code', width: 84 },
          { text: '現場名', value: 'name' },
        ]"
        :items="items"
        :loading="loading"
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
