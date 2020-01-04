const express = require('express');
const markdownPdf = require('markdown-pdf');
const fs = require('fs');

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.post('/pdf', (req, res) => {
  const md = req.body.md;

});
