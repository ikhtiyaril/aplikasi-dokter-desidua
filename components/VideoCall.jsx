import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';

import { Room, Track, RoomEvent } from 'livekit-client';
import {
  LiveKitRoom,
  AudioSession,
  useTracks,
  VideoTrack,
  isTrackReference,
  useRoomContext,
  useLocalParticipant,
} from '@livekit/react-native';
import ScreenWrapper from './ScreenWrapper';

const WS_URL = 'ws://192.168.0.101:7880';
const { width, height } = Dimensions.get('window');

export default function VideoCall({ route }) {
  const { tokenRoom } = route.params || {};

  const [room] = useState(() => new Room());
  const [connect, setConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    AudioSession.startAudioSession();

    return () => {
      AudioSession.stopAudioSession();
      try {
        room.disconnect();
      } catch (e) {}
    };
  }, [room]);

  const handleDisconnect = () => {
    setConnect(false);
    setIsConnected(false);
    try {
      room.disconnect();
    } catch (e) {}
  };

  if (!tokenRoom) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Token tidak tersedia</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LiveKitRoom
        room={room}
        token={tokenRoom}
        serverUrl={WS_URL}
        connect={connect}
        audio
        video
        onConnected={() => setIsConnected(true)}
        onDisconnected={() => {
          setIsConnected(false);
          setConnect(false);
        }}
      >
        {!isConnected ? (
          <WaitingRoom onConnect={() => setConnect(true)} />
        ) : (
          <MeetingRoom onDisconnect={handleDisconnect} />
        )}
      </LiveKitRoom>
    </SafeAreaView>
  );
}

/* =========================
   Waiting Room
========================= */
function WaitingRoom({ onConnect }) {
  return (
    <View style={styles.waitingRoom}>
      <View style={styles.waitingContent}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📹</Text>
        </View>
        <Text style={styles.waitingTitle}>Ready to join?</Text>
        <Text style={styles.waitingSubtitle}>
          Your camera and microphone will be enabled
        </Text>
        
        <TouchableOpacity style={styles.joinButton} onPress={onConnect}>
          <Text style={styles.joinButtonText}>Join Meeting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================
   Meeting Room
========================= */
function MeetingRoom({ onDisconnect }) {
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'speaker'
  const [showParticipants, setShowParticipants] = useState(false);
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const participantCount = room?.remoteParticipants?.size || 0;

  const toggleAudio = async () => {
    if (localParticipant) {
      const enabled = localParticipant.isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(!enabled);
      setIsMuted(enabled);
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      const enabled = localParticipant.isCameraEnabled;
      await localParticipant.setCameraEnabled(!enabled);
      setIsVideoOff(enabled);
    }
  };

  return (
    <View style={styles.meetingRoom}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Live</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.participantsButton}
          onPress={() => setShowParticipants(true)}
        >
          <Text style={styles.participantsIcon}>👥</Text>
          <Text style={styles.participantsCount}>{participantCount + 1}</Text>
        </TouchableOpacity>
      </View>

      {/* Video Grid */}
      <View style={styles.videoContainer}>
        {viewMode === 'gallery' ? (
          <GalleryView />
        ) : (
          <SpeakerView />
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.controlsContainer}>
          {/* Audio Toggle */}
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.controlButtonDanger]}
            onPress={toggleAudio}
          >
            <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* Video Toggle */}
          <TouchableOpacity 
            style={[styles.controlButton, isVideoOff && styles.controlButtonDanger]}
            onPress={toggleVideo}
          >
            <Text style={styles.controlIcon}>{isVideoOff ? '📹' : '📷'}</Text>
            <Text style={styles.controlLabel}>{isVideoOff ? 'Start Video' : 'Stop Video'}</Text>
          </TouchableOpacity>

          {/* Share Screen */}
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>📱</Text>
            <Text style={styles.controlLabel}>Share</Text>
          </TouchableOpacity>

          {/* View Mode */}
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
          >
            <Text style={styles.controlIcon}>
              {viewMode === 'gallery' ? '👤' : '▦'}
            </Text>
            <Text style={styles.controlLabel}>
              {viewMode === 'gallery' ? 'Speaker' : 'Gallery'}
            </Text>
          </TouchableOpacity>

          {/* Leave */}
          <TouchableOpacity 
            style={styles.leaveButton}
            onPress={onDisconnect}
          >
            <Text style={styles.leaveIcon}>📞</Text>
            <Text style={styles.leaveLabel}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Participants Modal */}
      <ParticipantsModal 
        visible={showParticipants}
        onClose={() => setShowParticipants(false)}
      />
    </View>
  );
}

