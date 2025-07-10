import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import Purchase from "../models/Purchase.js";

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });
    res.json({ success: true, message: "You can publish a course now" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;
    
    if (!imageFile) {
      return res.json({ success: false, message: "Thumbnail Not Attached" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    
    // Create course first - Mongoose will automatically set timestamps
    const newCourse = await Course.create(parsedCourseData);
    console.log('Created course with ID:', newCourse._id);
    console.log('Course createdAt:', newCourse.createdAt);
    console.log('Course createdAt type:', typeof newCourse.createdAt);
    
    // Upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: "Course Added" });
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message });
  }
};


//Get educator courses

export const getEducatorCourses= async(req, res)=>{
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({educator}).sort({createdAt: -1})
        console.log('Found courses:', courses.length)
        if (courses.length > 0) {
            console.log('Sample course createdAt:', courses[0].createdAt)
            console.log('Sample course createdAt type:', typeof courses[0].createdAt)
            console.log('Sample course createdAt string:', courses[0].createdAt?.toString())
        }
        res.json({success:true, courses})
    }
    catch(error){
        console.error('Error fetching educator courses:', error)
        res.json({success:false, message: error.message});
    }
}

//Get educator dashboard data

export const educatorDashboardData = async (req, res)=>{
    try{
        const educator = req.auth.userId;
        const courses = await Course.find({educator});
        const totalCourses = courses.length;
        const courseIds= courses.map(course=> course._id);

        const purchase  = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        })
        const totalEarnings = purchase.reduce((sum, purchase)=> sum+purchase.amount, 0);

        const enrolledStudentsData = [];
        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl');
            students.forEach(student =>{
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
            res.json({success:true, dashboardData:{
                totalEarnings, enrolledStudentsData, totalCourses
            }})
        }
    }
    catch(error){
        res.json({success:false, message: error.message})
    }
}

//Get Enrolled Students Data with purchase data
export const getEnrolledStudentsData = async (req, res)=>{
    try{
        const educator = req.auth.userId;
        console.log('Educator userId:', educator);
        const courses = await Course.find({educator});
        console.log('Courses found for educator:', courses.length);
        const courseIds = courses.map(course => course._id);
        console.log('Course IDs:', courseIds);
        if (courseIds.length === 0) {
            return res.json({success:true, enrolledStudents: []});
        }
        const purchases = await Purchase.find({
            courseId: {$in:courseIds},
            status: 'completed'
        }).populate('userId','name imageUrl').populate('courseId', 'courseTitle')
        console.log('Purchases found:', purchases.length);
        const enrolledStudents = purchases.map(purchase=>({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));
        res.json({success:true, enrolledStudents})
    }
    catch(error){
        console.error('Error in getEnrolledStudentsData:', error);
        res.json({success:false, message: error.message})
    }
}