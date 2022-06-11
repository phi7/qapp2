import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { User } from "../../models/User";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import Layout from "../../components/Layout";
import { useAuthentication } from "../../hooks/authentication";
import { toast } from "react-toastify";
import Link from "next/link";

type Query = {
  uid: string;
};
//const syokiti = { uid: "", isAnonymous: false, name: "" };

export default function UserShow() {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();
  const query = router.query as Query;

  const { user: currentUser } = useAuthentication();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  //送信するための関数
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const db = getFirestore();

    //誤連打を防ぐ．
    setIsSending(true);

    await addDoc(collection(db, "questions"), {
      senderUid: currentUser.uid,
      receiverUid: user.uid,
      body,
      isReplied: false,
      createdAt: serverTimestamp(),
    });

    setIsSending(false);

    setBody("");
    toast.success("質問を送信しました。", {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  useEffect(() => {
    //誰のページか取得する関数
    async function loadUser() {
      //初回レンダリングの場合は query の値が存在しないためロード中から動かなくなって
      //しまうから，
      if (query.uid === undefined) {
        return;
      }
      const db = getFirestore();
      const ref = doc(collection(db, "users"), query.uid);
      const userDoc = await getDoc(ref);

      if (!userDoc.exists()) {
        console.log("returned");
        return;
      }

      const gotUser = userDoc.data() as User;
      gotUser.uid = userDoc.id;
      setUser(gotUser);
    }
    //定義したやつをよんでいる．
    loadUser();
  }, [query.uid]);

  return (
    <Layout>
      {user && (
        <div className="text-center">
          <h1 className="h4">{user.name}さんのページ</h1>
          <div className="m-5">{user.name}さんに質問しよう！</div>
          <div className="row justify-content-center mb-3">
            <div className="col-12 col-md-6">
              <form onSubmit={onSubmit}>
                <textarea
                  className="form-control"
                  placeholder="おげんきですか？"
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                ></textarea>
                <div className="m-3">
                  {isSending ? (
                    <div
                      className="spinner-border text-secondary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      質問を送信する
                    </button>
                  )}
                </div>
              </form>
              <div>
                {user && (
                  <p>
                    <Link href="/users/me">
                      <a className="btn btn-link">
                        自分もみんなに質問してもらおう！
                      </a>
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
