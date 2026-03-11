import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

export default function Statistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/statistics.json')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching statistics data:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#151921',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: '#2A3140',
        borderWidth: 1,
      }
    },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748B', font: { family: 'Space Grotesk' } } },
      y: { grid: { color: '#2A314050', drawBorder: false }, ticks: { color: '#64748B', font: { family: 'Space Grotesk' } } }
    }
  };

  const placementByBranchData = {
    labels: data.placementByBranch.labels,
    datasets: [{
      label: 'Placement %',
      data: data.placementByBranch.data,
      backgroundColor: '#00F0FF33',
      borderColor: '#00F0FF80',
      borderWidth: 1,
      hoverBackgroundColor: '#00F0FF',
      borderRadius: 2,
    }]
  };

  const trend5YearData = {
    labels: data.trend5Year.labels,
    datasets: [{
      label: 'Placement %',
      data: data.trend5Year.data,
      borderColor: '#00F0FF',
      backgroundColor: '#00F0FF20',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00F0FF',
      pointBorderColor: '#151921',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const avgVsMedianData = {
    labels: data.avgVsMedian.labels,
    datasets: [
      {
        label: 'Average',
        data: data.avgVsMedian.average,
        backgroundColor: '#00F0FF99',
        hoverBackgroundColor: '#00F0FF',
        borderRadius: 2,
      },
      {
        label: 'Median',
        data: data.avgVsMedian.median,
        backgroundColor: '#B534FF99',
        hoverBackgroundColor: '#B534FF',
        borderRadius: 2,
      }
    ]
  };

  const salaryDistData = {
    labels: data.salaryDist.labels,
    datasets: [{
      label: 'Students',
      data: data.salaryDist.data,
      backgroundColor: '#00F0FF66',
      hoverBackgroundColor: '#00F0FF',
      categoryPercentage: 1.0,
      barPercentage: 1.0,
      borderColor: '#0B0E14',
      borderWidth: 1,
    }]
  };

  const topRecruitersData = {
    labels: data.topRecruiters.labels,
    datasets: [{
      label: 'Hires',
      data: data.topRecruiters.data,
      backgroundColor: '#00F0FF',
      borderRadius: 4,
      barThickness: 12,
    }]
  };

  const multipleOffersData = {
    labels: data.multipleOffers.labels,
    datasets: [{
      data: data.multipleOffers.data,
      backgroundColor: ['#B534FF', '#00F0FF', '#00F0FF33'],
      borderColor: '#151921',
      borderWidth: 3,
      hoverOffset: 4
    }]
  };

  const headerRight = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <select className="appearance-none bg-surface border border-border-color text-text-main text-sm rounded px-4 py-1.5 pr-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer">
            <option>All Branches</option>
            <option>CSE</option>
            <option>ECE</option>
            <option>ME</option>
            <option>CE</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none">expand_more</span>
        </div>
        <div className="relative">
          <select className="appearance-none bg-surface border border-border-color text-text-main text-sm rounded px-4 py-1.5 pr-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer">
            <option>2024 Batch</option>
            <option>2023 Batch</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[18px] pointer-events-none">expand_more</span>
        </div>
      </div>
      <div className="w-px h-6 bg-border-color mx-2"></div>
      <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 px-4 py-1.5 rounded text-sm font-display font-bold flex items-center gap-2 transition-all">
        <span className="material-symbols-outlined text-[18px]">download</span>
        Export CSV
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden" id="header-portal">{headerRight}</div>
      <div className="space-y-8 pb-4 w-full">
        {/* Row 1: Key Performance Metrics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar Chart: Placement % by Branch */}
          <div className="bg-surface border border-border-color rounded p-6 flex flex-col h-[400px] group transition-colors duration-200 hover:border-muted">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display font-bold text-text-main text-lg">Placement % by Branch</h3>
                <p className="text-sm text-muted mt-1">Current batch recruitment rates</p>
              </div>
              <span className="material-symbols-outlined text-muted text-xl">insights</span>
            </div>
            <div className="flex-1 relative w-full">
              <Bar data={placementByBranchData} options={{...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, max: 100 }}}} />
            </div>
          </div>

          {/* Line Chart: 5-Year Trend */}
          <div className="bg-surface border border-border-color rounded p-6 flex flex-col h-[400px] group transition-colors duration-200 hover:border-muted">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display font-bold text-text-main text-lg">5-Year Placement Trend</h3>
                <p className="text-sm text-muted mt-1">Growth in overall placement percentage</p>
              </div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20">+4.2% YoY</div>
            </div>
            <div className="flex-1 relative w-full">
              <Line data={trend5YearData} options={{...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 20, max: 100 }}}} />
            </div>
          </div>
        </div>

        {/* Row 2: Salary and CTC Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Grouped Bar Chart: Average vs Median CTC */}
          <div className="bg-surface border border-border-color rounded p-6 flex flex-col h-[400px] group transition-colors duration-200 hover:border-muted">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display font-bold text-text-main text-lg">Average vs Median CTC</h3>
                <p className="text-sm text-muted mt-1">Branch-wise CTC comparison (LPA)</p>
              </div>
            </div>
            <div className="flex-1 relative w-full">
              <Bar data={avgVsMedianData} options={commonOptions} />
            </div>
          </div>

          {/* Salary Distribution Histogram */}
          <div className="bg-surface border border-border-color rounded p-6 flex flex-col h-[400px] group transition-colors duration-200 hover:border-muted">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display font-bold text-text-main text-lg">Salary Distribution</h3>
                <p className="text-sm text-muted mt-1">Number of students by CTC buckets</p>
              </div>
              <span className="text-xs font-bold text-muted bg-border-color/40 px-2 py-0.5 rounded">680 Total</span>
            </div>
            <div className="flex-1 relative w-full">
              <Bar data={salaryDistData} options={{...commonOptions, scales: { x: { grid: { display: false } }, y: { display: false } }}} />
            </div>
          </div>
        </div>

        {/* Row 3: Recruiters and Offers */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Horizontal Bar Chart: Top 10 Recruiters */}
          <div className="bg-surface border border-border-color rounded p-6 flex flex-col h-[500px] group transition-colors duration-200 hover:border-muted">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display font-bold text-text-main text-lg">Top Recruiters</h3>
                <p className="text-sm text-muted mt-1">By number of students placed</p>
              </div>
            </div>
            <div className="flex-1 relative w-full pr-4">
              <Bar 
                data={topRecruitersData} 
                options={{
                  ...commonOptions, 
                  indexAxis: 'y', 
                  scales: { x: { display: false }, y: { grid: { display: false }, ticks: { color: '#F8FAFC', font: { family: 'Plus Jakarta Sans', size: 12 } } } }
                }} 
              />
            </div>
          </div>

          {/* Donut Chart: Multiple Offers */}
          <div className="bg-surface border border-border-color rounded p-6 flex flex-col h-[500px] group transition-colors duration-200 hover:border-muted">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display font-bold text-text-main text-lg">Multiple Offers Breakdown</h3>
                <p className="text-sm text-muted mt-1">Percentage of students with &gt;1 offer</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
              <div className="relative w-64 h-64">
                <Doughnut data={multipleOffersData} options={{ cutout: '75%', plugins: { tooltip: commonOptions.plugins.tooltip } }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-4xl font-display font-bold text-text-main pt-1">40%</span>
                  <span className="text-[12px] text-muted uppercase font-bold mt-1">&gt;1 Offer</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full max-w-[240px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-accent-purple"></span><span className="text-sm text-muted">3+ Offers</span></div>
                  <span className="text-sm font-bold text-text-main">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary"></span><span className="text-sm text-muted">2 Offers</span></div>
                  <span className="text-sm font-bold text-text-main">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary/20"></span><span className="text-sm text-muted">Single Offer</span></div>
                  <span className="text-sm font-bold text-text-main">60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
