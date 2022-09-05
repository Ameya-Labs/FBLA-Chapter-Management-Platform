const functions = require("firebase-functions");

const admin = require("firebase-admin");

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.createAuthUser = functions.https.onCall((data) => {
  const {email, password, displayName} = data;
  return admin.auth().createUser({email, password, displayName})
      .then((userRecord) => {
        return {
          response: userRecord,
        };
      }).catch((error) => {
        throw new functions.https.HttpsError("internal", error.message);
      });
});

exports.deleteAuthUser = functions.https.onCall((uid) => {
  return admin.auth().deleteUser(uid)
      .catch((error) => {
        throw new functions.https.HttpsError("internal", error.message);
      });
});
