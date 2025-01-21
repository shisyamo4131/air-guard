<script>
/**
 * 健康診断情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GDialogEmployeeSelector from '~/components/molecules/dialogs/GDialogEmployeeSelector.vue'
import GInputMedicalCheckup from '~/components/molecules/inputs/GInputMedicalCheckup.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import MedicalCheckup from '~/models/MedicalCheckup'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'MedicalCheckupsIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    GInputMedicalCheckup,
    AirArrayManager,
    GBtnRegist,
    GDialogEmployeeSelector,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      items: [],
      schema: new MedicalCheckup(),
      selectedEmployeeId: null,
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    computedSelectedEmployeeId: {
      get() {
        return this.selectedEmployeeId
      },
      set(v) {
        if (!v || !Array.isArray(v) || v.length === 0) {
          this.selectedEmployeeId = null
        } else {
          this.selectedEmployeeId = v[0].docId || null
        }
      },
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    computedSelectedEmployeeId: {
      handler(v) {
        this.subscribe()
      },
      immediate: true,
    },
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
    async handleCreate(item) {
      await item.create()
    },
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },

    /**
     * 健康診断情報の購読を開始します。
     */
    subscribe() {
      this.unsubscribe()
      if (!this.computedSelectedEmployeeId) return
      this.items = this.schema.subscribeDocs([
        ['where', 'employeeId', '==', this.computedSelectedEmployeeId],
      ])
    },

    /**
     * 健康診断情報の購読を解除します。
     */
    unsubscribe() {
      this.schema.unsubscribe()
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container :style="{ height: `${height}px` }">
      <air-array-manager
        :dialog-props="{
          maxWidth: 600,
        }"
        event-edit="click:row"
        :handle-create="handleCreate"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="健康診断情報"
        :schema="schema"
      >
        <template #default="props">
          <v-sheet class="d-flex flex-column" :height="props.height">
            <v-toolbar class="flex-grow-0" :color="props.color" dark dense flat>
              <v-toolbar-title>{{ props.label }}</v-toolbar-title>
            </v-toolbar>
            <v-toolbar class="flex-grow-0" flat>
              <g-dialog-employee-selector
                :items="$store.getters['employees/items']"
                @click:submit="computedSelectedEmployeeId = $event"
              >
                <template #activator="{ attrs, on }">
                  <v-select
                    v-bind="attrs"
                    v-model="computedSelectedEmployeeId"
                    append-icon=""
                    clearable
                    hide-details
                    :items="$store.getters['employees/items']"
                    item-text="fullName"
                    item-value="docId"
                    placeholder="従業員を選択"
                    prepend-inner-icon="mdi-magnify"
                    readonly
                    v-on="on"
                  />
                </template>
              </g-dialog-employee-selector>
              <g-btn-regist
                v-bind="props.activator.attrs"
                icon
                v-on="props.activator.on"
              />
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="props.table.attrs"
                :headers="[
                  { text: 'CODE', value: 'employee.code' },
                  { text: '従業員', value: 'employee.fullName' },
                  { text: '受診日', value: 'date' },
                  { text: '受診機関', value: 'agency' },
                ]"
                hide-default-footer
                v-on="props.table.on"
              >
              </v-data-table>
            </div>
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="10">
                  <v-pagination
                    v-bind="props.pagination.attrs"
                    v-on="props.pagination.on"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-medical-checkup v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
