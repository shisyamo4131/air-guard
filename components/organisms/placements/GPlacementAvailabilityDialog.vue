<template>
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.mobile"
    scrollable
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <v-card :tile="$vuetify.breakpoint.mobile">
      <v-toolbar color="secondary" dark dense flat>
        <v-toolbar-title>従業員シフト編集</v-toolbar-title>
        <v-spacer />
        <g-btn-cancel-icon @click="dialog = false" />
      </v-toolbar>
      <div class="pa-4">
        <v-alert class="ma-0 text-caption" type="info" dense text
          >アルバイトのシフトを編集します。既に配置されている場合、チェックボックスは操作できません。</v-alert
        >
      </div>
      <v-card-text class="d-flex flex-grow-1 py-0 px-0 px-md-4 pb-4 pb-sm-0">
        <v-simple-table fixed-header class="flex-table">
          <thead>
            <tr>
              <th style="position: sticky; left: 0; z-index: 3">従業員</th>
              <th
                v-for="column of columns"
                :key="column.date"
                :class="`th-${column.dayOfWeek}`"
                style="text-align: center"
              >
                <v-icon v-if="column.isHoliday" color="red"
                  >mdi-flag-variant</v-icon
                >
                {{ column.col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee of employees" :key="employee.docId">
              <td
                style="
                  position: sticky;
                  left: 0px;
                  z-index: 2;
                  min-width: 108px;
                  background-color: white;
                "
              >
                <div>{{ employee.code }}</div>
                <div>{{ employee.abbr }}</div>
              </td>
              <td
                v-for="column of columns"
                :key="column.date"
                style="text-align: center"
              >
                <div class="d-flex justify-center">
                  <v-simple-checkbox
                    :value="
                      (data?.[column.date]?.day || []).includes(employee.docId)
                    "
                    color="primary"
                    :disabled="isAssigned(column.date, employee.docId, 'day')"
                    @click="
                      submit({
                        date: column.date,
                        workShift: 'day',
                        employeeId: employee.docId,
                      })
                    "
                  />
                  <v-simple-checkbox
                    :value="
                      (data?.[column.date]?.night || []).includes(
                        employee.docId
                      )
                    "
                    color="error"
                    :disabled="isAssigned(column.date, employee.docId, 'night')"
                    @click="
                      submit({
                        date: column.date,
                        workShift: 'night',
                        employeeId: employee.docId,
                      })
                    "
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
export default {
  components: { GBtnCancelIcon },
  props: {
    columns: { type: Array, default: () => [], required: false },
    value: { type: Boolean, default: false, required: false },
  },

  data() {
    return {
      dialog: false,
    }
  },

  computed: {
    data() {
      return this.$store.state.assignments.availability || {}
    },
    employees() {
      return this.$store.getters['employees/active']
        .filter(({ contractType }) => contractType === 'part-time')
        .sort((a, b) => a.code.localeCompare(b.code))
    },
  },

  watch: {
    dialog(v) {
      this.$emit('input', v)
    },
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },

  methods: {
    /**
     * 指定された日付、勤務区分で指定された従業員が配置済みかどうかを返します。
     */
    isAssigned(date, employeeId, workShift) {
      const getter = this.$store.getters['assignments/isEmployeeAssigned']
      return getter(date, employeeId, workShift)
    },

    /**
     * 従業員のシフト情報を Realtime Database に更新します。
     */
    async submit({ date, workShift, employeeId }) {
      // 指定された日付と勤務区分の employeeIds を取得（初期値として空配列を使用）
      let employeeIds = this.data?.[date]?.[workShift] || []

      // employeeId が既に含まれているかを確認し、含まれていれば削除、なければ追加
      employeeIds = employeeIds.includes(employeeId)
        ? employeeIds.filter((id) => id !== employeeId)
        : [...employeeIds, employeeId]

      try {
        // Vuex のアクションを呼び出し
        await this.$store.dispatch('assignments/updateEmployeeAvailability', {
          date,
          workShift,
          employeeIds,
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('従業員の勤務可能状態の更新に失敗しました', error)
        alert('従業員の勤務可能状態の更新に失敗しました')
      }
    },
  },
}
</script>

<style></style>
