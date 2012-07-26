/**
 * localStorage object for Hurra 
 * @author op1ekun (Lukasz Piatkowski)
 */

(function($){
    var TYPE            = "localStorage";
    var STORAGE_LIMIT   = 5 * 1024 * 1024; // bytes;
    
    // initialize available space, reserves 7 (8 for ie) bytes of storage space
    if (!window[TYPE].getItem("availableSpace")) {
        reset();        
        // window[TYPE].setItem(
            // "availableSpace",
            // // substract availableSpace from available space ;)
            // STORAGE_LIMIT - JSON.stringify(STORAGE_LIMIT).length
        // );
    }

    /**
     * Treats all incoming data as JSON to simplify work with storage
     * @param {String} key      the item will be stored under this key
     * @param {Mixed} item      JSON, String, Number or null
     * @param {Boolean} doNotOverwrite      
     * 
     * @throws {TypeError}      if no item or key was passed into the method
     * @throws {RangeError}     if item is to big to fit into storage
     * 
     * @returns {String}        the key of stored item
     */    
    function add(key, item, doNotOverwrite) {
        if (typeof(key) !== "string") {
            throw new TypeError("key is not a STRING");
        }
        
        if (item === undefined) {
            throw new TypeError("item is undefined - expected STRING, JSON, NUMBER or null");
        }
        
        if (arguments.length === 3 && doNotOverwrite) {
            if (has(key)) {
                throw new Error("cannot overwrite an existing item");
            }
        }
        
        var stringified = JSON.stringify(item);
        var availableSpace  = getAvailableSpace();
        
        if (stringified.length > availableSpace) {
            if (stringified.length > STORAGE_LIMIT) {
                throw new RangeError("item size exceeds capacity of storage");                
            }

            // TODO throw a custom Error in here :)
            throw new RangeError("clear");
        }
        else {
            window[TYPE].setItem(
                key,
                stringified
            );
            
            updateAvailableSpace(stringified.length * (-1));
        }
        
    }
    
    /**
     * Get an item by it's key
     * @param {String} key      the key of an item that will be retrieved
     * 
     * @throws {TypeError}      if no key was passed into the method
     * @returns {Mixed}         stored data (JSON, String, Number, null)
     */
    function get(key) {
        if (typeof(key) !== "string") {
            throw new TypeError("key is not a STRING");
        }
        
        // parse stringified, stored data
        return JSON.parse(window[TYPE].getItem(key));
    }

    /**
     * Removes item from the storage
     * @param {String} key      the key of an item that will be deleted
     * @throws {TypeError}      if no key was passed into the method
     * @returns {Boolean}       true if item was removed, false if item wasn't found
     */   
    function remove(key) {
        if (typeof(key) !== "string") {
            throw new TypeError("key is not a STRING");
        }
        
        if (!has(key)) {
            return false;
        }
        
        var item        = get(key);
        var stringified = JSON.stringify(item);
        window[TYPE].removeItem(key);
        updateAvailableSpace(stringified.length);
        return true;
    }
    
    /**
     * Clears all items
     * Updates available space
     */
    function reset() {
        window[TYPE].clear();
        
        // cannot use get because it will try to write to availableSpace
        // it would cause an infinite loop
        window[TYPE].setItem(
            "availableSpace",
            STORAGE_LIMIT - JSON.stringify(STORAGE_LIMIT).length
        );
    }
    
    function updateAvailableSpace(value) {
        var availableSpace  = getAvailableSpace();
        availableSpace      += value;
        
        // cannot use get because it will try to write to availableSpace
        // it would cause an infinite loop
        window[TYPE].setItem(
            "availableSpace",
            JSON.stringify(availableSpace)
        );
    }

    /**
     * @returns     amount of available space in the storage in bytes
     */
    function getAvailableSpace() {
        return get("availableSpace");
    }
    
    /**
     * Checks if key is present in the storage
     * @param   {key}
     * @returns {Boolean}   true if key is present, 
     *                      false if key is not a string or not present
     */
    function has(key) {
        if (typeof(key) !== "string") {
            throw new TypeError("key is not a STRING");    
        }
        
        for (var i in window[TYPE]) {
            if (i === key) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * DEFINES the PUBLIC interface for Storage object
     */
    $.extend(true, window, {
        Storage : {
            add                 : add,
            get                 : get,
            remove              : remove,
            getAvailableSpace   : getAvailableSpace,
            reset               : reset
        }
    });
}(jQuery));