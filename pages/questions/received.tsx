import { useEffect, useRef, useState } from "react";
import { Question } from "../../models/Question";
import Layout from "../../components/Layout";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  orderBy,
  QuerySnapshot,
  startAfter,
  limit,
  DocumentData,
} from "firebase/firestore";
import { useAuthentication } from "../../hooks/authentication";
import dayjs from "dayjs";
import Link from "next/link";

export default function QuestionsReceived() {
  //取得した質問一覧を保持しておくためのステート
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user } = useAuthentication();
  //全ての読み込みが完了したかどうかのフラグ
  const [isPaginationFinished, setIsPaginationFinished] = useState(false);
  //DOM の参照を行うため
  const scrollContainerRef = useRef(null);

  //クエリの共通部分
  function createBaseQuery() {
    const db = getFirestore();
    return query(
      collection(db, "questions"),
      where("receiverUid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }

  //スナップショットからデータを更新
  function appendQuestions(snapshot: QuerySnapshot<DocumentData>) {
    const gotQuestions = snapshot.docs.map((doc) => {
      const question = doc.data() as Question;
      question.id = doc.id;
      return question;
    });
    setQuestions(questions.concat(gotQuestions));
  }

  //質問を読み込む
  async function loadQuestions() {
    const snapshot = await getDocs(createBaseQuery());

    if (snapshot.empty) {
      //無限スクロールが終わった際のフラグ変更
      setIsPaginationFinished(true);
      return;
    }

    appendQuestions(snapshot);
  }

  // //質問の読み取り
  // async function loadQuestions() {
  //   const db = getFirestore();
  //   const q = query(
  //     collection(db, "questions"),
  //     where("receiverUid", "==", user.uid),
  //     orderBy("createdAt", "desc")
  //   );
  //   const snapshot = await getDocs(q);

  //   if (snapshot.empty) {
  //     return;
  //   }

  //   const gotQuestions = snapshot.docs.map((doc) => {
  //     const question = doc.data() as Question;
  //     question.id = doc.id;
  //     return question;
  //   });
  //   setQuestions(gotQuestions);
  // }

  //次の質問を読み込む
  async function loadNextQuestions() {
    if (questions.length === 0) {
      return;
    }

    const lastQuestion = questions[questions.length - 1];
    const snapshot = await getDocs(
      query(createBaseQuery(), startAfter(lastQuestion.createdAt))
    );

    if (snapshot.empty) {
      return;
    }

    appendQuestions(snapshot);
  }

  function onScroll() {
    if (isPaginationFinished) {
      return;
    }

    const container = scrollContainerRef.current;
    if (container === null) {
      return;
    }

    //一覧を囲んでいるコンテナのサイズと画面のサイズを比較して、はみ出している場合は追加データを呼び出す
    const rect = container.getBoundingClientRect();
    if (rect.top + rect.height > window.innerHeight) {
      return;
    }

    loadNextQuestions();
  }

  //scrollのためのuseeffect
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [questions, scrollContainerRef.current, isPaginationFinished]);

  //質問読み込むためのuseeffect
  useEffect(() => {
    if (!process.browser) {
      return;
    }
    if (user === null) {
      return;
    }

    loadQuestions();
  }, [process.browser, user]);

  return (
    <Layout>
      <h1 className="h4 row justify-content-center">受け取った質問一覧</h1>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6" ref={scrollContainerRef}>
          {questions.map((question) => (
            <Link href={`/questions/${question.id}`} key={question.id}>
              <a>
                <div className="card my-3">
                  <div className="card-body">
                    <div className="text-truncate">{question.body}</div>
                    <div className="text-muted text-end">
                      <small>
                        {dayjs(question.createdAt.toDate()).format(
                          "YYYY/MM/DD HH:mm"
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
