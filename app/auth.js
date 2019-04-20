import { config } from "dotenv";
import electronGoogleOauth from 'electron-google-oauth';
import storage from 'electron-json-storage';
import axios from 'axios';

config();

const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const USER_STORAGE_KEY = 'yt-player-auth-user';

function fetchGoogleProfile(accessToken){
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(GOOGLE_PROFILE_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      resolve(response.data);
    } catch (error) {
      console.log("Google User fetch error:", error.response.data.error);
      reject(error.response.data.error);
    }
  });
}

export const authenticate = (fromWindow) => {
  const browserWindowParams = {
    'use-content-size': true,
    center: true,
    show: true,
    resizable: false,
    'always-on-top': true,
    'standard-window': true,
    'auto-hide-menu-bar': true,
    'node-integration': false,
    parent: fromWindow,
    modal: true
  };

  console.log("Main Author Called");

  return new Promise(async (resolve, reject) => {
    try {
      const googleOauth = electronGoogleOauth(browserWindowParams);

      const tokens = await googleOauth.getAccessToken(
        [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/youtube.readonly'
        ],
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
      );

      const { name, picture } = await fetchGoogleProfile(tokens.access_token);
      const user = { name, picture, tokens };

      storage.set(USER_STORAGE_KEY, user, async (error) => {
        if (error) {
          // throw error;
          console.log("Error saving token", error);
        }

        resolve(user);
      });
    } catch (error) {
      console.log("Auth error", error);
      reject(error);
    }
  });
}

export const getUser = () => {
  return new Promise((resolve, reject) => {
    storage.get(USER_STORAGE_KEY, function (error, data) {
      if (error) {
        console.log("Error fetching pref tokens", error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
}

export const removeUser = () => {
  return new Promise((resolve, reject) => {
    storage.set(USER_STORAGE_KEY, null, function (error, data) {
      if (error) {
        console.log("Error removing user: ", error);
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
}
