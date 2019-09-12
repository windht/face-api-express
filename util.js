require("@tensorflow/tfjs-node");

const faceapi = require("face-api.js");
const minConfidence = 0.5;
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
  minConfidence
});
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

module.exports = {
  init: async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
    await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");
  },
  detect: async (_image, detail) => {
    const image = await canvas.loadImage(_image);
    let detections;

    if (detail) {
      detections = await faceapi
        .detectAllFaces(image, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors();
    } else {
      detections = await faceapi.detectAllFaces(image, faceDetectionOptions);
    }

    return detections;
  },
  detectMatches: async ({ _image, _faces, draw }) => {
    const image = await canvas.loadImage(_image);
    const labeledDescriptors = await Promise.all(
      _faces.map(async face => {
        const faceImage = await canvas.loadImage(face.image);
        const faceImageFd = await faceapi
          .detectSingleFace(faceImage)
          .withFaceLandmarks()
          .withFaceDescriptor();
        return new faceapi.LabeledFaceDescriptors(face.name, [
          faceImageFd.descriptor
        ]);
      })
    );
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const results = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const detections = results.map(fd => ({
      ...fd,
      match: faceMatcher.findBestMatch(fd.descriptor)
    }));

    let detectedImage;

    if (draw) {
      const _canvas = canvas.createCanvas(image.width, image.height);
      const ctx = _canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      detections.forEach(detection => {
        if (detection.match.distance < 0.4) {
          const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
            label: detection.match.label + " " + detection.match.distance,
            boxColor: "rgb(0,100,0)"
          });
          drawBox.draw(_canvas);
        }
      });
      detectedImage = _canvas.toDataURL("image/jpeg");
    }

    return { detections, detectedImage };
  },
  detectMatchesWithDescriptors: async ({ _image, _faces, draw }) => {
    const image = await canvas.loadImage(_image);
    const labeledDescriptors = _faces.map(face => {
      return new faceapi.LabeledFaceDescriptors(face.name, [
        new Float32Array(face.descriptor)
      ]);
    });
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
    const results = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const detections = results.map(fd => ({
      ...fd,
      match: faceMatcher.findBestMatch(fd.descriptor)
    }));

    let detectedImage;

    if (draw) {
      const _canvas = canvas.createCanvas(image.width, image.height);
      const ctx = _canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      detections.forEach(detection => {
        if (detection.match.distance < 0.4) {
          const drawBox = new faceapi.draw.DrawBox(detection.detection.box, {
            label: detection.match.label + " " + detection.match.distance,
            boxColor: "rgb(0,100,0)"
          });
          drawBox.draw(_canvas);
        }
      });
      detectedImage = _canvas.toDataURL("image/jpeg");
    }

    return { detections, detectedImage };
  }
};
