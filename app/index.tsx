// index.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  BackHandler,
  Alert,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { Video } from "expo-av";
import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const [isSplash, setIsSplash] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const webviewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);

  useEffect(() => {
    // İnternet bağlantısını kontrol et
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

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

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [isSplash]);

  const handleVideoEnd = () => {
    setIsSplash(false);
  };

  const onNavigationStateChange = (navState: any) => {
    canGoBackRef.current = navState.canGoBack;
  };

  // Butonlara tıklama işlevleri
  const handleHomePress = () => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`
        window.location.href = 'https://www.network.surdurulebilirhasat.org.tr/activity/';
        true;
      `);
    }
  };

  const handleProfilePress = () => {
    if (webviewRef.current) {
      const script = `
        (function() {
          var profileLink = document.querySelector('li.menu-item.trx_addons_icon-cog a');
          if (profileLink) {
            profileLink.click();
          } else {
            var loginLink = document.querySelector('a.trx_addons_popup_link.trx_addons_login_link');
            if (loginLink) {
              loginLink.click();
            } else {
              alert('Profil veya Giriş Yap butonu bulunamadı.');
            }
          }
        })();
        true;
      `;
      webviewRef.current.injectJavaScript(script);
    }
  };

  const handleMessagesPress = () => {
    if (webviewRef.current) {
      const script = `
        (function() {
          var profileLink = document.querySelector('li.menu-item.trx_addons_icon-cog a');
          if (profileLink) {
            var href = profileLink.getAttribute('href');
            var match = href.match(/members\\/([^\\/]+)\\/profile\\/edit\\//);
            if (match && match[1]) {
              var username = match[1];
              var messagesUrl = 'https://www.network.surdurulebilirhasat.org.tr/members/' + username + '/bp-messages/';
              window.location.href = messagesUrl;
            } else {
              alert('Kullanıcı adı alınamadı.');
            }
          } else {
            // Kullanıcı giriş yapmamış, profil butonuna tıklanmış gibi davran
            var loginLink = document.querySelector('a.trx_addons_popup_link.trx_addons_login_link');
            if (loginLink) {
              loginLink.click();
            } else {
              alert('Giriş Yap butonu bulunamadı.');
            }
          }
        })();
        true;
      `;
      webviewRef.current.injectJavaScript(script);
    }
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
        <>
          {!isConnected ? (
            <View style={styles.noConnection}>
              <Text style={styles.noConnectionText}>
                İnternet bağlantınız yok.
              </Text>
            </View>
          ) : null}
          <WebView
            ref={webviewRef}
            source={{
              uri: "https://www.network.surdurulebilirhasat.org.tr/activity/",
            }}
            style={styles.webview}
            onNavigationStateChange={onNavigationStateChange}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            incognito={false} // Çerezlerin kalıcı olması için false olmalı
          />
          {/* Alt Menü */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.button} onPress={handleHomePress}>
              <Ionicons name="home" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleProfilePress}
            >
              <Ionicons name="person" size={28} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleMessagesPress}
            >
              <Ionicons name="chatbubble" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </>
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
    marginBottom: Dimensions.get("window").height * 0.08, // Alt menü için yer bırak
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    height: Dimensions.get("window").height * 0.08, // Yüksekliğin %8'i
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noConnection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  noConnectionText: {
    fontSize: 18,
    color: "#000",
  },
});
