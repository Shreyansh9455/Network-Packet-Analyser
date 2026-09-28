import React, { useState, useEffect } from 'react';
import PacketTable from '../components/PacketTable';
import PacketDetailsModal from '../components/PacketDetailsModal';
import packetApi from '../api/packetApi';
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

export default function PacketHistory() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPacket, setSelectedPacket] = useState(null);

  // Filter States
  const [protocol, setProtocol] = useState('');
  const [srcIP, setSrcIP] = useState('');
  const [dstIP, setDstIP] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadPackets = async (currentPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit,
        protocol: protocol || undefined,
        srcIP: srcIP.trim() || undefined,
        dstIP: dstIP.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await packetApi.getPackets(params);
      if (res.success) {
        setPackets(res.packets);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching packets history:', err);
      setError(err.message || 'Failed to fetch packet records from server.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes (reset page to 1)
  useEffect(() => {
    setPage(1);
    loadPackets(1);
  }, [protocol, srcIP, dstIP, startDate, endDate, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadPackets(newPage);
  };

  const handleResetFilters = () => {
    setProtocol('');
    setSrcIP('');
    setDstIP('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Packet History & Search</h1>
          <p className="page-subtitle">
            Query, filter, and inspect stored network traffic frames across historical capture sessions
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => loadPackets(page)} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Error Alert Box with Retry */}
      {error && (
        <div className="error-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#f43f5e" />
            <div>
              <strong>Failed to Load History: </strong>
              <span>{error}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => loadPackets(page)}>
            Retry Query
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-panel-grid">
          {/* Protocol Filter */}
          <div className="filter-input-wrap">
            <label className="filter-label">Protocol</label>
            <select
              className="select-field"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
            >
              <option value="">All Protocols</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="DNS">DNS</option>
              <option value="ICMP">ICMP</option>
              <option value="ARP">ARP</option>
            </select>
          </div>

          {/* Source IP Filter */}
          <div className="filter-input-wrap">
            <label className="filter-label">Source IP</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 192.168.1.1"
              value={srcIP}
              onChange={(e) => setSrcIP(e.target.value)}
            />
          </div>

          {/* Destination IP Filter */}
          <div className="filter-input-wrap">
            <label className="filter-label">Destination IP</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 8.8.8.8"
              value={dstIP}
              onChange={(e) => setDstIP(e.target.value)}
            />
          </div>

          {/* Start Date */}
          <div className="filter-input-wrap">
            <label className="filter-label">From Date</label>
            <input
              type="datetime-local"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="filter-input-wrap">
            <label className="filter-label">To Date</label>
            <input
              type="datetime-local"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Reset Filters Button */}
          <div className="filter-input-wrap" style={{ justifyContent: 'flex-end', display: 'flex', flexDirection: 'column' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters} style={{ height: '38px' }}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Packet Table Card */}
      <div className="glass-card">
        <PacketTable
          packets={packets}
          loading={loading}
          emptyMessage="No packets found matching your query criteria. Try clearing filters or starting a new capture session."
          onSelectPacket={(pkt) => setSelectedPacket(pkt)}
        />

        {/* Pagination Footer */}
        <div className="pagination">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Showing <strong>{packets.length}</strong> of <strong>{pagination.total || 0}</strong> packets
            {pagination.totalPages > 1 && ` • Page ${page} of ${pagination.totalPages}`}
          </div>

          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-sm"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span className="pagination-page-indicator">{page}</span>

            <button
              className="btn btn-secondary btn-sm"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => handlePageChange(page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Packet Details Modal */}
      {selectedPacket && (
        <PacketDetailsModal
          packet={selectedPacket}
          onClose={() => setSelectedPacket(null)}
        />
      )}
    </div>
  );
}
