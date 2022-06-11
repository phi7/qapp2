import { NextApiRequest, NextApiResponse } from "next";
//ァイルのパスを解決するために path もインポート
import * as path from "path";
import { createCanvas, registerFont, loadImage } from "canvas";
import "../../../../lib/firebase_admin";
import { firestore } from "firebase-admin";
import { Answer } from "../../../../models/Answer";
import { Question } from "../../../../models/Question";

const ogpMaker = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;

  const answerDoc = await firestore().collection("answers").doc(id).get();
  const answer = answerDoc.data() as Answer;
  const questionDoc = await firestore()
    .collection("questions")
    .doc(answer.questionId)
    .get();
  const question = questionDoc.data() as Question;

  registerFont(path.resolve("./fonts/OtsutomeFont_Ver3.ttf"), {
    family: "OtsutomeFont_Ver3",
  });

  const width = 600;
  const height = 315;
  //画像サイズを指定して canvas を作成
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  //背景をグレーに
  // context.fillStyle = "#888888";
  // context.fillRect(0, 0, width, height);

  //背景画像
  const backgroundImage = await loadImage(
    path.resolve("./images/hukidashi2.png")
  );
  context.drawImage(backgroundImage, 0, 0, width, height);

  //文字表示のテスト
  context.font = "20px OtsutomeFont_Ver3";
  context.fillStyle = "#424242";
  context.textAlign = "center";
  context.textBaseline = "middle";
  // context.fillText("testテスト", 100, 50);
  const lines = createTextLines(context, question.body);
  lines.forEach((line, index) => {
    const y = 157 + 40 * (index - (lines.length - 1) / 2);
    context.fillText(line, 300, y);
  });

  //画像のバッファを取得
  const buffer = canvas.toBuffer();

  //バッファをバイナリとしてレスポンスする
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": buffer.length,
  });
  res.end(buffer, "binary");
};

export default ogpMaker;

type SeparatedText = {
  line: string;
  remaining: string;
};

function createTextLine(context, text: string): SeparatedText {
  const maxWidth = 400;

  for (let i = 0; i < text.length; i++) {
    const line = text.substring(0, i + 1);
    //テキストを分割
    if (context.measureText(line).width > maxWidth) {
      return {
        line,
        remaining: text.substring(i + 1),
      };
    }
  }

  return {
    line: text,
    remaining: "",
  };
}

function createTextLines(context, text: string): string[] {
  const lines: string[] = [];
  let currentText = text;

  while (currentText !== "") {
    const separatedText = createTextLine(context, currentText);
    lines.push(separatedText.line);
    currentText = separatedText.remaining;
  }

  return lines;
}
