import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyDhQs9Kz4LLGaKIhWV9nUiTjlst5YEWhjg",
        authDomain: "gssa-gravatai.firebaseapp.com",
        projectId: "gssa-gravatai",
        storageBucket: "gssa-gravatai.firebasestorage.app",
        messagingSenderId: "650753472587",
        appId: "1:650753472587:web:65b706993648dc602975ce",
        measurementId: "G-2HS4CYEZ9H"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Helper de tradução — usa translations.js se disponível
    const _t = (key) => window.gssaI18n ? window.gssaI18n.t(key) : key;

    let currentUser = null;
    let userRole = null;

    const authModal             = document.getElementById('auth-modal');
    const authButton            = document.getElementById('auth-button');
    const loginFormContainer    = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const loginForm             = document.getElementById('login-form');
    const registerForm          = document.getElementById('register-form');
    const switchToRegister      = document.getElementById('switch-to-register');
    const switchToLogin         = document.getElementById('switch-to-login');
    const userDropdown          = document.getElementById('user-dropdown');
    const userNameDisplay       = document.getElementById('user-name-display');
    const menuLogout            = document.getElementById('menu-logout');
    const fixedLogoutButton     = document.getElementById('fixed-logout-button');

    // ── Formulários Auth ────────────────────────────────────────────────────
    function showLoginForm() {
        if (loginFormContainer && registerFormContainer) {
            loginFormContainer.classList.add('active');
            loginFormContainer.style.display = 'block';
            registerFormContainer.classList.remove('active');
            registerFormContainer.style.display = 'none';
        }
    }

    function showRegisterForm() {
        if (loginFormContainer && registerFormContainer) {
            registerFormContainer.classList.add('active');
            registerFormContainer.style.display = 'block';
            loginFormContainer.classList.remove('active');
            loginFormContainer.style.display = 'none';
        }
    }

    authButton?.addEventListener('click', () => { authModal.style.display = 'block'; showLoginForm(); });
    document.getElementById('close-auth-modal')?.addEventListener('click', () => { authModal.style.display = 'none'; });
    switchToRegister?.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    switchToLogin?.addEventListener('click',    (e) => { e.preventDefault(); showLoginForm(); });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            currentUser = cred.user;
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) userRole = userDoc.data().role;
            authModal.style.display = 'none';
            updateUI();
            refreshPanelIfOpen();
        } catch (error) {
            document.getElementById('login-message').textContent = `Erro: ${error.message}`;
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name            = document.getElementById('register-name').value;
        const email           = document.getElementById('register-email').value;
        const password        = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        const location        = document.getElementById('register-location').value;
        const skills          = document.getElementById('register-skills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const availability    = document.getElementById('register-availability').value;

        if (password !== confirmPassword) {
            document.getElementById('register-message').textContent = 'As senhas não coincidem.';
            return;
        }
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            currentUser = cred.user;
            userRole = 'voluntario';
            await setDoc(doc(db, 'users', currentUser.uid), { name, email, location, skills, availability, role: userRole, createdAt: serverTimestamp() });
            authModal.style.display = 'none';
            updateUI();
            refreshPanelIfOpen();
        } catch (error) {
            document.getElementById('register-message').textContent = `Erro: ${error.message}`;
        }
    });

    async function handleLogout() {
        await signOut(auth);
        currentUser = null;
        userRole = null;
        updateUI();
        refreshPanelIfOpen();
    }
    menuLogout?.addEventListener('click', handleLogout);
    fixedLogoutButton?.addEventListener('click', handleLogout);

    // ── UI ──────────────────────────────────────────────────────────────────
    function updateUI() {
        if (currentUser) {
            if (authButton) authButton.style.display = 'none';
            if (userDropdown) userDropdown.style.display = 'block';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'block';

            const adminPanel     = document.getElementById('menu-admin-panel');
            const superAdminPanel = document.getElementById('menu-super-admin');

            // ✅ Só mostra painel ONG se role === 'ong'
            if (adminPanel) {
                if (userRole === 'ong') { adminPanel.style.display = 'block'; adminPanel.href = 'painel-ong.html'; }
                else { adminPanel.style.display = 'none'; }
            }
            // Painel super-admin só é exibido após confirmação do doc 'superAdmins'
            if (superAdminPanel && userRole !== 'superadmin') superAdminPanel.style.display = 'none';
        } else {
            if (authButton) authButton.style.display = 'block';
            if (userDropdown) userDropdown.style.display = 'none';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'none';
            const adminPanel     = document.getElementById('menu-admin-panel');
            const superAdminPanel = document.getElementById('menu-super-admin');
            if (adminPanel) adminPanel.style.display = 'none';
            if (superAdminPanel) superAdminPanel.style.display = 'none';
        }
    }

    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                userRole = userDoc.data().role;
                if (userNameDisplay) userNameDisplay.textContent = userDoc.data().name || user.email;
            }
            // Verifica super-admin via coleção dedicada
            try {
                const saDoc = await getDoc(doc(db, 'superAdmins', user.uid));
                const saLink = document.getElementById('menu-super-admin');
                if (saDoc.exists()) { if (saLink) saLink.style.display = 'block'; }
                else { if (saLink) saLink.style.display = 'none'; }
            } catch (_) {
                const saLink = document.getElementById('menu-super-admin');
                if (saLink) saLink.style.display = 'none';
            }
            updateUI();
            refreshPanelIfOpen();
        } else {
            userRole = null;
            updateUI();
            refreshPanelIfOpen();
        }
    });

    // ── Tema ────────────────────────────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    function toggleTheme() {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        themeToggle.querySelector('i').classList.toggle('fa-moon', isDark);
        themeToggle.querySelector('i').classList.toggle('fa-sun', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    }
    themeToggle.addEventListener('click', toggleTheme);

    // ── Mapa ────────────────────────────────────────────────────────────────
    const gravataiCoords = [-29.9402, -50.9944];
    const map = L.map('map', { zoomControl: true }).setView(gravataiCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
    }

    let userLocation = null;
    let userMarker   = null;
    const markers    = new Map();
    let ongsData     = [];

    // ── Carrega ONGs ────────────────────────────────────────────────────────
    async function loadOngsFromFirestore() {
        try {
            const q    = query(collection(db, 'ongs'), where('status', '==', 'approved'));
            const snap = await getDocs(q);
            ongsData = [];
            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (!data.coordinates?.lat || !data.coordinates?.lon) return;
                ongsData.push({
                    id:        String(docSnap.id),
                    nome:      data.basicInfo.name,
                    lat:       parseFloat(data.coordinates.lat),
                    lon:       parseFloat(data.coordinates.lon),
                    servicos:  data.services,
                    publico:   data.targetAudience,
                    endereco:  `${data.address.street}, ${data.address.neighborhood} - ${data.address.city}/${data.address.state} - CEP: ${data.address.zip}`,
                    contato:   data.basicInfo.phone,
                    horario:   data.schedule,
                    email:     data.basicInfo.email,
                    cnpj:      data.basicInfo.cnpj,
                    descricao: data.description,
                    capacidade: data.capacity
                });
            });
            // Fallback data.js
            if (typeof ONGS_DATA !== 'undefined' && ONGS_DATA.length > 0) {
                ONGS_DATA.forEach(ong => {
                    if (!ongsData.find(o => o.nome === ong.nome)) {
                        ongsData.push({ ...ong, id: String(ong.id) });
                    }
                });
            }
            addOngsToMap();
        } catch (error) {
            console.error('Erro ao carregar ONGs:', error);
            if (typeof ONGS_DATA !== 'undefined') {
                ongsData = ONGS_DATA.map(o => ({ ...o, id: String(o.id) }));
                addOngsToMap();
            }
        }
    }

    function buildOngPopup(ong) {
        // ✅ Sem variável de serviço no popup — apenas nome e botão traduzido
        return `
            <div style="text-align:center;min-width:150px;">
                <strong style="font-size:1.1em;color:#D9534F;">${ong.nome}</strong><br>
                <button onclick="window.showDetails('${ong.id}')"
                        style="margin-top:8px;padding:6px 12px;background:#D9534F;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                    <i class="fas fa-info-circle"></i> ${_t('popup-see-details')}
                </button>
            </div>
        `;
    }

    function addOngsToMap() {
        markers.forEach(m => m.remove());
        markers.clear();
        ongsData.forEach(ong => {
            const marker = L.marker([ong.lat, ong.lon]).addTo(map);
            markers.set(String(ong.id), marker);
            marker.bindPopup(buildOngPopup(ong));
            marker.on('click', () => showDetails(ong.id));
        });
    }

    // Re-build popups when language changes
    document.addEventListener('gssa-lang-changed', () => {
        ongsData.forEach(ong => {
            const marker = markers.get(String(ong.id));
            if (marker) marker.setPopupContent(buildOngPopup(ong));
        });
        refreshPanelIfOpen();
    });

    // ── Geolocalização ──────────────────────────────────────────────────────
    function locateUser() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lon, accuracy } = position.coords;
                userLocation = { lat, lon };
                const userIcon = L.icon({
                    iconUrl:    'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl:  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize:   [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });
                const popupText = () => `${_t('popup-you-are-here')} (${_t('popup-accuracy')} ${accuracy.toFixed(0)}m)`;
                userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map)
                    .bindPopup(popupText()).openPopup();
                map.setView([lat, lon], 14, { animate: true });
                // Atualiza o popup do marcador do usuário quando o idioma muda
                document.addEventListener('gssa-lang-changed', () => {
                    userMarker?.setPopupContent(popupText());
                });
            },
            (error) => console.warn(`Geolocalização: ${error.message}`)
        );
    }
    locateUser();

    // ── Painel lateral ──────────────────────────────────────────────────────
    const detailsPanel = document.getElementById('details-panel');
    const panelContent = detailsPanel.querySelector('.panel-content');
    const closeButton  = document.getElementById('close-panel');

    function closeDetailsPanel() {
        detailsPanel.classList.remove('open');
        panelContent.innerHTML = '';
        setTimeout(() => map.invalidateSize(), 500);
    }
    closeButton.addEventListener('click', closeDetailsPanel);

    async function showDetails(ongId) {
        const ong = ongsData.find(o => String(o.id) === String(ongId));
        if (!ong) { alert('ONG não encontrada. Tente recarregar a página.'); return; }
        map.setView([ong.lat, ong.lon], 15, { animate: true });

        let distanceHtml = '';
        if (userLocation) {
            const distance = calculateDistance(userLocation.lat, userLocation.lon, ong.lat, ong.lon);
            distanceHtml = `
                <div class="info-block distance-info">
                    <h3><i class="fas fa-route"></i> ${_t('panel-distance-title')}</h3>
                    <p style="font-weight:bold;font-size:1.1em;">${distance} ${_t('panel-km-from-you')}</p>
                    <p style="font-size:.8em;color:var(--text-secondary);">${_t('panel-distance-sub')}</p>
                </div>`;
        }

        let applyButtonHtml = '';
        let existingApplicationId = null;

        if (currentUser && userRole === 'voluntario') {
            const q = query(collection(db, 'applications'),
                where('userId', '==', currentUser.uid),
                where('ongId', '==', String(ong.id)));
            try {
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const inscricaoDoc = snap.docs[0];
                    const inscricao    = inscricaoDoc.data();
                    existingApplicationId = inscricaoDoc.id;
                    const statusText  = inscricao.status === 'approved' ? _t('status-approved') :
                                        inscricao.status === 'rejected' ? _t('status-rejected') : _t('status-pending');
                    const statusColor = inscricao.status === 'approved' ? '#2ECC71' :
                                        inscricao.status === 'rejected' ? '#E74C3C' : '#F1C40F';
                    applyButtonHtml = `
                        <div style="text-align:center;padding:15px;background:rgba(217,83,79,.1);border-radius:8px;margin-top:20px;">
                            <i class="fas fa-info-circle"></i>
                            <strong>${_t('status-label')} <span style="color:${statusColor};">${statusText}</span></strong>
                            ${inscricao.status === 'pending' ? `
                                <button id="cancel-button" class="submit-button" style="margin-top:15px;background:#E74C3C;">
                                    <i class="fas fa-times"></i> ${_t('panel-cancel-button')}
                                </button>` : ''}
                        </div>`;
                } else {
                    applyButtonHtml = `
                        <button id="apply-button" class="submit-button" style="margin-top:20px;">
                            <i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}
                        </button>`;
                }
            } catch (_) {
                applyButtonHtml = `
                    <button id="apply-button" class="submit-button" style="margin-top:20px;">
                        <i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}
                    </button>`;
            }
        } else if (!currentUser) {
            applyButtonHtml = `
                <p style="text-align:center;padding:15px;background:rgba(217,83,79,.1);border-radius:8px;margin-top:20px;">
                    <i class="fas fa-info-circle"></i>
                    <strong>${_t('panel-login-hint')}</strong>
                </p>`;
        }

        panelContent.innerHTML = `
            <h2 class="panel-title">${ong.nome}</h2>
            ${distanceHtml}
            <div class="info-block">
                <h3><i class="fas fa-handshake"></i> ${_t('panel-services-title')}</h3>
                <p>${ong.servicos}</p>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-map-marker-alt"></i> ${_t('panel-address-title')}</h3>
                <p>${ong.endereco}</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ong.endereco)}"
                   target="_blank" class="open-map-button" style="margin-top:10px;">
                    <i class="fas fa-external-link-alt"></i> ${_t('panel-maps-button')}
                </a>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-clock"></i> ${_t('panel-hours-title')}</h3>
                <p>${ong.horario}</p>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-phone-alt"></i> ${_t('panel-contact-title')}</h3>
                <p>${ong.contato}</p>
            </div>
            ${applyButtonHtml}
        `;

        detailsPanel.classList.add('open');
        setTimeout(() => map.invalidateSize(), 500);

        // Cancelar inscrição
        document.getElementById('cancel-button')?.addEventListener('click', async () => {
            if (!confirm(`${_t('panel-cancel-button')}?`)) return;
            const btn = document.getElementById('cancel-button');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            try {
                await deleteDoc(doc(db, 'applications', existingApplicationId));
                showDetails(ong.id);
            } catch (err) {
                alert(`Erro: ${err.message}`);
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-times"></i> ${_t('panel-cancel-button')}`;
            }
        });

        // Inscrever-se
        document.getElementById('apply-button')?.addEventListener('click', async () => {
            if (!confirm(`${_t('panel-apply-button')} — ${ong.nome}?`)) return;
            const btn = document.getElementById('apply-button');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            try {
                await addDoc(collection(db, 'applications'), {
                    ongId:      String(ong.id),
                    ongName:    ong.nome,       // ✅ salva nome para resolver no minhas_inscricoes
                    ongServicos: ong.servicos,
                    userId:     currentUser.uid,
                    status:     'pending',
                    createdAt:  serverTimestamp()
                });
                showDetails(ong.id);
            } catch (err) {
                alert(`Erro: ${err.message}`);
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}`;
            }
        });
    }

    function refreshPanelIfOpen() {
        if (detailsPanel.classList.contains('open')) {
            const titleEl = panelContent.querySelector('.panel-title');
            if (titleEl) {
                const ongId = ongsData.find(o => o.nome === titleEl.textContent)?.id;
                if (ongId) showDetails(ongId);
            }
        }
    }

    loadOngsFromFirestore();

    // ── Pesquisa ────────────────────────────────────────────────────────────
    document.getElementById('search-button').addEventListener('click', () => {
        const q = document.getElementById('search-input').value.trim().toLowerCase();
        const found = ongsData.find(o =>
            o.nome.toLowerCase().includes(q) || o.servicos.toLowerCase().includes(q)
        );
        if (found) {
            const marker = markers.get(String(found.id));
            if (marker) { map.setView(marker.getLatLng(), 15, { animate: true }); marker.openPopup(); }
            showDetails(found.id);
        } else {
            alert('Nenhuma ONG encontrada.');
        }
    });

    window.showDetails = showDetails;

    // ── Dropdown usuário ────────────────────────────────────────────────────
    document.getElementById('user-menu-button')?.addEventListener('click', () => {
        document.getElementById('user-dropdown-menu')?.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
        if (userDropdown && !userDropdown.contains(e.target)) {
            document.getElementById('user-dropdown-menu')?.classList.remove('show');
        }
    });

    // ── Navegação ───────────────────────────────────────────────────────────
    document.getElementById('nav-inscricoes')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) { window.location.href = 'minhas_inscricoes.html'; }
        else { authModal.style.display = 'block'; showLoginForm(); }
    });
    document.getElementById('menu-contacts')?.addEventListener('click', (e) => {
        e.preventDefault(); window.location.href = 'minhas_inscricoes.html';
    });
    document.getElementById('menu-profile')?.addEventListener('click', (e) => {
        e.preventDefault(); window.location.href = 'perfil.html';
    });

    setTimeout(() => map.invalidateSize(), 200);
});

