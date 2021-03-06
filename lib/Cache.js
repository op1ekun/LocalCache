/**
 * Frontend cache object
 * @author op1ekun (Lukasz Piatkowski)
 */

(function($){
    // default expire time for cached item
    // 24hours
    var TTL_DEFAULT  = 86400000; // ms 
    var ttl         = TTL_DEFAULT;
    var ttlListName = "ttlList"; 
    
    // use storage object
    var storage = window.Storage;
    
    // create ttl list in localStorage if it doesn't exist
    if (!storage.get(ttlListName)) {
        storage.add(ttlListName, {});
    }
    
    /**
     * Reset TTL to the default value
     */
    function resetTTL() {
        ttl = TTL_DEFAULT;
    }

    /**
     * Set new TTL for Cache
     * @param {Number} newTTL   a value in milliseconds
     */    
    function setTTL(newTTL) {
        // TODO validation
        ttl = newTTL;
    }
    
    function getTTL() {
        return ttl;
    }

    /**
     * Removes expired items from the storage
     * depending on item's timestamp
     */
    function invalidateOld() {
        var ttlList     = storage.get(ttlListName);
        var date        = new Date();
        
        for (var key in ttlList) {
            // first calculate how old is the item
            // then if it's older than TTL time invalidateOld it
            if ((date.getTime() - ttlList[key]) > ttl) {
                invalidateItem(key, ttlList);
            }
        }        
        
        try {
            storage.add(ttlListName, ttlList);        
        }
        catch(e) {
            console.error(e.message);
            console.error(e.stack);    
        }
    }
    
    /**
     * @param {String} key
     * @param {JSON} ttlList
     * 
     * TODO decide wheter it should be available as public method
     */
    function invalidateItem(key, ttlList) {
        if (storage.remove(key)) {
            if (!ttlList) {
                ttlList = storage.get(ttlListName);
            }
    
            delete ttlList[key];
        }    
    }
    
    /**
     * Will free storage space to make place for a new item
     * @param {Mixed} item      JSON, String, Number or null      
     */
    function clearSpace(item) {
        var itemSize    = JSON.stringify(item).length;
        var ttlList     = storage.get("ttlList");
        var fromNewest  = [];
        
        // ie8 lacks support for Object.keys()
        // lets use jQuery method instead to get the keys
        $.each(ttlList, function(key){
            fromNewest.push(key);
        });
        
        fromNewest.sort(function(a, b){
            return (ttlList[a] > ttlList[b] ? 0 : 1);
        });
        
        // remove oldest items until there is a space in storage
        while(itemSize > storage.getAvailableSpace()) {
            storage.remove(fromNewest.pop());
        }
    }
    
    /**
     * Add to item to storage and timestamp it 
     * @param {String} key      the item will be cached under this key
     * @param {Mixed} item      JSON, String, Number or null
     */
    function cache(key, item) {
        try {
            storage.add(key, item);
            setTimestamp(key);
            return true;
        }
        catch(e) {
            if (e instanceof storage.NotEnoughSpaceError) {
                clearSpace(item);
                return cache(key, item);
            }
            else if(e instanceof RangeError) {
                console.error(e.message);
                console.error(e.stack);
            }
        }
    }
    
    /**
     * 
     * @param {String} key
     */
    function setTimestamp(key) {
        var ttlList     = storage.get(ttlListName);
        var date        = new Date();
        var timestamp   = date.getTime();

        ttlList[key]    = timestamp;

        storage.add(ttlListName, ttlList);
    }
    
    $.extend(true, window, {
        Cache : {
            resetTTL        : resetTTL,
            setTTL          : setTTL,
            getTTL          : getTTL,
            cache           : cache,
            invalidateOld   : invalidateOld
        }
    });
}(jQuery));
