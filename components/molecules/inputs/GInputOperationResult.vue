<script>
/**
 * OperationResultsドキュメント入力コンポーネント
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-09-18 - 現場選択コンポーネントに`return-object`を設定。
 *                                `site`に現場オブジェクトをセットするように変更。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GDialogDatePicker from '../dialogs/GDialogDatePicker.vue'
import GInputOperationResultWorkers from './GInputOperationResultWorkers.vue'
import GInputOperationResultOutsourcers from './GInputOperationResultOutsourcers.vue'
import OperationResult from '~/models/OperationResult'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import { getDayType, isValidDateFormat } from '~/utils/utility'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import Site from '~/models/Site'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
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
    GInputOperationResultWorkers,
    GDataTable,
    GBtnCancelIcon,
    GBtnSubmitIcon,
    GCardInputForm,
    GDialogDatePicker,
    GCheckbox,
    GInputOperationResultOutsourcers,
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
      employeeSelector: false,
      outsourcerSelector: false,
      selectedEmployees: [],
      selectedOutsourcers: [],
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
  watch: {
    employeeSelector(v) {
      if (v) return
      this.selectedEmployees.splice(0)
    },
    outsourcerSelector(v) {
      if (v) return
      this.selectedOutsourcers.splice(0)
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * `editModel.siteId` が変更された時の処理です。
     * - `editModel.siteId` に値がセットされていない場合、`editModel.site` を null にして終了します。
     * - `editModel.siteId` に値がセットされていた場合、`Sites` ドキュメントを読み込んで `editModel.site` にセットします。
     * - 該当する `Sites` ドキュメントが存在しない場合はエラーを出力します。
     * - 該当する `Sites` ドキュメントが存在した場合は `editModel.closingDate`、`editModel.siteContract` を更新します。
     * @returns {void}
     */
    async onSiteChanged() {
      // `editModel.siteId` に値がセットされていない場合は `editModel.site` を null にして終了
      if (!this.editModel.siteId) {
        this.editModel.site = null
        return
      }
      this.loading = true // ローディング状態を開始
      try {
        // `Sites` ドキュメントを読み込む
        const siteInstance = new Site()
        const isSiteExist = await siteInstance.fetch(this.editModel.siteId)

        // `Sites` ドキュメントが存在しない場合はエラー
        if (!isSiteExist) {
          const message = 'Sites ドキュメントが取得できませんでした。'
          // eslint-disable-next-line no-console
          console.error(message, { siteId: this.editModel.siteId })
          alert(message)
          return
        }

        // `editModel.site` に `Sites` ドキュメントをセット
        this.editModel.site = siteInstance

        // 締日をリフレッシュするメソッドを実行
        this.editModel.refreshClosingDate()

        // siteContractを更新
        await this.refreshSiteContract()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('An error has occured:', err)
      } finally {
        this.loading = false
      }
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
      this.loading = true // ローディング状態を開始
      try {
        // 日付に合わせた曜日区分をセット
        this.editModel.dayDiv = getDayType(this.editModel.date)
        // 締日をリフレッシュするメソッドを実行
        this.editModel.refreshClosingDate()
        // `workers`、`outsourcers` の`date`を更新
        this.editModel.refreshDetailsDate()
        // siteContractを更新
        await this.refreshSiteContract()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('An error has occured:', err)
      } finally {
        // 処理が完了したらローディング状態を終了
        this.loading = false
      }
    },
    /**
     * 勤務区分が変更された時の処理です。
     * - 取極めを更新します。
     * @returns {void}
     */
    async onWorkShiftChanged() {
      this.loading = true // ローディング状態を開始
      try {
        // siteContractを更新
        await this.refreshSiteContract()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('An error has occured:', err)
      } finally {
        // 処理が完了したらローディング状態を終了
        this.loading = false
      }
    },
    /**
     * 従業員選択画面で選択された従業員の稼働実績明細を`editModel.workers`に追加します。
     */
    addWorker() {
      // 現場の契約情報が取得できていなければ何もせずに終了
      if (this.noContract) return

      // 選択された従業員が存在するかをチェック
      if (!this.selectedEmployees || !this.selectedEmployees.length) {
        // eslint-disable-next-line no-console
        console.warn('No employees selected.')
        return
      }

      try {
        // 選択された従業員のリストに対して処理を実行
        this.selectedEmployees.forEach((employee) => {
          const newWorker = new OperationResultWorker()
          newWorker.employeeId = employee.docId
          newWorker.date = this.editModel.date
          newWorker.startTime = this.editModel.siteContract.startTime
          newWorker.endTime = this.editModel.siteContract.endTime
          newWorker.breakMinutes = this.editModel.siteContract.breakMinutes
          this.editModel.addWorker(newWorker)
        })

        // 従業員選択ダイアログを閉じる
        this.employeeSelector = false
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error occurred while adding workers:', err)
        alert('An error occurred while adding workers. Please try again.')
      }
    },
    /**
     * 外注先選択画面で選択された外注先の稼働実績明細を`editModel.outsourcers`に追加します。
     */
    addOutsourcer() {
      // 現場の契約情報が取得できていなければ何もせずに終了
      if (this.noContract) return

      // 選択された従業員が存在するかをチェック
      if (!this.selectedOutsourcers || !this.selectedOutsourcers.length) {
        // eslint-disable-next-line no-console
        console.warn('No outsourcers selected.')
        return
      }

      try {
        // 選択された従業員のリストに対して処理を実行
        this.selectedOutsourcers.forEach((outsourcer) => {
          const newOutsourcer = new OperationResultOutsourcer()
          newOutsourcer.outsourcerId = outsourcer.docId
          newOutsourcer.date = this.editModel.date
          newOutsourcer.startTime = this.editModel.siteContract.startTime
          newOutsourcer.endTime = this.editModel.siteContract.endTime
          newOutsourcer.breakMinutes = this.editModel.siteContract.breakMinutes
          this.editModel.addOutsourcer(newOutsourcer)
        })

        // 従業員選択ダイアログを閉じる
        this.outsourcerSelector = false
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error occurred while adding workers:', err)
        alert('An error occurred while adding workers. Please try again.')
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
        <v-col cols="3">
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
        <v-col cols="9">
          <v-input>
            <div class="d-flex flex-column flex-grow-1">
              <v-dialog v-model="employeeSelector" max-width="240">
                <template #activator="{ attrs, on }">
                  <v-btn
                    v-bind="attrs"
                    class="mb-2"
                    :disabled="!isValidDate || noContract"
                    small
                    color="primary"
                    v-on="on"
                    >従業員を追加</v-btn
                  >
                </template>
                <v-card>
                  <g-data-table
                    v-model="selectedEmployees"
                    :headers="[{ text: '従業員名', value: 'abbr' }]"
                    :items="selectableEmployees"
                    show-select
                    checkbox-color="primary"
                  />
                  <v-card-actions class="justify-space-between">
                    <g-btn-cancel-icon @click="employeeSelector = false" />
                    <g-btn-submit-icon
                      color="primary"
                      :disabled="!selectedEmployees.length"
                      @click="addWorker"
                    />
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-card outlined>
                <g-input-operation-result-workers
                  :value="editModel.workers"
                  @changeWorker="changeWorker($event)"
                  @removeWorker="removeWorker($event)"
                />
              </v-card>
            </div>
          </v-input>
          <v-input>
            <div class="d-flex flex-column flex-grow-1">
              <v-dialog v-model="outsourcerSelector" max-width="240">
                <template #activator="{ attrs, on }">
                  <v-btn
                    v-bind="attrs"
                    class="mb-2"
                    :disabled="!isValidDate || noContract"
                    small
                    color="primary"
                    v-on="on"
                    >外注先を追加</v-btn
                  >
                </template>
                <v-card>
                  <g-data-table
                    v-model="selectedOutsourcers"
                    :headers="[{ text: '外注先名', value: 'abbr' }]"
                    :items="selectableOutsourcers"
                    show-select
                    checkbox-color="primary"
                  />
                  <v-card-actions class="justify-space-between">
                    <g-btn-cancel-icon @click="outsourcerSelector = false" />
                    <g-btn-submit-icon
                      color="primary"
                      :disabled="!selectableOutsourcers.length"
                      @click="addOutsourcer"
                    />
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-card outlined>
                <g-input-operation-result-outsourcers
                  :value="editModel.outsourcers"
                  @changeOutsourcer="changeOutsourcer($event)"
                  @removeOutsourcer="removeOutsourcer($event)"
                />
              </v-card>
            </div>
          </v-input>
        </v-col>
      </v-row>
    </v-form>
    <g-checkbox
      v-if="editMode !== CREATE"
      v-model="forceDelete"
      label="このデータを削除する"
    />
    <v-snackbar :value="noContract" timeout="-1" tile color="red accent-2"
      >適用可能な取極めが登録されていません。</v-snackbar
    >
  </g-card-input-form>
</template>

<style></style>
