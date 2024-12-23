<template>
  <v-container>
    <v-card>
      <v-card-title>MODEL - INPUT</v-card-title>
      <v-card-subtitle>
        INPUTに入力した内容がMODELに反映されることを検証します。
      </v-card-subtitle>
      <v-card-text>
        検証対象のモデルを選択してください。ADDボタンをクリックすることでドキュメントを追加することが可能です。
        <ul>
          <li>モデルへのデータの入力には`g-input-xxxx`を使用します。</li>
          <li>
            データを表示するためのTableには`g-data-table-xxxx`を使用します。
          </li>
        </ul>
      </v-card-text>
      <v-card-text>
        <v-select
          v-model="selectedModel"
          label="select model"
          :items="models"
          return-object
        />
      </v-card-text>
      <v-tabs v-if="instance" v-model="tab">
        <v-tab>INPUT</v-tab>
        <v-tab>TABLE</v-tab>
        <v-tab>RESTORE</v-tab>
      </v-tabs>
      <v-container v-model="valid" fluid>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <component
              :is="inputComponent"
              ref="component"
              :instance="instance"
              outlined
              :edit-mode="editMode"
              @submit:complete="initialize"
              @click:cancel="initialize"
            />
          </v-tab-item>
          <v-tab-item>
            <v-card outlined>
              <v-card-title>TABLE</v-card-title>
              <v-card-text> Firestoreに登録されているデータです。 </v-card-text>
              <component
                :is="tableComponent"
                :items="items"
                :actions="['edit', 'delete']"
                @click:edit="edit($event)"
                @click:delete="del($event)"
              >
              </component>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card outlined>
              <v-card-title>RESTORE</v-card-title>
              <v-card-text>
                論理削除されたデータを復元します。
                <v-text-field v-model="restoreId" label="ドキュメントID" />
              </v-card-text>
              <v-card-actions>
                <v-btn small @click="restore">RESTORE</v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
export default {
  mixins: [GMixinEditModeProvider],
  data() {
    return {
      inputComponent: null,
      items: [],
      models: [
        {
          text: 'Autonumber',
          model: 'Autonumber',
          input: 'GInputAutonumber',
          table: 'GDataTableAutonumbers',
        },
        {
          text: 'Customer',
          model: 'Customer',
          input: 'GInputCustomer',
          table: 'GDataTableCustomers',
        },
        {
          text: 'Employee',
          model: 'Employee',
          input: 'GInputEmployee',
          table: 'GDataTableEmployees',
        },
        {
          text: 'EmployeeContract',
          model: 'EmployeeContract',
          input: 'GInputEmployeeContract',
          table: 'GDataTableEmployeeContracts',
        },
        {
          text: 'Equipment',
          model: 'Equipment',
          input: 'GInputEquipment',
          table: 'GDataTableEquipments',
        },
        {
          text: 'EquipmentTransaction',
          model: 'EquipmentTransaction',
          input: 'GInputEquipmentTransaction',
          table: 'GDataTableEquipmentTransactions',
        },
        {
          text: 'OperationResult',
          model: 'OperationResult',
          input: 'GInputOperationResult',
          table: 'GDataTableOperationResults',
        },
        {
          text: 'OperationBillingBasis',
          model: 'OperationBillingBasis',
          input: 'GInputOperationBillingBasis',
          table: 'GDataTableOperationBillingBases',
        },
        {
          text: 'Outsourcer',
          model: 'Outsourcer',
          input: 'GInputOutsourcer',
          table: 'GDataTableOutsourcers',
        },
        {
          text: 'Site',
          model: 'Site',
          input: 'GInputSite',
          table: 'GDataTableSites',
        },
        {
          text: 'SiteContract',
          model: 'SiteContract',
          input: 'GInputSiteContract',
          table: 'GDataTableSiteContracts',
        },
        {
          text: 'SiteOperationSchedule',
          model: 'SiteOperationSchedule',
          input: 'GInputSiteOperationSchedule',
          table: 'GDataTableSiteOperationSchedules',
        },
        {
          text: 'User',
          model: 'User',
          input: 'GInputUser',
          table: 'GDataTableUsers',
        },
      ],
      instance: null,
      restoreId: null,
      // selectedModel: null,
      selectedModel: {
        text: 'OperationBillingBasis',
        model: 'OperationBillingBasis',
        input: 'GInputOperationBillingBasis',
        table: 'GDataTableOperationBillingBases',
      },
      tab: null,
      tableComponent: null,
      valid: false,
    }
  },
  computed: {},
  watch: {
    selectedModel: {
      async handler(item) {
        if (!item) return
        this.tableComponent = null
        this.inputComponent = null
        this.instance = null
        const Model = require(`~/models/${item.model}`).default
        this.instance = new Model()
        this.inputComponent = (
          await import(`~/components/molecules/inputs/${item.input}.vue`)
        ).default
        this.tableComponent = (
          await import(`~/components/molecules/tables/${item.table}.vue`)
        ).default
        this.items = this.instance.subscribeDocs()
      },
      immediate: true,
    },
  },
  destroyed() {
    if (this.instance) this.instance.unsubscribe()
  },
  methods: {
    initialize() {
      this.instance.initialize()
      this.$refs.component.initialize()
      this.$refs.component.resetValidation()
      this.editMode = this.CREATE
    },
    async addDocument() {
      try {
        await this.instance.create()
        this.instance.initialize()
        this.$refs.form.resetValidation()
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
    async del(item) {
      try {
        await item.delete()
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
    edit(instance) {
      this.instance.initialize(instance.toObject())
      this.tab = 0
      this.editMode = this.UPDATE
    },
    async restore() {
      if (!this.instance || !this.restoreId) return
      try {
        await this.instance.restore(this.restoreId)
        this.restoreId = null
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      }
    },
  },
}
</script>

<style></style>
