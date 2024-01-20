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
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.$refs.form.reset()
    },
    validate() {
      const result = this.$refs.form.validate()
      if (!result) alert('入力に不備があります。')
      return result
    },
    onClickSubmit() {
      if (!this.validate()) return
      this.$emit('click:submit')
    },
  },
}
</script>

<template>
  <v-card>
    <v-card-title>{{ `${label || ''} ${editModeLabel}` }}</v-card-title>
    <v-card-text class="py-5 px-6">
      <v-form ref="form" :disabled="editMode === 'DELETE'" @submit.prevent>
        <slot name="default" v-bind="{ editMode }" />
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-space-between">
      <v-btn :disabled="loading" @click="$emit('click:cancel')">cancel</v-btn>
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
