import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import {Home} from './pages/Home/Home';
import {About} from './pages/OurStory/OurStory';
import {Contact} from './pages/Contact/Contact';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Explore } from './pages/Explore/Explore';
import { Wildlife } from './pages/Wildlife/Wildlife';
import { ForgotPassword } from './pages/ForgotPassword/ForgotPassword.jsx';
import { Admin } from './pages/Admin/Admin';
import { Productos } from './pages/Admin/Productos';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/wildlife" element={<Wildlife />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/productos" element={<Productos />} />
      </Routes>
    </>
  )
}

export default App
