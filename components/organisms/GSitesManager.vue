<script>
/**
 * ## GSitesManager
 *
 * 現場のCRUD機能を提供するコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-25 - 初版作成
 */
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
import GInputSite from '../molecules/inputs/GInputSite.vue'
import GTextFieldSearch from '../molecules/inputs/GTextFieldSearch.vue'
import GDataTableSites from '../molecules/tables/GDataTableSites.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableSites,
    GDialogEditor,
    GBtnRegistIcon,
    GInputSite,
    GTextFieldSearch,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 従属先の取引先のドキュメントidです。
     */
    customerId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      search: null,
      page: 1,
      pageCount: 1,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * DataTableに提供される配列です。`props.customerId`で指定された取引先の
     * 現場（Sites）ドキュメントが格納されます。
     */
    items() {
      return this.$store.state.getters['sites/items'].filter((item) => {
        return item.customerId === this.customerId
      })
    },
    /**
     * GDialogEditorに引き渡す属性です。
     */
    editorAttrs() {
      return {
        ref: 'editor',
        defaultItem: { customerId: this.customerId },
        label: '現場',
        maxWidth: '480',
        modelId: 'Site',
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 編集ボタンがクリックされた時の処理です。
     * - `editor`を`UPDATE`モードで開きます。
     */
    onClickEdit(item) {
      this.$refs.editor.open({ item, editMode: 'UPDATE' })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" class="d-flex flex-column" v-on="$listeners">
    <v-card-title class="g-card__title justify-space-between flex-grow-0">
      <div>現場</div>
      <g-dialog-editor v-bind="editorAttrs">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site v-bind="attrs" hide-customer v-on="on" />
        </template>
      </g-dialog-editor>
    </v-card-title>
    <v-toolbar class="flex-grow-0" dense flat>
      <g-text-field-search v-model="search" />
    </v-toolbar>
    <v-container class="d-flex flex-grow-1 overflow-y-hidden">
      <g-data-table-sites
        class="flex-table"
        :actions="['edit']"
        :items="items"
        :page="page"
        :search="search"
        @click:edit="onClickEdit"
        @update:page="page = $event"
        @page-count="pageCount = $event"
      />
    </v-container>
    <v-container class="flex-grow-0">
      <v-pagination v-model="page" :length="pageCount" total-visible="10" />
    </v-container>
  </v-card>
</template>

<style></style>
