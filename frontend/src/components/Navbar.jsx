import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ShoppingCart, LogOut, ChefHat, UtensilsCrossed, Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, setDark } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-orange-500 font-bold text-xl">
          <UtensilsCrossed size={22} />
          Potluck
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setDark(!dark)}
            className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <>
              <span className="text-sm text-[var(--text-muted)]">Hi, {user.name}</span>
              {user.role === 'cook' && (
                <Link to="/cook/dashboard"
                  className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400 transition-colors">
                  <ChefHat size={15} /> Dashboard
                </Link>
              )}
              <Link to="/orders" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                Orders
              </Link>
              <Link to="/cart" className="text-[var(--text-muted)] hover:text-orange-500 transition-colors">
                <ShoppingCart size={20} />
              </Link>
              <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                Login
              </Link>
              <Link to="/register"
                className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-orange-600 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}