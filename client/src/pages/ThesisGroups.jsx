import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const ThesisGroups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ groupName: '', researchInterests: '' });

  // Fetch Groups on Load
  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await API.get('/thesis/groups');
      setGroups(data);
    };
    fetchGroups();
  }, []);

  // Create Group Handler
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newGroup, leader: user._id };
      const { data } = await API.post('/thesis/groups', payload);
      setGroups([...groups, data]); // Update UI instantly
    } catch (err) {
      alert('Failed to create group');
    }
  };

  // Join Group Handler
  const handleJoin = async (groupId) => {
    try {
      await API.put(`/thesis/groups/${groupId}/join`, { userId: user._id });
      alert('Joined successfully!');
      window.location.reload(); // Simple refresh to show updated state
    } catch (err) {
      alert('Could not join group');
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Thesis Collaboration</h1>

      {/* Create Group Form */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h3 className="font-bold">Create New Group</h3>
        <input 
          placeholder="Group Name" 
          className="border p-2 mr-2"
          onChange={(e) => setNewGroup({...newGroup, groupName: e.target.value})}
        />
        <button onClick={handleCreate} className="bg-green-600 text-white p-2 rounded">
          Create Group
        </button>
      </div>

      {/* List Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-bold">{group.groupName}</h3>
            <p><strong>Interests:</strong> {group.researchInterests.join(', ')}</p>
            <p><strong>Members:</strong> {group.members.length} / {group.maxMembers}</p>
            <button 
              onClick={() => handleJoin(group._id)}
              className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
            >
              Join Group
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThesisGroups;
