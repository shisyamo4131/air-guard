/**
 * generatePdf - Nuxt.jsプロジェクトでPDFを生成するためのユーティリティ関数。
 *
 * この関数は、pdfmakeライブラリを使用して、PDFを生成します。
 *
 * - content: PDFに表示する内容を配列として指定します。
 * - download: trueの場合、PDFを直接ダウンロード。falseの場合、PDFをブラウザ上で表示。
 *
 * フォントには日本語フォント(GenShin)を使用しており、vfs_fonts.jsに格納されたフォントを
 * 使用することで日本語のPDFを生成できます。
 *
 * 利用方法:
 * - このファイルをNuxtのプラグインとしてインポートし、injectを使ってアプリ全体で使用可能にします。
 * - コンポーネント内では this.$generatePdf() で呼び出します。
 *
 * 例:
 * this.$generatePdf({
 *   content: [
 *     { text: '日本語対応のPDFを生成しています！', fontSize: 16 },
 *     { text: 'Nuxt.jsとpdfmakeを使用しています。', fontSize: 12 },
 *   ],
 *   download: false // ブラウザでPDFを表示する場合
 * });
 *
 * @param {Object} options - PDF生成のオプション。
 * @param {Array} options.content - PDFに表示する内容の配列。各要素はテキストや画像など。
 * @param {boolean} [options.download=false] - trueの場合はPDFをダウンロード、falseの場合はブラウザで表示。
 */
const generatePdf = async ({ content = [], download = false } = {}) => {
  try {
    // pdfmakeのモジュールはクライアントサイドでのみ読み込み
    const { default: pdfMake } = await import('pdfmake/build/pdfmake')

    // 日本語フォントを読み込む
    const { default: pdfFonts } = await import('@/static/vfs_fonts')

    // vfs に日本語フォントを設定
    pdfMake.vfs = pdfFonts.pdfMake.vfs

    // フォント設定
    pdfMake.fonts = {
      GenShin: {
        normal: 'genshin-normal.ttf',
        bold: 'genshin-bold.ttf',
      },
    }

    // PDF ドキュメントの定義
    const docDefinition = {
      defaultStyle: {
        font: 'GenShin', // デフォルトフォントを日本語フォントに設定
      },
      content,
    }

    if (download) {
      // PDF を生成してブラウザでダウンロード
      pdfMake.createPdf(docDefinition).download('sample.pdf')
    } else {
      // ブラウザで開く
      pdfMake.createPdf(docDefinition).open()
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error('PDFの生成中にエラーが発生しました:', error)
  }
}
export default (context, inject) => {
  inject('generatePdf', (args) => generatePdf(args))
}
