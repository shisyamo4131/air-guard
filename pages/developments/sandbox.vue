<template>
  <v-container>
    <v-card>
      <v-card-title
        v-if="!isMobile"
        class="g-card__title d-block text-truncate"
        >{{ model.fullName }}</v-card-title
      >
      <v-card-subtitle v-if="!isMobile">{{
        model.fullNameKana
      }}</v-card-subtitle>
      <v-container>
        <v-row>
          <v-col cols="12" sm="5" md="4" lg="3">
            <v-card flat>
              <v-chip
                v-if="model.leaveDate"
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
                    model.fullName
                  }}</v-card-title>
                  <v-card-subtitle>{{ model.fullNameKana }}</v-card-subtitle>
                </v-sheet>
              </v-img>
              <v-btn
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
                  <v-simple-table>
                    <tbody>
                      <tr>
                        <td>CODE</td>
                        <td style="text-align: right">{{ model.code }}</td>
                      </tr>
                      <tr>
                        <td>入社日</td>
                        <td style="text-align: right">{{ hireDateJa }}</td>
                      </tr>
                      <tr>
                        <td>生年月日</td>
                        <td style="text-align: right">
                          {{ birthJa }}
                        </td>
                      </tr>
                      <tr>
                        <td>年齢</td>
                        <td style="text-align: right">
                          {{ `${age} 歳` }}
                        </td>
                      </tr>
                      <tr>
                        <td>性別</td>
                        <td style="text-align: right">
                          <v-icon
                            :color="model.gender === 'male' ? 'blue' : 'pink'"
                            small
                            >{{ `mdi-gender-${model.gender}` }}</v-icon
                          >{{ `${model.gender === 'male' ? '男性' : '女性'}` }}
                        </td>
                      </tr>
                      <tr>
                        <td>血液型</td>
                        <td style="text-align: right">未登録</td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-tab-item>
                <v-tab-item>
                  <v-simple-table>
                    <tbody>
                      <tr>
                        <td>郵便番号</td>
                        <td style="text-align: right">{{ model.zipcode }}</td>
                      </tr>
                      <tr>
                        <td>住所1</td>
                        <td style="text-align: right">{{ model.address1 }}</td>
                      </tr>
                      <tr>
                        <td>住所2</td>
                        <td style="text-align: right">{{ model.address2 }}</td>
                      </tr>
                      <tr>
                        <td>送付先住所</td>
                        <td style="text-align: right">
                          {{
                            model.hasSendAddress ? '上記と異なる' : '登録住所'
                          }}
                        </td>
                      </tr>
                      <tr v-if="model.hasSendAddress">
                        <td>郵便番号</td>
                        <td style="text-align: right">
                          {{ model.sendZipcode }}
                        </td>
                      </tr>
                      <tr v-if="model.hasSendAddress">
                        <td>住所1</td>
                        <td style="text-align: right">
                          {{ model.sendAddress1 }}
                        </td>
                      </tr>
                      <tr v-if="model.hasSendAddress">
                        <td>住所2</td>
                        <td style="text-align: right">
                          {{ model.sendAddress2 }}
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-tab-item>
                <v-tab-item>
                  <v-simple-table>
                    <tbody>
                      <tr>
                        <td>電話番号</td>
                        <td style="text-align: right">{{ model.tel }}</td>
                      </tr>
                      <tr>
                        <td>携帯番号</td>
                        <td style="text-align: right">{{ model.mobile }}</td>
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
  </v-container>
</template>

<script>
import ja from 'dayjs/locale/ja'
export default {
  async asyncData({ app }) {
    const model = app.$Employee()
    await model.fetch('tGk6BMrHdDmAAScDZKVa')
    return { model }
  },
  data() {
    return {
      img: require('@/static/now-printing.png'),
      tab: null,
    }
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.mobile
    },
    age() {
      const from = this.$dayjs(this.model.birth)
      const to = this.$dayjs()
      return to.diff(from, 'y')
    },
    birthJa() {
      return this.$dayjs(this.model.birth).locale(ja).format('YYYY年MM月DD日')
    },
    hireDateJa() {
      return this.$dayjs(this.model.hireDate)
        .locale(ja)
        .format('YYYY年MM月DD日')
    },
  },
}
</script>

<style></style>
