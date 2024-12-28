import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Workspace,
  WorkspacePage,
  Resource,
  Annotation,
  Comment,
  CollaborationSession,
  GameElement,
  Quest,
} from '../types/collaborative';

interface CollaborativeState {
  workspaces: Record<string, Workspace>;
  activeSessions: Record<string, CollaborationSession>;
  gameElements: Record<string, GameElement>;
  quests: Record<string, Quest>;
  activeWorkspace: string | null;
  activeSession: string | null;
  loading: boolean;
  error: string | null;

  // Workspace actions
  createWorkspace: (workspace: Omit<Workspace, 'id'>) => string;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (workspaceId: string) => void;
  setActiveWorkspace: (workspaceId: string | null) => void;

  // Page actions
  createPage: (workspaceId: string, page: Omit<WorkspacePage, 'id'>) => string;
  updatePage: (
    workspaceId: string,
    pageId: string,
    updates: Partial<WorkspacePage>
  ) => void;
  deletePage: (workspaceId: string, pageId: string) => void;

  // Resource actions
  addResource: (workspaceId: string, resource: Omit<Resource, 'id'>) => string;
  updateResource: (
    workspaceId: string,
    resourceId: string,
    updates: Partial<Resource>
  ) => void;
  deleteResource: (workspaceId: string, resourceId: string) => void;

  // Annotation actions
  addAnnotation: (
    workspaceId: string,
    annotation: Omit<Annotation, 'id'>
  ) => string;
  updateAnnotation: (
    workspaceId: string,
    annotationId: string,
    updates: Partial<Annotation>
  ) => void;
  deleteAnnotation: (workspaceId: string, annotationId: string) => void;

  // Comment actions
  addComment: (
    workspaceId: string,
    comment: Omit<Comment, 'id'>
  ) => string;
  updateComment: (
    workspaceId: string,
    commentId: string,
    updates: Partial<Comment>
  ) => void;
  deleteComment: (workspaceId: string, commentId: string) => void;

  // Session actions
  createSession: (session: Omit<CollaborationSession, 'id'>) => string;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  endSession: (sessionId: string) => void;
  sendMessage: (sessionId: string, content: string) => void;

  // Game element actions
  addGameElement: (element: Omit<GameElement, 'id'>) => string;
  updateGameElement: (
    elementId: string,
    updates: Partial<GameElement>
  ) => void;
  claimReward: (elementId: string, rewardIndex: number) => void;

  // Quest actions
  createQuest: (quest: Omit<Quest, 'id'>) => string;
  updateQuestProgress: (
    questId: string,
    taskId: string,
    progress: number
  ) => void;
  completeQuest: (questId: string) => void;

  // Utility actions
  getActiveParticipants: (sessionId: string) => string[];
  getWorkspaceMembers: (workspaceId: string) => string[];
  searchWorkspaces: (query: string) => Workspace[];
  getQuestProgress: (questId: string) => number;
}

