import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Save, Download, Printer, Pill, Plus, Trash2, User, AlertCircle, PenTool
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const PrescriptionEditor = ({ isOpen, onClose, patient: initialPatient, doctor, onSaveSuccess }) => {
    const [patientName, setPatientName] = useState(initialPatient?.get_name || '');
    const [patientAge, setPatientAge] = useState(initialPatient?.age || '');
    const [patientSex, setPatientSex] = useState(initialPatient?.gender || '');
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [diagnosis, setDiagnosis] = useState('');
    const [bp, setBp] = useState('');
    const [temp, setTemp] = useState('');
    const [followUp, setFollowUp] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSigned, setIsSigned] = useState(false);
    const [medicines, setMedicines] = useState([
        { name: '', strength: '', dose: '', duration: '' }
    ]);
    const printRef = useRef(null);

    // DYNAMIC LAYOUT SCALING
    const medicineCount = medicines.length;
    const rowStyles = {
        padding: medicineCount <= 2 ? 'py-8' : medicineCount <= 5 ? 'py-4' : 'py-2',
        nameSize: medicineCount <= 2 ? 'text-lg' : medicineCount <= 5 ? 'text-sm' : 'text-[11px]',
        doseSize: medicineCount <= 2 ? 'text-sm' : medicineCount <= 5 ? 'text-[11px]' : 'text-[9px]',
        strengthSize: medicineCount <= 2 ? 'text-xs' : 'text-[8px]',
        gap: medicineCount <= 2 ? 'space-y-4' : 'space-y-1'
    };

    const handleSave = async (generatePDF = false) => {
        if (!diagnosis) return toast.error("Clinical Diagnosis is required.");
        setIsSaving(true);
        const toastId = toast.loading("Processing Clinical Payload...");
        try {
            const medicineContent = medicines.filter(m => m.name).map(m => 
                `${m.name} (${m.strength}) - ${m.dose}`
            ).join('\n');

            // Generate PDF Blob for Archival
            const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const pdfBlob = pdf.output('blob');

            const patientId = parseInt(initialPatient?.id || initialPatient?.patient);
            if (!patientId || isNaN(patientId)) {
                return toast.error("Patient authorization required. Please re-select from registry.", { id: toastId });
            }

            const formData = new FormData();
            formData.append('patient', patientId);
            formData.append('chief_complaint', "Institutional Prescription Fulfillment");
            formData.append('diagnosis', diagnosis);
            formData.append('prescription', medicineContent);
            formData.append('follow_up_date', followUp || '');
            formData.append('vitals', JSON.stringify({ bp, temp }));
            formData.append('prescription_pdf', pdfBlob, `Rx_${patientName.replace(/\s+/g, '_')}.pdf`);

            await api.post('medical-records/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (generatePDF) pdf.save(`Rx_${patientName || 'Patient'}.pdf`);
            
            toast.success("Record Archived & Released.", { id: toastId });
            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Transmission Error Context:", error.response?.data || error.message);
            
            // Extract the most descriptive error message from the backend payload
            let errorMessage = "Transmission failure. Verify clinical identifiers.";
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (typeof data === 'object') {
                    // Collect first error from field validation
                    const firstKey = Object.keys(data)[0];
                    const firstError = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
                    errorMessage = `${firstKey.toUpperCase()}: ${firstError}`;
                }
            }
            
            toast.error(errorMessage, { id: toastId, duration: 5000 });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[9999] bg-[#0c111d]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="w-full max-w-[1240px] h-[95vh] bg-slate-50 rounded-3xl overflow-hidden flex flex-col border border-slate-200 shadow-2xl">
                <header className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <PenTool className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Clinical Forge</h1>
                            <p className="text-[9px] font-black uppercase opacity-40">Proportional Archival Release</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSigned(!isSigned)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isSigned ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                            {isSigned ? 'Authorized' : 'Sign Draft'}
                        </button>
                        <button onClick={() => handleSave(true)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                            Release & Print
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="grid grid-cols-12 gap-6 items-start h-full">
                        {/* INPUT ZONE */}
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            <div className="p-5 rounded-2xl border bg-white shadow-sm space-y-4">
                                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 border-b pb-3">Session Controller</h2>
                                
                                <div className="space-y-3">
                                    <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient Name" className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="Age (e.g. 28)" className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                        <input value={patientSex} onChange={e => setPatientSex(e.target.value)} placeholder="Sex (M/F)" className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                    </div>
                                    <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <input value={bp} onChange={e => setBp(e.target.value)} placeholder="BP (e.g. 120/80)" className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                    <input value={temp} onChange={e => setTemp(e.target.value)} placeholder="Temp (e.g. 37.4)" className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-1">Clinical Assessment</label>
                                    <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter Root Cause..." rows={3} className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500 resize-none" />
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-1">Follow-up Visit</label>
                                    <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW ZONE */}
                        <div className="col-span-12 lg:col-span-8 flex justify-center pb-12">
                            <div className="bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-12 max-w-full w-[210mm] min-h-[297mm] transition-all duration-500 ease-in-out" ref={printRef}>
                                {/* LETTERHEAD */}
                                <div className="flex justify-between items-start mb-8 border-b border-slate-900/5 pb-6">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-blue-600 tracking-tighter">LIFELINE HMS</h2>
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em]">Institutional Medical Center</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-sm font-black uppercase">Dr. {doctor?.last_name || 'Physician'}</h3>
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{doctor?.specialist || 'Medical Specialist'}</p>
                                        <p className="text-[7px] font-bold opacity-30 mt-1">Reg No: {doctor?.registration_number || '4458-CLI-REG'}</p>
                                    </div>
                                </div>

                                {/* PATIENT IDENTITY BLOCK */}
                                <div className="bg-slate-50 p-6 rounded-2xl mb-8 grid grid-cols-4 gap-6 border border-slate-100">
                                    <div className="col-span-2">
                                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Patient Identity</p>
                                        <p className="text-sm font-black uppercase">{patientName || 'Clinical Case #'+(initialPatient?.id || '449')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Age / Sex</p>
                                        <p className="text-sm font-black">{patientAge || '--'}y / {patientSex || '--'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Visit Date</p>
                                        <p className="text-sm font-black">{new Date(visitDate).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>

                                {/* VITALS & ASSESSMENT */}
                                <div className="grid grid-cols-12 gap-10 mb-8 pb-8 border-b border-slate-50">
                                    <div className="col-span-3 border-r pr-8 space-y-5">
                                        <div>
                                            <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1.5 text-blue-600">BP</p>
                                            <p className="text-sm font-black text-slate-900">{bp || '--/--'} mmHg</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1.5 text-blue-600">Temp</p>
                                            <p className="text-sm font-black text-slate-900">{temp || '--'} °C</p>
                                        </div>
                                    </div>
                                    <div className="col-span-9">
                                        <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-3">Diagnostic Summary (Root Cause)</p>
                                        <p className="text-[13px] font-bold text-slate-700 italic leading-relaxed">{diagnosis || 'General assessment pending detailed clinical examination and laboratory verification.'}</p>
                                    </div>
                                </div>

                                {/* DYNAMIC MEDICINE PROTOCOL */}
                                <div className="flex-1 relative">
                                    <div className="text-6xl font-serif italic text-blue-600/5 absolute -top-4 -left-4 select-none">Rx</div>
                                    <div className={`relative z-10 pt-10 ${rowStyles.gap}`}>
                                        {medicines.map((m, i) => (
                                            <div key={i} className={`flex gap-6 items-center ${rowStyles.padding} px-4 border-b border-slate-50 group transition-all duration-500 hover:bg-slate-50/50 rounded-xl`}>
                                                <div className="w-8 text-xs font-black opacity-30 font-mono text-slate-400">{String(i+1).padStart(2, '0')}</div>
                                                <div className="flex-1">
                                                    <input value={m.name} onChange={e => { const c = [...medicines]; c[i].name = e.target.value; setMedicines(c); }} placeholder="Medicine Name" className={`block w-full font-black outline-none bg-transparent ${rowStyles.nameSize} text-slate-900 placeholder:text-slate-300`} />
                                                    <input value={m.strength} onChange={e => { const c = [...medicines]; c[i].strength = e.target.value; setMedicines(c); }} placeholder="Strength (e.g. 500mg)" className={`block w-full font-bold text-slate-500 outline-none bg-transparent ${rowStyles.strengthSize} mt-0.5 placeholder:text-slate-200`} />
                                                </div>
                                                <div className="w-40">
                                                    <input value={m.dose} onChange={e => { const c = [...medicines]; c[i].dose = e.target.value; setMedicines(c); }} placeholder="Dose (1-0-1)" className={`block w-full font-black text-blue-700 outline-none bg-transparent ${rowStyles.doseSize} text-right placeholder:text-blue-200`} />
                                                </div>
                                                <button onClick={() => setMedicines(medicines.filter((_, idx) => idx !== i))} className="p-1 opacity-0 group-hover:opacity-100 text-rose-500 no-print transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {medicines.length < 10 && (
                                            <button onClick={() => setMedicines([...medicines, { name: '', strength: '', dose: '', duration: '' }])} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-700 hover:text-blue-800 pt-6 no-print transition-all hover:translate-x-1">
                                                <Plus className="w-4 h-4" /> Add Protocol Layer ({medicines.length}/10)
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* FOOTER INFRASTRUCTURE */}
                                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
                                    <div className="space-y-6">
                                        <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-100 shadow-inner">
                                            <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Scheduled Follow-up</p>
                                            <p className="text-xs font-black text-blue-600">{followUp ? new Date(followUp).toLocaleDateString('en-GB') : 'As Needed / PRN'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1.5">Official Validation</p>
                                            <p className="text-[9px] font-bold text-slate-400 italic leading-snug max-w-sm">This record is digitally synchronized within the Lifeline HMS clinical ledger for instant and secure pharmacy fulfillment.</p>
                                        </div>
                                    </div>
                                    <div className="text-center w-72 pt-6">
                                        <div className="h-16 flex items-center justify-center">
                                            {isSigned && (
                                                <p className="font-serif italic text-3xl text-blue-900 border-b-2 border-slate-900/5 px-8 transition-all animate-in fade-in slide-in-from-bottom-4">Dr. {doctor?.last_name || 'Physician'}</p>
                                            )}
                                        </div>
                                        <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.3em] mt-4">Authorized Medical Seal</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PrescriptionEditor;
