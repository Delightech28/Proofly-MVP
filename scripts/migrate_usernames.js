// Migration script: create usernames/{username} mapping for all users
// Run with: node scripts/migrate_usernames.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function migrateUsernames() {
  const usersSnap = await db.collection('users').get();
  let created = 0, skipped = 0;
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const username = (data.username || '').trim().toLowerCase();
    if (!username) continue;
    const unameRef = db.collection('usernames').doc(username);
    const unameSnap = await unameRef.get();
    if (unameSnap.exists) {
      skipped++;
      continue;
    }
    await unameRef.set({ uid: doc.id });
    created++;
    console.log(`Mapped username: ${username} -> ${doc.id}`);
  }
  console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
}

migrateUsernames().catch(console.error);
