<script>
/**
 * ### pages.EmployeeIndex
 *
 * @author shisyamo4131
 * @create 2024-06-28
 * @version 1.0.0
 */
import { where } from 'firebase/firestore'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GDataTableEmployees from '~/components/molecules/tables/GDataTableEmployees.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import GDialogEditorEmployee from '~/components/molecules/dialogs/GDialogEditorEmployee.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputEmployee from '~/components/molecules/inputs/GInputEmployee.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'EmployeesIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateIndex,
    GDataTableEmployees,
    GSwitch,
    GDialogEditorEmployee,
    GBtnRegistIcon,
    GInputEmployee,
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      includesExpired: false,
      itemsExpired: [],
      loading: false,
      search: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      if (this.includesExpired) {
        return this.$store.state.employees.items.concat(this.itemsExpired)
      } else {
        return this.$store.state.employees.items
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    includesExpired(v) {
      !v || this.fetchExpired()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async fetchExpired() {
      if (this.itemsExpired.length) return
      this.loading = true
      try {
        const model = this.$Employee()
        this.itemsExpired = await model.fetchDocs(undefined, [
          where('status', '==', 'expired'),
        ])
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <g-template-index :items="items" extend :search.sync="search">
    <template #append-search>
      <g-dialog-editor-employee>
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon v-bind="attrs" color="primary" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-employee v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor-employee>
    </template>
    <template #extension>
      <g-switch v-model="includesExpired" hide-details label="退職者を含める" />
    </template>
    <template #default="{ attrs, on }">
      <g-data-table-employees
        v-bind="attrs"
        :loading="loading"
        :search="search"
        @click:row="$router.push(`/employees/${$event.docId}`)"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
