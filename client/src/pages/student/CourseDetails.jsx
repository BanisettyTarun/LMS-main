import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';
import YouTube from 'react-youtube';
import axios from 'axios';

// Function to extract YouTube video ID from various URL formats
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // If no pattern matches, try to extract from the end of the URL
  const urlParts = url.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  
  // Remove query parameters if present
  const videoId = lastPart.split('?')[0];
  
  return videoId || null;
};

function CourseDetails() {

  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const { allCourses, calculateRating, calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime, currency } = useContext(AppContext)

  const fetchCourseData = async () => {
    const findCourse = allCourses.find(course => {
      return course._id === id
    });
    setCourseData(findCourse);
  }
  useEffect(() => {
    fetchCourseData();
  }, [allCourses, id])

  // Show loading while fetching data
  if (!allCourses || allCourses.length === 0) {
    return <Loading />
  }

  // Show error if course not found
  if (allCourses.length > 0 && !courseData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen px-8'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-4'>Course Not Found</h1>
        <p className='text-gray-500 text-center mb-6'>The course you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => window.history.back()} 
          className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'
        >
          Go Back
        </button>
      </div>
    )
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => (
      { ...prev, [index]: !prev[index], }
    ))
  }

  const handleEnroll = async () => {
    setLoadingPayment(true);
    setPaymentError(null);
    try {
      // Get token from Clerk if available, otherwise fallback to localStorage
      let token = null;
      if (window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
      } else {
        token = localStorage.getItem('token');
      }
      const res = await axios.post(
        '/api/user/purchase',
        { courseId: courseData._id },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (res.data && res.data.session_url) {
        window.location.href = res.data.session_url;
      } else {
        setPaymentError('Failed to initiate payment.');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment initiation failed.');
    } finally {
      setLoadingPayment(false);
    }
  };

  return courseData ? (
    <>
      <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left'>
        <div className='absolute top-0 left-0 w-full h-section-height bg-gradient-to-b from-cyan-100/70'>

        </div>
        {/* left column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
          <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>
          {/* review and ratings */}
          <div className='flex pt-3 pb-1 items-center space-x-2'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (
                <img className='w-3.5 h-3.5' key={i} src={i < Math.floor(parseFloat(calculateRating(courseData))) ? assets.star : assets.star_blank} alt='' />
              ))}
            </div>
            <p className='text-blue-600'>({Array.isArray(courseData.courseRatings) ? courseData.courseRatings.length : 0} {Array.isArray(courseData.courseRatings) && courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>
            <p>{Array.isArray(courseData.enrolledStudents) ? courseData.enrolledStudents.length : 0} {Array.isArray(courseData.enrolledStudents) && courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
          </div>
          <p className='text-sm'>Course by <span className='text-blue-600 underline'>Tarun</span></p>

          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5'>
              {Array.isArray(courseData.courseContent) && courseData.courseContent.length > 0 ? courseData.courseContent.map((chapter, index) => (
                <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                  <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={() => toggleSection(index)}>
                    <div className='flex items-center gap-2'>
                      <img className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`} src={assets.down_arrow_icon} alt="arrow icon" />
                      <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li className='flex items-center gap-2 py-1' key={i}>
                          <img src={assets.play_icon} alt="play_icon" className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isFreePreview && <p onClick={() => {
                                const vid = extractYouTubeVideoId(lecture.videoUrl);
                                console.log('Extracted video ID:', vid, 'from URL:', lecture.videoUrl);
                                setPlayerData({ videoId: vid })
                              }} className='text-blue-500 cursor-pointer'>Preview</p>}
                              <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )) : <p>No course content available.</p>}
            </div>
          </div>
          <div className='py-20 text-sm md:text-default'>
            <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
            <p className='pt-3 rich-text' dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>

          </div>
        </div>
        {/* right column */}

        <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>
          <div className="w-full flex justify-center mb-6">
            <img
              src={courseData.courseThumbnail}
              alt={courseData.courseTitle}
              className="rounded-lg shadow-lg w-full max-h-64 object-cover"
            />
          </div>
          <div className='p-5 max-w-xl mx-auto'>
            <div className='flex items-center gap-2'>
              <img className='w-3.5' src={assets.time_left_clock_icon} alt="time left clock icon" />
              <p className='text-red-500'><span className='font-medium'>5</span> days left at this price!</p>
            </div>
            <div className='flex gap-3 items-center pt-2'>
              <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
              <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
              <p className='md:text-lg text-gray-500'>{courseData.discount}% off</p>
            </div>
            <div className='flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500'>
              <div className='flex items-center gap-1'>
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>

              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className='h-4 w-px bg-gray-500/40'></div>

              <div className='flex items-center gap-1'>
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>

            {/* Enroll button triggers Stripe payment flow */}
            <button
              className={`md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium ${isAlreadyEnrolled || loadingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleEnroll}
              disabled={isAlreadyEnrolled || loadingPayment}
            >
              {isAlreadyEnrolled ? 'Already Enrolled' : loadingPayment ? 'Redirecting to Payment...' : 'Enroll Now'}
            </button>
            {paymentError && <p className='text-red-500 mt-2'>{paymentError}</p>}
            <div>
              <p>What's in the course?</p>
              <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default CourseDetails