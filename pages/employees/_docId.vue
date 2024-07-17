<script>
/**
 * ### pages.EmployeeDetail
 *
 * 従業員の詳細画面です。
 *
 * @author shisyamo4131
 * @version 1.2.1
 *
 * @updates
 * - version 1.2.1 - 2024-07-17 - ページ遷移に$routeを使用。
 * - version 1.2.0 - 2024-07-16 - GTempleteDetailを使用
 * - version 1.1.0 - 2024-07-03 - 健康診断履歴（EmployeeMedicalCheckups）へのリアルタイムリスナーを実装
 * - version 1.0.0 - xxxx-xx-xx - 初版作成
 *
 */
import GLeaveApplicationCalendar from '~/components/organisms/GLeaveApplicationCalendar.vue'
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GEmployeeCard from '~/components/organisms/GEmployeeCard.vue'
import GTemplateDetail from '~/components/templates/GTemplateDetail.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GDialogEditor from '~/components/molecules/dialogs/GDialogEditor.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeeDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GLeaveApplicationCalendar,
    GCardMap,
    GEmployeeCard,
    GTemplateDetail,
    GInputEmployee,
    GDialogEditor,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const items = {
      medicalCheckups: [],
    }
    const listeners = {
      employee: app.$Employee(),
      medicalCheckup: app.$EmployeeMedicalCheckup({ employeeId: docId }),
    }
    listeners.employee.subscribeDoc(docId)
    items.medicalCheckups = listeners.medicalCheckup.subscribe()
    return { docId, listeners, items }
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    parentPath() {
      return this.$route.path.split('/').slice(0, -1).join('/')
    },
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '従業員', to: this.parentPath, exact: true },
        { text: '従業員詳細', to: `${this.parentPath}/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key].unsubscribe()
    })
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickEdit() {
      const item = JSON.parse(JSON.stringify(this.listeners.employee))
      const editMode = 'UPDATE'
      this.$refs[`employee-editor`].open({ item, editMode })
    },
    onSubmitComplete(event) {
      if (event.editMode === 'DELETE') {
        this.$router.replace(this.parentPath)
      }
    },
  },
}
</script>

<template>
  <g-template-detail
    :actions="[{ event: 'edit', icon: 'mdi-pencil', color: 'green' }]"
    @click:edit="onClickEdit"
  >
    <v-breadcrumbs :items="breadcrumbs" />
    <v-row>
      <v-col cols="12">
        <g-employee-card
          v-bind="listeners.employee"
          outlined
          :medical-checkups="items.medicalCheckups"
        />
      </v-col>
      <v-col cols="12" md="5">
        <g-card-map
          :value="listeners.employee.address1"
          outlined
          height="612"
        />
      </v-col>
      <v-col cols="12" md="7">
        <g-leave-application-calendar
          :employee-id="docId"
          outlined
          height="612"
        />
      </v-col>
    </v-row>
    <!-- editor -->
    <g-dialog-editor
      ref="employee-editor"
      label="従業員"
      model-id="Employee"
      @submit:complete="onSubmitComplete"
    >
      <template #default="{ attrs, on }">
        <g-input-employee v-bind="attrs" v-on="on" />
      </template>
    </g-dialog-editor>
  </g-template-detail>
</template>

<style></style>
