require("@tensorflow/tfjs-node");

const faceapi = require("face-api.js");
const minConfidence = 0.5;
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence });
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

module.exports = {
    init: async()=>{
        await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    },
    detect: async (_image) => {
        const image = await canvas.loadImage(_image)
        const detections = await faceapi.detectAllFaces(image, faceDetectionOptions);
        return detections;
    }
}