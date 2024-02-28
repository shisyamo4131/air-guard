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
        await context.store.dispatch('employees/subscribe')
      } else if (!user && DISACTIVATE) {
        await context.store.dispatch(DISACTIVATE)
        await context.store.dispatch('employees/unsubscribe')
      }
      resolve()
    })
  })
}
