const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000", // ÄR detta nog för säkerhet? knappast...
		methods: ["GET", "POST"]
	}
});
app.use(express.json());
app.use(cors());
const port = 3001;
const diceRoutes = require("./routes/diceRoutes");
const authRoutes = require("./routes/authRoutes");
const connectionMongoDB = require("./connectionMongoDB");
connectionMongoDB();
const DiceModel = require("./models/diceModel");
app.use("/", diceRoutes);
app.use("/auth", authRoutes);
// app.get("/test", async (req, res) => {
// 	res.send("hej");
// });
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";

const authenticateSocket = (socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token) {
		return next(new Error("Authentication error"));
	}
	try {
		const decoded = jwt.verify(token, secretKey);
		socket.user = decoded;
		next();
	} catch (error) {
		return next(new Error("Authentication error"));
	}
};

io.use((socket, next) => {
	authenticateSocket(socket, next);
});

io.on("connection", (socket) => {
	console.log(`id: ${socket.id} har loggat in`);
	socket.on("test", (test) => {
		console.log("message", test, socket.id);
	});
	socket.on("chatMessage", (message) => {
		console.log("meddelande", message);
		io.emit("newMessage", { user: message.user, message: message.message });
	});
	socket.on("dice", (newThrow) => {
		console.log("newThrow", newThrow);
		io.emit("newThrow", {
			diceValue: newThrow.diceValue,
			diceThrows: newThrow.diceThrows,
			total: newThrow.total,
			user: newThrow.user
		});
		const throwToMongo = new DiceModel({
			user: newThrow.user,
			diceThrowNr: newThrow.diceThrows,
			diceValue: newThrow.diceValue,
			total: newThrow.total
		});
		throwToMongo.save();
	});
	socket.on("disconnect", () => {
		console.log(`id: ${socket.id} har loggat ut`);
	});
});

server.listen(port, () => {
	console.log(`finnes på  http://localhost:${port}/`);
});
