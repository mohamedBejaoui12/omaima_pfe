import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/login";
import AdminDashboard from "./pages/admin/adminDashboard";
import ChefDashboard from "./pages/chef_de_projet/chefDeProjetDashboard";
import MembreDashboard from "./pages/membre/membre";
import ProtectedRoute from "./pages/components/ProtectedRoute";

// Role constants for clarity
const ROLES = {
  ADMIN: '0',
  CHEF_DE_PROJET: '1',
  MEMBRE: '2'
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chef-de-projet" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CHEF_DE_PROJET]}>
              <ChefDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/membre" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.MEMBRE]}>
              <MembreDashboard />
            </ProtectedRoute>
          } 
        />
        {/* Redirect to login if no matching route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;