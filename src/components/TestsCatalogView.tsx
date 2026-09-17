/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Beaker,
  PlusCircle,
  IndianRupee,
  Shield,
  FileCheck2,
  Trash2,
  ListFilter,
  X
} from 'lucide-react';
import { TestTemplate, TestParameter } from '../types';

interface TestsCatalogViewProps {
  tests: TestTemplate[];
  onAddTest: (test: TestTemplate) => void;
  onDeleteTest: (id: string) => void;
  t: any;
}

export default function TestsCatalogView({
  tests,
  onAddTest,
  onDeleteTest,
  t
}: TestsCatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreating, setIsCreating] = useState(false);

  // Custom Test fields
  const [testId, setTestId] = useState('');
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState('Biochemistry');
  const [price, setPrice] = useState<number>(500);
  const [sampleType, setSampleType] = useState('Serum');
  const [turnaroundTime, setTurnaroundTime] = useState('12 Hours');

  // Parameters
  const [parameters, setParameters] = useState<TestParameter[]>([
    { name: '', unit: '', maleRange: '', femaleRange: '', generalRange: '', minNormal: 0, maxNormal: 100 }
  ]);

  const categories = ['All', 'Hematology', 'Biochemistry', 'Hormones', 'Vitamins', 'Urinalysis', 'Serology', 'Molecular Biology'];

  const addParameterRow = () => {
    setParameters([...parameters, { name: '', unit: '', maleRange: '', femaleRange: '', generalRange: '', minNormal: 0, maxNormal: 100 }]);
  };

  const removeParameterRow = (index: number) => {
    if (parameters.length === 1) return;
    setParameters(parameters.filter((_, idx) => idx !== index));
  };

  const handleParameterChange = (index: number, field: keyof TestParameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const resetForm = () => {
    setTestId('');
    setTestName('');
    setCategory('Biochemistry');
    setPrice(500);
    setSampleType('Serum');
    setTurnaroundTime('12 Hours');
    setParameters([{ name: '', unit: '', maleRange: '', femaleRange: '', generalRange: '', minNormal: 0, maxNormal: 100 }]);
    setIsCreating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testId) {
      alert('Test ID and Test Name are required.');
      return;
    }

    // Validate parameters are filled
    const validParams = parameters.filter(p => p.name !== '');
    if (validParams.length === 0) {
      alert('Please define at least one test parameter (e.g., Hemoglobin).');
      return;
    }

    const newTest: TestTemplate = {
      id: testId.toUpperCase().replace(/\s+/g, '_'),
      name: testName,
      category,
      price,
      sampleType,
      turnaroundTime,
      parameters: validParams
    };

    onAddTest(newTest);
    resetForm();
  };

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="tests-catalog-view">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="tests-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.tests}</h2>
          <p className="text-sm text-slate-500">Configure catalog directory pricing, turnaround times, and reference ranges.</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            id="btn-create-test"
          >
            <PlusCircle size={18} />
            Create Custom Test
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6" id="create-test-form-container">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Custom Pathology Test Panel</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="form-create-test">
            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unique Test ID / Abbreviation *</label>
                <input
                  type="text"
                  required
                  value={testId}
                  onChange={e => setTestId(e.target.value)}
                  placeholder="e.g. HBA1C, LFT, VITD"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Panel Name *</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  placeholder="e.g. Glycated Hemoglobin (HbA1c)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Specialty Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-blue-500"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Retail Price (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={e => setPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Required Sample Type *</label>
                <input
                  type="text"
                  required
                  value={sampleType}
                  onChange={e => setSampleType(e.target.value)}
                  placeholder="e.g. Serum, Whole Blood, Swab"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Turnaround (TAT) *</label>
                <input
                  type="text"
                  required
                  value={turnaroundTime}
                  onChange={e => setTurnaroundTime(e.target.value)}
                  placeholder="e.g. 12 Hours, 24 Hours, 3 Days"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Test Parameters Definitions Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">Define Panel Parameters (Ranges & Units)</h4>
                <button
                  type="button"
                  onClick={addParameterRow}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 hover:underline"
                >
                  + Add Parameter Row
                </button>
              </div>

              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl relative" id={`param-row-${index}`}>
                    {/* Param Name */}
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Parameter Name (e.g. Hemoglobin)"
                        value={param.name}
                        onChange={e => handleParameterChange(index, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <input
                        type="text"
                        placeholder="Unit (e.g. g/dL)"
                        value={param.unit}
                        onChange={e => handleParameterChange(index, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Male range */}
                    <div>
                      <input
                        type="text"
                        placeholder="Male range (13-17)"
                        value={param.maleRange}
                        onChange={e => handleParameterChange(index, 'maleRange', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Female range */}
                    <div>
                      <input
                        type="text"
                        placeholder="Female range (12-15)"
                        value={param.femaleRange}
                        onChange={e => handleParameterChange(index, 'femaleRange', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Min Numeric Normal (for highlight validation) */}
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        step="any"
                        placeholder="Min Normal"
                        value={param.minNormal}
                        onChange={e => handleParameterChange(index, 'minNormal', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[10px] bg-white focus:outline-hidden"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Max Normal"
                        value={param.maxNormal}
                        onChange={e => handleParameterChange(index, 'maxNormal', parseFloat(e.target.value) || 100)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[10px] bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Remove Action */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        disabled={parameters.length === 1}
                        onClick={() => removeParameterRow(index)}
                        className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
              >
                Save Custom Test
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Search Filters & Catalog Display */}
      {!isCreating && (
        <div className="space-y-4" id="catalog-main-content">
          {/* Category Filter tabs & Search Row */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center gap-4 justify-between" id="catalog-filters">
            {/* Horizontal Categorization Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" id="category-scroller">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search filter within catalog */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search catalog by name/ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="test-cards-grid">
            {filteredTests.map(test => (
              <div key={test.id} className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between relative group" id={`test-card-${test.id}`}>
                {/* Delete trigger for user created templates */}
                {['CBC', 'FBS', 'HBA1C', 'LIPID', 'LFT', 'KFT', 'THYROID', 'VITD', 'VITB12', 'URINE', 'DENGUE', 'COVID19'].indexOf(test.id) === -1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Do you wish to delete test panel "${test.name}"?`)) {
                        onDeleteTest(test.id);
                      }
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete custom test template"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                <div className="space-y-3">
                  {/* Category Pill & ID */}
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">{test.category}</span>
                    <span className="text-[10px] font-bold font-mono text-slate-400">{test.id}</span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">{test.name}</h3>

                  {/* Pricing and sample details */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-2.5 rounded-lg text-[11px] text-slate-500 font-medium">
                    <div className="space-y-0.5">
                      <span className="block text-[9px] text-slate-400 uppercase">Sample Needed</span>
                      <span className="text-slate-700 font-semibold">{test.sampleType}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[9px] text-slate-400 uppercase">Turnaround Time</span>
                      <span className="text-slate-700 font-semibold">{test.turnaroundTime}</span>
                    </div>
                  </div>

                  {/* List parameters short description */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Parameters Included ({test.parameters.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {test.parameters.map((param, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {param.name} {param.unit ? `(${param.unit})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100/80 pt-3 mt-4 flex items-center justify-between">
                  <span className="text-blue-600 font-extrabold text-sm flex items-center"><IndianRupee size={12} /> {test.price}</span>
                  <span className="text-[10px] text-slate-400 font-medium italic inline-flex items-center gap-1">
                    <FileCheck2 size={11} /> High Precision Analyzed
                  </span>
                </div>
              </div>
            ))}

            {filteredTests.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-slate-100 rounded-2xl">
                No diagnostic test records match your query. Click "Create Custom Test" to expand.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
