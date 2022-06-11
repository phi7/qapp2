import { NextApiRequest, NextApiResponse } from "next";
import "../../../../lib/firebase_admin";
import { firestore } from "firebase-admin";
import { Answer } from "./../../../../models/Answer";
import { Question } from "./../../../../models/Question";

// const responseJson = async (req: NextApiRequest, res: NextApiResponse) => {
//   const id = req.query.id as string;

//   const doc = await firestore().collection("answers").doc(id).get();

//   res.status(200).json(doc.data());
// };

// export default responseJson;

type Data = {
  answer: Answer;
  question: Question;
};

const responseJson = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  //多分urlを分解してidのところをとってきている．どこでidを定義しているのだろうか？
  const id = req.query.id as string;

  //answersコレクションのidのドキュメントを取得
  const answerDoc = await firestore().collection("answers").doc(id).get();
  //そのドキュメント内のデータをAnswer型で取得
  const answer = answerDoc.data() as Answer;
  //ドキュメントのうちidを取得して上書き．なぜ？firestore上のフィールドにidだけないからか．なら，answerDoc.idじゃなくてidでよくない？→ためしたらいけた．
  answer.id = answerDoc.id;

  //今度はanswersの指定ドキュメントでえられたフィールドのqusestionidをつかって，ドキュメントを取得する．
  const questionDoc = await firestore()
    .collection("questions")
    .doc(answer.questionId)
    .get();
  //ドキュメント内のデータをQuestion型で取得
  const question = questionDoc.data() as Question;
  //ドキュメントのデータで，idだけ内のでこちらで代入してあげる．
  question.id = questionDoc.id;

  //おくりかえしている
  res.status(200).json({
    answer,
    question,
  });
};

export default responseJson;
