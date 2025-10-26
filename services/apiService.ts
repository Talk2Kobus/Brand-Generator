// MOCK API Service
// This file simulates a backend API for local development.
// It uses localStorage to persist data.

import type { User, BrandBible, SavedBrand, AnalyticsData } from '../types';

const MOCK_DB = {
    users: [],
    brands: [],
    analytics: [],
};

const loadDb = () => {
    try {
        const db = localStorage.getItem('mock_db');
        if (db) {
            return JSON.parse(db);
        }
    } catch (e) { console.error("Could not load mock DB", e); }
    return MOCK_DB;
};

const saveDb = (db: any) => {
    localStorage.setItem('mock_db', JSON.stringify(db));
};

// --- AUTH ---

export const register = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = loadDb();
            if (db.users.find((u: any) => u.email === email)) {
                return reject(new Error("User with this email already exists."));
            }
            const newUser = { id: `user_${Date.now()}`, email, password }; // Don't store plain passwords in real apps!
            db.users.push(newUser);
            saveDb(db);
            localStorage.setItem('session_token', newUser.id); // Simulate session
            resolve({ id: newUser.id, email: newUser.email });
        }, 500);
    });
};

export const login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = loadDb();
            const user = db.users.find((u: any) => u.email === email && u.password === password);
            if (!user) {
                return reject(new Error("Invalid email or password."));
            }
            localStorage.setItem('session_token', user.id); // Simulate session
            resolve({ id: user.id, email: user.email });
        }, 500);
    });
};

export const loginWithProvider = (provider: 'google' | 'facebook'): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = loadDb();
            const mockEmail = provider === 'google' 
                ? 'social.user.google@example.com' 
                : 'social.user.facebook@example.com';
            
            let user = db.users.find((u: any) => u.email === mockEmail);

            if (!user) {
                // If user doesn't exist, create one (social sign-on often combines register and login)
                user = { 
                    id: `user_${Date.now()}`, 
                    email: mockEmail, 
                    password: `mock_password_${provider}` // In a real app, there'd be no password
                };
                db.users.push(user);
                saveDb(db);
            }
            
            localStorage.setItem('session_token', user.id); // Simulate session
            resolve({ id: user.id, email: user.email });
        }, 500);
    });
};


export const logout = () => {
    localStorage.removeItem('session_token');
};

export const getMe = (): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userId = localStorage.getItem('session_token');
            if (!userId) {
                return reject(new Error("Not authenticated."));
            }
            const db = loadDb();
            const user = db.users.find((u: any) => u.id === userId);
            if (!user) {
                 localStorage.removeItem('session_token');
                 return reject(new Error("Session invalid."));
            }
            resolve({ id: user.id, email: user.email });
        }, 200);
    });
};


// --- BRANDS ---
export const saveBrand = (brandBible: BrandBible, mission: string, companyName: string): Promise<BrandBible> => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await getMe();
            setTimeout(() => {
                const db = loadDb();
                const newBrand = {
                    ...brandBible,
                    id: brandBible.id || `brand_${Date.now()}`,
                    userId: user.id,
                    mission,
                    companyName
                };
                
                const existingIndex = db.brands.findIndex((b: any) => b.id === newBrand.id);
                if (existingIndex > -1) {
                    db.brands[existingIndex] = newBrand; // Update
                } else {
                    db.brands.push(newBrand); // Create
                }
                
                saveDb(db);
                resolve(newBrand);
            }, 500);
        } catch(err) {
            reject(new Error("You must be logged in to save a brand."));
        }
    });
};

export const getUserBrands = (): Promise<SavedBrand[]> => {
     return new Promise(async (resolve, reject) => {
        try {
            const user = await getMe();
            setTimeout(() => {
                const db = loadDb();
                const userBrands = db.brands.filter((b: any) => b.userId === user.id);
                const simplifiedBrands = userBrands.map((b: any) => ({
                    id: b.id,
                    companyName: b.companyName,
                    primaryLogoUrl: b.primaryLogoUrl,
                    primaryColor: b.colorPalette[0]?.hex || '#ffffff',
                }));
                resolve(simplifiedBrands);
            }, 500);
        } catch(err) {
            reject(new Error("You must be logged in to view your library."));
        }
    });
};

export const getBrandById = (id: string): Promise<BrandBible> => {
     return new Promise(async (resolve, reject) => {
        try {
            const user = await getMe();
            setTimeout(() => {
                const db = loadDb();
                const brand = db.brands.find((b: any) => b.id === id && b.userId === user.id);
                if (!brand) {
                    return reject(new Error("Brand not found or you don't have permission to view it."));
                }
                resolve(brand);
            }, 300);
        } catch(err) {
            reject(new Error("Authentication error."));
        }
    });
}


// --- ANALYTICS ---

export const trackAnalyticsEvent = (eventType: string, payload: any): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = loadDb();
            db.analytics.push({
                id: `event_${Date.now()}`,
                eventType,
                payload,
                timestamp: new Date().toISOString()
            });
            saveDb(db);
            resolve();
        }, 100); // Fire-and-forget, so make it quick
    });
};

export const getAnalyticsSummary = (): Promise<AnalyticsData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const db = loadDb();
            const brandEvents = db.analytics.filter((e: any) => e.eventType === 'BRAND_CREATED');

            const colorCounts: { [hex: string]: number } = {};
            const fontCounts: { [name: string]: { header: number, body: number } } = {};

            brandEvents.forEach((event: any) => {
                event.payload.colors.forEach((hex: string) => {
                    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                });
                const { headerFont, bodyFont } = event.payload;
                if (headerFont) {
                    fontCounts[headerFont] = fontCounts[headerFont] || { header: 0, body: 0 };
                    fontCounts[headerFont].header += 1;
                }
                 if (bodyFont) {
                    fontCounts[bodyFont] = fontCounts[bodyFont] || { header: 0, body: 0 };
                    fontCounts[bodyFont].body += 1;
                }
            });

            const colorFrequency = Object.entries(colorCounts)
                .map(([hex, count]) => ({ hex, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
                
            const fontFrequency = Object.entries(fontCounts)
                .flatMap(([name, counts]) => [
                    { name, type: 'header' as const, count: counts.header },
                    { name, type: 'body' as const, count: counts.body }
                ])
                .filter(f => f.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            resolve({
                totalBrands: db.brands.length,
                colorFrequency,
                fontFrequency,
            });
        }, 800);
    });
};