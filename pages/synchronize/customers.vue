<template>
  <v-container>
    <v-card outlined>
      <v-card-title> 取引先情報同期設定 </v-card-title>
      <v-card-text> 取引先情報の同期設定を行います。 </v-card-text>
      <v-stepper v-model="step" vertical flat>
        <v-stepper-step step="1"> 未同期データの選択 </v-stepper-step>
        <v-stepper-content step="1">
          <g-data-table
            v-model="selectedUnsync"
            :headers="[
              { text: 'CODE', value: 'code' },
              { text: '取引先名1', value: 'name1' },
              { text: '取引先名2', value: 'name2' },
            ]"
            height="240"
            :items="items.unsync"
            item-key="code"
            show-select
            single-select
          />
          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              :disabled="!selectedUnsync.length"
              @click="step++"
              >次へ</v-btn
            >
          </v-card-actions>
        </v-stepper-content>
        <v-stepper-step step="2"> 同期先データの選択 </v-stepper-step>
        <v-stepper-content step="2">
          <g-data-table
            v-model="selectedToSync"
            :headers="[
              { text: 'CODE', value: 'code' },
              { text: '取引先名1', value: 'name1' },
              { text: '取引先名2', value: 'name2' },
            ]"
            height="240"
            :items="unsyncedCustomers"
            item-key="code"
            :show-select="!asNewItem"
            single-select
          />
          <div class="d-flex">
            <v-checkbox
              v-model="asNewItem"
              class="ml-auto"
              label="新規データとして同期する"
            />
          </div>
          <v-card-actions class="justify-space-between">
            <v-btn @click="step--">戻る</v-btn>
            <v-btn
              color="primary"
              :disabled="!selectedToSync.length && !asNewItem"
              @click="step++"
              >次へ</v-btn
            >
          </v-card-actions>
        </v-stepper-content>
        <v-stepper-step step="3"> 確認 </v-stepper-step>
        <v-stepper-content step="3">
          <div class="d-flex flex-column mb-4">
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
          </div>
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
        </v-stepper-content>
      </v-stepper>
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
      selectedUnsync: [],
      selectedToSync: [],
      step: 1,
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
      this.step = 1
      this.selectedUnsync.splice(0)
      this.selectedToSync.splice(0)
      this.asNewItem = false
      this.loading = false
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
        this.loading = true
      }
    },
  },
}
</script>

<style></style>
