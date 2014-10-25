Array.prototype.contains = function(element) {
    return this.indexOf(element) != -1;
};

Object.prototype.toString = function() {
    try {
        return JSON.stringify(this);
    } catch(circular_structure) {
        return '[object Object]';
    }
};
