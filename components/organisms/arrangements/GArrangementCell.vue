<script>
/**
 * ## GArrangementCell
 *
 * 特定の現場、勤務区分、日付の従業員の配置を行うための draggable コンポーネントです。
 * 配置表テーブルの td に配置されることを前提としています。
 *
 * ### 機能詳細:
 * - date, siteId, workShift を props で受け取ると、Arrangements/${date}/${siteId}/${workShift} への
 *   購読を開始します。
 * - props.assigments に Arrangements/assignments/employees/${date} を受け取ると、
 *   1. 同一日、同一勤務区分で配置されている従業員
 *   2. 同一日、異なる金区分で配置されている従業員
 *   をコンポーネント内で算出します。
 *
 * @author shisyamo4131
 */
import draggable from 'vuedraggable'
import Arrangement from '~/models/Arrangement'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { draggable },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * Arrangements/assignments/employees/{date} を受け取ります。
     * - 従業員の同一日、同一勤務区分配置や連勤状態の確認に使用されます。
     */
    assignments: { type: Object, default: () => ({}), required: false },
    /**
     * 配置された従業員の勤務日です。YYYY-MM-DD 形式の文字列を受け付けます。
     */
    date: { type: String, required: true },
    /**
     * employeeId, siteId, workShift をプロパティとするオブジェクトを受け取ります。
     * - ドラッグ中のオブジェクトを受け付けることができるかどうかの判断に使用されます。
     */
    draggingItem: { type: Object, default: null, required: false },
    /**
     * 省略表示にします。
     */
    ellipsis: { type: Boolean, default: false, required: false },
    /**
     * draggable コンポーネントに適用する group オプションです。
     * - 既定値で name が 'employeeId' に設定されます。
     */
    group: {
      type: Object,
      default: () => {
        return {
          name: 'employeeId',
        }
      },
    },
    /**
     * 現場の取極め情報の配列です。
     * - 現場や勤務区分を限定する必要はありません。コンポーネント内で抽出されます。
     * - 該当する取極め情報が存在すると、従業員を配置した際に上番・下番時間などが設定されます。
     */
    siteContracts: { type: Array, default: () => [], required: false },
    /**
     * 当該コンポーネントが管理する対象の現場IDです。
     */
    siteId: { type: String, required: true },
    /**
     * 当該コンポーネントが管理する対象の勤務区分です。
     */
    workShift: { type: String, required: true },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      // Arrangement クラスのインスタンス用変数です。
      arrangementInstance: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * props.draggingItem をもとに、当該コンポーネントがドロップを
     * 受け付けるかどうかを返します。
     * - draggingItem.employeeId が employeeIds に含まれていない場合は true を返します。
     * - draggingItem.siteId, draggingItem.workShift がともに自身の該当 props と同一であれば true を返します。
     *   -> この条件で true を返さないと、ドラッグした途端、自身のアイテムを受け付けなくなります。
     */
    acceptable() {
      // draggingItem が存在しない場合は無条件に受け付ける
      if (!this.draggingItem) return true

      // draggingItem の中身をプロパティごとに取得
      const { employeeId, siteId, workShift } = this.draggingItem

      // employeeId が存在しない場合は受け付けない
      if (!employeeId) return false

      // 自身の employeeIds に存在しない場合は true
      // -> 同一日、同一勤務区分で employeeId が重複しないため
      if (!this.employeeIds.includes(employeeId)) return true

      // siteId または workShift が存在しない場合は
      if (!siteId || !workShift) return true

      // siteId と workShift が一致するかどうかで判定
      return this.siteId === siteId && this.workShift === workShift
    },

    /**
     * Realtime Database の employeeIndex です。
     * - 自身が管理している従業員IDのリストです。
     */
    employeeIds() {
      return this.arrangementInstance?.data?.employeeIndex || []
    },

    /**
     * Realtime Database の employees です。
     */
    employees() {
      return this.arrangementInstance?.data?.employees || null
    },

    /**
     * 同じ勤務区分で複数の現場に配置されている従業員IDの配列を返します。
     */
    employeeIdsWithMultipleSiteIds() {
      const result = []

      // 各employeeIdを調査
      for (const [employeeId, shifts] of Object.entries(this.assignments)) {
        // 各workShift内でsiteIdの数を確認
        const isMultipleSites = Object.values(shifts).some(
          (siteId) => Object.keys(siteId).length > 1
        )
        if (isMultipleSites) result.push(employeeId)
      }

      return result
    },

    /**
     * 異なる勤務区分で配置が複数ある従業員IDの配列を返します。
     */
    employeeIdsWithDifferentWorkShifts() {
      const result = []

      // 各employeeIdを調査
      for (const [employeeId, shifts] of Object.entries(this.assignments)) {
        // workShiftが2つ以上存在する場合、結果に追加
        if (Object.keys(shifts).length > 1) {
          result.push(employeeId)
        }
      }

      return result
    },

    /**
     * props.siteContracts から適用すべき取極め情報を取得して返します。
     * - 該当する取極め情報がない場合は undefined を返します。
     */
    siteContract() {
      return this.siteContracts
        .filter(
          ({ siteId, workShift }) =>
            siteId === this.siteId && workShift === this.workShift
        )
        .sort((a, b) => b.startDate - a.startDate) // 日付の降順にソート
        .find(({ startDate }) => startDate <= this.date)
    },

    // 動的スタイルの計算プロパティ
    myStyle() {
      return {
        border: '1px solid gray',
        height: '100%',
        minHeight: '84px',
        gap: '8px',
        backgroundColor: !this.acceptable ? 'gray' : 'transparent',
      }
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    /**
     * props.date, siteId, workShift の3つの組み合わせに対する watcher を登録します。
     * - すべての値がセットされている場合 Arrangement クラスをインスタンス化します。
     * - Arrangement クラスはインスタンス化されると Arrangements/${date}/${siteId}/${workShift} に対する購読を開始します。
     */
    this.$watch(
      () => [this.date, this.siteId, this.workShift],
      (value) => {
        const [date, siteId, workShift] = value
        try {
          this.unsubscribe()
          if (!date || !siteId || !workShift) return
          this.arrangementInstance = new Arrangement({
            date,
            siteId,
            workShift,
          })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            '[GArrangementCell] 現場の取極情報の取得時にエラーが発生しました。',
            { date, siteId, workShift, err }
          )
          throw err
        }
      },
      { immediate: true }
    )
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.unsubscribe()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * data.arrangement が null でない場合は unsubscribe() を実行し、
     * data.arrangement を null にします。
     */
    unsubscribe() {
      if (this.arrangementInstance) this.arrangementInstance.unsubscribe()
      this.arrangementInstance = null
    },
    async onChange(event) {
      try {
        // console.log('event received. ', event) // eslint-disable-line no-console
        const { added, moved, removed } = event
        if (added) await this.handleAdd(added)
        if (moved) await this.handleMove(moved)
        if (removed) await this.handleRemove(removed)
      } catch (err) {
        // console.error(err) // eslint-disable-line no-console
        alert(err.message)
      }
    },
    /**
     * 従業員を配置に追加する処理です。
     * - 引数は draggable の event オブジェクトを受け取ります。
     */
    async handleAdd({ element, newIndex }) {
      await this.arrangementInstance.add({
        employeeId: element,
        index: newIndex,
        siteContract: this.siteContract,
      })
    },
    /**
     * 従業員の並びを変更する処理です。
     * - 引数は draggable の event オブジェクトを受け取ります。
     */
    async handleMove({ element, newIndex, oldIndex }) {
      await this.arrangementInstance.move(element, newIndex, oldIndex)
    },
    /**
     * 従業員の配置を削除する処理です。
     * - 引数は draggable の event オブジェクトを受け取ります。
     */
    async handleRemove({ element }) {
      await this.arrangementInstance.remove(element)
    },
    /**
     * ドラッグ開始時のイベントハンドラ
     * - update:dragging-item イベントを emit します。
     */
    onDragStart(event) {
      const index = event.oldIndex
      const employeeId = this.employeeIds[index]
      const siteId = this.siteId
      const workShift = this.workShift
      this.$emit('update:dragging-item', { employeeId, siteId, workShift })
    },
    /**
     * ドラッグ終了時のイベントハンドラ
     * - update:dragging-item イベントを emit します。
     */
    onDragEnd() {
      this.$emit('update:dragging-item', null)
    },
  },
}
</script>

<template>
  <draggable
    v-bind="$attrs"
    :style="myStyle"
    class="pa-2 d-flex flex-column"
    :group="group"
    :value="employeeIds"
    :disabled="!acceptable"
    @change="onChange"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <div v-for="employeeId in employeeIds" :key="employeeId">
      <slot
        name="default"
        v-bind="{
          attrs: {
            arrangement: employees?.[employeeId] || null,
            employeeId,
            ellipsis,
            showError: employeeIdsWithMultipleSiteIds.includes(employeeId),
            showContinuous:
              employeeIdsWithDifferentWorkShifts.includes(employeeId),
          },
          on: {
            'click:remove': () => handleRemove({ element: employeeId }),
          },
        }"
      />
    </div>
  </draggable>
</template>

<style></style>
