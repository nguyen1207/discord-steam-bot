const mongoose = require("mongoose");

const connect = () => {
	mongoose.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
};

mongoose.connection.on("error", (err) => {
    console.error("Connection error: " + err);
});

mongoose.connection.once("open", () => {
    console.log("Connected to mongodb");
});

module.exports = { connect };