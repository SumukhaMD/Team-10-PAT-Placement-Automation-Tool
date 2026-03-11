import React, { useState, useEffect } from 'react';

export default function StudentDetails() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students.json')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching students data:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const students = data.students;

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Placed': return 'bg-primary/20 text-primary border-primary/30';
      case 'Multiple': return 'bg-accent-purple/20 text-accent-purple border-accent-purple/30';
      case 'Unplaced': return 'bg-border-color text-muted border-border-color';
      default: return '';
    }
  };

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">search</span>
        <input 
          className="bg-background-dark border border-border-color text-sm text-text-main rounded pl-9 pr-4 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none w-64 placeholder-muted" 
          placeholder="Search ID or Name..." 
          type="text"
        />
      </div>
      <button className="flex items-center gap-2 bg-surface border border-border-color hover:border-muted text-text-main px-3 py-1.5 rounded transition-colors">
        <span className="material-symbols-outlined text-sm">filter_list</span>
        <span className="text-sm font-medium">Filters</span>
      </button>
      <button className="flex items-center gap-2 bg-primary text-[#0B0E14] px-4 py-1.5 rounded font-display font-semibold text-[13px] hover:opacity-90 transition-opacity ml-2">
        <span className="material-symbols-outlined text-sm">download</span>
        Export CSV
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden" id="header-portal">{headerRight}</div>
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Table View (Left Pane) */}
        <div className="flex-1 overflow-auto bg-background-dark">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface z-10 border-b border-border-color">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Student ID</th>
                <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Branch</th>
                <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider text-right">Highest CTC</th>
                <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider text-right">Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {students.map((student, i) => (
                <tr 
                  key={i} 
                  className={`cursor-pointer transition-colors hover:bg-[#1A1F29] ${selectedStudent?.id === student.id ? 'bg-surface border-l-2 border-l-accent-purple' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="py-3 px-6 font-display text-sm text-text-main">{student.id}</td>
                  <td className="py-3 px-6 text-sm font-medium text-text-main">{student.name}</td>
                  <td className="py-3 px-6 text-sm text-muted">{student.branch}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusClasses(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className={`py-3 px-6 font-display text-sm text-right ${student.status === 'Multiple' ? 'text-accent-purple font-semibold' : student.status === 'Unplaced' ? 'text-muted' : 'text-text-main'}`}>
                    {student.ctc}
                  </td>
                  <td className="py-3 px-6 font-display text-sm text-right text-muted">{student.offers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slide-out Drawer */}
        <div className={`w-[400px] bg-surface border-l border-border-color flex flex-col shrink-0 z-20 shadow-[-8px_0_24px_-8px_rgba(0,0,0,0.5)] h-[calc(100vh-64px)] overflow-hidden absolute right-0 top-0 transition-transform duration-300 ${selectedStudent ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedStudent && (
            <>
              <div className="p-6 border-b border-border-color flex justify-between items-start shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-2xl font-bold text-text-main">{selectedStudent.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusClasses(selectedStudent.status)} mt-1`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted font-display">{selectedStudent.id} • {selectedStudent.branch}</p>
                </div>
                <button aria-label="Close details" onClick={() => setSelectedStudent(null)} className="text-muted hover:text-text-main p-1 rounded transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {selectedStudent.details ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background-dark border border-border-color rounded p-4">
                        <p className="text-xs text-muted mb-1">Highest Offer</p>
                        <p className="font-display text-xl text-accent-purple font-bold">{selectedStudent.details.highestOffer}</p>
                      </div>
                      <div className="bg-background-dark border border-border-color rounded p-4">
                        <p className="text-xs text-muted mb-1">Total Offers</p>
                        <p className="font-display text-xl text-text-main font-bold">{selectedStudent.details.totalOffers}</p>
                      </div>
                    </div>
                    
                    {selectedStudent.details.activeOffers && selectedStudent.details.activeOffers.length > 0 && (
                      <div>
                        <h4 className="font-display text-sm font-semibold text-text-main uppercase tracking-wider mb-4 border-b border-border-color pb-2">Active Offers</h4>
                        <div className="space-y-3">
                          {selectedStudent.details.activeOffers.map((offer, index) => (
                            <div key={index} className={`bg-background-dark border border-border-color p-4 rounded transition-colors group ${offer.borderColor}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-semibold text-text-main">{offer.company}</h5>
                                  <p className="text-xs text-muted">{offer.role}</p>
                                </div>
                                <span className={`font-display font-bold ${offer.statusColor}`}>{offer.ctc}</span>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-color">
                                <span className="text-xs text-muted">{offer.date}</span>
                                <button className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium transition-colors">
                                  <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                                  Offer Letter
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedStudent.details.history && selectedStudent.details.history.length > 0 && (
                      <div className="pb-8">
                        <h4 className="font-display text-sm font-semibold text-text-main uppercase tracking-wider mb-4 border-b border-border-color pb-2">Interview History</h4>
                        <div className="relative ml-3 border-l border-border-color space-y-6 pb-4">
                          {selectedStudent.details.history.map((item, index) => (
                            <div key={index} className="relative pl-6">
                              <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5px] top-1.5 ${item.color}`}></div>
                              <div className="flex justify-between items-start">
                                <p className={`text-sm font-medium ${item.textmuted ? 'text-muted' : 'text-text-main'}`}>{item.stage}</p>
                                <span className="text-xs text-muted">{item.date}</span>
                              </div>
                              {item.desc && <p className="text-xs text-muted mt-1">{item.desc}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_info_alert</span>
                    <p className="text-sm">No detailed information available.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
