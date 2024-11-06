<script>
/**
 * FAB スピードダイアルコンポーネント
 * - 従業員と外注先の追加ボタンを提供します。
 */
export default {
  props: {
    /**
     * FAB の展開方向
     * @type {String}
     */
    direction: { type: String, default: 'left' },

    disabledCopy: { type: Boolean, default: false },
    disabledPaste: { type: Boolean, default: false },

    /**
     * 展開時のトランジション
     * @type {String}
     */
    transition: { type: String, default: 'slide-x-reverse-transition' },
  },

  data() {
    return {
      /**
       * FAB の展開状態を管理します
       * @type {Boolean}
       */
      fab: false,
    }
  },
}
</script>

<template>
  <v-speed-dial v-model="fab" v-bind="{ ...$props, ...$attrs }">
    <template #activator>
      <v-btn v-model="fab" color="primary" fab x-small>
        <v-icon v-if="fab">mdi-close</v-icon>
        <v-icon v-else>mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-btn color="indigo" dark fab x-small @click="$emit('click:add-employee')">
      <v-icon>mdi-account</v-icon>
    </v-btn>
    <v-btn color="secondary" fab x-small @click="$emit('click:add-outsourcer')">
      <v-icon>mdi-handshake</v-icon>
    </v-btn>
    <v-btn
      color="info"
      :disabled="disabledCopy"
      fab
      x-small
      @click="$emit('click:copy')"
    >
      <v-icon>mdi-content-copy</v-icon>
    </v-btn>
    <v-btn
      color="accent"
      :disabled="disabledPaste"
      fab
      x-small
      @click="$emit('click:paste')"
    >
      <v-icon>mdi-content-paste</v-icon>
    </v-btn>
  </v-speed-dial>
</template>

<style></style>
