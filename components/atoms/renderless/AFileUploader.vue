<script>
/**
 * ### AFileUploader
 *
 * 概要:
 * ファイルをStorageにアップロードする機能を提供するレンダーレスコンポーネントです。
 * defaultスロットにファイルを指定するためのInputコンポーネントを配置して使用します。
 *
 * 機能の詳細:
 * - ファイル指定コンポーネントにv-file-inputを使用することが前提で作られています。
 * - アップロードするファイルは`props.noCompress`をtrueにしない場合、既定で2M以下に圧縮されます。
 * - 圧縮サイズは`props.compressOptions`で変更可能です。
 * - `props.thumb`を指定するとthumbディレクトリにthumbファイルをアップロードします。
 * - thumbファイルは200kb以下に収まるように圧縮されます。
 *
 * @props
 * @prop {string} accept - 受け入れるファイル形式です。
 * @prop {object} compressOptions - 圧縮設定です。
 * @prop {string} directory - アップロード先のディレクトリパスです。
 * @prop {string} fileName - アップロードファイルの名前です。
 * @prop {boolean} noCompress - trueにするとファイルを圧縮せずにアップロードします。
 * @prop {boolean} noThumb - trueにするとthumbファイルをアップロードしません。
 * @prop {string} thumb - thumbファイルのアップロード先ディレクトリです。
 *
 * @slots
 * @slot default - デフォルトスロットです。ファイル選択のためのコンポーネントを配置します。
 *  - attrs: VFileInputにバインドします。
 *    `props.accept`を同期させるほか、disabledプロパティの制御と選択されたファイルオブジェクトとのバインディングを行います。
 *  - on: VFileInputにバインドします。
 *    VFileInputのchangeイベントを監視します。
 *  - uploader: attrsとonプロパティをコンポーネントのsubmitボタンにバインドします。
 *    attrsはsubmitボタンのdisapbedプロパティとloadingプロパティを制御します。
 *    onはclickイベントを監視し、upload()を実行します。
 *
 * @events
 * @event upload:complete - アップロードが完了するとファイルのURL情報オブジェクトとともにemitされます。
 * @event upload:error - アップロードに失敗するとerrorオブジェクトとともにemitされます。
 *
 * @author shisyamo4131
 * @create 2024-07-03
 * @version 1.0.0
 */
import { uploadFile } from 'air-firebase'
import imageCompression from 'browser-image-compression'
export default {
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    accept: { type: String, default: 'image/*', required: false },
    compressOptions: {
      type: Object,
      default: () => ({ maxSizeMB: 2 }),
      required: false,
    },
    directory: { type: String, required: true },
    fileName: { type: String, required: true },
    noCompress: { type: Boolean, default: false, required: false },
    noThumb: { type: Boolean, default: false, required: false },
    thumb: { type: String, default: 'thumb', required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      file: null,
      loading: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * `props.fileName`で指定された値とスロットから受け取ったファイルオブジェクトの
     * 拡張子からアップロードするファイルの名前を生成して返します。
     * - `props.fileName`が指定されていなければundefinedを返します。
     * - `data.file`が指定されていなければundefinedを返します。
     * - 拡張子は必ず小文字に統一されます。
     */
    uploadFileName() {
      if (!this.fileName || !this.file) return undefined
      const extension = this.file.name.split('.').pop()
      if (!extension) throw new Error('拡張子が取得できません。')
      return `${this.fileName}.${extension.toLowerCase()}`
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    initialize() {
      this.file = null
    },
    /**
     * ファイルをオブジェクトを圧縮して返します。
     * - `props.noCompress`がfalseの場合は`data.file`をそのまま返します。
     *
     * @param {object} options - 圧縮設定
     * @return 圧縮後のファイルオブジェクト
     */
    async compressImage(options) {
      if (this.noCompress) return this.file
      try {
        return await imageCompression(this.file, options)
      } catch (error) {
        // eslint-disable-next-line
        console.error('compressImage()でエラーが発生しました。', error)
        throw error
      }
    },
    /**
     * ファイルオブジェクトをアップロードします。
     */
    async upload() {
      // `computed.uploadFileName`がundefinedであれば処理終了
      if (!this.uploadFileName) return
      // アップロード先のパスを用意
      const path = {
        original: `${this.directory}/${this.uploadFileName}`,
        thumb: `${this.directory}/${this.thumb}/${this.uploadFileName}`,
      }
      // アップロード後のファイルパスを格納する変数を用意
      const result = { url: '', thumb: '' }
      this.loading = true
      try {
        // originalをアップロード
        const file = await this.compressImage(this.compressOptions)
        result.url = await uploadFile(file, path.original)
        // thumbをアップロード
        if (!this.noThumb) {
          const thumb = await this.compressImage({ maxSizeMB: 0.2 })
          result.thumb = await uploadFile(thumb, path.thumb)
        }
        this.file = null
        this.$emit('upload:complete', result)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        this.$emit('upload:error', err)
      } finally {
        this.loading = false
      }
    },
  },
  /***************************************************************************
   * RENDER
   ***************************************************************************/
  render() {
    return this.$scopedSlots.default({
      attrs: {
        accept: this.accept,
        disabled: this.loading,
        value: this.file,
      },
      on: {
        change: (v) => (this.file = v),
      },
      uploader: {
        attrs: {
          disabled:
            !this.fileName || !this.directory || !this.file || this.loading,
          loading: this.loading,
        },
        on: { click: this.upload },
      },
    })
  },
}
</script>
