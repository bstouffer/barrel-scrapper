var lib = require('./lib');
var cheerio = require('cheerio');
var _ = require('underscore');

exports.getSession = function(callback) {
    var postData = 'shoppingMethod=PICKUP&stateID=MD&method=getStoreLocations';
    lib.post('www.totalwine.com/sharedPages/com/b2c/genericproxy.cfc?returnformat=json', postData, function(response) {
        callback(response);
    });
};

exports.totalStock = function(terms, headers, callback) {
    lib.get('http://www.totalwine.com/eng/categories/spirits/united-states%7Cunited-states!viewPerPage/99999', headers, function(response) {
        var $ = cheerio.load(response);
        var products = $('.product');
        var results = [];

        for (var i = 0; i < products.length; i++) {
            var elProduct = products[i];
            var product = $(elProduct);
            var title = product.find('h2 a').first().text();
            var category = $(product.find('p.character-list')[1]).text();
            var productUrl = product.find('h2 a').first().attr('href');
            var description = product.find('p.detailed-description').first().text();
            var price = product.find('span.productPrice').first().text();
            var hasButtons = product.find('div.price-info div.buttons').length > 0;
            var nextInStock = product.find('div.price-info div.next-available').first().text();
            results.push({
                title: title,
                category: category,
                url: productUrl,
                description: description,
                price: price,
                inStock: hasButtons,
                nextInStock: nextInStock
            });
        }

        if (typeof terms == 'string' || Array.isArray(terms)) {
            results = _.filter(results, function (whiskey) {
                return lib.contains(whiskey['title'], terms) && whiskey['inStock'] === true
                    && (lib.contains(whiskey['category'], "whiskey") || lib.contains(whiskey['category'], "scotch"));
            });
        }

        callback(results);
    });
};

exports.storeCheck = function (whiskey, headers, callback) {
    lib.get(whiskey.url, {}, headers, function(response) {
        var $ = cheerio.load(response);
        var details = {};
        details.itemCode = $("#idAndAvailable").text().trim();
        details.stockLocation = $("#store_location-main-box p").first().text().trim();

        callback(whiskey, details);
    });
};
