<script>
/*************************************************************************************************
 * プロジェクトで使用するテンプレートの基底コンポーネントです。
 *
 * ページネーションなどを Flex システムで画面下部に固定できるよう、コンテナの高さを
 * VMain の高さで固定させています。
 * コンテナの高さを超過するコンポーネントが配置された場合、コンテナ内でスクロールするように
 * 設計されています。
 *
 * ### 使用方法
 * 1. default スロットにコンテンツを配置してください。
 * 2. スロットコンテンツ内でスクロールを制御する場合は default スロットが提供する
 *    height プロパティを使用してコンテンツの高さを制御します。
 *
 * @author shisyamo4131
 *************************************************************************************************/
export default {
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * アプリケーション上部の高さを返します。
     * - v-app-bar の高さを含みます。（固定されている場合のみ）
     */
    APP_TOP_HEIGHT() {
      return this.$vuetify.application.top
    },

    /**
     * アプリケーション下部の高さを返します。
     * - v-footer の高さを含みます。（固定されている場合のみ）
     */
    APP_BOTTOM_HEIGHT() {
      return this.$vuetify.application.bottom
    },

    /**
     * コンテンツ描画部（VMain）の高さを返します。
     */
    V_MAIN_HEIGHT() {
      return (
        this.$vuetify.breakpoint.height -
        this.APP_TOP_HEIGHT -
        this.APP_BOTTOM_HEIGHT
      )
    },
  },
}
</script>

<template>
  <div class="overflow-y-auto" :style="{ height: `${V_MAIN_HEIGHT}px` }">
    <slot name="default" v-bind="{ height: V_MAIN_HEIGHT }">
      <v-container fluid>
        <v-card>
          <v-card-text v-for="n in 20" :key="n">
            プロジェクトのデフォルトレイアウトコンポーネントです。<br />
            defaultスロットを使用して、この部分を他のコンポーネントに置き換えてください。
          </v-card-text>
        </v-card>
      </v-container>
    </slot>
  </div>
</template>

<style></style>
