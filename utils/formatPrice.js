module.exports = function (price, currency) {
    if (currency == "VND") {
        return `${price / 100}₫`;
    }

    return `${price / 100} ${currency}`;
}