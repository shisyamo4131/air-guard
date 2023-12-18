<template>
  <v-card max-width="600">
    <v-card-title>申請管理（承認－却下）</v-card-title>
    <v-card-subtitle>以下の申請を承認しますか？</v-card-subtitle>
    <v-card-text>
      <v-simple-table>
        <tbody>
          <tr>
            <td>申請日</td>
            <td>{{ applicationDate }}</td>
          </tr>
          <tr>
            <td>申請区分</td>
            <td>{{ $APPLICATION_TYPE[applicationType] }}</td>
          </tr>
          <tr>
            <td>申請者</td>
            <td>{{ employee?.abbr || 'loading' }}</td>
          </tr>
          <tr>
            <td>対象日</td>
            <td>{{ dates }}</td>
          </tr>
          <tr>
            <td>申請事由</td>
            <td>{{ reason }}</td>
          </tr>
        </tbody>
      </v-simple-table>
      <v-switch v-model="withdraw" label="申請を却下する" hide-details />
    </v-card-text>
    <v-expand-transition>
      <v-card-text v-show="withdraw">
        <v-form v-model="formVerified" :disabled="loading">
          <a-textarea
            label="却下事由"
            :value="rejectReason"
            :required="withdraw"
            @input="$emit('update:rejectReason', $event)"
          />
        </v-form>
      </v-card-text>
    </v-expand-transition>
    <v-card-actions class="justify-space-between px-5">
      <v-btn :disabled="loading" @click="$emit('click:cancel')">閉じる</v-btn>
      <v-btn
        :color="withdraw ? 'warning' : 'primary'"
        :disabled="!formVerified || loading"
        :loading="loading"
        @click="onClickSubmit"
      >
        {{ withdraw ? '却下' : '承認' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
export default {
  components: { ATextarea },
  props: {
    applicationDate: { type: undefined, default: null, required: false },
    applicationType: { type: undefined, default: null, required: false },
    employeeId: { type: undefined, default: null, required: false },
    dates: { type: undefined, default: null, required: false },
    reason: { type: undefined, default: null, required: false },
    approvedDate: { type: undefined, default: null, required: false },
    approvedId: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
    rejectReason: { type: undefined, default: null, required: false },
    loading: { type: Boolean, default: false, required: false },
  },
  data() {
    return {
      formVerified: false,
      withdraw: false,
    }
  },
  computed: {
    employee() {
      return this.$store.getters['masters/Employee'](this.employeeId)
    },
  },
  watch: {
    withdraw(v) {
      if (!v) this.$emit('update:rejectReason', null)
    },
  },
  methods: {
    onClickSubmit() {
      this.$emit('update:status', this.withdraw ? 'withdraw' : 'approved')
      this.$emit('submit')
    },
  },
}
</script>

<style></style>
