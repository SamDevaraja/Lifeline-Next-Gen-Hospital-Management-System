import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, CheckCircle, Clock, Search, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { InputModal, DetailsModal } from './Modals';

const TaskPage = ({ user }) => {
    const { theme } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, mode: 'create', item: null });
    const [search, setSearch] = useState('');

    const fetchTasks = async () => {
        try {
            const res = await api.get('cleaning-tasks/');
            setTasks(res.data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSave = async (vals) => {
        try {
            toast.loading('Saving task...');
            if (modal.mode === 'create') {
                await api.post('cleaning-tasks/', { ...vals, status: 'pending', supervised_by: user?.id });
            } else {
                await api.patch(`cleaning-tasks/${modal.item.id}/`, vals);
            }
            toast.dismiss();
            toast.success('Task deployed.');
            setModal({ open: false, item: null });
            fetchTasks();
        } catch (err) {
            toast.dismiss();
            toast.error('Task assignment failed.');
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.patch(`cleaning-tasks/${id}/`, { status });
            toast.success(`Task marked as ${status}`);
            fetchTasks();
        } catch (e) {
            toast.error("Status update failed");
        }
    };

    const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

    const filtered = tasks.filter(t => (t.area || '').toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto">
            <InputModal
                isOpen={modal.open}
                title={modal.mode === 'create' ? "Assign New Protocol" : "Update Operation"}
                fields={[
                    { key: 'area', label: 'Facility Area', placeholder: 'e.g. ICU Wing B', initialValue: modal.item?.area },
                    { key: 'description', label: 'Operation Directives', placeholder: 'Deep sanitize operating theater...', initialValue: modal.item?.description },
                ]}
                onConfirm={handleSave}
                onCancel={() => setModal({ open: false, item: null })}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold" style={{ color: 'var(--luna-text-main)' }}>Facility Operations</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--luna-text-muted)' }}>Sanitation & Maintenance Directives</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search zones..."
                            className="pl-10 pr-4 py-2 text-sm rounded-xl border outline-none"
                            style={{ background: 'var(--luna-navy)', borderColor: 'var(--luna-border)', color: 'var(--luna-text-main)' }} />
                    </div>
                    {isAdminOrSupervisor && (
                        <button onClick={() => setModal({ open: true, mode: 'create', item: null })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase text-white hover:opacity-90 transition-all shadow-lg bg-indigo-500">
                            <Plus className="w-4 h-4" /> Deploy Task
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(loading ? Array(3).fill(0) : filtered).map((t, i) => (
                    loading ? <div key={i} className="h-32 rounded-2xl animate-pulse bg-white/5" /> :
                    <div key={t.id} className="p-6 rounded-2xl border flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-1"
                        style={{ background: 'var(--luna-card)', borderColor: 'var(--luna-border)' }}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-extrabold text-[15px] max-w-[70%] truncate" style={{ color: 'var(--luna-text-main)' }}>{t.area}</h3>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                    {t.status || 'Pending'}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold opacity-60 line-clamp-2" style={{ color: 'var(--luna-text-muted)' }}>{t.description}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--luna-border)' }}>
                            <p className="text-[9px] uppercase font-black tracking-widest opacity-40" style={{ color: 'var(--luna-text-muted)' }}>
                                ID: {String(t.id).padStart(5, '0')}
                            </p>
                            {isAdminOrSupervisor && t.status !== 'completed' && (
                                <button onClick={() => handleStatus(t.id, 'completed')}
                                    className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 hover:text-emerald-400">
                                    <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!loading && filtered.length === 0 && (
                 <div className="p-16 text-center rounded-3xl border border-dashed" style={{ borderColor: 'var(--luna-border)' }}>
                     <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--luna-text-muted)' }} />
                     <p className="text-sm font-bold uppercase tracking-widest opacity-40">Zero operational tasks found</p>
                 </div>
            )}
        </motion.div>
    );
};

export default TaskPage;
