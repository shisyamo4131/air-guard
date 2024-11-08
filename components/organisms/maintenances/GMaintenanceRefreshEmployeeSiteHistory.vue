<script>
/**
 * 従業員の現場履歴を従業員単位で更新するためのコンポーネントです。
 * - バグなどの理由で稼働履歴が正常に記録されていなかった場合の強制的な処理です。
 * - 大量のデータ、ドキュメントを読み込む可能性があるため、必要な時にだけ実行してください。
 */
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GAutocompleteEmployee from '~/components/atoms/inputs/GAutocompleteEmployee.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'

const firebaseApp = getApp()
const functions = getFunctions(firebaseApp, 'asia-northeast1')

export default {
  components: { GAutocompleteEmployee, GTextField },
  data() {
    return {
      employeeId: null,
      date: null,
      loading: false,
    }
  },

  computed: {
    store() {
      return this.$store.state.systems.refreshEmployeeSiteHistory
    },
    status() {
      return this.store?.status || 'N/A'
    },
    lastExecutedAt() {
      return this.store?.lastExecutedAt || 'N/A'
    },
    executeStatus() {
      return this.store?.executeStatus || 'N/A'
    },
  },

  methods: {
    async submitByEmployeeId() {
      this.loading = true
      try {
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(
          functions,
          'maintenance-refreshEmployeeSiteHistoryByEmployeeId'
        )
        const result = await func({ employeeId: this.employeeId })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        this.loading = false
      }
    },
    async submitByTimestamp() {
      this.loading = true
      try {
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(
          functions,
          'maintenance-refreshEmployeeSiteHistoryByTimestamp'
        )
        const result = await func({ date: this.date })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <v-card outlined>
    <v-card-title> 従業員現場履歴の更新 </v-card-title>
    <v-card-subtitle> 従業員単位で現場履歴を更新します。 </v-card-subtitle>
    <v-divider />
    <v-card-text>
      <ul>
        <li>
          バグなどの特別な理由により、従業員現場履歴が正常に登録されていない場合の復旧に使用します。
        </li>
        <li>
          大量のデータ、ドキュメントについて Read/Write
          が発生する可能性があります。
        </li>
      </ul>
    </v-card-text>
    <v-divider />
    <v-card-text>
      <h4>システムによる実行結果</h4>
      <v-simple-table>
        <tbody>
          <tr>
            <td>状態</td>
            <td>{{ status }}</td>
          </tr>
          <tr>
            <td>最終実行日時</td>
            <td>{{ lastExecutedAt }}</td>
          </tr>
          <tr>
            <td>最終実行ステータス</td>
            <td>{{ executeStatus }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card-text>
    <v-divider />
    <v-row>
      <v-col cols="12" md="6">
        <v-container>
          <v-card>
            <v-card-title>従業員単位</v-card-title>
            <v-card-text>
              <g-autocomplete-employee
                v-model="employeeId"
                label="対象従業員"
              />
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                :disabled="loading || !employeeId"
                :loading="loading"
                @click="submitByEmployeeId"
                >実行</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-container>
      </v-col>
      <v-col cols="12" md="6">
        <v-container>
          <v-card>
            <v-card-title>基準日</v-card-title>
            <v-card-text>
              <g-text-field v-model="date" label="基準日" input-type="date" />
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                :disabled="loading || !date"
                :loading="loading"
                @click="submitByTimestamp"
                >実行</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-container>
      </v-col>
    </v-row>
  </v-card>
</template>

<style></style>
