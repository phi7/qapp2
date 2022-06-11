import { firestore } from "firebase-admin";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import TwitterShareButton from "../../../components/TwitterShareButton";
import { Answer } from "../../../models/Answer";
import { Question } from "../../../models/Question";

//サーバーサイドで呼ばれる
// export async function getServerSideProps({ query }) {
//   const res = await fetch(process.env.API_URL + `/api/answers/${query.id}`);
//   const json = await res.json();
//   return { props: json };
// }
type Data = {
  answer: Answer;
  question: Question;
};

export async function getServerSideProps(context) {
  await import("../../../lib/firebase_admin");
  const admin = await import("firebase-admin");
  //const id = context.params;
  const id = context.params.id as string;
  console.log(id);
  //const id = context.req.id as string;
  const answerDoc = await firestore().collection("answers").doc(id).get();
  const answer = answerDoc.data() as Answer;
  //DateTime型のデータをそのまま読み込もうとすると上記のエラーが起こるので回避
  const answer2 = JSON.parse(JSON.stringify(answer));
  answer.id = answerDoc.id;
  const questionDoc = await firestore()
    .collection("questions")
    .doc(answer.questionId)
    .get();
  const question = questionDoc.data() as Question;
  const question2 = JSON.parse(JSON.stringify(question));
  question.id = questionDoc.id;
  return {
    props: {
      answer: answer2,
      question: question2,
    },
  };
  // return { props: json }
  // return {
  //   answer,
  //   question,
  // };
}

type Props = {
  answer: Answer;
  question: Question;
};

function getDescription(answer: Answer) {
  const body = answer.body.trim().replace(/[ \r\n]/g, "");
  if (body.length < 140) {
    return body;
  }
  return body.substring(0, 140) + "...";
}

export default function AnswersShow(props: Props) {
  const description = getDescription(props.answer);
  const ogpImageUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/api/answers/${props.answer.id}/ogp`;

  return (
    <Layout>
      <Head>
        <meta property="og:image" key="ogImage" content={ogpImageUrl} />
        <meta
          name="twitter:card"
          key="twitterCard"
          content="summary_large_image"
        />
        <meta name="twitter:image" key="twitterImage" content={ogpImageUrl} />
        <meta name="description" key="description" content={description} />
        <meta
          property="og:description"
          key="ogDescription"
          content={description}
        />
      </Head>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <>
            <div className="card">
              <div className="card-body">{props.question.body}</div>
            </div>
            <section className="text-center mt-4">
              <h2 className="h4">回答</h2>

              <div className="card">
                <div className="card-body text-left">{props.answer.body}</div>
              </div>
            </section>
            <div>こんにちは！</div>
            <div className="my-3 d-flex justify-content-center">
              <TwitterShareButton
                url={`${process.env.NEXT_PUBLIC_WEB_URL}/answers/${props.answer.id}`}
                text={props.answer.body}
              ></TwitterShareButton>
            </div>
            <div>
              <p>
                <Link href="/users/me">
                  <a className="btn btn-link">
                    自分もみんなに質問してもらおう！
                  </a>
                </Link>
              </p>
            </div>
          </>
        </div>
      </div>
    </Layout>
  );
}
