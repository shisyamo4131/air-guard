<template>
  <g-template-index :lazy-search.sync="search"> </g-template-index>
</template>

<script>
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
export default {
  components: { GTemplateIndex },
  data() {
    return {
      search: null,
    }
  },
}
</script>

<style></style>
