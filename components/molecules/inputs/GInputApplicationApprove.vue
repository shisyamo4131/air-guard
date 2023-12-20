<template>
  <div>
    <v-simple-table>
      <tbody>
        <tr>
          <td>申請日</td>
          <td>{{ requestDate }}</td>
        </tr>
        <tr>
          <td>申請区分</td>
          <td>{{ $LEAVE_APPLICATION_TYPE[type] }}</td>
        </tr>
        <tr>
          <td>申請者</td>
          <td>{{ employee?.abbr || 'loading' }}</td>
        </tr>
        <tr>
          <td>対象日</td>
          <td>{{ date }}</td>
        </tr>
        <tr>
          <td>申請事由</td>
          <td>{{ reason }}</td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-switch v-model="internalReject" label="申請を却下する" />
    <v-expand-transition>
      <a-textarea
        v-show="internalReject"
        label="却下事由"
        :value="rejectReason"
        :required="internalReject"
        @input="$emit('update:rejectReason', $event)"
      />
    </v-expand-transition>
  </div>
</template>

<script>
import ATextarea from '~/components/atoms/inputs/ATextarea.vue'
export default {
  components: { ATextarea },
  props: {
    requestDate: { type: undefined, default: null, required: false },
    type: { type: undefined, default: null, required: false },
    employeeId: { type: undefined, default: null, required: false },
    date: { type: undefined, default: null, required: false },
    reason: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
    settlementDate: { type: undefined, default: null, required: false },
    settlementUid: { type: undefined, default: null, required: false },
    rejectReason: { type: undefined, default: null, required: false },
    reject: { type: Boolean, default: false, required: false },
  },
  data() {
    return {
      lazyReject: false,
    }
  },
  computed: {
    employee() {
      return this.$store.getters['masters/Employee'](this.employeeId)
    },
    internalReject: {
      get() {
        return this.lazyReject
      },
      set(v) {
        this.lazyReject = v
        this.$emit('update:reject', v)
      },
    },
  },
  watch: {
    reject: {
      handler(v) {
        this.lazyReject = v
        if (!v) this.$emit('update:rejectReason', null)
      },
      immediate: true,
    },
  },
}
</script>

<style></style>
