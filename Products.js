/*var fs = require("fs");
var myJson = {
    key: "myvalue"
};

fs.writeFile( "filename.json", JSON.stringify( myJson ), "utf8", yourCallback );
*/
// And then, to read it...
Products = require(__dirname + "/data/Products.json");
console.log(Products.length);
console.log(Products[2].name);
console.log(__dirname + "/data/Products.json");