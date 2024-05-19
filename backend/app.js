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
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";
// variabler för att hålla koll på spel
let users = [];
// senaste kastaren.
let latestPlayer;

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

	// när spelare har loggat in se om det redan är fullt om inte ge initialavärden till spelaren:
	socket.on("game", (varde) => {
		let checkUser = users.filter((us) => us == varde.user);
		if (checkUser.length <= 0 && users.length < 2) {
			users.push(varde.user);
		} else {
			console.log("else", users);
			//kolla om det är akit en spelare
			let player = users.filter((pl) => pl == varde.user);
			if (player.length < 1) {
				io.emit("notaplayer", {
					not: "not",
					users: users
				});
				return;
			}
		}
		io.emit("players", {
			user: varde.user,
			users: users
		});
		checkUser = [];
	});

	// TODO gör om själva spelet till backend efter inlämning
	socket.on("thrower", (kast) => {
		//kolla om det är akit en spelare
		let player = users.filter((pl) => pl == kast.user);
		// gör det omöjligt för ejaktiv spelare att registrera kast
		if (player.length < 1) {
			io.emit("notaplayer", {
				not: "not"
			});
			return;
		}
		latestPlayer = kast.user;
		// let diceValue = Math.floor(Math.random() * 6 + 1);
		let diceValue = kast.value;
		let diceThrow = 0;
		diceThrow = kast.diceThrows + 1;
		let total = kast.total + diceValue;
		if (total > 10) {
			users = [];
			io.emit("winner", {
				winner: kast.user,
				total: total
			});
		}
		io.emit("newThrow", {
			latestPlayer: latestPlayer,
			diceValue: diceValue,
			diceThrows: diceThrow,
			total: total,
			user: kast.user
		});
		const throwToMongo = new DiceModel({
			diceValue: diceValue,
			diceThrows: diceThrow,
			total: total,
			user: kast.user
		});
		throwToMongo.save();
	});

	socket.on("chatMessage", (message) => {
		console.log("meddelande", message);
		io.emit("newMessage", { user: message.user, message: message.message });
	});

	socket.on("disconnect", () => {
		console.log(`id: ${socket.id} har loggat ut`);
	});
});

server.listen(port, () => {
	console.log(`finnes på  http://localhost:${port}/`);
});
