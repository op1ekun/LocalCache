(function($){
    module = QUnit.module;
    
    module("Storage", {
        setup : function() {
            this.storage    = window.Storage;

            this.makeData   = function(end) {
                var data = "some";
                
                for (var i = 0; i < end; i++) {
                    var temp = data + data + "somethingElse";
                    data = temp;
                }
                
                return data;                
            };
            
            this.storage.reset();
        },
        
        teardown : function() {
            this.storage.reset();
        }
    });
    
    test("add method", function() {
        expect(5);
        
        this.storage.add("jsonKey", {
            "testStorage" : {
                "test" : 1
            }
        });
        // test if method DID NOT raise an exception
        ok(true, "store JSON");
        
        this.storage.add("stringKey", "someString");
        ok(true, "store String");
        
        this.storage.add("numberKey", 3);
        ok(true, "store Number");
        
        this.storage.add("nullKey", null);
        ok(true, "store null");
        
        // try to overwrite existing item
        raises(function() { this.storage.add("stringKey", "anotherString", true); }, function (e) { return e.name === "Error"; }, "doNotOverwrite flag is on - cannot overwrite existing item"); 
    });
    
    test("get method", function() {
        expect(4);
        
        this.storage.add("jsonKey", {
            "testStorage" : {
                "test" : 1
            }
        });
        
        var jsonItem    = this.storage.get("jsonKey");
        deepEqual(jsonItem, {
            "testStorage" : {
                "test" : 1
            }
        }, "retrieve JSON");
        
                            this.storage.add("stringKey", "someString");
        var stringItem  =   this.storage.get("stringKey");
        equal(stringItem, "someString", "retrieve String");
        
                            this.storage.add("numberKey", 3);
        var numberItem  =   this.storage.get("numberKey");
        equal(numberItem, 3, "retrieve Number");
        
                            this.storage.add("nullKey", null);
        var nullItem    =   this.storage.get("nullKey");
        equal(nullItem, null, "retrieve null");         
    });
    
    test("remove method", function() {
        expect(2);
        
        this.storage.add("jsonKey", {
            "testStorage" : {
                "test" : 1
            }
        });
        equal(this.storage.remove("jsonKey"), true, "remove item");
        
        equal(this.storage.remove("fakeKey"), false, "remove non existing item");
    });
    
    test("reset method", function() {
        expect(1);
        
        this.storage.add("stringKey", "someString");
        
        this.storage.reset();
        
        equal(this.storage.get("stringKey"), undefined, "reset storage");         
    });
    
    test("getAvailableSpace method", function() {
        expect(4);
        
        var expectedSize    = 5 * 1024 * 1024; // bytes
        
        expectedSize        = expectedSize - JSON.stringify(expectedSize).length;
        
        equal(this.storage.getAvailableSpace(), expectedSize, "storage is empty");
        
        var jsonItem = {
            "some"  : "json",
            "with"  : "random data 123"            
        };
        var expectedUse     = JSON.stringify(jsonItem).length;
        // storage will have one item stored
        expectedSize        = expectedSize - expectedUse;
        
        this.storage.add("jsonKey", jsonItem);
        equal(this.storage.getAvailableSpace(), expectedSize, "storage has one item");


        var stringItem      = "someString";
        
        expectedUse         = JSON.stringify(stringItem).length;
        // storage will have two items stored
        expectedSize        = expectedSize - expectedUse;
        
        this.storage.add("stringKey", stringItem);
        equal(this.storage.getAvailableSpace(), expectedSize, "storage has two items");

        
        expectedUse         = JSON.stringify(jsonItem).length;
        // storage will have one item stored
        expectedSize        = expectedSize + expectedUse;
        
        this.storage.remove("jsonKey");
        equal(this.storage.getAvailableSpace(), expectedSize, "item removed, storage has one item");
    });

    test("not enough space left in the Storage", function() {
        expect(1);
        
        var data1 = this.makeData(18); // 4 456 435 bytes
        this.storage.add("dataKey", data1);
        
        var data2 = this.makeData(16); // 1 114 099 bytes
        
        raises(function() { this.storage.add("newItem", data2)}, function(e) { return e.name === "NotEnoughSpaceError"; }, "not enough space left in the Storage, NotEnoughSpaceError thrown");
    });
    
    test("exceed Storage space limit", function() {
        expect(1);
        
        var data = this.makeData(20);
        
        raises(function() { this.storage.add("dataKey", data)}, function(e) { return e.name === "RangeError"; }, "size of item exceeds capacity of storage, RangeError thrown");
    });
    
}(jQuery));
