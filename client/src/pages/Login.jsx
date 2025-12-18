import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mt-4">
        <input 
          type="email" placeholder="Email" 
          className="border p-2"
          onChange={(e) => setForm({...form, email: e.target.value})} 
        />
        <input 
          type="password" placeholder="Password" 
          className="border p-2"
          onChange={(e) => setForm({...form, password: e.target.value})} 
        />
        <button className="bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;
