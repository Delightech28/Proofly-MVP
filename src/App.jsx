import { Routes, Route, Link } from "react-router-dom"
import Home from "./components/home"
import Auth from "./components/Auth"
import AuthCode from "./components/AuthCode"
import Profile from "./components/Profile"
import Settings from "./components/Settings"
function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify" element={<AuthCode />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App