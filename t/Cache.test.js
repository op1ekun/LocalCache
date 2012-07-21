(function($){
    module = QUnit.module;
    
    module("Cache", {
        setup : function() {
            this.storage    = window.Storage;
            this.cache      = window.Cache;
            
            this.makeData   = function(end) {
                var data = "some";
                
                for (var i = 0; i < end; i++) {
                    var temp = data + data + "somethingElse";
                    data = temp;
                }
                
                return data;                
            };
            
            // fake Date
            this.origDate   = Date;
            Date = function() {
                this.getTime    = function() { return 100; }
            }

            this.storage.reset();            
        },
        
        teardown : function() {
            this.cache.setTTL(86400000);
            this.storage.reset();
            
            // reset to original Date
            Date = this.origDate;
        }
    });
    
    test("getTTL method", function(){
        expect(1);
        
        equal(this.cache.getTTL(), 86400000, "get TTL value");
    });
    
    test("setTTL method", function() {
        expect(1);
        
        this.cache.setTTL(12345);
        
        equal(this.cache.getTTL(), 12345, "set TTL value");         
    });
    
    test("resetTTL method", function() {
        expect(1);
        
        this.cache.resetTTL();
        
        equal(this.cache.getTTL(), 86400000, "reset TTL value");
    });
    
    test("cache method", function(){
        expect(2);
        
        var testJSON = {
            "outer" : {
                "inner" : "someValue"
            }            
        };

        // "initialize" ttlList in storage        
        this.storage.add("ttlList", {});
        ok(this.cache.cache("jsonKey", testJSON), "JSON succesfully cached");
        
        // about 280KB of data
        var data = this.makeData(14);
        
        var that = this;
        function fillCache() {
            for (var i = 0, l = 17; i < l; i++) {
                Date = function() {
                    this.getTime    = function() { return 100 + i; }
                    
                    if (i == 7) {
                        this.getTime    = function() { return 120; }                        
                    }
                }
                
                that.cache.cache("data" + i, data);
            }
        }
        
        fillCache();
        
        // by this moment the Storage is almost full
        // adding another item will raise an exception in Storage.add()
        // Cache should gracefully remove the oldest items 
        // to free storage space for the new item
        ok(this.cache.cache("data", data+data), "cache was gracefully cleared - new item cached");
    });

    test("invalidate method", function(){
        expect(2);
        
        // stuff older than 300ms should be removed from the cache
        this.cache.setTTL(300);
        
        // "initialize" ttlList in storage        
        this.storage.add("ttlList", {});
        
        // first cache        
        this.cache.cache("stringKey", "someString");
        
        // to make item older than it appears ;)
        Date = function() {
            this.getTime    = function() { return 500; }
        }
        
        this.cache.invalidateOld();
        
        var stringItem  = this.storage.get("stringKey");
        equal(stringItem, undefined, "remove item");
                
        var ttlList     = this.storage.get("ttlList");
        equal(ttlList["stringKey"], undefined, "remove timestamp for item");
    });
    
}(jQuery));
