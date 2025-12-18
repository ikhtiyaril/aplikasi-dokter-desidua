// // components/VideoCallRN.js
// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   SafeAreaView,
//   ActivityIndicator,
//   Dimensions,
// } from 'react-native';
// import { Room } from 'livekit-client';
// import {
//   LiveKitRoom,
//   AudioSession,
//   useTracks,
//   VideoTrack,
//   isTrackReference,
//   TrackReferenceOrPlaceholder,
//   Track,
//   registerGlobals, // optional if you didn't call in index.js
// } from '@livekit/react-native';
// import {WS_URL} from '@env'

// // If you haven't called registerGlobals in index.js, uncomment below:
// // registerGlobals();

// const { width } = Dimensions.get('window');

// export default function VideoCallScreen({ tokenRoom }) {
//   // room must be memoized so the same Room instance is used across renders
//   const [room] = useState(() => new Room());
//   const [connect, setConnect] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     // start audio session on mount
//     let mounted = true;
//     (async () => {
//       try {
//         await AudioSession.startAudioSession();
//       } catch (e) {
//         console.warn('AudioSession.startAudioSession error', e);
//       }
//     })();

//     return () => {
//       // stop AudioSession on unmount
//       AudioSession.stopAudioSession();
//       // also disconnect room when leaving screen if connected
//       if (room && room.state === 'connected') {
//         try {
//           room.disconnect();
//         } catch (e) {}
//       }
//       mounted = false;
//     };
//   }, [room]);

//   const handleDisconnect = () => {
//     setConnect(false);
//     setIsConnected(false);
//     try {
//       room.disconnect();
//     } catch (e) {}
//   };

//   if (!tokenRoom) {
//     return (
//       <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
//         <Text style={styles.errorText}>Token tidak tersedia!</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         {!isConnected ? (
//           <TouchableOpacity
//             style={styles.connectBtn}
//             onPress={() => setConnect((c) => !c)}
//           >
//             <Text style={styles.connectBtnText}>{connect ? 'Disconnect' : 'Connect'}</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
//             <Text style={styles.disconnectBtnText}>Leave</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.roomArea}>
//         <LiveKitRoom
//           room={room}
//           token={tokenRoom}
//           serverUrl={WS_URL}
//           connect={connect}
//           audio={true}
//           video={true}
//           // optional: adapt options as needed
//           options={{
//             adaptiveStream: { pixelDensity: 'screen' },
//           }}
//           onConnected={() => setIsConnected(true)}
//           onDisconnected={() => {
//             setIsConnected(false);
//             setConnect(false);
//           }}
//           onError={(err) => {
//             console.warn('LiveKitRoom error', err);
//           }}
//         >
//           {isConnected ? <RoomTracksGrid /> : <WaitingConnected />}
//         </LiveKitRoom>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* Small loading placeholder while not connected */
// function WaitingConnected() {
//   return (
//     <View style={styles.waiting}>
//       <ActivityIndicator size="large" color="#60a5fa" />
//       <Text style={{ color: '#cbd5e1', marginTop: 8 }}>Connecting...</Text>
//     </View>
//   );
// }

// /* Grid renderer for tracks */
// function RoomTracksGrid() {
//   // get camera + screenshare tracks (placeholders included)
//   const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

//   // render in 2 columns (adjust logic if you want different layout)
//   const numColumns = 2;
//   const renderItem = ({ item }) => {
//     if (isTrackReference(item)) {
//       // item is a TrackReference
//       return (
//         <View style={styles.tile}>
//           <VideoTrack trackRef={item} style={styles.video} />
//           <View style={styles.overlay}>
//             <Text style={styles.participantName}>
//               {item.participant?.identity || item.participant?.name || 'Participant'}
//             </Text>
//             {/* simple connection quality (if available on participant) */}
//             <Text style={styles.qualityText}>
//               {item.participant?.connectionQuality ?? ''}
//             </Text>
//           </View>
//         </View>
//       );
//     } else {
//       // placeholder (no track)
//       return (
//         <View style={[styles.tile, styles.placeholder]}>
//           <Text style={styles.placeholderText}>No Camera</Text>
//         </View>
//       );
//     }
//   };

//   return (
//     <FlatList
//       data={tracks}
//       renderItem={renderItem}
//       keyExtractor={(_, idx) => String(idx)}
//       numColumns={numColumns}
//       contentContainerStyle={styles.grid}
//     />
//   );
// }

// const tileSize = Math.floor((width - 32 - 12) / 2); // padding - gaps

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0f172a' },
//   header: { padding: 12, alignItems: 'flex-end' },
//   connectBtn: {
//     backgroundColor: '#2563eb',
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//   },
//   connectBtnText: { color: '#fff', fontWeight: '600' },
//   disconnectBtn: {
//     backgroundColor: '#ef4444',
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//   },
//   disconnectBtnText: { color: '#fff', fontWeight: '600' },

//   roomArea: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },

//   waiting: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   grid: { paddingBottom: 24, paddingTop: 8 },

//   tile: {
//     width: tileSize,
//     height: Math.round((tileSize * 9) / 16) + 24,
//     margin: 6,
//     backgroundColor: '#0b1220',
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   video: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   placeholder: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#1f2937',
//   },
//   placeholderText: { color: '#94a3b8' },

//   overlay: {
//     position: 'absolute',
//     left: 8,
//     bottom: 6,
//     right: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   participantName: { color: '#fff', fontSize: 12, fontWeight: '600' },
//   qualityText: { color: '#c7d2fe', fontSize: 11 },

//   errorText: { color: '#ef4444', fontWeight: '700' },
// });
