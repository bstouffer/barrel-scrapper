var http = require('http');

exports.contains = function(value, key) {
    if (typeof value == 'string'
            && value != null
            && typeof key == 'string'
            && key != null
            && value.toLowerCase().indexOf(key) > -1) {
        return true;
    } else if (typeof value == 'string'
            && value != null
            && Array.isArray(key)) {
        for (var i = 0; i < key.length; i++) {
            if (value.toLowerCase().indexOf(key[i]) > -1) {
                return true;
            }
        }
    }
    return false;
};

exports.pascal = function(value) {
    var s = value.replace(/\w+/g,
        function (w) {
            return w[0].toUpperCase() + w.slice(1).toLowerCase();
        });
    return s;
};

exports.dataToCookie = function(dataCookie) {
    var t = "";
    for (var x = 0; x < dataCookie.length; x++) {
        t += ((t !== "") ? "; " : "") + dataCookie[x].key + "=" + dataCookie[x].value;
    }
    return t;
};

exports.post = function(url, data, headers, callback) {
    exports.grab("POST", url, data, headers, callback);
};

exports.get = function(url, data, headers, callback) {

    exports.grab("GET", url, data, headers, callback);
};

exports.grab = function(mode, url, data, headers, callback) {
    if (typeof callback == 'undefined' && typeof headers == 'function') {
        callback = headers;
        headers = null;
    } else if (typeof callback == 'undefined' && typeof data == 'function') {
        callback = data;
        data = {};
    } else if (typeof callback != 'function') {
        callback = null;
    }

    var host = url;
    var port = 80;

    if (host.indexOf('https://') > -1) {
        host = host.replace("https://","");
        port = 443;
    } else if (host.indexOf('http://') > -1) {
        host = host.replace("http://", "");
    }

    if (host.indexOf(':') > -1) {
        host = host.substring(0, host.indexOf(':'));
        port = host.substring(host.indexOf(':') + 1);
    }

    host = host.substring(0, host.indexOf('/'));

    var path = url.substring(url.indexOf(host) + host.length);

    var options = {
        hostname: host,
        port: port,
        path: path
    };

    if (mode == "POST") {
        options.method = "POST";
        options.headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            'Content-Length': data.length
        };
    }

    var req = http.request(options, function(res) {
        console.log('Request for ' + path + " started.\t" + (new Date()));

        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function() {
            console.log('Request for ' + path + " completed.\t" + (new Date()));
            if (body == null || body == '') {
                callback(res);
            } else {
                callback(body);
            }
        });
    });

    if (headers != null) {
        req.setHeader("Cookie", exports.dataToCookie(headers));
    }

    req.on('error', function(e) {
        console.log('Unable to process request: ' + e.message);
    });

    if (mode == "POST") {
        // write data to request body
        req.write(data);
    }
    req.end();
};