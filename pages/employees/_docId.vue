<script>
// import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GLeaveApplicationCalendar from '~/components/organisms/GLeaveApplicationCalendar.vue'
// import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
import GMapCard from '~/components/organisms/GMapCard.vue'
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
    // GInputEmployee,
    GLeaveApplicationCalendar,
    // GCardSubmitCancel,
    GMapCard,
    GEmployeeCard,
  },
  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const docId = route.params.docId
    const listeners = {
      employee: app.$Employee(),
    }
    listeners.employee.subscribeDoc(docId)
    return { docId, listeners }
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
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <g-employee-card v-bind="listeners.employee" flat outlined />
        </v-col>
        <v-col cols="12" md="5">
          <g-map-card
            :value="listeners.employee.address1"
            flat
            outlined
            height="612"
          />
        </v-col>
        <v-col cols="12" md="7">
          <g-leave-application-calendar :employee-id="docId" flat outlined />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
