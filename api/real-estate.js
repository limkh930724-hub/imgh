const REGION_CODES = {
    '서울 성동구': '11200',
    '서울 마포구': '11440',
    '서울 강동구': '11740',
    '서울 송파구': '11710',
    '서울 동작구': '11590',
    '경기 분당구': '41135',
    '경기 과천시': '41290',
    '경기 용인시 수지구': '41465',
};

const DEFAULT_MONTHS = 6;
const DEFAULT_PAGE_SIZE = 100;
const SALE_ENDPOINT = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';
const RENT_ENDPOINT = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent';

const MOCK_ITEMS = [
    { id: 'deal-001', region: '서울 성동구', address: '서울특별시 성동구 행당동 380', aptName: '서울숲리버뷰자이', dealType: 'SALE', areaSize: 84, floor: 15, dealAmount: 1460000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-18', status: '정상', source: 'Mock JSON' },
    { id: 'deal-002', region: '서울 성동구', address: '서울특별시 성동구 금호동1가 633', aptName: '금호자이1차', dealType: 'SALE', areaSize: 59, floor: 11, dealAmount: 1180000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-10', status: '정상', source: 'Mock JSON' },
    { id: 'deal-003', region: '서울 마포구', address: '서울특별시 마포구 염리동 498', aptName: '마포프레스티지자이', dealType: 'SALE', areaSize: 84, floor: 19, dealAmount: 1510000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-21', status: '정상', source: 'Mock JSON' },
    { id: 'deal-004', region: '서울 강동구', address: '서울특별시 강동구 고덕동 688', aptName: '고덕그라시움', dealType: 'RENT', areaSize: 84, floor: 9, dealAmount: 0, depositAmount: 730000000, monthlyRent: 0, dealDate: '2026-03-14', status: '정상', source: 'Mock JSON' },
    { id: 'deal-005', region: '서울 송파구', address: '서울특별시 송파구 잠실동 22', aptName: '리센츠', dealType: 'SALE', areaSize: 84, floor: 18, dealAmount: 2120000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-08', status: '고가권', source: 'Mock JSON' },
    { id: 'deal-006', region: '서울 동작구', address: '서울특별시 동작구 흑석동 340', aptName: '흑석한강푸르지오', dealType: 'SALE', areaSize: 84, floor: 12, dealAmount: 1650000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-12', status: '정상', source: 'Mock JSON' },
    { id: 'deal-007', region: '경기 분당구', address: '경기도 성남시 분당구 정자동 178', aptName: '파크뷰', dealType: 'SALE', areaSize: 101, floor: 23, dealAmount: 1340000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-11', status: '정상', source: 'Mock JSON' },
    { id: 'deal-008', region: '경기 과천시', address: '경기도 과천시 별양동 7', aptName: '래미안슈르', dealType: 'SALE', areaSize: 84, floor: 21, dealAmount: 1780000000, depositAmount: 0, monthlyRent: 0, dealDate: '2026-03-05', status: '고가권', source: 'Mock JSON' },
    { id: 'deal-009', region: '경기 용인시 수지구', address: '경기도 용인시 수지구 풍덕천동 1024', aptName: '수지푸르지오월드마크', dealType: 'RENT', areaSize: 84, floor: 14, dealAmount: 0, depositAmount: 580000000, monthlyRent: 0, dealDate: '2026-03-09', status: '정상', source: 'Mock JSON' },
];

export default async function handler(req, res) {
    const filters = normalizeFilters(req.query || {});

    try {
        const result = await getRealEstateItems(filters);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
        res.status(200).json({
            source: result.source,
            updatedAt: new Date().toISOString(),
            totalCount: result.data.length,
            items: applyFilters(result.data, filters),
        });
    } catch (error) {
        const fallback = applyFilters(MOCK_ITEMS, filters);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        res.status(200).json({
            source: 'Mock Real Estate API (fallback)',
            updatedAt: new Date().toISOString(),
            totalCount: fallback.length,
            error: error.message,
            items: fallback,
        });
    }
}

function normalizeFilters(query) {
    return {
        region: String(query.region || '').trim(),
        dealType: String(query.dealType || '').trim(),
        area: String(query.area || '').trim(),
        keyword: String(query.keyword || '').trim(),
        months: Math.max(1, Math.min(Number(query.months || DEFAULT_MONTHS), 12)),
    };
}

async function getRealEstateItems(filters) {
    const serviceKey = process.env.DATA_GO_KR_API_KEY || process.env.PUBLIC_DATA_API_KEY || '';
    if (!serviceKey) {
        return {
            source: 'Mock Real Estate API',
            data: MOCK_ITEMS,
        };
    }

    const regions = filters.region ? [filters.region] : Object.keys(REGION_CODES);
    const months = buildRecentMonths(filters.months);
    const types = filters.dealType === 'SALE' ? ['SALE'] : filters.dealType === 'RENT' ? ['RENT'] : ['SALE', 'RENT'];

    const tasks = [];
    regions.forEach((region) => {
        const lawdCd = REGION_CODES[region];
        if (!lawdCd) return;
        months.forEach((ym) => {
            types.forEach((dealType) => {
                tasks.push(fetchDealsByMonth({ region, lawdCd, ym, dealType, serviceKey }));
            });
        });
    });

    const settled = await Promise.allSettled(tasks);
    const successful = settled
        .filter((item) => item.status === 'fulfilled')
        .flatMap((item) => item.value);

    if (!successful.length) {
        throw new Error('No public real estate items fetched');
    }

    return {
        source: 'Public Data API',
        data: dedupeItems(successful),
    };
}

async function fetchDealsByMonth({ region, lawdCd, ym, dealType, serviceKey }) {
    const endpoint = dealType === 'SALE' ? SALE_ENDPOINT : RENT_ENDPOINT;
    const url = new URL(endpoint);
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('LAWD_CD', lawdCd);
    url.searchParams.set('DEAL_YMD', ym);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', String(DEFAULT_PAGE_SIZE));

    const response = await fetch(url.toString(), {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/xml, text/xml, */*',
        },
    });

    if (!response.ok) {
        throw new Error('Public API request failed: ' + response.status);
    }

    const xml = await response.text();
    return matchTagBlocks(xml, 'item')
        .map((itemXml) => toDealItem(itemXml, { region, dealType }))
        .filter(Boolean);
}

function toDealItem(itemXml, meta) {
    const aptName = readTag(itemXml, '아파트') || readTag(itemXml, 'aptNm');
    const dong = readTag(itemXml, '법정동') || readTag(itemXml, 'umdNm');
    const jibun = readTag(itemXml, '지번') || readTag(itemXml, 'jibun');
    const area = readFloat(readTag(itemXml, '전용면적') || readTag(itemXml, 'excluUseAr'));
    const floor = readInt(readTag(itemXml, '층') || readTag(itemXml, 'floor'));
    const year = readTag(itemXml, '년') || readTag(itemXml, 'dealYear');
    const month = pad2(readTag(itemXml, '월') || readTag(itemXml, 'dealMonth'));
    const day = pad2(readTag(itemXml, '일') || readTag(itemXml, 'dealDay'));
    const dealDate = year ? [year, month, day].join('-') : '';

    if (!aptName || !area || !dealDate) return null;

    if (meta.dealType === 'SALE') {
        const dealAmount = parseTenThousand(readTag(itemXml, '거래금액') || readTag(itemXml, 'dealAmount'));
        if (!dealAmount) return null;
        return {
            id: ['sale', meta.region, aptName, dealDate, area, floor].join('-'),
            region: meta.region,
            address: [meta.region, dong, jibun].filter(Boolean).join(' '),
            aptName,
            dealType: 'SALE',
            areaSize: roundArea(area),
            floor: floor || 0,
            dealAmount,
            depositAmount: 0,
            monthlyRent: 0,
            dealDate,
            status: dealAmount >= 1500000000 ? '고가권' : '정상',
            source: 'Public Data API',
        };
    }

    const depositAmount = parseTenThousand(readTag(itemXml, '보증금액') || readTag(itemXml, 'deposit'));
    const monthlyRent = parseTenThousand(readTag(itemXml, '월세금액') || readTag(itemXml, 'monthlyRent'));
    if (!depositAmount && !monthlyRent) return null;

    return {
        id: ['rent', meta.region, aptName, dealDate, area, floor].join('-'),
        region: meta.region,
        address: [meta.region, dong, jibun].filter(Boolean).join(' '),
        aptName,
        dealType: 'RENT',
        areaSize: roundArea(area),
        floor: floor || 0,
        dealAmount: 0,
        depositAmount,
        monthlyRent,
        dealDate,
        status: '정상',
        source: 'Public Data API',
    };
}

function applyFilters(items, filters) {
    const keyword = filters.keyword.toLowerCase();
    return items.filter((item) => {
        if (filters.region && item.region !== filters.region) return false;
        if (filters.dealType && item.dealType !== filters.dealType) return false;
        if (filters.area && String(item.areaSize) !== String(filters.area)) return false;
        if (keyword) {
            const matched = item.aptName.toLowerCase().includes(keyword)
                || item.address.toLowerCase().includes(keyword);
            if (!matched) return false;
        }
        return true;
    });
}

function dedupeItems(items) {
    const map = new Map();
    items.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
}

function buildRecentMonths(months) {
    const list = [];
    const now = new Date();
    for (let i = 0; i < months; i += 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        list.push(String(d.getFullYear()) + pad2(d.getMonth() + 1));
    }
    return list;
}

function matchTagBlocks(xml, tagName) {
    const regex = new RegExp('<' + tagName + '>([\\s\\S]*?)<\\/' + tagName + '>', 'g');
    return Array.from(xml.matchAll(regex)).map((match) => match[1]);
}

function readTag(xml, tagName) {
    const match = xml.match(new RegExp('<' + tagName + '>([\\s\\S]*?)<\\/' + tagName + '>'));
    if (!match) return '';
    return decodeXml(match[1]).trim();
}

function decodeXml(value) {
    return value
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function parseTenThousand(value) {
    if (!value) return 0;
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    if (!numeric) return 0;
    return numeric * 10000;
}

function readFloat(value) {
    const numeric = Number(String(value || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
}

function readInt(value) {
    const numeric = Number(String(value || '').replace(/[^\d-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
}

function roundArea(area) {
    return Math.round(area);
}

function pad2(value) {
    return String(value || '').padStart(2, '0');
}
