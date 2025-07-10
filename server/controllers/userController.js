import User from "../models/User.js"
import Purchase from '../models/Purchase.js'
import Stripe from 'stripe'
import Course from "../models/Course.js";

export const getUserData = async (req, res)=>{
    try{
        console.log(req.auth.userId);
        const userId = req.auth.userId
        const user = await User.findById(userId)
        if(!user){
            return res.json({success:false, message: 'User Not Found'})
        }
        res.json({success:true, user })
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}

//user enrolled courses with lecture links

export const userEnrolledCourses = async (req, res)=>{
    try{
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({success:true, enrolledCourses: userData.enrolledCourses})
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}


export const purchaseCourse = async (req, res)=>{
    try{
        const {courseId} = req.body
        const {origin} = req.headers
        const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)
        if(!userData || !courseData){
            console.error('Data not found:', { userId, courseId });
            return res.status(404).json({success:false, message:"Data not found"})
        }
        if(!process.env.STRIPE_SECRET_KEY || !process.env.CURRENCY){
            console.error('Missing Stripe config:', { STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY, CURRENCY: process.env.CURRENCY });
            return res.status(500).json({success:false, message:"Stripe configuration missing"})
        }
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount*courseData.coursePrice /100).toFixed(2),
            status: 'completed', // Ensure status is set to completed
        }
        const newPurchase = await Purchase.create(purchaseData)

        const stripeInstance =new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name:courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount * 100)
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode:'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({success:true, session_url: session.url})

        // Immediately enroll the user in the course, regardless of payment status
        if (!userData.enrolledCourses.includes(courseData._id)) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
        }
        if (!courseData.enrolledStudents.includes(userData._id)) {
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
        }
    }
    catch(error){
        console.error('Stripe payment error:', error);
        res.status(500).json({success: false, message:error.message})
    }
}