const firebase = require('firebase-admin');
const config = require('./config/db_config.json');

firebase.initializeApp({
    credential: firebase.credential.cert(config),
    databaseURL: "https://instagramscraper-tbt.firebaseio.com"
  });

  let database = firebase.database();

  const writeUserData = async(instagramUsers) =>{
    const created_at = await new Date().getTime();

    await database.ref('InstagramUsers/' + instagramUsers['name']).set({
        username: instagramUsers['name'],
        created_at: created_at
    });

  }

  module.exports = {
      writeUserData,
  }