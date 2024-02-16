<script>
import ARenderlessCrud from '../atoms/renderless/ARenderlessCrud.vue'
import GCardInputForm from '../molecules/cards/GCardInputForm.vue'
import GTextFieldSearch from '../molecules/inputs/GTextFieldSearch.vue'
import GTemplateDefault from './GTemplateDefault.vue'
/**
 * ## GTemplateIndex
 * GTemplateDefaultを継承した、一覧画面用コンポーネントです。
 * props.modelで指定されたFireModelが保有するitemsプロパティがdata-tableスロットの
 * attrs.itemsプロパティで提供されます。
 * data-tableスロットにはGDataTableを継承したコンポーネントを配置してください。
 *
 * このコンポーネントは既定で検索用TextFieldを提供します。
 * 入力値はprops.searchに.sync修飾子を使用することで同期可能です。
 * ユーザーの入力完了を待つためのデバウンスを利用するためにはprops.lazySearchを
 * .sync修飾子と共に利用してください。
 * デバウンスのためのディレイは規定値で500ミリ秒です。props.delayで調整できます。
 * props.search、またはprops.lazySearchを利用してユーザーが求める検索値を取得し、
 * 親コンポーネント側で検索結果をmodelのitemsに格納する処理を行ってください。
 * FireModelを継承したmodelの場合、subscribe()、fetchDocs()が利用可能です。
 *
 * 当該コンポーネントは同時に、ダイアログを利用したmodelに対するCRUD機能も提供します。
 * inputスロットにmodelに対するINPUTコンポーネントを配置することで実現可能です。
 * ダイアログによるCRUDではなく、別のページに遷移しての編集が必要な場合は
 * registAtPage、editAtPageプロパティをtrueにします。
 * また、同時にprops.actionTypeをshow-detailに変更する必要があります。
 * -> GDataTableのactionsカラムに表示されるアイコンを変更します。
 *
 * registAtPage、editAtPageプロパティをtrueにした場合、既定では
 * ‐ 登録画面: $route.path + "/regist"
 * - 編集画面: $route.path + "/" + model.docId + "/edit"
 * に遷移します。
 * 遷移先のページを変更する場合はregistPage、editPageプロパティに遷移先のパスを
 * 指定します。
 *
 * ### PROPS
 *
 * | name         | type           | default       | required | description                            |
 * | ------------ | -------------- | ------------- | -------- | -------------------------------------- |
 * | actionType   | string         | 'show-detail' | false    |                                        |
 * | delay        | string, number | 500           | false    |                                        |
 * | dialogProps  | object         | undefined     | false    | Properties of v-dialog for input form. |
 * | editAtPage   | boolean        | false         | false    |                                        |
 * | editPage     | string         | edit          | false    |                                        |
 * | items        | array          | []            | false    | An array of items for data-table.      |
 * | lazySearch   | string, object | null          | false    |                                        |
 * | loading      | boolean        | false         | false    |                                        |
 * | model        | object         | -             | true     |                                        |
 * | registAtPage | boolean        | false         | false    |                                        |
 * | registPage   | string         | regist        | false    |                                        |
 * | search       | string, object | null          | false    |                                        |
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
 * NOTE: GDataTableがemitするイベントを受け取り、既定の処理を行います。
 *
 * #### input
 * registAtPageやeditAtPageがfalseである場合に、このコンポーネントは追加ボタン、
 * DataTableの編集、削除ボタンがクリックされた際にダイアログが起動されます。
 * そのダイアログに配置するINPUTコンポーネントを配置するためのスロットです。
 * ARenderlessCrudでラップされており、attrs、onスロットプロパティを提供します。
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
    actionType: {
      type: String,
      default: 'show-detail',
      validator: (v) => ['edit-delete', 'show-detail'].includes(v),
      required: false,
    },
    delay: { type: [String, Number], default: 500, required: false },
    dialogProps: { type: Object, default: undefined, required: false },
    editAtPage: { type: Boolean, default: false, required: false },
    editPage: { type: String, default: 'edit', required: false },
    items: { type: Array, default: () => [], required: false },
    lazySearch: { type: [String, Object], default: null, required: false },
    loading: { type: Boolean, default: false, required: false },
    model: { type: Object, required: true },
    registAtPage: { type: Boolean, default: false, required: false },
    registPage: { type: String, default: 'regist', required: false },
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
      if (this.registAtPage) {
        const path = this.$route.path + '/' + this.registPage
        this.$router.push(path)
      } else {
        this.dialog = true
      }
    },
    onClickEdit(event) {
      if (this.editAtPage) {
        const path = this.$route.path + '/' + event.docId + '/' + this.editPage
        this.$router.push(path)
      } else {
        this.editMode = 'UPDATE'
        this.model.initialize(event)
        this.dialog = true
      }
    },
    onClickDelete(event) {
      if (this.editAtPage) {
        const path = this.$route.path + '/' + event.docId + '/' + this.editPage
        this.$router.push(path)
      } else {
        this.editMode = 'DELETE'
        this.model.initialize(event)
        this.dialog = true
      }
    },
    onClickShowDetail(event) {
      const path = this.$route.path + '/' + event.docId
      this.$router.push(path)
    },
    onCompleted(event) {
      this.$emit('completed', event)
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
          <template #default="{ attrs, on, status, actions }">
            <g-card-input-form
              ref="form"
              v-bind="status"
              :label="props.label"
              v-on="actions"
            >
              <slot name="input" v-bind="{ attrs, on }" />
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
          :delay="delay"
          :lazy-value="lazySearch"
          :loading="loading"
          @update:lazyValue="$emit('update:lazySearch', $event)"
        />
        <slot name="append-search" />
      </v-toolbar>
      <div
        class="overflow-y-auto"
        :style="{ height: `${height - searchBarHeight}px` }"
      >
        <v-container fluid>
          <slot
            name="data-table"
            v-bind="{
              attrs: {
                actionType,
                height: height - searchBarHeight - 24,
                items,
                showActions: true,
              },
              on: {
                'click:edit': onClickEdit,
                'click:delete': onClickDelete,
                'click:detail': onClickShowDetail,
              },
            }"
          />
        </v-container>
      </div>
    </template>
  </g-template-default>
</template>

<style></style>
