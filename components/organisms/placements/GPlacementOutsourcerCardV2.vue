<script>
/**
 * OutsourcerCard component for placements.
 * This component displays an outsourcer card with optional icons for continuous service or error.
 * It includes a start and end time, and options to edit or remove the card.
 *
 * - emits 'click:edit' event when edit-button is clicked.
 * - emits 'click:remove' event when edit-button is clicked.
 * - 状態チップをクリックすると click:status イベントが emit されます。
 */

export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    // Display the text in an abbreviated format if true
    ellipsis: { type: Boolean, default: false },
    // Target Outsourcer KEY
    outsourcerKey: { type: String, required: true },
    // End time in HH:MM format
    endTime: { type: String, default: '' },
    // Start time in HH:MM format
    startTime: { type: String, default: '' },

    /**
     * チップの表示モードを切り替えます。
     * placement: 配置モードです。移動のためのアイコンと編集のためのボタンが表示されます。
     * confirmation: 確認モードです。配置確認、上番・下番などの切り替えボタンが表示されます。
     */
    mode: {
      type: String,
      default: 'placement',
      validator: (mode) => ['placement', 'confirmation'].includes(mode),
      required: false,
    },

    confirmedAt: { type: String, default: undefined, required: false },
    arrivedAt: { type: String, default: undefined, required: false },
    leavedAt: { type: String, default: undefined, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネントの外枠の色を定義する css を返します。
     * - props.showError が true の場合、外枠の色は赤になります。
     * - それ以外の場合は props.status に応じた色になります。
     */
    cardStyle() {
      const color = this.showError
        ? 'red'
        : this.color
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(`--v-${this.color}-base`)
            .trim()
        : 'lightgrey'
      return {
        border: `1px solid ${color}`,
      }
    },

    /**
     * 状態チップ、Cardコンポーネントの外枠の色です。
     */
    color() {
      if (this.status === 'confirmed') return 'info'
      if (this.status === 'arrived') return 'primary'
      if (this.status === 'leaved') return 'secondary'
      return undefined
    },

    status() {
      if (!this.confirmedAt) return 'unconfirmed'
      if (!this.arrivedAt) return 'confirmed'
      if (!this.leavedAt) return 'arrived'
      return 'leaved'
    },

    /**
     * 状態チップのラベルです。
     */
    statusLabel() {
      if (this.status === 'confirmed') return '確認済'
      if (this.status === 'arrived') return '上番済'
      if (this.status === 'leaved') return '下番済'
      return '未確認'
    },

    outsourcerId() {
      return this.outsourcerKey.split('-')?.[0] || undefined
    },
    /**
     * Retrieve the outsourcer object from Vuex using the outsourcer ID.
     */
    outsourcer() {
      return this.$store.getters['outsourcers/get'](this.outsourcerId) || {}
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" :style="cardStyle" v-on="$listeners">
    <v-card-text :class="ellipsis ? 'pa-1' : 'pa-2'">
      <div class="d-flex">
        <div>
          <div class="d-flex align-center">
            <!-- 削除ボタン -->
            <v-btn icon x-small @click="$emit('click:remove')">
              <v-icon small>mdi-close</v-icon>
            </v-btn>

            <!-- 名前 -->
            <h4
              class="text-truncate red--text"
              style="max-width: 120px; padding-top: 2px"
            >
              {{ outsourcer?.abbr || 'N/A' }}
            </h4>
          </div>

          <!-- 開始時刻, 終了時刻, 編集ボタン -->
          <div v-show="!ellipsis">
            <div class="d-flex flex-grow-1 align-center">
              <v-icon left small>mdi-clock-outline</v-icon>
              <div>{{ startTime }}</div>
              <div>-</div>
              <div>{{ endTime }}</div>
              <v-btn
                v-if="mode === 'placement'"
                class="ml-1"
                icon
                x-small
                @click="$emit('click:edit')"
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- ハンドルアイコン -->
        <v-icon v-if="mode === 'placement'" class="handle ml-auto">
          mdi-arrow-all
        </v-icon>

        <!-- 状態チップ -->
        <v-chip
          v-else
          class="ml-auto align-self-center"
          :color="color"
          x-small
          @click="$emit('click:status', { outsourcerKey, status })"
        >
          {{ statusLabel }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<style>
/* Add custom styling here as needed */
</style>
