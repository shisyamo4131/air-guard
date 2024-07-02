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
 * @version 1.1.0
 *
 * 更新履歴:
 * version 2.0.0 - 2024-07-02
 * - 全体的に改修。写真の表示準備と登録情報を細かく確認できるように。
 * version 1.1.0 - 2024-07-01
 * - 入社日を表示
 */
import ja from 'dayjs/locale/ja'
import { props } from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {},
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [props],
  props: {
    fullName: { type: String, default: '', required: false },
    fullNameKana: { type: String, default: '', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      img: require('@/static/now-printing.png'),
      tab: null,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    age() {
      const from = this.$dayjs(this.birth)
      const to = this.$dayjs()
      return to.diff(from, 'y')
    },
    birthJa() {
      return this.$dayjs(this.birth).locale(ja).format('YYYY年MM月DD日')
    },
    hireDateJa() {
      return this.$dayjs(this.hireDate).locale(ja).format('YYYY年MM月DD日')
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
        <v-col cols="12" sm="5" md="4" lg="3">
          <v-card flat>
            <v-chip
              v-if="leaveDate"
              style="position: absolute; z-index: 3; top: 8px; left: 8px"
              color="warning"
              label
              small
              >退職</v-chip
            >
            <v-img :src="img" contain class="align-end">
              <v-sheet
                v-if="isMobile"
                class="white--text"
                color="rgb(0,0,0,.5)"
              >
                <v-card-title class="g-card__title d-block text-truncate">{{
                  fullName
                }}</v-card-title>
                <v-card-subtitle>{{ fullNameKana }}</v-card-subtitle>
              </v-sheet>
            </v-img>
            <v-btn
              disabled
              fab
              x-small
              color="primary"
              style="position: absolute; top: 12px; right: 12px; z-index: 3"
            >
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </v-card>
        </v-col>
        <v-col>
          <v-card flat outlined>
            <v-tabs v-model="tab">
              <v-tab>基本</v-tab>
              <v-tab>住所</v-tab>
              <v-tab>連絡先</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-simple-table class="info-table">
                  <tbody>
                    <tr>
                      <td>CODE</td>
                      <td>{{ code }}</td>
                    </tr>
                    <tr>
                      <td>入社日</td>
                      <td>{{ hireDateJa }}</td>
                    </tr>
                    <tr>
                      <td>生年月日</td>
                      <td>{{ birthJa }}</td>
                    </tr>
                    <tr>
                      <td>年齢</td>
                      <td>{{ `${age} 歳` }}</td>
                    </tr>
                    <tr>
                      <td>性別</td>
                      <td>
                        <v-icon
                          :color="gender === 'male' ? 'blue' : 'pink'"
                          small
                          >{{ `mdi-gender-${gender}` }}</v-icon
                        >{{ `${gender === 'male' ? '男性' : '女性'}` }}
                      </td>
                    </tr>
                    <tr>
                      <td>血液型</td>
                      <td>未登録</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-tab-item>
              <v-tab-item>
                <v-simple-table class="info-table">
                  <tbody>
                    <tr>
                      <td>郵便番号</td>
                      <td>{{ zipcode }}</td>
                    </tr>
                    <tr>
                      <td>住所1</td>
                      <td>{{ address1 }}</td>
                    </tr>
                    <tr>
                      <td>住所2</td>
                      <td>{{ address2 }}</td>
                    </tr>
                    <tr>
                      <td>送付先住所</td>
                      <td>
                        {{ hasSendAddress ? '上記と異なる' : '登録住所' }}
                      </td>
                    </tr>
                    <tr v-if="hasSendAddress">
                      <td>郵便番号</td>
                      <td>{{ sendZipcode }}</td>
                    </tr>
                    <tr v-if="hasSendAddress">
                      <td>住所1</td>
                      <td>{{ sendAddress1 }}</td>
                    </tr>
                    <tr v-if="hasSendAddress">
                      <td>住所2</td>
                      <td>{{ sendAddress2 }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-tab-item>
              <v-tab-item>
                <v-simple-table class="info-table">
                  <tbody>
                    <tr>
                      <td>電話番号</td>
                      <td>{{ tel }}</td>
                    </tr>
                    <tr>
                      <td>携帯番号</td>
                      <td>{{ mobile }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style scoped>
.info-table td:nth-child(2) {
  text-align: right;
}
</style>
