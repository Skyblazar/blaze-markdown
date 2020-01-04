const express = require('express');
const markdownPdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.post('/pdf', (req, res) => {
  const md = req.body.md;

  const convertedFilePath = path.join(__dirname, 'converts', `md-to-pdf-${Date.now()}`);
  markdownPdf().from(md)
    .to(convertedFilePath, () => {
      console.log("converted");
      res.download(convertedFilePath, (err) => {
        if (err) return console.log(err);

        console.log("file downloaded");
      })
    });
});

server.listen('8000', () => console.log("Server Running"));
