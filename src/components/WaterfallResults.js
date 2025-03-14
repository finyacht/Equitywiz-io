import ExitAmountInput from './ExitAmountInput';
import CombinedChart from './CombinedChart';
import SummaryTable from './SummaryTable';
import ExitDistributionChart from './ExitDistributionChart';

const WaterfallResults = () => {
  return (
    <div className="card">
      <div className="space-between">
        <h2>Waterfall Results</h2>
        <ExitAmountInput />
      </div>
      
      {/* Combined Distribution Chart */}
      <CombinedChart />
      
      {/* Summary Table */}
      <SummaryTable />
      
      {/* Exit Value Distribution Chart */}
      <ExitDistributionChart />
    </div>
  );
};

export default WaterfallResults; 