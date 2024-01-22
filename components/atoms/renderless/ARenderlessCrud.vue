<script>
/**
 * ### ARenderlessCrud
 * props.modelに指定されたモデルに対するCREATE、UPDATE、DELETEを実行する
 * レンダーレスコンポーネントです。
 * ※modelはFireModelを継承しているものとします。
 *
 * defaultスロットにはprops.modelに対するUIを提供するコンポーネントを配置します。
 * click:submitイベントをemitするsubmitボタン
 * click:cancelイベントをemitするcancelボタン
 * が存在していることを前提としており、スロットプロパティのonを利用することで
 * 簡便にCRUD機能を実装することが可能です。
 * submit()が正常に終了するとsubmit:completeイベントを、
 * submit()で異常が発生した場合はsubmit:errorイベントを、
 * defaultスロットに配置されたコンポーネントからclick:cancelイベントを受け取ると
 * cancelイベントをemitします。
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
  props: {
    customSubmit: { type: Function, default: undefined, required: false },
    editMode: {
      type: String,
      validator: (v) => ['REGIST', 'UPDATE', 'DELETE'].includes(v),
      required: true,
    },
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
   * METHODS
   ***************************************************************************/
  methods: {
    async defaultSubmit(mode) {
      if (mode === 'REGIST') await this.model.create()
      if (mode === 'UPDATE') await this.model.update()
      if (mode === 'DELETE') await this.model.delete()
    },
    async submit() {
      try {
        this.loading = true
        if (this.customSubmit) await this.customSubmit(this.editMode)
        if (!this.customSubmit) await this.defaultSubmit(this.editMode)
        this.$emit('submit:complete')
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
  },
  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render() {
    return this.$scopedSlots.default({
      attrs: {
        editMode: this.editMode,
        loading: this.loading,
      },
      on: {
        'click:cancel': this.onClickCancel,
        'click:submit': this.submit,
      },
    })
  },
}
</script>
