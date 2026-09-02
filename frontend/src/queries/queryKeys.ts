export const queryKeys = {
  session: ['session'] as const,
  userPreferences: ['user', 'preferences'] as const,
  chat: {
    all: ['chat'] as const,
    status: ['chat', 'status'] as const,
    rooms: ['chat', 'rooms'] as const,
    messages: (chatRoomId: number | null) => (
      ['chat', 'rooms', chatRoomId, 'messages'] as const
    ),
    shareMessages: (chatRoomId: number) => (
      ['chat', 'rooms', chatRoomId, 'share-messages'] as const
    ),
  },
}
