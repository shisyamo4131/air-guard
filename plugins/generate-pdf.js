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
const generatePdf = async ({
  content = [],
  background = null,
  download = false,
  options = null,
} = {}) => {
  try {
    // pdfmakeのモジュールはクライアントサイドでのみ読み込み
    const { default: pdfMake } = await import('pdfmake/build/pdfmake')

    // vfs に日本語フォントを設定
    pdfMake.vfs = {
      'NotoSansJP-Regular.ttf': await fetch(
        '/fonts/NotoSansJP/NotoSansJP-Regular.ttf'
      ).then((res) => res.arrayBuffer()),
      'NotoSansJP-Bold.ttf': await fetch(
        '/fonts/NotoSansJP/NotoSansJP-Bold.ttf'
      ).then((res) => res.arrayBuffer()),
    }

    // フォント設定
    pdfMake.fonts = {
      NotoSansJP: {
        normal: 'NotoSansJP-Regular.ttf',
        bold: 'NotoSansJP-Bold.ttf',
      },
    }

    // PDF ドキュメントの定義
    const docDefinition = {
      defaultStyle: {
        font: 'NotoSansJP', // デフォルトフォントをNotoSansJPに設定
      },
      background,
      content,
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' / ' + pageCount.toString(), // 現在のページ番号と総ページ数
          alignment: 'center', // ページ番号を中央揃え
          fontSize: 8,
        }
      },
      ...options,
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
