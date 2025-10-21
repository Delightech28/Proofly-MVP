import { Routes, Route, Link } from "react-router-dom"
import Home from "./components/home"
import Auth from "./components/Auth"
import AuthCode from "./components/AuthCode"
import Profile from "./components/Profile"
import Settings from "./components/Settings"
import EditProfile from "./components/EditProfile"
import Dashboard from "./components/Dashboard"
import Notifications from "./components/Notifications"
import RecentActivity from "./components/RecentActivity"
import Tasks from "./components/Tasks"
import Referrals from "./components/Referrals"
import Search from "./components/Search"
import Chat from "./components/Chat"
function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/referrals" element={<Referrals />} />
      <Route path="/search" element={<Search />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/recent-activity" element={<RecentActivity />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify" element={<AuthCode />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/edit-profile" element={<EditProfile />} />
    </Routes>
  )
}

export default App