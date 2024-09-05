<script>
/**
 * GCardInputForm
 *
 * `submit`ボタンと`cancel`ボタンを備えたCardコンポーネントです。
 * `GInputEditMode`ミックスインを使用しています。
 *
 * - `props.editMode`を受け付けます。
 * - `props.loading`を受け付けます。
 * - `submit`ボタンがクリックされると`click:submit`イベントをemitします。
 * - `cancel`ボタンがクリックされると`click:cancel`イベントをemitします。
 * - `props.loading`にtrueが与えられると、`submit`ボタンが操作不可になります。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
 */
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GInputEditModeMixin from '~/mixins/GInputEditModeMixin'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnCancelIcon, GBtnSubmitIcon },
  mixins: [GInputEditModeMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, required: true },
  },
}
</script>

<template>
  <v-card v-bind="$attrs">
    <v-card-title>
      {{ label }}
      <v-chip label class="ml-auto">{{ editMode }}</v-chip>
    </v-card-title>
    <v-card-text>
      <slot name="default" v-bind="{ attrs: { editMode, label, loading } }" />
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <g-btn-cancel-icon :disabled="loading" @click="$emit('click:cancel')" />
      <g-btn-submit-icon
        color="primary"
        :disabled="loading"
        @click="$emit('click:submit')"
      />
    </v-card-actions>
  </v-card>
</template>

<style></style>
