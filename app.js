// Configuration
const CONFIG = {
    API_BASE_URL: 'https://api.coingecko.com/api/v3',
    UPDATE_INTERVAL: 30000, // 30 seconds
    SUPPORTED_CRYPTOS: [
        'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
        'ripple', 'polkadot', 'dogecoin', 'avalanche-2', 'polygon',
        'litecoin', 'chainlink'
    ],
    FIAT_CURRENCIES: ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf']
};

// State
let priceData = {};
let conversionFactors = {}; // Stores all conversion factors between pairs
let updateInterval = null;
let lastUpdateTime = null;
let lastEditedField = 'from'; // Track which field was last edited

// DOM Elements
const elements = {
    amountFrom: document.getElementById('amountFrom'),
    currencyFrom: document.getElementById('currencyFrom'),
    amountTo: document.getElementById('amountTo'),
    currencyTo: document.getElementById('currencyTo'),
    swapBtn: document.getElementById('swapBtn'),
    darkModeBtn: document.getElementById('darkModeBtn'),
    lastUpdate: document.getElementById('lastUpdate'),
    updateDot: document.getElementById('updateDot'),
    cryptoGrid: document.getElementById('cryptoGrid')
};

// Initialize the app
function init() {
    setupEventListeners();
    loadThemePreference();
    fetchPrices();
    startAutoUpdate();
}

// Setup event listeners
function setupEventListeners() {
    elements.amountFrom.addEventListener('input', () => {
        lastEditedField = 'from';
        updateConversion();
    });
    elements.amountTo.addEventListener('input', () => {
        lastEditedField = 'to';
        updateConversion();
    });
    elements.currencyFrom.addEventListener('change', updateConversion);
    elements.currencyTo.addEventListener('change', updateConversion);
    elements.swapBtn.addEventListener('click', swapCurrencies);
    elements.darkModeBtn.addEventListener('click', toggleTheme);
}

