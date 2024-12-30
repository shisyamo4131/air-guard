<script>
/**
 * VBtn を拡張したボタンコンポーネントです。
 * - アイコンを表示するためのスロットを提供します。
 * - ボタンのサイズにアイコンのサイズが同期します。
 * - destructive が true の場合、無条件に色を error にします。
 *
 * [NOTE]
 * アイコンモードかつダークモードの場合、アイコンの色は白（既定値）になります。
 * 色を変更するには iconColor プロパティを指定します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * ボタンの色です。
     * - アイコン表示の際はアイコンの色になりますが、
     * - アイコン表示かつ dark モードの場合は無視され、iconColor が優先されます。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * icon とともに指定されるとアイコンのカラーが白になります。
     * - アイコンボタンを背景色のあるコンポーネントに配置した場合に、視認性と高めるために使用します。
     */
    dark: { type: Boolean, default: false, required: false },

    /**
     * 背景色をエラー表示にしてボタンを目立たせます。
     * - dark プロパティが true である場合は無視されます。
     */
    destructive: { type: Boolean, default: false, required: false },

    /**
     * ボタンが丸いデザインになります。
     */
    icon: { type: Boolean, default: false, required: false },

    /**
     * アイコン表示かつダークモード時のアイコンの色です。
     */
    iconColor: { type: String, default: 'white', required: false },

    /**
     * ボタンのラベルです。
     */
    label: { type: [String, Number], default: undefined, required: false },

    /**
     * アイコンの位置を右側にします。
     */
    right: { type: Boolean, default: false, required: false },

    /**
     * サイズ
     */
    xSmall: { type: Boolean, default: false, required: false },
    small: { type: Boolean, default: false, required: false },
    large: { type: Boolean, default: false, required: false },
    xLarge: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * icon スロットに配置されたコンポーネントに提供するプロパティを返します。
     */
    iconAttrs() {
      return {
        color: this.icon && this.dark ? this.iconColor : undefined,
        ...this.iconSize,
      }
    },

    /**
     * icon のサイズ設定を返します。
     */
    iconSize() {
      return {
        xSmall: this.xSmall,
        small: this.small,
        large: this.large,
        xLarge: this.xLarge,
      }
    },
  },
}
</script>

<template>
  <v-btn
    v-bind="{
      ...$props,
      ...$attrs,
      color: destructive ? 'error' : color,
    }"
    v-on="$listeners"
  >
    <!-- right === false の際の icon スロット -->
    <slot
      v-if="!right"
      name="icon"
      v-bind="{
        attrs: { left: !icon, ...iconAttrs },
      }"
    />

    <!-- default スロット -->
    <slot v-if="!icon" name="default" />

    <!-- right === true の際の icon スロット -->
    <slot
      v-if="right"
      name="icon"
      v-bind="{
        attrs: { right: !icon, ...iconAttrs },
      }"
    />
  </v-btn>
</template>

<style></style>
