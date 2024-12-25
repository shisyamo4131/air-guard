<script>
/**
 * 就業規則情報の一覧ページです。
 * @author shisyamo4131
 */
import GInputWorkRegulation from '~/components/molecules/inputs/GInputWorkRegulation.vue'
import GDataTableWorkRegulations from '~/components/molecules/tables/GDataTableWorkRegulations.vue'
import WorkRegulation from '~/models/WorkRegulation'
import GDialogConfirm from '~/components/molecules/dialogs/GDialogConfirm.vue'
import GSnackbarError from '~/components/atoms/snackbars/GSnackbarError.vue'
import GDialogMessage from '~/components/molecules/dialogs/GDialogMessage.vue'
import GSelectYear from '~/components/atoms/inputs/GSelectYear.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'WorkRegulationsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputWorkRegulation,
    GDataTableWorkRegulations,
    GDialogConfirm,
    GSnackbarError,
    GDialogMessage,
    GSelectYear,
    GTemplateDocumentsIndex,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      error: {
        snackbar: false,
        message: null,
      },
      instance: new WorkRegulation(),
      items: [],
      loading: false,
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
    this.instance.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * `data.selectedYear`をクエリ条件として`data.instance`のsubscribeDocsを実行します。
     */
    subscribeDocs() {
      this.items = this.instance.subscribeDocs([
        ['where', 'year', '==', this.selectedYear],
      ])
    },

    /**
     * 翌年度の就業規則を一括作成します。
     */
    async createNextWorkRegulations() {
      this.$refs['error-snackbar'].initialize()
      this.loading = true
      try {
        this.selectedYear = await WorkRegulation.createNextYear(
          this.selectedYear
        )
        this.$refs['create-next-work-regulations-dialog'].close()
        this.$refs['create-next-work-regulations-complete'].open()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        this.error.message = err.message
        this.error.snackbar = true
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-documents-index
    label="就業規則管理"
    :items="items"
    :instance="instance"
  >
    <template #append-label>
      <v-spacer />
      <v-toolbar-items>
        <g-dialog-confirm
          ref="create-next-work-regulations-dialog"
          :loading="loading"
          @submit="createNextWorkRegulations"
        >
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" :disabled="!items.length" text v-on="on"
              >年度更新</v-btn
            >
          </template>
          現在表示されている就業規則の年度更新（翌年度作成処理）を行います。よろしいですか？
        </g-dialog-confirm>
        <g-dialog-message ref="create-next-work-regulations-complete">
          翌年度の就業規則を作成しました。月平均所定労働日数など、年度に合わせた更新処理を行ってください。
        </g-dialog-message>
      </v-toolbar-items>
    </template>
    <template #prepend-search="{ attrs, inputAttrs }">
      <g-select-year
        v-model="selectedYear"
        style="max-width: 120px"
        v-bind="{ ...attrs, ...inputAttrs }"
      />
    </template>
    <template #input="{ attrs, on }">
      <g-input-work-regulation v-bind="attrs" v-on="on" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-work-regulations
        v-bind="attrs"
        sort-by="code"
        sort-desc
        v-on="on"
      />
      <g-snackbar-error
        ref="error-snackbar"
        v-model="error.snackbar"
        :message.sync="error.message"
        top
      />
    </template>
  </g-template-documents-index>
</template>

<style></style>
