import React, { useState } from 'react';
import apiService from '../services/apiService';

const TestPBX = () => {
  const [extension, setExtension] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiService.pbx.extensions.create({
        extension,
        name,
        password
      });
      setResult(response.data);
      console.log('PBX extension created:', response.data);
    } catch (err) {
      setError(err.message || 'Failed to create PBX extension');
      console.error('Error creating PBX extension:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Test PBX Extension Creation</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Extension:</label>
          <input
            type="text"
            value={extension}
            onChange={(e) => setExtension(e.target.value)}
            placeholder="e.g., 1010"
            required
          />
        </div>
        
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Agent Test"
            required
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Extension'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '10px' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestPBX; 