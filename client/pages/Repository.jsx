import { useState, useEffect } from 'react';
import API from '../api';

const Repository = () => {
  const [theses, setTheses] = useState([]);
  const [search, setSearch] = useState('');

  // Search Logic
  const handleSearch = async () => {
    const { data } = await API.get(`/thesis/repository/search?keyword=${search}`);
    setTheses(data);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Thesis Repository</h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Search by keyword (e.g., AI, NLP)..." 
          className="border p-2 w-full"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-6 rounded">
          Search
        </button>
      </div>

      {/* Results Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Department</th>
            <th className="p-2 text-left">Year</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {theses.map((thesis) => (
            <tr key={thesis._id} className="border-t">
              <td className="p-2">{thesis.title}</td>
              <td className="p-2">{thesis.department}</td>
              <td className="p-2">{thesis.year}</td>
              <td className="p-2">
                <a 
                  href={thesis.pdfUrl} 
                  target="_blank" 
                  className="text-blue-500 underline"
                  rel="noreferrer"
                >
                  Download PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Repository;
