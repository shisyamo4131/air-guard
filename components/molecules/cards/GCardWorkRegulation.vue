<script>
/**
 * 就業規則情報を表示・編集する Card コンポーネントです。
 * - props.docId を指定すると就業規則ドキュメントを読み込んで表示します。
 * - props.instance に就業規則インスタンスを渡すことでも表示が可能です。
 * - props.docId は props.instance よりも優先されます。
 * - props.docId が指定されている場合のみ編集が可能です。
 *   -> インスタンスが Minimal などであった場合に情報が欠落してしまう為
 * @author shisyamo4131
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputWorkRegulation from '../inputs/GInputWorkRegulation.vue'
import GCardColorIndicator from './GCardColorIndicator.vue'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import WorkRegulation from '~/models/WorkRegulation'
export default {
  /****************************************************************************
   * COMPONENTS
   ****************************************************************************/
  components: {
    GCheckbox,
    GBtnEditIcon,
    GDialogInput,
    GInputWorkRegulation,
    GCardColorIndicator,
  },

  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
    /**
     * 当該就業規則を編集不可能にします。
     */
    disableEdit: { type: Boolean, default: false, required: false },

    /**
     * 就業規則ドキュメントID
     * - 指定された ID に該当するドキュメントを Firestore から取得します。
     * - ID が指定された場合 props.instance は無視されます。
     */
    docId: { type: String, default: undefined, required: false },

    /**
     * 就業規則インスタンスを受け取ります。
     */
    instance: {
      type: Object,
      default: () => new WorkRegulation(),
      validator: (instance) => instance instanceof WorkRegulation,
      required: false,
    },
  },

  /****************************************************************************
   * DATA
   ****************************************************************************/
  data() {
    return {
      dayOfWeek: {
        mon: '月',
        tue: '火',
        wed: '水',
        thu: '木',
        fri: '金',
        sat: '土',
        sun: '日',
      },
      error: {
        message: null,
        snackbar: false,
      },
      editModel: new WorkRegulation(),
      loading: false,
      snackbar: true,
    }
  },

  /****************************************************************************
   * COMPUTED
   ****************************************************************************/
  computed: {
    items() {
      const {
        scheduledWorkHoursPerWeek,
        scheduledWorkHoursPerDay,
        legalHoliday,
        isHolidayWorkDay,
        averageMonthlyScheduledWorkDays,
        startTime,
        endTime,
        breakMinutes,
        overtimePayRate,
        holidayPayRate,
      } = this.editModel
      return [
        {
          label: '週所定労働時間',
          text: this.error.message
            ? '-'
            : `${scheduledWorkHoursPerWeek} 時間（1日 ${scheduledWorkHoursPerDay} 時間）`,
        },
        {
          label: '法定休日',
          text: this.error.message
            ? '-'
            : `${this.dayOfWeek[legalHoliday]}曜日`,
        },
        {
          label: '祝日の取り扱い',
          text: this.error.message
            ? '-'
            : `${isHolidayWorkDay ? '労働日' : '休日'}`,
        },
        {
          label: '月平均所定労働日数',
          text: this.error.message
            ? '-'
            : `${averageMonthlyScheduledWorkDays} 日/月`,
        },
        {
          label: '就業時間（休憩時間）',
          text: this.error.message
            ? '-'
            : `${startTime} - ${endTime}（${breakMinutes} 分）`,
        },
        {
          label: '割増賃金',
          text: this.error.message
            ? '-'
            : `時間外: ${overtimePayRate} % / 休日労働: ${holidayPayRate} %`,
        },
      ]
    },

    title() {
      if (this.error.message) return 'N/A'
      const { name, year } = this.editModel
      return `${name}（${year} 年）`
    },
  },

  /****************************************************************************
   * WATCH
   ****************************************************************************/
  watch: {
    /**
     * 指定された就業規則 ID のドキュメントの購読を開始します。
     */
    docId: {
      handler(v) {
        if (!v) return
        this.editModel.subscribe(v)
      },
      immediate: true,
    },

    /**
     * props.instance の内容で data.editModel を初期化します。
     * - props.docId が指定されている場合は無視されます。
     */
    instance: {
      handler(v) {
        if (this.docId) return
        this.editModel.initialize(v)
      },
      immediate: true,
    },
  },

  /****************************************************************************
   * METHODS
   ****************************************************************************/
  methods: {
    /**
     * エラー状態を初期化します。
     */
    initError() {
      this.error.message = null
      this.error.snackbar = false
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs">
    <v-toolbar dense flat>
      <v-toolbar-title class="text-subtitle-1">{{ title }}</v-toolbar-title>
      <v-spacer />
      <g-dialog-input edit-mode="UPDATE">
        <template #activator="{ attrs, on }">
          <g-btn-edit-icon
            v-if="!error.message && docId && !disableEdit"
            v-bind="attrs"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-work-regulation
            v-bind="attrs"
            :instance="editModel"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </v-toolbar>
    <v-card-text class="pt-0">
      <g-card-color-indicator
        class="mb-3"
        style="flex: 1"
        :item="{ label: '所定労働日', text: editModel.scheduledWorkDays }"
        :color-index="0"
        outlined
      >
        <template #default="{ item }">
          <div v-if="error.message">-</div>
          <div v-else class="d-flex flex-wrap" style="gap: 12px">
            <g-checkbox
              v-for="day of Object.entries(dayOfWeek).map(([key, value]) => ({
                key,
                value,
              }))"
              :key="day.key"
              class="mt-0"
              :label="day.value"
              :input-value="item.text.includes(day.key)"
              readonly
              hide-details
            />
          </div>
        </template>
      </g-card-color-indicator>
      <div class="d-flex flex-column flex-sm-row flex-wrap" style="gap: 12px">
        <g-card-color-indicator
          v-for="(item, index) of items"
          :key="index"
          style="flex: 1"
          min-width="204"
          outlined
          :color-index="index + 1"
          :item="item"
        />
      </div>
    </v-card-text>
    <v-snackbar v-model="error.snackbar" centered color="error">
      {{ error.message }}
    </v-snackbar>
  </v-card>
</template>

<style></style>
