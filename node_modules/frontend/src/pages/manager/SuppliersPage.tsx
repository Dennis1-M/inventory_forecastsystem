import { Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, ConfirmModal, Input, Loading, Modal, Table, TextArea } from '../../components/ui';
import { useSuppliers } from '../../hooks';
import apiService from '../../services/api';

interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

const SuppliersPage: React.FC = () => {
  const { suppliers, loading, error, refetch } = useSuppliers();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<SupplierForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  // Filter suppliers
  const filteredSuppliers = (suppliers || []).filter((supplier: any) =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const handleSaveAdd = async () => {
    try {
      await apiService.post('/suppliers', formData);
      setShowAddModal(false);
      refetch?.();
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await apiService.put(`/suppliers/${selectedSupplier.id}`, formData);
      setShowEditModal(false);
      refetch?.();
    } catch (err) {
      console.error('Error updating supplier:', err);
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      await apiService.delete(`/suppliers/${selectedSupplier.id}`);
      setShowDeleteModal(false);
      refetch?.();
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Supplier Name', width: '25%' },
    { key: 'email', label: 'Email', width: '20%' },
    { key: 'phone', label: 'Phone', width: '15%' },
    { key: 'city', label: 'City', width: '15%' },
    { key: 'status', label: 'Status', width: '10%' },
    { key: 'actions', label: 'Actions', width: '15%' },
  ];

  const tableData = filteredSuppliers.map((supplier: any) => ({
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    city: supplier.city,
    status: <Badge label={supplier.status || 'Active'} variant="success" size="sm" />,
    actions: (
      <div className="flex items-center gap-2">
        <Button
          label=""
          variant="secondary"
          size="sm"
          icon={<Edit2 className="h-4 w-4" />}
          onClick={() => handleOpenEdit(supplier)}
        />
        <Button
          label=""
          variant="danger"
          size="sm"
          icon={<Trash2 className="h-4 w-4" />}
          onClick={() => handleOpenDelete(supplier)}
        />
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Supplier Management</h2>
          <p className="text-gray-600 mt-2">Manage and track your suppliers</p>
        </div>
        <Button
          label="Add Supplier"
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={handleOpenAdd}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div>
            <p className="text-gray-600 text-sm">Total Suppliers</p>
            <p className="text-2xl font-bold">{suppliers?.length || 0}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-gray-600 text-sm">Active Suppliers</p>
            <p className="text-2xl font-bold text-green-600">
              {(suppliers || []).filter((s: any) => s.status === 'Active' || !s.status).length}
            </p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-gray-600 text-sm">Inactive Suppliers</p>
            <p className="text-2xl font-bold text-amber-600">
              {(suppliers || []).filter((s: any) => s.status === 'Inactive').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardHeader title="Search Suppliers" />
        <CardBody>
          <Input
            label="Search by name, email, or phone"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader title="Suppliers List" subtitle="All registered suppliers" />
        <CardBody>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading suppliers: {error}</p>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No suppliers found</p>
            </div>
          ) : (
            <Table columns={tableColumns} data={tableData} />
          )}
        </CardBody>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} title="Add Supplier" onClose={() => setShowAddModal(false)}>
        <div className="space-y-4">
          <Input
            label="Supplier Name *"
            placeholder="Enter supplier name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email *"
            placeholder="supplier@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone *"
            placeholder="+254 712 345 678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <TextArea
            label="Address"
            placeholder="Enter supplier address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button label="Cancel" variant="secondary" onClick={() => setShowAddModal(false)} />
          <Button label="Add Supplier" variant="primary" onClick={handleSaveAdd} />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} title="Edit Supplier" onClose={() => setShowEditModal(false)}>
        <div className="space-y-4">
          <Input
            label="Supplier Name *"
            placeholder="Enter supplier name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email *"
            placeholder="supplier@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone *"
            placeholder="+254 712 345 678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <TextArea
            label="Address"
            placeholder="Enter supplier address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button label="Cancel" variant="secondary" onClick={() => setShowEditModal(false)} />
          <Button label="Save Changes" variant="primary" onClick={handleSaveEdit} />
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${selectedSupplier?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteSupplier}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default SuppliersPage;
