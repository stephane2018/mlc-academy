import { api } from '@/lib/api-client'

export type Group = { id: string; name: string; classId: string; code: string; studentCount: number }
export type GroupMember = { id: string; pseudo: string; avatar: string }
export type GroupDetail = Group & { members: GroupMember[] }

/** Service groups (espace prof) — `/groups/*`. */
export const groupsService = {
  list: () => api.get<Group[]>('/groups'),
  get: (id: string) => api.get<GroupDetail>(`/groups/${id}`),
  create: (input: { name: string; classId: string }) => api.post<Group>('/groups', input),
  update: (id: string, input: { name?: string; classId?: string }) => api.patch<Group>(`/groups/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/groups/${id}`),
  removeMember: (id: string, studentId: string) => api.delete<{ ok: true }>(`/groups/${id}/members/${studentId}`),
  regenerateCode: (id: string) => api.post<{ code: string }>(`/groups/${id}/code`),
}
