const { pool } = require("../config/connectdb"); // นำเข้า pool ที่เป็นการเชื่อมต่อกับฐานข้อมูล
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";

//////////////////////// Register ////////////////////////////
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    // หากไม่มีผู้ใช้ที่ซ้ำกัน ให้เพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, password_hash]
    );

    // เพิ่มบรรทัดนี้เพื่อตรวจสอบค่าของ result
    console.log("Result from pool.query:", result);

    res.status(201).json({
      user_id: result.insertId,
      message: "User registered successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//////////////////// Login /////////////////////////
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ตรวจสอบว่ามีผู้ใช้ที่มีอีเมลนี้อยู่ในฐานข้อมูลหรือไม่
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      // หากไม่มีผู้ใช้อยู่ในฐานข้อมูล
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // เปรียบเทียบรหัสผ่านที่กรอกกับรหัสผ่านที่เข้ารหัสในฐานข้อมูล
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // หากรหัสผ่านไม่ตรงกัน
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // สร้าง JWT Token
    const token = jwt.sign({ userId: user.user_id }, secretKey, {
      expiresIn: "3h",
    });

    // ส่งการตอบกลับ
    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

////////////////// getuserinfo ////////////////////////
// const userinfo = async (req, res) => {
//   // ดึง token จาก authorization header
//   const token = req.headers["authorization"];
//   // ตรวจสอบว่ามี token หรือไม่
//   if (!token) {
//     return res.status(403).json({ message: "No token provided" });
//   }

//   try {
//     // ใช้ jwt.verify() เพื่อตรวจสอบ token โดยการใช้ secretKey แยก Bearer ออกจาก token
//     const decoded = jwt.verify(token.split(" ")[1], secretKey);
//     // ดึง user_id จาก decoded
//     const userId = decoded.userId;
//     // สร้างตัวแปร userResult เพื่อเก็บข้อมูลผู้ใช้ที่ตรงกับ user_id
//     const [userResult] = await pool.query(
//       `
//         SELECT
//           user_id,
//           username,
//           email,
//           profile_image
//         FROM
//           users
//         WHERE
//           user_id = ?
//       `,
//       [userId]
//     );
//     // สร้างตัวแปร novelCountResult เพื่อเก็บจํานวนหนังสือทั้งหมดของผู้ใช้ ที่ตรงกับ user_id
//     const [novelCountResult] = await pool.query(
//       `
//         SELECT
//           COUNT(*) AS novel_count
//         FROM
//           novels
//         WHERE
//           author_id = ?
//       `,
//       [userId]
//     );
//     // ตรวจสอบว่ามีผู้ใช้ที่ตรงกับ user_id ในฐานข้อมูลหรือไม่
//     if (userResult.length > 0) {
//       const user = userResult[0];
//       const novelCount = novelCountResult[0].novel_count;
//       // ส่งข้อมูลผู้ใช้และจํานวนหนังสือทั้งหมดให้กับ client ในรูปแบบ JSON
//       res.json({
//         user_id: user.user_id,
//         username: user.username,
//         email: user.email,
//         profile_image: user.profile_image,
//         novel_count: novelCount,
//       });
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res
//         .status(401)
//         .json({ message: "Token has expired, please log in again." });
//     }
//     console.error("Error fetching user data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
const userinfo = async (req, res) => {
  // ดึง token จาก authorization header
  const token = req.headers["authorization"];
  // ตรวจสอบว่ามี token หรือไม่
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    // ใช้ jwt.verify() เพื่อตรวจสอบ token โดยการใช้ secretKey แยก Bearer ออกจาก token
    const decoded = jwt.verify(token.split(" ")[1], secretKey);
    // ดึง user_id จาก decoded
    const userId = decoded.userId;

    // Query ข้อมูลผู้ใช้
    const [userResult] = await pool.query(
      `
        SELECT 
          user_id, 
          username, 
          email, 
          profile_image 
        FROM 
          users 
        WHERE 
          user_id = ?
      `,
      [userId]
    );

    // Query จํานวนหนังสือทั้งหมดของผู้ใช้
    const [novelCountResult] = await pool.query(
      `
        SELECT 
          COUNT(*) AS novel_count 
        FROM 
          novels 
        WHERE 
          author_id = ?
      `,
      [userId]
    );

    // Query จำนวนนิยายที่อยู่ในชั้นหนังสือ
    const [libraryCountResult] = await pool.query(
      `
        SELECT 
          COUNT(*) AS library_count 
        FROM 
          library 
        WHERE 
          user_id = ?
      `,
      [userId]
    );

    // ตรวจสอบว่ามีผู้ใช้ที่ตรงกับ user_id ในฐานข้อมูลหรือไม่
    if (userResult.length > 0) {
      const user = userResult[0];
      const novelCount = novelCountResult[0].novel_count;
      const libraryCount = libraryCountResult[0].library_count;

      // ส่งข้อมูลผู้ใช้, จำนวนหนังสือที่เขียน, และจำนวนนิยายใน Library ให้กับ client
      res.json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
        novel_count: novelCount,
        library_count: libraryCount, // จำนวนนิยายที่มีอยู่ใน Library
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired, please log in again." });
    }
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/////////////// Update ชื่อผู้ใช้ ///////////////////
const updateUsername = async (req, res) => {
  const { username } = req.body;
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    // แยก Bearer ออกจาก token
    const decoded = jwt.verify(token.split(" ")[1], secretKey);
    const userId = decoded.userId;

    // อัปเดตชื่อผู้ใช้ในฐานข้อมูล
    const [result] = await pool.query(
      "UPDATE users SET username = ? WHERE user_id = ?",
      [username, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

///บันทึกรูปโปรไฟล์ของ User ///////////////////////
const updatedProfileImage = async (req, res) => {
  const { profile_image } = req.body; // ดึงข้อมูล base64 จาก request body
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  try {
    // แยก Bearer ออกจาก token
    const decoded = jwt.verify(token.split(" ")[1], secretKey);
    const userId = decoded.userId;
    // อัปเดตรูปผู้ใช้ในฐานข้อมูล
    const [result] = await pool.query(
      "UPDATE users SET profile_image = ? WHERE user_id = ?",
      [profile_image, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile image updated successfully" });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // ตรวจสอบว่ามีผู้ใช้อีเมลนี้ในระบบหรือไม่
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งานที่มีอีเมลนี้" });
    }

    const user = rows[0];

    // สร้างรหัสผ่านชั่วคราว (หรือสร้าง Token สำหรับลิงก์รีเซ็ตรหัสผ่าน)
    const temporaryPassword = Math.random().toString(36).substring(2, 10); // สร้างรหัสผ่านสุ่ม 8 ตัวอักษร
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // อัปเดตรหัสผ่านชั่วคราวในฐานข้อมูล
    await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      hashedPassword,
      user.user_id,
    ]);

    // ตั้งค่า Nodemailer SMTP Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // ใช้ Gmail SMTP Server
      auth: {
        user: "firstindex66@gmail.com", // ใส่อีเมลผู้ส่ง
        pass: "xsey tdor uzfp irhb", // รหัสผ่านหรือ App Password ของอีเมล
      },
    });

    // ตั้งค่าข้อมูลอีเมล
    const mailOptions = {
      from: "firstindex66@gmail.com",
      to: email,
      subject: "Reset Password Request",
      html: `
        <p>สวัสดีคุณ<br><strong>${user.username}</strong></p>
        <p>เราได้ทำการรีเซ็ตรหัสผ่านของคุณเรียบร้อยแล้ว</p>
        <p>คุณสามารถเข้าใช้งานระบบได้ทันทีด้วยรหัสผ่านนี้</p>
        <p style="color: red ; font-size: 20px"><strong>${temporaryPassword}</strong></p>
        <p>ขอบคุณ<br>First Index</p>
      `,
    };

    // ส่งอีเมล
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "รหัสผ่านชั่วคราวถูกส่งไปยังอีเมลของคุณแล้ว",
    });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" });
  }
};

module.exports = { 
  login,
  register,
  userinfo,
  updateUsername,
  updatedProfileImage,
  sendResetPasswordEmail,
};