/* =========================
   Gallery View
========================= */
function GalleryView() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
  ]);

  const numColumns = tracks.length <= 2 ? 1 : 2;
  const tileWidth = numColumns === 1 ? width - 24 : Math.floor((width - 36) / 2);
  const tileHeight = numColumns === 1 ? Math.round((tileWidth * 9) / 16) : Math.round((tileWidth * 3) / 4);

  return (
    <FlatList
      data={tracks}
      numColumns={numColumns}
      key={numColumns}
      contentContainerStyle={styles.galleryContainer}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => {
        if (!isTrackReference(item)) {
          return (
            <View style={[styles.tile, { width: tileWidth, height: tileHeight }, styles.placeholder]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.participant?.identity?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.participantName}>
                {item.participant?.identity || 'Participant'}
              </Text>
            </View>
          );
        }

        const isSpeaking = item.participant?.isSpeaking || false;

        return (
          <View style={[
            styles.tile, 
            { width: tileWidth, height: tileHeight },
            isSpeaking && styles.tileActive
          ]}>
            <VideoTrack trackRef={item} style={styles.video} />
            
            {/* Overlay Info */}
            <View style={styles.videoOverlay}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantNameOverlay}>
                  {item.participant?.identity || 'Participant'}
                  {item.participant?.isLocal && ' (You)'}
                </Text>
                {!item.participant?.isMicrophoneEnabled && (
                  <Text style={styles.mutedIcon}>🔇</Text>
                )}
              </View>
            </View>

            {/* Speaking Indicator */}
            {isSpeaking && (
              <View style={styles.speakingIndicator} />
            )}
          </View>
        );
      }}
    />
  );
}

/* =========================
   Speaker View
========================= */
function SpeakerView() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
  ]);

  const mainTrack = tracks[0];
  const thumbnails = tracks.slice(1);

  return (
    <View style={styles.speakerContainer}>
      {/* Main Video */}
      <View style={styles.mainVideo}>
        {mainTrack && isTrackReference(mainTrack) ? (
          <>
            <VideoTrack trackRef={mainTrack} style={styles.video} />
            <View style={styles.videoOverlay}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantNameOverlay}>
                  {mainTrack.participant?.identity || 'Participant'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>U</Text>
            </View>
          </View>
        )}
      </View>

      {/* Thumbnails */}
      {thumbnails.length > 0 && (
        <View style={styles.thumbnailContainer}>
          {thumbnails.map((track, idx) => (
            <View key={idx} style={styles.thumbnail}>
              {isTrackReference(track) ? (
                <VideoTrack trackRef={track} style={styles.video} />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.thumbnailInitial}>
                    {track.participant?.identity?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/* =========================
   Participants Modal
========================= */
function ParticipantsModal({ visible, onClose }) {
  const room = useRoomContext();
  const participants = room ? [
    room.localParticipant,
    ...Array.from(room.remoteParticipants.values())
  ] : [];

  return (
    
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Participants ({participants.length})
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={participants}
            keyExtractor={(item) => item.identity}
            renderItem={({ item }) => (
              <View style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantInitial}>
                    {item.identity.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.participantDetails}>
                  <Text style={styles.participantItemName}>
                    {item.identity} {item.isLocal && '(You)'}
                  </Text>
                  <View style={styles.participantStatus}>
                    <Text style={styles.statusIcon}>
                      {item.isMicrophoneEnabled ? '🎤' : '🔇'}
                    </Text>
                    <Text style={styles.statusIcon}>
                      {item.isCameraEnabled ? '📷' : '📹'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

/* =========================
   Styles
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Waiting Room
  waitingRoom: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  waitingContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 36,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  joinButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Meeting Room
  meetingRoom: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f0f0f',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  participantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantsIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  participantsCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Video Container
  videoContainer: {
    flex: 1,
  },
  galleryContainer: {
    padding: 12,
  },
  tile: {
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileActive: {
    borderColor: '#22c55e',
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  participantName: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantNameOverlay: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mutedIcon: {
    fontSize: 14,
  },
  speakingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 12,
  },

  // Speaker View
  speakerContainer: {
    flex: 1,
  },
  mainVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2d2d2d',
    borderWidth: 2,
    borderColor: '#374151',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b5563',
  },
  thumbnailInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // Bottom Controls
  bottomBar: {
    backgroundColor: '#0f0f0f',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
    minWidth: 60,
  },
  controlButtonDanger: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlLabel: {
    color: '#e5e7eb',
    fontSize: 11,
    fontWeight: '500',
  },
  leaveButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  leaveIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  leaveLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    color: '#94a3b8',
    fontSize: 24,
    fontWeight: '300',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  participantDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantItemName: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '500',
  },
  participantStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
});