// Fetch prices from CoinGecko API
async function fetchPrices() {
    try {
        showLoadingState();

        const currencies = [...CONFIG.FIAT_CURRENCIES, 'btc', 'eth'].join(',');
        const cryptoIds = CONFIG.SUPPORTED_CRYPTOS.join(',');

        const url = `${CONFIG.API_BASE_URL}/simple/price?ids=${cryptoIds}&vs_currencies=${currencies}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        priceData = data;
        
        // Build comprehensive conversion factors for all pairs
        buildConversionFactors();

        updateConversion();
        updateCryptoGrid();
        updateLastUpdateTime();
        hideLoadingState();

    } catch (error) {
        console.error('Error fetching prices:', error);
        elements.lastUpdate.textContent = 'Error al actualizar precios';
        hideLoadingState();
    }
}

// Build conversion factors for all currency pairs
function buildConversionFactors() {
    conversionFactors = {};
    
    // Get all currencies (crypto + fiat)
    const allCurrencies = [...CONFIG.SUPPORTED_CRYPTOS, ...CONFIG.FIAT_CURRENCIES];
    
    // Build conversion factors for each pair
    allCurrencies.forEach(fromCurrency => {
        conversionFactors[fromCurrency] = {};
        
        allCurrencies.forEach(toCurrency => {
            if (fromCurrency === toCurrency) {
                conversionFactors[fromCurrency][toCurrency] = 1;
            } else {
                const factor = getConversionFactor(fromCurrency, toCurrency);
                if (factor !== null) {
                    conversionFactors[fromCurrency][toCurrency] = factor;
                }
            }
        });
    });
}

// Get conversion factor between two currencies
function getConversionFactor(from, to) {
    const isCryptoFrom = CONFIG.SUPPORTED_CRYPTOS.includes(from);
    const isCryptoTo = CONFIG.SUPPORTED_CRYPTOS.includes(to);
    
    // Crypto to Fiat or Crypto
    if (isCryptoFrom && priceData[from]) {
        if (!isCryptoTo) {
            // Crypto to Fiat - direct price
            return priceData[from][to] || null;
        } else {
            // Crypto to Crypto - use USD as intermediary
            const fromUsd = priceData[from]['usd'];
            const toUsd = priceData[to]['usd'];
            if (fromUsd && toUsd) {
                return fromUsd / toUsd;
            }
        }
    }
    // Fiat to Crypto or Fiat
    else if (!isCryptoFrom) {
        if (isCryptoTo && priceData[to]) {
            // Fiat to Crypto - inverse of crypto to fiat
            const cryptoToFiat = priceData[to][from];
            if (cryptoToFiat) {
                return 1 / cryptoToFiat;
            }
        } else if (!isCryptoTo) {
            // Fiat to Fiat - use BTC as intermediary
            const btcFrom = priceData['bitcoin'] ? priceData['bitcoin'][from] : null;
            const btcTo = priceData['bitcoin'] ? priceData['bitcoin'][to] : null;
            if (btcFrom && btcTo) {
                return btcTo / btcFrom;
            }
        }
    }
    
    return null;
}

// Update conversion calculation
function updateConversion() {
    // Don't update if conversion factors aren't loaded yet
    if (Object.keys(conversionFactors).length === 0) {
        return;
    }
    
    const fromCurrency = elements.currencyFrom.value;
    const toCurrency = elements.currencyTo.value;
    
    if (lastEditedField === 'from') {
        const amountFrom = parseFloat(elements.amountFrom.value);
        const factor = conversionFactors[fromCurrency]?.[toCurrency];
        
        // Only update if we have a valid amount and factor
        if (!isNaN(amountFrom) && amountFrom !== null && factor !== undefined && factor !== null) {
            const result = amountFrom * factor;
            elements.amountTo.value = result;
        } else if (isNaN(amountFrom) || amountFrom === null) {
            // Clear the target field if source is empty/invalid
            elements.amountTo.value = '';
        } else {
            // No conversion factor available
            elements.amountTo.value = '';
        }
    } else {
        const amountTo = parseFloat(elements.amountTo.value);
        const factor = conversionFactors[toCurrency]?.[fromCurrency];
        
        // Only update if we have a valid amount and factor
        if (!isNaN(amountTo) && amountTo !== null && factor !== undefined && factor !== null) {
            const result = amountTo * factor;
            elements.amountFrom.value = result;
        } else if (isNaN(amountTo) || amountTo === null) {
            // Clear the target field if source is empty/invalid
            elements.amountFrom.value = '';
        } else {
            // No conversion factor available
            elements.amountFrom.value = '';
        }
    }
}

// Swap currencies
function swapCurrencies() {
    // Animate button
    elements.swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
        elements.swapBtn.style.transform = 'rotate(0deg) scale(1)';
    }, 300);

    // Swap the currencies
    const tempCurrency = elements.currencyFrom.value;
    elements.currencyFrom.value = elements.currencyTo.value;
    elements.currencyTo.value = tempCurrency;

    // Swap the amounts
    const tempAmount = elements.amountFrom.value;
    elements.amountFrom.value = elements.amountTo.value;
    elements.amountTo.value = tempAmount;

    // Keep the last edited field consistent
    lastEditedField = lastEditedField === 'from' ? 'to' : 'from';

    updateConversion();
}

// Update crypto grid with cards
function updateCryptoGrid() {
    elements.cryptoGrid.innerHTML = '';

    CONFIG.SUPPORTED_CRYPTOS.forEach(cryptoId => {
        const crypto = priceData[cryptoId];
        if (!crypto) return;

        const card = createCryptoCard(cryptoId, crypto);
        elements.cryptoGrid.appendChild(card);
    });
}

// Create a crypto card
function createCryptoCard(cryptoId, crypto) {
    const card = document.createElement('div');
    card.className = 'crypto-card';

    const symbol = getCryptoSymbol(cryptoId);
    const name = getCryptoName(cryptoId);
    const price = crypto.usd;
    const change24h = crypto.usd_24h_change || 0;
    const marketCap = crypto.usd_market_cap;
    const volume24h = crypto.usd_24h_vol;

    const changeClass = change24h >= 0 ? 'positive' : 'negative';
    const changeSign = change24h >= 0 ? '+' : '';

    card.innerHTML = `
        <div class="crypto-card-header">
            <div class="crypto-name">
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${symbol.toLowerCase()}.png"
                     alt="${symbol}"
                     class="crypto-icon"
                     onerror="this.src='https://via.placeholder.com/32/4f46e5/ffffff?text=${symbol.charAt(0)}'">
                <div>
                    <div class="crypto-symbol">${symbol}</div>
                    <div class="crypto-full-name">${name}</div>
                </div>
            </div>
            <div class="crypto-change ${changeClass}">
                ${changeSign}${change24h.toFixed(2)}%
            </div>
        </div>
        <div class="crypto-price">$${formatNumber(price, 'usd')}</div>
        <div class="crypto-stats">
            <div class="crypto-stat">
                <div class="crypto-stat-label">Market Cap</div>
                <div class="crypto-stat-value">${marketCap ? '$' + formatLargeNumber(marketCap) : 'N/A'}</div>
            </div>
            <div class="crypto-stat">
                <div class="crypto-stat-label">Volume 24h</div>
                <div class="crypto-stat-value">${volume24h ? '$' + formatLargeNumber(volume24h) : 'N/A'}</div>
            </div>
        </div>
    `;

    // Click to select this crypto in converter
    card.addEventListener('click', () => {
        elements.currencyFrom.value = cryptoId;
        lastEditedField = 'from';
        updateConversion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return card;
}

// Get crypto symbol from ID
function getCryptoSymbol(cryptoId) {
    const symbolMap = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'binancecoin': 'BNB',
        'cardano': 'ADA',
        'solana': 'SOL',
        'ripple': 'XRP',
        'polkadot': 'DOT',
        'dogecoin': 'DOGE',
        'avalanche-2': 'AVAX',
        'polygon': 'MATIC',
        'litecoin': 'LTC',
        'chainlink': 'LINK'
    };
    return symbolMap[cryptoId] || cryptoId.toUpperCase();
}

// Get crypto full name
function getCryptoName(cryptoId) {
    const nameMap = {
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        'binancecoin': 'BNB',
        'cardano': 'Cardano',
        'solana': 'Solana',
        'ripple': 'XRP',
        'polkadot': 'Polkadot',
        'dogecoin': 'Dogecoin',
        'avalanche-2': 'Avalanche',
        'polygon': 'Polygon',
        'litecoin': 'Litecoin',
        'chainlink': 'Chainlink'
    };
    return nameMap[cryptoId] || cryptoId;
}

// Format number with appropriate decimals
function formatNumber(num, currency) {
    if (!num || isNaN(num)) return '0';

    // For very small numbers, show more decimals
    if (num < 0.01) {
        return num.toFixed(8);
    } else if (num < 1) {
        return num.toFixed(6);
    } else if (num < 100) {
        return num.toFixed(4);
    } else {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

// Format large numbers (K, M, B)
function formatLargeNumber(num) {
    if (!num) return 'N/A';

    const absNum = Math.abs(num);

    if (absNum >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (absNum >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (absNum >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (absNum >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    } else {
        return num.toFixed(2);
    }
}

// Update last update time
function updateLastUpdateTime() {
    lastUpdateTime = new Date();
    const timeString = lastUpdateTime.toLocaleTimeString('es-ES');
    elements.lastUpdate.textContent = `Última actualización: ${timeString}`;
}

// Start auto-update
function startAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    updateInterval = setInterval(() => {
        fetchPrices();
    }, CONFIG.UPDATE_INTERVAL);
}

// Loading states
function showLoadingState() {
    document.body.classList.add('loading');
}

function hideLoadingState() {
    document.body.classList.remove('loading');
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}