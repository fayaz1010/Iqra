import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatGroup } from '../types/notification';

interface ChatState {
  groups: Record<string, ChatGroup>;
  messages: Record<string, ChatMessage[]>;
  activeGroup: string | null;
  loading: boolean;
  error: string | null;

  // Group actions
  createGroup: (
    type: 'direct' | 'group',
    participants: string[],
    name?: string
  ) => string;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<ChatGroup>) => void;
  setActiveGroup: (groupId: string | null) => void;

  // Message actions
  sendMessage: (
    groupId: string,
    content: string,
    type?: ChatMessage['type'],
    metadata?: ChatMessage['metadata']
  ) => string;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  reactToMessage: (messageId: string, reaction: string) => void;
  markGroupAsRead: (groupId: string) => void;

  // Typing indicators
  setTyping: (groupId: string, isTyping: boolean) => void;

  // Message queries
  getGroupMessages: (groupId: string, limit?: number) => ChatMessage[];
  getUnreadCount: (groupId: string) => number;
  searchMessages: (query: string) => ChatMessage[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      groups: {},
      messages: {},
      activeGroup: null,
      loading: false,
      error: null,

      createGroup: (type, participants, name) => {
        const groupId = `group_${Date.now()}`;
        const newGroup: ChatGroup = {
          id: groupId,
          type,
          name,
          participants,
          unreadCount: 0,
          settings: {
            notifications: true,
            pinnedMessages: [],
          },
        };

        set((state) => ({
          groups: {
            ...state.groups,
            [groupId]: newGroup,
          },
          messages: {
            ...state.messages,
            [groupId]: [],
          },
        }));

        return groupId;
      },

      joinGroup: (groupId) => {
        set((state) => ({
          groups: {
            ...state.groups,
            [groupId]: {
              ...state.groups[groupId],
              participants: [
                ...state.groups[groupId].participants,
                'currentUser', // Replace with actual user ID
              ],
            },
          },
        }));
      },

      leaveGroup: (groupId) => {
        set((state) => ({
          groups: {
            ...state.groups,
            [groupId]: {
              ...state.groups[groupId],
              participants: state.groups[groupId].participants.filter(
                (id) => id !== 'currentUser' // Replace with actual user ID
              ),
            },
          },
        }));
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: {
            ...state.groups,
            [groupId]: {
              ...state.groups[groupId],
              ...updates,
            },
          },
        }));
      },

      setActiveGroup: (groupId) => {
        set({ activeGroup: groupId });
        if (groupId) {
          get().markGroupAsRead(groupId);
        }
      },

      sendMessage: (groupId, content, type = 'text', metadata) => {
        const messageId = `message_${Date.now()}`;
        const newMessage: ChatMessage = {
          id: messageId,
          groupId,
          senderId: 'currentUser', // Replace with actual user ID
          content,
          timestamp: Date.now(),
          type,
          reactions: [],
          metadata,
        };

        set((state) => ({
          messages: {
            ...state.messages,
            [groupId]: [...(state.messages[groupId] || []), newMessage],
          },
          groups: {
            ...state.groups,
            [groupId]: {
              ...state.groups[groupId],
              lastMessage: newMessage,
              typing: state.groups[groupId].typing?.filter(
                (id) => id !== 'currentUser'
              ),
            },
          },
        }));

        return messageId;
      },

      editMessage: (messageId, content) => {
        set((state) => {
          const updatedMessages: Record<string, ChatMessage[]> = {};
          let found = false;

          Object.entries(state.messages).forEach(([groupId, messages]) => {
            const messageIndex = messages.findIndex(
              (msg) => msg.id === messageId
            );
            if (messageIndex !== -1) {
              found = true;
              updatedMessages[groupId] = [...messages];
              updatedMessages[groupId][messageIndex] = {
                ...messages[messageIndex],
                content,
              };
            } else {
              updatedMessages[groupId] = messages;
            }
          });

          return found ? { messages: updatedMessages } : state;
        });
      },

      deleteMessage: (messageId) => {
        set((state) => {
          const updatedMessages: Record<string, ChatMessage[]> = {};
          let found = false;

          Object.entries(state.messages).forEach(([groupId, messages]) => {
            const messageIndex = messages.findIndex(
              (msg) => msg.id === messageId
            );
            if (messageIndex !== -1) {
              found = true;
              updatedMessages[groupId] = messages.filter(
                (msg) => msg.id !== messageId
              );
            } else {
              updatedMessages[groupId] = messages;
            }
          });

          return found ? { messages: updatedMessages } : state;
        });
      },

      reactToMessage: (messageId, reaction) => {
        set((state) => {
          const updatedMessages: Record<string, ChatMessage[]> = {};
          let found = false;

          Object.entries(state.messages).forEach(([groupId, messages]) => {
            const messageIndex = messages.findIndex(
              (msg) => msg.id === messageId
            );
            if (messageIndex !== -1) {
              found = true;
              updatedMessages[groupId] = [...messages];
              const message = messages[messageIndex];
              const existingReactionIndex = message.reactions.findIndex(
                (r) => r.userId === 'currentUser' && r.type === reaction
              );

              if (existingReactionIndex === -1) {
                updatedMessages[groupId][messageIndex] = {
                  ...message,
                  reactions: [
                    ...message.reactions,
                    {
                      type: reaction,
                      userId: 'currentUser', // Replace with actual user ID
                      timestamp: Date.now(),
                    },
                  ],
                };
              } else {
                updatedMessages[groupId][messageIndex] = {
                  ...message,
                  reactions: message.reactions.filter(
                    (_, index) => index !== existingReactionIndex
                  ),
                };
              }
            } else {
              updatedMessages[groupId] = messages;
            }
          });

          return found ? { messages: updatedMessages } : state;
        });
      },

      markGroupAsRead: (groupId) => {
        set((state) => ({
          groups: {
            ...state.groups,
            [groupId]: {
              ...state.groups[groupId],
              unreadCount: 0,
            },
          },
        }));
      },

      setTyping: (groupId, isTyping) => {
        set((state) => ({
          groups: {
            ...state.groups,
            [groupId]: {
              ...state.groups[groupId],
              typing: isTyping
                ? [...(state.groups[groupId].typing || []), 'currentUser']
                : (state.groups[groupId].typing || []).filter(
                    (id) => id !== 'currentUser'
                  ),
            },
          },
        }));
      },

      getGroupMessages: (groupId, limit) => {
        const { messages } = get();
        const groupMessages = messages[groupId] || [];
        return limit
          ? groupMessages.slice(-limit)
          : groupMessages;
      },

      getUnreadCount: (groupId) => {
        const { groups } = get();
        return groups[groupId]?.unreadCount || 0;
      },

      searchMessages: (query) => {
        const { messages } = get();
        const results: ChatMessage[] = [];
        const lowercaseQuery = query.toLowerCase();

        Object.values(messages).forEach((groupMessages) => {
          groupMessages.forEach((message) => {
            if (message.content.toLowerCase().includes(lowercaseQuery)) {
              results.push(message);
            }
          });
        });

        return results;
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);
