const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const util = require("./util");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 9000;
const server = require("http").createServer(app);

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

app.post("/detect", async (req, res) => {
  try {
    const detections = await util.detect(
      Buffer.from(
        req.body.image.replace(/^data:image\/jpeg;base64,/, ""),
        "base64"
      ),
      req.body.detail
    );
    res.send(detections);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/detect-matches-descriptor", async (req, res) => {
  try {
    const detections = await util.detectMatchesWithDescriptors({
      _image: Buffer.from(
        req.body.image.replace(/^data:image\/jpeg;base64,/, ""),
        "base64"
      ),
      _faces: req.body.faces,
      draw: req.body.draw
    });
    res.send(detections);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/detect-matches", async (req, res) => {
  try {
    const { detections, detectedImage } = await util.detectMatches({
      _image:
        req.body.image.includes("http://") ||
        req.body.image.includes("https://")
          ? req.body.image
          : Buffer.from(
              req.body.image.replace(/^data:image\/jpeg;base64,/, ""),
              "base64"
            ),
      _faces: req.body.faces.map(face => ({
        name: face.name,
        image:
          face.image.includes("http://") || face.image.includes("https://")
            ? face.image
            : Buffer.from(
                face.image.replace(/^data:image\/jpeg;base64,/, ""),
                "base64"
              )
      })),
      draw: req.body.draw
    });
    res.send({ detections, detectedImage });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/detect-matches-relay", async (req, res) => {
  try {
    const { detections } = await util.detectMatches({
      _image:
        req.body.image.includes("http://") ||
        req.body.image.includes("https://")
          ? req.body.image
          : Buffer.from(
              req.body.image.replace(/^data:image\/jpeg;base64,/, ""),
              "base64"
            ),
      _faces: req.body.faces.map(face => ({
        name: face.name,
        image:
          face.image.includes("http://") || face.image.includes("https://")
            ? face.image
            : Buffer.from(
                face.image.replace(/^data:image\/jpeg;base64,/, ""),
                "base64"
              )
      }))
    });

    let result = {};
    if (req.body.url) {
      try {
        const { data } = await axios.post(
          req.body.url,
          {
            detections
          },
          {
            timeout: 2000
          }
        );
        result = data;
      } catch (err) {
        result = detections;
      }
    }
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

server.listen(port, function() {
  console.log("Server started on port:" + port);
});

module.exports = server;
