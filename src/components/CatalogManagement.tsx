import React, { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { dataService } from '../services/dataService';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price_kzt: string | number;
  currency: string;
  sku: string;
  stock_qty: number;
  unit?: string | null;
  min_order_qty?: number | null;
  discount_percent?: number | null;
  delivery_available: boolean;
  pickup_available: boolean;
  lead_time_days?: number | null;
  is_active: boolean;
  created_at?: string;
}

const CatalogManagement: React.FC = () => {
  const permissions = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price_kzt: '',
    currency: 'KZT',
    sku: '',
    stock_qty: 0,
    unit: 'pcs',
    min_order_qty: 1,
    discount_percent: 0,
    delivery_available: true,
    pickup_available: true,
    lead_time_days: 0,
    is_active: true,
  });

  const canManageProducts = permissions.canManageProducts;

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await dataService.getMyProducts(
        currentPage,
        20,
        statusFilter === 'all' ? undefined : statusFilter === 'active',
      );
      setProducts((response.items || []) as unknown as Product[]);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (canManageProducts) {
      loadProducts();
    }
  }, [loadProducts, canManageProducts]);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price_kzt: '',
      currency: 'KZT',
      sku: '',
      stock_qty: 0,
      unit: 'pcs',
      min_order_qty: 1,
      discount_percent: 0,
      delivery_available: true,
      pickup_available: true,
      lead_time_days: 0,
      is_active: true,
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price_kzt: product.price_kzt.toString(),
      currency: product.currency || 'KZT',
      sku: product.sku,
      stock_qty: product.stock_qty,
      unit: product.unit || 'pcs',
      min_order_qty: product.min_order_qty || 1,
      discount_percent: product.discount_percent || 0,
      delivery_available: product.delivery_available,
      pickup_available: product.pickup_available,
      lead_time_days: product.lead_time_days || 0,
      is_active: product.is_active,
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description || null,
        price_kzt: parseFloat(productForm.price_kzt),
        currency: productForm.currency,
        sku: productForm.sku,
        stock_qty: productForm.stock_qty,
        unit: productForm.unit || null,
        min_order_qty: productForm.min_order_qty || null,
        discount_percent: productForm.discount_percent > 0 ? productForm.discount_percent : null,
        delivery_available: productForm.delivery_available,
        pickup_available: productForm.pickup_available,
        lead_time_days: productForm.lead_time_days > 0 ? productForm.lead_time_days : null,
        is_active: productForm.is_active,
      };

      if (editingProduct) {
        await dataService.updateProduct(parseInt(editingProduct.id), productData);
        alert('Product updated successfully');
      } else {
        await dataService.createProduct(productData);
        alert('Product created successfully');
      }

      setShowProductForm(false);
      loadProducts();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error?.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this product? This action cannot be undone.',
      )
    ) {
      try {
        await dataService.deleteProduct(parseInt(productId));
        alert('Product deleted successfully');
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleDeactivateProduct = async (product: Product) => {
    try {
      await dataService.updateProduct(parseInt(product.id), {
        is_active: !product.is_active,
      });
      alert(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`);
      loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product status');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (!canManageProducts) {
    return (
      <div>
        <div className="header">
          <h1>Catalog Management</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>Catalog Management</h1>
        <p>Manage your product catalog and inventory</p>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Search products by name, SKU, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ flex: 1, minWidth: '300px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
            setCurrentPage(1);
          }}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button className="btn btn-primary" onClick={handleCreateProduct}>
          + Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            <form onSubmit={handleSaveProduct}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px',
                }}
              >
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    rows={3}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm({ ...productForm, sku: e.target.value })
                    }
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) =>
                      setProductForm({ ...productForm, unit: e.target.value })
                    }
                    style={{ width: '100%' }}
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="m">Meters (m)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="l">Liters (l)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (KZT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price_kzt}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price_kzt: e.target.value })
                    }
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    value={productForm.currency}
                    onChange={(e) =>
                      setProductForm({ ...productForm, currency: e.target.value })
                    }
                    maxLength={3}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock_qty}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stock_qty: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Min Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.min_order_qty}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        min_order_qty: parseInt(e.target.value) || 1,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={productForm.discount_percent}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discount_percent: parseFloat(e.target.value) || 0,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Lead Time (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.lead_time_days}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        lead_time_days: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.delivery_available}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          delivery_available: e.target.checked,
                        })
                      }
                      style={{ marginRight: '8px' }}
                    />
                    Delivery Available
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.pickup_available}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          pickup_available: e.target.checked,
                        })
                      }
                      style={{ marginRight: '8px' }}
                    />
                    Pickup Available
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={productForm.is_active}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          is_active: e.target.checked,
                        })
                      }
                      style={{ marginRight: '8px' }}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowProductForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Min Order</th>
                <th>Delivery/Pickup</th>
                <th>Lead Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                    {searchTerm
                      ? 'No products found matching your search'
                      : 'No products yet. Click "Add Product" to create your first product.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: '500' }}>
                      <div>{product.name}</div>
                      {product.description && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginTop: '4px',
                          }}
                        >
                          {product.description.length > 50
                            ? `${product.description.substring(0, 50)}...`
                            : product.description}
                        </div>
                      )}
                    </td>
                    <td>{product.sku}</td>
                    <td>
                      {product.discount_percent && product.discount_percent > 0 ? (
                        <div>
                          <div
                            style={{
                              textDecoration: 'line-through',
                              color: '#999',
                              fontSize: '12px',
                            }}
                          >
                            ₸{parseFloat(String(product.price_kzt)).toLocaleString()}
                          </div>
                          <div style={{ color: '#ef4444', fontWeight: '500' }}>
                            ₸
                            {(
                              parseFloat(String(product.price_kzt)) *
                              (1 - (product.discount_percent || 0) / 100)
                            ).toLocaleString()}
                            <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                              (-{product.discount_percent}%)
                            </span>
                          </div>
                        </div>
                      ) : (
                        `₸${parseFloat(String(product.price_kzt)).toLocaleString()}`
                      )}
                    </td>
                    <td>{product.stock_qty}</td>
                    <td>{product.unit || 'pcs'}</td>
                    <td>{product.min_order_qty || 1}</td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {product.delivery_available && (
                          <span style={{ color: '#10b981', marginRight: '8px' }}>
                            ✓ Delivery
                          </span>
                        )}
                        {product.pickup_available && (
                          <span style={{ color: '#3b82f6' }}>✓ Pickup</span>
                        )}
                        {!product.delivery_available && !product.pickup_available && (
                          <span style={{ color: '#999' }}>None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {product.lead_time_days
                        ? `${product.lead_time_days} day${product.lead_time_days !== 1 ? 's' : ''}`
                        : 'N/A'}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${product.is_active ? 'status-completed' : 'status-rejected'}`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleEditProduct(product)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDeactivateProduct(product)}
                          style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            color: product.is_active ? '#ff9800' : '#10b981',
                            borderColor: product.is_active ? '#ff9800' : '#10b981',
                          }}
                        >
                          {product.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            color: '#ef4444',
                            borderColor: '#ef4444',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', alignSelf: 'center' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogManagement;

