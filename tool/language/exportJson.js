var path = require("path");
var fs = require("fs");
var xlsx = require("C:/Users/xiaojiang/node_modules/node-xlsx");

var langExcelPath = "D:/case/tool/language/"
var language = "en.xls"
var langJsonName = "./en.json"

function writeJson() {
    let outPut = xlsx.parse(langExcelPath + language);
    let outPutData = outPut[0]['data'];
    let jsonData = {};
    for (let index = 1; index < outPutData.length; index++) {
        if (outPutData[index][1]) {
            jsonData[outPutData[index][0]] = outPutData[index][1];
        }
    }
    let jsonSavePath = path.join(__dirname, langJsonName);
    fs.writeFileSync(jsonSavePath, JSON.stringify(jsonData));
    console.log('write json success');
}