<script>
/**
 * 配置管理用のタグコンポーネントです。配置ボードでいうところのマグネットです。
 *
 * - リアルタイムリスナーがセットされた Placement クラスインスタンスを受け取ります。
 *   -> 配置表の1枠を操作するための機能が提供されます。
 * - 内部で Vuex.assignments, Vuex.site-order を利用しています。
 *
 * @author shisyamo4131
 */
import { Placement } from '~/models/Placement'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * リアルタイムリスナーがセットされた Placement クラスインスタンス
     * 配置表の1枠に関するデータを操作できるオブジェクトをイメージしてください。
     */
    placement: {
      type: Object,
      validator: (instance) => instance instanceof Placement,
      required: true,
    },

    /**
     * 従業員ID（または外注先KEY）を受け取ります。
     */
    employeeId: { type: String, default: undefined, required: false },
    outsourcerKey: { type: String, default: undefined, required: false },

    /**
     * 現在ドラッグ中のアイテムを表すオブジェクトを受け取ります。
     * - オブジェクトが内包する情報が自身の情報と一致する場合、エラー表示を行います。
     */
    draggingItem: { type: Object, default: undefined, required: false },

    /**
     * コンポーネントを使用不可にします。
     */
    disabled: { type: Boolean, default: false, required: false },

    /**
     * コンポーネントを省略表示にします。
     */
    ellipsis: { type: Boolean, default: false, required: false },

    /**
     * コンポーネントの表示モードです。
     */
    mode: {
      type: String,
      default: 'placement',
      validator: (mode) => ['placement', 'confirmation'].includes(mode),
      required: false,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 従業員の休暇申請データを Vuex から取得して返します。
     */
    leaveApplication() {
      if (!this.employeeId) return false
      return this.$store.getters['assignments/getEmployeeLeaveApplication'](
        this.placement.date,
        this.employeeId
      )
    },

    /**
     * コンポーネントの外枠の色を定義する css を返します。
     * - props.showError が true の場合、外枠の色は赤になります。
     * - それ以外の場合は props.status に応じた色になります。
     */
    cardStyle() {
      const color =
        this.isDuplicateAssignment || this.leaveApplication
          ? 'red'
          : this.color
          ? getComputedStyle(document.documentElement)
              .getPropertyValue(`--v-${this.color}-base`)
              .trim()
          : 'lightgrey'
      return {
        border: `2px solid ${color}`,
        position: 'relative',
        width: '100%',
      }
    },

    /**
     * 状態チップ、Cardコンポーネントの外枠の色を返します。
     */
    color() {
      if (this.status === 'confirmed') return 'info'
      if (this.status === 'arrived') return 'primary'
      if (this.status === 'leaved') return 'secondary'
      return undefined
    },

    /**
     * Placement クラスインスタンスから従業員（または外注先）の詳細情報オブジェクトを返します。
     * - 該当するものが存在しない場合は null を返します。
     */
    data() {
      if (this.employeeId) {
        return this.placement.data.employees?.[this.employeeId] || null
      }
      if (this.outsourcerKey) {
        return this.placement.data.outsourcers?.[this.outsourcerKey] || null
      }
      return null
    },

    /**
     * Vuex.assignments を利用して同一日別シフトでの配置があるかどうかを返します。
     */
    isContinuousAssignment() {
      if (!this.placement.date || !this.employeeId) return false
      return this.$store.getters[
        'assignments/isEmployeeAssignedToDifferentShifts'
      ](this.placement.date, this.employeeId)
    },

    /**
     * Vuex.assignments を利用して同一シフトでの重複配置があるかどうかを返します。
     */
    isDuplicateAssignment() {
      if (!this.placement.date || !this.employeeId) return false
      return this.$store.getters[
        'assignments/isEmployeeAssignedToMultipleSites'
      ](this.placement.date, this.employeeId)
    },

    /**
     * 現在の配置情報がドラッグ中の項目と一致するかどうかを判定します。
     *
     * - 同一の従業員で、かつ同一の日付であるかどうかを確認します。
     * - 配置先が異なる現場または勤務区分である場合に `true` を返します。
     * - それ以外の場合や、`draggingItem` が未定義の場合は `false` を返します。
     *
     * @return {boolean} - 判定結果。配置先が異なる場合は `true`、それ以外は `false`
     */
    isDraggingItemExist() {
      if (!this.draggingItem) return false

      const isSameEmployee = this.employeeId === this.draggingItem.employeeId
      const isSameDate = this.placement?.date === this.draggingItem.date
      const isDifferentSiteOrShift =
        this.placement?.siteId !== this.draggingItem.siteId ||
        this.placement?.workShift !== this.draggingItem.workShift

      return isSameEmployee && isSameDate && isDifferentSiteOrShift
    },

    /**
     * Vuex.site-order を利用して当該従業員が初めて入場する現場かどうかを返します。
     * - 対象が外注先であった場合は必ず false を返します。
     */
    isNewEntry() {
      if (!this.employeeId || !this.placement.siteId) return false

      // Vuex の getter を使用して、従業員のサイト入場ステータスを確認
      return !this.$store.getters['site-order/hasEmployeeEnteredSite']({
        siteId: this.placement.siteId,
        employeeId: this.employeeId,
      })
    },

    /**
     * タグに表示される名前を取得します。
     * - `employeeId` が指定されている場合、Vuex から従業員名を返します。
     * - `outsourcerKey` が指定されている場合、Vuex から外注先名を返します。
     * - それ以外の場合は 'N/A' を返します。
     */
    label() {
      if (this.employeeId) {
        const employee = this.$store.getters['employees/get'](this.employeeId)
        return employee?.abbr || 'N/A'
      }

      if (this.outsourcerKey) {
        const [outsourcerId] = this.outsourcerKey.split('-')
        const outsourcer = this.$store.getters['outsourcers/get'](outsourcerId)
        return outsourcer?.abbr || 'N/A'
      }

      return 'N/A'
    },

    /**
     * 配置状態を返します。
     * - confirmedAt が存在しなければ `unconfirmed` を返します。
     * - arrivedAt が存在しなければ `confirmed` を返します。
     * - leavedAt が存在しなければ `arrived` を返します。
     * - それ以外は `leaved` を返します。
     */
    status() {
      if (!this.data?.confirmedAt) return 'unconfirmed'
      if (!this.data?.arrivedAt) return 'confirmed'
      if (!this.data?.leavedAt) return 'arrived'
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
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 編集ボタンがクリックされた時の処理です。
     * - `click:edit` イベントを emit します。
     */
    onClickEdit() {
      this.$emit('click:edit', this.data)
    },

    /**
     * 削除ボタンがクリックされた時の処理です。
     * - 従業員（または外注先）の配置を削除します。
     */
    async onClickRemove() {
      this.loading = true
      try {
        if (this.employeeId) {
          await this.placement.employee.remove(this.employeeId)
        } else if (this.outsourcerKey) {
          await this.placement.outsourcer.remove(this.outsourcerKey)
        } else {
          throw new Error('従業員または外注先のどちらも指定されていません。')
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 状態チップがクリックされた時の処理です。
     * - 現在の状態に応じて従業員（または外注先）の状態を更新する処理を実行します。
     */
    async onClickStatus() {
      this.loading = true

      try {
        const { employeeId, outsourcerKey, status } = this

        // 従業員の場合
        if (employeeId) {
          await this.handleEmployeeStatusChange(employeeId, status)
        }
        // 外注先の場合
        else if (outsourcerKey) {
          await this.handleOutsourcerStatusChange(outsourcerKey, status)
        }
        // 両方指定がない場合
        else {
          throw new Error('従業員または外注先が指定されていません。')
        }
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
        alert(err.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 従業員のステータス変更を処理します
     */
    async handleEmployeeStatusChange(employeeId, status) {
      switch (status) {
        case 'unconfirmed':
          await this.placement.employee.confirm(employeeId)
          break
        case 'confirmed':
          await this.placement.employee.arrive({ employeeId })
          break
        case 'arrived':
          await this.placement.employee.leave({ employeeId })
          break
        case 'leaved':
          await this.placement.employee.unconfirm(employeeId)
          break
        default:
          throw new Error('無効なステータスです')
      }
    },

    /**
     * 外注先のステータス変更を処理します
     */
    async handleOutsourcerStatusChange(outsourcerKey, status) {
      switch (status) {
        case 'unconfirmed':
          await this.placement.outsourcer.confirm(outsourcerKey)
          break
        case 'confirmed':
          await this.placement.outsourcer.arrive({ outsourcerKey })
          break
        case 'arrived':
          await this.placement.outsourcer.leave({ outsourcerKey })
          break
        case 'leaved':
          await this.placement.outsourcer.unconfirm(outsourcerKey)
          break
        default:
          throw new Error('無効なステータスです')
      }
    },
  },
}
</script>

<template>
  <v-card
    :color="isDraggingItemExist ? 'red' : undefined"
    min-width="190"
    :style="cardStyle"
  >
    <!-- 新規アイコン -->
    <v-icon
      v-if="isNewEntry && !!employeeId"
      right
      color="error"
      style="position: absolute; top: -12px; left: -24px"
      >mdi-new-box</v-icon
    >

    <v-card-text
      :class="[ellipsis ? 'pa-1' : 'pa-2', 'd-flex', 'overflow-hidden']"
    >
      <div class="d-flex flex-column flex-grow-1 overflow-hidden">
        <div class="d-flex align-center">
          <!-- 削除ボタン -->
          <v-btn
            v-if="!disabled"
            class="mr-1"
            :disabled="loading"
            icon
            :loading="loading"
            x-small
            @click="onClickRemove"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>

          <!-- エラーアイコン -->
          <v-icon v-if="isDuplicateAssignment" left color="error" small>
            mdi-alert-circle
          </v-icon>

          <!-- 連勤アイコン -->
          <v-icon v-else-if="isContinuousAssignment" left small color="warning">
            mdi-star
          </v-icon>

          <!-- 休暇申請存在アイコン & ツールチップ -->
          <v-tooltip v-if="leaveApplication" top>
            <template #activator="{ attrs, on }">
              <v-icon v-bind="attrs" color="error" left small v-on="on"
                >mdi-account-off</v-icon
              >
            </template>
            <span>{{ leaveApplication.remarks }}</span>
          </v-tooltip>

          <!-- 名前 -->
          <div class="d-flex flex-grow-1 overflow-hidden">
            <h4
              :class="{
                'pl-1': disabled,
                'text-truncate': true,
                'red--text': !!outsourcerKey,
              }"
              style="padding-top: 2px"
            >
              {{ label }}
            </h4>
          </div>
        </div>
        <!-- 開始時刻, 終了時刻, 編集ボタン -->
        <div v-show="!ellipsis">
          <div class="d-flex flex-grow-1 align-center">
            <v-icon left small>mdi-clock-outline</v-icon>
            <div>{{ data?.startTime || '' }}</div>
            <div>-</div>
            <div>{{ data?.endTime || '' }}</div>
            <v-btn
              v-if="mode === 'placement' && !disabled"
              class="ml-1"
              icon
              x-small
              @click="onClickEdit"
            >
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- ハンドルアイコン -->
      <v-icon v-if="mode === 'placement' && !disabled" class="handle">
        mdi-arrow-all
      </v-icon>

      <!-- 状態チップ -->
      <v-chip
        v-if="mode === 'confirmation' && !disabled"
        class="align-self-center flex-shrink-0"
        :color="color"
        :disabled="loading"
        x-small
        @click="onClickStatus"
      >
        {{ statusLabel }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<style></style>
