<script>
/**
 * INPUT コンポーネントのラッパーとなるカードコンポーネントです。
 * submit ボタンと cancel ボタンを備えています。
 * - `submit`ボタンがクリックされると`click:submit`イベントをemitします。
 * - `cancel`ボタンがクリックされると`click:cancel`イベントをemitします。
 * - 削除チェックボックスを切り替えると editMode に対する update イベントを emit します。
 * @author shisyamo4131
 */
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GCheckbox from '~/components/atoms/inputs/GCheckbox.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCheckbox, GBtnCancel, GBtnSubmit },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    disabled: { type: Boolean, default: false, required: false },
    disableDelete: { type: Boolean, default: false, required: false },
    disableSubmit: { type: Boolean, default: false, required: false },

    /**
     * 既定のアクションボタンを非表示にします。
     */
    hideDefaultActions: { type: Boolean, default: false, required: false },
    label: { type: String, required: true },
    loading: { type: Boolean, default: false, required: false },

    /**
     * VCardText の余白を0にします。
     * - default スロット内で独自に VCardText を使う場合などに便利です。
     */
    noPadding: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    submit() {
      this.$emit('click:submit')
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs">
    <v-toolbar class="flex-grow-0" color="secondary" dark dense flat>
      <v-toolbar-title>{{ label }}</v-toolbar-title>
      <v-spacer />
      <g-btn-cancel icon :disabled="loading" @click="$emit('click:cancel')" />
    </v-toolbar>
    <v-card-text :class="noPadding ? 'pa-0' : 'pt-5'">
      <v-form :disabled="disabled" @submit.prevent>
        <slot
          name="default"
          v-bind="{
            attrs: { editMode, label, loading, CREATE, UPDATE, DELETE },
            submit,
          }"
        />
        <g-checkbox
          v-if="computedEditMode !== CREATE && !disableDelete"
          v-model="computedEditMode"
          color="error"
          label="このデータを削除する"
          :true-value="DELETE"
          :false-value="UPDATE"
          hide-details
        />
      </v-form>
    </v-card-text>

    <!-- slot.actions -->
    <slot
      name="actions"
      v-bind="{
        attrs: { disabled: loading || disableSubmit, loading },
        on: { click: submit },
      }"
    >
      <v-card-actions v-if="!hideDefaultActions" class="justify-end">
        <g-btn-submit
          color="primary"
          icon
          :disabled="loading || disableSubmit"
          :loading="loading"
          @click="submit"
        />
      </v-card-actions>
    </slot>
  </v-card>
</template>

<style></style>
