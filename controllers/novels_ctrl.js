const { get } = require("http");
const { pool } = require("../config/connectdb"); // นำเข้า pool ที่เป็นการเชื่อมต่อกับฐานข้อมูล

// ฟังก์ชันสำหรับการดึงข้อมูลของนิยายใหม่
const getNewNovels = async (req, res) => {
  try {
    const [results] = await pool.query(
      `
      SELECT 
          novels.novel_id,
          novels.title,
          novels.description,
          novels.cover_image,
          novels.author_id,
          users.username,
          novels.views,
          novels.created_at,
          COUNT(DISTINCT episodes.episode_id) AS episode_count, -- จำนวนตอนไม่ซ้ำกัน
          GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags, -- ป้องกันการซ้ำของแท็ก
          COUNT(DISTINCT reviews.review_id) AS review_count, -- จำนวนรีวิวไม่ซ้ำกัน
          IFNULL(AVG(reviews.rating), 0) AS average_rating -- ค่าเฉลี่ยเรตติ้ง
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
          reviews -- รวมตาราง reviews เพื่อดึงข้อมูลจำนวนรีวิวและเรตติ้ง
      ON 
          novels.novel_id = reviews.novel_id
      GROUP BY 
          novels.novel_id
      ORDER BY 
          novels.created_at DESC
      LIMIT 6;
      `
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching new novels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชันสำหรับการดึงข้อมูลของนิยายที่มีการ update
const getUpdatedNovels = async (req, res) => {
  try {
    const [results] = await pool.query(
      `
      SELECT 
          novels.novel_id,
          novels.title,
          novels.description,
          novels.cover_image,
          users.username AS author_username,
          novels.views,
          novels.created_at AS novel_created_at,
          COUNT(DISTINCT episodes.episode_id) AS episode_count, -- จำนวนตอนไม่ซ้ำกัน 
          GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags, -- ป้องกันการซ้ำของแท็ก
          COUNT(DISTINCT reviews.review_id) AS review_count, -- จำนวนรีวิว
          IFNULL(AVG(reviews.rating), 0) AS average_rating, -- คะแนนเฉลี่ย
          MAX(episodes.updated_at) AS last_episode_updated -- วันที่ตอนล่าสุดถูกอัปเดต
      FROM 
          novels
      JOIN 
          users ON novels.author_id = users.user_id
      LEFT JOIN 
          episodes ON novels.novel_id = episodes.novel_id
      LEFT JOIN 
          novel_tags ON novels.novel_id = novel_tags.novel_id
      LEFT JOIN 
          tags ON novel_tags.tag_id = tags.tag_id
      LEFT JOIN 
          reviews ON novels.novel_id = reviews.novel_id
      GROUP BY 
          novels.novel_id
      ORDER BY 
          last_episode_updated DESC
      LIMIT 6;

      `
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching updated novels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชันสำหรับการดึงข้อมูลของนิยายที่มีการดูมากที่สุด
const getTrendingNovels = async (req, res) => {
  try {
    const [results] = await pool.query(
      `
      SELECT 
          novels.novel_id,
          novels.title,
          novels.description,
          novels.cover_image,
          users.username,
          novels.views,
          novels.created_at,
          COUNT(DISTINCT episodes.episode_id) AS episode_count, -- นับจำนวนตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT episodes.title SEPARATOR ', ') AS episode_titles, -- ชื่อตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT episodes.content SEPARATOR ', ') AS episode_contents, -- เนื้อหาตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT episodes.episode_number SEPARATOR ', ') AS episode_numbers, -- หมายเลขตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags,
          COUNT(DISTINCT reviews.review_id) AS review_count,
          IFNULL(AVG(reviews.rating), 0) AS average_rating
      FROM 
          novels
      JOIN 
          users ON novels.author_id = users.user_id
      LEFT JOIN
          episodes ON novels.novel_id = episodes.novel_id
      LEFT JOIN 
          novel_tags ON novels.novel_id = novel_tags.novel_id
      LEFT JOIN 
          tags ON novel_tags.tag_id = tags.tag_id
      LEFT JOIN 
          reviews ON novels.novel_id = reviews.novel_id
      GROUP BY 
          novels.novel_id
      ORDER BY 
          novels.views DESC
      LIMIT 6;
      `
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching trending novels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNovelbyNovelId = async (req, res) => {
  const { novel_id } = req.query;
  console.log("Novel ID: ", novel_id);
  try {
    const [results] = await pool.query(
      `
      SELECT 
    novels.novel_id,
    novels.title,
    novels.description,
    novels.cover_image,
    novels.author_id,
    users.username,
    novels.views,
    novels.created_at,
    COUNT(DISTINCT episodes.episode_id) AS episode_count, -- จำนวนตอนไม่ซ้ำกัน
    GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags, -- ป้องกันการซ้ำของแท็ก
    COUNT(DISTINCT reviews.review_id) AS review_count, -- จำนวนรีวิวไม่ซ้ำกัน
    IFNULL(AVG(reviews.rating), 0) AS average_rating -- ค่าเฉลี่ยเรตติ้ง
FROM 
    novels
JOIN 
    users ON novels.author_id = users.user_id
LEFT JOIN 
    episodes ON novels.novel_id = episodes.novel_id
LEFT JOIN 
    novel_tags ON novels.novel_id = novel_tags.novel_id
LEFT JOIN 
    tags ON novel_tags.tag_id = tags.tag_id
LEFT JOIN 
    reviews ON novels.novel_id = reviews.novel_id
WHERE 
    novels.novel_id = ?
GROUP BY 
    novels.novel_id;

      `,
      [novel_id]
    );
    res.status(200).json(results);
  } catch (error) {
    console.error("reload error ", error);
  }
};

const addToLibrary = async (req, res) => {
  const { user_id, novel_id } = req.body;

  // ตรวจสอบค่าที่ได้รับจาก request
  console.log("User ID:", user_id);
  console.log("Novel ID:", novel_id);
  try {
    const [existingEntry] = await pool.query(
      `SELECT * FROM library WHERE user_id = ? AND novel_id = ?`,
      [user_id, novel_id]
    );

    if (existingEntry.length > 0) {
      return res
        .status(409)
        .json({ message: "This novel is already in your library" });
    }

    const [result] = await pool.query(
      `
          INSERT INTO library (user_id, novel_id)
          VALUES (?, ?)
        `,
      [user_id, novel_id]
    );

    res.status(200).json({ message: "Added to library successfully" });
  } catch (error) {
    console.error("Error adding to library:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeFromLibrary = async (req, res) => {
  const { user_id, novel_id } = req.body;
  // ตรวจสอบค่าที่ได้รับจาก request
  console.log("User ID:", user_id);
  console.log("Novel ID:", novel_id);
  try {
    // ลบนิยายออกจาก library
    const [result] = await pool.query(
      `DELETE FROM library WHERE user_id = ? AND novel_id = ?`,
      [user_id, novel_id]
    );

    if (result.affectedRows === 0) {
      res
        .status(404)
        .json({ message: "Novel not found in library or invalid user ID." });
    } else {
      res
        .status(200)
        .json({ message: "Novel removed from library successfully." });
    }
  } catch (error) {
    console.error("Error removing novel from library:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLibraryNovels = async (req, res) => {
  const userId = req.query.user_id;

  try {
    const [results] = await pool.query(
      `
      SELECT 
          novels.novel_id,
          novels.title,
          novels.description,
          novels.cover_image,
          users.username,
          novels.views,
          novels.created_at,
          COUNT(DISTINCT episodes.episode_id) AS episode_count, -- นับจำนวนตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT episodes.title SEPARATOR ', ') AS episode_titles, -- ชื่อตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT episodes.content SEPARATOR ', ') AS episode_contents, -- เนื้อหาตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT episodes.episode_number SEPARATOR ', ') AS episode_numbers, -- หมายเลขตอนที่ไม่ซ้ำ
          GROUP_CONCAT(DISTINCT tags.name SEPARATOR ', ') AS tags,
          COUNT(DISTINCT reviews.review_id) AS review_count,
          IFNULL(AVG(reviews.rating), 0) AS average_rating
      FROM 
          library
      JOIN 
          novels ON library.novel_id = novels.novel_id
      JOIN 
          users ON novels.author_id = users.user_id
      LEFT JOIN 
          episodes ON novels.novel_id = episodes.novel_id
      LEFT JOIN 
          reviews ON novels.novel_id = reviews.novel_id
      LEFT JOIN 
          novel_tags ON novels.novel_id = novel_tags.novel_id
      LEFT JOIN 
          tags ON novel_tags.tag_id = tags.tag_id
      WHERE 
          library.user_id = ?
      GROUP BY 
          novels.novel_id;
      `,
      [userId]
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching library novels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkNovelInLibrary = async (req, res) => {
  const { user_id, novel_id } = req.query;

  try {
    const [results] = await pool.query(
      `
      SELECT 
        novel_id
      FROM 
        library 
      WHERE 
        user_id = ? 
      AND 
        novel_id = ?
      `,
      [user_id, novel_id]
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching library novels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//อัพเดทยอดวิวของนิยายเมื่อกดปุ่ม "อ่าน"
const updateView = async (req, res) => {
  const { novel_id } = req.body;
  if (!novel_id) {
    return res.status(400).json({ error: "novel_id is required" });
  }

  try {
    const [results] = await pool.query(
      `
      UPDATE 
        novels 
      SET 
        views = views + 1 
      WHERE 
        novel_id = ?
        `,
      [novel_id]
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

////////แสดงข้อมูลสารบัญของนิยาย
const getEpisodes = async (req, res) => {
  const { novel_id } = req.query;

  try {
    const [results] = await pool.query(
      `
      SELECT 
        episode_id, 
        novel_id, 
        title, 
        content, 
        episode_number 
      FROM 
        episodes 
      WHERE 
        novel_id = ?
      ORDER BY 
        episode_number ASC;
      `,
      [novel_id]
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getFirstEpisode = async (req, res) => {
  const { novel_id } = req.query;

  try {
    const [results] = await pool.query(
      `
      SELECT 
        episode_id,
        novel_id,
        title,
        content,
        episode_number,
        created_at,
        updated_at
      FROM 
        episodes
      WHERE 
        novel_id = ?
      ORDER BY 
        episode_number ASC
      LIMIT 1;
      `,
      [novel_id]
    );

    if (results.length > 0) {
      res.status(200).json(results[0]); // ส่งข้อมูลตอนแรกกลับไปในรูปแบบ JSON
    } else {
      res.status(404).json({ message: "ไม่พบตอนแรกของนิยายนี้" });
    }
  } catch (error) {
    console.error("Error fetching the first episode:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

const getPreviousEpisode = async (req, res) => {
  const { novel_id, episode_number } = req.query;

  try {
    const [results] = await pool.query(
      `
      SELECT 
        episode_id, 
        title, 
        content, 
        episode_number
      FROM 
        episodes
      WHERE 
        novel_id = ? AND episode_number < ?
      ORDER BY 
        episode_number DESC
      LIMIT 1
      `,
      [novel_id, episode_number]
    );

    if (results.length > 0) {
      res.status(200).json(results[0]); // ส่งข้อมูลของตอนก่อนหน้ากลับ
    } else {
      res.status(404).json({ message: "No previous episode found" });
    }
  } catch (error) {
    console.error("Error fetching previous episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNextEpisode = async (req, res) => {
  const { novel_id, episode_number } = req.query;

  try {
    const [results] = await pool.query(
      `
      SELECT 
        episode_id, 
        title, 
        content, 
        episode_number
      FROM 
        episodes
      WHERE 
        novel_id = ? AND episode_number > ?
      ORDER BY 
        episode_number ASC
      LIMIT 1
      `,
      [novel_id, episode_number]
    );

    if (results.length > 0) {
      res.status(200).json(results[0]); // ส่งข้อมูลของตอนถัดไปกลับ
    } else {
      res.status(404).json({ message: "No next episode found" });
    }
  } catch (error) {
    console.error("Error fetching next episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getNovelsByAuthor = async (req, res) => {
  const { authorId } = req.query; // รับค่า authorId จาก query parameter

  if (!authorId) {
    return res.status(400).json({ message: "Author ID is required" });
  }

  try {
    const [result] = await pool.query(
      ` 
        SELECT 
          n.novel_id, 
          n.title AS novel_title, 
          n.description AS novel_description, 
          n.cover_image AS novel_cover_image, 
          n.views AS novel_views,

          GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') AS genres,  -- รวมประเภทนิยายเป็นสตริงเดียว
          GROUP_CONCAT(DISTINCT t.tag_id SEPARATOR ', ') AS tag_ids,  -- รวม tag_id เป็นสตริงเดียว
          
          COUNT(DISTINCT e.episode_id) AS episode_count  -- นับจำนวนตอนของนิยาย
        FROM novels n
        LEFT JOIN novel_tags nt ON n.novel_id = nt.novel_id
        LEFT JOIN tags t ON nt.tag_id = t.tag_id
        LEFT JOIN episodes e ON n.novel_id = e.novel_id  -- JOIN กับตาราง episodes
        WHERE n.author_id = ?
        GROUP BY n.novel_id
      `,
      [authorId]
    );

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No novels found for this author" });
    }
  } catch (error) {
    console.error("Error fetching novels by author:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEpisodesByNovelId = async (req, res) => {
  const { novel_id } = req.query;

  try {
    const [results] = await pool.query(
      `SELECT episode_id, title, content, episode_number 
       FROM episodes 
       WHERE novel_id = ?
       ORDER BY episode_number ASC`,
      [novel_id]
    );
    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: "No episodes found for this novel" });
    }
  } catch (error) {
    console.error("Error fetching episodes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//////// แก้ไข ชื่อนิยาย , บทนำ , รูปปกนิยาย , ประเภท ของนิยาย ///////////////
const updateNovel = async (req, res) => {
  const { novel_id, title, description, cover_image, tagId } = req.body;

  try {
    // อัปเดตข้อมูลหลักของนิยายในตาราง novels
    const [novelResult] = await pool.query(
      `
      UPDATE 
        novels
      SET
        title = ?,
        description = ?,
        cover_image = ?
      WHERE
        novel_id = ?
      `,
      [title, description, cover_image, novel_id]
    );

    if (novelResult.affectedRows === 0) {
      return res.status(404).json({ message: "Novel not found" });
    }

    // ลบแท็กเก่าทั้งหมดในตาราง novel_tags ที่เชื่อมโยงกับ novel_id นี้
    await pool.query(`DELETE FROM novel_tags WHERE novel_id = ?`, [novel_id]);

    // เพิ่มแท็กใหม่ทั้งหมดจาก array tagId
    for (const tag of tagId) {
      await pool.query(
        `INSERT INTO novel_tags (novel_id, tag_id) VALUES (?, ?)`,
        [novel_id, tag]
      );
    }

    res.status(200).json({ message: "Novel updated successfully" });
  } catch (error) {
    console.error("Error updating novel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

////ลบตอน ///////////////////////////
const deleteEpisode = async (req, res) => {
  const { novel_id, episode_id } = req.query; // รับ episode_id และ novel_id จาก query string

  // ตรวจสอบว่ามีการส่งค่า episode_id และ novel_id มาหรือไม่
  if (!novel_id || !episode_id) {
    return res
      .status(400)
      .json({ message: "Episode ID and Novel ID are required" });
  }
  try {
    // ดำเนินการลบข้อมูลในตาราง episodes
    await pool.query(
      `DELETE 
        FROM 
          episodes 
        WHERE 
          novel_id = ? 
        AND 
          episode_id = ?`,
      [novel_id, episode_id] // แก้ไขให้ novel_id มาก่อน episode_id
    );

    // ส่ง response กลับว่าลบสำเร็จ
    res.status(200).json({ message: "Episode deleted successfully" });
  } catch (error) {
    console.error("Error deleting episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// แก้ไข ชื่อตอน และ เนื้อเรื่อง
const updateEpisode = async (req, res) => {
  const { novel_id, episode_id } = req.query; // รับ episode_id และ novel_id จาก query string
  const { title, content } = req.body; // รับข้อมูลจาก request body

  // ตรวจสอบว่ามีการส่งค่า episode_id และ novel_id มาหรือไม่
  if (!novel_id || !episode_id) {
    return res
      .status(400)
      .json({ message: "Episode ID and Novel ID are required" });
  }
  try {
    // ดำเนินการแก้ไขข้อมูลในตาราง episodes
    await pool.query(
      `UPDATE 
        episodes 
      SET 
        title = ?, 
        content = ? 
      WHERE 
        novel_id = ? 
      AND 
        episode_id = ?`,
      [title, content, novel_id, episode_id] // เปลี่ยนลำดับให้ตรงกับ SQL
    );
    res.status(200).json({ message: "Episode updated successfully" });
  } catch (error) {
    console.error("Error updating episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชั่นลบนิยาย
const deleteNovel = async (req, res) => {
  const { novel_id } = req.query;

  if (!novel_id) {
    return res.status(400).json({ message: "Novel ID is required" });
  }

  try {
    // ดำเนินการลบข้อมูลในตาราง novels
    await pool.query(`DELETE FROM novels WHERE novel_id = ?`, [novel_id]);

    // ส่ง response กลับว่าลบสำเร็จ
    res.status(200).json({ message: "Novel deleted successfully" });
  } catch (error) {
    console.error("Error deleting novel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ฟังก์ชันเพิ่มนิยายเรื่องใหม่ //////////////////////////
const addNewNovel = async (req, res) => {
  const { title, description, cover_image, author_id } = req.body;

  if (!title || !description || !author_id) {
    return (
      res
        // ให้ตอบกลับเป็น 400 ให้รู้ว่ามีการส่งข้อมูลไม่ครบ
        .status(400)
        .json({ message: "Title, description, and author_id are required" })
    );
  }

  try {
    // เพิ่มข้อมูลนิยายใหม่ลงในฐานข้อมูล
    const [result] = await pool.query(
      `
      INSERT INTO 
        novels 
          (title, description, cover_image, author_id, created_at)
        VALUES 
          (?, ?, ?, ?, NOW())
      `,
      [title, description, cover_image, author_id]
    );
    // ให้ตอบกลับเป็น 201 ให้รู้ว่ามีการสร้างข้อมูลสําเร็จ
    res.status(201).json({
      message: "Novel added successfully",
      novel_id: result.insertId, // ส่งกลับ ID ของนิยายใหม่ที่ถูกเพิ่ม
    });
  } catch (error) {
    console.error("Error adding new novel:", error);
    // ให้ตอบกลับเป็น 500 ให้รู้ว่าเกิดข้อผิดพลาดในการเพิ่มข้อมูล
    res.status(500).json({ message: "Internal server error" });
  }
};

//ฟังชั่นสร้างตอนใหม่ ///////////////////////////////
const addEpisode = async (req, res) => {
  const { novel_id } = req.query; // รับ novel_id จาก query
  const { title, content } = req.body; // รับข้อมูล title และ content จาก body request

  if (!novel_id || !title || !content) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
  }

  try {
    // ตรวจสอบลำดับสูงสุดของตอนที่มีอยู่แล้วในนิยายเรื่องนี้
    const [maxEpisodeResult] = await pool.query(
      `SELECT MAX(episode_number) AS max_episode FROM episodes WHERE novel_id = ?`,
      [novel_id]
    );

    // กำหนดลำดับตอนใหม่
    const nextEpisodeNumber = (maxEpisodeResult[0].max_episode || 0) + 1;

    // เพิ่มตอนใหม่โดยใช้ลำดับตอนที่คำนวณไว้
    const [insertResult] = await pool.query(
      `INSERT INTO episodes (novel_id, title, content, episode_number)
           VALUES (?, ?, ?, ?)`,
      [novel_id, title, content, nextEpisodeNumber]
    );

    if (insertResult.affectedRows > 0) {
      res.status(201).json({
        message: "เพิ่มตอนใหม่สำเร็จ",
        episode_id: insertResult.insertId,
      });
    } else {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มตอน" });
    }
  } catch (error) {
    console.error("Error inserting episode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  //---- Mobile Application ----//
  getNewNovels,
  getUpdatedNovels,
  getTrendingNovels,
  getNovelbyNovelId,
  addToLibrary,
  removeFromLibrary,
  getLibraryNovels,
  checkNovelInLibrary,
  updateView,
  getEpisodes,
  getFirstEpisode,
  getPreviousEpisode,
  getNextEpisode,
  //---- Web Application ----//
  getNovelsByAuthor,
  getEpisodesByNovelId,
  updateNovel,
  deleteEpisode,
  updateEpisode,
  addNewNovel,
  deleteNovel,
  addEpisode,
};
