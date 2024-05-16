const DiceModel = require("../models/diceModel");
exports.getTest = async (req, res) => {
	console.log("in test");
	res.status(201).json({ message: "test" });
};

exports.getThrows = async (req, res) => {
	try {
		const diceThrows = await DiceModel.find();
		return res.status(200).json(diceThrows);
	} catch (error) {
		return res.status(500).json({
			error: error.message
		});
	}
};
