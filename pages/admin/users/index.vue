<script>
/**
 * ユーザー情報の一覧ページです。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import AirArrayManager from '~/components/air/AirArrayManager.vue'
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GInputNewUser from '~/components/molecules/inputs/GInputNewUser.vue'
import GInputUser from '~/components/molecules/inputs/GInputUser.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
import NewUser from '~/models/NewUser'
import User from '~/models/User'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'UsersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GTemplateDefault,
    AirArrayManager,
    GBtnRegist,
    GInputUser,
    GInputNewUser,
    GBtnCancel,
    GBtnSubmit,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      restore: {
        dialog: false,
        loading: false,
        uid: null,
      },
      schema: new User(),
      schemaNewUser: new NewUser(),
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    items() {
      return this.$store.getters['users/items']
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.restore.dialog を監視します。
     * - false に更新されたら data.restore.uid を null にします。
     */
    'restore.dialog'(v) {
      if (v) return
      this.restore.uid = null
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async handleCreate(item) {
      await item.create()
    },
    async handleUpdate(item) {
      await item.update()
    },
    async handleDelete(item) {
      await item.delete()
    },

    /**
     * ユーザーアカウントの復元処理を実行します。
     */
    async onClickRestore() {
      if (!this.restore.uid) return
      this.restore.loading = true
      try {
        const userInstance = new User()
        await userInstance.restore(this.restore.uid)
      } catch (err) {
        const message = 'アカウント復元処理に失敗しました。'
        // eslint-disable-next-line
        console.error(message, err)
        alert(message)
      } finally {
        this.restore.loading = false
        this.restore.dialog = false
      }
    },
  },
}
</script>

<template>
  <g-template-default v-slot="{ height }">
    <v-container fluid :style="{ height: `${height}px` }">
      <air-array-manager
        :dialog-props="{
          maxWidth: 600,
        }"
        event-edit="click:row"
        :handle-update="handleUpdate"
        :handle-delete="handleDelete"
        height="100%"
        :items="items"
        label="ユーザー情報"
        :schema="schema"
      >
        <template #default="props">
          <v-sheet class="d-flex flex-column" :height="props.height">
            <v-toolbar class="flex-grow-0" flat>
              <v-text-field
                v-bind="props.search.attrs"
                v-on="props.search.on"
              />
              <air-array-manager
                :dialog-props="{
                  maxWidth: 600,
                }"
                :handle-create="handleCreate"
                label="ユーザー情報"
                :schema="schemaNewUser"
              >
                <template #default="{ activator }">
                  <g-btn-regist
                    v-bind="activator.attrs"
                    icon
                    v-on="activator.on"
                  />
                </template>
                <template #inputs="{ attrs, on }">
                  <g-input-new-user v-bind="attrs" v-on="on" />
                </template>
              </air-array-manager>
              <!-- 復元処理ダイアログ -->
              <v-dialog v-model="restore.dialog" max-width="360">
                <template #activator="{ attrs, on }">
                  <v-btn v-bind="attrs" color="primary" icon v-on="on">
                    <v-icon>mdi-delete-restore</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-toolbar color="primary" dark dense flat>
                    <v-toolbar-title>アカウント復元処理</v-toolbar-title>
                    <v-spacer />
                    <g-btn-cancel
                      icon
                      :disabled="restore.loading"
                      @click="restore.dialog = false"
                    />
                  </v-toolbar>
                  <v-card-text class="pt-5">
                    <v-text-field
                      v-model="restore.uid"
                      label="uid"
                      hide-details
                    />
                  </v-card-text>
                  <v-card-actions class="justify-end">
                    <g-btn-submit
                      icon
                      color="primary"
                      :disabled="!restore.uid || restore.loading"
                      :loading="restore.loading"
                      @click="onClickRestore"
                    />
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
            <div class="flex-table-container">
              <v-data-table
                v-bind="props.table.attrs"
                :headers="[
                  { text: '表示名', value: 'displayName' },
                  { text: 'email', value: 'email' },
                  { text: 'uid', value: 'docId' },
                ]"
                hide-default-footer
                v-on="props.table.on"
              >
              </v-data-table>
            </div>
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="10">
                  <v-pagination
                    v-bind="props.pagination.attrs"
                    v-on="props.pagination.on"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </template>
        <template #inputs="{ attrs, on }">
          <g-input-user v-bind="attrs" v-on="on" />
        </template>
      </air-array-manager>
    </v-container>
  </g-template-default>
</template>

<style></style>
