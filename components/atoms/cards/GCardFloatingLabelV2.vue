<script>
/**
 * フロートするラベル、カードに表示されているコンテンツに対するアクションメニューを
 * 実装したカードコンポーネントです。
 * @author shisyamo4131
 * @refact 2025-02-11
 */
export default {
  /****************************************************************************
   * PROPS
   ****************************************************************************/
  props: {
    /**
     * ラベルに dark を設定します。
     */
    dark: { type: Boolean, default: false, required: false },

    /**
     * メニューを使用不可にします。
     */
    disableMenu: { type: Boolean, default: false, required: false },

    /**
     * ラベルの色を設定します。
     */
    color: { type: String, default: undefined, required: false },

    /**
     * ラベルに表示するアイコンです。
     */
    icon: { type: String, default: undefined, required: false },

    /**
     * ラベルの値です。
     */
    label: { type: String, default: undefined, required: false },

    /**
     * ラベルにその他のオプションが必要な場合に使用します。
     */
    labelProps: {
      type: Object,
      default: () => {
        return {
          elevation: 2,
        }
      },
      required: false,
    },

    // メニューボタンのアイコンです。
    menuIcon: { type: String, default: 'mdi-dots-horizontal', required: false },

    /**
     * カードに表示するメニューの項目です。
     * メニューアイテムをクリックすると action で指定されたイベントが emit されます。
     * action に関数が指定された場合はこれを実行します。
     * { text, icon, action, disabled }
     */
    menuItems: {
      type: Array,
      default: () => [],
      required: false,
    },
  },

  /****************************************************************************
   * COMPUTED
   ****************************************************************************/
  computed: {
    // ラベルに適用するプロパティを返します。
    computedLabelProps() {
      return {
        ...this.labelProps,
        color: this.color,
        dark: this.dark,
      }
    },

    // メニューボタンに適用されるプロパティを返します。
    computedMenuBtnProps() {
      return {
        disabled: this.disableMenu,
        icon: true,
        small: true,
      }
    },
  },

  /****************************************************************************
   * METHODS
   ****************************************************************************/
  methods: {
    /**
     * 引数で指定されたイベントを emit します。
     * - 引数が関数の場合、これを実行します。
     */
    emitEvent(event) {
      if (!event) return
      if (typeof event === 'string') {
        this.$emit(event)
      } else if (typeof event === 'function') {
        event()
      }
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" style="padding-top: 28px" v-on="$listeners">
    <v-sheet
      class="g-card-floating-label__label text-body-2 rounded"
      v-bind="computedLabelProps"
    >
      <v-icon v-if="icon" small>{{ icon }}</v-icon>
      {{ label }}
    </v-sheet>

    <!-- menu -->
    <v-menu v-if="!!menuItems.length" offset-y>
      <template #activator="{ attrs, on }">
        <v-btn
          class="g-card-floating-label__menu_btn"
          v-bind="{ ...computedMenuBtnProps, ...attrs }"
          v-on="on"
        >
          <v-icon>{{ menuIcon }}</v-icon>
        </v-btn>
      </template>
      <v-list dense class="py-1">
        <v-list-item
          v-for="(item, index) of menuItems"
          :key="index"
          class="px-3"
          :disabled="item?.disabled"
          @click="emitEvent(item.action)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-icon
                v-if="item.icon"
                :color="color"
                :disabled="item?.disabled"
                small
                >{{ item.icon }}</v-icon
              >
              {{ item.text }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <slot name="default" />
  </v-card>
</template>

<style scoped>
.g-card-floating-label__label {
  position: absolute;
  padding: 4px 8px;
  top: -8px;
  left: 8px;
  max-width: 85%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.g-card-floating-label__menu_btn {
  position: absolute;
  right: 8px;
  top: 8px;
}
</style>
