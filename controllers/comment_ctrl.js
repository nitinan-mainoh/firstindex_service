const { pool } = require("../config/connectdb");

const addReview = async (req, res) => {
  const { novel_id, user_id, rating, review_text } = req.body;
  try {
    const [result] = await pool.query(
      `
            INSERT INTO 
                reviews (novel_id, user_id, rating, review_text) 
            VALUES 
                (?, ?, ?, ?)
            `,
      [novel_id, user_id, rating, review_text]
    );
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding review" });
  }
};

const getComment = async (req, res) => {
  const { novel_id } = req.query; // ใช้ req.query เพื่อดึง novel_id จาก URL query
  try {
    const [result] = await pool.query(
      `
        SELECT 
            users.username AS user_name,
            reviews.review_text,
            reviews.rating 
        FROM 
            reviews
        JOIN
            users ON reviews.user_id = users.user_id
        WHERE 
            reviews.novel_id = ?
        ORDER BY 
            reviews.created_at DESC
      `,
      [novel_id]
    );
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database query error" });
  }
};

module.exports = { addReview, getComment };
