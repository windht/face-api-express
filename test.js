const util = require("./util");
const fs = require("fs-extra");

const run = async () => {
  await util.init();
  const image = await fs.readFile("./test.jpg");
  return util.detect(image, true);
};

run()
  .then(detection => {
    console.log(detection);
  })
  .catch(err => {
    console.log(err);
  });
