<script>
/**
 * 現場の従業員入場履歴を更新するためのコンポーネントです。
 * - バグなどの理由で従業員入場履歴が正常に記録されていなかった場合の強制的な処理です。
 * - 大量のデータ、ドキュメントを読み込む可能性があるため、必要な時にだけ実行してください。
 */
import { getApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteSite from '~/components/atoms/inputs/GAutocompleteSite.vue'

const firebaseApp = getApp()
const functions = getFunctions(firebaseApp, 'asia-northeast1')

export default {
  components: { GTextField, GAutocompleteSite },
  data() {
    return {
      siteId: null,
      date: null,
      loading: false,
    }
  },

  computed: {
    store() {
      return this.$store.state.systems.refreshSiteEmployeeHistory
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
    async submitBySiteId() {
      this.loading = true
      try {
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(
          functions,
          'maintenance-refreshSiteEmployeeHistoryBySiteId'
        )
        const result = await func({ siteId: this.siteId })
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
          'maintenance-refreshSiteEmployeeHistoryByTimestamp'
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
    <v-card-title> 現場従業員入場履歴の更新 </v-card-title>
    <v-card-subtitle> 現場の従業員入場履歴を更新します。 </v-card-subtitle>
    <v-divider />
    <v-card-text>
      <ul>
        <li>
          バグなどの特別な理由により、従業員入場履歴が正常に登録されていない場合の復旧に使用します。
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
            <v-card-title>現場単位</v-card-title>
            <v-card-text>
              <g-autocomplete-site v-model="siteId" label="対象現場" />
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                :disabled="loading || !siteId"
                :loading="loading"
                @click="submitBySiteId"
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
