import { useState } from 'react';
import { useWaterfall } from '../utils/WaterfallContext';

const ShareClassTable = () => {
  const { 
    shareClasses, 
    addShareClass, 
    updateShareClass, 
    deleteShareClass 
  } = useWaterfall();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newShareClass, setNewShareClass] = useState({
    name: '',
    type: 'preferred',
    seniority: 1,
    liquidationPref: 1,
    prefType: 'participating',
    cap: null
  });
  
  // Handle input change for new share class
  const handleNewShareClassChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cap') {
      setNewShareClass({
        ...newShareClass,
        [name]: value === '' ? null : parseFloat(value)
      });
    } else if (name === 'seniority' || name === 'liquidationPref') {
      setNewShareClass({
        ...newShareClass,
        [name]: parseFloat(value)
      });
    } else {
      setNewShareClass({
        ...newShareClass,
        [name]: value
      });
    }
  };
  
  // Handle input change for existing share class
  const handleShareClassChange = (id, field, value) => {
    const updates = {};
    
    if (field === 'cap') {
      updates[field] = value === '' ? null : parseFloat(value);
    } else if (field === 'seniority' || field === 'liquidationPref') {
      updates[field] = parseFloat(value);
    } else {
      updates[field] = value;
    }
    
    updateShareClass(id, updates);
  };
  
  // Add new share class
  const handleAddShareClass = () => {
    if (newShareClass.name.trim() === '') return;
    
    addShareClass(newShareClass);
    setNewShareClass({
      name: '',
      type: 'preferred',
      seniority: 1,
      liquidationPref: 1,
      prefType: 'participating',
      cap: null
    });
    setIsAdding(false);
  };
  
  // Cancel adding new share class
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewShareClass({
      name: '',
      type: 'preferred',
      seniority: 1,
      liquidationPref: 1,
      prefType: 'participating',
      cap: null
    });
  };
  
  return (
    <div className="card">
      <div className="space-between">
        <h2>Share Classes</h2>
        <button 
          className="primary" 
          onClick={() => setIsAdding(true)}
        >
          + Add Share Class
        </button>
      </div>
      
      <div className="overflow-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Seniority</th>
              <th>Liquidation Pref</th>
              <th>Pref Type</th>
              <th>Cap</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shareClasses.map(sc => (
              <tr key={sc.id}>
                <td>
                  <input 
                    type="text" 
                    value={sc.name} 
                    onChange={(e) => handleShareClassChange(sc.id, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <select 
                    value={sc.type} 
                    onChange={(e) => handleShareClassChange(sc.id, 'type', e.target.value)}
                  >
                    <option value="preferred">Preferred</option>
                    <option value="common">Common</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    min="1" 
                    value={sc.seniority} 
                    onChange={(e) => handleShareClassChange(sc.id, 'seniority', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="1" 
                    step="0.1" 
                    value={sc.liquidationPref} 
                    onChange={(e) => handleShareClassChange(sc.id, 'liquidationPref', e.target.value)}
                    style={{ display: sc.type === 'preferred' ? 'block' : 'none' }}
                  />
                </td>
                <td>
                  <select 
                    value={sc.prefType} 
                    onChange={(e) => handleShareClassChange(sc.id, 'prefType', e.target.value)}
                    style={{ display: sc.type === 'preferred' ? 'block' : 'none' }}
                  >
                    <option value="non-participating">Non-Part.</option>
                    <option value="participating">Part.</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    value={sc.cap || ''} 
                    placeholder="No cap"
                    onChange={(e) => handleShareClassChange(sc.id, 'cap', e.target.value)}
                    style={{ 
                      display: sc.type === 'preferred' && sc.prefType === 'participating' 
                        ? 'block' 
                        : 'none' 
                    }}
                  />
                </td>
                <td>
                  <button 
                    className="delete" 
                    onClick={() => deleteShareClass(sc.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            
            {isAdding && (
              <tr className="editing-row">
                <td>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Series A"
                    value={newShareClass.name} 
                    onChange={handleNewShareClassChange}
                  />
                </td>
                <td>
                  <select 
                    name="type"
                    value={newShareClass.type} 
                    onChange={handleNewShareClassChange}
                  >
                    <option value="preferred">Preferred</option>
                    <option value="common">Common</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    name="seniority"
                    min="1" 
                    value={newShareClass.seniority} 
                    onChange={handleNewShareClassChange}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    name="liquidationPref"
                    min="1" 
                    step="0.1" 
                    value={newShareClass.liquidationPref} 
                    onChange={handleNewShareClassChange}
                    style={{ 
                      display: newShareClass.type === 'preferred' ? 'block' : 'none' 
                    }}
                  />
                </td>
                <td>
                  <select 
                    name="prefType"
                    value={newShareClass.prefType} 
                    onChange={handleNewShareClassChange}
                    style={{ 
                      display: newShareClass.type === 'preferred' ? 'block' : 'none' 
                    }}
                  >
                    <option value="non-participating">Non-Part.</option>
                    <option value="participating">Part.</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    name="cap"
                    min="0" 
                    step="0.1" 
                    value={newShareClass.cap || ''} 
                    placeholder="No cap"
                    onChange={handleNewShareClassChange}
                    style={{ 
                      display: newShareClass.type === 'preferred' && 
                              newShareClass.prefType === 'participating' 
                        ? 'block' 
                        : 'none' 
                    }}
                  />
                </td>
                <td className="action-buttons">
                  <button 
                    className="save" 
                    onClick={handleAddShareClass}
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

export default ShareClassTable; 