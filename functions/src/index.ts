import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function to process referral codes when a new user signs up
 * This function is triggered when a document is created in the referralRequests collection
 */
export const processReferralRequest = functions.firestore
  .document('referralRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();
    const requestId = context.params.requestId;
    
    console.log('Processing referral request:', requestId, requestData);
    
    try {
      const { newUid, code } = requestData;
      
      if (!newUid || !code) {
        throw new Error('Missing required fields: newUid or code');
      }
      
      // Find the referrer by their referral code
      const referrerQuery = await db.collection('users')
        .where('referralCode', '==', code)
        .limit(1)
        .get();
      
      if (referrerQuery.empty) {
        console.log('Referral code not found:', code);
        await snap.ref.update({
          processed: true,
          result: 'code_not_found',
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }
      
      const referrerDoc = referrerQuery.docs[0];
      const referrerUid = referrerDoc.id;
      
      // Check if the referrer is trying to refer themselves
      if (referrerUid === newUid) {
        console.log('User trying to refer themselves:', newUid);
        await snap.ref.update({
          processed: true,
          result: 'self_referral',
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }
      
      // Use a transaction to ensure data consistency
      await db.runTransaction(async (transaction) => {
        // Get both user documents
        const referrerRef = db.collection('users').doc(referrerUid);
        const newUserRef = db.collection('users').doc(newUid);
        
        const [referrerDoc, newUserDoc] = await Promise.all([
          transaction.get(referrerRef),
          transaction.get(newUserRef)
        ]);
        
        if (!referrerDoc.exists || !newUserDoc.exists) {
          throw new Error('One or both user documents not found');
        }
        
        const newUserData = newUserDoc.data();
        
        // Check if the new user already has a referrer
        if (newUserData?.referredBy) {
          console.log('User already has a referrer:', newUid);
          return; // Exit transaction without changes
        }
        
        // Update referrer's data
        transaction.update(referrerRef, {
          referralsCount: admin.firestore.FieldValue.increment(1),
          referredUids: admin.firestore.FieldValue.arrayUnion(newUid)
        });
        
        // Update new user's data
        transaction.update(newUserRef, {
          referredBy: referrerUid,
          referredAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Create audit record
        const auditRef = db.collection('referrals').doc();
        transaction.set(auditRef, {
          referrerUid,
          referredUid: newUid,
          code,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      // Mark the request as processed successfully
      await snap.ref.update({
        processed: true,
        result: 'success',
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Referral processed successfully:', {
        referrerUid,
        newUid,
        code
      });
      
    } catch (error) {
      console.error('Error processing referral request:', error);
      
      // Mark the request as failed
      await snap.ref.update({
        processed: true,
        result: 'error',
        error: error instanceof Error ? error.message : String(error),
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Cloud Function to award XP to users when they get verified
 * This function is triggered when a user document is updated and is_verified becomes true
 */
export const awardVerificationXP = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;
    
    // Check if user just got verified
    if (!before.is_verified && after.is_verified) {
      console.log('User verified, awarding XP:', userId);
      
      try {
        await db.collection('users').doc(userId).update({
          xp: admin.firestore.FieldValue.increment(50) // Award 50 XP for verification
        });
        
        console.log('XP awarded for verification:', userId);
      } catch (error) {
        console.error('Error awarding verification XP:', error);
      }
    }
  });
