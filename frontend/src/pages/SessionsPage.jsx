import React, { useState, useEffect } from 'react';
import { Layers, Clock, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { fetchSessions } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetchSessions();
      if (res.success) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch capture sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const calculateDuration = (start, end) => {
    if (!start) return '-';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const seconds = Math.floor((endTime - startTime) / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  };

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#38bdf8" />
              Capture Sessions History
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              All packet capture sessions recorded in MongoDB
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadSessions}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="packet-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Session ID</th>
                <th>Network Interface</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Total Packets</th>
              </tr>
            </thead>
            <tbody>
              {loading && sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No capture sessions found. Start a capture on the Dashboard or run the seed script.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess._id}>
                    <td>
                      <span className="status-pill" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        <span className={`status-dot ${sess.status === 'running' ? 'active' : 'stopped'}`} />
                        <span style={{ textTransform: 'uppercase', color: sess.status === 'running' ? '#10b981' : '#9ca3af' }}>
                          {sess.status}
                        </span>
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                      {sess._id}
                    </td>
                    <td>{sess.networkInterface || 'eth0'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af' }}>
                      {new Date(sess.startTime).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af' }}>
                      {sess.endTime ? new Date(sess.endTime).toLocaleString() : 'Active (Running)'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {calculateDuration(sess.startTime, sess.endTime)}
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {sess.totalPackets || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
