var cheerio = require('cheerio');
var http = require('http');
var lib = require('./lib');

/*
 var imdb = require('./services/imdb');
 imdb.getPersonDetails('nm0027572', function(results) {
 console.log(results);
 });
 */

exports.getPersonDetails = function(personId, callback) {
    http.get({
        host: 'www.imdb.com',
        path: '/name/' + personId + '/?ref_=nv_sr_1'
    }, function (response) {
        var result = '';
        // Continuously update stream with data
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            $ = cheerio.load(body);
            var items = $('.filmo-row');
            for (var i = 0; i < items.length; i++) {
                var item = $(items[i]);
                var itemId = item.attr('id');
                var text = item.find('b a').text();
                var year = item.find('span.year_column').text().trim();
                var category = itemId.substring(0, itemId.indexOf('-'));
                result += lib.pascal(category) + ": " + text + '\t(' + year + ')\r\n';
            }
            callback(result);
        });
    });
};

