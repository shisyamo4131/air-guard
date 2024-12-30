<script>
import { ref, runTransaction } from 'firebase/database'
import { database } from 'air-firebase/dist/firebase.init'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import { PlacedEmployee } from '~/models/Placement'
import GTextField from '~/components/atoms/inputs/GTextField.vue'

export default {
  components: { GBtnSubmit, GTextField },

  props: {
    item: { type: Object, required: true },
    path: { type: String, required: true },
    value: { type: Boolean, default: false },
  },

  data() {
    return {
      editModel: new PlacedEmployee(),
      dialog: false,
      label: '従業員配置情報変更',
      loading: false,
    }
  },

  computed: {
    worker() {
      const result = this.$store.getters['employees/get'](this.item.employeeId)
      return result?.fullName || 'N/A'
    },
  },

  watch: {
    dialog(value) {
      this.$emit('input', value)
    },
    item: {
      handler(newItem) {
        this.editModel = new PlacedEmployee(structuredClone(newItem))
      },
      immediate: true,
    },
    value: {
      handler(newValue) {
        this.dialog = newValue
      },
      immediate: true,
    },
  },

  methods: {
    validate() {
      const result = this.$refs.form.validate()
      if (!result) {
        alert('入力に不備があります。')
      }
      return result
    },

    /**
     * 配置情報をトランザクションで更新します。
     */
    async submit() {
      if (!this.validate()) return
      this.loading = true
      const dbRef = ref(database, this.path)
      try {
        await runTransaction(dbRef, (currentData) => {
          if (currentData === null) {
            const message = '更新対象の配置データが存在しませんでした。'
            // eslint-disable-next-line no-console
            console.error(message)
            throw new Error(message)
          }
          return { ...currentData, ...this.editModel.toObject() }
        })
        this.dialog = false
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('トランザクション処理中にエラーが発生しました:', error)
        alert(error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 外部から当該コンポーネントを開くためのメソッドです。
     */
    open() {
      this.dialog = true
    },
  },
}
</script>

<template>
  <v-dialog v-bind="$attrs" v-model="dialog" max-width="360" v-on="$listeners">
    <v-card>
      <v-toolbar color="secondary" dark dense flat>
        <v-toolbar-title>{{ label }}</v-toolbar-title>
        <v-spacer />
        <v-icon :disabled="loading" @click="dialog = false">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="py-5">
        <v-form ref="form">
          <h3 class="pb-4">{{ worker }}</h3>
          <v-row dense>
            <v-col cols="12" md="6">
              <g-text-field
                v-model="editModel.startTime"
                label="開始時刻"
                required
                input-type="time"
              />
            </v-col>
            <v-col cols="12" md="6">
              <g-text-field
                v-model="editModel.endTime"
                label="終了時刻"
                required
                input-type="time"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <g-btn-submit
          icon
          color="primary"
          :disabled="loading"
          :loading="loading"
          @click="submit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
