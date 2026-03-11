import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';

export default function PlacementReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/placement-report.json')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching placement report data:", err);
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

  const doughnutData = {
    labels: data.sectorBreakdown.labels,
    datasets: [{
      data: data.sectorBreakdown.data, // Percentages
      backgroundColor: ['#00F0FF', '#FFB000', '#B534FF', '#3B82F6'],
      borderColor: '#151921', // Matches surface background
      borderWidth: 2,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B0E14',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: '#2A3140',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`
        }
      }
    }
  };

  const headerRightAction = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Drive:</span>
        <select className="bg-surface border border-border-color text-text-main text-sm rounded px-2 py-1 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer">
          <option>2024-2025</option>
          <option>2023-2024</option>
          <option>2022-2023</option>
        </select>
      </div>
      <button className="w-8 h-8 flex items-center justify-center text-muted hover:text-text-main transition-colors rounded hover:bg-surface border border-border-color">
        <span className="material-symbols-outlined text-[20px]">notifications</span>
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden" id="header-portal">{headerRightAction}</div>
      
      {/* Page Header Area */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-main font-display text-[32px] font-bold leading-tight tracking-tight">Placement Report</h1>
          <p className="text-muted text-sm font-normal">Analyze recruiter performance and sector trends</p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 bg-primary text-[#0B0E14] font-display font-semibold text-[13px] rounded hover:bg-primary/90 transition-all shadow-[0_0_16px_rgba(0,240,255,0.4)]">
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border-color rounded p-6 lg:col-span-1 flex flex-col h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-text-main font-display text-lg font-bold">Sector Breakdown</h2>
            <button className="text-muted hover:text-text-main"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-[200px] h-[200px] relative flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-display text-2xl font-bold text-text-main">{data.sectorBreakdown.totalCompanies}</span>
                <span className="text-xs text-muted font-medium">Total Companies</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-xs text-text-main">Software</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-amber"></div><span className="text-xs text-text-main">Consulting</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-purple"></div><span className="text-xs text-text-main">Core</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div><span className="text-xs text-text-main">Finance</span></div>
          </div>
        </div>

        <div className="bg-surface border border-border-color rounded p-6 lg:col-span-2 flex flex-col h-[360px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-text-main font-display text-lg font-bold">Top Recruiters</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Sort by:</span>
              <button className="flex items-center gap-1 text-xs text-text-main font-medium hover:text-primary transition-colors">
                Hires
                <span className="material-symbols-outlined text-[14px] text-primary">arrow_downward</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color text-xs text-muted font-medium uppercase tracking-wider">
                  <th className="pb-3 font-normal pl-2">Company</th>
                  <th className="pb-3 font-normal text-right">Sector</th>
                  <th className="pb-3 font-normal text-right">Hires</th>
                  <th className="pb-3 font-normal text-right pr-4">Avg CTC</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.topRecruiters.map((row, i) => (
                  <tr key={i} className="border-b border-border-color/50 hover:bg-[#1A1F29] transition-colors h-[48px] group cursor-pointer">
                    <td className="pl-2 flex items-center gap-3 h-[48px]">
                      <div className="w-6 h-6 rounded bg-background-dark border border-border-color flex items-center justify-center text-[10px] font-bold text-text-main">{row.init}</div>
                      <span className="font-medium text-text-main group-hover:text-primary transition-colors">{row.name}</span>
                    </td>
                    <td className="text-right text-muted">{row.sector}</td>
                    <td className="text-right font-display text-text-main">{row.hires}</td>
                    <td className={`text-right font-display ${row.ctcColor} pr-4`}>{row.ctc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="performance-table" className="bg-surface border border-border-color rounded flex flex-col flex-1 mb-8">
        <div className="p-5 border-b border-border-color flex justify-between items-center">
          <h2 className="text-text-main font-display text-lg font-bold">5-Year Company Performance</h2>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted">search</span>
            <input className="w-full bg-[#0B0E14] border border-border-color rounded h-8 pl-9 pr-3 text-sm text-text-main placeholder-muted focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Search company..." type="text"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0B0E14]/50 border-b border-border-color text-xs text-muted font-medium uppercase tracking-wider">
                <th className="py-3 px-4 font-normal cursor-pointer hover:text-text-main group">
                  Company <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 align-middle">arrow_downward</span>
                </th>
                <th className="py-3 px-4 font-normal text-right">20-21 Hires</th>
                <th className="py-3 px-4 font-normal text-right">21-22 Hires</th>
                <th className="py-3 px-4 font-normal text-right">22-23 Hires</th>
                <th className="py-3 px-4 font-normal text-right">23-24 Hires</th>
                <th className="py-3 px-4 font-normal text-right group cursor-pointer text-text-main">
                  24-25 Hires <span className="material-symbols-outlined text-[14px] text-primary align-middle">arrow_downward</span>
                </th>
                <th className="py-3 px-4 font-normal text-center w-32">YOY Trend</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.companyPerformance.map((company, i) => {
                const sector = data.topRecruiters.find(r => r.name === company.name)?.sector || 'Software';
                const strokeColor = {
                  'Software': '#00F0FF',
                  'Consulting': '#FFB000',
                  'Core': '#B534FF',
                  'Finance': '#3B82F6'
                }[sector] || '#00F0FF';

                return (
                  <tr key={i} className="border-b border-border-color/50 hover:bg-[#1A1F29] transition-colors h-[52px]">
                    <td className="px-4 font-medium text-text-main">{company.name}</td>
                    <td className="px-4 text-right font-display text-muted">{company.hiresY1}</td>
                    <td className="px-4 text-right font-display text-muted">{company.hiresY2}</td>
                    <td className="px-4 text-right font-display text-muted">{company.hiresY3}</td>
                    <td className="px-4 text-right font-display text-muted">{company.hiresY4}</td>
                    <td className="px-4 text-right font-display text-text-main font-bold">{company.hiresY5}</td>
                    <td className="px-4 text-center">
                      <svg className="inline-block" height="24" viewBox="0 0 80 24" width="80">
                        <path d={company.trendPoints} fill="none" stroke={strokeColor} strokeLinejoin="round" strokeWidth="2"></path>
                        <circle cx={company.trendPointX} cy={company.trendPointY} fill={strokeColor} r="3"></circle>
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
