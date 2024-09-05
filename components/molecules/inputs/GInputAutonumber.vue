<script>
/**
 * ### GInputAutonumber
 * AutonumberモデルのINPUTコンポーネント。
 *
 * AutonumberドキュメントのdocIdはコレクション名です。
 * よって、一度登録されたドキュメントのコレクション名は変更できません。
 * 運用として、コレクション名を変更する必要が生じた場合は削除⇒作成します。
 *
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GNumeric from '~/components/atoms/inputs/GNumeric.vue'
import GSwitch from '~/components/atoms/inputs/GSwitch.vue'
import Autonumber from '~/models/Autonumber'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTextField, GNumeric, GSwitch, GCardInputForm },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GInputSubmitMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof Autonumber
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Autonumber(),
    }
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="自動採番設定編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form ref="form" @submit.prevent>
      <!-- 追加モード時以外は編集不可 -->
      <g-text-field
        v-model="editModel.collectionId"
        label="コレクション名"
        required
        :disabled="editMode !== CREATE"
        hint="コレクション名は変更できません。"
        :persistent-hint="editMode !== CREATE"
      />
      <g-numeric
        v-model="editModel.current"
        label="現在値"
        required
        :decimal-places="0"
      />
      <g-numeric v-model="editModel.length" label="桁数" required />
      <g-text-field v-model="editModel.field" label="フィールド名" required />
      <g-switch
        v-model="editModel.status"
        :label="`状態：${editModel.status ? '有効' : '無効'}`"
      />
    </v-form>
  </g-card-input-form>
</template>

<style></style>
