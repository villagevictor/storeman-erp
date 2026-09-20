import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  Barcode,
  Building2,
  X,
  Boxes,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Material, MaterialUnit } from '../types';
import { formatCurrencyETB } from '../lib/whatsapp';

export const MaterialsView: React.FC = () => {
  const { materials, warehouses, addMaterial, updateMaterial, deleteMaterial, currentUser } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MaterialUnit>('Pcs');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [minThreshold, setMinThreshold] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');

  const openAddModal = () => {
    setEditingMaterial(null);
    setSku(`ET-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setUnit('Pcs');
    setUnitPrice('');
    setStockQuantity('');
    setMinThreshold('');
    setWarehouseId(warehouses[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (m: Material) => {
    setEditingMaterial(m);
    setSku(m.sku);
    setName(m.name);
    setUnit(m.unit);
    setUnitPrice(m.unit_price);
    setStockQuantity(m.stock_quantity);
    setMinThreshold(m.min_threshold);
    setWarehouseId(m.warehouse_id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || unitPrice === '' || stockQuantity === '' || minThreshold === '') return;

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, {
        sku: sku.trim(),
        name: name.trim(),
        unit,
        unit_price: Number(unitPrice),
        stock_quantity: Number(stockQuantity),
        min_threshold: Number(minThreshold),
        warehouse_id: warehouseId,
      });
    } else {
      addMaterial({
        sku: sku.trim(),
        name: name.trim(),
        unit,
        unit_price: Number(unitPrice),
        stock_quantity: Number(stockQuantity),
        min_threshold: Number(minThreshold),
        warehouse_id: warehouseId,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered List
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSku = skuFilter ? m.sku.toLowerCase().includes(skuFilter.toLowerCase()) : true;
      const matchWh = warehouseFilter === 'ALL' ? true : m.warehouse_id === warehouseFilter;
      const matchLow = lowStockOnly ? Number(m.stock_quantity) <= Number(m.min_threshold) : true;

      return matchSearch && matchSku && matchWh && matchLow;
    });
  }, [materials, searchQuery, skuFilter, warehouseFilter, lowStockOnly]);

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.permissions?.materials?.update;
  const canDelete = currentUser?.role === 'Admin' || currentUser?.permissions?.materials?.delete;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Materials & Inventory Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enterprise database of industrial items, barcode SKUs, safety thresholds, and valuation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search material name or barcode..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Warehouse Dropdown Filter */}
          <select
            value={warehouseFilter}
            onChange={e => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-700"
          >
            <option value="ALL">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
              lowStockOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock Alert ({materials.filter(m => m.stock_quantity <= m.min_threshold).length})</span>
          </button>
        </div>
      </div>

      {/* Materials Datagrid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Unit Price (ETB)</th>
                <th className="py-3 px-4 text-right">Stock Quantity</th>
                <th className="py-3 px-4 text-right">Min Threshold</th>
                <th className="py-3 px-4 text-right">Total Valuation (ETB)</th>
                <th className="py-3 px-4">Warehouse Depot</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No materials matching search parameters found.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(m => {
                  const isLow = Number(m.stock_quantity) <= Number(m.min_threshold);
                  const isZero = Number(m.stock_quantity) === 0;
                  const warehouse = warehouses.find(w => w.id === m.warehouse_id);
                  const valuation = Number(m.stock_quantity) * Number(m.unit_price);

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{m.sku}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[240px]">
                        <div>{m.name}</div>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            {isZero ? 'Out of Stock' : 'Low Stock Level'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-xs">
                          {m.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {formatCurrencyETB(m.unit_price)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black text-sm ${
                            isZero
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {m.stock_quantity.toLocaleString()} {m.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {m.min_threshold} {m.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {formatCurrencyETB(valuation)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{warehouse?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(m)}
                            disabled={!canEdit}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-30"
                            title="Edit Material"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete material "${m.name}" (${m.sku})?`)) {
                                deleteMaterial(m.id);
                              }
                            }}
                            disabled={!canDelete}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 my-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingMaterial ? 'Update Catalog Material' : 'Catalog New Industrial Material'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="ET-STL-012"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as MaterialUnit)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Kg">Kg (Kilograms)</option>
                    <option value="Bag">Bag (Bags / Sacks)</option>
                    <option value="Meter">Meter (Meters)</option>
                    <option value="Litre">Litre (Litres)</option>
                    <option value="Box">Box (Boxes)</option>
                    <option value="Roll">Roll (Rolls / Coils)</option>
                    <option value="Carton">Carton (Cartons)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name & Spec</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Deformed Reinforcement Rebar Steel 12mm x 12m"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1850.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={minThreshold}
                    onChange={e => setMinThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Depot</label>
                <select
                  value={warehouseId}
                  onChange={e => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-semibold text-xs shadow-sm"
                >
                  {editingMaterial ? 'Save Changes' : 'Catalog Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
