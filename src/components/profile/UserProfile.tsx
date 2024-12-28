'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/store/useUserStore';

interface UserProfileProps {
  userId?: string; // If not provided, shows current user's profile
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'friends' | 'groups'
  >('overview');
  const [isEditing, setIsEditing] = useState(false);

  const {
    currentUser,
    friends,
    studyGroups,
    updateProfile,
    sendFriendRequest,
    followUser,
    unfollowUser,
  } = useUserStore();

  const user = userId ? friends[userId] : currentUser;
  const isCurrentUser = !userId || userId === currentUser?.id;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleProfileUpdate = async (updates: any) => {
    await updateProfile(updates);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-4xl text-indigo-600">
                    {user.username.charAt(0)}
                  </span>
                </div>
              )}
              {isCurrentUser && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  ✏️
                </button>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-600 mt-1">Level {user.level}</p>
              <p className="text-gray-500 text-sm mt-2">
                Joined {formatDate(user.joinedAt)}
              </p>
              {user.bio && (
                <p className="text-gray-700 mt-4 max-w-xl">{user.bio}</p>
              )}
            </div>
          </div>

          {!isCurrentUser && (
            <div className="flex space-x-4">
              <button
                onClick={() => sendFriendRequest(user.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Friend
              </button>
              <button
                onClick={() =>
                  user.social.followers.includes(currentUser?.id || '')
                    ? unfollowUser(user.id)
                    : followUser(user.id)
                }
                className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {user.social.followers.includes(currentUser?.id || '')
                  ? 'Unfollow'
                  : 'Follow'}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {user.stats.totalPagesRead}
            </div>
            <div className="text-sm text-gray-600">Pages Read</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {user.stats.practiceStreak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {user.social.friends.length}
            </div>
            <div className="text-sm text-gray-600">Friends</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {user.stats.achievementsUnlocked}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {(['overview', 'activity', 'friends', 'groups'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Learning Progress
                </h2>
                {/* Add learning progress visualization here */}
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {user.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {activity.type === 'achievement' && '🏆'}
                      {activity.type === 'challenge' && '🎯'}
                      {activity.type === 'practice' && '📚'}
                      {activity.type === 'book' && '📖'}
                      {activity.type === 'social' && '👥'}
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {user.social.friends.map((friendId) => {
                  const friend = friends[friendId];
                  if (!friend) return null;

                  return (
                    <div
                      key={friendId}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt={friend.username}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xl text-indigo-600">
                            {friend.username.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          Level {friend.level}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'groups' && (
              <motion.div
                key="groups"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {user.social.studyGroups.map((groupId) => {
                  const group = studyGroups[groupId];
                  if (!group) return null;

                  return (
                    <div
                      key={groupId}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        {group.avatarUrl ? (
                          <img
                            src={group.avatarUrl}
                            alt={group.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xl text-indigo-600">
                              {group.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {group.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {group.description}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit Profile
              </h2>
              {/* Add edit profile form here */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProfileUpdate({})}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
