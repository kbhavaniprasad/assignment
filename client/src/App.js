//import logo from './logo.svg';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Front from "./components/Front" // Import Front Component
import './components/styel.css';
import Home from './components/Home'
//import Register from './components/Register'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />  {/* Default Route */}
        <Route path="/Front" element={<Front />} />  {/* Route for Front.jsx */}
      </Routes>
    </Router>
  );
}

export default App;
