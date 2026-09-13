const fs = require('fs');
const path = './pages/admin/AdminUsers.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `<button onClick={() => handleEditClick(user)} className="p-2.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setConfirmDelete({ id: user.id, name: user.name, permanent: false })} className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>`;

const newCode = `<button onClick={() => handleEditClick(user)} className="p-2.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setConfirmDelete({ id: user.id, name: user.name, permanent: false })} className="p-2.5 text-slate-400 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all" title="Archive User">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setConfirmDelete({ id: user.id, name: user.name, permanent: true })} className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Permanently Wipe Profile (Terms Violation)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>`;
content = content.replace(oldCode, newCode);

fs.writeFileSync(path, content);
