Array.prototype.contains = function(element) {
    return this.indexOf(element) != -1;
};

Array.prototype.choose = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function random_int(min, max, exclude) {
    exclude = exclude || [];
    while(exclude.contains(number = Math.round(Math.random() * (max - min)) + min));
    return number;
}
