const mongoose = require("mongoose");

const DiceSchema = new mongoose.Schema({
	user: {
		type: String,
		require: true
	},
	diceThrowNr: {
		type: Number,
		require: true
	},
	diceValue: {
		type: Number,
		require: true
	},
	total: {
		type: Number,
		require: true
	}
});

module.exports = mongoose.model("dice", DiceSchema);
