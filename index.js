import express from "express";
import { middleware, Client } from "@line/bot-sdk";
import dotenv from "dotenv";
import responses from "./responses.json" assert { type: "json" };

dotenv.config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();
const client = new Client(config);

app.post("/webhook", middleware(config), async (req, res) => {
  console.log("進入");
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }
  const userInput = event.message.text;
  console.log("接收:", userInput);

  // 搜尋關鍵字回應
  let responseText = responses.default;

  // 遍歷所有回應類型
  for (const responseType of Object.values(responses.responses)) {
    // 檢查是否包含任何相關關鍵字
    if (responseType.keywords.some((keyword) => userInput.includes(keyword))) {
      responseText = responseType.reply;
      break;
    }
  }

  const echo = {
    type: "text",
    text: responseText,
  };

  await client.replyMessage(event.replyToken, [echo]);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE Bot is running on port ${port}`);
});
