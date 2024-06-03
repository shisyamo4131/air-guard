const functions = require('firebase-functions')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

exports.onCreate = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(async (user) => {
    const uid = user.uid
    const docRef = firestore.collection('Users').doc(uid)
    await docRef.set({ docId: docRef.id, uid: user.uid })
  })

exports.onDelete = functions
  .region('asia-northeast1')
  .auth.user()
  .onDelete(async (user) => {
    const uid = user.uid
    const docRef = firestore.collection('Users').doc(uid)
    await docRef.delete()
  })
