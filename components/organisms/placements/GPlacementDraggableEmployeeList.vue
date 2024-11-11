<script>
/**
 * ## GPlacementDraggableEmployeeList
 *
 * 従業員の配置情報を編集、管理するためのコンポーネントです。
 * ルートコンポーネントに vue-draggable を使用しており、従業員情報を表示するためのスロットを提供します。
 *
 * ### props.draggingItem
 * 現在ドラッグ中のオブジェクトです。
 * { employeeId, date, siteId, workShift }
 * 自身からドラッグが開始されるとオブジェクトを生成して update:dragging-item イベント で emit します。
 *
 * ### props.group
 * Draggable に設定される group オプションです。
 * name 属性には `employees-` が接頭辞として強制的に付与されます。
 * { name: YYYY-MM-DD } を受け取り、異なる日付間での D&D を不可能にすることを想定しています。
 *
 * ### props.placement
 * 親コンポーネントで生成された Placement インスタンスです。
 * D&D などによって編集された配置情報を Realtime Database に更新するためのメソッドが提供されます。
 *
 * ### slots.employees
 * employeeOrder の分だけ生成される、配置された従業員情報を表示するコンポーネントのスロットです。
 * 様々な属性と、コンポーネントが emit するイベントの処理を定義しています。
 *
 * ### events.click:edit
 * 配置された従業員情報を表示するコンポーネントの click:edit イベントで emit されるイベントです。
 * 当該従業員情報オブジェクトと、当該オブジェクトを更新するための Realtime Database のパスを含むオブジェクトを emit します。
 *
 * ### events.update:dragging-item
 * 当該コンポーネントでドラッグが発生した場合に emit されるイベントです。
 * 親コンポーネントに対して当該コンポーネントが生成した draggingItem を同期するためのイベントです。
 */
import draggable from 'vuedraggable'
import { Placement } from '~/models/Placement'
export default {
  components: { draggable },

  props: {
    draggingItem: { type: undefined, default: null },
    ellipsis: { type: Boolean, default: false },
    group: { type: Object, default: () => ({}) },
    placement: {
      type: Object,
      validator: (instance) => instance instanceof Placement,
      required: true,
    },
  },

  computed: {
    acceptable() {
      // draggingItem が設定されていなければ true を返す
      if (!this.draggingItem) return true

      // draggingItem から各プロパティを取得
      const { employeeId, date, siteId, workShift } = this.draggingItem

      // 取得したプロパティのどれか1つでも取得できなければ false を返す
      if (!employeeId || !date || !siteId || !workShift) return false

      // employeeId が自身の employeeOrder に含まれていなければ true を返す
      // -> 自身の中で employeeId の重複が発生しないため
      if (!this.employeeOrder.includes(employeeId)) return true

      // date, siteId, workShift が一致していれば true を返す
      // -> そうでないと自身のアイテムを自身が受け付けられなくなってしまう
      return (
        this.placement.date === date &&
        this.placement.siteId === siteId &&
        this.placement.workShift === workShift
      )
    },

    employeeOrder() {
      return this.placement?.data?.employeeOrder || []
    },

    employees() {
      return this.placement?.data?.employees || null
    },

    siteContract() {
      return this.$store.getters['site-order/siteContract']({
        date: this.placement.date,
        siteId: this.placement.siteId,
        workShift: this.placement.workShift,
      })
    },
  },
  methods: {
    /**
     * DraggingItem を作成して返します。
     * @param {Object} 'vue-draggable' の start イベントオブジェクト
     * @return {Object} DraggingItem オブジェクト
     */
    createDraggingItem(event) {
      const index = event.oldIndex
      return {
        employeeId: this.employeeOrder[index],
        date: this.placement.date,
        siteId: this.placement.siteId,
        workShift: this.placement.workShift,
      }
    },

    /**
     * Draggable の change イベントで実行される処理です。
     * - イベントの種類（added, moved, removed）に応じた処理を行います。
     * added: Draggable に新しいオブジェクトが追加された際に発行されます。
     * moved: Draggable 内でオブジェクトの移動があった場合に発行されます。
     * removed: Draggable 内からオブジェクトが削除された際に発行されます。
     */
    async onChange(event) {
      try {
        const { added, moved, removed } = event
        if (added) await this.handleAdd(added)
        if (moved) await this.handleMove(moved)
        if (removed) await this.handleRemove(removed)
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
        alert(err.message)
      }
    },

    /**
     * Draggable の change イベントで種類が added であった場合の処理です。
     * - Placement インスタンスの employee.add メソッドを実行します。
     */
    async handleAdd({ element, newIndex }) {
      const { startTime, endTime, breakMinutes } = this.siteContract || {}
      await this.placement.employee.add({
        employeeId: element,
        index: newIndex,
        startTime,
        endTime,
        breakMinutes,
      })
    },

    /**
     * Draggable の change イベントで種類が moved であった場合の処理です。
     * - Placement インスタンスの employee.move メソッドを実行します。
     */
    async handleMove({ newIndex, oldIndex }) {
      await this.placement.employee.move(newIndex, oldIndex)
    },

    /**
     * Draggable の change イベントで種類が removed であった場合の処理です。
     * - Placement インスタンスの employee.remove メソッドを実行します。
     */
    async handleRemove({ element }) {
      await this.placement.employee.remove(element)
    },

    /**
     * 従業員の編集ボタンがクリックされた時の処理です。
     * - 編集対象の配置従業員のデータオブジェクトを受け取ります。
     * - 編集対象の配置従業員データのパスを生成し、配置従業員データオブジェクトとともに
     *   click:edit イベントを emit します。
     */
    onClickEdit(item) {
      const path = this.placement.getEmployeesPath(item.employeeId)
      this.$emit('click:edit', structuredClone({ item, path }))
    },
  },
}
</script>

<template>
  <draggable
    class="d-flex flex-column pa-2 flex-grow-1"
    style="min-height: 24px; gap: 8px"
    :value="employeeOrder"
    :disabled="!acceptable"
    :group="{ ...group, name: `employees-${group?.name || ''}` }"
    handle=".handle"
    v-bind="{ animation: 300 }"
    @start="$emit('update:dragging-item', createDraggingItem($event))"
    @end="$emit('update:dragging-item', null)"
    @change="onChange"
  >
    <div v-for="employeeId of employeeOrder" :key="employeeId">
      <slot
        name="employees"
        v-bind="{
          attrs: {
            employeeId,
            date: placement.date,
            siteId: placement.siteId,
            workShift: placement.workShift,
            ellipsis,
            startTime: employees?.[employeeId]?.startTime || '',
            endTime: employees?.[employeeId]?.endTime || '',
            isNewEntry: !$store.getters['site-order/hasEmployeeEnteredSite']({
              siteId: placement.siteId,
              employeeId,
            }),
            showError: $store.getters[
              'assignments/isEmployeeAssignedToMultipleSites'
            ](placement.date, employeeId),
            showExist:
              employeeId === draggingItem?.employeeId &&
              placement.date === draggingItem?.date &&
              (placement.siteId !== draggingItem?.siteId ||
                placement.workShift !== draggingItem?.workShift),
            showContinuous: $store.getters[
              'assignments/isEmployeeAssignedToDifferentShifts'
            ](placement.date, employeeId),
          },
          on: {
            'click:edit': () => onClickEdit(employees?.[employeeId] || null),
            'click:remove': () => handleRemove({ element: employeeId }),
          },
        }"
      />
    </div>
  </draggable>
</template>

<style></style>
