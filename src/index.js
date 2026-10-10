import express from "express";
import dotenv from "dotenv";
import loanRoutes from "./routes/loanRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Library Loan API is running",
    endpoints: {
      list: "GET /loans",
      filter: "GET /loans?status=Terlambat",
      detail: "GET /loans/:id",
      create: "POST /loans",
      update: "PUT /loans/:id",
      delete: "DELETE /loans/:id",
    },
  });
});

app.use("/loans", loanRoutes);
app.use("/api/loans", loanRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Body JSON tidak valid" });
  }
  res.status(500).json({ error: err.message });
});

// Di Vercel server dijalankan otomatis, jadi listen hanya untuk lokal
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;