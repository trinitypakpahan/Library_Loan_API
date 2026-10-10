import { LoanModel } from "../models/loanModel.js";

const STATUSES = ["Dipinjam", "Dikembalikan", "Terlambat"];
const FIELDS = [
  "member_name",
  "member_id",
  "book_title",
  "loan_date",
  "due_date",
  "return_date",
  "status",
];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const normalizeStatus = (value) =>
  STATUSES.find((s) => s.toLowerCase() === String(value).trim().toLowerCase());

const pickFields = (body = {}) => {
  const data = {};
  for (const key of FIELDS) {
    if (body[key] !== undefined) {
      data[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
    }
  }
  return data;
};

// Mengembalikan pesan error (string) jika tidak valid, atau null jika valid
const validate = (data, { requireAll }) => {
  if (requireAll) {
    for (const f of ["member_name", "member_id", "book_title", "due_date"]) {
      if (!data[f]) return `Field '${f}' wajib diisi`;
    }
  }
  for (const f of ["member_name", "member_id", "book_title"]) {
    if (data[f] !== undefined && !data[f]) return `Field '${f}' tidak boleh kosong`;
  }
  for (const f of ["loan_date", "due_date"]) {
    if (data[f] !== undefined && !DATE_RE.test(data[f]))
      return `Field '${f}' harus berformat YYYY-MM-DD`;
  }
  if (
    data.return_date !== undefined &&
    data.return_date !== null &&
    !DATE_RE.test(data.return_date)
  ) {
    return "Field 'return_date' harus berformat YYYY-MM-DD atau null";
  }
  if (data.status !== undefined) {
    const status = normalizeStatus(data.status);
    if (!status) return `Status harus salah satu dari: ${STATUSES.join(", ")}`;
    data.status = status;
  }
  return null;
};

const handleError = (res, err) => {
  if (err.code === "PGRST116")
    return res.status(404).json({ error: "Data peminjaman tidak ditemukan" });
  if (err.code === "22P02")
    return res.status(400).json({ error: "Format ID atau data tidak valid" });
  return res.status(500).json({ error: err.message });
};

export const LoanController = {
  async getAll(req, res) {
    try {
      const { status, member_id, member_name, book_title } = req.query;
      const filters = {};

      if (status) {
        const normalized = normalizeStatus(status);
        if (!normalized) {
          return res.status(400).json({
            error: `Status harus salah satu dari: ${STATUSES.join(", ")}`,
          });
        }
        filters.status = normalized;
      }
      if (member_id) filters.member_id = String(member_id);
      if (member_name) filters.member_name = String(member_name);
      if (book_title) filters.book_title = String(book_title);

      const loans = await LoanModel.getAll(filters);
      res.json({ count: loans.length, data: loans });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getById(req, res) {
    try {
      const loan = await LoanModel.getById(req.params.id);
      res.json(loan);
    } catch (err) {
      handleError(res, err);
    }
  },

  async create(req, res) {
    try {
      const data = pickFields(req.body);
      const message = validate(data, { requireAll: true });
      if (message) return res.status(400).json({ error: message });

      const loan = await LoanModel.create(data);
      res.status(201).json(loan);
    } catch (err) {
      handleError(res, err);
    }
  },

  async update(req, res) {
    try {
      const data = pickFields(req.body);
      if (Object.keys(data).length === 0) {
        return res
          .status(400)
          .json({ error: "Tidak ada field yang valid untuk diubah" });
      }
      const message = validate(data, { requireAll: false });
      if (message) return res.status(400).json({ error: message });

      // Jika dikembalikan dan tanggal kembali belum diisi, isi otomatis hari ini
      if (data.status === "Dikembalikan" && data.return_date === undefined) {
        data.return_date = new Date().toISOString().slice(0, 10);
      }

      const loan = await LoanModel.update(req.params.id, data);
      res.json(loan);
    } catch (err) {
      handleError(res, err);
    }
  },

  async remove(req, res) {
    try {
      const deleted = await LoanModel.remove(req.params.id);
      res.json({ message: "Data peminjaman berhasil dihapus", data: deleted });
    } catch (err) {
      handleError(res, err);
    }
  },
};