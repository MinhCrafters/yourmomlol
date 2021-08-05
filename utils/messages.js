const marked = require('marked');
var emoji = require('node-emoji');

function formatMessage(username, text1) {
    const date = new Date();
    const month = ('0' + date.getMonth()).slice(0, 2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const hour = ('0' + date.getHours()).slice(-2);
    const mins = ('0' + date.getMinutes()).slice(-2);
    const dateString = `${hour}:${mins} - ${day}/${month}/${year}`;
    const text2 = marked(text1);
    const text = emoji.emojify(text2)
    return {
        username,
        text,
        time: dateString
    };
}

module.exports = formatMessage;