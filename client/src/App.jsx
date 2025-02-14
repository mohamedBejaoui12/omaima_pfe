import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/auth/login";
import AdminLayout from "./pages/admin/components/AdminLayout";
import AdminDashboard from "./pages/admin/pages/adminDashboard";
import AddMemberPage from "./pages/admin/pages/AddMemberPage";
import ManageUsersPage from "./pages/admin/pages/ManageUsersPage";
import ChefDashboard from "./pages/chef_de_projet/chefDeProjetDashboard";
import MembreDashboard from "./pages/membre/membre";
import ProtectedRoute from "./pages/components/ProtectedRoute";
import { Toaster } from 'react-hot-toast';
import ManageProjects from "./pages/admin/pages/ManageProjects";
import ProjectDetails from "./pages/admin/pages/ProjectDetails";
import UpdateProfile from "./pages/membre/UpdateProfile";
import CompetencesPage from "./pages/admin/pages/CompetencesPage";

// Role constants for clarity
const ROLES = {
  ADMIN: '0',
  CHEF_DE_PROJET: '1',
  MEMBRE: '2'
};

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#4CAF50',
              color: 'white',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#F44336',
              color: 'white',
            },
          },
        }}
      />
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-member" element={<AddMemberPage />} />
          <Route path="manage-users" element={<ManageUsersPage />} />
          <Route path="manage-projects" element={<ManageProjects />} />
          <Route path="manage-competences" element={<CompetencesPage />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
        </Route>

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
        <Route 
          path="/membre/profile" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.MEMBRE]}>
              <UpdateProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;