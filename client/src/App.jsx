import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import ChefDeProjetLayout from "./pages/chef_de_projet/pages/ChefDeProjetLayout";
import MemberSuggestionModal from "./pages/chef_de_projet/pages/MemberSuggestionModal";
import ManageCompetencies from "./pages/membre/ManageCompetencies";
import AsignMembersPage from "./pages/chef_de_projet/pages/AssignMembersPage";
import MyProjectMember from "./pages/chef_de_projet/pages/MyProjectMember";
import MemberLayout from "./pages/membre/MemberLayout";
import ManageCV from "./pages/membre/ManageCV"; // Add this import
import Pv_Projects from "./pages/chef_de_projet/pages/Pv_Projects";
// Add this import at the top
import ProjectPVs from "./pages/chef_de_projet/pages/ProjectPVs";

// Find the chef-de-projet route section and add this new route
<Route path="/chef-de-projet" element={<ChefDeProjetLayout />}>
  <Route path="project-pvs/:projectId" element={<ProjectPVs />} />
</Route>
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
      <ChefDeProjetLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<ChefDashboard />} />
  <Route path="suggest-members" element={<MemberSuggestionModal />} />
  <Route path="all-users" element={<AsignMembersPage />} />
  <Route path="members" element={<MyProjectMember />} />
  <Route path="projets" element={<Pv_Projects />} />
  <Route path="project-pvs/:projectId" element={<ProjectPVs />} />
</Route>
<Route 
  path="/member" 
  element={
    <ProtectedRoute allowedRoles={[ROLES.MEMBRE]}>
      <Outlet /> {/* Remove MemberLayout here */}
    </ProtectedRoute>
  }
>
  <Route element={<MemberLayout />}> {/* Add MemberLayout here to wrap all child routes */}
    <Route index element={<Navigate to="projects" replace />} /> {/* Change default route to projects */}
    <Route path="profile" element={<UpdateProfile />} />
    <Route path="competencies" element={<ManageCompetencies />} />
    <Route path="cv" element={<ManageCV />} />
    <Route path="projects" element={<MembreDashboard />} />
  </Route>
</Route>
      </Routes>
    </Router>
    </>
  ) ;
}

export default App;