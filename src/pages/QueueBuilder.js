import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QueueBuilder.css';

const QueueBuilder = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Fetch queues from API
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch queues
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreateQueue = () => {
    // TODO: Implement queue creation
  };

  const handleEditQueue = (queueId) => {
    // TODO: Implement queue editing
  };

  const handleDeleteQueue = (queueId) => {
    // TODO: Implement queue deletion
  };

  if (loading) {
    return <div className="queue-builder-loading">Loading...</div>;
  }

  if (error) {
    return <div className="queue-builder-error">Error: {error}</div>;
  }

  return (
    <div className="queue-builder-container">
      <div className="queue-builder-header">
        <h1>Queue Builder</h1>
        <button 
          className="create-queue-button"
          onClick={handleCreateQueue}
        >
          Create New Queue
        </button>
      </div>

      <div className="queues-list">
        {queues.length === 0 ? (
          <div className="no-queues-message">
            No queues found. Create your first queue to get started.
          </div>
        ) : (
          <div className="queues-grid">
            {queues.map((queue) => (
              <div key={queue.id} className="queue-card">
                <h3>{queue.name}</h3>
                <p>{queue.description}</p>
                <div className="queue-actions">
                  <button onClick={() => handleEditQueue(queue.id)}>Edit</button>
                  <button onClick={() => handleDeleteQueue(queue.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueBuilder; 