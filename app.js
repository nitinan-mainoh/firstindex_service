const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDB } = require("./config/connectdb");
const router = require("./routes/route_api");
const app = express();
const PORT = 3000;

// test access server
// app.get('/', (request, response)=>{
//       response.json({'message': 'Server is running...'})
// })
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({ methods: ["GET", "POST", "PUT", "DELETE"] })); // HTTP Methods ที่อนุญาต
connectDB();

app.use(bodyParser.json());
// เรียกใช้ API ต่างๆจาก routes
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
