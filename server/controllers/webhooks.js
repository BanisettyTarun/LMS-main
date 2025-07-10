import { Webhook } from "svix";
import User from '../models/User.js'
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
// import Purchase from "../models/Purchase.js";
// import Course from "../models/Course.js";
// import Stripe from "stripe";

export const clerkWebhooks = async (req, res)=>{
    try{
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-signature": req.headers["svix-signature"],
            "svix-timestamp": req.headers["svix-timestamp"]
        })
        const {data, type} = req.body

        switch(type){
            case 'user.created':{
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.create(userData)
                break;
            }
            case 'user.updated':{
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                res.json({})
                break;
            }
            case 'user.deleted': {
                await User.findByIdAndDeleted(data.id)
                res.json({})
                break;
            }
            default:
                break;

        }
    }
    catch(error){
        res.json({success: false, message: error.message})
    }
}



export const stripeInstance  = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhook = async (request, response) =>{
    const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId
      })
      if (!session.data || !session.data[0]) {
        console.error('No Stripe session found for payment intent:', paymentIntentId);
        break;
      }
      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId)
      if (!purchaseData) {
        console.error('No purchase found for ID:', purchaseId);
        break;
      }
      const userData = await User.findById(purchaseData.userId)
      const courseData = await Course.findById(purchaseData.courseId.toString())
      if (!userData || !courseData) {
        console.error('User or course not found for purchase:', purchaseId);
        break;
      }
      // Only add if not already enrolled
      if (!courseData.enrolledStudents.includes(userData._id)) {
        courseData.enrolledStudents.push(userData._id)
        await courseData.save()
      }
      if (!userData.enrolledCourses.includes(courseData._id)) {
        userData.enrolledCourses.push(courseData._id)
        await userData.save()
      }
      purchaseData.status = 'completed'
      await purchaseData.save()
      break;}
    case 'payment_intent.payment_failed':{
        const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId
      })
      if (!session.data || !session.data[0]) {
        console.error('No Stripe session found for failed payment intent:', paymentIntentId);
        break;
      }
      const {purchaseId} = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId)
      if (purchaseData) {
        purchaseData.status = 'failed'
        await purchaseData.save()
      }
      break;}
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});

}
