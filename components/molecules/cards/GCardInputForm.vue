<script>
/**
 * ### GCardInputForm
 * 入力検証を行う、SUBMITとCANCELボタンを備えたカードコンポーネント。
 * 入力のためのINPUTはdefaultスロットを使用して配置してください。
 * props.editModeは、現在のフォームが追加（REGIST）・編集（UPDATE）・削除（DELETE）の
 * どのモードに該当するかを指定します。
 * 削除（DELETE）の場合、defaultスロットに配置されたINPUTコンポーネントは
 * 編集不可になります。（v-formのdisabledがtrueに設定されます。）
 *
 * SUBMITボタンがクリックされるとdefaultスロットに配置されたINPUTコンポーネントの
 * 入力内容を検証し（v-formのvalidate()が実行され）、検証に問題がなければ
 * click:submitイベントがemitされます。
 *
 * CANCELボタンがクリックされるとclick:cancelイベントがemitされます。
 *
 * ref属性を使用してこのコンポーネントのinitialize()を呼び出すと、検証結果を初期化します。
 * NOTE: v-formのresetValidation()を呼び出しています。INPUTコンポーネントに
 * 正常に値がセットされない不具合（原因不明）を確認したため、reset()は使用しません。
 *
 * #### PROPS
 * | name     | type    | default   | required | description |
 * | -------- | ------- | --------- | -------- | ----------- |
 * | editMode | string  | 'REGIST'  | false    |             |
 * | label    | string  | undefined | false    |             |
 * | loading  | boolean | false     | false    |             |
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    editMode: {
      type: String,
      default: 'REGIST',
      validator: (v) => ['REGIST', 'UPDATE', 'DELETE'].includes(v),
      required: false,
    },
    label: { type: String, default: undefined, required: false },
    loading: { type: Boolean, default: false, required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {}
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    editModeLabel() {
      if (this.editMode === 'REGIST') return '[追加]'
      if (this.editMode === 'UPDATE') return '[編集]'
      return '[削除]'
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {},
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.$refs.form.resetValidation()
    },
    onClickCancel() {
      this.$emit('click:cancel')
    },
    onClickSubmit() {
      if (!this.validate()) return
      this.$emit('click:submit')
    },
    validate() {
      const result = this.$refs.form.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
  },
}
</script>

<template>
  <v-card>
    <v-card-title>{{ `${label || ''} ${editModeLabel}` }}</v-card-title>
    <v-card-text class="py-5 px-6">
      <v-form
        ref="form"
        :disabled="editMode === 'DELETE' || loading"
        @submit.prevent
      >
        <slot name="default" v-bind="{ editMode }" />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <v-btn :disabled="loading" @click="onClickCancel">cancel</v-btn>
      <slot
        name="btn-submit"
        v-bind="{
          attrs: { disabled: loading, loading },
          on: { click: onClickSubmit },
        }"
      >
        <v-btn
          :disabled="loading"
          :loading="loading"
          color="primary"
          @click="onClickSubmit"
          >submit</v-btn
        >
      </slot>
    </v-card-actions>
  </v-card>
</template>

<style></style>
