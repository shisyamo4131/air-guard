<script>
import ARenderlessCrud from '../atoms/renderless/ARenderlessCrud.vue'
import GCardInputForm from '../molecules/cards/GCardInputForm.vue'
import GTextFieldSearch from '../molecules/inputs/GTextFieldSearch.vue'
import GTemplateDefault from './GTemplateDefault.vue'
/**
 * ## GTemplateIndex
 * GTemplateDefaultを継承した、modelに対するCRUD機能を提供するテンプレート。
 * GDataTableまたはGDataTableを継承したコンポーネントをdata-tableスロットに
 * 配置することで容易にIndexページを作成することができます。
 * NOTE: modelはFireModelを継承している必要があります。
 *
 * ### PROPS
 *
 * | name        | type           | default   | required | description                            |
 * | ----------- | -------------- | --------- | -------- | -------------------------------------- |
 * | dialogProps | object         | undefined | false    | Properties of v-dialog for input form. |
 * | editOnPage  | boolean        | false     | false    |                                        |
 * | items       | array          | []        | false    | An array of items for data-table.      |
 * | lazySearch  | string, object | null      | false    |                                        |
 * | model       | object         | -         | true     |                                        |
 * | search      | string, object | null      | false    |                                        |
 *
 * editOnPageをtrueにすると、このコンポーネントは追加、変更、削除ボタンがクリックされた際に
 * click:regist、click:update、click:deleteイベントをemitします。
 * click:update、click:deleteイベントには対象のデータがオブジェクトとして含まれます。
 *
 * ### SLOTS
 *
 * #### append-search
 * 検索用INPUTコンポーネントの右側に別のコンポーネントを配置するためのスロットです。
 *
 * #### append-toolbar
 * GTemplateDefaultのappend-toolbarスロットを継承しつつ、modelを編集するためのUIを
 * 提供するダイアログを開くボタンが既定で配置されています。
 * このボタンはbtn-registスロットを利用することで置換することが可能です。
 *
 * #### btn-regist
 * modelを編集するためのUIを提供するダイアログを開くボタンを置換するためのスロットです。
 * v-dialogのactivatorスロットと同じスロットプロパティが提供されます。
 *
 * #### data-table
 * GDataTableコンポーネントを配置するためのスロットです。
 * attrsおよびonスロットプロパティを配置するGDataTableコンポーネントに指定してください。
 * NOTE: GDataTableはshow-actionsプロパティをtrueにすることで行ごとの
 * 変更ボタンおよび削除ボタンが表示され、それぞれクリックされるとclick:edit、
 * click:deleteイベントをemitします。
 *
 * #### prepend-search
 * 検索用INPUTコンポーネントの左側に別のコンポーネントを配置するためのスロットです。
 *
 * #### prepend-toolbar
 * GTemplateDefaultのprepend-toolbarスロットがそのまま提供されます。
 * v-toolbarのlabelの左側にコンポーネントを配置することができます。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    ARenderlessCrud,
    GCardInputForm,
    GTextFieldSearch,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    dialogProps: { type: Object, default: undefined, required: false },
    editOnPage: { type: Boolean, default: false, required: false },
    items: { type: Array, default: () => [], required: false },
    lazySearch: { type: [String, Object], default: null, required: false },
    model: { type: Object, required: true },
    search: { type: [String, Object], default: null, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      internalSearch: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    searchBarHeight() {
      if (this.$vuetify.breakpoint.smAndDown) return 56
      return 64
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v) return
      this.editMode = 'REGIST'
      this.$refs.form.initialize()
      this.model.initialize()
    },
    search: {
      handler(v) {
        this.internalSearch = v
      },
      immediate: true,
    },
    internalSearch(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('update:search', newVal)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRegist() {
      if (this.editOnPage) {
        this.$emit('click:regist')
      } else {
        this.dialog = true
      }
    },
    onClickEdit(event) {
      if (this.editOnPage) {
        this.$emit('click:edit', event)
      } else {
        this.editMode = 'UPDATE'
        this.model.initialize(event)
        this.dialog = true
      }
    },
    onClickDelete(event) {
      if (this.editOnPage) {
        this.$emit('click:delete', event)
      } else {
        this.editMode = 'DELETE'
        this.model.initialize(event)
        this.dialog = true
      }
    },
    onCompleted() {
      const editMode = this.editMode
      this.$emit('completed', editMode)
      this.dialog = false
    },
  },
}
</script>

<template>
  <g-template-default v-bind="$attrs">
    <template #prepend-toolbar="props">
      <slot name="prepend-toolbar" v-bind="props" />
    </template>
    <template #append-toolbar="props">
      <slot name="append-toolbar" v-bind="props" />
      <slot name="btn-regist">
        <v-btn icon @click.stop="onClickRegist">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </slot>
      <v-dialog v-model="dialog" v-bind="dialogProps">
        <a-renderless-crud
          :edit-mode="editMode"
          :model="model"
          @cancel="dialog = false"
          @submit:complete="onCompleted"
        >
          <template #default="{ attrs, on }">
            <g-card-input-form
              ref="form"
              v-bind="attrs"
              :label="props.label"
              v-on="on"
            >
              <slot name="input" v-bind="{ editMode }" />
            </g-card-input-form>
          </template>
        </a-renderless-crud>
      </v-dialog>
    </template>
    <template #default="{ height }">
      <!-- search-bar -->
      <v-toolbar flat>
        <slot name="prepend-search" />
        <g-text-field-search
          v-model="internalSearch"
          :lazy-value="lazySearch"
          @update:lazyValue="$emit('update:lazySearch', $event)"
        />
        <slot name="append-search" />
      </v-toolbar>
      <div
        class="overflow-y-auto"
        :style="{ height: height - searchBarHeight }"
      >
        <v-container fluid>
          <slot
            name="data-table"
            v-bind="{
              attrs: {
                height: height - searchBarHeight - 24,
                items,
                showActions: true,
              },
              on: {
                'click:edit': onClickEdit,
                'click:delete': onClickDelete,
              },
            }"
          />
        </v-container>
      </div>
    </template>
  </g-template-default>
</template>

<style></style>
