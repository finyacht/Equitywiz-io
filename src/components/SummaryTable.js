import { useWaterfall } from '../utils/WaterfallContext';
import { formatCurrency } from '../utils/waterfallCalculator';

const SummaryTable = () => {
  const { summaryData, exitAmount } = useWaterfall();
  
  return (
    <div>
      <h3>Distribution Summary</h3>
      <div className="overflow-auto">
        <table>
          <thead>
            <tr>
              <th>Share Class</th>
              <th>Amount ($)</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((result, index) => (
              <tr key={index}>
                <td>{result.name}</td>
                <td>{formatCurrency(result.payout)}</td>
                <td>{result.percentage}%</td>
              </tr>
            ))}
            
            <tr className="font-bold">
              <td>Total</td>
              <td>{formatCurrency(exitAmount)}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTable; 