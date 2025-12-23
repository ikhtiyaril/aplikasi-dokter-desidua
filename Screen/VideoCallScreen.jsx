import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import VideoCall from '../components/VideoCall';

const VideoCallScreen = ({ route }) => {
  return (
    <ScreenWrapper>
      {/* langsung kirim route */}
      <VideoCall route={route} />
    </ScreenWrapper>
  );
};

export default VideoCallScreen;
