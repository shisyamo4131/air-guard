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
import GInputUser from '~/components/molecules/inputs/GInputUser.vue'
import GDataTableUsers from '~/components/molecules/tables/GDataTableUsers.vue'
import User from '~/models/User'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import NewUser from '~/models/NewUser'
import GInputNewUser from '~/components/molecules/inputs/GInputNewUser.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GTemplateDocumentsIndex from '~/components/templates/GTemplateDocumentsIndex.vue'
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'UsersIndex',

  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GInputUser,
    GDataTableUsers,
    GDialogInput,
    GInputNewUser,
    GBtnSubmitIcon,
    GBtnCancelIcon,
    GTemplateDocumentsIndex,
    GBtnRegistIcon,
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      instance: new User(),
      regist: {
        dialog: false,
        editMode: 'CREATE',
        instance: new NewUser(),
      },
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
    'regist.dialog'(v) {
      if (v) return
      this.regist.editMode = 'CREATE'
      this.regist.instance.initialize()
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
  <g-template-documents-index
    label="ユーザー管理"
    :items="items"
    :instance="instance"
  >
    <template #regist-button="buttonProps">
      <g-dialog-input
        v-model="regist.dialog"
        :edit-mode.sync="regist.editMode"
        :instance="regist.instance"
      >
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            v-bind="{ ...buttonProps.attrs, ...attrs }"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-new-user v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-input>
    </template>
    <template #input="{ attrs, on }">
      <g-input-user v-bind="attrs" v-on="on" />
    </template>
    <template #append-search>
      <!-- 復元処理ダイアログ -->
      <v-dialog v-model="restore.dialog" max-width="360">
        <template #activator="{ attrs, on }">
          <v-btn v-bind="attrs" color="secondary" icon v-on="on">
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
    <template #default="{ attrs, on }">
      <g-data-table-users v-bind="attrs" sort-by="code" sort-desc v-on="on" />
    </template>
  </g-template-documents-index>
</template>

<style></style>
