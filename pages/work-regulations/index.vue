<script>
/**
 * ## pages.WorkRegulationsIndex
 *
 * 就業規則情報の一覧ページです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-13 - 初版作成
 */
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputWorkRegulation from '~/components/molecules/inputs/GInputWorkRegulation.vue'
import GDataTableWorkRegulations from '~/components/molecules/tables/GDataTableWorkRegulations.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import WorkRegulation from '~/models/WorkRegulation'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'WorkRegulationsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputWorkRegulation,
    GDataTableWorkRegulations,
    GTemplateIndex,
    GDialogInput,
    GSelect,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      instance: new WorkRegulation(),
      items: [],
      listener: new WorkRegulation(),
      selectedYear: `${new Date().getFullYear()}`,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 過去3年から未来3年までの年を返します。
     */
    yearList() {
      const currentYear = new Date().getFullYear()
      const years = Array.from({ length: 7 }, (_, index) => {
        const year = currentYear - 3 + index // 過去3年から未来3年まで
        return {
          text: `${year}年`, // 表示用のテキスト
          value: String(year), // 値は文字列
        }
      })

      return years
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * `data.dialog`を監視します。
     * - `data.instance`、`data.editMode`を初期化します。
     */
    dialog(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
    },
    /**
     * `data.selectedYear`を監視します。
     * - `subscribeDocs()`を実行します。
     * - 初回起動時にも実行させるため、immediateを指定しています。
     */
    selectedYear: {
      handler() {
        this.subscribeDocs()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * DataTableの行がクリックされた時の処理です。
     * - 詳細ページを開きます。
     */
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/workRegulations/${item.docId}`)
      this.instance.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
    },
    /**
     * `data.selectedYear`をクエリ条件として`data.listener`のsubscribeDocsを実行します。
     */
    subscribeDocs() {
      this.items = this.listener.subscribeDocs([
        ['where', 'year', '==', this.selectedYear],
      ])
    },
  },
}
</script>

<template>
  <g-template-index :items="items">
    <template #prepend-search>
      <g-select
        v-model="selectedYear"
        style="max-width: 120px"
        :outlined="false"
        hide-details
        :items="yearList"
        solo-inverted
        flat
      />
    </template>
    <template #append-search>
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-work-regulation
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-work-regulations
        v-bind="attrs"
        :search="search"
        sort-by="code"
        sort-desc
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
