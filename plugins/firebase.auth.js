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
 * @version 1.3.0
 *
 * @updates
 * - version 1.3.0 - 2024-07-30 - `users/subscribe`を追加
 *                                `users/unsubscribe`を追加
 * - version 1.2.0 - 2024-07-25 - `sites/subscribe`を追加
 *                                `sites/unsubscribe`を追加
 * - version 1.1.0 - 2024-07-24 - `employee-contracts/subscribe`を追加
 *                              ‐ `employee-contracts/unsubscribe`を追加
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import { onAuthStateChanged } from 'firebase/auth'

// Specifies the name of the action in Vuex to be called.
const ACTIVATE = 'auth/activate'
const DISACTIVATE = 'auth/disactivate'

export default (context) => {
  return new Promise((resolve) => {
    const auth = context.app.$auth
    onAuthStateChanged(auth, async (user) => {
      if (user && ACTIVATE) {
        await context.store.dispatch(ACTIVATE, user)
        await context.store.dispatch('users/subscribe')
        await context.store.dispatch('customers/subscribe')
        await context.store.dispatch('sites/subscribe')
        await context.store.dispatch('employees/subscribe')
        await context.store.dispatch('employee-contracts/subscribe')
      } else if (!user && DISACTIVATE) {
        await context.store.dispatch(DISACTIVATE)
        await context.store.dispatch('users/unsubscribe')
        await context.store.dispatch('customers/unsubscribe')
        await context.store.dispatch('sites/unsubscribe')
        await context.store.dispatch('employees/unsubscribe')
        await context.store.dispatch('employee-contracts/unsubscribe')
      }
      resolve()
    })
  })
}
