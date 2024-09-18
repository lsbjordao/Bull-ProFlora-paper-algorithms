const fs = require('fs');
const ejs = require('ejs');

const taxon = 'Croton quintasii';
const threatsFilePath = `./threats/${taxon}.json`;
const threats = JSON.parse(fs.readFileSync(threatsFilePath, 'utf-8'))

const data = {
    taxon,
    threats,
};

function sendDataToEJS(data) {
    return new Promise((resolve, reject) => {
        ejs.renderFile('./EJS-template/index.ejs', data, (err, str) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(str);
        });
    });
}

sendDataToEJS(data)
    .then(htmlString => {
        fs.writeFileSync(`./EJS-template/output/${taxon}.html`, htmlString);
        console.log(`HTML file saved at ./EJS-template/output/${taxon}.html`);
    })
    .catch((error) => {
        console.error(error);
    });
