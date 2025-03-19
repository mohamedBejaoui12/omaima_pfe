import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:5000/tickets';

// Get auth token
const getAuthHeader = () => {
  const token = Cookies.get('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const ticketService = {
  createTicket: async (ticketData) => {
    try {
      const response = await axios.post(
        `${API_URL}/create`,
        ticketData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserTickets: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/user`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTicketDetails: async (ticketId) => {
    try {
      const response = await axios.get(
        `${API_URL}/${ticketId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addResponse: async (ticketId, message) => {
    try {
      const response = await axios.post(
        `${API_URL}/${ticketId}/respond`,
        { message },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/${ticketId}/status`,
        { status },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin functions
  getAllTickets: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/all`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};