<script>
/**
 * ### GLeaveApplicationCalendar
 * @author shisyamo4131
 */
import { where } from 'firebase/firestore'
import GCalendar from '../atoms/calendars/GCalendar.vue'
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GDialogLoading from '../molecules/dialogs/GDialogLoading.vue'
import GDialogEditorLeaveApplication from './GDialogEditorLeaveApplication.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GCalendar,
    GDialogEditorLeaveApplication,
    GBtnRegistIcon,
    GDialogLoading,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    employeeId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      editor: false,
      items: [],
      loading: false,
      model: {
        parent: this.$LeaveApplication(),
        child: this.$EmployeeLeaveApplication(),
      },
      currentDate: this.$dayjs().format('YYYY-MM-DD'),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    events() {
      return this.items.map((item) => {
        return {
          name: this.$LEAVE_APPLICATION_TYPE[item.type],
          start: new Date(item.docId),
          color: 'secondary',
          data: item,
        }
      })
    },
    month() {
      return this.$dayjs(this.currentDate).format('YYYY-MM')
    },
    from() {
      return this.$dayjs(this.currentDate)
        .startOf('month')
        .startOf('week')
        .format('YYYY-MM-DD')
    },
    to() {
      return this.$dayjs(this.currentDate)
        .endOf('month')
        .endOf('week')
        .format('YYYY-MM-DD')
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    employeeId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.model.child.employeeId = newVal
        this.subscribe()
      },
      immediate: true,
    },
    from(newVal, oldVal) {
      if (newVal === oldVal) return
      this.subscribe()
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    this.model.child.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    subscribe() {
      this.items = this.model.child.subscribe(undefined, [
        where('docId', '>=', this.from),
        where('docId', '<=', this.to),
      ])
    },
    onClickRegist() {
      this.model.parent.initialize({
        employeeId: this.employeeId,
        requestDate: this.$dayjs().format('YYYY-MM-DD'),
      })
      this.$refs.editor.initialize({
        item: this.model.parent,
        editMode: 'REGIST',
      })
      this.editor = true
    },
    async onClickUpdate(data) {
      this.loading = true
      try {
        const parentId = data.leaveApplicationId
        await this.model.parent.fetchDoc(parentId)
        this.$refs.editor.initialize({
          item: this.model.parent,
          editMode: 'UPDATE',
        })
        this.editor = true
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" class="d-flex flex-column" v-on="$listeners">
    <v-card-title class="g-card__title"
      >休暇申請
      <g-dialog-editor-leave-application ref="editor" v-model="editor">
        <template #activator="{ attrs }">
          <g-btn-regist-icon
            v-bind="attrs"
            color="primary"
            @click="onClickRegist"
          />
        </template>
      </g-dialog-editor-leave-application>
    </v-card-title>
    <v-container fluid class="d-flex flex-column flex-grow-1">
      <div class="d-flex mb-2 align-center" style="column-gap: 4px">
        <v-btn
          color="primary"
          small
          outlined
          @click="currentDate = $dayjs().format('YYYY-MM-DD')"
          >今月</v-btn
        >
        <v-btn icon @click="$refs.calendar.prev()"
          ><v-icon>mdi-chevron-left</v-icon></v-btn
        >
        <span>{{ month }}</span>
        <v-btn icon @click="$refs.calendar.next()"
          ><v-icon>mdi-chevron-right</v-icon></v-btn
        >
      </div>
      <div class="flex-grow-1">
        <g-calendar
          ref="calendar"
          v-model="currentDate"
          color="primary"
          :events="events"
          @click:event="onClickUpdate($event.event.data)"
        />
      </div>
    </v-container>
    <g-dialog-loading v-model="loading" />
  </v-card>
</template>

<style></style>
