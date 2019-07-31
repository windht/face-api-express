const util = require("./util");

(async function(){
    await util.init();
    require("./server");
})().then(()=>{
    console.log("Successfully loaded")
}).catch(err=>{
    console.log(err)
})