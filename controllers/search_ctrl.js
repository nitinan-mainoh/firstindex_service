const { pool } = require("../config/connectdb");

const getNovelsByTag = async (req, res) => {
  const { getTitle, tags } = req.query;
  const tagsArray = tags ? tags.split(",") : []; // แปลง tags string เป็น array

  let query = `
    SELECT
        novels.novel_id,
        novels.title,
        novels.description,
        novels.cover_image,
        users.username,
        novels.views,
        novels.created_at,
        COUNT(DISTINCT episodes.episode_id) AS episode_count,   -- จำนวนตอนที่ไม่ซ้ำ
        COUNT(DISTINCT reviews.review_id) AS review_count,      -- จำนวนความคิดเห็นที่ไม่ซ้ำ
        IFNULL(AVG(reviews.rating), 0) AS average_rating,       -- ค่าเฉลี่ยเรตติ้ง
        GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags -- ป้องกันการซ้ำของแท็ก
    FROM
        novels
    JOIN
        users
    ON
        novels.author_id = users.user_id
    LEFT JOIN
        episodes
    ON
        novels.novel_id = episodes.novel_id
    LEFT JOIN
        novel_tags
    ON
        novels.novel_id = novel_tags.novel_id
    LEFT JOIN
        tags
    ON
        novel_tags.tag_id = tags.tag_id
    LEFT JOIN
        reviews -- เข้าร่วมกับตาราง reviews เพื่อดึงข้อมูลความคิดเห็นและคะแนนรีวิว
    ON
        novels.novel_id = reviews.novel_id
    WHERE
        novels.title LIKE CONCAT('%', ?, '%')`;

  // กรองด้วยแท็กถ้ามี
  if (tagsArray.length > 0 && tagsArray[0] !== "") {
    query += ` AND tags.name IN (${tagsArray.map(() => "?").join(", ")})`;
  }

  query += `
    GROUP BY
        novels.novel_id;
  `;

  try {
    const [results] = await pool.query(query, [getTitle, ...tagsArray]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching novels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
    getNovelsByTag,
};
