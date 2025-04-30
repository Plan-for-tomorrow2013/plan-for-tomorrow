export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  isRichText?: boolean
}

export type AnnouncementError = {
  code: 'ANNOUNCEMENT_NOT_FOUND' | 'ANNOUNCEMENT_CREATION_FAILED' | 'ANNOUNCEMENT_UPDATE_FAILED' | 'ANNOUNCEMENT_DELETE_FAILED' | 'ANNOUNCEMENT_FETCH_FAILED'
  message: string
  details?: any
}

export interface AnnouncementResponse {
  data?: Announcement | Announcement[]
  error?: AnnouncementError
}
