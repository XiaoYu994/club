import { post, put } from '@/utils/request'

export const login = (payload) => post('/admin/login', payload)

export const logout = () => post('/admin/logout')

export const updatePassword = (payload) => put('/admin/password', payload)

