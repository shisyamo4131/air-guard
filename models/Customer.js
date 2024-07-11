/**
 * ### Customer.js
 *
 * 概要:
 * Customerクラスは、取引先情報を管理するためのモデルクラスです。
 * FireModelクラスを継承し、Firestoreとの連携やCRUD操作を簡素化します。
 *
 * 主な機能:
 * - Firestoreコレクション 'Customers' に対するCRUD操作
 * - Sitesコレクションとのリレーションを管理
 * - 取引先情報のトークンフィールドによる検索サポート
 *
 * 使用例:
 * ---------------------------------------------------------------
 * import { firestore, auth } from '@/plugins/firebase';
 * import Customer from '@/models/Customer';
 *
 * const customer = new Customer({ firestore, auth }, { name1: 'Sample', name2: 'Example' });
 * customer.create().then(docRef => {
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
 * import Customer from '../models/Customer'
 *
 * export default (context, inject) => {
 *   const firebase = {
 *     firestore: context.app.$firestore,
 *     auth: context.app.$auth,
 *   }
 *   inject('Customer', (item) => new Customer(firebase, item))
 * }
 * ---------------------------------------------------------------
 *
 * 更新履歴:
 * version 1.1.1 - 2024-07-09 - propsにdocIdを追加
 * version 1.1.0 - 2024-07-08 - AirGuard(MS)との同期済みフラグとして`sync`を追加
 * version 1.0.0 - 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このクラスはNuxt.jsのコンテキストに依存しないよう設計されていますが、
 * FirestoreとAuthenticationインスタンスを渡す必要があります。
 *
 * @version 1.1.1
 * @author shisyamo4131
 */

import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    code: { type: String, default: '', required: false },
    name1: { type: String, default: '', required: false },
    name2: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    zipcode: { type: String, default: '', required: false },
    address1: { type: String, default: '', required: false },
    address2: { type: String, default: '', required: false },
    tel: { type: String, default: '', required: false },
    fax: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    deadline: { type: String, default: '99', required: false },
    depositMonth: { type: Number, default: 1, required: false },
    depositDate: { type: String, default: '99', required: false },
    remarks: { type: String, default: '', required: false },
    sync: { type: Boolean, default: false, required: false },
  },
}
export { props }

/**
 * ## Customer
 * @author shisyamo4131
 */
export default class Customer extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Customers'
    this.hasMany = [
      {
        collection: 'Sites',
        field: 'customer.docId',
        condition: '==',
        type: 'collection',
      },
    ]
    this.tokenFields = ['abbr', 'abbrKana']
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
