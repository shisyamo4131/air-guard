<script>
import EditMode from '~/mixins/GMixinEditMode'
/**
 * ### ARenderlessCrud[should be deleted]
 * props.modelに指定されたモデルに対するCREATE、UPDATE、DELETEを実行する
 * レンダーレスコンポーネントです。
 * ※modelはFireModelを継承しているものとします。
 *
 * slots.defaultはprops.modelに対するINPUTコンポーネントへ提供するための
 * スロットプロパティattrs, onを提供します。
 * attrs: props.modelの各プロパティ値をv-bindするためのプロパティです。
 * on: INPUTコンポーネントからemitされたupdateイベントを取得するためのリスナープロパティです。
 * 同時に、UIテンプレートへ状態を提供するためのスロットプロパティstatus, actionsを
 * 提供します。
 * status: editMode（編集モード）、loading（処理中であることを表す）
 * actions: UIテンプレートからemitされるclick:cancel, click:submitイベントを取得するためのリスナープロパティです。
 *
 * CREATE、UPDATE、DELETEのどれが実行されるかは、props.editModeに
 * 指定されている値に依存します。
 *
 * props.customSubmitを指定することでsubmit()の規定の動きを変更することができます。
 * props.customSubmitはPromiseを返さなくてはなりません。
 * 引数としてeditModeが与えられます。
 *
 * NOTE: INPUTコンポーネントに対する入力の検証は行いません。
 *
 * @author shisyamo4131
 */
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  mixins: [EditMode],
  props: {
    customSubmit: { type: Function, default: undefined, required: false },
    // editMode: {
    //   type: String,
    //   validator: (v) => ['REGIST', 'UPDATE', 'DELETE'].includes(v),
    //   required: true,
    // },
    model: { type: Object, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      loading: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    attrs() {
      return { ...this.model, editMode: this.editMode }
    },
    on() {
      const result = {}
      Object.keys(this.model).forEach((key) => {
        result[`update:${key}`] = ($event) => {
          this.model.initialize({ ...this.model, [key]: $event })
        }
      })
      return result
    },
    status() {
      return {
        editMode: this.editMode,
        loading: this.loading,
      }
    },
    actions() {
      return {
        'click:delete': this.onClickDelete,
        'click:cancel': this.onClickCancel,
        'click:submit': this.onClickSubmit,
      }
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    async defaultSubmit(mode) {
      if (mode === 'REGIST') await this.model.create()
      if (mode === 'UPDATE') await this.model.update()
      if (mode === 'DELETE') await this.model.delete()
    },
    async submit(mode) {
      try {
        this.loading = true
        if (this.customSubmit) await this.customSubmit(mode)
        if (!this.customSubmit) await this.defaultSubmit(mode)
        this.$emit(`submit:complete`, mode)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        this.$emit('submit:error')
      } finally {
        this.loading = false
      }
    },
    onClickCancel() {
      this.$emit('cancel')
    },
    onClickDelete() {
      this.submit('DELETE')
    },
    onClickSubmit() {
      this.submit(this.editMode)
    },
  },
  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render() {
    return this.$scopedSlots.default({
      attrs: this.attrs,
      on: this.on,
      status: this.status,
      actions: this.actions,
    })
  },
}
</script>
