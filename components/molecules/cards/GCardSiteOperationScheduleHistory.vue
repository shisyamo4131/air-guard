<script>
/**
 * ## GCardSiteOperationScheduleHistory
 *
 * 現場稼働予定の履歴（1件）を表示するCardコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-30 - 初版作成
 */
import ja from 'dayjs/locale/ja'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    id: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
    docId: { type: String, default: '', required: false },
    qualification: { type: Boolean, default: false, required: false },
    remarks: { type: String, default: '', required: false },
    requiredWorkers: { type: Number, default: null, required: false },
    type: {
      type: String,
      default: 'create',
      validator: (v) => ['create', 'update', 'delete'].includes(v),
      required: false,
    },
    uid: { type: String, default: '', required: false },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
    before: { type: Object, default: null, required: false },
    startTime: { type: String, default: '', required: false },
    endTime: { type: String, default: '', required: false },
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    chip() {
      if (this.type === 'create') {
        return { text: '作成', color: 'primary' }
      } else if (this.type === 'update') {
        return { text: '更新', color: 'secondary' }
      } else if (this.type === 'delete') {
        return { text: '削除', color: 'error' }
      } else {
        return { text: '---', color: undefined }
      }
    },
    displayDate() {
      return this.$dayjs(this.date).locale(ja).format('MM月DD日(dd)')
    },
    name() {
      return this.$store.getters['users/name'](this.uid)
    },
    timestamp() {
      const timestamp = this.id.split('-')[0]
      const result = this.$dayjs(timestamp, 'YYYYMMDDHHmmss').format(
        'YYYY-MM-DD HH:mm:ss'
      )
      return result
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" outlined v-on="$listeners">
    <v-card-text class="pa-2">
      <v-chip
        :color="chip.color"
        x-small
        label
        style="position: absolute; right: 8px"
      >
        {{ chip.text }}
      </v-chip>
      <div class="text-subtitle-2 font-weight-bold align-self-center mr-2">
        {{ displayDate }}
      </div>
      <div class="mb-2">
        <div>
          <span>{{ `区分: ` }}</span>
          <span>{{ `${$WORK_SHIFT[workShift]}` }}</span>
        </div>
        <div v-if="type === 'create'">
          <div>
            <span>{{ `開始: ` }}</span>
            <span>{{ `${startTime}` }}</span>
          </div>
          <div>
            <span>{{ `終了: ` }}</span>
            <span>{{ `${endTime}` }}</span>
          </div>
          <div>
            <span>{{ `人数: ` }}</span>
            <span>{{ `${requiredWorkers}名` }}</span>
          </div>
          <div>
            <span>{{ `資格: ` }}</span>
            <span>{{ `${qualification ? 'あり' : 'なし'}` }}</span>
          </div>
        </div>
        <div v-if="type === 'update'">
          <div>
            <span>{{ `開始: ` }}</span>
            <span v-if="before.startTime !== startTime">
              <span class="text-decoration-line-through">
                {{ `${before.startTime}` }}
              </span>
              <v-icon small>mdi-chevron-right</v-icon>
            </span>
            <span>{{ `${startTime}` }}</span>
          </div>
          <div>
            <span>{{ `終了: ` }}</span>
            <span v-if="before.endTime !== endTime">
              <span class="text-decoration-line-through">
                {{ `${before.endTime}` }}
              </span>
              <v-icon small>mdi-chevron-right</v-icon>
            </span>
            <span>{{ `${endTime}` }}</span>
          </div>
          <div>
            <span>{{ `人数: ` }}</span>
            <span v-if="before.requiredWorkers !== requiredWorkers">
              <span class="text-decoration-line-through">
                {{ `${before.requiredWorkers}名` }}
              </span>
              <v-icon small>mdi-chevron-right</v-icon>
            </span>
            <span>{{ `${requiredWorkers}名` }}</span>
          </div>
          <div>
            <span>{{ `資格: ` }}</span>
            <span v-if="before.qualification !== qualification">
              <span class="text-decoration-line-through">
                {{ `${before.qualification ? 'あり' : 'なし'}` }}
              </span>
              <v-icon small>mdi-chevron-right</v-icon>
            </span>
            <span>
              {{ `${qualification ? 'あり' : 'なし'}` }}
            </span>
          </div>
        </div>
        <div v-if="type === 'delete'">
          <div>
            <span>{{ `開始: ` }}</span>
            <span class="text-decoration-line-through">
              {{ `${startTime}` }}
            </span>
          </div>
          <div>
            <span>{{ `終了: ` }}</span>
            <span class="text-decoration-line-through">
              {{ `${endTime}` }}
            </span>
          </div>
          <div>
            <span>{{ `人数: ` }}</span>
            <span class="text-decoration-line-through">
              {{ `${requiredWorkers}名` }}
            </span>
          </div>
          <div>
            <span>{{ `資格: ` }}</span>
            <span class="text-decoration-line-through">
              {{ `${qualification ? 'あり' : 'なし'}` }}
            </span>
          </div>
        </div>
      </div>
      <v-divider class="mb-2" />
      <div v-if="remarks && type !== 'delete'">
        <div>{{ remarks }}</div>
        <v-divider class="my-2" />
      </div>
      <div class="text-caption d-flex flex-column">
        <div class="align-self-end">{{ `${timestamp}` }}</div>
        <div class="align-self-end">{{ `${name}さん` }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style></style>
