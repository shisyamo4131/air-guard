<script>
import GBtnRegistIcon from '~/components/atoms/btns/GBtnRegistIcon.vue'
import GInputAutonumber from '~/components/molecules/inputs/GInputAutonumber.vue'
import Autonumber from '~/models/Autonumber'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import GTemplateIndex from '~/components/templates/GTemplateIndex.vue'
import GDialogInput from '~/components/molecules/dialogs/GDialogInput.vue'
import GDataTableAutonumbers from '~/components/molecules/tables/GDataTableAutonumbers.vue'
export default {
  /***************************************************************************
   * NAME
   ***************************************************************************/
  name: 'AutonumbersIndex',
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GBtnRegistIcon,
    GInputAutonumber,
    GTemplateIndex,
    GDialogInput,
    GDataTableAutonumbers,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      instance: new Autonumber(),
      items: [],
      listener: new Autonumber(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {},
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (!v) {
        this.instance.initialize()
        this.editMode = this.CREATE
      }
    },
  },
  /***************************************************************************
   * MOUNTED
   ***************************************************************************/
  mounted() {
    this.items = this.listener.subscribeDocs()
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    onClickRow(item) {
      // 詳細ページが出来上がったらこちらを適用
      // this.$router.push(`/customers/${item.docId}`)
      this.instance.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
    },
  },
}
</script>

<template>
  <g-template-index label="自動採番管理" :items="items">
    <template #append-search>
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-autonumber
            v-bind="attrs"
            :edit-mode="editMode"
            :instance="instance"
            v-on="on"
          />
        </template>
      </g-dialog-input>
    </template>
    <template #default="{ attrs, on, search }">
      <g-data-table-autonumbers
        v-bind="attrs"
        :search="search"
        @click:row="onClickRow"
        v-on="on"
      />
    </template>
  </g-template-index>
</template>

<style></style>
