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

        renderClimateAlert(maxPrecip, maxWind, maxTemp, totalPrecip);
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

    if (error) {
        bar.className  = 'level-normal';
        title.innerHTML = '<i class="fas fa-wifi"></i> Dados climáticos indisponíveis';
        return;
    }

    let level, icon, titleText, detailText;

    if (maxPrecip >= 60 || maxWind >= 90) {
        level      = 'danger';
        icon       = 'fas fa-tornado';
        titleText  = '⚠ PERIGO — Risco climático extremo';
        detailText = maxWind >= 90
            ? `Ventos de ${maxWind.toFixed(0)} km/h — possível ciclone`
            : `Precipitação de ${maxPrecip.toFixed(1)}mm/h — risco de inundação grave`;
    } else if (maxPrecip >= 30 || maxWind >= 60 || maxTemp >= 40) {
        level      = 'warning';
        icon       = 'fas fa-cloud-bolt';
        titleText  = '▲ ALERTA — Condições climáticas severas';
        detailText = maxPrecip >= 30
            ? `Chuva intensa: ${maxPrecip.toFixed(1)}mm/h previstos`
            : maxWind >= 60
            ? `Vento forte: ${maxWind.toFixed(0)} km/h previstos`
            : `Calor extremo: ${maxTemp.toFixed(0)}°C previsto`;
    } else if (maxPrecip >= 10 || maxWind >= 40 || maxTemp >= 35) {
        level      = 'watch';
        icon       = 'fas fa-cloud-rain';
        titleText  = '● ATENÇÃO — Condições adversas possíveis';
        detailText = maxPrecip >= 10
            ? `Chuva moderada: até ${maxPrecip.toFixed(1)}mm/h`
            : maxWind >= 40
            ? `Vento moderado: até ${maxWind.toFixed(0)} km/h`
            : `Temperatura elevada: até ${maxTemp.toFixed(0)}°C`;
    } else {
        level      = 'normal';
        icon       = 'fas fa-sun';
        titleText  = '✔ Gravataí — Condições climáticas normais';
        detailText = `Chuva: ${totalPrecip.toFixed(1)}mm · Vento: ${maxWind.toFixed(0)} km/h · Temp: ${maxTemp.toFixed(0)}°C`;
    }

    bar.className      = `level-${level}`;
    title.innerHTML    = `<i class="${icon}"></i> ${titleText}`;
    detail.textContent = detailText;

    metrics.innerHTML = `
        <span class="alert-metric"><i class="fas fa-droplet"></i> ${totalPrecip.toFixed(1)}mm</span>
        <span class="alert-metric"><i class="fas fa-wind"></i> ${maxWind.toFixed(0)} km/h</span>
        <span class="alert-metric"><i class="fas fa-temperature-half"></i> ${maxTemp.toFixed(0)}°C</span>
    `;

    const now = new Date();
    updated.textContent = `Atualizado às ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}

// Busca ao carregar e atualiza a cada 30 minutos
document.addEventListener('DOMContentLoaded', () => {
    fetchClimateAlert();
    setInterval(fetchClimateAlert, 30 * 60 * 1000);
});
