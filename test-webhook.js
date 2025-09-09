import express from "express";
const app = express();

app.use(express.json());

// path ที่ต้องตรงกับที่คุณไปตั้งใน LINE
app.post("/bot-sugar-webhook", (req, res) => {
  console.log("VERIFY PAYLOAD:", req.body);
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test webhook running on ${PORT}`));
