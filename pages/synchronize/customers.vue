<template>
  <v-container>
    <v-card outlined>
      <v-card-title> 取引先情報同期設定 </v-card-title>
      <v-card-text> 取引先情報の同期設定を行います。 </v-card-text>
      <v-window v-model="step">
        <v-window-item>
          <v-card>
            <v-card-text
              class="d-flex overflow-hidden"
              :style="{ height: `${$vuetify.breakpoint.height - 272}px` }"
            >
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
  </v-container>
</template>

<script>
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
export default {
  name: 'SynchronizeCustomers',
  components: { GDataTable },
  asyncData({ app }) {
    const items = {
      unsync: [],
    }
    const listeners = {
      added: null,
      changed: null,
      removed: null,
    }
    const dbRef = ref(app.$database, 'AirGuard/Customers')
    const q = query(dbRef, orderByChild('docId'), equalTo(null))
    listeners.added = onChildAdded(q, (data) => {
      items.unsync.push(data.val())
    })
    listeners.changed = onChildChanged(q, (data) => {
      const index = items.unsync.findIndex((item) => item.code === data.key)
      if (index !== -1) items.unsync.splice(index, 1, data.val())
    })
    listeners.removed = onChildRemoved(q, (data) => {
      const index = items.unsync.findIndex((item) => item.code === data.key)
      if (index !== -1) items.unsync.splice(index, 1)
    })
    return { items, listeners }
  },
  data() {
    return {
      asNewItem: false,
      loading: false,
      page: {
        toSync: 1,
        unsync: 1,
      },
      pageCount: {
        toSync: 1,
        unsync: 1,
      },
      selectedUnsync: [],
      selectedToSync: [],
      step: 0,
    }
  },
  computed: {
    unsyncedCustomers() {
      return this.$store.state.customers.items.filter(
        (item) => item.sync === false
      )
    },
  },
  watch: {
    asNewItem(v) {
      if (v) this.selectedToSync.splice(0)
    },
  },
  destroyed() {
    this.listeners.added()
    this.listeners.changed()
    this.listeners.removed()
  },
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
    async syncToExist(code, docId) {
      const dbRef = ref(this.$database, `AirGuard/Customers/${code}`)
      await update(dbRef, { docId })
    },
    async syncToNewItem() {
      const model = this.$Customer(this.selectedUnsync[0])
      const docRef = await model.create()
      await this.syncToExist(this.selectedUnsync[0].code, docRef.id)
    },
    async submit() {
      this.loading = true
      try {
        if (this.asNewItem) {
          await this.syncToNewItem()
        } else {
          const code = this.selectedUnsync[0].code
          const docId = this.selectedToSync[0].docId
          await this.syncToExist(code, docId)
        }
        this.initialize()
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
