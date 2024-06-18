<script>
/**
 * ### GDialogSiteOperationScheduleBulkRegister
 *
 * このコンポーネントは、現場の稼働予定を一括登録するためのダイアログを提供します。
 * ユーザーは、以下の手順で操作を行います：
 * 1. 現場名の入力
 * 2. 入力された現場名に基づく候補の選択（未選択も可）
 * 3. 現場の住所の入力と取引先の選択（候補未選択の場合のみ）
 * 4. 稼働予定日と開始・終了時刻、人数、要資格者の設定
 * 5. 登録内容の確認と確定
 *
 * 機能の詳細：
 * - `props.selectableSites` に与えられた配列には、既存の現場オブジェクトが含まれています。
 * - 既存の現場オブジェクトを選択した場合、登録できる稼働予定は単一の日のみです。
 * - 既存の現場オブジェクトを選択しなかった場合、稼働予定日は複数日を選択可能で、入力された現場名・住所で新しい現場情報が登録されます。
 * - 既存の現場オブジェクトを選択しなかった場合、稼働予定情報はCloud Functionsによって登録されます。
 *
 * @component
 * @example
 * <GDialogSiteOperationScheduleBulkRegister
 *   v-model="dialog"
 *   :default-date="defaultDate"
 *   as-temporary
 *   :temporary-sites="selectableSites"
 * />
 *
 * @props {String} label - ダイアログのラベル
 * @props {Array} selectableSites - 現場の候補リスト
 * @props {Boolean} value - ダイアログの表示状態
 *
 * @author shisyamo4131
 * @create 2024-06-15
 */
import GComboboxDate from '../atoms/inputs/GComboboxDate.vue'
import GTextField from '../atoms/inputs/GTextField.vue'
import GAutocompleteCustomer from '../atoms/inputs/GAutocompleteCustomer.vue'
import GDataTable from '../atoms/tables/GDataTable.vue'
import GInputSiteOperationSchedule from '../molecules/inputs/GInputSiteOperationSchedule.vue'
import GSimpleTableSiteOperationSchedule from '../molecules/tables/GSimpleTableSiteOperationSchedule.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTextField,
    GComboboxDate,
    GAutocompleteCustomer,
    GDataTable,
    GInputSiteOperationSchedule,
    GSimpleTableSiteOperationSchedule,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    asTemporary: { type: Boolean, default: false, required: false },
    defaultDate: { type: String, default: undefined, required: false },
    label: { type: String, default: 'スポット現場稼働予定', required: false },
    selectableSites: { type: Array, default: () => [], required: false },
    value: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      loading: false,
      model: {
        inputSite: this.$Site(),
        selectedSite: this.$Site(),
        schedule: this.$SiteOperationSchedule(),
      },
      page: 1,
      pageCount: 1,
      selectedSite: [],
      step: 1,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    leftBtn() {
      switch (this.step) {
        case 1:
          return { icon: 'mdi-close' }
        case 2:
        case 3:
        case 4:
        case 5:
          return { icon: 'mdi-chevron-left' }
        default:
          return {}
      }
    },
    rightBtn() {
      switch (this.step) {
        case 1:
        case 2:
        case 3:
        case 4:
          return { icon: 'mdi-chevron-right' }
        case 5:
          return { icon: 'mdi-check' }
        default:
          return {}
      }
    },
    alertText() {
      return this.selectedSite.length
        ? '選択された現場の予定を登録します。'
        : `${this.filteredTemporarySites.length}件の現場候補が見つかりました。`
    },
    event() {
      return {
        name: this.selectedSite.length
          ? this.selectedSite[0].name
          : this.model.inputSite.name,
        start: this.model.schedule.date,
        color: this.model.schedule.workShift === 'day' ? 'blue' : 'red',
        site: this.selectedSite.length
          ? this.model.selectedSite
          : this.model.inputSite,
        schedule: this.model.schedule,
      }
    },
    filteredTemporarySites() {
      if (!this.model.inputSite.name) return []
      return this.selectableSites.filter((item) => {
        const search = this.model.inputSite.name
        const name = item.name
        const address = item.address
        return name.includes(search) || address.includes(search)
      })
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(newVal, oldVal) {
      if (newVal === oldVal) return
      this.$emit('input', newVal)
      if (newVal) {
        this.model.inputSite.temporary = this.asTemporary
        this.model.schedule.temporary = this.asTemporary
        if (this.defaultDate) {
          this.model.inputSite.defaultDates.push(this.defaultDate)
          this.model.schedule.date = this.defaultDate
        }
      } else {
        this.initialize()
      }
    },
    'model.inputSite.name'(v) {
      this.selectedSite.splice(0)
    },
    'selectedSite.length'(v) {
      if (v) this.model.selectedSite.initialize(this.selectedSite[0])
      if (!v) this.model.selectedSite.initialize()
    },
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      // モデルの初期化
      this.model.inputSite.initialize()
      this.model.schedule.initialize()

      // ステップとページのリセット
      this.step = 1
      this.page = 1

      // フォームのバリデーションリセット
      const formRefs = ['form-1', 'form-2', 'form-3', 'form-4']
      formRefs.forEach((ref) => {
        if (this.$refs[ref]) {
          this.$refs[ref].resetValidation()
        }
      })

      // 初期化完了のログ
      // eslint-disable-next-line
      console.log(
        'Initialization complete: step and page reset, validation reset for all forms.'
      )
    },
    onClickCancel() {
      switch (this.step) {
        case 1: // STEP1. Input site name or select the site.
          this.dialog = false
          break
        case 2: // STEP2. Input address and select customer.
        case 3: // STEP3. Input schedules as bulk.
          this.step--
          break
        case 4: // STEP4. Input schedules as single.
          this.step = 1
          break
        default: // Confirmation.
          if (!this.selectedSite.length) {
            this.step = 3
          } else {
            this.step = 4
          }
      }
    },
    async onClickSubmit() {
      const handleStepValidation = (step) => {
        const ref = this.$refs?.[`form-${step}`]
        const result = ref ? ref.validate() : true
        if (!result) alert('入力に不備があります。')
        return result
      }
      if (!handleStepValidation(this.step)) return
      switch (this.step) {
        case 1: // STEP1. Input site name or select the site.
          this.step = this.selectedSite.length ? 4 : 2
          break
        case 2: // STEP2. Input address and select customer.
          this.step++
          break
        case 3: // STEP3. Input schedules as bulk.
          this.step = 5
          break
        case 4: // STEP4. Input schedules as single.
          this.step++
          break
        default: // Confirmation.
          this.loading = true
          try {
            if (this.selectedSite.length) {
              this.model.schedule.siteId = this.selectedSite[0].docId
              await this.regist()
            } else {
              await this.bulkRegist()
            }
            this.dialog = false
          } catch (err) {
            // eslint-disable-next-line
            console.log(err)
            alert(err.message)
          } finally {
            this.loading = false
          }
      }
    },
    async bulkRegist() {
      this.model.inputSite.defaultSchedule = JSON.parse(
        JSON.stringify(this.model.schedule)
      )
      this.model.inputSite.remarks = this.model.schedule.remarks
      await this.model.inputSite.create()
    },
    async regist() {
      await this.model.schedule.create()
    },
  },
}
</script>

