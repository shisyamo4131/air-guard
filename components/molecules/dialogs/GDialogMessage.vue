<script>
/**
 * メッセージ表示を行うためダイアログコンポーネントです。
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    label: { type: String, default: '処理完了', required: false },
    maxWidth: { type: [String, Number], default: 360, required: false },
    value: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      this.$emit('input', v)
    },
    value: {
      handler(v) {
        this.dialog = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    close() {
      this.dialog = false
    },

    open() {
      this.dialog = true
    },
  },
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    v-bind="$attrs"
    :max-width="maxWidth"
    persistent
    v-on="$listeners"
  >
    <template #activator="props">
      <slot name="activator" v-bind="props" />
    </template>
    <v-card>
      <v-toolbar color="accent" dark dense flat>
        <v-icon left>mdi-information-slab-circle</v-icon>
        <v-toolbar-title>{{ label }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="py-5 px-6">
        <slot name="default">処理が完了しました。</slot>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn block color="accent" @click="dialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
