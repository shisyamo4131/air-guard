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
        await context.store.dispatch('company-info/subscribe')
        await context.store.dispatch('users/subscribe')
        await context.store.dispatch('customers/subscribe')
        await context.store.dispatch('sites/subscribe')
        await context.store.dispatch('employees/subscribe')
        await context.store.dispatch('outsourcers/subscribe')
        await context.store.dispatch('equipments/subscribe')
        await context.store.dispatch('employee-contracts/subscribe')
        await context.store.dispatch('allowances/subscribe')
        await context.store.dispatch('air-guard/subscribe')
      } else if (!user && DISACTIVATE) {
        await context.store.dispatch(DISACTIVATE)
        await context.store.dispatch('systems/unsubscribe')
        await context.store.dispatch('company-info/unsubscribe')
        await context.store.dispatch('users/unsubscribe')
        await context.store.dispatch('customers/unsubscribe')
        await context.store.dispatch('sites/unsubscribe')
        await context.store.dispatch('employees/unsubscribe')
        await context.store.dispatch('outsourcers/unsubscribe')
        await context.store.dispatch('equipments/unsubscribe')
        await context.store.dispatch('employee-contracts/unsubscribe')
        await context.store.dispatch('allowances/unsubscribe')
        await context.store.dispatch('air-guard/unsubscribe')
      }
      resolve()
    })
  })
}
