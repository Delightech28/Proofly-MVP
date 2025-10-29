import { ArrowLeft, Moon, Sun, Search as SearchIcon, Users, MessageCircle, UserPlus, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import BottomNavigation from "./BottomNavigation";
import { db } from '../lib/firebase'
import { getAuth } from 'firebase/auth';
import { collection, query as firestoreQuery, where, orderBy, startAfter, limit as limitFn, getDocs, doc, writeBatch, serverTimestamp, getDoc, setDoc, updateDoc } from 'firebase/firestore';

function Search() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const auth = getAuth();
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid);
    });
    return () => unsubscribe();
  }, [auth]);

  const [followingSet, setFollowingSet] = useState(new Set());

  // fetch the current user's following list so we can mark results as followed
  useEffect(() => {
    if (!currentUserId) {
      setFollowingSet(new Set());
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users', currentUserId, 'following'));
        if (!mounted) return;
        setFollowingSet(new Set(snap.docs.map(d => d.id)));
      } catch (e) {
        console.error('Failed to fetch following list', e);
      }
    })();

    return () => { mounted = false };
  }, [currentUserId]);

  // Firestore-backed results & pagination
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUsernameDoc, setLastUsernameDoc] = useState(null)
  const [lastDisplayDoc, setLastDisplayDoc] = useState(null)
  const [lastAllDoc, setLastAllDoc] = useState(null)
  const [hasMoreUsername, setHasMoreUsername] = useState(false)
  const [hasMoreDisplay, setHasMoreDisplay] = useState(false)
  const [hasMoreAll, setHasMoreAll] = useState(false)
  const debouncedQuery = useRef('')
  const DEBOUNCE_MS = 300
  const PAGE_SIZE = 10

  // derive filtered results from fetched results and active filter
  const filteredResults = results.filter(u => {
    // Prefer document uid if present, fallback to doc id
    const uid = u.uid ?? u.id;
    // Remove current user and apply other filters
    if (currentUserId && uid === currentUserId) return false;
    if (activeFilter === 'following') return u.isFollowing;
    if (activeFilter === 'not-following') return !u.isFollowing;
    return true;
  });

  const clearSearch = () => {
    setSearchQuery("");
  };

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      debouncedQuery.current = (searchQuery || '').trim()
      // reset pagination when query changes
      setResults([])
      setLastUsernameDoc(null)
      setLastDisplayDoc(null)
      setHasMoreUsername(false)
      setHasMoreDisplay(false)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery])

  // perform first page fetch when debouncedQuery updates
  useEffect(() => {
    let mounted = true
    const q = debouncedQuery.current
    const fetchFirst = async () => {
      // if no query, fetch a page of all users (randomized per page)
      if (!q) {
        setLoading(true)
        setError(null)
        try {
          console.log('Fetching all users...');
          // First try to get all users without filters to debug
          const usersRef = collection(db, 'users');
          const rawSnap = await getDocs(usersRef);
          console.log('Total users in DB:', rawSnap.size);
          console.log('Sample user data:', rawSnap.docs[0]?.data());
          
          // Build query constraints
          const constraints = [
            orderBy('createdAt', 'desc'),
            limitFn(PAGE_SIZE)
          ];
          
          // Only add user filtering if logged in
          if (currentUserId) {
            constraints.unshift(
              where('uid', '!=', currentUserId),
              orderBy('uid')
            );
          }

          const allQ = firestoreQuery(
            collection(db, 'users'),
            ...constraints
          )
          const snap = await getDocs(allQ)
          console.log('Found', snap.size, 'users');
          console.log('First user data:', snap.docs[0]?.data());
          const docs = snap.docs.map(d => {
            const data = d.data();
            const uid = data.uid ?? d.id;
            return {
              id: d.id,
              uid,
              name: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
              username: data.username || '',
              followers: 0,
              isFollowing: followingSet.has(d.id) || followingSet.has(uid),
              ...data
            };
          });
          // shuffle page for a random display order
          for (let i = docs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const tmp = docs[i]
            docs[i] = docs[j]
            docs[j] = tmp
          }
          if (!mounted) return
          setResults(docs)
          setLastAllDoc(snap.docs[snap.docs.length - 1] || null)
          setHasMoreAll(snap.size === PAGE_SIZE)
        } catch (e) {
          console.error('Failed to fetch users', e)
          if (mounted) setError(e)
        } finally {
          if (mounted) setLoading(false)
        }
        return
      }
      setLoading(true)
      setError(null)
      try {
        // username prefix query
        // Build username query constraints
        const unameConstraints = [
          where('username', '>=', q),
          where('username', '<=', q + '\\uf8ff'),
          orderBy('username'),
          limitFn(PAGE_SIZE)
        ];
        
        // Only add user filtering if logged in
        if (currentUserId) {
          unameConstraints.unshift(
            where('uid', '!=', currentUserId),
            orderBy('uid')
          );
        }

        const unameQ = firestoreQuery(
          collection(db, 'users'),
          ...unameConstraints
        )

        // displayName prefix query
        // Build displayName query constraints
        const dnameConstraints = [
          where('displayName', '>=', q),
          where('displayName', '<=', q + '\\uf8ff'),
          orderBy('displayName'),
          limitFn(PAGE_SIZE)
        ];
        
        // Only add user filtering if logged in
        if (currentUserId) {
          dnameConstraints.unshift(
            where('uid', '!=', currentUserId),
            orderBy('uid')
          );
        }

        const dnameQ = firestoreQuery(
          collection(db, 'users'),
          ...dnameConstraints
        )

        const [unameSnap, dnameSnap] = await Promise.all([getDocs(unameQ), getDocs(dnameQ)])

        const unameDocs = unameSnap.docs.map(d => {
          const data = d.data();
          const uid = data.uid ?? d.id;
          return { id: d.id, uid, ...data, isFollowing: followingSet.has(d.id) || followingSet.has(uid) }
        })
        const dnameDocs = dnameSnap.docs.map(d => {
          const data = d.data();
          const uid = data.uid ?? d.id;
          return { id: d.id, uid, ...data, isFollowing: followingSet.has(d.id) || followingSet.has(uid) }
        })

        // dedupe by uid (id)
        const map = new Map()
        unameDocs.forEach(u => map.set(u.id, u))
        dnameDocs.forEach(d => { if (!map.has(d.id)) map.set(d.id, d) })

        const merged = Array.from(map.values())

        if (!mounted) return
        setResults(merged)
        setLastUsernameDoc(unameSnap.docs[unameSnap.docs.length - 1] || null)
        setLastDisplayDoc(dnameSnap.docs[dnameSnap.docs.length - 1] || null)
        setHasMoreUsername(unameSnap.size === PAGE_SIZE)
        setHasMoreDisplay(dnameSnap.size === PAGE_SIZE)
      } catch (e) {
        console.error('Search query failed', e)
        if (mounted) setError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchFirst()
    return () => { mounted = false }
  }, [debouncedQuery.current])

  const loadMore = async () => {
    const q = debouncedQuery.current
    // if no query specified, load next page of 'all users' pagination
    if (!q) {
      if (!hasMoreAll || !lastAllDoc) return
      setLoading(true)
      setError(null)
      try {
        const allQ = firestoreQuery(
          collection(db, 'users'),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastAllDoc),
          limitFn(PAGE_SIZE)
        )
        const snap = await getDocs(allQ)
        const docs = snap.docs.map(d => {
          const data = d.data();
          const uid = data.uid ?? d.id;
          return {
            id: d.id,
            uid,
            ...data,
            followers: data.followers || 0,
            isFollowing: followingSet.has(d.id) || followingSet.has(uid),
          }
        })
        // shuffle this page as well
        for (let i = docs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const tmp = docs[i]
          docs[i] = docs[j]
          docs[j] = tmp
        }
        const combined = new Map(results.map(r => [r.id, r]))
        docs.forEach(d => { if (!combined.has(d.id)) combined.set(d.id, d) })
        setResults(Array.from(combined.values()))
        setLastAllDoc(snap.docs[snap.docs.length - 1] || null)
        setHasMoreAll(snap.size === PAGE_SIZE)
      } catch (e) {
        console.error('Load more (all) failed', e)
        setError(e)
      } finally {
        setLoading(false)
      }
      return
    }

    // otherwise load next pages for username/displayName queries
    setLoading(true)
    setError(null)
    try {
      const promises = []
      if (hasMoreUsername && lastUsernameDoc) {
        const unameQ = firestoreQuery(
          collection(db, 'users'),
          where('isPublic', '==', true),
          where('username', '>=', q),
          where('username', '<=', q + '\\uf8ff'),
          orderBy('username'),
          startAfter(lastUsernameDoc),
          limitFn(PAGE_SIZE)
        )
        promises.push(getDocs(unameQ))
      } else {
        promises.push(Promise.resolve(null))
      }

      if (hasMoreDisplay && lastDisplayDoc) {
        const dnameQ = firestoreQuery(
          collection(db, 'users'),
          where('isPublic', '==', true),
          where('displayName', '>=', q),
          where('displayName', '<=', q + '\\uf8ff'),
          orderBy('displayName'),
          startAfter(lastDisplayDoc),
          limitFn(PAGE_SIZE)
        )
        promises.push(getDocs(dnameQ))
      } else {
        promises.push(Promise.resolve(null))
      }

      const [unameSnap, dnameSnap] = await Promise.all(promises)
      const newDocs = []
      if (unameSnap) {
        unameSnap.docs.forEach(d => {
          const data = d.data();
          const uid = data.uid ?? d.id;
          newDocs.push({ id: d.id, uid, ...data, isFollowing: followingSet.has(d.id) || followingSet.has(uid) })
        })
        setLastUsernameDoc(unameSnap.docs[unameSnap.docs.length - 1] || null)
        setHasMoreUsername(unameSnap.size === PAGE_SIZE)
      }
      if (dnameSnap) {
        dnameSnap.docs.forEach(d => {
          const data = d.data();
          const uid = data.uid ?? d.id;
          newDocs.push({ id: d.id, uid, ...data, isFollowing: followingSet.has(d.id) || followingSet.has(uid) })
        })
        setLastDisplayDoc(dnameSnap.docs[dnameSnap.docs.length - 1] || null)
        setHasMoreDisplay(dnameSnap.size === PAGE_SIZE)
      }

      // merge and dedupe against existing results
      const mergedMap = new Map(results.map(r => [r.id, r]))
      newDocs.forEach(d => { if (!mergedMap.has(d.id)) mergedMap.set(d.id, d) })
      setResults(Array.from(mergedMap.values()))
    } catch (e) {
      console.error('Load more failed', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  // Follow / unfollow handlers
  const handleFollow = async (target) => {
    if (!currentUserId) {
      alert('You must be signed in to follow users');
      return;
    }
    setLoading(true);
    try {
      // read current counts to produce absolute updates (security rules validate absolute changes)
      const targetRef = doc(db, 'users', target.id);
      const meRef = doc(db, 'users', currentUserId);
      const [tSnap, mSnap] = await Promise.all([getDoc(targetRef), getDoc(meRef)]);
      const tCount = (tSnap.exists() && typeof tSnap.data().followersCount === 'number') ? tSnap.data().followersCount : 0;
      const mCount = (mSnap.exists() && typeof mSnap.data().followingCount === 'number') ? mSnap.data().followingCount : 0;

      const batch = writeBatch(db);
      const followerRef = doc(db, 'users', target.id, 'followers', currentUserId);
      const followingRef = doc(db, 'users', currentUserId, 'following', target.id);

      // ensure we don't try to overwrite an existing follower/following doc (set on existing doc is an update and will be denied by rules)
      const [followerSnap, followingSnap] = await Promise.all([getDoc(followerRef), getDoc(followingRef)]);
      if (followerSnap.exists() || followingSnap.exists()) {
        console.warn('Already following (or write would overwrite existing doc). Re-syncing UI to server state.', { followerExists: followerSnap.exists(), followingExists: followingSnap.exists() });
        // The follower/following docs already exist on the server. Instead of
        // aborting silently, refresh the UI from the authoritative user docs
        // we just read (tSnap/mSnap) so the frontend reflects the true counts.
        const tCountExisting = (tSnap.exists() && typeof tSnap.data().followersCount === 'number') ? tSnap.data().followersCount : 0;
        const mCountExisting = (mSnap.exists() && typeof mSnap.data().followingCount === 'number') ? mSnap.data().followingCount : 0;
        setResults(prev => prev.map(u => u.id === target.id ? { ...u, isFollowing: true, followers: tCountExisting } : u));
        setFollowingSet(s => new Set(Array.from(s).concat([target.id])));
        // If you want to surface my own followingCount in the UI elsewhere,
        // you can update that state from mCountExisting.
        return;
      }

      // If target user doc doesn't exist, abort (we cannot create another user's profile)
      if (!tSnap.exists()) {
        console.error('Target user document does not exist; cannot follow non-existent user', target.id);
        throw new Error('Target user document missing');
      }

      // If my user doc doesn't exist, create a minimal profile so we can write followingCount (rules allow creating your own doc)
      if (!mSnap.exists()) {
        console.warn('My user doc missing; creating minimal profile for current user');
        batch.set(meRef, { uid: currentUserId, followingCount: (mCount || 0) + 1, createdAt: serverTimestamp() });
      } else {
        batch.update(meRef, { followingCount: mCount + 1 });
      }

      // Add follower/following docs (safe because we checked they don't already exist)
      batch.set(followerRef, { uid: currentUserId, createdAt: serverTimestamp() });
      batch.set(followingRef, { uid: target.id, createdAt: serverTimestamp() });

      // Update target followersCount (target doc exists per check above)
      batch.update(targetRef, { followersCount: tCount + 1 });

      // debug: log what we are about to write so we can correlate with rules errors
      try {
        console.log('Attempting follow: currentUserId=', currentUserId, 'targetId=', target.id);
        console.log('Target doc exists:', tSnap.exists(), 'Me doc exists:', mSnap.exists());
        console.log('Counts before follow: target.followersCount=', tCount, 'me.followingCount=', mCount);
        console.log('Batch writes:', {
          followerPath: followerRef.path,
          followingPath: followingRef.path,
          targetUpdate: { path: targetRef.path, followersCount: tCount + 1 },
          meUpdate: { path: meRef.path, followingCount: mCount + 1 }
        });

        await batch.commit();

        // optimistic UI update
        setResults(prev => prev.map(u => u.id === target.id ? { ...u, isFollowing: true, followers: (u.followers || tCount) + 1 } : u));
        setFollowingSet(s => new Set(Array.from(s).concat([target.id])));
      } catch (commitErr) {
        // Enhanced error logging for diagnostics
        console.error('Follow commit failed', commitErr);
        try {
          console.error('Full commit error object:', JSON.stringify(commitErr, Object.getOwnPropertyNames(commitErr)));
        } catch (jsonErr) {
          console.error('Could not stringify commit error', jsonErr);
        }
        // log common fields if present
        console.error('commitErr.code:', commitErr.code, 'commitErr.message:', commitErr.message);
        throw commitErr;
      }
    } catch (e) {
      console.error('Follow failed', e);
      try {
        console.error('Full error (all props):', JSON.stringify(e, Object.getOwnPropertyNames(e)));
      } catch (jsonErr) {
        console.error('Failed to stringify error', jsonErr);
      }
      // Helpful top-level info for quick inspection
      console.error('Error code:', e.code, 'message:', e.message, 'stack:', e.stack);
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUnfollow = async (target) => {
    if (!currentUserId) {
      alert('You must be signed in to unfollow users');
      return;
    }
    setLoading(true);
    try {
      // read current counts first
      const targetRef = doc(db, 'users', target.id);
      const meRef = doc(db, 'users', currentUserId);
      const [tSnap, mSnap] = await Promise.all([getDoc(targetRef), getDoc(meRef)]);
      const tCount = (tSnap.exists() && typeof tSnap.data().followersCount === 'number') ? tSnap.data().followersCount : 0;
      const mCount = (mSnap.exists() && typeof mSnap.data().followingCount === 'number') ? mSnap.data().followingCount : 0;

      const batch = writeBatch(db);
      const followerRef = doc(db, 'users', target.id, 'followers', currentUserId);
      const followingRef = doc(db, 'users', currentUserId, 'following', target.id);

      batch.delete(followerRef);
      batch.delete(followingRef);
      batch.update(targetRef, { followersCount: Math.max(tCount - 1, 0) });
      batch.update(meRef, { followingCount: Math.max(mCount - 1, 0) });

      // debug: log what we will delete/update to aid rule debugging
      try {
        console.log('Attempting unfollow: currentUserId=', currentUserId, 'targetId=', target.id);
        console.log('Target doc exists:', tSnap.exists(), 'Me doc exists:', mSnap.exists());
        console.log('Counts before unfollow: target.followersCount=', tCount, 'me.followingCount=', mCount);
        console.log('Batch writes (delete/update):', {
          followerPath: followerRef.path,
          followingPath: followingRef.path,
          targetUpdate: { path: targetRef.path, followersCount: Math.max(tCount - 1, 0) },
          meUpdate: { path: meRef.path, followingCount: Math.max(mCount - 1, 0) }
        });

        await batch.commit();

        // optimistic UI update
        setResults(prev => prev.map(u => u.id === target.id ? { ...u, isFollowing: false, followers: Math.max((u.followers || tCount) - 1, 0) } : u));
        setFollowingSet(s => {
          const next = new Set(Array.from(s).filter(id => id !== target.id));
          return next;
        });
      } catch (commitErr) {
        console.error('Unfollow commit failed', commitErr);
        try {
          console.error('Full commit error object:', JSON.stringify(commitErr, Object.getOwnPropertyNames(commitErr)));
        } catch (jsonErr) {
          console.error('Could not stringify commit error', jsonErr);
        }
        console.error('commitErr.code:', commitErr.code, 'commitErr.message:', commitErr.message);
        throw commitErr;
      }
    } catch (e) {
      console.error('Unfollow failed', e);
      try {
        console.error('Full error (all props):', JSON.stringify(e, Object.getOwnPropertyNames(e)));
      } catch (jsonErr) {
        console.error('Failed to stringify error', jsonErr);
      }
      console.error('Error code:', e.code, 'message:', e.message, 'stack:', e.stack);
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // Developer helper: try each write individually to pinpoint which operation is rejected by rules
  const debugFollowOps = async (target) => {
    if (!currentUserId) {
      console.warn('debugFollowOps: not signed in');
      return;
    }
    console.group('debugFollowOps', target.id);
    const targetRef = doc(db, 'users', target.id);
    const meRef = doc(db, 'users', currentUserId);
    const followerRef = doc(db, 'users', target.id, 'followers', currentUserId);
    const followingRef = doc(db, 'users', currentUserId, 'following', target.id);

    try {
      const results = [];
      const [tSnap, mSnap] = await Promise.all([getDoc(targetRef), getDoc(meRef)]);
      console.log('client auth uid:', auth.currentUser?.uid, 'currentUserId state:', currentUserId);
      console.log('target exists:', tSnap.exists(), 'me exists:', mSnap.exists());
      console.log('target data:', tSnap.exists() ? tSnap.data() : null);
      console.log('me data:', mSnap.exists() ? mSnap.data() : null);

      // 1) try creating follower doc under target
      try {
        console.log('about to set follower doc at', followerRef.path);
        await setDoc(followerRef, { uid: currentUserId, createdAt: serverTimestamp() });
        console.log('set follower doc OK', followerRef.path);
        results.push({ step: 'setFollower', ok: true });
      } catch (err) {
        console.error('set follower failed', err);
        try { results.push({ step: 'setFollower', ok: false, error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) }) } catch(e){ results.push({ step: 'setFollower', ok: false, error: String(err) }) }
      }

      // 2) try creating following doc under me
      try {
        console.log('about to set following doc at', followingRef.path);
        await setDoc(followingRef, { uid: target.id, createdAt: serverTimestamp() });
        console.log('set following doc OK', followingRef.path);
        results.push({ step: 'setFollowing', ok: true });
      } catch (err) {
        console.error('set following failed', err);
        try { results.push({ step: 'setFollowing', ok: false, error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) }) } catch(e){ results.push({ step: 'setFollowing', ok: false, error: String(err) }) }
      }

      // 3) try updating target followersCount
      try {
        const tCount = (tSnap.exists() && typeof tSnap.data().followersCount === 'number') ? tSnap.data().followersCount : 0;
        console.log('about to update target followersCount from', tCount, 'to', tCount + 1);
        await updateDoc(targetRef, { followersCount: tCount + 1 });
        console.log('update target followersCount OK', targetRef.path, '->', tCount + 1);
        results.push({ step: 'updateTargetCount', ok: true });
      } catch (err) {
        console.error('update target failed', err);
        try { results.push({ step: 'updateTargetCount', ok: false, error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) }) } catch(e){ results.push({ step: 'updateTargetCount', ok: false, error: String(err) }) }
      }

      // 4) try updating my followingCount
      try {
        const mCount = (mSnap.exists() && typeof mSnap.data().followingCount === 'number') ? mSnap.data().followingCount : 0;
        console.log('about to update my followingCount from', mCount, 'to', mCount + 1);
        await updateDoc(meRef, { followingCount: mCount + 1 });
        console.log('update me followingCount OK', meRef.path, '->', mCount + 1);
        results.push({ step: 'updateMyCount', ok: true });
      } catch (err) {
        console.error('update me failed', err);
        try { results.push({ step: 'updateMyCount', ok: false, error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))) }) } catch(e){ results.push({ step: 'updateMyCount', ok: false, error: String(err) }) }
      }

      // show a quick alert with step statuses for easy copying
      try {
        const out = JSON.stringify({ targetId: target.id, currentUserId, steps: results }, null, 2);
        console.log('debugFollowOps results:', out);
        // small UI alert to make it easy to copy the results
        // eslint-disable-next-line no-alert
        alert('debugFollowOps results (copy from console if truncated):\n' + out);
      } catch (e) {
        console.log('Could not stringify results for alert', e);
      }

    } catch (e) {
      console.error('debugFollowOps failure', e);
    } finally {
      console.groupEnd();
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-4 border-b transition-colors duration-300 ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">Search Users</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Find and connect with friends
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4">
        <div className={`relative transition-colors duration-300`}>
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
            <SearchIcon className={`h-5 w-5 transition-colors duration-300 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`block w-full pl-10 pr-10 py-3 border rounded-xl transition-colors duration-300 ${
              isLightMode 
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-indigo-600' 
                : 'bg-[#1c1c1c] border-gray-600 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600'
            } focus:outline-none focus:ring-1`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-r-xl cursor-pointer`}
            >
              <X className={`h-5 w-5 transition-colors duration-300 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className={`flex rounded-lg p-1 transition-colors duration-300 ${isLightMode ? 'bg-gray-200' : 'bg-[#2a2a2a]'}`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-black'
                : (isLightMode ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setActiveFilter('following')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
              activeFilter === 'following'
                ? 'bg-indigo-600 text-black'
                : (isLightMode ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            Following ({results.filter(u => u.isFollowing).length})
          </button>
          <button
            onClick={() => setActiveFilter('not-following')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
              activeFilter === 'not-following'
                ? 'bg-indigo-600 text-black'
                : (isLightMode ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            Discover ({results.filter(u => !u.isFollowing).length})
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 pb-24">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {searchQuery ? (
                filteredResults.length > 0 ? `Found ${filteredResults.length} users` : 'No results found'
              ) : (
                activeFilter === 'following' ? `People You Follow (${filteredResults.length})` :
                activeFilter === 'not-following' ? `Discover Users (${filteredResults.length})` :
                `All Users (${filteredResults.length})`
              )}
            </h3>
            {searchQuery && filteredResults.length > 0 && (
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                for "{searchQuery}"
              </div>
            )}
          </div>

          {filteredResults.length > 0 ? (
            filteredResults.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-300 ${
                  isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'
                  }`}>
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{user.name}</h4>
                    {user.username && (
                      <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        @{user.username}
                      </p>
                    )}
                    <p className={`text-xs mt-1 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {user.followers} followers
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                    isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
                  }`}>
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => user.isFollowing ? handleUnfollow(user) : handleFollow(user)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-300 cursor-pointer ${
                      user.isFollowing
                        ? (isLightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-600 text-gray-300 hover:bg-gray-500')
                        : 'bg-indigo-600 text-black hover:bg-indigo-600'
                    }`}
                  >
                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <SearchIcon className={`w-12 h-12 mx-auto mb-3 transition-colors duration-300 ${isLightMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <p className={`text-lg font-medium transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {searchQuery ? 'No users found' : (
                  activeFilter === 'following' ? 'No people you follow' :
                  activeFilter === 'not-following' ? 'No users to discover' :
                  'No users available'
                )}
              </p>
              <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {searchQuery ? 'Try searching with different keywords' : (
                  activeFilter === 'following' ? 'Start following people to see them here' :
                  activeFilter === 'not-following' ? 'All users are being followed' :
                  'No users in the app yet'
                )}
              </p>
            </div>
          )}

          {/* Load more */}
          {(hasMoreUsername || hasMoreDisplay) && (
            <div className="mt-4 text-center">
              <button onClick={loadMore} disabled={loading} className={`px-4 py-2 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 text-black hover:bg-indigo-700'}`}>
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Search;
