var _ = require('underscore');
var lib = require('./services/lib');
var cheerio = require('cheerio');
var terms = ["weller", "winkle", "pappy", "ocean", "ealanta", "black maple", "solera", "abraham bowman"];

var moCoDlc = require('./services/mocodlc');

moCoDlc.mocoStock(terms, function(data) {
    _.each(data, function(whiskey) {

        moCoDlc.storeCheck(whiskey, function(whiskey, inventory) {
            console.log(lib.pascal(whiskey['description']) + '(' + whiskey['price'] + ')');

            for (var i = 0; i < inventory.length; i++) {
                var $ = cheerio.load(inventory[i]['storeName']);
                console.log('\t' + lib.pascal($('a').text()) + '(' + inventory[i]['Availability'] + ')');
            }
        });
    });
});

var totalWine = require('./services/totalwine');
totalWine.getSession(function(res) {
    var headers = res.headers['set-cookie'];
    totalWine.totalStock(terms, headers, function(results) {
        _.each(results, function(whiskey) {

            totalWine.storeCheck(whiskey, headers, function(whiskey, inventory) {
                console.log(lib.pascal(whiskey['title']) + '(' + whiskey['price'] + ')');
                console.log("\t" + inventory.stockLocation);
            });
        });
    });
});