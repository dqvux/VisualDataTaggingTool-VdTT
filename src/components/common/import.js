//const fs = require('fs');

export function getBase64(file, callback) {
    const reader = new window.FileReader();
    reader.onload = () => callback(reader.result)
    reader.readAsDataURL(file);
}

// export function getBase64(file) {
//     var bitmap = fs.readFileSync(file);
//     // convert binary data to base64 encoded string
//     return new Buffer(bitmap).toString('base64');
// }

