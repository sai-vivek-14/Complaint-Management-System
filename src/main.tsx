import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import HDash from './HDash.tsx';  
import './index.css';
import Hostel from './Hostel.tsx';
import SDash from './SDash.tsx';  
import SProfile from './SProfile.tsx';
import WProfile from './WProfile.tsx';
import Wmain from './Wmain.tsx';
import PDash from './PDash';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Route for the home page */}
        <Route path="/hostel" element={<Hostel />} /> {/* Route for the hostel page */}
        <Route path='/hdash' element={<HDash />} /> {/* Route for the hdash page */}
        <Route path='SDash' element={<SDash />} /> {/* Route for the sdash page */}
        <Route path='SProfile' element={<SProfile />} /> {/* Route for the sprofile page */}
        <Route path='WProfile' element={<WProfile />} /> {/* Route for the wprofile page */}
        <Route path='Wmain' element={<Wmain />} /> {/* Route for the wmain page */}
        <Route path='PDash' element={<PDash />} /> {/* Route for the wdash page */}
      </Routes>
    </Router>
  </StrictMode>
);