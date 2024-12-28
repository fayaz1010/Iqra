'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeachingStore } from '@/lib/store/useTeachingStore';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftIcon,
  HandRaisedIcon,
  XMarkIcon,
  PaperClipIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import { TeachingSession } from '@/lib/types/teaching';

interface VirtualClassroomProps {
  sessionId: string;
  userId: string;
  userName: string;
}

export default function VirtualClassroom({
  sessionId,
  userId,
  userName,
}: VirtualClassroomProps) {
  const [layout, setLayout] = useState<'grid' | 'focus'>('grid');
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [message, setMessage] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    sendSessionMessage,
    updateParticipantPermissions,
    shareResource,
  } = useTeachingStore();

  const session = sessions[sessionId];
  const currentParticipant = session?.participants.find(
    (p) => p.userId === userId
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [session?.media.chat]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendSessionMessage(sessionId, {
      userId,
      content: message,
      type: 'text',
    });
    setMessage('');
  };

  const handleToggleAudio = () => {
    if (!currentParticipant?.permissions.audio) return;
    setAudioEnabled(!audioEnabled);
  };

  const handleToggleVideo = () => {
    if (!currentParticipant?.permissions.video) return;
    setVideoEnabled(!videoEnabled);
  };

  const handleToggleScreenShare = () => {
    if (!currentParticipant?.permissions.screen) return;
    setScreenSharing(!screenSharing);
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    sendSessionMessage(sessionId, {
      userId,
      content: `${userName} ${!handRaised ? 'raised' : 'lowered'} their hand`,
      type: 'system',
    });
  };

  const renderParticipantVideo = (participant: TeachingSession['participants'][0]) => {
    const isTeacher = participant.role === 'teacher';

    return (
      <motion.div
        layout
        className={`relative rounded-2xl overflow-hidden bg-gray-900 ${
          layout === 'focus' && isTeacher ? 'col-span-3 row-span-2' : ''
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl">
            {participant.userId[0].toUpperCase()}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium px-2 py-1 rounded-lg bg-black/50">
              {participant.userId}
            </span>
            {participant.role === 'teacher' && (
              <span className="text-xs text-white px-2 py-1 rounded-lg bg-indigo-600">
                Teacher
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!participant.permissions.audio && (
              <MicrophoneIcon className="w-5 h-5 text-red-500" />
            )}
            {!participant.permissions.video && (
              <VideoCameraIcon className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!session) return null;

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div
            className={`grid gap-4 h-full ${
              layout === 'grid'
                ? 'grid-cols-3'
                : 'grid-cols-4 grid-rows-2'
            }`}
          >
            {session.participants.map((participant) =>
              renderParticipantVideo(participant)
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="h-20 bg-white border-t flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleAudio}
              className={`p-3 rounded-lg ${
                audioEnabled
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-red-100 text-red-700'
              }`}
              disabled={!currentParticipant?.permissions.audio}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleToggleVideo}
              className={`p-3 rounded-lg ${
                videoEnabled
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-red-100 text-red-700'
              }`}
              disabled={!currentParticipant?.permissions.video}
            >
              <VideoCameraIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-lg ${
                screenSharing
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
              disabled={!currentParticipant?.permissions.screen}
            >
              <ComputerDesktopIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRaiseHand}
              className={`p-3 rounded-lg ${
                handRaised
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <HandRaisedIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setLayout(layout === 'grid' ? 'focus' : 'grid')}
              className="p-3 rounded-lg bg-gray-100 text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {layout === 'grid' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                  />
                )}
              </svg>
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-lg ${
                showChat
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <ChatBubbleLeftIcon className="w-6 h-6" />
            </button>
          </div>

          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Leave
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l"
          >
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="h-16 border-b flex items-center justify-between px-4">
                <h2 className="text-lg font-semibold">Chat</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {session.media.chat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.userId === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.type === 'system' ? (
                      <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600">
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[80%] ${
                          msg.userId === userId
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        } rounded-2xl px-4 py-2`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {msg.userId === userId ? 'You' : msg.userId}
                        </div>
                        <div>{msg.content}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="h-24 border-t p-4">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute right-2 top-2 flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded-lg">
                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-lg">
                        <FaceSmileIcon className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
