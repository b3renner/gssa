// climate.js — Sistema de Alertas Climáticos GSSA

const GRAVATAI_LAT = -29.9402;
const GRAVATAI_LON = -50.9944;

async function fetchClimateAlert() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${GRAVATAI_LAT}&longitude=${GRAVATAI_LON}&hourly=precipitation,windspeed_10m,temperature_2m&forecast_days=1&timezone=America%2FSao_Paulo`;

    try {
        const res  = await fetch(url);
        const data = await res.json();

        const precip = data.hourly.precipitation;
        const wind   = data.hourly.windspeed_10m;
        const temp   = data.hourly.temperature_2m;

        const maxPrecip   = Math.max(...precip);
        const maxWind     = Math.max(...wind);
        const maxTemp     = Math.max(...temp);
        const totalPrecip = precip.reduce((a, b) => a + b, 0);

        window._lastClimateData = { maxPrecip: 15, maxWind: 20, maxTemp: 28, totalPrecip: 15 };
renderClimateAlert(15, 20, 28, 15);
syncPrepCenter('watch', 15, 20, 28);

    } catch (err) {
        console.warn('Erro ao buscar dados climáticos:', err);
        renderClimateAlert(0, 0, 0, 0, true);
    }
}

function renderClimateAlert(maxPrecip, maxWind, maxTemp, totalPrecip, error = false) {
    const bar     = document.getElementById('climate-alert-bar');
    const title   = document.getElementById('alert-title');
    const detail  = document.getElementById('alert-detail');
    const metrics = document.getElementById('alert-metrics');
    const updated = document.getElementById('alert-updated');
    const _t      = (k) => window.gssaI18n ? window.gssaI18n.t(k) : k;

    if (error) {
        bar.className   = 'level-normal';
        title.innerHTML = `<i class="fas fa-wifi"></i> ${_t('climate-unavailable')}`;
        return;
    }

    let level, icon, titleText, detailText;

    if (maxPrecip >= 60 || maxWind >= 90) {
        level     = 'danger';
        icon      = 'fas fa-tornado';
        titleText = _t('climate-danger');
        detailText = maxWind >= 90
            ? `${_t('climate-detail-wind-cyc')} ${maxWind.toFixed(0)} ${_t('climate-kmh')} ${_t('climate-detail-wind-suf')}`
            : `${_t('climate-detail-rain-tor')} ${maxPrecip.toFixed(1)}mm/h ${_t('climate-detail-flood')}`;
    } else if (maxPrecip >= 30 || maxWind >= 60 || maxTemp >= 40) {
        level     = 'warning';
        icon      = 'fas fa-cloud-bolt';
        titleText = _t('climate-warning');
        detailText = maxPrecip >= 30
            ? `${_t('climate-detail-rain-int')} ${maxPrecip.toFixed(1)}mm/h ${_t('climate-detail-fcast')}`
            : maxWind >= 60
            ? `${_t('climate-detail-wind-str')} ${maxWind.toFixed(0)} ${_t('climate-kmh')} ${_t('climate-detail-fcast')}`
            : `${_t('climate-detail-heat-ext')} ${maxTemp.toFixed(0)}°C ${_t('climate-detail-fcast')}`;
    } else if (maxPrecip >= 10 || maxWind >= 40 || maxTemp >= 35) {
        level     = 'watch';
        icon      = 'fas fa-cloud-rain';
        titleText = _t('climate-watch');
        detailText = maxPrecip >= 10
            ? `${_t('climate-detail-rain-mod')} ${maxPrecip.toFixed(1)}mm/h`
            : maxWind >= 40
            ? `${_t('climate-detail-wind-mod')} ${maxWind.toFixed(0)} ${_t('climate-kmh')}`
            : `${_t('climate-detail-heat')} ${maxTemp.toFixed(0)}°C`;
    } else {
        level     = 'normal';
        icon      = 'fas fa-sun';
        titleText = _t('climate-normal');
        detailText = `${_t('climate-normal-detail')} ${totalPrecip.toFixed(1)}${_t('climate-mm')} · ${maxWind.toFixed(0)} ${_t('climate-kmh')} · ${maxTemp.toFixed(0)}°C`;
    }

    bar.className      = `level-${level}`;
    title.innerHTML    = `<i class="${icon}"></i> ${titleText}`;
    detail.textContent = detailText;

    metrics.innerHTML = `
        <span class="alert-metric"><i class="fas fa-droplet"></i> ${totalPrecip.toFixed(1)}${_t('climate-mm')}</span>
        <span class="alert-metric"><i class="fas fa-wind"></i> ${maxWind.toFixed(0)} ${_t('climate-kmh')}</span>
        <span class="alert-metric"><i class="fas fa-temperature-half"></i> ${maxTemp.toFixed(0)}°C</span>
    `;

    const now = new Date();
    updated.textContent = `${_t('climate-updated')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}

// Busca ao carregar e atualiza a cada 30 minutos
document.addEventListener('DOMContentLoaded', () => {
    fetchClimateAlert();
    setInterval(fetchClimateAlert, 30 * 60 * 1000);

});

document.addEventListener('gssa-lang-changed', () => {
    if (window._lastClimateData) {
        const { maxPrecip, maxWind, maxTemp, totalPrecip } = window._lastClimateData;
        renderClimateAlert(maxPrecip, maxWind, maxTemp, totalPrecip);
        const level =
            maxPrecip >= 60 || maxWind >= 90               ? 'danger'  :
            maxPrecip >= 30 || maxWind >= 60 || maxTemp >= 40 ? 'warning' :
            maxPrecip >= 10 || maxWind >= 40 || maxTemp >= 35 ? 'watch'   : 'normal';
        syncPrepCenter(level, maxPrecip, maxWind, maxTemp);
    }
});

// ── Integração com a Central de Preparação ── //
function syncPrepCenter(level, maxPrecip, maxWind, maxTemp) {
    const notice     = document.getElementById('prep-alert-notice');
    const noticeText = document.getElementById('prep-alert-notice-text');
    const buttons    = document.querySelectorAll('.event-selector button');
    const _t         = (k) => window.gssaI18n ? window.gssaI18n.t(k) : k;

    buttons.forEach(b => b.classList.remove('alert-active'));

    if (level === 'normal') {
        if (notice) notice.classList.remove('show');
        return;
    }

    let dominantEvent = 'enchente';
    let noticeMsg     = '';

    if (maxWind >= 40) {
        dominantEvent = 'ciclone';
        noticeMsg     = _t('prep-notice-ciclone').replace('{val}', maxWind.toFixed(0));
    } else if (maxTemp >= 35) {
        dominantEvent = 'calor';
        noticeMsg     = _t('prep-notice-calor').replace('{val}', maxTemp.toFixed(0));
    } else if (maxPrecip >= 10) {
        dominantEvent = 'enchente';
        noticeMsg     = _t('prep-notice-enchente').replace('{val}', maxPrecip.toFixed(1));
    }

    const activeBtn = document.querySelector(`.event-selector button[data-event="${dominantEvent}"]`);
    if (activeBtn) activeBtn.classList.add('alert-active');

    if (notice && noticeText) {
        noticeText.textContent = noticeMsg;
        notice.classList.add('show');
    }

    selectPrepEvent(dominantEvent);
}

function selectPrepEvent(eventId) {
    // Atualiza botões
    document.querySelectorAll('.event-selector button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.event === eventId);
    });

    // Troca painel
    document.querySelectorAll('.prep-event-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${eventId}`);
    });
}

// Expõe globalmente para o onclick do HTML
window.selectPrepEvent = selectPrepEvent;
