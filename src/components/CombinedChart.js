import { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useWaterfall } from '../utils/WaterfallContext';
import { getDistributionTypeColor } from '../utils/waterfallCalculator';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CombinedChart = () => {
  const { summaryData, exitAmount, waterfallSteps, shareClasses } = useWaterfall();
  const chartRef = useRef(null);
  
  // Group steps by share class and distribution type
  const getChartData = () => {
    if (!summaryData.length) return { labels: [], datasets: [] };
    
    const shareClassSteps = {};
    waterfallSteps.forEach(step => {
      if (step.shareClass && !step.isStarting && !step.isFinal) {
        if (!shareClassSteps[step.shareClass]) {
          shareClassSteps[step.shareClass] = {
            'Liquidation Preference': 0,
            'Participation': 0,
            'Common Distribution': 0
          };
        }
        const match = step.name.match(/\((.*?)\)/);
        if (match) {
          const type = match[1];
          if (type === "Liquidation Preference") {
            shareClassSteps[step.shareClass]["Liquidation Preference"] += Math.abs(step.value);
          } else if (type.includes("Participation") || type === "Additional Participation") {
            shareClassSteps[step.shareClass]["Participation"] += Math.abs(step.value);
          } else if (type.includes("Common")) {
            shareClassSteps[step.shareClass]["Common Distribution"] += Math.abs(step.value);
          }
        }
      }
    });

    // Create datasets for each distribution type
    const distributionTypes = [
      'Liquidation Preference',
      'Participation',
      'Common Distribution'
    ];
    
    const datasets = distributionTypes.map(type => ({
      label: type,
      data: summaryData.map(summary => {
        return shareClassSteps[summary.name]?.[type] || 0;
      }),
      backgroundColor: getDistributionTypeColor(type),
      borderColor: getDistributionTypeColor(type, 0.8),
      borderWidth: 1
    })).filter(dataset => dataset.data.some(value => value > 0)); // Only include datasets with non-zero values

    return {
      labels: summaryData.map(d => d.name),
      datasets: datasets
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: function(context) {
            const shareClass = context[0].label;
            const sc = shareClasses.find(s => s.name === shareClass);
            if (!sc) return shareClass;
            
            let title = shareClass;
            if (sc.type === 'preferred') {
              title += ` (${sc.prefType})`;
              if (sc.prefType === 'participating' && sc.cap) {
                title += ` - ${sc.cap}x cap`;
              }
            }
            return title;
          },
          label: function(context) {
            const value = context.raw;
            if (value === 0) return null;
            const percentage = ((value / exitAmount) * 100).toFixed(1);
            return `${context.dataset.label}: $${value.toLocaleString()} (${percentage}%)`;
          },
          afterBody: function(context) {
            const shareClass = context[0].label;
            const datasetValues = context.map(item => item.raw);
            const total = datasetValues.reduce((sum, value) => sum + value, 0);
            const percentage = ((total/exitAmount)*100).toFixed(1);
            return [`Total Payout: $${total.toLocaleString()} (${percentage}%)`];
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  };
  
  return (
    <div>
      <h3>Distribution Breakdown</h3>
      <div className="chart-container">
        {summaryData.length > 0 && <Bar ref={chartRef} data={getChartData()} options={options} />}
      </div>
      <div className="summary-info">
        <p>This chart shows the total distribution and breakdown for each share class.</p>
        <ul>
          <li>Each bar represents a share class's total proceeds</li>
          <li>Segments show how the proceeds are distributed (liquidation preference, participation, etc.)</li>
          <li>Hover over segments to see detailed amounts</li>
        </ul>
      </div>
    </div>
  );
};

export default CombinedChart; 