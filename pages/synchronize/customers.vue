<script>
/**
 * ### pages.synchronize/customers
 *
 * 概要:
 * Realtime DatabaseのAirGuard/Customersに取り込まれているデータが
 * FirestoreのCustomersドキュメントと同期されるように設定する画面です。
 *
 * 機能詳細:
 * - Realtime DatabaseのAirGuard/Customers下のデータについて、同期設定が行われていないものを一覧表示します。
 * - ユーザーから選択された上記データの同期先ドキュメントをユーザーが選択します。
 * - 同期先ドキュメントは`sync`プロパティがfalseのもののみ、一覧表示されます。
 * - 同期先ドキュメントは新規登録させることも可能です。
 * - `sync`プロパティがfalseである既存ドキュメントが存在しない場合のみ、
 *   同期設定が行われていないデータを一括で新規登録することが可能です。
 *
 * 注意事項:
 * - 一度同期処理が行われると、同期前の状態に戻すことはできません。
 *   -> 同期解除の機能を実装するかどうか、要検討。
 *
 * @author shisyamo4131
 * @version 1.0.1
 *
 * 更新履歴:
 * - version 1.0.1 - 2024-07-10 - submit()のバグを解消。
 * - version 1.0.0 - 2024-07-09 - 初版作成
 */
