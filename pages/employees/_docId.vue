<script>
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
import GLeaveApplicationCalendar from '~/components/organisms/GLeaveApplicationCalendar.vue'
import GCardSubmitCancel from '~/components/molecules/cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeeDetail',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputEmployee,
    GLeaveApplicationCalendar,
    GCardSubmitCancel,
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
      <v-card class="mb-4" flat outlined>
        <v-card-title class="g-card__title">
          {{ listeners.employee.fullName }}
          <v-chip
            v-if="listeners.employee.status === 'expired'"
            class="ml-2"
            color="red"
            label
            x-small
            outlined
          >
            {{ `${$EMPLOYEE_STATUS[listeners.employee.status]}` }}
          </v-chip>
        </v-card-title>
        <v-card-subtitle>
          {{ listeners.employee.fullNameKana }}
        </v-card-subtitle>
        <v-card-text>
          <v-chip-group column>
            <v-chip v-if="listeners.employee.isForeigner" small label>
              {{ listeners.employee.nationality }}
            </v-chip>
            <v-chip v-else small label>日本</v-chip>
            <v-chip small label>
              {{ `${listeners.employee.hireDate} 入社` }}
            </v-chip>
            <v-chip v-if="listeners.employee.leaveDate" small label>
              {{ `${listeners.employee.leaveDate} 退職` }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
        <v-dialog
          v-model="dialog.employee"
          max-width="600"
          persistent
          scrollable
        >
          <template #activator="{ attrs, on }">
            <v-btn
              v-bind="attrs"
              fab
              color="primary"
              top
              right
              absolute
              small
              v-on="on"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <g-card-submit-cancel
            :dialog.sync="dialog.employee"
            label="従業員"
            edit-mode="UPDATE"
            :loading="loading.employee"
            @click:submit="submitEmployee"
          >
            <g-input-employee
              v-bind.sync="editModel.employee"
              edit-mode="UPDATE"
            />
          </g-card-submit-cancel>
        </v-dialog>
      </v-card>
      <v-row>
        <v-col cols="12" md="5">
          <v-card flat outlined>
            <v-card-title class="g-card__title">
              <span>{{ listeners.employee.address1 }}</span>
              <span v-if="listeners.employee.address2" class="ml-2">
                {{ listeners.employee.address2 }}
              </span>
            </v-card-title>
            <v-card-subtitle>
              {{ `〒${listeners.employee.zipcode}` }}
            </v-card-subtitle>
            <v-card-text>
              <iframe
                :src="`https://maps.google.com/maps?output=embed&q=${listeners.employee.address1}&t=m&hl=ja&z=12`"
                width="100%"
                height="auto"
                frameborder="0"
                style="border: 0"
                allowfullscreen=""
              />
              <div>
                <v-icon small left>mdi-cellphone</v-icon>
                {{ listeners.employee.mobile }}
              </div>
              <div>
                <v-icon small left>mdi-phone</v-icon>
                {{ listeners.employee.tel }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <g-leave-application-calendar :employee-id="docId" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style></style>
