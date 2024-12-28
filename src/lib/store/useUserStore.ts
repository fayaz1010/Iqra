import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, StudyGroup, SocialInteraction } from '../types/user';

interface UserState {
  currentUser: UserProfile | null;
  friends: Record<string, UserProfile>;
  studyGroups: Record<string, StudyGroup>;
  socialInteractions: Record<string, SocialInteraction>;
  loading: boolean;
  error: string | null;

  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
  updatePrivacy: (privacy: Partial<UserProfile['preferences']['privacy']>) => Promise<void>;

  // Social actions
  sendFriendRequest: (userId: string) => Promise<void>;
  acceptFriendRequest: (userId: string) => Promise<void>;
  declineFriendRequest: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;

  // Study group actions
  createStudyGroup: (group: Omit<StudyGroup, 'id'>) => Promise<string>;
  joinStudyGroup: (groupId: string) => Promise<void>;
  leaveStudyGroup: (groupId: string) => Promise<void>;
  updateStudyGroup: (groupId: string, updates: Partial<StudyGroup>) => Promise<void>;

  // Social interactions
  addInteraction: (interaction: Omit<SocialInteraction, 'id'>) => Promise<string>;
  removeInteraction: (interactionId: string) => Promise<void>;
  reactToInteraction: (interactionId: string, reaction: string) => Promise<void>;

  // Activity
  addActivity: (
    type: UserProfile['recentActivity'][0]['type'],
    action: string,
    details: Record<string, any>
  ) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      friends: {},
      studyGroups: {},
      socialInteractions: {},
      loading: false,
      error: null,

      updateProfile: async (updates) => {
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        }));
      },

      updatePreferences: async (preferences) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                preferences: {
                  ...state.currentUser.preferences,
                  ...preferences,
                },
              }
            : null,
        }));
      },

      updatePrivacy: async (privacy) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                preferences: {
                  ...state.currentUser.preferences,
                  privacy: {
                    ...state.currentUser.preferences.privacy,
                    ...privacy,
                  },
                },
              }
            : null,
        }));
      },

      sendFriendRequest: async (userId) => {
        // In a real implementation, this would make an API call
        set((state) => ({
          socialInteractions: {
            ...state.socialInteractions,
            [`fr_${Date.now()}`]: {
              id: `fr_${Date.now()}`,
              type: 'mention',
              userId: state.currentUser?.id || '',
              targetId: userId,
              targetType: 'post',
              content: 'Friend request',
              timestamp: Date.now(),
            },
          },
        }));
      },

      acceptFriendRequest: async (userId) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                social: {
                  ...state.currentUser.social,
                  friends: [...state.currentUser.social.friends, userId],
                },
              }
            : null,
        }));
      },

      declineFriendRequest: async (userId) => {
        // Remove the friend request interaction
        set((state) => ({
          socialInteractions: Object.fromEntries(
            Object.entries(state.socialInteractions).filter(
              ([_, interaction]) =>
                !(
                  interaction.type === 'mention' &&
                  interaction.targetId === userId &&
                  interaction.content === 'Friend request'
                )
            )
          ),
        }));
      },

      removeFriend: async (userId) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                social: {
                  ...state.currentUser.social,
                  friends: state.currentUser.social.friends.filter(
                    (id) => id !== userId
                  ),
                },
              }
            : null,
        }));
      },

      followUser: async (userId) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                social: {
                  ...state.currentUser.social,
                  following: [...state.currentUser.social.following, userId],
                },
              }
            : null,
        }));
      },

      unfollowUser: async (userId) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                social: {
                  ...state.currentUser.social,
                  following: state.currentUser.social.following.filter(
                    (id) => id !== userId
                  ),
                },
              }
            : null,
        }));
      },

      createStudyGroup: async (group) => {
        const groupId = `group_${Date.now()}`;
        set((state) => ({
          studyGroups: {
            ...state.studyGroups,
            [groupId]: {
              id: groupId,
              ...group,
            },
          },
        }));
        return groupId;
      },

      joinStudyGroup: async (groupId) => {
        set((state) => ({
          studyGroups: {
            ...state.studyGroups,
            [groupId]: {
              ...state.studyGroups[groupId],
              members: [
                ...state.studyGroups[groupId].members,
                {
                  userId: state.currentUser?.id || '',
                  role: 'member',
                  joinedAt: Date.now(),
                },
              ],
            },
          },
        }));
      },

      leaveStudyGroup: async (groupId) => {
        set((state) => ({
          studyGroups: {
            ...state.studyGroups,
            [groupId]: {
              ...state.studyGroups[groupId],
              members: state.studyGroups[groupId].members.filter(
                (member) => member.userId !== state.currentUser?.id
              ),
            },
          },
        }));
      },

      updateStudyGroup: async (groupId, updates) => {
        set((state) => ({
          studyGroups: {
            ...state.studyGroups,
            [groupId]: {
              ...state.studyGroups[groupId],
              ...updates,
            },
          },
        }));
      },

      addInteraction: async (interaction) => {
        const interactionId = `interaction_${Date.now()}`;
        set((state) => ({
          socialInteractions: {
            ...state.socialInteractions,
            [interactionId]: {
              id: interactionId,
              ...interaction,
            },
          },
        }));
        return interactionId;
      },

      removeInteraction: async (interactionId) => {
        set((state) => ({
          socialInteractions: Object.fromEntries(
            Object.entries(state.socialInteractions).filter(
              ([id]) => id !== interactionId
            )
          ),
        }));
      },

      reactToInteraction: async (interactionId, reaction) => {
        set((state) => ({
          socialInteractions: {
            ...state.socialInteractions,
            [interactionId]: {
              ...state.socialInteractions[interactionId],
              reactions: [
                ...(state.socialInteractions[interactionId].reactions || []),
                {
                  type: reaction,
                  userId: state.currentUser?.id || '',
                  timestamp: Date.now(),
                },
              ],
            },
          },
        }));
      },

      addActivity: async (type, action, details) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                recentActivity: [
                  {
                    type,
                    action,
                    timestamp: Date.now(),
                    details,
                  },
                  ...state.currentUser.recentActivity,
                ],
              }
            : null,
        }));
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
