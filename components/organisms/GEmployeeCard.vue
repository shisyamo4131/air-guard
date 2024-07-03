<script>
/**
 * ### GEmployeeCard
 *
 * 従業員情報を表示・編集するためのCardコンポーネントです。
 *
 * 機能詳細:
 * - propsはモデルで定義されているものを使用しています。
 *
 * @author shisyamo4131
 * @create 2024-06-28
 * @version 2.1.0
 *
 * 更新履歴:
 * version 2.1.0 - 2024-07-03
 *  - 健康診断履歴（EmployeeMedicalCheckups）をpropsで受け付けるように追加。
 *  - 健康診断履歴を表示するためにGDataTableEmployeeMedicalCheckupsを追加。
 *  - VTabにcenter-active、show-arrowsを追加。
 *
 * version 2.0.0 - 2024-07-02
 *  - 全体的に改修。写真の表示準備と登録情報を細かく確認できるように。
 *  - 切り分けられるコンポーネントを外部に。
 *
 * version 1.1.0 - 2024-07-01
 * - 入社日を表示
 */
import GSimpleTableEmployeeBasic from '../molecules/tables/GSimpleTableEmployeeBasic.vue'
import GSimpleTableEmployeeAddress from '../molecules/tables/GSimpleTableEmployeeAddress.vue'
import GSimpleTableEmployeeContact from '../molecules/tables/GSimpleTableEmployeeContact.vue'
import GCardImgEmployee from '../molecules/cards/GCardImgEmployee.vue'
import GDataTableEmployeeMedicalCheckups from '../molecules/tables/GDataTableEmployeeMedicalCheckups.vue'
import { props } from '~/models/Employee'
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
  mixins: [props],
  props: {
    docId: { type: String, required: true },
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
  methods: {
    // onClickEdit() {
    //   this.$refs[`employee-editor`].open({
    //     item: this.$props,
    //     editMode: 'UPDATE',
    //   })
    // },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title
      v-if="!isMobile"
      class="g-card__title d-block text-truncate"
      >{{ fullName }}</v-card-title
    >
    <v-card-subtitle v-if="!isMobile">{{ fullNameKana }}</v-card-subtitle>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="4" md="4" lg="3">
          <g-card-img-employee v-bind="$props" />
        </v-col>
        <v-col cols="12" sm="8" md="8" lg="9">
          <v-card flat outlined>
            <v-tabs v-model="tab" center-active show-arrows>
              <v-tab v-for="(title, index) of tabs" :key="index">
                {{ title }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <g-simple-table-employee-basic v-bind="$props" />
              </v-tab-item>
              <v-tab-item>
                <g-simple-table-employee-address v-bind="$props" />
              </v-tab-item>
              <v-tab-item>
                <g-simple-table-employee-contact v-bind="$props" />
              </v-tab-item>
              <v-tab-item>
                <g-data-table-employee-medical-checkups
                  :doc-id="docId"
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
