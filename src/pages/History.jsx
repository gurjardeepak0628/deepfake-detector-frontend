import React, { useState, useEffect } from 'react';
import API from '../utils/api';

function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/history')
      .then(res => setRecords(res.data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const total = records.length;
  const fakes = records.filter(r => r.prediction === 'FAKE').length;
  const reals = records.filter(r => r.prediction === 'REAL').length;

  const formatDate = (dt) => new Date(dt).toLocaleString();

  return (
    <div className="page-container">
      <h1 className="page-title">📋 Detection History</h1>
      <p className="page-subtitle">All your past deepfake detection results.</p>

      <div className="stats-row">
        <div className="stats-card">
          <div className="num color-purple">{total}</div>
          <div className="lbl">Total scans</div>
        </div>
        <div className="stats-card">
          <div className="num color-red">{fakes}</div>
          <div className="lbl">Deepfakes found</div>
        </div>
        <div className="stats-card">
          <div className="num color-green">{reals}</div>
          <div className="lbl">Real files</div>
        </div>
        <div className="stats-card">
          <div className="num color-purple">
            {total > 0 ? Math.round((fakes / total) * 100) : 0}%
          </div>
          <div className="lbl">Fake rate</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          Loading history...
        </div>
      ) : records.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <div className="icon">📂</div>
            <p>No detections yet. Upload a file to get started.</p>
          </div>
        </div>
      ) : (
        <div className="table-card">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File name</th>
                <th>Type</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Time taken</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: '#4b5563' }}>{i + 1}</td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.filename}
                  </td>
                  <td style={{ textTransform: 'uppercase', fontSize: '12px', color: '#6b7280' }}>
                    {r.file_type}
                  </td>
                  <td>
                    <span className={`badge badge-${r.prediction.toLowerCase()}`}>
                      {r.prediction === 'FAKE' ? '⚠️ ' : '✅ '}{r.prediction}
                    </span>
                  </td>
                  <td>{r.confidence}%</td>
                  <td>{r.detection_time}s</td>
                  <td style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
