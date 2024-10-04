<script>
/**
 * OperationResultsドキュメント入力コンポーネント
 *
 * @author shisyamo4131
 * @version 1.3.0
 * @updates
 * - version 1.3.0 - 2024-10-04 - Use `GCheckboxDeleteData` instead of `GCheckbox`.
 *                              - Use `GDialogEmployeeSelector` and `GDialogOutsourcerSelector`.
 * - version 1.2.0 - 2024-10-03 - `GInputOperationResultDetails` の仕様変更に対応。
 * - version 1.1.0 - 2024-09-18 - 現場選択コンポーネントに`return-object`を設定。
 *                                `site`に現場オブジェクトをセットするように変更。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GDialogEmployeeSelector from '../dialogs/GDialogEmployeeSelector.vue'
import GDialogOutsourcerSelector from '../dialogs/GDialogOutsourcerSelector.vue'
import GInputOperationResultDetails from './GInputOperationResultDetails.vue'
import OperationResult from '~/models/OperationResult'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import { getDayType, isValidDateFormat } from '~/utils/utility'
import Site from '~/models/Site'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GTextarea,
    GDate,
    GAutocompleteSite,
    GSelect,
    GInputOperationResultDetails,
    GCardInputForm,
    GDialogDatePicker,
    GDialogEmployeeSelector,
    GDialogOutsourcerSelector,
    GCheckboxDeleteData,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof OperationResult
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new OperationResult(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    isValidDate() {
      if (!this.editModel.date) return false
      return isValidDateFormat(this.editModel.date)
    },
    noContract() {
      // 必須のフィールドが設定されているかを確認
      const { site, date, workShift } = this.editModel
      if (!site?.docId || !date || !workShift) {
        return false // いずれかが未設定なら契約情報がないと見做さない
      }
      // loading中はfalseを返す
      if (this.loading) return false

      // siteContractが存在しない場合はtrueを返す
      return !this.editModel?.siteContract
    },
    selectableEmployees() {
      return this.$store.getters['employees/items'].filter((item) => {
        return !this.editModel.workers.some(
          ({ employeeId }) => employeeId === item.docId
        )
      })
    },
    selectableOutsourcers() {
      return this.$store.getters['outsourcers/items']
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントの状態をロード中に切り替えて、引数で受け取った処理を実行します。
     * - エラーが発生するとコンソールにエラーを出力します。
     * - エラーの有無にかかわらず、処理が終了するとコンポーネントの状態（ロード中）を初期化します。
     */
    async withLoading(fn) {
      this.loading = true
      try {
        await fn()
      } catch (err) {
        console.error('An error has occured:', err) // eslint-disable-line no-console
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    /**
     * `editModel.siteId` の値に該当する `Sites` データを `editModel.site` にセットします。
     * - `editModel.siteId` に有効な値が存在しない場合は `editModel.site` に null をセットして終了します。
     * - `editModel.siteId` と `editModel.site.docId` の値が一致する場合は何もしません。
     * - 該当する `Sites` データが存在しない場合はエラーをスローします。
     */
    async setSite() {
      const { siteId, site } = this.editModel
      if (!siteId) {
        this.editModel.site = null
        return
      }
      if (site && site.docId === siteId) return
      try {
        const siteInstance = new Site()
        const isSiteExist = await siteInstance.fetch(siteId)
        if (!isSiteExist) {
          const message = `Sites ドキュメントが存在しません。siteId: ${siteId}`
          console.error(message) // eslint-disable-line no-console
          throw new Error(message)
        }
      } catch (err) {
        const message = `setSite でエラーが発生しました。`
        console.error(message, err) // eslint-disable-line no-console
        throw err
      }
    },
    /**
     * `editModel.siteId` が変更された時の処理です。
     * @returns {void}
     */
    async onSiteChanged() {
      await this.withLoading(async () => {
        // `editModel.site` に `Sites` データをセット
        await this.setSite()

        // 締日をリフレッシュするメソッドを実行
        this.editModel.refreshClosingDate()

        // siteContractを更新
        await this.refreshSiteContract()
      })
    },
    /**
     * 日付が変更された時の処理です。
     * - 曜日区分を更新します。
     * - 締日を更新します。
     * - 稼働実績明細の勤務日を更新します。
     * - 取極めを更新します。
     * @returns {void}
     */
    async onDateChanged() {
      await this.withLoading(async () => {
        // 日付に合わせた曜日区分をセット
        this.editModel.dayDiv = getDayType(this.editModel.date)
        // 締日をリフレッシュするメソッドを実行
        this.editModel.refreshClosingDate()
        // `workers`、`outsourcers` の`date`を更新
        this.editModel.refreshDetailsDate()
        // siteContractを更新
        await this.refreshSiteContract()
      })
    },
    /**
     * 勤務区分が変更された時の処理です。
     * - 取極めを更新します。
     * @returns {void}
     */
    async onWorkShiftChanged() {
      await this.withLoading(async () => {
        // siteContractを更新
        await this.refreshSiteContract()
      })
    },
    /**
     * 従業員選択画面で選択された従業員の稼働実績明細を`editModel.workers`に追加します。
     */
    addWorker(items) {
      // 現場の契約情報が取得できていなければ何もせずに終了
      if (this.noContract) return

      // 選択された従業員が存在するかをチェック
      if (!items || !items.length) {
        // eslint-disable-next-line no-console
        console.warn('No employees selected.')
        return
      }

      try {
        // 選択された従業員のリストに対して処理を実行
        items.forEach((employee) => {
          const newWorker = new OperationResultWorker()
          newWorker.employeeId = employee.docId
          newWorker.date = this.editModel.date
          newWorker.startTime = this.editModel.siteContract.startTime
          newWorker.endTime = this.editModel.siteContract.endTime
          newWorker.breakMinutes = this.editModel.siteContract.breakMinutes
          this.editModel.addWorker(newWorker)
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error occurred while adding workers:', err)
        alert('An error occurred while adding workers. Please try again.')
      }
    },
    /**
     * 外注先選択画面で選択された外注先の稼働実績明細を`editModel.outsourcers`に追加します。
     */
    addOutsourcer(items) {
      // 現場の契約情報が取得できていなければ何もせずに終了
      if (this.noContract) return

      // 選択された外注先が存在するかをチェック
      if (!items || !items.length) {
        // eslint-disable-next-line no-console
        console.warn('No outsourcers selected.')
        return
      }

      try {
        // 選択された外注先のリストに対して処理を実行
        items.forEach((outsourcer) => {
          const newOutsourcer = new OperationResultOutsourcer()
          newOutsourcer.outsourcerId = outsourcer.docId
          newOutsourcer.date = this.editModel.date
          newOutsourcer.startTime = this.editModel.siteContract.startTime
          newOutsourcer.endTime = this.editModel.siteContract.endTime
          newOutsourcer.breakMinutes = this.editModel.siteContract.breakMinutes
          this.editModel.addOutsourcer(newOutsourcer)
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error occurred while adding outsourcers:', err)
        alert('An error occurred while adding outsourcers. Please try again.')
      }
    },
    /**
     * 引数で受け取った稼働実績明細を`editModel.workers`に反映させます。
     */
    changeWorker(item) {
      this.editModel.changeWorker(item)
    },
    /**
     * 引数で受け取った稼働実績明細を`editModel.workers`から削除します。
     */
    removeWorker(item) {
      this.editModel.removeWorker(item)
    },
    /**
     * 引数で受け取った稼働実績明細を`editModel.outsourcers`に反映させます。
     */
    changeOutsourcer(item) {
      this.editModel.changeOutsourcer(item)
    },
    /**
     * 引数で受け取った稼働実績明細を`editModel.outsourcers`から削除します。
     */
    removeOutsourcer(item) {
      this.editModel.removeOutsourcer(item)
    },
    /**
     * 当該OperationResultsドキュメントに適用すべきSiteContractを読み込み、
     * `editModel.siteContract`にセットします。
     * - 必要なパラメータが揃っていない場合は何も行いません。
     * - 適用すべきSiteContractが存在しない場合はnullがセットされます。
     */
    async refreshSiteContract() {
      try {
        await this.editModel.refreshContract()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[refreshSiteContract] Failed to load SiteContract:', err)
      }
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="稼働実績編集"
    :disable-submit="noContract"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <v-row>
        <v-col cols="12" sm="3">
          <g-text-field v-model="editModel.code" label="CODE" disabled />
          <g-autocomplete-site
            v-model="editModel.siteId"
            label="現場"
            required
            @change="onSiteChanged"
          />
          <g-dialog-date-picker
            v-model="editModel.date"
            @change="onDateChanged"
          >
            <template #activator="{ attrs, on }">
              <g-date v-bind="attrs" label="日付" required v-on="on" />
            </template>
          </g-dialog-date-picker>
          <g-select
            v-model="editModel.dayDiv"
            label="曜日区分"
            :items="['weekdays', 'saturday', 'sunday', 'holiday']"
            required
          />
          <g-select
            v-model="editModel.workShift"
            label="勤務区分"
            :items="['day', 'night']"
            required
            @change="onWorkShiftChanged"
          />
          <g-dialog-date-picker v-model="editModel.closingDate">
            <template #activator="{ attrs, on }">
              <g-date v-bind="attrs" label="締日" required v-on="on" />
            </template>
          </g-dialog-date-picker>
          <g-textarea v-model="editModel.remarks" label="備考" />
        </v-col>
        <v-col cols="12" sm="9">
          <v-input>
            <div class="d-flex flex-column flex-grow-1">
              <v-card outlined>
                <g-input-operation-result-details
                  :value="editModel.workers.concat(editModel.outsourcers)"
                  @changeWorker="changeWorker($event)"
                  @removeWorker="removeWorker($event)"
                  @changeOutsourcer="changeOutsourcer($event)"
                  @removeOutsourcer="removeOutsourcer($event)"
                />
              </v-card>
              <div class="text-right mt-2">
                <g-dialog-employee-selector
                  :items="selectableEmployees"
                  @click:submit="addWorker"
                >
                  <template #activator="{ attrs, on }">
                    <v-btn
                      v-bind="attrs"
                      :disabled="!isValidDate || noContract"
                      small
                      color="primary"
                      v-on="on"
                      >従業員を追加</v-btn
                    >
                  </template>
                </g-dialog-employee-selector>
                <g-dialog-outsourcer-selector
                  :items="selectableOutsourcers"
                  @click:submit="addOutsourcer"
                >
                  <template #activator="{ attrs, on }">
                    <v-btn
                      v-bind="attrs"
                      :disabled="!isValidDate || noContract"
                      small
                      color="secondary"
                      v-on="on"
                      >外注先を追加</v-btn
                    >
                  </template>
                </g-dialog-outsourcer-selector>
              </div>
            </div>
          </v-input>
        </v-col>
      </v-row>
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
    <v-snackbar :value="noContract" timeout="-1" tile color="red accent-2"
      >適用可能な取極めが登録されていません。</v-snackbar
    >
  </g-card-input-form>
</template>

<style></style>
