var path = require("path");
var fs = require("fs");
var xlsx = require("C:/Users/xiaojiang/node_modules/node-xlsx");

var excelPath = "D:/serverCS/bin/script/excel/ssecy/";
var prefabPath = "D:/clientCS/assets/resources/Prefab/";
var scriptPath = "D:/clientCS/assets/Script/";
var langExcelPath = "D:/case/tool/language/"
var language = "en.xls"

var lang = {};

// 异nodejs是单线程,非阻塞的特点-因readdir和stat接口为异步操作 输出结果：[]
// fs.readdir(folderName, function (err, files) {
//     for (let index = 0; index < files.length; index++) {
//         fs.stat(path.join(folderName, files[index]), function (err, data) {
//            if (data.isFile()) {
//                dirs.push(files[index]);
//            } 
//         });
//     }
//     console.log(dirs);
// });

function isNumber(str) {
    if (Number(str)+'' !== NaN+'') {
        return false;
    } else {
        return true;
    }   
}

function isEnglish(str) {
    var zZ = /^[0-9A-Za-z_+-.:/%=>() （）、]+$/;
    if (zZ.test(str)) {
        return false;
    } else {
        return true;
    }
}

fs.readdir(excelPath, function (err, files) {
    (function iterator(i) {
        if (i == files.length) {
            readClientPrefab();
            return;
        }
        fs.stat(path.join(excelPath, files[i]), function (err, data) {
            if (data.isFile()) {
                console.log(files[i]);
                var data = fs.readFileSync(excelPath + files[i]);
                let content = data.toString();
                let ret = content.match(/name=\[\[(.*?)\]\]/g);
                if (ret) {
                    for (let index = 0; index < ret.length; index++) {
                        if (ret[index].match(/name=\[\[(\S*)\]\]/)) {
                            let langStr = ret[index].match(/name=\[\[(\S*)\]\]/)[1];
                            if (langStr !== "" && isEnglish(langStr)) {
                                lang[langStr] = null;
                            }
                        }
                    }   
                }
            }
            iterator(i + 1);
        });
    })(0);
});

function getFileType(filePath) {
    let startIndex = filePath.lastIndexOf(".");
    if (startIndex !== -1) {
        return filePath.substring(startIndex + 1, filePath.length).toLowerCase();
    }
    return startIndex;
}

function readFileList(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {   
            readFileList(path.join(dir, item), filesList);
        } else {
            if (getFileType(fullPath) === "prefab") {
                filesList.push(fullPath);   
            }
        }    
    });
    return filesList;
}

function readClientPrefab() {
    let filesList = [];
    readFileList(prefabPath, filesList);
    (function iterator(i) {
        if (i == filesList.length) {
            readClientScript();
            return;
        }
        console.log(filesList[i]);
        var data = fs.readFileSync(filesList[i]);
        let content = JSON.parse(data.toString());
        for (let index = 0; index < content.length; index++) {
            if (content[index]['__type__'] === 'cc.RichText' || content[index]['__type__'] === 'cc.Label') {
                if (content[index]['__type__'] !== "" && isEnglish(content[index]['_N$string'])) {
                    lang[content[index]['_N$string']] = null;
                }
            }
        }
        iterator(i + 1);
    })(0);
}

function readFileListTwo(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {   
            readFileListTwo(path.join(dir, item), filesList);
        } else {
            if (getFileType(fullPath) === "ts") {
                filesList.push(fullPath);   
            }
        }    
    });
    return filesList;
}

function readClientScript() {
    let filesList = [];
    readFileListTwo(scriptPath, filesList);
    (function iterator(i) {
        if (i == filesList.length) {
            console.log('Success');
            writeExcel();
            return;
        }
        console.log(filesList[i]);
        var data = fs.readFileSync(filesList[i]);
        let content = data.toString()

        let retLang = content.match(/getLang\(\"(.*?)\"\)/g);
        if (retLang) {
            for (let index = 0; index < retLang.length; index++) {
                if (retLang[index].match(/getLang\(\"(\S*)\"\)/)) {
                    let langStr = retLang[index].match(/getLang\(\"(\S*)\"\)/)[1];
                    lang[langStr] = null;
                }
            }   
        }

        let retArg = content.match(/getLangArg\(\"(.*?)\"/g);
        if (retArg) {
            for (let index = 0; index < retArg.length; index++) {
                if (retArg[index].match(/getLangArg\(\"(\S*)\"/)) {
                    let langStr = retArg[index].match(/getLangArg\(\"(\S*)\"/)[1];
                    lang[langStr] = null;
                }
            }   
        }

        iterator(i + 1);
    })(0);
}

function writeExcel() {
    var obj = xlsx.parse(langExcelPath + language);
    let sheetData = obj[0]['data'];
    let chinesLang = [];
    for (const key in lang) {
        let isNot = false;
        for (let index = 1; index < sheetData.length; index++) {
            if (key === sheetData[index][0]) {
                isNot = true;
                break;
            }
        }
        if (!isNot) {
            chinesLang.push(key);
        }
    }
    for (let index = 0; index < chinesLang.length; index++) {
        obj[0]['data'].push([chinesLang[index]]);
    }
    let buffer = xlsx.build(obj);
    fs.writeFile(langExcelPath + language, buffer, function (err) {
        if (err) {
            throw err;
        }
        console.log('write to xls has finished');
    });
}