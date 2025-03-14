import { useWaterfall } from '../utils/WaterfallContext';

const ExitAmountInput = () => {
  const { exitAmount, setExitAmount } = useWaterfall();
  
  const handleExitAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setExitAmount(value);
  };
  
  return (
    <div>
      <label htmlFor="exitAmount">Exit Amount ($)</label>
      <input 
        id="exitAmount" 
        type="number" 
        min="0" 
        value={exitAmount}
        onChange={handleExitAmountChange}
      />
    </div>
  );
};

export default ExitAmountInput; 