<script>
/**
 * ## pages.transportation-cost-applications.index
 *
 * 交通費申請データの管理画面です。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-14 - 初版作成
 */
import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  query,
  ref,
  update,
  orderByChild,
  endAt,
  startAt,
} from 'firebase/database'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import GSelectSearch from '~/components/molecules/inputs/GSelectSearch.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
import GInputTransportationCostApplication from '~/components/molecules/inputs/GInputTransportationCostApplication.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GComboboxDate from '~/components/atoms/inputs/GComboboxDate.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'TransportationCostApplicationsIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GDataTable,
    GSelectSearch,
    GDialogEditor,
    GInputTransportationCostApplication,
    GBtnCancelIcon,
    GBtnSubmitIcon,
    GComboboxDate,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      bulk: {
        title: '',
        text: '',
        toStatus: '0:creating',
      },
      data: [],
      dialog: {
        bulk: false,
      },
      from: this.$dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
      listeners: {
        added: null,
        changed: null,
        removed: null,
      },
      loading: false,
      period: [],
      status: '0:creating',
      to: this.$dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.data.filter(({ status }) => status === this.status)
    },
  },
  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    this.$watch(
      () => [this.$data.from, this.$data.to],
      (newVal, oldVal) => {
        const after = {
          from: newVal[1],
          to: newVal[2],
        }
        const before = {
          from: oldVal?.[1] || undefined,
          to: oldVal?.[2] || undefined,
        }
        if (JSON.stringify(after) !== JSON.stringify(before)) {
          this.subscribe()
        }
      },
      { immediate: true }
    )
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.listeners).forEach((key) => {
      if (this.listeners[key]) this.listeners[key]()
    })
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 各申請データの詳細ボタンがクリックされた時の処理です。
     * 申請内容の詳細画面を開きます。
     */
    onClickDetail(item) {
      this.$refs.editor.open({ item, editMode: 'UPDATE' })
    },
    /**
     * `data.status`の状態に合わせて交通費申請データの購読を開始します。
     */
    subscribe() {
      const snapshotHandler = (snapshot, action) => {
        const uid = snapshot.key
        const data = snapshot.val()
        const operationResults = Object.entries(data.OperationResults).map(
          ([docId, values]) => ({ docId, ...values })
        )
        const index = this.data.findIndex((obj) => obj.uid === uid)
        if (action === 'add') this.data.push({ ...data, uid, operationResults })
        if (action === 'change')
          this.data.splice(index, 1, { ...data, uid, operationResults })
        if (action === 'remove') this.data.splice(index, 1)
      }
      this.data.splice(0)
      const path = `TransportationCostApplications`
      const dbRef = ref(this.$database, path)
      const q = query(
        dbRef,
        orderByChild('date'),
        startAt(`${this.from}`),
        endAt(`${this.to}`)
      )
      this.listeners.added = onChildAdded(q, (snapshot) => {
        snapshotHandler(snapshot, 'add')
      })
      this.listeners.changed = onChildChanged(q, (snapshot) => {
        snapshotHandler(snapshot, 'change')
      })
      this.listeners.removed = onChildRemoved(q, (snapshot) => {
        snapshotHandler(snapshot, 'remove')
      })
    },
    /**
     * 交通費申請データの`status`を変更します。
     * - 個別に変更するためのメソッドです。一括変更は専用のものを使用します。
     */
    async changeStatus(item, status) {
      const path = `TransportationCostApplications/${item.uid}`
      this.loading = true
      try {
        await update(ref(this.$database, path), { status })
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    /**
     * 交通始新世データの`status`を一括で変更します。
     */
    async changeStatusBulk(status) {
      this.loading = true
      try {
        const updates = this.items.reduce((sum, i) => {
          sum[`TransportationCostApplications/${i.uid}/status`] = status
          sum[
            `TransportationCostApplications/${i.uid}/statusDateKey`
          ] = `${status}-${this.data.date}`
          return sum
        }, {})
        await update(ref(this.$database), updates)
        Object.keys(this.dialog).forEach((key) => (this.dialog[key] = false))
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
    onClickBulk() {
      switch (this.status) {
        case '0:creating':
          this.bulk.title = '一括受付開始処理'
          this.bulk.text =
            '現在表示されている交通費申請データを一括で受付開始状態にします。'
          this.bulk.toStatus = '1:draft'
          break
        case '1:draft':
          this.bulk.title = '一括受付取消処理'
          this.bulk.text =
            '現在表示されている交通費申請データを一括で受付開始前状態にします。'
          this.bulk.toStatus = '0:creating'
          break
        case '2:pending':
          this.bulk.title = '一括承認処理'
          this.bulk.text =
            '現在表示されている交通費申請データを一括で承認にします。'
          this.bulk.toStatus = '3:approved'
          break
        case '3:approved':
          this.bulk.title = '一括精算処理'
          this.bulk.text =
            '現在表示されている交通費申請データを一括で精算済みにします。'
          this.bulk.toStatus = '4:settled'
          break
        case '4:settled':
        case '8:rejected':
        case '9:rejected':
          return
      }
      this.dialog.bulk = true
    },
  },
}
</script>

<template>
  <g-template-index :items="items">
    <template #prepend-search>
      <g-select-search
        v-model="status"
        style="max-width: 180px"
        :items="$TRANSPORTATION_COST_APPLICATION_STATUS_ARRAY"
        :clearable="false"
        placeholder="状態"
      />
    </template>
    <template #search>
      <g-combobox-date v-model="from" hide-details />
      <div>～</div>
      <g-combobox-date v-model="to" hide-details />
      <v-dialog v-model="dialog.bulk" persistent width="360">
        <template #activator="{ attrs }">
          <v-btn
            v-bind="attrs"
            color="primary"
            :disabled="!items.length"
            @click="onClickBulk"
            >一括処理</v-btn
          >
        </template>
        <v-card>
          <v-card-title>{{ bulk.title }}</v-card-title>
          <v-card-text>{{ bulk.text }}</v-card-text>
          <v-card-actions class="justify-space-between">
            <g-btn-cancel-icon
              :disabled="loading"
              @click="dialog.bulk = false"
            />
            <g-btn-submit-icon
              color="primary"
              :disabled="loading"
              :loading="loading"
              @click="changeStatusBulk(bulk.toStatus)"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <template #default="{ attrs, on }">
      <g-data-table
        v-bind="attrs"
        :actions="['detail']"
        :headers="[
          { text: '従業員', value: 'employeeId' },
          { text: '勤務日', value: 'date' },
          { text: '申請額', value: 'total', sortable: false, align: 'right' },
          { text: '状態', value: 'status', sortable: false, align: 'center' },
          { text: '処理', value: 'operation', sortable: false },
        ]"
        item-key="uid"
        :sort-by="['employeeId', 'date']"
        v-on="on"
        @click:detail="onClickDetail"
      >
        <template #[`item.employeeId`]="{ item }">
          {{
            $store.getters['employees/get'](item.employeeId)?.fullName ||
            '退職者'
          }}
        </template>
        <template #[`item.status`]="{ item }">
          <v-chip small>{{
            $TRANSPORTATION_COST_APPLICATION_STATUS[item.status]
          }}</v-chip>
        </template>
        <template #[`item.operation`]="{ item }">
          <v-btn
            v-if="item.status === '1:draft'"
            color="secondary"
            small
            @click="changeStatus(item, '0:creating')"
            >取消</v-btn
          >
          <v-btn
            v-if="item.status === '0:creating'"
            color="primary"
            small
            @click="changeStatus(item, '1:draft')"
            >開始</v-btn
          >
          <v-btn
            v-if="item.status === '2:pending'"
            color="primary"
            small
            @click="changeStatus(item, '3:approved')"
            >承認</v-btn
          >
          <v-btn
            v-if="item.status === '3:approved'"
            color="primary"
            small
            @click="changeStatus(item, '4:settled')"
            >精算</v-btn
          >
          <v-btn
            v-if="item.status === '2:pending' || item.status === '3:approved'"
            color="error"
            small
            @click="changeStatus(item, '8:rejected')"
            >差戻</v-btn
          >
        </template>
      </g-data-table>
      <g-dialog-editor
        ref="editor"
        model-id="TransportationCostApplication"
        label="申請データ詳細"
      >
        <template #default="props">
          <g-input-transportation-cost-application
            v-bind="props.attrs"
            v-on="props.on"
          />
        </template>
      </g-dialog-editor>
    </template>
  </g-template-index>
</template>

<style></style>
