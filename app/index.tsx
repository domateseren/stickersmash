import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, BackHandler, Alert, Dimensions, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { Video } from "expo-av";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const [isSplash, setIsSplash] = useState(true);
  const webviewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);

  useEffect(() => {
    const backAction = () => {
      if (isSplash) {
        // Splash ekranı gösterilirken geri tuşunu devre dışı bırak
        return true;
      }

      if (canGoBackRef.current && webviewRef.current) {
        webviewRef.current.goBack();
        return true; // Geri gitme işlemi gerçekleştirildi
      } else {
        Alert.alert(
          "Uygulamadan Çıkış",
          "Uygulamadan çıkmak istediğinize emin misiniz?",
          [
            {
              text: "İptal",
              onPress: () => null,
              style: "cancel",
            },
            { text: "Evet", onPress: () => BackHandler.exitApp() },
          ]
        );
        return true; // Çıkış işlemi ele alındı
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isSplash]);

  const handleVideoEnd = () => {
    setIsSplash(false);
  };

  const onNavigationStateChange = (navState: any) => {
    canGoBackRef.current = navState.canGoBack;
  };

  return (
    <View style={styles.container}>
      {isSplash ? (
        <Video
          source={require("../assets/images/splashscreen.mp4")}
          style={styles.video}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              handleVideoEnd();
            }
          }}
        />
      ) : (
        <WebView
          ref={webviewRef}
          source={{ uri: "https://www.network.surdurulebilirhasat.org.tr/activity/" }}
          style={styles.webview}
          onNavigationStateChange={onNavigationStateChange}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          incognito={false} // Çerezlerin kalıcı olması için false olmalı
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "absolute",
    top: 0,
    left: 0,
  },
  webview: {
    flex: 1,
  },
});
