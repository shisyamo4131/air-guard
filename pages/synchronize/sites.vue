<script>
/**
 * ### pages.synchronize/sites
 *
 * #### 概要
 * Realtime DatabaseのAirGuard/Customersに取り込まれているデータが
 * FirestoreのCustomersドキュメントと同期されるように設定する画面です。
 *
 * #### 機能詳細
 * - Realtime DatabaseのAirGuard/Sites下のデータについて、同期設定が行われていないものを一覧表示します。
 * - ユーザーから選択された上記データの同期先ドキュメントをユーザーが選択します。
 * - 同期先ドキュメントは`sync`プロパティがfalseのもののみ、一覧表示されます。
 * - 同期先ドキュメントは新規登録させることも可能です。
 * - `sync`プロパティがfalseである既存ドキュメントが存在しない場合のみ、
 *   同期設定が行われていないデータを複数選択して新規登録することが可能です。
 *
 * #### 注意事項
 * - 取引先CODEに該当するCustomerドキュメントが登録されていない場合、同期設定はできません。
 *
 * @author shisyamo4131
 * @version 1.1.1
 *
 * @updates
 * - version 1.1.1 - 2024-07-19 - 強制インポートに表示件数を追加。
 * - version 1.1.0 - 2024-07-12 - すべて強制登録を廃止
 *                              - AirGuardから複数選択 -> 強制登録を可能にした。
 * - version 1.0.0 - 2024-07-11 - 初版作成
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
import { database } from 'air-firebase/dist/firebase.init'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GTemplateFixed from '~/components/templates/GTemplateFixed.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import Site from '~/models/Site'
import Autonumber from '~/models/Autonumber'
import Customer from '~/models/Customer'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SynchronizeSites',
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  components: { GDataTable, GTemplateFixed, GCheckbox },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, store }) {
    const items = { airGuard: [], unsync: [] }
    const listeners = {
      added: null,
      changed: null,
      removed: null,
      unsync: new Site(),
    }
    /**
     * `AirGuard/Sites`の同期設定がされていないデータへのリスナーをセット
     */
    const dbRef = ref(database, 'AirGuard/Sites')
    const q = query(dbRef, orderByChild('docId'), equalTo(null))
    const updateItem = (data, type) => {
      const item = data.val()

      // // storeを参照して取引先の存在有無を`isSelectable`にセット
      // item.isSelectable = store.getters['customers/items'].some(
      //   (customer) => customer.code === item.customerCode
      // )

      // Vuex から取引先情報を取得
      const customer = store.getters['customers/items'].find(
        (customer) => customer.code === item.customerCode
      )

      // item の内容を補足
      item.customer = customer
      item.isSelectable = !!customer // 取引先情報の有無に応じて

      const index = items.airGuard.findIndex((item) => item.code === data.key)
      if (type === 'add') items.airGuard.push(item)
      if (index === -1) return
      if (type === 'change') items.airGuard.splice(index, 1, item)
      if (type === 'remove') items.airGuard.splice(index, 1)
    }
    listeners.added = onChildAdded(q, (data) => updateItem(data, 'add'))
    listeners.changed = onChildChanged(q, (data) => updateItem(data, 'change'))
    listeners.removed = onChildRemoved(q, (data) => updateItem(data, 'remove'))

    /**
     * 同期設定がされていないSiteドキュメントコレクションへのリスナーをセット
     */
    items.unsync = listeners.unsync.subscribeDocs([
      ['where', 'sync', '==', false],
    ])
    return { items, listeners }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      asNewItem: false,
      itemsPerPage: 10,
      loading: false,
      multiple: false,
      page: { toSync: 1, airGuard: 1 },
      pageCount: { toSync: 1, airGuard: 1 },
      selectedUnsync: [],
      selectedToSync: [],
      snackbar: false,
      step: 0,
    }
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    asNewItem(v) {
      if (v) this.selectedToSync.splice(0)
    },
    multiple(v) {
      if (!v) this.selectedUnsync.splice(0)
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listeners.added()
    this.listeners.changed()
    this.listeners.removed()
    this.listeners.unsync.unsubscribe()
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
      this.page.airGuard = 1
      this.page.toSync = 1
    },
    /**
     * 同期設定を行います。
     * - 実際の同期処理はCloud Functionsで行われます。
     * - Cloud FunctionsのonValueChangedトリガーを起動させるため、
     *   AirGuard/Sites/{code}/docIdに同期対象のFirestoreドキュメントidを設定します。
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
          const item = this.selectedUnsync[0]
          if (this.asNewItem) {
            const customerCode = item.customerCode
            const customerInstance = new Customer()
            const customers = await customerInstance.fetchByCode(customerCode)
            if (!customers.length) {
              throw new Error('取引先情報が取得できませんでした。')
            }
            const customer = customers[0]
            const instance = new Site({
              ...item,
              customer,
              customerId: customer.docId,
            }) // codeを初期設定しておかないと自動採番が正常に更新されない。
            const docRef = await instance.create({ useAutonumber: false })
            await Autonumber.refresh('Sites')
            return docRef.id
          } else {
            return this.selectedToSync[0].docId
          }
        }

        /* 同期対象のドキュメントidを取得 */
        const docId = await getDocumentId()

        /* 同期設定対象データへの参照を取得 */
        const dbRef = ref(database, `AirGuard/Sites/${code}`)

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
     * 同期設定が行われていないAirGuard/Sitesデータをすべて新規ドキュメントとして
     * Firestoreに登録し、同期設定を行います。
     *
     * 一度に大量に処理すると重すぎる上、Cloud Functionsの制限に引っかかる。
     * バッチ的なやり方でエラーが発生すると手戻りできないため、
     * 時間をかけてでも1件ずつ、丁寧に処理する。
     *
     * Firestoreへ登録 -> Realtime Database更新 -> Cloud FunctionsによりFirestoreを更新
     * と、無駄な更新処理が発生してしまうが、Autonumberとの整合性を保つためには回避不可能
     */
    async forceRegist() {
      /* 処理確認 */
      const msg = '選択した現場を強制的に登録します。よろしいですか？'
      if (!window.confirm(msg)) return

      /* 事前処理 */
      this.loading = true
      try {
        // `customerCode`に該当するすべてのCustomersドキュメントを取得
        const customerCodes = this.selectedUnsync.map(
          ({ customerCode }) => customerCode
        )
        const customerInstance = new Customer()
        const customers = await customerInstance.fetchByCodes(customerCodes)
        // インポート対象の現場のうち、該当するCustomersドキュメントが存在しなければエラー
        for (const item of this.selectedUnsync) {
          const customer = customers.filter(
            ({ code }) => code === item.customerCode
          )
          if (!customer) {
            throw new Error(
              `取引先情報が取得できない現場が存在します。item: ${item}`
            )
          }
        }
        for (const item of this.selectedUnsync) {
          const customer = customers.find(
            ({ code }) => code === item.customerCode
          )
          const instance = new Site({
            ...item,
            customerId: customer.docId,
            customer,
          })
          const docRef = await instance.create({ useAutonumber: false })
          const dbRef = ref(database, `AirGuard/Sites/${item.code}`)
          await update(dbRef, { docId: docRef.id })
        }
        this.initialize()
        this.snackbar = true
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        /* Autonumberを更新 -> エラー発生時にも更新が必須 */
        await Autonumber.refresh('Sites')
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-fixed v-slot="{ height }">
    <v-card
      outlined
      :height="height"
      class="d-flex flex-column"
      max-width="800"
    >
      <v-card-title> 現場情報同期設定 </v-card-title>
      <v-card-text> 現場情報の同期設定を行います。 </v-card-text>
      <v-window v-model="step" style="height: 100%">
        <v-window-item style="height: inherit">
          <v-container class="d-flex flex-column" style="height: inherit">
            <v-card-text class="d-flex justify-space-between">
              <g-checkbox
                v-model="multiple"
                label="選択した現場を強制登録する"
                :disabled="
                  !!items.unsync.length || !items.airGuard.length || loading
                "
                hide-details
              />
              <air-select
                v-model="itemsPerPage"
                style="width: 120px; max-width: 120px"
                label="表示件数"
                :items="[
                  { text: '10件', value: 10 },
                  { text: '20件', value: 20 },
                ]"
                hide-details
              />
            </v-card-text>
            <v-card class="d-flex flex-grow-1 overflow-hidden" outlined>
              <g-data-table
                v-model="selectedUnsync"
                class="flex-table"
                disable-sort
                :headers="[
                  { text: 'CODE', value: 'code', width: '108' },
                  { text: '現場名', value: 'name' },
                  { text: '住所', value: 'address' },
                ]"
                item-key="code"
                :items="items.airGuard"
                :items-per-page="itemsPerPage"
                show-select
                :single-select="!multiple"
                :page.sync="page.airGuard"
                @page-count="pageCount.airGuard = $event"
              >
                <template #[`item.code`]="{ item }">
                  <v-icon v-if="!item.isSelectable" color="error" small>
                    mdi-close-circle
                  </v-icon>
                  {{ item.code }}
                </template>
                <template #[`item.name`]="{ item }">
                  <div>{{ item.name }}</div>
                  <div class="grey--text">
                    {{ item?.customer?.abbr || 'N/A' }}
                  </div>
                </template>
              </g-data-table>
            </v-card>
            <v-container class="text-center">
              <v-pagination
                v-model="page.airGuard"
                :length="pageCount.airGuard"
                total-visible="20"
              />
            </v-container>
            <v-card-actions class="justify-end">
              <v-btn
                v-if="!multiple"
                color="primary"
                :disabled="!selectedUnsync.length"
                @click="step++"
                >次へ</v-btn
              >
              <v-btn
                v-else
                color="primary"
                :disabled="!selectedUnsync.length || loading"
                :loading="loading"
                @click="forceRegist"
              >
                {{ `${selectedUnsync.length}件を強制登録` }}
              </v-btn>
            </v-card-actions>
          </v-container>
        </v-window-item>
        <v-window-item style="height: inherit">
          <v-container class="d-flex flex-column" style="height: inherit">
            <v-card class="d-flex flex-grow-1 overflow-hidden" outlined>
              <g-data-table
                v-model="selectedToSync"
                class="flex-table"
                disable-sort
                :headers="[
                  { text: 'CODE', value: 'code', width: '96' },
                  { text: '現場名', value: 'name' },
                  { text: '住所', value: 'address' },
                ]"
                :items="items.unsync"
                item-key="docId"
                :show-select="!asNewItem"
                single-select
                :page.sync="page.toSync"
                @page-count="pageCount.toSync = $event"
              >
                <template #[`item.name`]="{ item }">
                  <div>{{ item.name }}</div>
                  <div class="grey--text">
                    {{ item?.customer?.abbr || 'N/A' }}
                  </div>
                </template>
              </g-data-table>
            </v-card>
            <v-container class="text-center">
              <v-pagination
                v-model="page.toSync"
                :length="pageCount.toSync"
                total-visible="20"
              />
            </v-container>
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
          </v-container>
        </v-window-item>
        <v-window-item style="height: inherit">
          <v-container class="d-flex flex-column mb-4" style="height: inherit">
            <v-card outlined>
              <v-subheader>同期元</v-subheader>
              <v-simple-table v-if="selectedUnsync.length">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>現場名</th>
                    <th>住所</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ selectedUnsync[0].code }}</td>
                    <td>{{ selectedUnsync[0].name }}</td>
                    <td>{{ selectedUnsync[0].address }}</td>
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
                    <th>現場名</th>
                    <th>住所</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ selectedToSync[0].code }}</td>
                    <td>{{ selectedToSync[0].name }}</td>
                    <td>{{ selectedToSync[0].address }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
              <v-alert v-else type="info" color="info" text
                >新規データとして作成します。</v-alert
              >
            </v-card>
            <v-card-actions class="mt-auto justify-space-between">
              <v-btn :disabled="loading" @click="step--">戻る</v-btn>
              <v-btn
                color="primary"
                :disabled="loading"
                :loading="loading"
                @click="submit"
                >実行</v-btn
              >
            </v-card-actions>
          </v-container>
        </v-window-item>
      </v-window>
    </v-card>
    <v-snackbar v-model="snackbar" centered> 処理が完了しました。 </v-snackbar>
  </g-template-fixed>
</template>

<style></style>
