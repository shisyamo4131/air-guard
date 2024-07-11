/**
 * ### Site.js
 *
 * 概要:
 * Siteクラスは、現場情報を管理するためのモデルクラスです。
 * FireModelクラスを継承し、Firestoreとの連携やCRUD操作を簡素化します。
 *
 * 主な機能:
 * - Firestoreコレクション 'Sites' に対するCRUD操作
 * - PlacementDetailsコレクションとのリレーションを管理
 * - 現場情報のトークンフィールドによる検索サポート
 *
 * 使用例:
 * ---------------------------------------------------------------
 * import { firestore, auth } from '@/plugins/firebase';
 * import Site from '@/models/Site';
 *
 * const site = new Site({ firestore, auth }, { name: 'Sample Site', address: 'Sample Address' });
 * site.create().then(docRef => {
 *   console.log('Document created with ID: ', docRef.id);
 * });
 * ---------------------------------------------------------------
 *
 * props設定:
 * このクラスで管理するプロパティは、props.propsの中でvueコンポーネントのpropsのルールに合わせて定義しています。
 * これにより、Mixinsを利用することでクラスに依存するコンポーネントのpropsを一元管理できます。
 *
 * injectの利用:
 * Nuxtのinjectを利用してコンポーネントからのアクセスを容易にすることも可能です。
 * plugins/models.js:
 * ---------------------------------------------------------------
 * import Site from '../models/Site'
 *
 * export default (context, inject) => {
 *   const firebase = {
 *     firestore: context.app.$firestore,
 *     auth: context.app.$auth,
 *   }
 *   inject('Site', (item) => new Site(firebase, item))
 * }
 * ---------------------------------------------------------------
 *
 * #### 更新履歴:
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * 注意事項:
 * このクラスはNuxt.jsのコンテキストに依存しないよう設計されていますが、
 * FirestoreとAuthenticationインスタンスを渡す必要があります。
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    customer: { type: Object, default: null, required: false },
    code: { type: String, default: '', required: false },
    name: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    abbrNumber: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    startAt: { type: String, default: '', required: false },
    endAt: { type: String, default: '', required: false },
    securityType: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
    favorite: { type: Boolean, default: false, required: false },
    sync: { type: Boolean, default: false, required: false },
    // for spot site and bulk create.
    isSpot: { type: Boolean, default: false, required: false },
    defaultDates: { type: Array, default: () => [], required: false },
    defaultSchedule: { type: Object, default: () => ({}), required: false },
  },
}
export { props }

export default class Site extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Sites'
    // this.hasMany = [
    //   {
    //     collection: 'PlacementDetails',
    //     field: 'siteId',
    //     condition: '==',
    //     type: 'collection',
    //   },
    // ]
    this.tokenFields = ['abbr', 'abbrKana']
    this.initialize(item)
  }

  /**
   * 初期化メソッド
   * @param {object} item - 初期化するアイテムオブジェクト
   */
  initialize(item = {}) {
    // デフォルト値を設定
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    // 親クラスのinitializeメソッドを呼び出し
    super.initialize(item)
  }
}
