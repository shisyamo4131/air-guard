<script>
/**
 * itemプロパティで与えられたオブジェクトをリスト表示するコンポーネントです。
 * itemオブジェクトうち、リスト表示する対象プロパティはlistプロパティで指定します。
 * {
 *   text: リストのラベル部に表示される文字列
 *   value: リストのテキスト部に表示される値を持ったitemのプロパティ名
 *   icon: リストに表示されるアイコン 未指定だと表示されません
 *   transformation: リストのテキスト部に表示する値を変換するための関数
 *                   transformation: (value, item) => string
 * }
 *
 * 表示されているリストはスロットを利用して置き換えることが可能です。
 *
 * ### list-item.<value>
 * VListItemの中身をすべて置換します。
 *
 * ### list-item-text.<value>
 * 表題部を置き換えます。アイコン部も置き換わります。
 *
 * ### list-item-icon.<value>
 * アイコン部のみを置き換えます。
 *
 * ### list-item-value.<value>
 * テキスト部を置き換えます。
 *
 * すべてのスロットはスロットプロパティとして item, index を提供します。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * リストに表示されるアイコンの色です。
     */
    iconColor: { type: String, default: undefined, required: false },

    /**
     * リスト表示する対象のオブジェクトです。
     */
    item: { type: Object, default: undefined, required: false },

    /**
     * リスト表示対象のプロパティを定義した配列を受け付けます。
     * { text, value, icon }
     */
    lists: { type: Array, default: () => [], required: false },
  },
}
</script>

<template>
  <v-list v-bind="$attrs" v-on="$listeners">
    <template v-for="(list, index) of lists">
      <v-list-item v-if="item && list.value in item" :key="index">
        <!-- slot: list-item -->
        <slot :name="`list-item.${list.value}`" v-bind="{ item, index }">
          <v-list-item-content>
            <v-list-item-subtitle>
              <!-- slot: list-item-text -->
              <slot
                :name="`list-item-text.${list.value}`"
                v-bind="{ item, index }"
              >
                <!-- slot: list-item-icon -->
                <slot
                  :name="`list-item-icon.${list.value}`"
                  v-bind="{ item, index }"
                >
                  <v-icon v-if="list.icon" :color="iconColor" small>
                    {{ list.icon }}
                  </v-icon>
                </slot>

                {{ list.text }}
              </slot>
            </v-list-item-subtitle>
            <v-list-item-title class="pl-2 pt-1">
              <!-- slot: list-item-value -->
              <slot
                :name="`list-item-value.${list.value}`"
                v-bind="{ item, index }"
              >
                {{
                  list.transformation
                    ? list.transformation(item[list.value], item)
                    : item[list.value]
                }}
              </slot>
            </v-list-item-title>
          </v-list-item-content>
        </slot>
      </v-list-item>
    </template>
  </v-list>
</template>

<style></style>
