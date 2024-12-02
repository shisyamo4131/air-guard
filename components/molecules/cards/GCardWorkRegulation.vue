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
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import WorkRegulation from '~/models/WorkRegulation'
export default {
  /****************************************************************************
   * COMPONENTS
   ****************************************************************************/
  components: { GCheckbox, GBtnEditIcon, GDialogInput, GInputWorkRegulation },

  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
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

    /**
     * タイトルを非表示にします。
     */
    noTitle: { type: Boolean, default: false, required: false },
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
      internalInstance: new WorkRegulation(),
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
      } = this.internalInstance
      return [
        {
          title: '週所定労働時間',
          value: this.error.message
            ? '-'
            : `${scheduledWorkHoursPerWeek} 時間（1日 ${scheduledWorkHoursPerDay} 時間）`,
        },
        {
          title: '法定休日',
          value: this.error.message
            ? '-'
            : `${this.dayOfWeek[legalHoliday]}曜日`,
        },
        {
          title: '祝日の取り扱い',
          value: this.error.message
            ? '-'
            : `${isHolidayWorkDay ? '労働日' : '休日'}`,
        },
        {
          title: '月平均所定労働日数',
          value: this.error.message
            ? '-'
            : `${averageMonthlyScheduledWorkDays} 日/月`,
        },
        {
          title: '就業時間（休憩時間）',
          value: this.error.message
            ? '-'
            : `${startTime} - ${endTime}（${breakMinutes} 分）`,
        },
        {
          title: '割増賃金',
          value: this.error.message
            ? '-'
            : `時間外: ${overtimePayRate} % / 休日労働: ${holidayPayRate} %`,
        },
      ]
    },

    title() {
      if (this.error.message) return 'N/A'
      const { name, year } = this.internalInstance
      return `${name}（${year} 年）`
    },
  },

  /****************************************************************************
   * WATCH
   ****************************************************************************/
  watch: {
    /**
     * 指定された就業規則 ID のドキュメントを data.internalInstance に読み込みます。
     */
    docId: {
      handler() {
        this.fetch()
      },
      immediate: true,
    },

    /**
     * props.instance の内容で data.internalInstance を初期化します。
     * - props.docId が指定されている場合は無視されます。
     */
    instance: {
      handler(v) {
        if (this.docId) return
        this.internalInstance.initialize(v)
      },
      immediate: true,
    },
  },

  /****************************************************************************
   * METHODS
   ****************************************************************************/
  methods: {
    /**
     * props.docId に該当する就業規則ドキュメントを data.internalInstance に読み込みます。
     */
    async fetch() {
      if (!this.docId) return
      this.initError()
      this.loading = true
      try {
        const fetchResult = await this.internalInstance.fetch(this.docId)
        if (!fetchResult) {
          throw new Error('就業規則ドキュメントの読み込みに失敗しました。')
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        this.error.message = err.message
        this.error.snackbar = true
      } finally {
        this.loading = false
      }
    },

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
    <v-card-title v-if="!noTitle">
      <div class="d-flex align-center overflow-hidden">
        <div class="text-truncate">{{ title }}</div>
        <g-dialog-input>
          <template #activator="{ attrs, on }">
            <g-btn-edit-icon
              v-if="!error.message && docId"
              v-bind="attrs"
              small
              v-on="on"
            />
          </template>
          <template #default="{ attrs, on }">
            <g-input-work-regulation
              v-bind="attrs"
              :instance="internalInstance"
              edit-mode="UPDATE"
              v-on="on"
            />
          </template>
        </g-dialog-input>
      </div>
    </v-card-title>
    <v-card-text>
      <v-card class="mb-3" outlined>
        <v-card-text class="pa-2">
          <h4>■所定労働日</h4>
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
              :input-value="
                internalInstance.scheduledWorkDays.includes(day.key)
              "
              readonly
              hide-details
            />
          </div>
        </v-card-text>
      </v-card>
      <div class="d-flex flex-column flex-sm-row flex-wrap" style="gap: 12px">
        <v-card
          v-for="(item, index) of items"
          :key="index"
          style="flex: 1"
          min-width="204"
          outlined
        >
          <v-card-text class="pa-2">
            <h4>{{ `■ ${item.title}` }}</h4>
            <div>{{ item.value }}</div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
    <v-snackbar v-model="error.snackbar" centered color="error">
      {{ error.message }}
    </v-snackbar>
  </v-card>
</template>

<style></style>
