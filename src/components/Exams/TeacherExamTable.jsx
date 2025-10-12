import React from 'react';
import formatDateOnly from '../../utils/formatDateOnly';
import { HiChevronUp, HiChevronDown, HiSelector } from 'react-icons/hi';
import PropTypes from 'prop-types';
import ActionMenu from '../ActionMenu';
import { useNavigate } from 'react-router-dom';

const TeacherExamTable = ({ data, searchParams, setSearchParams }) => {
  const navigate = useNavigate();
  const sort = searchParams.get('sort') || 'date';
  const order = searchParams.get('order') || 'desc';

  const handleSort = (key) => {
    const currentSort = searchParams.get('sort');
    const currentOrder = searchParams.get('order') || 'desc';
    const newOrder = currentSort === key && currentOrder === 'asc' ? 'desc' : 'asc';
    setSearchParams({
      search: searchParams.get('search') || '',
      sort: key,
      order: newOrder,
      page: '1',
    });
  };

  const renderSortIndicator = (key) => {
    if (sort !== key) return <HiSelector className="inline text-gray-400 ml-1" />;
    return order === 'asc' ? (
      <HiChevronUp className="inline text-blue-500 ml-1" />
    ) : (
      <HiChevronDown className="inline text-blue-500 ml-1" />
    );
  };

  const handleViewStudents = (examId) => {
    // ⤵️ Navigate ke daftar siswa yang sudah submit ujian ini
    navigate(`/teacher-exam/${examId}/students`);
  };

  return (
    <div className="mt-4">
      <table className="table-auto w-full min-w-full bg-white border border-gray-200 rounded shadow text-sm text-gray-500 border-separate border-spacing-0">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center">No</th>
            <th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('title')}>
              Title {renderSortIndicator('title')}
            </th>
            <th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('subject')}>
              Subject {renderSortIndicator('subject')}
            </th>
            <th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('type')}>
              Type {renderSortIndicator('type')}
            </th>
            <th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('date')}>
              Date {renderSortIndicator('date')}
            </th>
            <th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('duration')}>
              Duration (min) {renderSortIndicator('duration')}
            </th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((exam, index) => (
              <tr key={exam.id}>
                <td className="px-4 py-2 border border-gray-200 text-center">{index + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{exam.title}</td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {exam.subjects?.name || '-'}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">{exam.type}</td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {formatDateOnly(exam.date)}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">{exam.duration}</td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {/* 🔹 Ganti Scoring jadi List Students */}
                  <ActionMenu itemId={exam.id} menu="teacherExam" onShowStudents={handleViewStudents} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                Tidak ada ujian dengan submission
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TeacherExamTable.propTypes = {
  data: PropTypes.array.isRequired,
  searchParams: PropTypes.object.isRequired,
  setSearchParams: PropTypes.func.isRequired,
};

export default TeacherExamTable;
