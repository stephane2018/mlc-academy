import { api } from '@/lib/api-client'

export type Group = { id: string; name: string; classId: string; code: string }
export type GroupMember = { id: string; pseudo: string; avatar: string }
export type GroupDetail = Group & { members: GroupMember[] }

/** Service groups (espace prof) — `/groups/*`. */
export const groupsService = {
  list: () => api.get<Group[]>('/groups'),
  get: (id: string) => api.get<GroupDetail>(`/groups/${id}`),
  create: (input: { name: string; classId: string }) => api.post<Group>('/groups', input),
  regenerateCode: (id: string) => api.post<{ code: string }>(`/groups/${id}/code`),
}
