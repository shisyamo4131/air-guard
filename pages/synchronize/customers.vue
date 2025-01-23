<script>
/**
 * 取引先の同期処理画面です。
 *
 * #### 概要
 * Realtime DatabaseのAirGuard/Outsourcersに取り込まれているデータが
 * FirestoreのOutsourcersドキュメントと同期されるように設定する画面です。
 *
 * #### 機能詳細
 * - Realtime DatabaseのAirGuard/Outsourcers下のデータについて、同期設定が行われていないものを一覧表示します。
 * - ユーザーから選択された上記データの同期先ドキュメントをユーザーが選択します。
 * - 同期先ドキュメントは`sync`プロパティがfalseのもののみ、一覧表示されます。
 * - 同期先ドキュメントは新規登録させることも可能です。
 * - `sync`プロパティがfalseである既存ドキュメントが存在しない場合のみ、
 *   同期設定が行われていないデータを複数選択して新規登録することが可能です。
 *
 * @author shisyamo4131
 * @refact 2025-01-21
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
import { database } from 'air-firebase'
import Customer from '~/models/Customer'
import Autonumber from '~/models/Autonumber'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'SynchronizeCustomers',

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  components: { GTemplateDefault, GCheckbox },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData() {
    /**
     * 取引先のデータを格納するための変数を用意
     * airGuard: Realtimte Database の 取引先データ
     * unsync: Firestore の未同期取引先ドキュメント
     */
    const items = { airGuard: [], unsync: [] }

    /**
     * Realtime Database, Firestore ドキュメントへのリスナーを用意
     */
    const listeners = {
      added: null,
      changed: null,
      removed: null,
      unsync: new Customer(),
    }

    /**
     * `AirGuard/Customers`の同期設定がされていないデータへのリスナーをセット
     */
    const dbRef = ref(database, 'AirGuard/Customers')
    // const q = query(dbRef, orderByChild('docId'), equalTo(null))
    const q = query(dbRef, orderByChild('docId'), equalTo(false))
    const updateItem = (data, type) => {
      const index = items.airGuard.findIndex((item) => item.code === data.key)
      if (type === 'add') items.airGuard.push(data.val())
      if (index === -1) return
      if (type === 'change') items.airGuard.splice(index, 1, data.val())
      if (type === 'remove') items.airGuard.splice(index, 1)
    }

    listeners.added = onChildAdded(q, (data) => updateItem(data, 'add'))
    listeners.changed = onChildChanged(q, (data) => updateItem(data, 'change'))
    listeners.removed = onChildRemoved(q, (data) => updateItem(data, 'remove'))

    /**
     * 同期設定がされていない取引先ドキュメントコレクションへのリスナーをセット
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
      /**
       * 選択された AirGuard のデータを新規取引先として扱うかどうかのフラグ
       */
      asNewItem: false,

      /**
       * DataTable に表示するアイテムの件数です。
       */
      itemsPerPage: 10,

      /**
       * 処理中であることを表すフラグ
       */
      loading: false,

      /**
       * 未同期の AirGuard データを複数選択できるようにするかどうかのフラグ
       */
      multiple: false,

      /**
       * ページネーション用変数
       */
      page: { toSync: 1, airGuard: 1 },
      pageCount: { toSync: 1, airGuard: 1 },

      /**
       * 選択された未同期の取引先データの配列
       */
      selectedUnsync: [],

      /**
       * 選択された未同期の取引先ドキュメントの配列
       */
      selectedToSync: [],

      /**
       * スナックバー用変数
       */
      snackbar: false,

      /**
       * ステップ管理用変数
       */
      step: 0,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.asNewItem を監視します。
     * true に変更されたら未同期取引先ドキュメントの選択を初期化します。
     */
    asNewItem(v) {
      if (v) this.selectedToSync.splice(0)
    },

    /**
     * data.multiple を監視します。
     * false に変更されたら未同期取引先データの選択を初期化します。
     */
    multiple(v) {
      if (!v) this.selectedUnsync.splice(0)
    },
  },

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    /**
     * リアルタイムリスナーによる購読をすべて解除します。
     */
    this.listeners.added()
    this.listeners.changed()
    this.listeners.removed()
    this.listeners.unsync.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントを初期化します。
     */
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
          const item = this.selectedUnsync[0]
          if (this.asNewItem) {
            const instance = new Customer(item)
            const docRef = await instance.create({ useAutonumber: false })
            await Autonumber.refresh('Customers')
            return docRef.id
          } else {
            return this.selectedToSync[0].docId
          }
        }

        /* 同期対象のドキュメントidを取得 */
        const docId = await getDocumentId()

        /* 同期設定対象データへの参照を取得 */
        const dbRef = ref(database, `AirGuard/Customers/${code}`)

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
     *
     * @update 2024-07-11 - 一度に大量に処理すると重すぎる上、Cloud Functionsの制限に引っかかる。
     *                      バッチ的なやり方でエラーが発生すると手戻りできないため、
     *                      時間をかけてでも1件ずつ、丁寧に処理する。
     */
    async forceRegist() {
      /* 処理確認 */
      const msg = 'すべての取引先を強制的に登録します。よろしいですか？'
      if (!window.confirm(msg)) return

      /* 事前処理 */
      this.loading = true
      try {
        for (const item of this.selectedUnsync) {
          const instance = new Customer(item) // codeを初期設定しておかないと自動採番が正常に更新されない。
          const docRef = await instance.create({ useAutonumber: false })
          const dbRef = ref(database, `AirGuard/Customers/${item.code}`)
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
        await Autonumber.refresh('Customers')
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container :style="{ height: `${height}px` }">
      <v-card outlined height="100%" class="d-flex flex-column">
        <v-card-title> 取引先情報同期設定 </v-card-title>
        <v-card-text> 取引先情報の同期設定を行います。 </v-card-text>
        <v-window v-model="step" style="height: 100%">
          <v-window-item style="height: inherit">
            <v-container class="d-flex flex-column" style="height: inherit">
              <v-card-text class="d-flex justify-space-between">
                <g-checkbox
                  v-model="multiple"
                  label="選択した取引先を強制登録する"
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
              <v-card class="flex-table-container" outlined>
                <v-data-table
                  v-model="selectedUnsync"
                  disable-sort
                  :headers="[
                    { text: 'CODE', value: 'code' },
                    { text: '取引先名', value: 'name1' },
                    { text: '住所', value: 'address1' },
                    { text: '電話番号', value: 'tel' },
                  ]"
                  hide-default-footer
                  :items="items.airGuard"
                  item-key="code"
                  :items-per-page="itemsPerPage"
                  show-select
                  :single-select="!multiple"
                  :page.sync="page.airGuard"
                  @page-count="pageCount.airGuard = $event"
                >
                  <template #[`item.name1`]="{ item }">
                    <div>{{ item.name1 }}</div>
                    <div>{{ item.name2 }}</div>
                  </template>
                </v-data-table>
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
              <v-card class="flex-table-container" outlined>
                <v-data-table
                  v-model="selectedToSync"
                  disable-sort
                  :headers="[
                    { text: 'CODE', value: 'code' },
                    { text: '取引先名1', value: 'name1' },
                    { text: '取引先名2', value: 'name2' },
                  ]"
                  hide-default-footer
                  :items="items.unsync"
                  item-key="docId"
                  :show-select="!asNewItem"
                  single-select
                  :page.sync="page.toSync"
                  @page-count="pageCount.toSync = $event"
                />
              </v-card>
              <v-container class="text-center">
                <v-pagination
                  v-model="page.toSync"
                  :length="pageCount.toSync"
                  total-visible="20"
                />
              </v-container>
              <v-container class="d-flex">
                <v-checkbox
                  v-model="asNewItem"
                  class="ml-auto"
                  label="新規データとして同期する"
                  hide-details
                />
              </v-container>
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
            <v-container
              class="d-flex flex-column mb-4"
              style="height: inherit"
            >
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
      <v-snackbar v-model="snackbar" centered>
        処理が完了しました。
      </v-snackbar>
    </v-container>
  </g-template-default>
</template>

<style></style>
