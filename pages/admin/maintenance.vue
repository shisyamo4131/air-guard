<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title> インデックスの再構築 </v-card-title>
          <v-card-subtitle>
            Realtime
            DatabaseのCustomers、Sites、Employeesインデックスを再構築します。
          </v-card-subtitle>
          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              :disabled="loading"
              :loading="loading"
              @click="refreshIndex"
              >実行</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title> 出勤簿集計処理 </v-card-title>
          <v-card-subtitle>
            出勤簿の集計処理フラグの状態です。
          </v-card-subtitle>
          <v-card-text>
            <v-simple-table>
              <tbody>
                <tr>
                  <td>状態</td>
                  <td>{{ calcAttendance.status }}</td>
                </tr>
                <tr>
                  <td>最終実行日時</td>
                  <td>{{ calcAttendance.lastExecutedAt }}</td>
                </tr>
                <tr>
                  <td>最終実行ステータス</td>
                  <td>{{ calcAttendance.executeStatus }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              :disabled="loading"
              :loading="loading"
              @click="initCalcAttendanceStatus"
            >
              状態初期化
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { getApp } from 'firebase/app'
import { mapState } from 'vuex'
import System from '~/models/System'
export default {
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapState({
      calcAttendance: (state) => state.systems.calcAttendance,
    }),
  },
  methods: {
    async refreshIndex() {
      this.loading = true
      // インデックスデータに対する購読を一旦解除
      this.$store.dispatch('customers/unsubscribe')
      this.$store.dispatch('sites/unsubscribe')
      this.$store.dispatch('employees/unsubscribe')
      try {
        const firebaseApp = getApp()
        const functions = getFunctions(firebaseApp, 'asia-northeast1')
        if (process.env.NODE_ENV === 'local') {
          connectFunctionsEmulator(functions, 'localhost', 5001)
        }
        const func = httpsCallable(functions, 'maintenance-refreshIndex')
        const result = await func({ indexType: 'all' })
        console.info(result.data.message) // eslint-disable-line no-console
      } catch (err) {
        console.error('Error calling function:', err) // eslint-disable-line no-console
      } finally {
        await this.$store.dispatch('customers/subscribe')
        await this.$store.dispatch('sites/subscribe')
        await this.$store.dispatch('employees/subscribe')
        this.loading = false
      }
    },
    /****************************************************************************
     * calcAttendance ステータスを初期化するメソッドです。
     * - このメソッドは System ドキュメントの 'calcAttendance.status' を 'ready' に更新し、
     *   出勤簿の計算処理を開始できる状態にします。
     * - 更新が成功した場合は何も返さず、エラーハンドリングを行います。
     *
     * @throws {Error} - ステータスの更新に失敗した場合、エラーがスローされます。
     ****************************************************************************/
    async initCalcAttendanceStatus() {
      this.loading = true
      try {
        await System.initCalcAttendanceStatus()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`initCalcAttendanceStatus でエラーが発生しました。`, {
          err,
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style></style>