<template>
  <v-dialog v-bind="$attrs" v-model="dialog" v-on="$listeners">
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <v-card>
      <v-card-title>{{ `${label}[登録]` }} </v-card-title>
      <v-card-text class="pa-0">
        <v-window v-model="step">
          <v-window-item :value="1">
            <v-card-text style="height: 360px">
              <v-form ref="form-1">
                <g-text-field
                  v-model="model.inputSite.name"
                  label="現場名"
                  required
                />
              </v-form>
              <v-expand-transition>
                <div v-show="filteredTemporarySites.length">
                  <v-alert dense type="info" text>
                    {{ alertText }}
                  </v-alert>
                  <v-card outlined>
                    <g-data-table
                      v-model="selectedSite"
                      :headers="[{ text: '現場', value: 'name' }]"
                      hide-default-header
                      :items="filteredTemporarySites"
                      :items-per-page="3"
                      :mobile-breakpoint="0"
                      :page.sync="page"
                      show-select
                      single-select
                      @page-count="pageCount = $event"
                    >
                      <template #[`item.name`]="{ item }">
                        <div>{{ item.name }}</div>
                        <div class="text-caption grey--text text--darken-1">
                          {{ item.address }}
                        </div>
                      </template>
                    </g-data-table>
                    <v-divider />
                    <v-pagination v-model="page" :length="pageCount" />
                  </v-card>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-window-item>
          <v-window-item :value="2">
            <v-card-text>
              <v-form ref="form-2">
                <g-text-field
                  v-model="model.inputSite.address"
                  label="住所"
                  required
                />
                <g-autocomplete-customer
                  v-model="model.inputSite.customerId"
                  label="取引先"
                  required
                />
              </v-form>
            </v-card-text>
          </v-window-item>
          <!-- STEP3. Regist new site. -->
          <v-window-item :value="3">
            <v-card-text>
              <v-form ref="form-3">
                <g-combobox-date
                  v-model="model.inputSite.defaultDates"
                  label="稼働予定日"
                  required
                  multiple
                />
                <g-input-site-operation-schedule
                  v-bind.sync="model.schedule"
                  hide-date
                />
              </v-form>
            </v-card-text>
          </v-window-item>
          <!-- STEP4. The site already registed is selected. -->
          <v-window-item :value="4">
            <v-card-text>
              <v-form ref="form-4">
                <g-input-site-operation-schedule v-bind.sync="model.schedule" />
              </v-form>
            </v-card-text>
          </v-window-item>
          <v-window-item :value="5">
            <v-card-text>
              <v-alert
                dense
                text
                icon="mdi-help-circle-outline"
                color="primary"
              >
                以下の内容で登録します。よろしいですか？
              </v-alert>
              <g-simple-table-site-operation-schedule :event="event">
                <template #date>
                  <span v-if="selectedSite.length">
                    {{ model.schedule.date }}
                  </span>
                  <span v-else>
                    {{ model.inputSite.defaultDates }}
                  </span>
                </template>
              </g-simple-table-site-operation-schedule>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions class="justify-space-between">
        <v-fab-transition>
          <v-btn :key="leftBtn.icon" icon @click="onClickCancel">
            <v-icon>{{ leftBtn.icon }}</v-icon>
          </v-btn>
        </v-fab-transition>
        <v-fab-transition>
          <v-btn :key="rightBtn.icon" icon @click="onClickSubmit">
            <v-icon>{{ rightBtn.icon }}</v-icon>
          </v-btn>
        </v-fab-transition>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
