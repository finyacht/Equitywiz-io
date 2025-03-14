import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useWaterfall } from '../utils/WaterfallContext';
import { formatCurrency, getShareClassColor } from '../utils/waterfallCalculator';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExitDistributionChart = () => {
  const { exitDistribution, shareClasses } = useWaterfall();
  const chartRef = useRef(null);
  
  const getChartData = () => {
    if (!exitDistribution.exitValues || !exitDistribution.activeShareClasses) {
      return { labels: [], datasets: [] };
    }
    
    const { exitValues, activeShareClasses, distributions } = exitDistribution;
    
    // Create datasets for each share class
    const datasets = activeShareClasses.map((className, index) => ({
      label: className,
      data: distributions.map(dist => dist[index]),
      fill: false,
      borderColor: getShareClassColor(className, index),
      backgroundColor: getShareClassColor(className, index, 0.1),
      tension: 0.4
    }));
    
    return {
      labels: exitValues.map(value => formatCurrency(value)),
      datasets: datasets
    };
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Exit Value'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Distribution Amount'
        },
        ticks: {
          callback: value => formatCurrency(value)
        }
      }
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            return `Exit Value: ${tooltipItems[0].label}`;
          },
          label: function(tooltipItem) {
            const shareClass = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            const exitValue = exitDistribution.exitValues[tooltipItem.dataIndex];
            const percentage = exitValue > 0 ? ((value / exitValue) * 100).toFixed(1) : '0.0';
            
            return `${shareClass}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  return (
    <div>
      <h3>Exit Value Distribution</h3>
      <div className="chart-container">
        {exitDistribution.exitValues && exitDistribution.activeShareClasses && 
          <Line ref={chartRef} data={getChartData()} options={options} />
        }
      </div>
      <div className="summary-info">
        <p>This chart shows how proceeds are distributed across different exit values.</p>
        <ul>
          <li>X-axis shows different exit values</li>
          <li>Y-axis shows the amount each share class receives</li>
          <li>Hover over the lines to see exact values</li>
        </ul>
      </div>
    </div>
  );
};

export default ExitDistributionChart; 