import React, { useState, useEffect } from 'react';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    category: 'food'
  });
  const [errors, setErrors] = useState({});

  const categories = ['food', 'travel', 'bills', 'entertainment', 'shopping', 'health', 'other'];

  // Load expenses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading expenses');
      }
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.note.trim()) {
      newErrors.note = 'Note is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExpense = () => {
    if (!validateForm()) return;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(formData.amount),
      date: formData.date,
      note: formData.note.trim(),
      category: formData.category,
      createdAt: new Date().toISOString()
    };

    setExpenses([newExpense, ...expenses]);
    resetForm();
  };

  const handleUpdateExpense = () => {
    if (!validateForm()) return;

    setExpenses(expenses.map(exp => 
      exp.id === editingId 
        ? { ...exp, amount: parseFloat(formData.amount), date: formData.date, note: formData.note.trim(), category: formData.category }
        : exp
    ));
    resetForm();
  };

  const handleDeleteExpense = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (confirmed) {
      const updatedExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      amount: expense.amount.toString(),
      date: expense.date,
      note: expense.note,
      category: expense.category
    });
    setIsAddingExpense(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      category: 'food'
    });
    setErrors({});
    setIsAddingExpense(false);
    setEditingId(null);
  };

  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      const categoryMatch = filterCategory === 'all' || exp.category === filterCategory;
      const monthMatch = filterMonth === 'all' || exp.date.substring(0, 7) === filterMonth;
      return categoryMatch && monthMatch;
    });
  };

  const getSummary = () => {
    const filtered = getFilteredExpenses();
    const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
    
    const byCategory = {};
    filtered.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    const byMonth = {};
    filtered.forEach(exp => {
      const month = exp.date.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + exp.amount;
    });

    return { total, byCategory, byMonth };
  };

  const summary = getSummary();
  const filteredExpenses = getFilteredExpenses();
  const availableMonths = [...new Set(expenses.map(e => e.date.substring(0, 7)))].sort().reverse();

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>💰 Personal Expense Tracker</h1>
              <p style={styles.subtitle}>Track and manage your expenses efficiently</p>
            </div>
            {!isAddingExpense && (
              <button onClick={() => setIsAddingExpense(true)} style={styles.btnPrimary}>
                ➕ Add Expense
              </button>
            )}
          </div>

          {/* Summary Cards */}
          <div style={styles.summaryGrid}>
            <div style={{...styles.summaryCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <p style={styles.summaryLabel}>Total Expenses</p>
              <p style={styles.summaryValue}>${summary.total.toFixed(2)}</p>
            </div>
            <div style={{...styles.summaryCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <p style={styles.summaryLabel}>Total Transactions</p>
              <p style={styles.summaryValue}>{filteredExpenses.length}</p>
            </div>
            <div style={{...styles.summaryCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <p style={styles.summaryLabel}>Categories</p>
              <p style={styles.summaryValue}>{Object.keys(summary.byCategory).length}</p>
            </div>
          </div>

          {/* Add/Edit Form */}
          {isAddingExpense && (
            <div style={styles.formSection}>
              <h3 style={styles.formTitle}>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{...styles.input, ...(errors.amount ? styles.inputError : {})}}
                    placeholder="0.00"
                  />
                  {errors.amount && <p style={styles.error}>{errors.amount}</p>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{...styles.input, ...(errors.date ? styles.inputError : {})}}
                  />
                  {errors.date && <p style={styles.error}>{errors.date}</p>}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.input}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Note</label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    style={{...styles.input, ...(errors.note ? styles.inputError : {})}}
                    placeholder="Enter expense note"
                  />
                  {errors.note && <p style={styles.error}>{errors.note}</p>}
                </div>
              </div>
              <div style={styles.btnGroup}>
                <button onClick={editingId ? handleUpdateExpense : handleAddExpense} style={styles.btnPrimary}>
                  💾 {editingId ? 'Update' : 'Save'}
                </button>
                <button onClick={resetForm} style={styles.btnSecondary}>
                  ✖ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={styles.filterSection}>
            <h3 style={styles.sectionTitle}>Filters</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Filter by Category</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={styles.input}>
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Filter by Month</label>
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={styles.input}>
                  <option value="all">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Reports */}
          {Object.keys(summary.byCategory).length > 0 && (
            <div style={styles.reportsGrid}>
              <div style={styles.reportCard}>
                <h3 style={styles.sectionTitle}>By Category</h3>
                {Object.entries(summary.byCategory).map(([cat, amount]) => (
                  <div key={cat} style={styles.reportItem}>
                    <span style={styles.reportLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    <span style={styles.reportValue}>${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={styles.reportCard}>
                <h3 style={styles.sectionTitle}>By Month</h3>
                {Object.entries(summary.byMonth).sort().reverse().map(([month, amount]) => (
                  <div key={month} style={styles.reportItem}>
                    <span style={styles.reportLabel}>
                      {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </span>
                    <span style={styles.reportValue}>${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div style={styles.card}>
          <h2 style={styles.listTitle}>Expense List</h2>
          {filteredExpenses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📄</div>
              <p style={styles.emptyText}>No expenses found</p>
              <p style={styles.emptySubtext}>Add your first expense to get started</p>
            </div>
          ) : (
            <div style={styles.expenseList}>
              {filteredExpenses.map(expense => (
                <div key={expense.id} style={styles.expenseItem}>
                  <div style={styles.expenseDetails}>
                    <div style={styles.expenseTop}>
                      <span style={styles.expenseAmount}>${expense.amount.toFixed(2)}</span>
                      <span style={styles.expenseCategory}>{expense.category}</span>
                    </div>
                    <div style={styles.expenseMeta}>
                      <span>📅 {new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span>📝 {expense.note}</span>
                    </div>
                  </div>
                  <div style={styles.expenseActions}>
                    <button onClick={() => startEdit(expense)} style={styles.btnEdit} title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteExpense(expense.id)} style={styles.btnDelete} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  maxWidth: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    padding: '30px',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    color: '#333',
    fontSize: '32px',
    marginBottom: '5px',
    margin: 0
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  btnPrimary: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    background: '#667eea',
    color: 'white',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnSecondary: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    background: '#e0e0e0',
    color: '#333',
    transition: 'all 0.3s'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  summaryCard: {
    color: 'white',
    padding: '20px',
    borderRadius: '12px'
  },
  summaryLabel: {
    fontSize: '14px',
    opacity: 0.9,
    marginBottom: '8px',
    margin: 0
  },
  summaryValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0
  },
  formSection: {
    background: '#f5f5f5',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '2px solid #667eea'
  },
  formTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border 0.3s',
    outline: 'none'
  },
  inputError: {
    borderColor: '#f44336'
  },
  error: {
    color: '#f44336',
    fontSize: '13px',
    marginTop: '5px',
    margin: 0
  },
  btnGroup: {
    display: 'flex',
    gap: '10px'
  },
  filterSection: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px'
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '18px'
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  reportCard: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '12px'
  },
  reportItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    marginBottom: '8px',
    background: 'white',
    borderRadius: '8px'
  },
  reportLabel: {
    color: '#666',
    textTransform: 'capitalize'
  },
  reportValue: {
    fontWeight: 'bold',
    color: '#667eea'
  },
  listTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '24px'
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    transition: 'all 0.3s'
  },
  expenseDetails: {
    flex: 1
  },
  expenseTop: {
    marginBottom: '10px'
  },
  expenseAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: '15px'
  },
  expenseCategory: {
    display: 'inline-block',
    padding: '6px 16px',
    background: '#667eea',
    color: 'white',
    borderRadius: '20px',
    fontSize: '13px',
    textTransform: 'capitalize'
  },
  expenseMeta: {
    display: 'flex',
    gap: '20px',
    color: '#666',
    fontSize: '14px'
  },
  expenseActions: {
    display: 'flex',
    gap: '8px'
  },
  btnEdit: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '20px',
    transition: 'all 0.2s'
  },
  btnDelete: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '20px',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '18px',
    marginBottom: '8px'
  },
  emptySubtext: {
    fontSize: '14px'
  }
};

export default ExpenseTracker;