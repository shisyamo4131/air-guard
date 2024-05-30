<template>
  <g-card-input-form
    ref="form"
    label="休暇申請"
    :loading="loading"
    edit-mode="REGIST"
    @click:cancel="$emit('click:cancel')"
    @click:submit="submit"
  >
    <template #default>
      <v-row>
        <v-col cols="6">
          <g-date v-model="editItem.requestDate" label="申請日" required />
          <g-select
            v-model="editItem.type"
            label="申請区分"
            :items="$LEAVE_APPLICATION_TYPE_ARRAY"
            required
          />
          <g-select
            v-model="editItem.employeeId"
            label="申請者"
            :items="employees"
            item-text="abbr"
            item-value="docId"
            required
          />
          <g-textarea v-model="editItem.reason" label="申請事由" required />
        </v-col>
        <v-col cols="6">
          <g-date-picker v-model="selectedDates" full-width multiple no-title />
          <v-alert dense text type="info"> 複数の日を選択できます。 </v-alert>
        </v-col>
      </v-row>
    </template>
  </g-card-input-form>
</template>

<script>
import GDate from '../atoms/inputs/GDate.vue'
import GSelect from '../atoms/inputs/GSelect.vue'
import GTextarea from '../atoms/inputs/GTextarea.vue'
import GDatePicker from '../atoms/pickers/GDatePicker.vue'
import GCardInputForm from '../molecules/cards/GCardInputForm.vue'
export default {
  components: { GCardInputForm, GDatePicker, GDate, GSelect, GTextarea },
  props: {
    employees: { type: Array, default: () => [], required: false },
  },
  data() {
    return {
      editItem: this.$LeaveApplication(),
      loading: false,
      selectedDates: [],
    }
  },
  methods: {
    initialize() {
      this.$refs.form.initialize()
      this.editItem.initialize()
      this.selectedDates = []
    },
    async submit() {
      if (!this.selectedDates.length) {
        alert('対象日を選択してください。')
        return
      }
      try {
        this.loading = true
        const promises = []
        this.selectedDates.forEach((date) => {
          const model = this.$LeaveApplication({ ...this.editItem, date })
          promises.push(model.create())
        })
        await Promise.all(promises)
        this.$emit('submitted')
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
