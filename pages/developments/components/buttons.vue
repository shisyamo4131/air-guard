<template>
  <g-template-default>
    <v-container>
      <v-card :color="dark ? 'secondary' : undefined">
        <v-card-title>Buttons</v-card-title>
        <v-card-text>
          プロジェクトで使用するボタンコンポーネントです。 VBtn
          コンポーネントを拡張しており、破壊的な処理であることをユーザーに通知するための
          destructive プロパティを実装しています。
        </v-card-text>
        <v-card-text>
          <div class="d-flex flex-wrap" style="gap: 8px">
            <component
              :is="`GBtn${button}`"
              v-for="(button, index) of buttons"
              :key="button"
              :color="colors[index % colors.length]"
              :icon="icon"
              :dark="dark"
              :destructive="destructive"
              :disabled="disabled"
              :loading="loading"
              v-bind="calculatedSize"
            />
          </div>
        </v-card-text>
        <v-container fluid>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-subheader>サイズ</v-subheader>
              <v-radio-group v-model="size">
                <v-radio value="xSmall" label="xSmall" />
                <v-radio value="small" label="small" />
                <v-radio value="medium" label="medium" />
                <v-radio value="large" label="large" />
                <v-radio value="xLarge" label="xLarge" />
              </v-radio-group>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-subheader>表示</v-subheader>
              <v-checkbox v-model="icon" label="アイコンモード" hide-details />
              <v-checkbox v-model="dark" label="ダークモード" hide-details />
              <v-checkbox v-model="destructive" label="破壊的" hide-details />
              <v-checkbox v-model="disabled" label="使用不可" hide-details />
              <v-checkbox v-model="loading" label="処理中" hide-details />
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>
  </g-template-default>
</template>

<script>
import GBtnCancel from '~/components/atoms/btns/GBtnCancel.vue'
import GBtnRegist from '~/components/atoms/btns/GBtnRegist.vue'
import GBtnEdit from '~/components/atoms/btns/GBtnEdit.vue'
import GBtnSubmit from '~/components/atoms/btns/GBtnSubmit.vue'
import GBtnFilter from '~/components/atoms/btns/GBtnFilter.vue'
import GTemplateDefault from '~/components/templates/GTemplateDefault.vue'
export default {
  components: {
    GTemplateDefault,
    GBtnCancel,
    GBtnSubmit,
    GBtnRegist,
    GBtnEdit,
    GBtnFilter,
  },
  data() {
    return {
      buttons: ['Submit', 'Cancel', 'Regist', 'Edit', 'Filter'],
      colors: [
        'primary',
        'secondary',
        'accent',
        'info',
        'warning',
        'error',
        'success',
        'highlight',
      ],
      dark: false,
      destructive: false,
      disabled: false,
      icon: false,
      loading: false,
      size: 'medium',
    }
  },
  computed: {
    calculatedSize() {
      return {
        xSmall: this.size === 'xSmall',
        small: this.size === 'small',
        large: this.size === 'large',
        xLarge: this.size === 'xLarge',
      }
    },
  },
}
</script>

<style></style>
