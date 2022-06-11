import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { User } from "../models/User";
import { atom, useRecoilState } from "recoil";
import { useEffect } from "react";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

//ログインしてきたuserがとうろくされていなければ登録する
async function createUserIfNotFound(user: User) {
  const db = getFirestore();
  const usersCollection = collection(db, "users");
  const userRef = doc(usersCollection, user.uid);
  const document = await getDoc(userRef);
  if (document.exists()) {
    // 書き込みの方が高いので！
    return;
  }

  await setDoc(userRef, {
    name: "Nanashi" + new Date().getTime(),
  });
}

//atomはデータを入れる箱
//箱には key で名前をつける．
//この key を使用することでどこからでもデータを入れたり取り出したりできるようになる
//default でデフォルト値を指定する
//ジェネリクスをつけることでどういうタイプの型のデータを扱うか決定する
const userState = atom<User>({
  key: "user",
  default: null,
});

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (user !== null) {
      return;
    }

    const auth = getAuth();

    console.log("Start useEffect");

    signInAnonymously(auth).catch(function (error) {
      // Handle Errors here.
      console.error(error);
    });

    onAuthStateChanged(auth, function (firebaseUser) {
      if (firebaseUser) {
        console.log("Set user");
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: "",
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        // User is signed out.
        setUser(null);
      }
    });
  }, []);

  return { user };
}
