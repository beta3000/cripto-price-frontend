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
let updateInterval = null;
let lastUpdateTime = null;

// DOM Elements
const elements = {
    amountFrom: document.getElementById('amountFrom'),
    cryptoFrom: document.getElementById('cryptoFrom'),
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
    elements.amountFrom.addEventListener('input', updateConversion);
    elements.cryptoFrom.addEventListener('change', updateConversion);
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

// Update conversion calculation
function updateConversion() {
    const amount = parseFloat(elements.amountFrom.value) || 0;
    const cryptoId = elements.cryptoFrom.value;
    const currencyId = elements.currencyTo.value.toLowerCase();

    if (!priceData[cryptoId]) {
        elements.amountTo.textContent = '0';
        return;
    }

    const price = priceData[cryptoId][currencyId];

    if (price) {
        const result = amount * price;
        elements.amountTo.textContent = formatNumber(result, currencyId);
    } else {
        elements.amountTo.textContent = 'N/A';
    }
}

// Swap currencies
function swapCurrencies() {
    // Animate button
    elements.swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
        elements.swapBtn.style.transform = 'rotate(0deg) scale(1)';
    }, 300);

    const currentCrypto = elements.cryptoFrom.value;
    const currentCurrency = elements.currencyTo.value;

    // Check if we can swap (only if currency is BTC or ETH)
    if (currentCurrency.toLowerCase() === 'btc' || currentCurrency.toLowerCase() === 'eth') {
        // Find the crypto option that matches the current currency
        const currencyMap = {
            'btc': 'bitcoin',
            'eth': 'ethereum'
        };

        const newCrypto = currencyMap[currentCurrency.toLowerCase()];

        if (newCrypto) {
            // Get the symbol of the current crypto before swapping
            const currentCryptoOption = elements.cryptoFrom.querySelector(`option[value="${currentCrypto}"]`);
            const cryptoSymbol = currentCryptoOption ? currentCryptoOption.dataset.symbol : null;

            // Swap the values
            elements.cryptoFrom.value = newCrypto;

            if (cryptoSymbol) {
                // Los valores del select usan lowercase
                elements.currencyTo.value = cryptoSymbol.toLowerCase();
            }

            updateConversion();
        }
    }
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
        elements.cryptoFrom.value = cryptoId;
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