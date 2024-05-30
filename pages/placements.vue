<template>
  <g-template-default label="配置管理">
    <template #append-toolbar>
      <g-menu-date-picker v-model="startAt">
        <template #activator="{ attrs, on }">
          <g-text-field
            v-bind="attrs"
            class="ml-4 center-input"
            style="max-width: 180px"
            hide-details
            v-on="on"
          />
        </template>
      </g-menu-date-picker>
      <v-spacer />
      <v-toolbar-items>
        <g-placement-employee-register>
          <template #activator="{ attrs, on }">
            <v-btn v-bind="attrs" text v-on="on">
              <v-icon>mdi-plus</v-icon>
              <span>従業員追加</span>
            </v-btn>
          </template>
        </g-placement-employee-register>
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
          class="overflow-y-auto d-flex"
          :style="{
            height: `${height - 24}px`,
            width: `${employeeListWidth}px`,
          }"
        >
          <g-first-char v-model="firstChar" />
          <g-placement-employee-list
            :reg-exp="$CHAR_REGEXP[firstChar]"
            @selected="selectedEmployee = $event"
          />
        </div>
        <g-placement-table
          :start-at="startAt"
          :selected-employee="selectedEmployee"
          :height="height - 24"
          :style="{ width: `calc(100% - ${employeeListWidth}px)` }"
        />
      </v-container>
      <v-snackbar
        :value="!!requiredIndex.length || !!hiddenIndex.length"
        :timeout="-1"
        color="error"
        centered
      >
        表示されていない配置情報があります。
        <template #action="{ attrs }">
          <v-btn v-bind="attrs" small @click="showHiddenOrRequiredIndex">
            表示
          </v-btn>
        </template>
      </v-snackbar>
    </template>
  </g-template-default>
</template>

<script>
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GFirstChar from '~/components/molecules/GFirstChar.vue'
import GMenuDatePicker from '~/components/molecules/menus/GMenuDatePicker.vue'
import GPlacementEmployeeList from '~/components/organisms/GPlacementEmployeeList.vue'
import GPlacementEmployeeRegister from '~/components/organisms/GPlacementEmployeeRegister.vue'
import GPlacementSiteRegister from '~/components/organisms/GPlacementSiteRegister.vue'
import GPlacementTable from '~/components/organisms/GPlacementTable.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTemplateDefault,
    GPlacementTable,
    GPlacementEmployeeList,
    GMenuDatePicker,
    GTextField,
    GPlacementEmployeeRegister,
    GPlacementSiteRegister,
    GFirstChar,
  },
  data() {
    return {
      employeeListWidth: 168,
      firstChar: null,
      startAt: this.$dayjs().add(1, 'day').format('YYYY-MM-DD'),
      selectedEmployee: null,
    }
  },
  computed: {
    hiddenIndex() {
      return this.$store.getters['placements/hiddenIndex']
    },
    requiredIndex() {
      return this.$store.getters['placements/requiredIndex']
    },
  },
  watch: {},
  methods: {
    async showHiddenOrRequiredIndex() {
      if (this.requiredIndex.length) {
        await this.$store.dispatch('placements/addRequiredIndex')
      }
      if (this.hiddenIndex.length) {
        await this.$store.dispatch('placements/showHiddenIndex')
      }
    },
  },
}
</script>

<style></style>
