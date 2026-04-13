const Token = require('../models/Token');

const generateUniqueTokenCode = async () => {
    const count = await Token.countDocuments();
    const nextNum = 4001 + count;
    return `TKN-${nextNum}`;
};

module.exports = generateUniqueTokenCode;
