<script>
/**
 * ## pages.UsersIndex
 *
 * ユーザー情報の一覧ページです。
 * - 新規登録時は、Authentications でユーザーアカウントを同期作成するために
 *   NewUser クラスを使ってドキュメントを作成します。
 * - 編集時は User クラスを使ってドキュメントの内容を更新します。
 *
 * @author shisyamo4131
 */
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputUser from '~/components/molecules/inputs/GInputUser.vue'
import GDataTableUsers from '~/components/molecules/tables/GDataTableUsers.vue'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import User from '~/models/User'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import NewUser from '~/models/NewUser'
import GInputNewUser from '~/components/molecules/inputs/GInputNewUser.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'UsersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputUser,
    GDataTableUsers,
    GTemplateIndex,
    GDialogInput,
    GInputNewUser,
    GBtnSubmitIcon,
    GBtnCancelIcon,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      instance: new NewUser(),
      restore: {
        dialog: false,
        loading: false,
        uid: null,
      },
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    component() {
      return this.editMode === this.CREATE ? 'GInputNewUser' : 'GInputUser'
    },
    items() {
      return this.$store.getters['users/items']
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (!v) {
        this.instance = new NewUser()
        // this.instance.initialize()
        this.editMode = this.CREATE
      }
    },
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
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/users/${item.docId}`)
      this.instance = new User(item)
      // this.instance.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
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
  <g-template-index label="ユーザー管理" :items="items">
    <template #append-search>
      <g-dialog-input v-model="dialog" max-width="360">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <component
            :is="component"
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>

      <!-- 復元処理ダイアログ -->
      <v-dialog v-model="restore.dialog" max-width="360">
        <template #activator="{ attrs, on }">
          <v-btn v-bind="attrs" icon v-on="on">
            <v-icon>mdi-delete-restore</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-toolbar color="secondary" dark dense flat>
            <v-toolbar-title>アカウント復元処理</v-toolbar-title>
            <v-spacer />
            <g-btn-cancel-icon
              :disabled="restore.loading"
              @click="restore.dialog = false"
            />
          </v-toolbar>
          <v-card-text class="pt-5">
            <v-text-field v-model="restore.uid" label="uid" hide-details />
          </v-card-text>
          <v-card-actions class="justify-end">
            <g-btn-submit-icon
              color="primary"
              :disabled="!restore.uid || restore.loading"
              :loading="restore.loading"
              @click="onClickRestore"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-users
        v-bind="attrs"
        :search="search"
        sort-by="code"
        sort-desc
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