export const useCollaborativeStore = create<CollaborativeState>()(
  persist(
    (set, get) => ({
      workspaces: {},
      activeSessions: {},
      gameElements: {},
      quests: {},
      activeWorkspace: null,
      activeSession: null,
      loading: false,
      error: null,

      createWorkspace: (workspace) => {
        const workspaceId = `workspace_${Date.now()}`;
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              id: workspaceId,
              ...workspace,
            },
          },
        }));
        return workspaceId;
      },

      updateWorkspace: (workspaceId, updates) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              ...updates,
            },
          },
        }));
      },

      deleteWorkspace: (workspaceId) => {
        set((state) => {
          const { [workspaceId]: deleted, ...rest } = state.workspaces;
          return { workspaces: rest };
        });
      },

      setActiveWorkspace: (workspaceId) => {
        set({ activeWorkspace: workspaceId });
      },

      createPage: (workspaceId, page) => {
        const pageId = `page_${Date.now()}`;
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                pages: [
                  ...state.workspaces[workspaceId].content.pages,
                  {
                    id: pageId,
                    ...page,
                  },
                ],
              },
            },
          },
        }));
        return pageId;
      },

      updatePage: (workspaceId, pageId, updates) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                pages: state.workspaces[workspaceId].content.pages.map((page) =>
                  page.id === pageId ? { ...page, ...updates } : page
                ),
              },
            },
          },
        }));
      },

      deletePage: (workspaceId, pageId) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                pages: state.workspaces[workspaceId].content.pages.filter(
                  (page) => page.id !== pageId
                ),
              },
            },
          },
        }));
      },

      addResource: (workspaceId, resource) => {
        const resourceId = `resource_${Date.now()}`;
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                resources: [
                  ...state.workspaces[workspaceId].content.resources,
                  {
                    id: resourceId,
                    ...resource,
                  },
                ],
              },
            },
          },
        }));
        return resourceId;
      },

      updateResource: (workspaceId, resourceId, updates) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                resources: state.workspaces[workspaceId].content.resources.map(
                  (resource) =>
                    resource.id === resourceId
                      ? { ...resource, ...updates }
                      : resource
                ),
              },
            },
          },
        }));
      },

      deleteResource: (workspaceId, resourceId) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                resources: state.workspaces[workspaceId].content.resources.filter(
                  (resource) => resource.id !== resourceId
                ),
              },
            },
          },
        }));
      },

      addAnnotation: (workspaceId, annotation) => {
        const annotationId = `annotation_${Date.now()}`;
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                annotations: [
                  ...state.workspaces[workspaceId].content.annotations,
                  {
                    id: annotationId,
                    ...annotation,
                  },
                ],
              },
            },
          },
        }));
        return annotationId;
      },

      updateAnnotation: (workspaceId, annotationId, updates) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                annotations: state.workspaces[
                  workspaceId
                ].content.annotations.map((annotation) =>
                  annotation.id === annotationId
                    ? { ...annotation, ...updates }
                    : annotation
                ),
              },
            },
          },
        }));
      },

      deleteAnnotation: (workspaceId, annotationId) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                annotations: state.workspaces[
                  workspaceId
                ].content.annotations.filter(
                  (annotation) => annotation.id !== annotationId
                ),
              },
            },
          },
        }));
      },

      addComment: (workspaceId, comment) => {
        const commentId = `comment_${Date.now()}`;
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                comments: [
                  ...state.workspaces[workspaceId].content.comments,
                  {
                    id: commentId,
                    ...comment,
                  },
                ],
              },
            },
          },
        }));
        return commentId;
      },

      updateComment: (workspaceId, commentId, updates) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                comments: state.workspaces[workspaceId].content.comments.map(
                  (comment) =>
                    comment.id === commentId
                      ? { ...comment, ...updates }
                      : comment
                ),
              },
            },
          },
        }));
      },

      deleteComment: (workspaceId, commentId) => {
        set((state) => ({
          workspaces: {
            ...state.workspaces,
            [workspaceId]: {
              ...state.workspaces[workspaceId],
              content: {
                ...state.workspaces[workspaceId].content,
                comments: state.workspaces[workspaceId].content.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              },
            },
          },
        }));
      },

      createSession: (session) => {
        const sessionId = `session_${Date.now()}`;
        set((state) => ({
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              id: sessionId,
              ...session,
            },
          },
        }));
        return sessionId;
      },

      joinSession: (sessionId) => {
        set((state) => ({
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              participants: [
                ...state.activeSessions[sessionId].participants,
                {
                  userId: 'currentUser', // Replace with actual user ID
                  role: 'participant',
                  joinedAt: Date.now(),
                  status: 'active',
                },
              ],
            },
          },
          activeSession: sessionId,
        }));
      },

      leaveSession: (sessionId) => {
        set((state) => ({
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              participants: state.activeSessions[sessionId].participants.filter(
                (p) => p.userId !== 'currentUser' // Replace with actual user ID
              ),
            },
          },
          activeSession: null,
        }));
      },

      endSession: (sessionId) => {
        set((state) => ({
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              status: 'ended',
              endTime: Date.now(),
            },
          },
        }));
      },

      sendMessage: (sessionId, content) => {
        set((state) => ({
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              chat: {
                messages: [
                  ...state.activeSessions[sessionId].chat.messages,
                  {
                    id: `message_${Date.now()}`,
                    senderId: 'currentUser', // Replace with actual user ID
                    content,
                    timestamp: Date.now(),
                    type: 'text',
                  },
                ],
              },
            },
          },
        }));
      },

      addGameElement: (element) => {
        const elementId = `element_${Date.now()}`;
        set((state) => ({
          gameElements: {
            ...state.gameElements,
            [elementId]: {
              id: elementId,
              ...element,
            },
          },
        }));
        return elementId;
      },

      updateGameElement: (elementId, updates) => {
        set((state) => ({
          gameElements: {
            ...state.gameElements,
            [elementId]: {
              ...state.gameElements[elementId],
              ...updates,
            },
          },
        }));
      },

      claimReward: (elementId, rewardIndex) => {
        set((state) => ({
          gameElements: {
            ...state.gameElements,
            [elementId]: {
              ...state.gameElements[elementId],
              rewards: state.gameElements[elementId].rewards.map((reward, index) =>
                index === rewardIndex ? { ...reward, claimed: true } : reward
              ),
            },
          },
        }));
      },

      createQuest: (quest) => {
        const questId = `quest_${Date.now()}`;
        set((state) => ({
          quests: {
            ...state.quests,
            [questId]: {
              id: questId,
              ...quest,
            },
          },
        }));
        return questId;
      },

      updateQuestProgress: (questId, taskId, progress) => {
        set((state) => ({
          quests: {
            ...state.quests,
            [questId]: {
              ...state.quests[questId],
              tasks: state.quests[questId].tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      progress,
                      completed: progress >= task.target,
                    }
                  : task
              ),
            },
          },
        }));
      },

      completeQuest: (questId) => {
        set((state) => ({
          quests: {
            ...state.quests,
            [questId]: {
              ...state.quests[questId],
              status: 'completed',
            },
          },
        }));
      },

      getActiveParticipants: (sessionId) => {
        const { activeSessions } = get();
        return activeSessions[sessionId]?.participants
          .filter((p) => p.status === 'active')
          .map((p) => p.userId) || [];
      },

      getWorkspaceMembers: (workspaceId) => {
        const { workspaces } = get();
        return workspaces[workspaceId]?.members.map((m) => m.userId) || [];
      },

      searchWorkspaces: (query) => {
        const { workspaces } = get();
        const lowercaseQuery = query.toLowerCase();
        return Object.values(workspaces).filter(
          (workspace) =>
            workspace.name.toLowerCase().includes(lowercaseQuery) ||
            workspace.description?.toLowerCase().includes(lowercaseQuery)
        );
      },

      getQuestProgress: (questId) => {
        const { quests } = get();
        const quest = quests[questId];
        if (!quest) return 0;

        const completedTasks = quest.tasks.filter((task) => task.completed).length;
        return (completedTasks / quest.tasks.length) * 100;
      },
    }),
    {
      name: 'collaborative-storage',
    }
  )
);
