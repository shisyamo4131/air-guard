<template>
  <v-container>
    <v-card>
      <v-card-title>sandbox</v-card-title>
      <v-container>
        <g-dialog-selector-customer @selected="customerId = $event.docId">
          <template #activator="{ attrs, on }">
            <g-document-manager-customer
              v-slot="{ item, loading }"
              :doc-id="customerId"
              type="fetch"
            >
              <v-text-field
                v-bind="attrs"
                :value="item.abbr"
                :loading="loading"
                v-on="on"
              />
            </g-document-manager-customer>
          </template>
        </g-dialog-selector-customer>
        <g-dialog-selector-site @selected="siteId = $event.docId">
          <template #activator="{ attrs, on }">
            <g-document-manager-site
              v-slot="{ item, loading }"
              :doc-id="siteId"
              type="fetch"
            >
              <v-text-field
                v-bind="attrs"
                :value="item.abbr"
                :loading="loading"
                v-on="on"
              />
            </g-document-manager-site>
          </template>
        </g-dialog-selector-site>
        <g-dialog-selector-employee
          multiple
          :items="employees"
          @selected="employeeId = $event.docId"
        >
          <template #activator="{ attrs, on }">
            <g-document-manager-employee
              v-slot="{ item, loading }"
              :doc-id="employeeId"
              type="fetch"
            >
              <v-text-field
                v-bind="attrs"
                :value="item.fullName"
                :loading="loading"
                v-on="on"
              />
            </g-document-manager-employee>
          </template>
        </g-dialog-selector-employee>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import GDocumentManagerCustomer from '~/components/managers/GDocumentManagerCustomer.vue'
import GDocumentManagerEmployee from '~/components/managers/GDocumentManagerEmployee.vue'
import GDocumentManagerSite from '~/components/managers/GDocumentManagerSite.vue'
import GDialogSelectorCustomer from '~/components/molecules/dialogs/GDialogSelectorCustomer.vue'
import GDialogSelectorEmployee from '~/components/molecules/dialogs/GDialogSelectorEmployee.vue'
import GDialogSelectorSite from '~/components/molecules/dialogs/GDialogSelectorSite.vue'
import Employee from '~/models/Employee'
export default {
  components: {
    GDialogSelectorCustomer,
    GDocumentManagerCustomer,
    GDialogSelectorSite,
    GDialogSelectorEmployee,
    GDocumentManagerEmployee,
    GDocumentManagerSite,
  },
  async asyncData() {
    const employeeInstance = new Employee()
    const employees = await employeeInstance.fetchDocs([
      ['where', 'status', '==', 'active'],
    ])
    return { employees }
  },

  data() {
    return {
      customerId: null,
      siteId: null,
      employeeId: null,
    }
  },
}
</script>

<style></style>
