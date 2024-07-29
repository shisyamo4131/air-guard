<script>
/**
 * ## GSiteOperationScheduleHistory
 *
 * 現場の稼働予定の変更履歴を表示するコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-29 - 初版作成
 */
import { onChildAdded, ref } from 'firebase/database'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    siteId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      listener: null,
      nonce: 0,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    sortedItems() {
      return this.items.slice().reverse()
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    siteId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        if (!newVal) return
        this.items.splice(0)
        this.nonce = 0
        this.subscribe()
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    if (this.listener) this.listener()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      const dbRef = ref(
        this.$database,
        `History/SiteOperationSchedules/${this.siteId}`
      )
      this.listener = onChildAdded(dbRef, (snapshot) => {
        const timestamp = this.$dayjs(
          snapshot.key.split('-')[0],
          'YYYYMMDDHHmmss'
        )
        const type = snapshot.val().type
        this.items.push({
          ...snapshot.val(),
          id: snapshot.key,
          timestamp: timestamp.format('YYYY-MM-DD HH:mm:ss'),
          headerClass: type === 'delete' ? 'text-decoration-line-through' : '',
          chip:
            type === 'create' ? '作成' : type === 'update' ? '更新' : '削除',
          chipColor:
            type === 'create'
              ? 'primary'
              : type === 'update'
              ? 'secondary'
              : 'error',
        })
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-container>
      <v-timeline dense>
        <v-slide-x-transition group>
          <v-timeline-item v-for="item of sortedItems" :key="item.id" small>
            <v-card outlined>
              <v-card-text class="pa-2">
                <div class="d-flex justify-space-between">
                  <div>
                    <span>{{ `対象: ` }}</span>
                    <span :class="item.headerClass">{{ item.date }}</span>
                  </div>
                  <v-chip :color="item.chipColor" x-small label>
                    {{ item.chip }}
                  </v-chip>
                </div>
                <div class="mb-2">
                  <div>
                    <span>{{ `内容: ` }}</span>
                    <span :class="item.headerClass">{{
                      `${$WORK_SHIFT[item.workShift]} ${
                        item.requiredWorkers
                      }名 ${item.qualification ? '資格あり' : '資格なし'}`
                    }}</span>
                  </div>
                </div>
                <v-divider class="mb-2" />
                <div v-if="item.remarks && item.type !== 'delete'">
                  <div>
                    {{ item.remarks }}
                  </div>
                  <v-divider class="my-2" />
                </div>
                <div class="text-caption d-flex flex-column">
                  <div class="align-self-end">
                    {{ `${item.timestamp}` }}
                  </div>
                  <div class="align-self-end">
                    {{ `${item.uid}さん` }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-slide-x-transition>
      </v-timeline>
    </v-container>
  </v-card>
</template>

<style></style>
