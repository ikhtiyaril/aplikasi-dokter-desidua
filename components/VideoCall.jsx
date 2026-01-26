import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

import { WS_URL } from '@env';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  LayoutGrid, 
  Square, 
  PhoneOff, 
  X,
  User,
  Maximize2
} from 'lucide-react-native';

import { Room, Track } from 'livekit-client';
import {
  LiveKitRoom,
  AudioSession,
  useTracks,
  VideoTrack,
  isTrackReference,
  useRoomContext,
  useLocalParticipant,
} from '@livekit/react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  secondary: '#60a5fa',
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  surface: '#eff6ff',
  surfaceElevated: '#dbeafe',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  success: '#10b981',
  border: '#cbd5e1',
  borderLight: '#e2e8f0',
  overlay: 'rgba(15, 23, 42, 0.7)',
  white: '#ffffff',
};

export default function VideoCall({ route }) {
  const { tokenRoom } = route.params || {};
  const [room] = useState(() => new Room());
  const [connect, setConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAudio = async () => {
      try {
        await AudioSession.startAudioSession();
      } catch (error) {
        console.error('Error starting audio session:', error);
      }
    };

    initAudio();

    return () => {
      mounted = false;
      AudioSession.stopAudioSession().catch(e => console.error('Error stopping audio:', e));
      if (room) {
        room.disconnect().catch(e => console.error('Error disconnecting room:', e));
      }
    };
  }, [room]);

  const handleDisconnect = async () => {
    setConnect(false);
    setIsConnected(false);
    try {
      await room.disconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  if (!tokenRoom) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconCircle}>
            <X size={32} color={COLORS.danger} />
          </View>
          <Text style={styles.errorTitle}>Token Tidak Tersedia</Text>
          <Text style={styles.errorSubtitle}>
            Silakan periksa koneksi Anda dan coba lagi
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
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

function WaitingRoom({ onConnect }) {
  return (
    <View style={styles.waitingRoom}>
      <View style={styles.waitingContent}>
        <View style={styles.waitingIconContainer}>
          <View style={styles.iconCircleLarge}>
            <Video size={56} color={COLORS.white} strokeWidth={2} />
          </View>
        </View>
        
        <Text style={styles.waitingTitle}>Siap Bergabung?</Text>
        <Text style={styles.waitingSubtitle}>
          Kamera dan mikrofon Anda akan aktif saat masuk ke ruangan video conference.
        </Text>
        
        <TouchableOpacity 
          style={styles.joinButton} 
          onPress={onConnect}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>Gabung Sekarang</Text>
        </TouchableOpacity>

        <Text style={styles.waitingFooter}>
          Pastikan koneksi internet Anda stabil
        </Text>
      </View>
    </View>
  );
}

function MeetingRoom({ onDisconnect }) {
  const [viewMode, setViewMode] = useState('gallery');
  const [showParticipants, setShowParticipants] = useState(false);
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const participantCount = (room?.remoteParticipants?.size || 0) + 1;

  const toggleAudio = async () => {
    if (localParticipant) {
      try {
        const enabled = localParticipant.isMicrophoneEnabled;
        await localParticipant.setMicrophoneEnabled(!enabled);
        setIsMuted(enabled);
      } catch (error) {
        console.error('Error toggling audio:', error);
      }
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      try {
        const enabled = localParticipant.isCameraEnabled;
        await localParticipant.setCameraEnabled(!enabled);
        setIsVideoOff(enabled);
      } catch (error) {
        console.error('Error toggling video:', error);
      }
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'gallery' ? 'speaker' : 'gallery');
  };

  return (
    <ScreenWrapper>
      <View style={styles.meetingRoom}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>LIVE</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.participantsButton}
            onPress={() => setShowParticipants(true)}
            activeOpacity={0.7}
          >
            <Users size={20} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.participantsCount}>{participantCount}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.videoContainer}>
          {viewMode === 'gallery' ? <GalleryView /> : <SpeakerView />}
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleAudio}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIconCircle, isMuted && styles.controlIconCircleDanger]}>
                {isMuted ? (
                  <MicOff size={24} color={COLORS.white} strokeWidth={2.5} />
                ) : (
                  <Mic size={24} color={COLORS.primary} strokeWidth={2.5} />
                )}
              </View>
              <Text style={[styles.controlLabel, isMuted && styles.controlLabelDanger]}>
                {isMuted ? 'Nyalakan' : 'Bisukan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleVideo}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIconCircle, isVideoOff && styles.controlIconCircleDanger]}>
                {isVideoOff ? (
                  <VideoOff size={24} color={COLORS.white} strokeWidth={2.5} />
                ) : (
                  <Video size={24} color={COLORS.primary} strokeWidth={2.5} />
                )}
              </View>
              <Text style={[styles.controlLabel, isVideoOff && styles.controlLabelDanger]}>
                Kamera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleViewMode}
              activeOpacity={0.7}
            >
              <View style={styles.controlIconCircle}>
                {viewMode === 'gallery' ? (
                  <Maximize2 size={24} color={COLORS.primary} strokeWidth={2.5} />
                ) : (
                  <LayoutGrid size={24} color={COLORS.primary} strokeWidth={2.5} />
                )}
              </View>
              <Text style={styles.controlLabel}>Tampilan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.leaveButton} 
              onPress={onDisconnect}
              activeOpacity={0.8}
            >
              <View style={styles.leaveIconCircle}>
                <PhoneOff size={24} color={COLORS.white} strokeWidth={2.5} />
              </View>
              <Text style={styles.leaveLabel}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ParticipantsModal 
          visible={showParticipants} 
          onClose={() => setShowParticipants(false)} 
        />
      </View>
    </ScreenWrapper>
  );
}

