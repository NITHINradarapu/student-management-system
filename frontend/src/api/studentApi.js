import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/students',
  headers: { 'Content-Type': 'application/json' },
});

export const getAllStudents  = ()           => api.get('/');
export const createStudent  = (data)        => api.post('/', data);
export const updateStudent  = (id, data)    => api.put(`/${id}`, data);
export const softDelete     = (id)          => api.patch(`/${id}/soft-delete`);
export const hardDelete     = (id)          => api.delete(`/${id}`);
