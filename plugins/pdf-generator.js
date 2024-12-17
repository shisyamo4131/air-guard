import pdfMake from 'pdfmake/build/pdfmake'

/**
 * フォントファイルを読み込んで Virtual File System (VFS) に登録する関数。
 *
 * - フォントは PDF 内で日本語を正しく表示するために使用されます。
 * - 非同期関数として実行され、フォントファイルの読み込みに失敗した場合は例外をスローします。
 *
 * @returns {Promise<Object>} - 読み込んだフォントのバイナリデータを含むオブジェクト。
 * @throws {Error} - フォントファイルの取得に失敗した場合にエラーをスローします。
 */
async function loadFonts() {
  try {
    return {
      'NotoSansJP-Regular.ttf': await fetch(
        '/fonts/NotoSansJP/NotoSansJP-Regular.ttf'
      ).then((res) => res.arrayBuffer()),
      'NotoSansJP-Bold.ttf': await fetch(
        '/fonts/NotoSansJP/NotoSansJP-Bold.ttf'
      ).then((res) => res.arrayBuffer()),
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error('フォントの読み込みに失敗しました:', error)
    alert('フォントファイルの読み込みに失敗しました。再試行してください。')
    throw error // フォント読み込み失敗時に例外をスロー
  }
}

/**
 * PDFドキュメントを生成するラッパー関数。
 *
 * - フォント読み込みを行い、pdfMake の設定を初期化します。
 * - PDFのダウンロードまたはブラウザでの表示が可能です。
 * - デフォルトの日本語フォントを保持しつつ、指定された defaultStyle を適用します。
 * - エラーハンドリングを備え、処理中の問題をユーザーに通知します。
 *
 * @param {Object} docDefinition - PDFの内容を定義するオブジェクト。
 *                                  詳細は pdfMake のドキュメントを参照。
 * @param {string|null} fileName - PDFを保存する際のファイル名。未指定の場合はタイムスタンプ付きのデフォルト名が使用されます。
 * @param {boolean} download - PDFをダウンロードするかどうかのフラグ。
 *                             true: PDFをダウンロード, false: ブラウザでPDFを開く。
 * @returns {Promise<void>} - 非同期処理としてPDF生成を行う。
 */
export const generatePDF = async (
  docDefinition,
  fileName = null,
  download = false
) => {
  let fonts

  try {
    // フォントの読み込み
    fonts = await loadFonts()
    pdfMake.vfs = fonts // 読み込んだフォントデータを Virtual File System に設定

    // フォント設定
    pdfMake.fonts = {
      NotoSansJP: {
        normal: 'NotoSansJP-Regular.ttf',
        bold: 'NotoSansJP-Bold.ttf',
      },
    }
  } catch (error) {
    // フォント読み込み失敗時の処理（ここで関数を終了）
    // eslint-disable-next-line
    console.error(
      'フォント読み込み中にエラーが発生しました。PDF生成を中止します。'
    )
    return
  }

  try {
    // デフォルトスタイルの日本語フォントを保持しつつ、ユーザー指定のスタイルを適用
    const defaultStyle = docDefinition.defaultStyle || {}
    const mergedDefaultStyle = {
      font: defaultStyle.font || 'NotoSansJP',
      ...defaultStyle,
    }

    const mergedDocDefinition = {
      ...docDefinition,
      defaultStyle: mergedDefaultStyle,
    }

    // PDF インスタンスの作成
    const pdfDocGenerator = pdfMake.createPdf(mergedDocDefinition)

    // ファイル名が指定されていない場合はタイムスタンプ付きのデフォルト名を生成
    const generatedFileName = fileName || `generated-${Date.now()}.pdf`

    if (download) {
      // PDF をダウンロード
      pdfDocGenerator.download(generatedFileName)
    } else {
      // ブラウザで開く
      pdfDocGenerator.open()
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error('PDF生成中にエラーが発生しました:', error)
    alert('PDFの生成に失敗しました。内容を確認してください。')
  }
}