function GalleryView() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const numColumns = tracks.length <= 2 ? 1 : 2;
  const tileWidth = numColumns === 1 ? width - 32 : (width - 48) / 2;

  return (
    <FlatList
      data={tracks}
      numColumns={numColumns}
      key={numColumns}
      contentContainerStyle={styles.galleryContainer}
      renderItem={({ item }) => {
        const isSpeaking = item.participant?.isSpeaking;
        const isVideoEnabled = item.participant?.isCameraEnabled;
        
        return (
          <View 
            style={[
              styles.tile, 
              { width: tileWidth, height: tileWidth * 1.3 }, 
              isSpeaking && styles.tileActive
            ]}
          >
            {isTrackReference(item) && isVideoEnabled ? (
              <VideoTrack trackRef={item} style={styles.video} />
            ) : (
              <View style={styles.placeholder}>
                <View style={styles.avatarCircleMedium}>
                  <User color={COLORS.white} size={32} strokeWidth={2} />
                </View>
                <Text style={styles.placeholderText}>Kamera Mati</Text>
              </View>
            )}
            
            <View style={styles.videoOverlay}>
              <Text style={styles.participantNameOverlay} numberOfLines={1}>
                {item.participant?.identity || 'Unknown'} 
                {item.participant?.isLocal && ' (Anda)'}
              </Text>
              {!item.participant?.isMicrophoneEnabled && (
                <View style={styles.micOffBadge}>
                  <MicOff size={12} color={COLORS.white} strokeWidth={2.5} />
                </View>
              )}
            </View>
          </View>
        );
      }}
      keyExtractor={(item, index) => `${item.participant?.sid || index}`}
    />
  );
}

function SpeakerView() {
  const tracks = useTracks([Track.Source.Camera]);
  const activeSpeaker = tracks.find(t => t.participant?.isSpeaking) || tracks[0];

  return (
    <View style={styles.speakerContainer}>
      {activeSpeaker && isTrackReference(activeSpeaker) && activeSpeaker.participant?.isCameraEnabled ? (
        <VideoTrack trackRef={activeSpeaker} style={styles.video} />
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.avatarCircleLarge}>
            <User color={COLORS.white} size={48} strokeWidth={2} />
          </View>
          <Text style={styles.placeholderTextLarge}>
            {activeSpeaker?.participant?.identity || 'Tidak Ada Video'}
          </Text>
        </View>
      )}
    </View>
  );
}

