/**
 * ConnectJS compatible log functions
 */

var bytes = require('bytes');
var connect = require('connect');


/**
 * Development logger with color output and response times
 */

exports.dev = function (server_name) {

  return connect.logger(function (tokens, req, res) {
    var status = res.statusCode;
    var len = parseInt(res.getHeader('Content-Length'), 10);
    var color = 32;

    if (status >= 500) {
      color = 31;
    } else if (status >= 400) {
      color = 33;
    } else if (status >= 300) {
      color = 36;
    }

    len = isNaN(len) ? '' : len = ' - ' + bytes(len);

    var logStr = '\033[90m' + '[' + server_name + '] ' + req.method;
        logStr += ' ' + req.originalUrl + ' ';
        logStr += '\033[' + color + 'm' + res.statusCode;
        logStr += ' \033[90m';
        logStr += (new Date() - req._startTime);
        logStr += 'ms' + len;
        logStr += '\033[0m';

    return logStr;
  });

};
