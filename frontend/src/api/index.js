import axios from 'axios';

const API = axios.create({baseURL: "http://localhost:8080"})

export const signIn = (formData) => API.post('/users/login', formData);
export const signUp = (formData) => API.post('/users/signup', formData);