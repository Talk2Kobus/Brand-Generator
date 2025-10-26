import React, { useEffect, useState } from 'react';
import type { AnalyticsData } from '../types';
import * as apiService from '../services/apiService';
import { useError } from '../contexts/ErrorContext';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-12">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <p className="text-sm text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
);

export const Analytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showError } = useError();

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const analyticsData = await apiService.getAnalyticsSummary();
                setData(analyticsData);
            } catch (err) {
                showError(err instanceof Error ? err.message : "Failed to load analytics.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [showError]);

    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (!data) {
        return (
             <div className="text-center p-12 bg-gray-800 rounded-lg max-w-lg mx-auto border border-gray-700">
                <h3 className="text-2xl font-bold text-white">Could not load analytics data.</h3>
                <p className="text-gray-400 mt-2">Please try again later.</p>
            </div>
        )
    }
    
    const maxColorCount = Math.max(...data.colorFrequency.map(c => c.count), 1);
    const maxFontCount = Math.max(...data.fontFrequency.map(f => f.count), 1);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-2">Branding Analytics</h2>
                <p className="text-lg text-gray-400">Trends from all brands created by the community.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Total Brands Created" value={data.totalBrands} />
                 <StatCard title="Most Popular Header Font" value={data.fontFrequency.find(f => f.type === 'header')?.name || 'N/A'} />
                 <StatCard title="Most Popular Body Font" value={data.fontFrequency.find(f => f.type === 'body')?.name || 'N/A'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Most Popular Colors</h3>
                    <div className="space-y-3">
                        {data.colorFrequency.map(({ hex, count }) => (
                            <div key={hex} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-md border border-gray-600" style={{ backgroundColor: hex }}></div>
                                <div className="flex-1 bg-gray-700 rounded-full h-4">
                                    <div className="bg-cyan-500 h-4 rounded-full" style={{ width: `${(count / maxColorCount) * 100}%`}}></div>
                                </div>
                                <span className="w-12 text-right font-mono text-gray-300">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                     <h3 className="text-xl font-bold text-white mb-4">Most Popular Fonts</h3>
                     <div className="space-y-3">
                         {data.fontFrequency.map(({ name, type, count }) => (
                            <div key={`${name}-${type}`} className="flex items-center gap-4">
                               <div className="w-24">
                                 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${type === 'header' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}`}>{type}</span>
                               </div>
                                <p className="flex-grow font-semibold text-gray-200">{name}</p>
                                <div className="flex-1 bg-gray-700 rounded-full h-4">
                                    <div className="bg-cyan-500 h-4 rounded-full" style={{ width: `${(count / maxFontCount) * 100}%`}}></div>
                                </div>
                                <span className="w-12 text-right font-mono text-gray-300">{count}</span>
                            </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
    )
}
