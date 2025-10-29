import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { db } from './firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility function to make all users public
export async function makeAllUsersPublic() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    // Use batched writes for better performance
    const batch = writeBatch(db);
    let count = 0;
    
    snapshot.docs.forEach(doc => {
      if (!doc.data().isPublic) {
        batch.update(doc.ref, { isPublic: true });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`Updated ${count} users to public`);
    } else {
      console.log('No users needed to be updated');
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error making users public:', error);
    return { success: false, error };
  }
}
