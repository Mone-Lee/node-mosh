const winston = require('winston');
const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const port = process.env.PORT || 3000;

// 导出app对象，以便在测试中使用
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;