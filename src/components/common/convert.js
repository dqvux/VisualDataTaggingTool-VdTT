export function trimSpace(str) {
    return str.replace(/\s+/g, ' ').trim() // remove all unexpected space, use regex /\s+/g instead if wanna remove all white space such as: tab, newline, ...
}

export function nomarlize(str) {
    if (str.charAt(0).match(/[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g)) {
        str = str.substr(1, str.length)
    }
    if (str.charAt(str.length - 1).match(/[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g)) {
        str = str.substr(0, str.length - 1)
    }
    return str
}

export function tokenize(character, str) {
    str = trimSpace(str)
    var tokenizedArr = str.split(character)
    return tokenizedArr
}

export function convert2IOB2(str) {
    str = str.replace(/</g, '|<').replace(/>/g, '>|')
    var outData = []
    var senTokens = tokenize('|', str)
    var numSenTokens = senTokens.length

    var inTag = false
    var tag = ''
    for (let j = 0; j < numSenTokens; j++) {
        var part = senTokens[j]
        if (part === null) {
            continue
        }
        if (part.startsWith("</")) {
            inTag = false
        }
        else if (part.startsWith("<")) {
            inTag = true
            tag = part.substr(1, part.length - 2)
        }
        else {
            var realTokens = tokenize(' ', part)
            var iob2_Token = ''
            for (let k = 0; k < realTokens.length; k++) {
                iob2_Token = nomarlize(realTokens[k])
                if (iob2_Token === '')
                    continue
                else
                    iob2_Token += "\t"
                if (inTag) {
                    if (k === 0) {
                        iob2_Token += "b-" + tag
                    } else {
                        iob2_Token += "i-" + tag
                    }
                }
                else {
                    iob2_Token += "o"
                }
                //console.log(let iob2_Token);
                outData.push(iob2_Token)
            }
        }
    }
    return outData
}

export function shuffle(array) {
    var m = array.length, t, i
    // Chừng nào vẫn còn phần tử chưa được xáo trộn thì vẫn tiếp tục
    while (m) {
        // Lấy ra 1 phần tử
        i = Math.floor(Math.random() * m--)
        // Sau đó xáo trộn nó
        t = array[m];
        array[m] = array[i]
        array[i] = t
    }
    return array
}

