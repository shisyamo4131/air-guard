<script>
/**
 * ### GTemplateIndex
 * @author shisyamo4131
 */
import ATextFieldSearch from '../atoms/inputs/ATextFieldSearch.vue'
import GTemplateDefault from './GTemplateDefault.vue'
export default {
  components: { GTemplateDefault, ATextFieldSearch },
  props: {
    search: { type: [String, Object], default: null, required: false },
  },
  computed: {
    searchBarAttrs() {
      return { value: this.search }
    },
    searchBarOn() {
      return {
        input: ($event) => this.$emit('update:search', $event),
      }
    },
    toolbarHeight() {
      if (this.$vuetify.breakpoint.smAndDown) return 56
      return 64
    },
  },
}
</script>

<template>
  <g-template-default v-bind="$attrs">
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>
    <template #default="{ height }">
      <v-toolbar flat>
        <slot
          name="search-bar"
          v-bind="{ attrs: searchBarAttrs, on: searchBarOn }"
        >
          <a-text-field-search
            :value="search"
            @input="$emit('update:search', $event)"
          />
        </slot>
      </v-toolbar>
      <div class="overflow-y-auto" :style="{ height: height - toolbarHeight }">
        <slot name="default" v-bind="{ height: height - toolbarHeight }" />
      </div>
    </template>
  </g-template-default>
</template>

<style></style>
