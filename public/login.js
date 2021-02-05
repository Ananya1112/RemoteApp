window.addEventListener("DOMContentLoaded", () => {
    var firebaseConfig = {
        apiKey: "AIzaSyAUjwNqlPdSW5HihvKrMYbYzo6BLsXhIf8",
        authDomain: "remote-b7c6f.firebaseapp.com",
        projectId: "remote-b7c6f",
        storageBucket: "remote-b7c6f.appspot.com",
        messagingSenderId: "540120867037",
        appId: "1:540120867037:web:d241d05d12082ae8fbbb34",
        measurementId: "G-9GPVZZWLE8"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    document
      .getElementById("login")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const login = event.target.login.value;
        const password = event.target.password.value;

        firebase
          .auth()
          .signInWithEmailAndPassword(login, password)
          .then(({ user }) => {
            return user.getIdToken().then((idToken) => {
              return fetch("/sessionLogin", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken }),
              });
            });
          })
          .then(() => {
            return firebase.auth().signOut();
          })
          .then(() => {
            window.location.assign("/profile");
          });
        return false;
      });
  });