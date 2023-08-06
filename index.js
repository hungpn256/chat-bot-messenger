// # SimpleServer
// A simple chat bot server
import logger from "morgan";
import http from "http";
import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
var app = express();
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
var server = http.createServer(app);
app.listen(process.env.PORT || 3000);
app.get("/", async (req, res) => {
  res.send("Server chạy ngon lành.");
});
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "hung") {
    return res.send(req.query["hub.challenge"]);
  }
  return res.send("Error, wrong validation token");
});
const timeoutFindPartner = {};
const yourPartner = {};
const partnerPending = new Set();

app.post("/webhook", async (req, res) => {
  try {
    var entries = req.body.entry;
    console.log("🚀 ~ file: index.js:31 ~ entries:", entries);
    for (var entry of entries) {
      var messaging = entry.messaging;
      for (var message of messaging) {
        var senderId = message.sender.id;
        console.log("🚀 ~ file: index.js:39 ~ app.post ~ senderId:", senderId);
        if (message.message) {
          // Nếu người dùng gửi tin nhắn đến
          if (message.message.text) {
            var text = message.message.text;
            if (yourPartner[senderId]) {
              sendMessage(yourPartner[senderId], text);
            } else {
              if (text == "Bắt đầu") {
                if (timeoutFindPartner[senderId]) {
                  await sendMessage(senderId, "Chờ một chút nha...");
                  return;
                } else {
                  timeoutFindPartner[senderId] = setTimeout(async () => {
                    await sendMessage(
                      senderId,
                      "Hiện tại không có ai phù hợp để kết nối. Thử lại sau"
                    );
                    partnerPending.delete(senderId);
                    timeoutFindPartner[senderId] = undefined;
                  }, 60000);
                  if (partnerPending.length > 0) {
                    clearTimeout(timeoutFindPartner[senderId]);
                    const partnerId = partnerPending.shift();
                    await Promise.all([
                      sendMessage(senderId, "Đã kết nối"),
                      sendMessage(partnerId, "Đã kết nối"),
                    ]);
                    yourPartner[partnerId] = senderId;
                    yourPartner[senderId] = partnerId;
                  } else {
                    partnerPending.add(senderId);
                    await sendMessage(senderId, "Chờ một chút nha...");
                  }
                }
              } else {
                await sendMessage(
                  senderId,
                  "Trung Quân's Bot: " +
                    "Xin lỗi, câu hỏi của bạn chưa có trong hệ thống, chúng tôi sẽ cập nhật sớm nhất."
                );
              }
            }
          }
        }
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(400);
  }
});
// Gửi thông tin tới REST API để Bot tự trả lời
function sendMessage(senderId, message) {
  return axios.post(
    "https://graph.facebook.com/v2.6/me/messages?access_token=EAAHiYnzzFcwBO5c2RRbDlSgPYIg5R0JMZAP70KDCAD9oHFEQm9I9RVZCG5Gyvpg6mZCxbTdDryFuEVgPbaZAbKQJCJhYeyK8PQbhpd1zhRsGjBlZBPm8FQOdjJQBBR5BmVBOLFV52cFYtiFw3ewOJLu9vnIGrlkoGmGwCzHDZAoSygaYOxrFOqdIG1P9mdZBlrM",
    {
      recipient: {
        id: senderId,
      },
      messaging_type: "RESPONSE",
      message: {
        text: message,
      },
    }
  );
}
