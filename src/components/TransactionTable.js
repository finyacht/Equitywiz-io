import { useState } from 'react';
import { useWaterfall } from '../utils/WaterfallContext';

const TransactionTable = () => {
  const { 
    shareClasses, 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction 
  } = useWaterfall();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    shareClass: '',
    shares: 0,
    investment: 0
  });
  
  // Handle input change for new transaction
  const handleNewTransactionChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'shares' || name === 'investment') {
      setNewTransaction({
        ...newTransaction,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewTransaction({
        ...newTransaction,
        [name]: value
      });
    }
  };
  
  // Handle input change for existing transaction
  const handleTransactionChange = (id, field, value) => {
    const updates = {};
    
    if (field === 'shares' || field === 'investment') {
      updates[field] = parseFloat(value) || 0;
    } else {
      updates[field] = value;
    }
    
    updateTransaction(id, updates);
  };
  
  // Add new transaction
  const handleAddTransaction = () => {
    if (newTransaction.shareClass === '') return;
    
    addTransaction(newTransaction);
    setNewTransaction({
      shareClass: '',
      shares: 0,
      investment: 0
    });
    setIsAdding(false);
  };
  
  // Cancel adding new transaction
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTransaction({
      shareClass: '',
      shares: 0,
      investment: 0
    });
  };
  
  return (
    <div className="card">
      <div className="space-between">
        <h2>Transactions</h2>
        <button 
          className="primary" 
          onClick={() => setIsAdding(true)}
          disabled={shareClasses.length === 0}
        >
          + Add Transaction
        </button>
      </div>
      
      <div className="overflow-auto">
        <table>
          <thead>
            <tr>
              <th>Share Class</th>
              <th>Shares</th>
              <th>Investment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>
                  <select 
                    value={tx.shareClass} 
                    onChange={(e) => handleTransactionChange(tx.id, 'shareClass', e.target.value)}
                  >
                    {shareClasses.map(sc => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    value={tx.shares} 
                    onChange={(e) => handleTransactionChange(tx.id, 'shares', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    value={tx.investment} 
                    onChange={(e) => handleTransactionChange(tx.id, 'investment', e.target.value)}
                  />
                </td>
                <td>
                  <button 
                    className="delete" 
                    onClick={() => deleteTransaction(tx.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            
            {isAdding && (
              <tr className="editing-row">
                <td>
                  <select 
                    name="shareClass"
                    value={newTransaction.shareClass} 
                    onChange={handleNewTransactionChange}
                  >
                    <option value="">Select Class</option>
                    {shareClasses.map(sc => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    name="shares"
                    min="0" 
                    value={newTransaction.shares} 
                    onChange={handleNewTransactionChange}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    name="investment"
                    min="0" 
                    value={newTransaction.investment} 
                    onChange={handleNewTransactionChange}
                  />
                </td>
                <td className="action-buttons">
                  <button 
                    className="save" 
                    onClick={handleAddTransaction}
                    disabled={newTransaction.shareClass === ''}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel" 
                    onClick={handleCancelAdd}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable; 