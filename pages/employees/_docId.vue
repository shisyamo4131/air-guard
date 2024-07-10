<script>
/**
 * ### pages.EmployeeDetail
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * 更新履歴:
 * version 1.0.1 - 2024-07-03
 *  - 健康診断履歴（EmployeeMedicalCheckups）へのリアルタイムリスナーを実装。EmployeeCardに引き渡すように。
 */
import GLeaveApplicationCalendar from '~/components/organisms/GLeaveApplicationCalendar.vue'
import GCardMap from '~/components/molecules/cards/GCardMap.vue'
import GEmployeeCard from '~/components/organisms/GEmployeeCard.vue'
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
    return {
      dialog: {
        employee: false,
      },
      editModel: {
        employee: this.$Employee(),
      },
      loading: {
        employee: false,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    breadcrumbs() {
      return [
        { text: 'TOP', to: '/' },
        { text: '従業員', to: '/employees', exact: true },
        { text: '従業員詳細', to: `/employees/${this.docId}` },
      ]
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    'dialog.employee'(v) {
      if (v) {
        this.editModel.employee.initialize(this.listeners.employee)
      } else {
        this.editModel.employee.initialize()
      }
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
    async submitEmployee() {
      try {
        this.loading.employee = true
        await this.editModel.employee.update()
        this.dialog.employee = false
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading.employee = false
      }
    },
  },
}
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-container>
      <v-row>
        <v-col cols="12">
          <g-employee-card
            v-bind="listeners.employee"
            flat
            outlined
            :medical-checkups="items.medicalCheckups"
          />
        </v-col>
        <v-col cols="12" md="5">
          <g-card-map
            :value="listeners.employee.address1"
            flat
            outlined
            height="612"
          />
        </v-col>
        <v-col cols="12" md="7">
          <g-leave-application-calendar
            :employee-id="docId"
            flat
            outlined
            height="612"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
