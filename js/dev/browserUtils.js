
goog.provide('BrowserUtils');

/**
*@constructor
*/
BrowserUtils = function(){
};

/**
*@private
*/
BrowserUtils.instance = null;

/**
*@ return {BrowserUtils}
*/
BrowserUtils.getInstance = function() {
    if(BrowserUtils.instance == null)
        BrowserUtils.instance = new BrowserUtils();

    return BrowserUtils.instance;
};

/**
*@public
*@ return {Boolean}
*/
BrowserUtils.prototype.isIOS = function(){
    return (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i))
};

/**
*@public
*@ return {Boolean}
*/
BrowserUtils.prototype.isMobile = function(){
    return (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/android/i) || navigator.userAgent.match(/blackberry.*/i))
};

/**
*@public
*@ return {Boolean}
*/
BrowserUtils.prototype.isIE = function(){
    if ($.browser.msie)
        return true;

    return false;
};

/**
*@public
*@ return {Boolean}
*/
BrowserUtils.prototype.isMozilla = function(){
    if ($.browser.mozilla)
        return true;

    return false;
};

/**
*@public
*@ return {Boolean}
*/
BrowserUtils.prototype.isIE8orLess = function(){
    if ($.browser.msie && parseInt($.browser.version, 10) < 9)
        return true;

    return false;
};

goog.exportSymbol('BrowserUtils', BrowserUtils);