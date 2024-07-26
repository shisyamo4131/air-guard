/**
 * ## SiteOperationScheduleBulk.js
 *
 * ### 概要
 * 現場の稼働予定を一括登録するためのデータモデルです。
 *
 * ### 機能詳細:
 * 現場の稼働予定（SiteOperationSchedule）を一括で登録することができるようにするためのデータモデルです。
 * 保有するプロパティは`date`が配列であること以外、すべて`SiteOperationSchedule`と同一です。
 * 当該データモデルがFirestoreにドキュメントを作成すると、Cloud Functionsにより`date`配列に指定された
 * すべての日について`SiteOperationSchedule`ドキュメントを作成します。
 *
 * ### 注意事項:
 * - Cloud Functionsが`SiteOperationSchedule`ドキュメントを作成する際、同一日のドキュメントは上書きされます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-26 - 初版作成
 */

import { props } from './SiteOperationSchedule'
import FireModel from './FireModel'

props.props.date = { type: Array, default: () => [], required: false }
export { props }

export default class SiteOperationScheduleBulk extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'SiteOperationScheduleBulks'
    this.tokenFields = []
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}
