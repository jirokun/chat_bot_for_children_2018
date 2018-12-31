const express = require("express");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const aws = require("aws-sdk");

let polly = new aws.Polly({
  apiVersion: "2016-06-10",
  region: "ap-northeast-1"
});

app.use(express.static("public"));
io.on("connection", socket => {
  socket.on("sound", async params => {
    io.emit("receiveSound", params);
  });
  socket.on("speak", async params => {
    const speechParams = {
      OutputFormat: "mp3",
      VoiceId: params.speaker,
      Text: params.text,
      SampleRate: "22050",
      TextType: "text"
    };

    const data = await polly.synthesizeSpeech(speechParams).promise();
    io.emit("receivePolly", data);
  });
});
app.get('/settings', function(req, res) {
  res.send({ talkApiKey: process.env.talkApiKey });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
