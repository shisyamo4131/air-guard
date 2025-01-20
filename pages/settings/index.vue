<script>
/**
 * 設定画面です。
 * @author shisyamo4131
 */
import CompanyInfo from '~/models/CompanyInfo'
import AirItemManager from '~/components/air/AirItemManager.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GInputCompanyInfoV2 from '~/components/molecules/inputs/GInputCompanyInfoV2.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'Settings',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    AirItemManager,
    GBtnEdit,
    GInputCompanyInfoV2,
    GTemplateDefault,
  },

  /***************************************************************************
   * ASYNCDATA
   ***************************************************************************/
  asyncData({ app, route }) {
    const instances = {
      companyInfo: new CompanyInfo(),
    }
    return { instances }
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {},

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * メイン情報として表示する項目の配列です。
     */
    mainProps() {
      return [
        { text: '会社名1', value: 'name1' },
        { text: '会社名2', value: 'name2' },
        { text: '郵便番号', value: 'zipcode' },
        { text: '住所', value: 'address1' },
        { text: '建物名・階数', value: 'address2' },
        { text: '電話番号', value: 'tel' },
        { text: 'FAX番号', value: 'fax' },
        { text: '法人番号', value: 'corporateNumber' },
        { text: '代表者名', value: 'executiveName' },
        { text: '代表者肩書', value: 'executiveTitle' },
      ]
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},

  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {},

  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {},

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleUpdate(item) {
      await item.update()
    },
  },
}
</script>

<template>
  <g-template-default>
    <!-- 自社情報 -->
    <v-container>
      <air-item-manager
        disable-delete
        :dialog-props="{ maxWidth: 600 }"
        :handle-update="handleUpdate"
        :item="$store.state['company-info'].item"
        label="自社情報"
      >
        <template #default="defaultProps">
          <v-card>
            <v-card-title>自社情報</v-card-title>
            <v-list>
              <v-list-item v-for="(prop, index) of mainProps" :key="index">
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{ prop.text }}
                  </v-list-item-subtitle>
                  <v-list-item-title>
                    {{ defaultProps.attrs[prop.value] }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-actions class="justify-end">
              <g-btn-edit
                :color="defaultProps.attrs.color"
                icon
                @click="defaultProps.on['click:edit']"
              />
            </v-card-actions>
          </v-card>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-company-info-v-2 v-bind="attrs" v-on="on" />
        </template>
      </air-item-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
