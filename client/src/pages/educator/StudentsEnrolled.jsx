import React from 'react';
import Loading from '../../components/student/Loading';

function StudentsEnrolled() {
  // Hardcoded demo data for enrolled students
  const enrolledStudents = [
    {
      student: {
        name: 'Alice Johnson',
        imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      courseTitle: 'Python for Beginners',
      purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      student: {
        name: 'Bob Smith',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      courseTitle: 'React Mastery',
      purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      student: {
        name: 'Priya Patel',
        imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      },
      courseTitle: 'Data Science Bootcamp',
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      student: {
        name: 'Chen Wei',
        imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
      },
      courseTitle: 'JavaScript Essentials',
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>Students Enrolled</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='table-fixed md:table-auto w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                <th className='px-4 py-3 font-semibold'>Student Name</th>
                <th className='px-4 py-3 font-semibold'>Course Title</th>
                <th className='px-4 py-3 font-semibold'>Enrolled On</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {enrolledStudents.map((item, index) => (
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                    <img src={item.student.imageUrl} alt="Profile" className='w-9 h-9 rounded-full' />
                    <span className='truncate'>{item.student.name}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                  <td className='px-4 py-3'>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentsEnrolled;