// # SimpleServer
// A simple chat bot server
import logger from "morgan";
import http from "http";
import bodyParser from "body-parser";
import express from "express";
import request from "request";
import fetch from "node-fetch";

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
app.get("/", (req, res) => {
  res.send("Server chạy ngon lành.");
});
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "hung") {
    return res.send(req.query["hub.challenge"]);
  }
  return res.send("Error, wrong validation token");
});
// Đoạn code xử lý khi có người nhắn tin cho bot
app.post("/webhook", function (req, res) {
  try {
    var entries = req.body.entry;
    console.log("🚀 ~ file: index.js:31 ~ entries:", entries);
    for (var entry of entries) {
      var messaging = entry.messaging;
      for (var message of messaging) {
        var senderId = message.sender.id;
        console.log("🚀 ~ file: index.js:37 ~ senderId:", senderId);
        if (message.message) {
          // Nếu người dùng gửi tin nhắn đến
          if (message.message.text) {
            var text = message.message.text;
            if (text == "hi" || text == "hello") {
              sendMessage(senderId, "Trung Quân's Bot: " + "Xin Chào");
            } else {
              sendMessage(
                senderId,
                "Trung Quân's Bot: " +
                  "Xin lỗi, câu hỏi của bạn chưa có trong hệ thống, chúng tôi sẽ cập nhật sớm nhất."
              );
            }
          }
        }
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    res.status(400);
    console.log(err);
  }
});
// Gửi thông tin tới REST API để Bot tự trả lời
function sendMessage(senderId, message) {
  fetch(
    "https://graph.facebook.com/v2.6/me/messages?access_token=EAAHiYnzzFcwBO5c2RRbDlSgPYIg5R0JMZAP70KDCAD9oHFEQm9I9RVZCG5Gyvpg6mZCxbTdDryFuEVgPbaZAbKQJCJhYeyK8PQbhpd1zhRsGjBlZBPm8FQOdjJQBBR5BmVBOLFV52cFYtiFw3ewOJLu9vnIGrlkoGmGwCzHDZAoSygaYOxrFOqdIG1P9mdZBlrM",
    {
      method: "POST",
      body: {
        recipient: {
          id: senderId,
        },
        message: {
          text: message,
        },
      },
    }
  );
}
