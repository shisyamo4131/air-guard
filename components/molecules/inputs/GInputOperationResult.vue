<script>
/**
 * OperationResultsドキュメント入力コンポーネント
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GInputOperationResultWorkers from './GInputOperationResultWorkers.vue'
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
import { isValidDateFormat } from '~/utils/utility'
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
      selectedEmployees: [],
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
    selectableEmployees() {
      return this.$store.state.employees.items.filter((item) => {
        return !this.instance.workers.some(
          ({ employeeId }) => employeeId === item.docId
        )
      })
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
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    addWorker() {
      try {
        this.selectedEmployees.forEach((employee) => {
          const newWorker = new OperationResultWorker()
          newWorker.employeeId = employee.docId
          newWorker.date = this.editModel.date
          this.editModel.addWorker(newWorker)
        })
        this.employeeSelector = false
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      }
    },
    changeWorker(item) {
      this.editModel.changeWorker(item)
    },
    removeWorker(item) {
      this.editModel.removeWorker(item)
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="稼働実績編集"
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
          />
          <g-select
            v-model="editModel.dayDiv"
            label="曜日区分"
            :items="['weekday', 'saturday', 'sunday', 'holiday']"
            required
          />
          <g-select
            v-model="editModel.workShift"
            label="勤務区分"
            :items="['day', 'night']"
            required
          />
          <g-date
            v-model="editModel.date"
            label="日付"
            :disabled="!!editModel.workers.length"
            required
          />
          <g-date v-model="editModel.deadline" label="締日" required />
          <g-textarea v-model="editModel.remarks" label="備考" />
        </v-col>
        <v-col cols="9">
          <v-input>
            <div class="d-flex flex-column flex-grow-1">
              <g-input-operation-result-workers
                :value="editModel.workers"
                @changeWorker="changeWorker($event)"
                @removeWorker="removeWorker($event)"
              />
              <v-dialog v-model="employeeSelector" max-width="240">
                <template #activator="{ attrs, on }">
                  <v-btn
                    v-bind="attrs"
                    :disabled="!isValidDate"
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
            </div>
          </v-input>
        </v-col>
      </v-row>
    </v-form>
  </g-card-input-form>
</template>

<style></style>
