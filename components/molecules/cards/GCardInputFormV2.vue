<script>
/**
 * INPUT コンポーネントのラッパーとなるカードコンポーネントです。
 * submit ボタンと cancel ボタンを備えています。
 * - GMixinEditModeReceiver により, editMode, loading を受け付けます。
 * - `submit`ボタンがクリックされると`click:submit`イベントをemitします。
 * - `cancel`ボタンがクリックされると`click:cancel`イベントをemitします。
 * @author shisyamo4131
 */
import GBtnCancelIcon from '~/components/atoms/btns/GBtnCancelIcon.vue'
import GBtnSubmitIcon from '~/components/atoms/btns/GBtnSubmitIcon.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GBtnCancelIcon, GBtnSubmitIcon, GCheckbox },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, required: true },
    disableSubmit: { type: Boolean, default: false, required: false },
  },
}
</script>

<template>
  <v-card v-bind="$attrs">
    <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
      <v-toolbar-title>{{ label }}</v-toolbar-title>
      <v-spacer />
      <g-btn-cancel-icon :disabled="loading" @click="$emit('click:cancel')" />
    </v-toolbar>
    <v-card-text class="pt-5">
      <v-form @submit.prevent>
        <slot name="default" v-bind="{ attrs: { editMode, label, loading } }" />
      </v-form>
      <g-checkbox
        v-if="editMode !== CREATE"
        label="このデータを削除する"
        :true-value="DELETE"
        :false-value="UPDATE"
        @change="$emit('update:editMode', $event)"
      />
    </v-card-text>
    <v-card-actions class="justify-end">
      <g-btn-submit-icon
        color="primary"
        :disabled="loading || disableSubmit"
        :loading="loading"
        @click="$emit('click:submit')"
      />
    </v-card-actions>
  </v-card>
</template>

<style></style>
