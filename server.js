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

app.post("/detect-matches", async(req, res)=> {
    try {
        const {detections,detectedImage} = await util.detectMatches({
            _image:req.body.image.contains("http://") || req.body.image.contains("https://") ? req.body.image : Buffer.from(req.body.image,'base64'),
            _faces:req.body.faces.map(face=>({
                name:face.name,
                image:face.image.contains("http://") || face.image.contains("https://") ? face.image : Buffer.from(face.image,'base64')
            })),
            draw: req.body.draw
        });
        res.send({detections,detectedImage});
    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
});

server.listen(port, function() {
    console.log("Server started on port:" + port);
});

module.exports = server;