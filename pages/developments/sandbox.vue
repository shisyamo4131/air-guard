<template>
  <g-template-default label="配置管理">
    <template #append-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <g-placement-site-register>
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" text v-on="on">
              <v-icon>mdi-plus</v-icon>
              <span>現場追加</span>
            </v-btn>
          </template>
        </g-placement-site-register>
      </v-toolbar-items>
    </template>
    <template #default="{ height }">
      <v-container fluid class="fill-height align-start justify-start">
        <div
          class="overflow-y-auto"
          :style="{
            height: `${height - 24}px`,
            width: `${employeeListWidth}px`,
          }"
        >
          <g-placement-employee-list @selected="selectedEmployee = $event" />
        </div>
        <g-placement-table
          :start-at="startAt"
          :selected-employee="selectedEmployee"
          :height="height - 24"
          :style="{ width: `calc(100% - ${employeeListWidth}px)` }"
          @selected="selectedEmployee = $event"
        />
      </v-container>
      <v-snackbar
        :value="!!hiddenIndex.length"
        :timeout="-1"
        color="error"
        centered
      >
        表示されていない配置情報があります。
        <template #action="{ attrs }">
          <v-btn v-bind="attrs" small @click="addHiddenIndex"> 表示 </v-btn>
        </template>
      </v-snackbar>
    </template>
  </g-template-default>
</template>

<script>
import GPlacementEmployeeList from '~/components/organisms/GPlacementEmployeeList.vue'
import GPlacementSiteRegister from '~/components/organisms/GPlacementSiteRegister.vue'
import GPlacementTable from '~/components/organisms/GPlacementTable.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTemplateDefault,
    GPlacementTable,
    GPlacementEmployeeList,
    GPlacementSiteRegister,
  },
  data() {
    return {
      employeeListWidth: 168,
      startAt: '2023-12-01',
      selectedEmployee: null,
    }
  },
  computed: {
    hiddenIndex() {
      return this.$store.getters['placements/hiddenIndex']
    },
  },
  watch: {},
  methods: {
    addHiddenIndex() {
      this.$store.dispatch('placements/addHiddenIndex')
    },
  },
}
</script>

<style></style>
