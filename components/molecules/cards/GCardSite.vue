<script>
/**
 * 現場情報を表示・編集する Card コンポーネントです。
 * - props.docId を指定すると現場ドキュメントを読み込んで表示します。
 * - props.instance に現場インスタンスを渡すことでも表示が可能です。
 * - props.docId は props.instance よりも優先されます。
 * - props.docId が指定されている場合のみ編集が可能です。
 *   -> インスタンスが Minimal などであった場合に情報が欠落してしまう為
 * @author shisyamo4131
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputSite from '../inputs/GInputSite.vue'
import GBtnEditIcon from '~/components/atoms/btns/GBtnEditIcon.vue'
import Site from '~/models/Site'
export default {
  components: { GDialogInput, GBtnEditIcon, GInputSite },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 当該現場を編集不可能にします。
     */
    disableEdit: { type: Boolean, default: false, required: false },

    /**
     * 現場ドキュメントID
     * - 指定された ID に該当するドキュメントを Firestore から取得します。
     * - ID が指定された場合 props.instance は無視されます。
     */
    docId: { type: String, default: undefined, required: false },

    /**
     * 現場インスタンスを受け取ります。
     */
    instance: {
      type: Object,
      default: () => new Site(),
      validator: (v) => v instanceof Site,
      required: false,
    },
  },

  /****************************************************************************
   * DATA
   ****************************************************************************/
  data() {
    return {
      editModel: new Site(),
      error: {
        message: null,
        snackbar: false,
      },
      loading: false,
      snackbar: true,
    }
  },

  /****************************************************************************
   * WATCH
   ****************************************************************************/
  watch: {
    /**
     * 指定された現場 ID のドキュメントの購読を開始します。
     */
    docId: {
      handler(v) {
        if (!v) return
        this.editModel.subscribe(v)
      },
      immediate: true,
    },

    /**
     * props.instance の内容で data.editModel を初期化します。
     * - props.docId が指定されている場合は無視されます。
     */
    instance: {
      handler(v) {
        if (this.docId) return
        this.editModel.initialize(v)
      },
      immediate: true,
    },
  },

  /****************************************************************************
   * METHODS
   ****************************************************************************/
  methods: {
    /**
     * エラー状態を初期化します。
     */
    initError() {
      this.error.message = null
      this.error.snackbar = false
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title flex-nowrap">
      <div class="text-truncate" style="width: 100%">
        <span>{{ editModel.name }}</span>
        <v-chip
          v-if="editModel.status === 'expired'"
          class="flex-shrink-0"
          color="red"
          label
          x-small
          outlined
        >
          {{ `${$SITE_STATUS[editModel.status]}` }}
        </v-chip>
      </div>
      <g-dialog-input edit-mode="UPDATE" :instance="editModel">
        <template #activator="{ attrs, on }">
          <g-btn-edit-icon
            v-if="!error.message && docId && !disableEdit"
            class="ml-auto"
            v-bind="attrs"
            color="primary"
            v-on="on"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-site v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-input>
    </v-card-title>
    <v-card-subtitle>
      <div style="width: 100%" class="text-truncate">
        {{ editModel.abbr }}
      </div>
    </v-card-subtitle>
    <v-card-text>
      <v-chip-group column>
        <v-chip color="primary" label outlined
          ><v-icon left>mdi-domain</v-icon
          >{{ editModel.customer?.abbr || '' }}</v-chip
        >
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>

<style></style>
