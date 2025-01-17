<script>
/**
 * 現場情報入力コンポーネントです。
 * - 登録モードでは、入力された現場名に類似する既登録現場が存在した場合、アラートを出します。
 * @author shisyamo4131
 * @refact 2025-01-13
 */
import GDate from '~/components/atoms/inputs/GDate.vue'
import GSelect from '~/components/atoms/inputs/GSelect.vue'
import GTextField from '~/components/atoms/inputs/GTextField.vue'
import GAutocompleteCustomer from '~/components/atoms/inputs/GAutocompleteCustomer.vue'
import GTextarea from '~/components/atoms/inputs/GTextarea.vue'
import GMixinEditModeReceiver from '~/mixins/GMixinEditModeReceiver'
import { vueProps } from '~/models/propsDefinition/Site'

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
  },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeReceiver],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    ...vueProps,
    hideCustomer: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      fuzzySeachItems: [],
    }
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    isEditing(v) {
      if (!v) this.fuzzySeachItems.splice(0)
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    setFuzzySearchItems() {
      this.fuzzySeachItems = []
      if (!this.isCreate) return
      if (!this.customerId) return
      if (!this.name) return
      const regex = new RegExp(this.name.split('').join('.*'), 'i') // 'i'は大文字小文字を無視
      this.fuzzySeachItems = this.$store.getters['sites/items'].filter(
        (item) => regex.test(item.name) && item.customerId === this.customerId
      )
    },
  },
}
</script>

<template>
  <div>
    <g-autocomplete-customer
      v-if="!hideCustomer"
      :value="customerId"
      label="取引先"
      required
      @input="$emit('update:customerId', $event)"
      @blur="setFuzzySearchItems"
    />
    <g-text-field
      :value="name"
      label="現場名"
      required
      @input="$emit('update:name', $event)"
      @change="$emit('update:abbr', $event)"
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
            {{ `${item.name} (略称: ${item.abbr})` }}
          </li>
        </ul>
      </v-alert>
    </v-expand-transition>
    <g-text-field
      :value="abbr"
      label="略称"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      @input="$emit('update:abbr', $event)"
    />
    <g-text-field
      :value="abbrKana"
      label="略称カナ"
      required
      hint="検索に使用されます"
      ignore-surrogate-pair
      input-type="katakana"
      @input="$emit('update:abbrKana', $event)"
    />
    <g-text-field
      :value="abbrNumber"
      label="略称番号"
      @input="$emit('update:abbrNumber', $event)"
    />
    <g-text-field
      :value="address"
      label="住所"
      required
      @input="$emit('update:address', $event)"
    />
    <v-row>
      <v-col cols="6">
        <g-date
          :value="startAt"
          label="開始日"
          @input="$emit('update:startAt', $event)"
        />
      </v-col>
      <v-col cols="6">
        <g-date
          :value="endAt"
          label="終了日"
          @input="$emit('update:endAt', $event)"
        />
      </v-col>
    </v-row>
    <g-select
      :value="securityType"
      label="警備種別"
      :items="$SECURITY_TYPE_ARRAY"
      required
      @input="$emit('update:securityType', $event)"
    />
    <g-textarea
      :value="remarks"
      label="備考"
      @input="$emit('update:remarks', $event)"
    />
  </div>
</template>

<style></style>
