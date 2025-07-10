import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/user";

export const getUsers = () => axios.get(`${API_BASE_URL}`);
export const getUserById = (id) => axios.get(`${API_BASE_URL}/${id}`);
export const createUser = (user) => axios.post(`${API_BASE_URL}`, user);
export const updateUser = (id, user) => axios.put(`${API_BASE_URL}/${id}`,user);
export const deleteUser = (id) => axios.delete(`${API_BASE_URL}/${id}`);