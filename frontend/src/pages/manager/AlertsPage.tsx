import { CheckCircle, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, EmptyState, Loading, Table } from '../../components/ui';
import { useAlerts } from '../../hooks';

const AlertsPage: React.FC = () => {
  const { alerts, loading, error, resolveAlert, refetch } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'expiry' | 'pending'>('all');

  // Filter alerts
  const filteredAlerts = (alerts || []).filter((alert: any) => {
    if (filterType === 'all') return true;
    if (filterType === 'pending') return alert.status === 'pending' || !alert.status;
    return alert.type?.toLowerCase() === filterType.toLowerCase();
  });

  const getUrgencyBadge = (urgency: string) => {
    if (urgency?.toLowerCase() === 'critical') {
      return <Badge label="Critical" variant="danger" size="sm" />;
    } else if (urgency?.toLowerCase() === 'high') {
      return <Badge label="High" variant="warning" size="sm" />;
    } else {
      return <Badge label="Medium" variant="primary" size="sm" />;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type?.toLowerCase() === 'low-stock') {
      return <Badge label="Low Stock" variant="warning" size="sm" />;
    } else if (type?.toLowerCase() === 'expiry') {
      return <Badge label="Expiry Alert" variant="danger" size="sm" />;
    } else {
      return <Badge label={type || 'Alert'} variant="primary" size="sm" />;
    }
  };

  const handleResolve = () => {
    if (selectedAlert && resolveAlert) {
      resolveAlert(selectedAlert.id);
      setShowResolveModal(false);
      setSelectedAlert(null);
      // Refresh the list
      refetch?.();
    }
  };

  const tableColumns = [
    { key: 'type', label: 'Alert Type', width: '20%' },
    { key: 'productName', label: 'Product', width: '25%' },
    { key: 'urgency', label: 'Urgency', width: '15%' },
    { key: 'createdAt', label: 'Created', width: '20%' },
    { key: 'actions', label: 'Actions', width: '20%' },
  ];

  const tableData = filteredAlerts.map((alert: any) => ({
    type: getTypeBadge(alert.type),
    productName: alert.productName || alert.product?.name || 'Unknown Product',
    urgency: getUrgencyBadge(alert.urgency || alert.severity),
    createdAt: alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A',
    actions: (
      <div className="flex items-center gap-2">
        <Button
          label="Resolve"
          variant="success"
          size="sm"
          icon={<CheckCircle className="h-4 w-4" />}
          onClick={() => {
            setSelectedAlert(alert);
            setShowResolveModal(true);
          }}
        />
      </div>
    ),
  }));

  const stats = {
    totalAlerts: alerts?.length || 0,
    criticalCount: (alerts || []).filter((a: any) => a.urgency?.toLowerCase() === 'critical' || a.severity?.toLowerCase() === 'critical').length,
    pendingCount: (alerts || []).filter((a: any) => !a.status || a.status === 'pending').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Alerts Management</h2>
          <p className="text-gray-600 mt-2">Monitor and resolve system alerts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold">{stats.totalAlerts}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-8">
        <CardHeader title="Filter Alerts" />
        <CardBody>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'low-stock', 'expiry'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader
          title="Active Alerts"
          subtitle="Review and manage all system alerts"
          action={
            <Button
              label="Refresh"
              variant="secondary"
              icon={<Clock className="h-4 w-4" />}
              size="sm"
              onClick={() => refetch?.()}
            />
          }
        />
        <CardBody>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading alerts: {error}</p>
            </div>
          ) : tableData.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Alerts"
              description="All systems are operating normally. No alerts to display."
            />
          ) : (
            <Table columns={tableColumns} data={tableData} />
          )}
        </CardBody>
      </Card>

      {/* Resolve Modal */}
      <ConfirmModal
        isOpen={showResolveModal}
        title="Resolve Alert"
        message={`Are you sure you want to resolve this alert? (${selectedAlert?.productName || 'Product'})`}
        confirmLabel="Resolve"
        cancelLabel="Cancel"
        variant="success"
        onConfirm={handleResolve}
        onCancel={() => {
          setShowResolveModal(false);
          setSelectedAlert(null);
        }}
      />
    </div>
  );
};

export default AlertsPage;