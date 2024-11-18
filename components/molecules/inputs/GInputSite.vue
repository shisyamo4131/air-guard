<script>
/**
 * 現場情報入力コンポーネントです。
 *
 * - 登録モードでは、入力された現場名に類似する既登録現場が存在した場合、アラートを出します。
 *
 * @author shisyamo4131
 */
import GCardInputForm from '../cards/GCardInputForm.vue'
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import Site from '~/models/Site'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GInputSubmitMixin from '~/mixins/GInputSubmitMixin'
import GCheckboxDeleteData from '~/components/atoms/inputs/GCheckboxDeleteData.vue'

export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDate,
    GSelect,
    GTextField,
    GAutocompleteCustomer,
    GTextarea,
    GCardInputForm,
    GCheckboxDeleteData,
  },
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
        return instance instanceof Site
      },
    },
    hideCustomer: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editModel: new Site(),
      fuzzySeachItems: [],
    }
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    afterInitialize() {
      this.fuzzySeachItems = []
    },

    setFuzzySearchItems() {
      this.fuzzySeachItems = []
      if (this.editMode !== this.CREATE) return
      if (!this.editModel.customerId) return
      if (!this.editModel.name) return
      const regex = new RegExp(this.editModel.name.split('').join('.*'), 'i') // 'i'は大文字小文字を無視
      this.fuzzySeachItems = this.$store.getters['sites/items'].filter(
        (item) =>
          regex.test(item.name) && item.customerId === this.editModel.customerId
      )
    },
  },
}
</script>

<template>
  <g-card-input-form
    v-bind="$attrs"
    label="現場情報編集"
    :edit-mode="editMode"
    :loading="loading"
    @click:submit="submit"
    v-on="$listeners"
  >
    <v-form @submit.prevent>
      <g-autocomplete-customer
        v-if="!editModel.hideCustomer"
        v-model="editModel.customerId"
        label="取引先"
        required
        @blur="setFuzzySearchItems"
      />
      <g-text-field
        v-model="editModel.name"
        label="現場名"
        required
        @change="editModel.abbr = editModel.name"
        @blur="setFuzzySearchItems"
      />

      <v-expand-transition>
        <v-alert
          v-show="!!fuzzySeachItems.length"
          type="info"
          dense
          text
          class="text-subtitle-2"
        >
          類似した既登録現場があります。<br />重複登録に注意してください。
          <ul>
            <li v-for="(item, index) of fuzzySeachItems" :key="index">
              {{ item.name }}
            </li>
          </ul>
        </v-alert>
      </v-expand-transition>
      <g-text-field
        v-model="editModel.abbr"
        label="略称"
        required
        hint="検索に使用されます"
        ignore-surrogate-pair
      />
      <g-text-field
        v-model="editModel.abbrKana"
        label="略称カナ"
        required
        hint="検索に使用されます"
        ignore-surrogate-pair
        input-type="katakana"
      />
      <g-text-field v-model="editModel.abbrNumber" label="略称番号" />
      <g-text-field v-model="editModel.address" label="住所" required />
      <v-row>
        <v-col cols="6">
          <g-date v-model="editModel.startAt" label="開始日" />
        </v-col>
        <v-col cols="6">
          <g-date v-model="editModel.endAt" label="終了日" />
        </v-col>
      </v-row>
      <g-select
        v-model="editModel.securityType"
        label="警備種別"
        :items="$SECURITY_TYPE_ARRAY"
        required
      />
      <g-textarea v-model="editModel.remarks" label="備考" hide-details />
    </v-form>
    <g-checkbox-delete-data v-if="editMode !== CREATE" v-model="forceDelete" />
  </g-card-input-form>
</template>

<style></style>