import {
  equalTo,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  orderByChild,
  query,
  ref,
  update,
} from 'firebase/database'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GTemplateFixed from '~/components/templates/GTemplateFixed.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SynchronizeCustomers',
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  components: { GDataTable, GTemplateFixed },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app }) {
    /**
     * `AirGuard/Customers`の同期設定がされていないデータへのリスナーをセット
     */
    const items = { unsync: [] }
    const dbRef = ref(app.$database, 'AirGuard/Customers')
    const q = query(dbRef, orderByChild('docId'), equalTo(null))

    const updateItem = (data, type) => {
      const index = items.unsync.findIndex((item) => item.code === data.key)
      if (type === 'add') items.unsync.push(data.val())
      if (index === -1) return
      if (type === 'change') items.unsync.splice(index, 1, data.val())
      if (type === 'remove') items.unsync.splice(index, 1)
    }

    const listeners = {
      added: onChildAdded(q, (data) => updateItem(data, 'add')),
      changed: onChildChanged(q, (data) => updateItem(data, 'change')),
      removed: onChildRemoved(q, (data) => updateItem(data, 'remove')),
    }
    return { items, listeners }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      asNewItem: false,
      loading: false,
      page: { toSync: 1, unsync: 1 },
      pageCount: { toSync: 1, unsync: 1 },
      selectedUnsync: [],
      selectedToSync: [],
      snackbar: false,
      step: 0,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    unsyncedCustomers() {
      return this.$store.state.customers.items.filter(
        (item) => item.sync === false
      )
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    asNewItem(v) {
      if (v) this.selectedToSync.splice(0)
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listeners.added()
    this.listeners.changed()
    this.listeners.removed()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.step = 0
      this.selectedUnsync.splice(0)
      this.selectedToSync.splice(0)
      this.asNewItem = false
      this.loading = false
      this.page.unsync = 1
      this.page.toSync = 1
    },
    /**
     * 同期設定を行います。
     * - 実際の同期処理はCloud Functionsで行われます。
     * - Cloud FunctionsのonValueChangedトリガーを起動させるため、
     *   AirGuard/Customers/{code}/docIdに同期対象のFirestoreドキュメントidを設定します。
     * - ドキュメントを新規に作成する場合、空作成したドキュメントのidを使用します。
     * - 処理後にAutonumberを更新します。同期処理自体がCloud Functionsで行われるため、
     *   リアルタイムリスナーを利用して同期処理の完了を監視します。
     */
    async submit() {
      this.loading = true
      const code = this.selectedUnsync[0].code
      try {
        /**
         * 同期対象ドキュメントのidを取得して返します。
         * - `data.asNewItem`がtrueの場合は空ドキュメントを作成してidを返します。
         * - 既存ドキュメントへの同期の場合は対象のドキュメントidを返します。
         * - 空ドキュメント作成時は自動採番を行わず、作成後に自動採番を更新します。
         */
        const getDocumentId = async () => {
          if (this.asNewItem) {
            const model = this.$Customer({ code })
            const docRef = await model.create({ useAutonum: false })
            await this.$Autonumber().refresh('Customers')
            return docRef.id
          } else {
            return this.selectedToSync[0].docId
          }
        }

        /* 同期対象のドキュメントidを取得 */
        const docId = await getDocumentId()

        /* 同期設定対象データへの参照を取得 */
        const dbRef = ref(this.$database, `AirGuard/Customers/${code}`)

        /* 同期設定対象データのdocIdを更新 */
        await update(dbRef, { docId })

        /* 画面を初期化し、処理完了をアナウンス */
        this.initialize()
        this.snackbar = true
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    /**
     * 同期設定が行われていないAirGuard/Customersデータをすべて新規ドキュメントとして
     * Firestoreに登録し、同期設定を行います。
     */
    async forceRegist() {
      const result = window.confirm(
        'すべての取引先を強制的に登録します。よろしいですか？'
      )
      if (!result) return
      this.loading = true
      try {
        /**
         * codeを既定した状態でドキュメントを空作成
         * 作成したドキュメントのidを配列で取得
         */
        const docIds = await Promise.all(
          this.items.unsync.map(async (item) => {
            const model = this.$Customer({ code: item.code })
            const docRef = await model.create({ useAutonum: false })
            return docRef.id
          })
        )
        /**
         * 同期設定が行われていないデータについて空作成したドキュメントのidを紐づける
         * - ドキュメントidは先に取得した配列をインデックスで参照取得する
         */
        const updates = this.items.unsync.reduce((acc, i, index) => {
          acc[`/AirGuard/Customers/${i.code}/docId`] = docIds[index]
          return acc
        }, {})

        /* データベースを更新 */
        await update(ref(this.$database), updates)

        /**
         * Autonumberを更新
         * - 空作成時にcodeを既定しているので、Cloud Functionsからの同期処理を待つ必要はない
         */
        await this.$Autonumber().refresh('Customers')
        this.initialize()
        this.snackbar = true
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

<template>
  <g-template-fixed v-slot="{ height }">
    <v-card outlined :height="height" class="d-flex flex-column">
      <v-card-title> 取引先情報同期設定 </v-card-title>
      <v-card-text> 取引先情報の同期設定を行います。 </v-card-text>
      <v-window v-model="step" style="height: 100%">
        <v-window-item style="height: inherit">
          <v-card class="d-flex flex-column" style="height: inherit">
            <v-card-text class="text-end">
              <v-btn
                color="primary"
                :disabled="!!unsyncedCustomers.length || !items.unsync.length"
                :loading="loading"
                outlined
                small
                @click="forceRegist"
                >すべての取引先を強制的に登録</v-btn
              >
            </v-card-text>
            <v-card-text class="d-flex flex-grow-1 overflow-hidden">
              <g-data-table
                v-model="selectedUnsync"
                class="flex-table"
                disable-sort
                :headers="[
                  { text: 'CODE', value: 'code' },
                  { text: '取引先名1', value: 'name1' },
                  { text: '取引先名2', value: 'name2' },
                ]"
                :items="items.unsync"
                item-key="code"
                show-select
                single-select
                :page.sync="page.unsync"
                @page-count="pageCount.unsync = $event"
              />
            </v-card-text>
            <div class="text-center">
              <v-pagination v-model="page.unsync" :length="pageCount.unsync" />
            </div>
            <v-card-actions class="justify-end">
              <v-btn
                color="primary"
                :disabled="!selectedUnsync.length"
                @click="step++"
                >次へ</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-window-item>
        <v-window-item>
          <v-card>
            <v-card-text
              class="d-flex overflow-hidden"
              :style="{ height: `${$vuetify.breakpoint.height - 380}px` }"
            >
              <g-data-table
                v-model="selectedToSync"
                class="flex-table"
                disable-sort
                :headers="[
                  { text: 'CODE', value: 'code' },
                  { text: '取引先名1', value: 'name1' },
                  { text: '取引先名2', value: 'name2' },
                ]"
                :items="unsyncedCustomers"
                item-key="code"
                :show-select="!asNewItem"
                single-select
                :page.sync="page.toSync"
                @page-count="pageCount.toSync = $event"
              />
            </v-card-text>
            <div class="text-center">
              <v-pagination v-model="page.toSync" :length="pageCount.toSync" />
            </div>
            <v-card-text class="d-flex">
              <v-checkbox
                v-model="asNewItem"
                class="ml-auto"
                label="新規データとして同期する"
              />
            </v-card-text>
            <v-card-actions class="justify-space-between">
              <v-btn @click="step--">戻る</v-btn>
              <v-btn
                color="primary"
                :disabled="!selectedToSync.length && !asNewItem"
                @click="step++"
                >次へ</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-window-item>
        <v-window-item>
          <v-container class="d-flex flex-column mb-4">
            <v-card outlined>
              <v-subheader>同期元</v-subheader>
              <v-simple-table v-if="selectedUnsync.length">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>取引先名1</th>
                    <th>取引先名2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ selectedUnsync[0].code }}</td>
                    <td>{{ selectedUnsync[0].name1 }}</td>
                    <td>{{ selectedUnsync[0].name2 }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
            <v-icon class="align-self-center my-4" x-large
              >mdi-arrow-down-bold</v-icon
            >
            <v-card outlined>
              <v-subheader>同期先</v-subheader>
              <v-simple-table v-if="selectedToSync.length">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>取引先名1</th>
                    <th>取引先名2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ selectedToSync[0].code }}</td>
                    <td>{{ selectedToSync[0].name1 }}</td>
                    <td>{{ selectedToSync[0].name2 }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
              <v-alert v-else type="info" color="info" text
                >新規データとして作成します。</v-alert
              >
            </v-card>
          </v-container>
          <v-card-actions class="justify-space-between">
            <v-btn :disabled="loading" @click="step--">戻る</v-btn>
            <v-btn
              color="primary"
              :disabled="loading"
              :loading="loading"
              @click="submit"
              >実行</v-btn
            >
          </v-card-actions>
        </v-window-item>
      </v-window>
    </v-card>
    <v-snackbar v-model="snackbar" centered> 処理が完了しました。 </v-snackbar>
  </g-template-fixed>
</template>

<style></style>
