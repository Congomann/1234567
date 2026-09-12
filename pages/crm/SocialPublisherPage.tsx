import React from 'react';
import { OmnichannelPublisher } from '../../components/marketing/OmnichannelPublisher';
import { useData } from '../../context/DataContext';

import { UserRole } from '../../types';

export const SocialPublisherPage: React.FC = () => {
    const { user } = useData();

    if (user?.role !== UserRole.ADMIN && !(user as any)?.socialPublisherAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 m-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🛡️</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h1>
                <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                    Social Publisher is an administrative tool. You must be an Administrator or have explicit access granted to use this module.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-900">Social Publisher</h1>
            </div>
            <p className="text-slate-600 mb-8">
                Distribute your marketing content across all your connected social platforms simultaneously.
            </p>
            <OmnichannelPublisher />
        </div>
    );
};
