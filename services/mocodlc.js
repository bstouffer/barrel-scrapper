var _ = require('underscore');
var lib = require('./lib');

exports.mocoStock = function(searchTerm, callback) {
    var postFilter = {'displaycnt':200,'keyword':'','pricemin':'40','pricemax':'1000','category':'null','categorymain':'','size':'null','isSale':'0','sortid':'longdescription'};
    postFilter.categorymain = 'SPIRIT:BOURBON/RYE';
    if (searchTerm != null && typeof searchTerm == 'string') {
        postFilter.keyword = searchTerm;
    } else if (searchTerm != null && typeof searchTerm == 'function') {
        callback = searchTerm;
    }

    var postData = "{'displaycnt':9999999,'keyword':'','pricemin':'0','pricemax':'3000','category':'null','categorymain':'','size':'null','isSale':'0','sortid':'longdescription'}";

    lib.post('www2.montgomerycountymd.gov/dlcsearch/SearchSupportService.asmx/GetSearchData', postData, function(response) {
        var searchResults = JSON.parse(response).d;

        if (typeof searchTerm == 'string' || Array.isArray(searchTerm)) {
            searchResults = _.filter(searchResults, function (whiskey) {
                return lib.contains(whiskey['description'], searchTerm) && whiskey['qtyStatus'] === "IN STOCK"
                    && (lib.contains(whiskey['categoryname'], "whiskey") || lib.contains(whiskey['categoryname'], "scotch"));
            });
        }

        callback(searchResults);
    });
};

exports.storeCheck = function (whiskey, callback) {
    lib.post('www2.montgomerycountymd.gov/dlcsearch/SearchSupportService.asmx/GetAllStoreAvailability',
        "{itemId:" + whiskey['itemcode'] +"}", function(response) {
            var results = JSON.parse(response).d;
            callback(whiskey, results);
        });
};
