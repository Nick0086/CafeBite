// ─── Free Web Lead Phone & Contact Details Auto-Enricher ──────────────────────

export function extractIndianPhone(text = '') {
    if (!text) return null;

    // Clean HTML tags and entities
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'");

    // Matches e.g. 097264 32463, +91 97264 32463, 09726432463, 9726432463, 0261-2345678
    const phoneRegex = /(?:\+91[\s-]?)?(?:0[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|(?:\+91[\s-]?)?(?:0[\s-]?)?[6-9]\d{9}|0\d{2,4}[\s-]?\d{6,8}/g;

    const matches = cleanText.match(phoneRegex);
    if (!matches || matches.length === 0) return null;

    for (const raw of matches) {
        const digits = raw.replace(/\D/g, '');

        if (digits.length === 10 && /^[6-9]/.test(digits)) {
            return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        if (digits.length === 11 && digits.startsWith('0') && /^0[6-9]/.test(digits)) {
            const mob = digits.slice(1);
            return `+91 ${mob.slice(0, 5)} ${mob.slice(5)}`;
        }
        if (digits.length === 12 && digits.startsWith('91') && /^91[6-9]/.test(digits)) {
            const mob = digits.slice(2);
            return `+91 ${mob.slice(0, 5)} ${mob.slice(5)}`;
        }
        if (digits.length >= 10 && digits.length <= 11) {
            return raw.trim();
        }
    }
    return null;
}

export const enrichLeadContactDetails = async (restaurantName, city = '') => {
    try {
        // Clean name (strip apostrophes, special quotes like Sumul's -> Sumul)
        const cleanName = (restaurantName || '')
            .replace(/['`’"]/g, '')
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const searchQuery = `${cleanName} ${city || 'Surat'} phone number address`.trim();
        
        // Primary Source: Google Search HTML
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&hl=en`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
            const html = await res.text();
            const phone = extractIndianPhone(html);
            if (phone) return { phone };
        }

        // Secondary Source Fallback: DuckDuckGo HTML
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
        const ddgController = new AbortController();
        const ddgTimeoutId = setTimeout(() => ddgController.abort(), 3500);

        const ddgRes = await fetch(ddgUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            },
            signal: ddgController.signal,
        });
        clearTimeout(ddgTimeoutId);

        if (ddgRes.ok) {
            const ddgHtml = await ddgRes.text();
            const ddgPhone = extractIndianPhone(ddgHtml);
            if (ddgPhone) return { phone: ddgPhone };
        }

        return null;
    } catch (err) {
        return null;
    }
};

export const batchEnrichLeads = async (leads, defaultCity = '') => {
    if (!Array.isArray(leads) || leads.length === 0) return leads;

    // Enrich top 15 leads missing phone numbers in parallel
    const enrichedPromises = leads.map(async (lead) => {
        if (!lead.phone) {
            const city = lead.city || defaultCity || 'Surat';
            const details = await enrichLeadContactDetails(lead.restaurant_name, city);
            if (details && details.phone) {
                return {
                    ...lead,
                    phone: details.phone,
                    notes: lead.notes ? `${lead.notes} | Auto-enriched contact.` : 'Auto-enriched phone from web search.',
                };
            }
        }
        return lead;
    });

    return await Promise.all(enrichedPromises);
};
