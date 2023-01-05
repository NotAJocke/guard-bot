import express from "express";
import { config as envConfig } from "dotenv";
import { sign, verify } from "jsonwebtoken";

envConfig();

const app = express();

app.use(express.json()).use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.post("/login", (req, res) => {
	const { username, password } = req.body;

	let token = sign({ user: username }, process.env.JWT_SECRET ?? "wtf");

	res.json({ token });
});

app.post("/auth", (req, res) => {
	const { token } = req.body;

	try {
		let decoded = verify(token, process.env.JWT_SECRET ?? "wtf");

		res.json({ decoded });
	} catch (error) {
		res.status(401).send("Unauthorized");
	}
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
