// components/ScreenWrapper.js
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenWrapper = ({ children, style }) => {
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "white" }, style]}
      edges={["top", "left", "right", "bottom"]}
    >
      {children}
    </SafeAreaView>
  );
};

export default ScreenWrapper;
