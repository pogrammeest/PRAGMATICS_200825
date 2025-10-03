import { NavLink } from 'react-router-dom'

const Navigation = () => (
  <nav className="app-navigation">
    <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
      Home
    </NavLink>
    <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
      About
    </NavLink>
  </nav>
)

export default Navigation
