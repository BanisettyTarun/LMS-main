import express from 'express';
import { getAllCourse, getCourseId, addCourse } from '../controllers/courseController.js';
import upload from '../configs/multer.js';

const courseRouter = express.Router();


courseRouter.get('/all', getAllCourse)
courseRouter.get('/:id', getCourseId)
courseRouter.post('/add', upload.single('courseThumbnail'), addCourse);

export default courseRouter;