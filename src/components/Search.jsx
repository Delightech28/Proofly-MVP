import { ArrowLeft, Moon, Sun, Search as SearchIcon, Users, MessageCircle, UserPlus, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import BottomNavigation from "./BottomNavigation";
import { db } from '../lib/firebase'
import { getAuth } from 'firebase/auth';
import { collection, query as firestoreQuery, where, orderBy, startAfter, limit as limitFn, getDocs } from 'firebase/firestore';

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
    console.log('Filtering user:', { 
      uid: u.uid, 
      currentUserId, 
      name: u.name, 
      username: u.username 
    });
    // Remove current user and apply other filters
    if (u.uid === currentUserId) return false;
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
            return {
              id: d.id,
              name: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
              username: data.username || '',
              followers: 0,  // Set to zero until following system is implemented
              isFollowing: false,  // Default to false until we implement following
              ...data  // Keep original data too
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

        const unameDocs = unameSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const dnameDocs = dnameSnap.docs.map(d => ({ id: d.id, ...d.data() }))

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
    if (!q) {
      // load next page of all users
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
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // shuffle this page as well
        for (let i = docs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const tmp = docs[i]
          docs[i] = docs[j]
          docs[j] = tmp
        }
        const map = new Map(results.map(r => [r.id, r]))
        docs.forEach(d => { if (!map.has(d.id)) map.set(d.id, d) })
        setResults(Array.from(map.values()))
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
        unameSnap.docs.forEach(d => newDocs.push({ id: d.id, ...d.data() }))
        setLastUsernameDoc(unameSnap.docs[unameSnap.docs.length - 1] || null)
        setHasMoreUsername(unameSnap.size === PAGE_SIZE)
      }
      if (dnameSnap) {
        dnameSnap.docs.forEach(d => newDocs.push({ id: d.id, ...d.data() }))
        setLastDisplayDoc(dnameSnap.docs[dnameSnap.docs.length - 1] || null)
        setHasMoreDisplay(dnameSnap.size === PAGE_SIZE)
      }

      // merge and dedupe against existing results
      const map = new Map(results.map(r => [r.id, r]))
      newDocs.forEach(d => { if (!map.has(d.id)) map.set(d.id, d) })
      setResults(Array.from(map.values()))
    } catch (e) {
      console.error('Load more failed', e)
      setError(e)
    } finally {
      setLoading(false)
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
                  <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-300 cursor-pointer ${
                    user.isFollowing
                      ? (isLightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-600 text-gray-300 hover:bg-gray-500')
                      : 'bg-indigo-600 text-black hover:bg-indigo-600'
                  }`}>
                    {user.isFollowing ? 'Following' : 'Follow'}
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
