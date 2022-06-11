import * as admin from "firebase-admin";

if (admin.apps.length == 0) {
  // const credential = JSON.parse(
  //   Buffer.from(
  //     process.env.GCP_CREDENTIAL.replace(/\\n/g, "\n"),
  //     "base64"
  //   ).toString()
  // );
  var credential = require("/qapp-3c791-firebase-adminsdk-64yy5-d29a3f693c.json");

  // const credential = JSON.parse(process.env.GCP_CREDENTIAL).toString();

  admin.initializeApp({
    credential: admin.credential.cert(credential),
  });
}
