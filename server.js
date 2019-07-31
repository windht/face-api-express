const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const util = require('./util');

const app = express();
const port = process.env.PORT || 9000;
const server = require("http").createServer(app);

app.use(cors());
app.use(bodyParser.json());

app.post("/detect", async(req, res)=> {
    try {
        const detections = await util.detect(Buffer.from(req.body.image,'base64'));
        res.send(detections);
    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
});

server.listen(port, function() {
    console.log("Server started on port:" + port);
});

module.exports = server;