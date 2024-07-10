<script>
/**
 * ### GTemplateDetail
 *
 * #### 概要
 * 詳細画面のテンプレートコンポーネントです。
 *
 * #### 機能詳細
 * - `props.actions`に与えられた配列内の要素（オブジェクト）に応じて画面右下にボタンを表示します。
 * - 要素は{ event: string, icon: string, color: string }を受け付けます。
 * - 要素が与えられなかった場合、ボタンは表示されません。
 * - 要素が1つのみの場合、単一のボタンを表示します。
 * - 要素が2つ以上の場合、v-speed-dialを利用したボタンを表示します。
 * - 各ボタンがクリックされた時にemitされるイベントは`click:${event}`です。
 * - ボタンが表示される場合、ルートのv-containerはbottomに48pxのpaddingを作成します。
 *   -> 特にモバイル表示の場合にコンテンツと被ってしまうのを避けるため。
 *
 * #### 更新履歴
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    actions: { type: Array, default: () => [], required: false },
    activatorColor: { type: String, default: 'primary', required: false },
    activatorIcon: { type: String, default: 'mdi-menu', required: false },
    activatorCloseIcon: { type: String, default: 'mdi-close', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dial: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    singleButton() {
      const action = this.actions.length ? this.actions[0] : undefined
      if (!action) return
      const color = action?.color || undefined
      const event = action?.event || undefined
      const on = event ? { click: () => this.$emit(`click:${event}`) } : {}
      return {
        attrs: {
          color,
          dark: true,
          fab: true,
          fixed: true,
          bottom: true,
          right: true,
        },
        on,
      }
    },
    speedDial() {
      return {
        attrs: {
          fixed: true,
          bottom: true,
          right: true,
          transition: 'slide-y-reverse-transition',
          value: this.dial,
        },
        on: {
          input: ($event) => (this.dial = $event),
        },
      }
    },
  },
}
</script>

<template>
  <v-container
    :class="{ 'pb-12': !!actions.length }"
    :style="{ position: 'relative' }"
  >
    <slot name="default" />
    <!-- display a single-button if actions.length === 1 -->
    <v-btn
      v-if="actions.length === 1"
      v-bind="singleButton.attrs"
      v-on="singleButton.on"
    >
      <v-icon>{{ actions[0].icon }}</v-icon>
    </v-btn>
    <!-- display a speed-dial if actions.length >= 2 -->
    <v-speed-dial
      v-else-if="actions.length"
      v-bind="speedDial.attrs"
      v-on="speedDial.on"
    >
      <template #activator>
        <v-btn :color="activatorColor" fab>
          <v-icon v-if="!dial">{{ activatorIcon }}</v-icon>
          <v-icon v-else>{{ activatorCloseIcon }}</v-icon>
        </v-btn>
      </template>
      <v-btn
        v-for="(btn, index) of actions"
        :key="index"
        fab
        dark
        :color="btn?.color || undefined"
        @click="btn?.event ? $emit(`click:${btn.event}`) : undefined"
      >
        <v-icon>{{ btn.icon }}</v-icon>
      </v-btn>
    </v-speed-dial>
  </v-container>
</template>

<style></style>
