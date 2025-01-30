const express = require("express");
const router = express.Router();
const userCtrl = require("./../controllers/users_ctrl");
const novelCtrl = require("./../controllers/novels_ctrl");
const searchctrl = require("./../controllers/search_ctrl");
const commentCtrl = require("./../controllers/comment_ctrl");

////////////////////////// Mobile Application ///////////////////////////////
//------------ เส้นทางสำหรับการจัดรายละเอียดผู้ใช้ -------------------------------//
router.get("/userinfo", userCtrl.userinfo);
router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/updatename", userCtrl.updateUsername);
router.post("/updateprofileimage", userCtrl.updatedProfileImage);
router.post("/sendpasswordemail", userCtrl.sendResetPasswordEmail);

//------------ เส้นทางสำหรับการจัดการกับนิยาย ---------------------------------//
//------------ หน้า Home --------------------------------------------------//
router.get("/newnovel", novelCtrl.getNewNovels);
router.get("/updatednovels", novelCtrl.getUpdatedNovels);
router.get("/trendingnovels", novelCtrl.getTrendingNovels);
//------------ หน้า Search ------------------------------------------------//
router.get("/getNovelsByTag", searchctrl.getNovelsByTag);
//------------ เส้นทางแสดงรายละเอียดต่างๆของนิยาย ----------------------------// 
router.get("/library", novelCtrl.getLibraryNovels);
router.get("/checkNovelInLibrary", novelCtrl.checkNovelInLibrary);
router.get("/getNovelByNovelId", novelCtrl.getNovelbyNovelId);
router.get("/episodes", novelCtrl.getEpisodes);
router.get("/firstepisode", novelCtrl.getFirstEpisode);
router.get("/previousepisode", novelCtrl.getPreviousEpisode);
router.get("/nextepisode", novelCtrl.getNextEpisode);
router.get("/novelepisode/", novelCtrl.getEpisodesByNovelId);
router.get("/getComments", commentCtrl.getComment);

//------------ เส้นทางสำหรับจัดการกับ Comment and Rating ของนิยาย ------------//
router.post("/updateViews", novelCtrl.updateView);
router.post("/addReview", commentCtrl.addReview);
//------------ เส้นทางสำหรับจัดการกับ เพิ่ม / ลบ นิยายในชั้นหนังสือ ---------------//
router.post("/addToLibrary", novelCtrl.addToLibrary);
router.post("/removeFromLibrary", novelCtrl.removeFromLibrary);

//////////////////////// Web Application //////////////////////////////////
//------------ เส้นทางแสดงนิยายของผู้เขียน -----------------------------------//
router.get("/authorlibrary",novelCtrl.getNovelsByAuthor);
//------------ เส้นทางจัดการละเอียดต่างๆของนิยาย ------------------------------// 
router.post("/addNewNovel", novelCtrl.addNewNovel);
router.post("/addEpisode", novelCtrl.addEpisode);
router.put("/updateNovelInfo", novelCtrl.updateNovel); 
router.put("/updateEpisode", novelCtrl.updateEpisode);
router.delete("/deleteEpisode", novelCtrl.deleteEpisode);
router.delete("/deleteNovel", novelCtrl.deleteNovel);

module.exports = router;
