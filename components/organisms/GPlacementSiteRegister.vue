<template>
  <v-dialog v-model="dialog" max-width="720" persistent scrollable>
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <v-card>
      <v-toolbar color="primary" dark dense flat>
        <v-toolbar-title>配置表現場追加</v-toolbar-title>
        <v-spacer />
        <v-icon @click="dialog = false">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-stepper v-model="step" vertical>
          <v-stepper-step step="1">
            現場情報入力
            <small>現場名から既存データを選択することもできます。</small>
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-card>
              <v-card-text>
                <a-text-field
                  v-model="name"
                  :disabled="!!selectedItem.length"
                  label="現場名"
                />
                <a-text-field
                  v-model="address"
                  :disabled="!!selectedItem.length"
                  label="住所"
                />
                <g-data-table
                  v-model="selectedItem"
                  :search="name"
                  disable-sort
                  :headers="headers"
                  :height="220"
                  :items-per-page="2"
                  :items="(name || '').trim() ? sites : []"
                  item-key="docId"
                  show-select
                  single-select
                  no-results-text="該当する現場がありません。"
                  no-data-text="現場名を入力してください。"
                  @page-count="pageCount = $event"
                >
                  <template #[`item.customerId`]="{ item }">
                    {{
                      $store.getters['masters/Customer'](item.customerId).abbr
                    }}
                  </template>
                  <template #[`item.status`]="{ item }">
                    {{ $SITE_STATUS[item.status] }}
                  </template>
                </g-data-table>
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn
                  color="primary"
                  :disabled="(!name || !address) && !selectedItem.length"
                  @click="step++"
                  >次へ</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-stepper-content>
          <v-stepper-step step="2"> 勤務区分を選択 </v-stepper-step>
          <v-stepper-content step="2">
            <v-card>
              <v-card-text>
                <v-radio-group v-model="workShift" mandatory row>
                  <v-radio label="日勤" value="day" />
                  <v-radio label="夜勤" value="night" />
                </v-radio-group>
              </v-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn @click="step--">戻る</v-btn>
                <v-btn color="primary" @click="step++">次へ</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>
          <v-stepper-step step="3"> 確認 </v-stepper-step>
          <v-stepper-content step="3">
            <v-card>
              <v-card-subtitle
                >以下の内容で新規現場を登録します。よろしいですか？</v-card-subtitle
              >
              <v-card-text>
                <v-simple-table>
                  <tbody>
                    <tr>
                      <td>現場名</td>
                      <td>
                        {{ confirm.name }}
                      </td>
                    </tr>
                    <tr>
                      <td>住所</td>
                      <td>
                        {{ confirm.address }}
                      </td>
                    </tr>
                    <tr>
                      <td>勤務区分</td>
                      <td>{{ $WORK_SHIFT[workShift] }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn :disabled="loading" @click="step--">戻る</v-btn>
                <v-btn
                  color="primary"
                  :disabled="loading"
                  :loading="loading"
                  @click="onClickSubmit"
                  >確定</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-stepper-content>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import ATextField from '../atoms/inputs/ATextField.vue'
import GDataTable from '../molecules/tables/GDataTable.vue'
export default {
  components: { GDataTable, ATextField },
  data() {
    return {
      dialog: false,
      step: 1,
      name: null,
      address: null,
      workShift: 'day',
      loading: false,
      headers: [
        { text: '現場名', value: 'name' },
        { text: '住所', value: 'address' },
        { text: '取引先', value: 'customerId' },
        { text: '状態', value: 'status' },
      ],
      selectedItem: [],
    }
  },
  computed: {
    sites() {
      return this.$store.getters['masters/Sites']
    },
    confirm() {
      if (this.selectedItem.length) {
        return {
          name: this.selectedItem[0].name,
          address: this.selectedItem[0].address,
        }
      } else {
        return {
          name: this.name,
          address: this.address,
        }
      }
    },
  },
  watch: {
    dialog(v) {
      if (v) return
      this.selectedItem.splice(0)
      this.name = null
      this.address = null
      this.workShift = 'day'
      this.step = 1
    },
  },
  methods: {
    async onClickSubmit() {
      try {
        let siteId = ''
        const workShift = this.workShift
        this.loading = true
        if (this.selectedItem.length) {
          siteId = this.selectedItem[0].docId
        } else {
          const model = this.$Site(this.confirm)
          const docRef = await model.create()
          siteId = docRef.id
        }
        await this.$store.dispatch('placements/addIndex', {
          siteId,
          workShift,
        })
        this.dialog = false
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

<style></style>
