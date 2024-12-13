<script>
/**
 * ### GCardEmployee
 *
 * 従業員情報を表示・編集するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - propsはモデルで定義されているものを使用しています。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-09-12 - 初版作成
 */
import GSimpleTableEmployeeBasic from '../tables/GSimpleTableEmployeeBasic.vue'
import GSimpleTableEmployeeAddress from '../tables/GSimpleTableEmployeeAddress.vue'
import GSimpleTableEmployeeContact from '../tables/GSimpleTableEmployeeContact.vue'
import GDataTableEmployeeMedicalCheckups from '../tables/GDataTableEmployeeMedicalCheckups.vue'
import GCardImgEmployee from './GCardImgEmployee.vue'
import Employee from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GSimpleTableEmployeeBasic,
    GSimpleTableEmployeeAddress,
    GSimpleTableEmployeeContact,
    GCardImgEmployee,
    GDataTableEmployeeMedicalCheckups,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof Employee
      },
    },
    medicalCheckups: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      tab: null,
      tabs: ['基本情報', '住所', '連絡先', '健康診断'],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {},
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title
      v-if="!isMobile"
      class="g-card__title d-block text-truncate"
      >{{ instance.fullName }}</v-card-title
    >
    <v-card-subtitle v-if="!isMobile">
      {{ instance.fullNameKana }}
    </v-card-subtitle>
    <v-toolbar dense flat>
      <v-spacer />
      <v-btn disabled icon>
        <v-icon>mdi-printer</v-icon>
      </v-btn>
      <v-btn disabled icon>
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </v-toolbar>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="4" md="4" lg="3">
          <g-card-img-employee :instance="instance" />
        </v-col>
        <v-col cols="12" sm="8" md="8" lg="9">
          <v-card flat outlined>
            <v-tabs v-model="tab" center-active show-arrows grow>
              <v-tab v-for="(title, index) of tabs" :key="index">
                {{ title }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <g-simple-table-employee-basic v-bind="instance" />
              </v-tab-item>
              <v-tab-item>
                <g-simple-table-employee-address v-bind="instance" />
              </v-tab-item>
              <v-tab-item>
                <g-simple-table-employee-contact v-bind="instance" />
              </v-tab-item>
              <v-tab-item>
                <g-data-table-employee-medical-checkups
                  :doc-id="instance.docId"
                  :items="medicalCheckups"
                />
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style></style>
