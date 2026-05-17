import { environment } from '../../../environments/environment';

export const API_BASE = environment.apiUrl;

export const API_ENDPOINTS = {
  auth: `${API_BASE}/auth`,
  patients: `${API_BASE}/patients`,
  rooms: `${API_BASE}/rooms`,
  reports: `${API_BASE}/reports`,
  schedule: `${API_BASE}/schedule`,
  staff: `${API_BASE}/staff`,
  users: `${API_BASE}/users`,
  surgeries: `${API_BASE}/surgeries`,
  availability: `${API_BASE}/availability`
};
