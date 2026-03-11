import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ready for a real backend API endpoint by replacing the URL in fetch()
  useEffect(() => {
    fetch('/api/dashboard.json')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
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

  const { metrics, progression, recentOffers } = data;

  const chartData = {
    labels: progression.chartData.labels,
    datasets: [
      {
        label: 'Offers',
        data: progression.chartData.data,
        backgroundColor: '#00F0FF40',
        hoverBackgroundColor: '#00F0FF',
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { display: false, max: 100 },
      x: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#151921',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: '#2A3140',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (items) => items[0].label,
          label: (context) => `${context.raw} Offers`,
        },
      },
    },
  };

  const totalOffersProgression = progression.accepted + progression.pending;
  const acceptedPercent = (progression.accepted / totalOffersProgression * 100).toFixed(1);
  const pendingPercent = (100 - parseFloat(acceptedPercent)).toFixed(1);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-surface border border-border-color rounded p-6 flex flex-col gap-2 transition-colors duration-200 hover:border-muted group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Placement %</span>
            <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-display font-bold text-primary leading-none">{metrics.placementPercentage.value}%</span>
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <span className="text-primary flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> {metrics.placementPercentage.trend}%</span> vs last year
          </div>
        </div>

        <div className="bg-surface border border-border-color rounded p-6 flex flex-col gap-2 transition-colors duration-200 hover:border-muted group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-amber/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Avg CTC</span>
            <span className="material-symbols-outlined text-accent-amber text-[20px]">payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-display font-bold text-accent-amber leading-none">{metrics.avgCtc.value}</span>
            <span className="text-sm font-medium text-muted">LPA</span>
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <span className="text-accent-amber flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> {metrics.avgCtc.trend}L</span> vs last year
          </div>
        </div>

        <div className="bg-surface border border-border-color rounded p-6 flex flex-col gap-2 transition-colors duration-200 hover:border-muted group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Highest CTC</span>
            <span className="material-symbols-outlined text-accent-purple text-[20px]">military_tech</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-display font-bold text-accent-purple leading-none">{metrics.highestCtc.value}</span>
            <span className="text-sm font-medium text-muted">LPA</span>
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            {metrics.highestCtc.company}
          </div>
        </div>

        <div className="bg-surface border border-border-color rounded p-6 flex flex-col gap-2 transition-colors duration-200 hover:border-muted group cursor-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Companies Visited</span>
            <span className="material-symbols-outlined text-muted text-[20px]">domain</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-display font-bold text-text-main leading-none">{metrics.companiesVisited.value}</span>
          </div>
          <div className="text-xs text-muted mt-1">
            Target: {metrics.companiesVisited.target} companies
          </div>
        </div>

        <div className="bg-surface border border-border-color rounded p-6 flex flex-col gap-2 transition-colors duration-200 hover:border-muted group cursor-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Total Offers Made</span>
            <span className="material-symbols-outlined text-muted text-[20px]">local_mall</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-display font-bold text-text-main leading-none">{metrics.offersMade.value}</span>
          </div>
          <div className="text-xs text-muted mt-1">
            Across {metrics.offersMade.students} students
          </div>
        </div>

        <div className="bg-surface border border-border-color rounded p-6 flex flex-col gap-2 transition-colors duration-200 hover:border-muted group cursor-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Students Unplaced</span>
            <span className="material-symbols-outlined text-muted text-[20px]">person_off</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-display font-bold text-text-main leading-none">{metrics.unplacedStudents.value}</span>
          </div>
          <div className="text-xs text-muted mt-1">
            Out of {metrics.unplacedStudents.eligible} eligible
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border-color rounded p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-text-main">Placement Progression</h3>
            <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View Details</button>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-main font-medium">Offers Status</span>
                <span className="text-muted"><span className="text-primary font-medium">{progression.accepted} Accepted</span> / {progression.pending} Pending</span>
              </div>
              <div className="w-full h-8 bg-background-dark rounded flex overflow-hidden border border-border-color">
                <div className="h-full bg-primary relative group" style={{ width: `${acceptedPercent}%` }}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="h-full bg-muted/30 relative group" style={{ width: `${pendingPercent}%` }}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <div className="flex gap-4 text-xs mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-primary"></div>
                  <span className="text-muted">Accepted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-muted/30 border border-border-color"></div>
                  <span className="text-muted">Pending</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full border border-border-color rounded bg-background-dark relative flex flex-col px-4 pb-4 gap-2 pt-4 min-h-[160px]">
              <div className="text-xs text-muted mb-2">Weekly Offers Trend ({chartData.datasets[0].data.reduce((a, b) => a + b)} total)</div>
              <div className="flex-1 relative w-full h-full min-h-0">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-surface border border-border-color rounded p-0 flex flex-col h-[400px]">
          <div className="p-4 border-b border-border-color flex items-center justify-between shrink-0">
            <h3 className="text-base font-display font-bold text-text-main flex items-center gap-2">
              Recent Offers
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide flex flex-col gap-1">
            {recentOffers.map((offer, i) => (
              <a key={i} className="flex items-center gap-3 p-3 rounded hover:bg-[#1A1F29] transition-colors group cursor-pointer border border-transparent hover:border-border-color" href="#">
                <div className={`w-[40px] h-[40px] rounded bg-white/5 border border-border-color flex items-center justify-center shrink-0 text-text-main font-bold text-lg bg-gradient-to-br ${offer.color}`} title={`${offer.company} Logo`}>
                  {offer.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-main truncate group-hover:text-primary transition-colors">{offer.name}</p>
                  <p className="text-xs text-muted truncate">{offer.company} • {offer.role}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-display font-bold ${offer.ctcColor}`}>{offer.ctc}</p>
                  <p className="text-[10px] text-muted">{offer.time}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="p-2 border-t border-border-color mt-auto">
            <Link to="/student-details" className="block text-center w-full py-2 text-xs font-display font-semibold text-muted hover:text-text-main bg-background-dark rounded transition-colors border border-transparent hover:border-border-color">
              View All Offers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
