/**
 * firebase.auth.js
 * (c) 2023 shisyamo4131
 *
 * Use onAuthStateChanged to monitor the user's authentication state.
 * When there is a change in authentication state, Vuex actions are called.
 * The actions in Vuex to be called should be specified in the ACTIVATE and DISACTIVATE variables.
 *
 * [NOTE]
 * The actions must return the Promise.
 *
 * @author shisyamo4131
 * @version 2.2.0
 *
 * @updates
 * - version 2.2.0 - 2024-10-15 - Vuex による System ドキュメントの監視処理を追加
 * - version 2.1.0 - 2024-10-09 - `employee-contracts/subscribe`を削除
 *                              ‐ `employee-contracts/unsubscribe`を削除
 * - version 2.0.0 - 2024-09-06 - firebase.authを'air-firebase'に切り替え
 *                              - `outsourcers/subscribe`を追加
 *                              - `outsourcers/unsubscribe`を追加
 *                              - `equipments/subscribe`を追加
 *                              - `equipments/unsubscribe`を追加
 * - version 1.3.0 - 2024-07-30 - `users/subscribe`を追加
 *                                `users/unsubscribe`を追加
 * - version 1.2.0 - 2024-07-25 - `sites/subscribe`を追加
 *                                `sites/unsubscribe`を追加
 * - version 1.1.0 - 2024-07-24 - `employee-contracts/subscribe`を追加
 *                              ‐ `employee-contracts/unsubscribe`を追加
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'air-firebase'

// Specifies the name of the action in Vuex to be called.
const ACTIVATE = 'auth/activate'
const DISACTIVATE = 'auth/disactivate'

export default (context) => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user && ACTIVATE) {
        await context.store.dispatch(ACTIVATE, user)
        await context.store.dispatch('systems/subscribe')
        await context.store.dispatch('users/subscribe')
        await context.store.dispatch('customers/subscribe')
        await context.store.dispatch('sites/subscribe')
        await context.store.dispatch('employees/subscribe')
        await context.store.dispatch('outsourcers/subscribe')
        await context.store.dispatch('equipments/subscribe')
        await context.store.dispatch('employee-contracts/subscribe')
      } else if (!user && DISACTIVATE) {
        await context.store.dispatch(DISACTIVATE)
        await context.store.dispatch('systems/unsubscribe')
        await context.store.dispatch('users/unsubscribe')
        await context.store.dispatch('customers/unsubscribe')
        await context.store.dispatch('sites/unsubscribe')
        await context.store.dispatch('employees/unsubscribe')
        await context.store.dispatch('outsourcers/unsubscribe')
        await context.store.dispatch('equipments/unsubscribe')
        await context.store.dispatch('employee-contracts/unsubscribe')
      }
      resolve()
    })
  })
}
