import { ipcRenderer } from 'electron';

export const toggleFloat = function(){
    ipcRenderer.send("float-it");
}

export const toggleFullScreen = function(status){
    ipcRenderer.send("fill-it", status);
}

export const getAuthUser = function(){
    return new Promise((resolve, reject) => {
        ipcRenderer.send("get-auth-user");

        ipcRenderer.on("auth-user-found", function(e, user){
            resolve(user);
        });

        ipcRenderer.on("no-auth-user", function(e, error){
            reject();
        });
    });
}

export const signIn = function(){
  return new Promise((resolve, reject) => {
    ipcRenderer.send("authenticate");

    ipcRenderer.on("auth-complete", function(e, user){
        resolve(user);
    });

    ipcRenderer.on("auth-failed", function(e, error){
      reject(error);
    });
  });
}

export const signOut = function(){
    console.log("Sign out called on bridge.");
    return new Promise((resolve, reject) => {
        ipcRenderer.send("sign-out");

        ipcRenderer.on("signed-out", function(e, user){
            console.log("Signed out");
            resolve(user);
        });

        ipcRenderer.on("sign-out-failed", function(e, error){
            console.log("Sign out failed", error);
            reject(error);
        });
    });
}
