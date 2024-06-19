<script>
import { VCalendar } from 'vuetify/lib'
/**
 * ### GCalendar
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * EXTENDS
   ***************************************************************************/
  extends: VCalendar,
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    color: { type: String, default: 'primary', required: false },
    dayFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getDate(),
      required: false,
    },
    locale: { type: String, default: 'ja-jp', required: false },
    monthFormat: {
      type: Function,
      default: (timestamp) => new Date(timestamp.date).getMonth() + 1 + ' /',
      required: false,
    },
    weekdays: {
      type: Array,
      default: () => [1, 2, 3, 4, 5, 6, 0],
      required: false,
    },
  },
}
</script>