function ParticipantsModal({ visible, onClose }) {
  const room = useRoomContext();
  const participants = room 
    ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())] 
    : [];

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
              Peserta ({participants.length})
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.closeButton}
            >
              <X size={24} color={COLORS.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={participants}
            keyExtractor={(item) => item.sid || item.identity}
            renderItem={({ item }) => (
              <View style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantInitial}>
                    {(item.identity || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.participantInfo}>
                  <Text style={styles.participantItemName}>
                    {item.identity || 'Unknown'}
                  </Text>
                  {item.isLocal && (
                    <Text style={styles.participantBadge}>Anda</Text>
                  )}
                </View>
                
                <View style={styles.participantStatus}>
                  <View style={[
                    styles.statusIcon,
                    item.isMicrophoneEnabled ? styles.statusIconActive : styles.statusIconInactive
                  ]}>
                    {item.isMicrophoneEnabled ? 
                      <Mic size={16} color={COLORS.primary} strokeWidth={2.5} /> : 
                      <MicOff size={16} color={COLORS.danger} strokeWidth={2.5} />
                    }
                  </View>
                  <View style={[
                    styles.statusIcon,
                    item.isCameraEnabled ? styles.statusIconActive : styles.statusIconInactive
                  ]}>
                    {item.isCameraEnabled ? 
                      <Video size={16} color={COLORS.primary} strokeWidth={2.5} /> : 
                      <VideoOff size={16} color={COLORS.danger} strokeWidth={2.5} />
                    }
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  center: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  // Error States
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Waiting Room
  waitingRoom: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24,
    backgroundColor: COLORS.surface,
  },
  waitingContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  waitingIconContainer: {
    marginBottom: 32,
  },
  iconCircleLarge: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: COLORS.primary,
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  waitingTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  waitingSubtitle: { 
    fontSize: 15, 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  joinButton: { 
    backgroundColor: COLORS.primary,
    paddingHorizontal: 48, 
    paddingVertical: 16, 
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  joinButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  waitingFooter: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },

  // Meeting Room
  meetingRoom: { 
    flex: 1, 
    backgroundColor: COLORS.backgroundSecondary 
  },
  
  // Top Bar
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16,
  },
  recordingDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: COLORS.danger, 
    marginRight: 6 
  },
  recordingText: { 
    color: COLORS.danger, 
    fontSize: 12, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  participantsButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  participantsCount: { 
    marginLeft: 6, 
    color: COLORS.primary, 
    fontWeight: '700',
    fontSize: 14,
  },

  // Video Container
  videoContainer: { 
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  galleryContainer: { 
    padding: 16,
  },
  tile: { 
    margin: 6, 
    borderRadius: 16, 
    overflow: 'hidden', 
    backgroundColor: COLORS.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileActive: { 
    borderWidth: 3, 
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  video: { 
    flex: 1 
  },
  videoOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.overlay,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  participantNameOverlay: { 
    color: COLORS.white, 
    fontSize: 13, 
    fontWeight: '600', 
    flex: 1, 
    marginRight: 8 
  },
  micOffBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    padding: 4,
  },
  placeholder: { 
    flex: 1, 
    backgroundColor: COLORS.primary,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.9,
  },
  placeholderTextLarge: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.9,
  },
  avatarCircleMedium: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  avatarCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Speaker View
  speakerContainer: {
    flex: 1,
  },

  // Bottom Bar
  bottomBar: { 
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1, 
    borderTopColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
  },
  controlButton: { 
    alignItems: 'center',
  },
  controlIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  controlIconCircleDanger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  controlLabel: { 
    fontSize: 11, 
    color: COLORS.textSecondary, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  controlLabelDanger: {
    color: COLORS.danger,
  },
  leaveButton: { 
    alignItems: 'center',
  },
  leaveIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  leaveLabel: { 
    color: COLORS.danger, 
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Modal
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    paddingBottom: 32, 
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  participantItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16,
    paddingVertical: 14,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.borderLight 
  },
  participantAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.primary,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14 
  },
  participantInitial: { 
    color: COLORS.white, 
    fontWeight: '700',
    fontSize: 16,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantItemName: { 
    color: COLORS.text, 
    fontWeight: '600',
    fontSize: 15,
    marginRight: 8,
  },
  participantBadge: {
    backgroundColor: COLORS.surface,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  participantStatus: { 
    flexDirection: 'row',
    gap: 8,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconActive: {
    backgroundColor: COLORS.surface,
  },
  statusIconInactive: {
    backgroundColor: COLORS.dangerLight,
  },
});