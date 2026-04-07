import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StaffApp from './StaffApp';
import PatientApp from './patient/App';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Patient terminal routes */}
          <Route path="/patient/*" element={<PatientApp />} />
          
          {/* Staff terminal routes (and default) */}
          <Route path="/*" element={<StaffApp />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
