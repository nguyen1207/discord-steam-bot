module.exports = function (milliseconds) {
    const time = new Date(milliseconds);

    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const date = time.getDate();
    const month = MONTHS[time.getMonth()];

    return `${date} ${month}`;
};
