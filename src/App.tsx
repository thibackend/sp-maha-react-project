import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ServiceForm from './components/ServiceForm';
import ServiceManagement from './components/ServiceManagement';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
          <Link to="/service-form" style={{ marginRight: '10px' }}>Service Form</Link>
          <Link to="/service-management">Service Management</Link>
        </nav>

        <Routes>
          <Route path="/" element={<h1>Welcome to the Service Management App</h1>} />
          <Route path="/service-form" element={<ServiceForm />} />
          <Route path="/service-management" element={<ServiceManagement />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;