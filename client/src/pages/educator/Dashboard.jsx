import React from 'react';

function Dashboard() {
  // Hardcoded demo data for latest enrollments
  const enrollments = [
    {
      student: { name: 'Alice Johnson' },
      courseTitle: 'Python for Beginners',
      purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      student: { name: 'Bob Smith' },
      courseTitle: 'React Mastery',
      purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      student: { name: 'Priya Patel' },
      courseTitle: 'Data Science Bootcamp',
      purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      student: { name: 'Chen Wei' },
      courseTitle: 'JavaScript Essentials',
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ];

  return (
    <div className="min-h-screen md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <h2 className="text-lg font-semibold mb-4">Latest Enrollments</h2>
      <div className="w-full max-w-4xl bg-white border border-gray-500/20 rounded-md overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">No.</th>
              <th className="px-4 py-2 border">Student Name</th>
              <th className="px-4 py-2 border">Course Title</th>
              <th className="px-4 py-2 border">Enrolled On</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 border text-center">{idx + 1}</td>
                <td className="px-4 py-2 border">{item.student?.name || 'N/A'}</td>
                <td className="px-4 py-2 border">{item.courseTitle}</td>
                <td className="px-4 py-2 border">{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-GB') : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;