import Course from '../models/Course.js'
import multer from 'multer';
import path from 'path';

// ✅ Get all published courses (with createdAt included)
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .select('-courseContent') // Only exclude large content, keep enrolledStudents and createdAt
            .populate({ path: 'educator' });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

// ✅ Get course by ID
export const getCourseId = async (req, res) => {
    const { id } = req.params;
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' });

        // Remove lecture URL if not free preview
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            });
        });

        res.json({ success: true, courseData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// ✅ Add a new course
export const addCourse = async (req, res) => {
    try {
        const { courseTitle, courseDescription, coursePrice, discount } = req.body;

        let courseContent = [];
        if (req.body.courseContent) {
            courseContent = JSON.parse(req.body.courseContent);
        }

        let courseThumbnail = '';
        if (req.file) {
            courseThumbnail = req.file.path; // Or req.file.url if using cloudinary
        } else if (req.body.courseThumbnail) {
            courseThumbnail = req.body.courseThumbnail;
        }

        const newCourse = new Course({
            courseTitle,
            courseDescription,
            coursePrice,
            discount,
            courseThumbnail,
            courseContent,
            isPublished: true,
            educator: req.user._id // Make sure req.user is populated via middleware
        });

        await newCourse.save();
        res.json({ success: true, course: newCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
