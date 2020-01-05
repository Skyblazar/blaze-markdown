const express = require('express');
const markdownPdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

const server = express();

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

server.use(allowCrossDomain);

server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.post('/pdf/:link', (req, res) => {
  const md = req.body.md;
  const link = req.params.link;

  const convertedFilePath = path.join(__dirname, 'converts', `md-to-pdf-${link}.pdf`);
  markdownPdf().from.string(md)
    .to(convertedFilePath, () => {
      console.log("converted");
      res.download(convertedFilePath, (err) => {
        if (err) return console.log(err);

        console.log("file downloaded");
      })
    });
});

server.listen('8000', () => console.log("Server Running"));
