import { getAuth } from 'firebase-admin/auth'
import { logger } from 'firebase-functions/v2'
import {
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
const auth = getAuth()

/**
 * addAdminClaim
 */
export const addAdminClaim = onDocumentCreated(
  'admin_users/{docID}',
  async (event) => {
    const newAdminUser = event.data.data()
    if (newAdminUser === undefined) return
    await modifyRole(newAdminUser.uid, 'admin', true)
  }
)

/**
 * removeAdminClaim
 */
export const removeAdminClaim = onDocumentDeleted(
  'admin_users/{docID}',
  async (event) => {
    const deletedAdminUser = event.data.data()
    if (deletedAdminUser === undefined) return
    await modifyRole(deletedAdminUser.uid, 'admin', true)
  }
)

/**
 * addDeveloperClaim
 */
export const addDeveloperClaim = onDocumentCreated(
  'developer_users/{docID}',
  async (event) => {
    const newDeveloperUser = event.data.data()
    if (newDeveloperUser === undefined) return
    await modifyRole(newDeveloperUser.uid, 'developer', true)
  }
)

/**
 * removeDeveloperClaim
 */
export const removeDeveloperClaim = onDocumentDeleted(
  'developer_users/{docID}',
  async (event) => {
    const deletedDeveloperUser = event.data.data()
    if (deletedDeveloperUser === undefined) return
    await modifyRole(deletedDeveloperUser.uid, 'developer', true)
  }
)

/**
 * modifyRole
 * @param {string} uid
 * @param {object} role
 */
async function modifyRole(uid, key, value) {
  try {
    const user = await auth.getUser(uid).catch(() => {
      logger.warn(
        'Cannot get Authentication user data by uid. You can ignore this warning if this function triggered due to Authentication user deleted.',
        {
          function: 'modifyRole',
          uid,
        }
      )
    })
    if (user === undefined) return
    let roles = user.customClaims?.roles || []
    if (value) roles.push(key)
    if (!value) roles = roles.filter((item) => item !== key)
    const newRoles = [...new Set(roles)]
    await auth.setCustomUserClaims(uid, { roles: newRoles })
  } catch (error) {
    logger.error(error)
  }
}
