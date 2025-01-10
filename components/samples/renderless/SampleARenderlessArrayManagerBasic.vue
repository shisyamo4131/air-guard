<script>
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GIconDelete from '~/components/atoms/icons/GIconDelete.vue'
import GIconEdit from '~/components/atoms/icons/GIconEdit.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import ARenderlessArrayManager from '~/components/atoms/renderless/ARenderlessArrayManager.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    ARenderlessArrayManager,
    GBtnRegist,
    GIconEdit,
    GIconDelete,
    GBtnCancel,
    GTextField,
    GBtnSubmit,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      schema: null,
      headers: [
        { text: 'id', value: 'docId' },
        { text: 'name', value: 'name' },
        { text: 'actions', value: 'actions', align: 'right' },
      ],
      fruits: [
        { docId: 'apple', name: 'りんご' },
        { docId: 'orange', name: 'みかん' },
      ],
      sweets: [
        { docId: 'cake', name: 'ケーキ' },
        { docId: 'cookie', name: 'クッキー' },
      ],
    }
  },

  /***************************************************************************
   * CREATED
   ***************************************************************************/
  created() {
    class Schema {
      constructor(item) {
        this.docId = item?.docId ?? ''
        this.name = item?.name ?? ''
      }
    }
    this.schema = new Schema()
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    handleCreate(item, index, items) {
      return new Promise((resolve) => {
        items.push(item)
        alert('ITEM IS ADDED.')
        resolve()
      })
    },
    handleUpdate(item, index, items) {
      return new Promise((resolve, reject) => {
        reject(new Error('This is fake prosess'))
      })
    },
  },
}
</script>

<template>
  <g-template-default>
    <v-container>
      <v-card>
        <v-card-title>ARenderlessArrayManager</v-card-title>
        <v-card-text>
          配列の管理機能を提供するレンダーレスコンポーネントです。<br />
          配列の要素はオブジェクトでなければなりません。
        </v-card-text>
        <a-renderless-array-manager v-model="fruits" :schema="schema">
          <template #default="props">
            <v-container fluid>
              <v-card outlined>
                <v-card-title>基本</v-card-title>
                <v-card-text>
                  default
                  スロットが提供する機能をUIコンポーネントに引き渡すことで配列に対するCRUD機能を実装可能です。
                  以下は、配列管理のシンプルな例です。
                </v-card-text>
                <v-data-table :headers="headers" :items="props.items">
                  <template #top>
                    <v-toolbar dense flat>
                      <v-toolbar-title>FRUITS</v-toolbar-title>
                      <v-spacer />
                      <v-divider inset vertical />
                      <g-btn-regist icon @click="props.toRegist" />
                    </v-toolbar>
                  </template>
                  <template #[`item.actions`]="{ item }">
                    <g-icon-edit @click="() => props.toUpdate(item)" />
                    <g-icon-delete @click="() => props.toDelete(item)" />
                  </template>
                </v-data-table>
                <v-expand-transition>
                  <v-container v-show="props.hasError" fluid>
                    <v-alert dense type="error">{{
                      `${props.error || ''}`
                    }}</v-alert>
                  </v-container>
                </v-expand-transition>
                <v-expand-transition>
                  <v-container v-show="props.isEditing" fluid>
                    <v-card outlined>
                      <v-card-title>INPUT FORM</v-card-title>
                      <v-card-text>
                        <v-form ref="form">
                          <v-row>
                            <v-col cols="12" md="6">
                              <g-text-field
                                :value="props.editItem.docId"
                                label="id"
                                required
                                @input="
                                  ($event) =>
                                    props.updateProperties({ docId: $event })
                                "
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <g-text-field
                                :value="props.editItem.name"
                                label="name"
                                required
                                @input="
                                  ($event) =>
                                    props.updateProperties({ name: $event })
                                "
                              />
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-card-text>
                      <v-card-actions class="justify-space-between">
                        <g-btn-cancel
                          small
                          @click="() => props.quitEditing(false)"
                        />
                        <g-btn-submit
                          color="primary"
                          small
                          @click="props.submit"
                        />
                      </v-card-actions>
                    </v-card>
                  </v-container>
                </v-expand-transition>
              </v-card>
            </v-container>
          </template>
        </a-renderless-array-manager>

        <!-- CUD の上書き -->
        <a-renderless-array-manager
          v-model="sweets"
          :schema="schema"
          :handle-create="handleCreate"
          :handle-update="handleUpdate"
        >
          <template #default="props">
            <v-container fluid>
              <v-card outlined>
                <v-card-title>CUDの上書き</v-card-title>
                <v-card-text>
                  handleCreate, handleUpdate, handleDelete
                  プロパティを使ってCUD処理を上書きすることができます。
                  それぞれのプロパティにはプロミスを返す関数を指定します。
                </v-card-text>
                <v-data-table :headers="headers" :items="props.items">
                  <template #top>
                    <v-toolbar dense flat>
                      <v-toolbar-title>QUIPMENTS</v-toolbar-title>
                      <v-spacer />
                      <v-divider inset vertical />
                      <g-btn-regist icon @click="props.toRegist" />
                    </v-toolbar>
                  </template>
                  <template #[`item.actions`]="{ item }">
                    <g-icon-edit @click="() => props.toUpdate(item)" />
                    <g-icon-delete @click="() => props.toDelete(item)" />
                  </template>
                </v-data-table>
                <v-expand-transition>
                  <v-container v-show="props.hasError" fluid>
                    <v-alert dense type="error">{{
                      `${props.error || ''}`
                    }}</v-alert>
                  </v-container>
                </v-expand-transition>
                <v-expand-transition>
                  <v-container v-show="props.isEditing" fluid>
                    <v-card outlined>
                      <v-card-title>INPUT FORM</v-card-title>
                      <v-card-text>
                        <v-form ref="form">
                          <v-row>
                            <v-col cols="12" md="6">
                              <g-text-field
                                :value="props.editItem.docId"
                                label="id"
                                required
                                @input="
                                  ($event) =>
                                    props.updateProperties({ docId: $event })
                                "
                              />
                            </v-col>
                            <v-col cols="12" md="6">
                              <g-text-field
                                :value="props.editItem.name"
                                label="name"
                                required
                                @input="
                                  ($event) =>
                                    props.updateProperties({ name: $event })
                                "
                              />
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-card-text>
                      <v-card-actions class="justify-space-between">
                        <g-btn-cancel
                          small
                          @click="() => props.quitEditing(false)"
                        />
                        <g-btn-submit
                          color="primary"
                          small
                          @click="props.submit"
                        />
                      </v-card-actions>
                    </v-card>
                  </v-container>
                </v-expand-transition>
              </v-card>
            </v-container>
          </template>
        </a-renderless-array-manager>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<style></style>
