import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc,
         updateDoc, setDoc, deleteDoc, query, where,
         serverTimestamp, Timestamp }
    from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
document.addEventListener('DOMContentLoaded', () => {

   async function loadOngPopups() {
    console.log('🔔 loadOngPopups iniciada');
    try {
        const snapshot = await getDocs(collection(db, 'ong_popups'));
        console.log('📦 popups encontrados:', snapshot.size);
        // ...
    async function loadOngPopups() {
        try {
            const snapshot = await getDocs(collection(db, 'ong_popups'));
            const now = new Date();

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const expires = data.expiresAt?.toDate();
                if (!expires || expires < now) return;

                const marker = markers.get(String(data.ongId));
                if (!marker) return;

                const _t = (k) => window.gssaI18n ? window.gssaI18n.t(k) : k;
                const lang = window.gssaI18n ? window.gssaI18n.currentLang() : 'pt';

                const occupationHtml = data.occupation?.max
                    ? `<div style="font-size:0.9em; font-weight:700; color:#D9534F; margin-bottom:6px;">
                           <i class="fas fa-users"></i>
                           ${_t('popup-occupancy-label')} ${data.occupation.current}/${data.occupation.max}
                       </div>`
                    : '';

                const popupHtml = `
                    <div style="max-width:220px; font-family:inherit;">
                        ${occupationHtml}
                        <div style="font-size:0.88em; line-height:1.5; margin-bottom:8px;">
                            ${data.message}
                        </div>
                        <div style="font-size:0.75em; opacity:0.6;">
                            <i class="fas fa-clock"></i>
                            ${_t('popup-expires-at')} ${expires.toLocaleString(
                                lang === 'en' ? 'en-US' : 'pt-BR'
                            )}
                        </div>
                    </div>
                `;

                marker.bindPopup(popupHtml).openPopup();
            });
        } catch (e) {
            console.warn('Erro ao carregar popups:', e);
        }
    }


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
    console.log("Firebase inicializado com sucesso.");

    let currentUser = null;
    let userRole = null;

    const authModal = document.getElementById('auth-modal');
    const authButton = document.getElementById('auth-button');
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const userDropdown = document.getElementById('user-dropdown');
    const userNameDisplay = document.getElementById('user-name-display');
    const menuLogout = document.getElementById('menu-logout');
    const fixedLogoutButton = document.getElementById('fixed-logout-button');


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

    authButton?.addEventListener('click', () => {
        authModal.style.display = 'block';
        showLoginForm();
    });

    document.getElementById('close-auth-modal')?.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            currentUser = userCredential.user;
            
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                userRole = userDoc.data().role;
            }
            
            console.log('Login bem-sucedido:', currentUser.uid, 'Role:', userRole);
            authModal.style.display = 'none';
            updateUI();
            refreshPanelIfOpen();
        } catch (error) {
            document.getElementById('login-message').textContent = `Erro: ${error.message}`;
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        const location = document.getElementById('register-location').value;
        const skills = document.getElementById('register-skills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const availability = document.getElementById('register-availability').value;

        if (password !== confirmPassword) {
            document.getElementById('register-message').textContent = 'As senhas não coincidem.';
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            currentUser = userCredential.user;
            userRole = 'voluntario';
            
            await setDoc(doc(db, 'users', currentUser.uid), {
                name: name,
                email: email,
                location: location,
                skills: skills,
                availability: availability,
                role: userRole,
                createdAt: serverTimestamp()
            });
            
            console.log('Cadastro bem-sucedido:', currentUser.uid, 'Role:', userRole);
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
        console.log('Logout realizado');
        updateUI();
        refreshPanelIfOpen();
    }

    menuLogout?.addEventListener('click', handleLogout);
    fixedLogoutButton?.addEventListener('click', handleLogout);

    function updateUI() {
        if (currentUser) {
            if (authButton) authButton.style.display = 'none';
            if (userDropdown) userDropdown.style.display = 'block';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'block';
            
            const adminPanel = document.getElementById('menu-admin-panel');
            const superAdminPanel = document.getElementById('menu-super-admin');

            // ✅ FIX: só mostra painel ONG se role for exatamente 'ong'
            if (adminPanel) {
                if (userRole === 'ong') {
                    adminPanel.style.display = 'block';
                    adminPanel.href = 'painel-ong.html';
                } else {
                    adminPanel.style.display = 'none';
                }
            }

            // ✅ FIX: painel super-admin nunca aparece aqui — só é exibido
            // após confirmação do doc 'superAdmins' no onAuthStateChanged
            if (superAdminPanel && userRole !== 'superadmin') {
                superAdminPanel.style.display = 'none';
            }
        } else {
            if (authButton) authButton.style.display = 'block';
            if (userDropdown) userDropdown.style.display = 'none';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'none';
            
            const adminPanel = document.getElementById('menu-admin-panel');
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
                if (userNameDisplay) {
                    userNameDisplay.textContent = userDoc.data().name || user.email;
                }
            }

            // Verifica super-admin apenas no Firestore — nunca pela role do users doc
            try {
                const superAdminDoc = await getDoc(doc(db, 'superAdmins', user.uid));
                const superAdminLink = document.getElementById('menu-super-admin');
                if (superAdminDoc.exists()) {
                    if (superAdminLink) superAdminLink.style.display = 'block';
                    console.log(' Super-Admin detectado!');
                } else {
                    if (superAdminLink) superAdminLink.style.display = 'none';
                }
            } catch (error) {
                const superAdminLink = document.getElementById('menu-super-admin');
                if (superAdminLink) superAdminLink.style.display = 'none';
                console.log('Não é super-admin ou erro ao verificar:', error);
            }
            
            console.log('Estado autenticado:', currentUser.uid, 'Role:', userRole);
            updateUI();
            refreshPanelIfOpen();
        } else {
            userRole = null;
            console.log('Estado não autenticado');
            updateUI();
            refreshPanelIfOpen();
        }
    });

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    function toggleTheme() {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        const icon = themeToggle.querySelector('i');
        
        if (isDarkMode) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
    }
    
    themeToggle.addEventListener('click', toggleTheme);


    const gravataiCoords = [-29.9402, -50.9944];
    const initialZoom = 13;
    const map = L.map('map', { zoomControl: true }).setView(gravataiCoords, initialZoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    }

    let userLocation = null;
let userMarker = null;
let userAccuracy = null;
    const markers = new Map();
    let ongsData = [];

    async function loadOngsFromFirestore() {
        try {
            console.log(' Carregando ONGs do Firestore...');
            const ongsRef = collection(db, 'ongs');
            const q = query(ongsRef, where('status', '==', 'approved'));
            const snapshot = await getDocs(q);

            console.log(` ${snapshot.size} ONGs aprovadas encontradas`);

            ongsData = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                console.log(' ONG encontrada:', data.basicInfo.name, 'ID:', docSnap.id);
                
                if (!data.coordinates || !data.coordinates.lat || !data.coordinates.lon) {
                    console.warn(' ONG sem coordenadas:', data.basicInfo.name);
                    return;
                }

                const ongFormatted = {
                    id: String(docSnap.id),
                    nome: data.basicInfo.name,
                    lat: parseFloat(data.coordinates.lat),
                    lon: parseFloat(data.coordinates.lon),
                    servicos: data.services,
                    publico: data.targetAudience,
                    endereco: `${data.address.street}, ${data.address.neighborhood} - ${data.address.city}/${data.address.state} - CEP: ${data.address.zip}`,
                    contato: data.basicInfo.phone,
                    horario: data.schedule,
                    email: data.basicInfo.email,
                    cnpj: data.basicInfo.cnpj,
                    descricao: data.description,
                    capacidade: data.capacity
                };

                console.log(' ONG formatada:', ongFormatted);
                ongsData.push(ongFormatted);
            });

            console.log(` ${ongsData.length} ONGs carregadas e formatadas`);

            if (typeof ONGS_DATA !== 'undefined' && ONGS_DATA.length > 0) {
                console.log(' Adicionando ONGs estáticas do data.js...');
                ONGS_DATA.forEach(ong => {
                    if (!ongsData.find(o => o.nome === ong.nome)) {
                        ongsData.push({
                            ...ong,
                            id: String(ong.id)
                        });
                    }
                });
                console.log(` Total de ONGs: ${ongsData.length}`);
            }

            addOngsToMap();

        } catch (error) {
            console.error(' Erro ao carregar ONGs:', error);
            if (typeof ONGS_DATA !== 'undefined') {
                console.log(' Usando fallback (data.js)');
                ongsData = ONGS_DATA.map(ong => ({
                    ...ong,
                    id: String(ong.id)
                }));
                addOngsToMap();
            }
        }
    }

    function addOngsToMap() {
        console.log(` Adicionando ${ongsData.length} ONGs ao mapa...`);
        
        markers.forEach(marker => marker.remove());
        markers.clear();

        ongsData.forEach(ong => {
            console.log(` Adicionando marcador: ${ong.nome} (ID: ${ong.id})`);
            
            const marker = L.marker([ong.lat, ong.lon]).addTo(map);
            markers.set(String(ong.id), marker);

            const popupContent = `
    <div style="text-align: center; min-width: 150px;">
        <strong style="font-size: 1.1em; color: #D9534F;">${ong.nome}</strong><br>
        <button onclick="window.showDetails('${ong.id}')" 
                style="margin-top: 8px; padding: 6px 12px; background: #D9534F; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            <i class="fas fa-info-circle"></i> ${window.gssaI18n ? window.gssaI18n.t('popup-see-details') : 'Ver Detalhes'}
        </button>
    </div>
`;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
                console.log('🖱️ Marcador clicado:', ong.nome, 'ID:', ong.id);
                showDetails(ong.id);
            });
        });

        console.log(`${markers.size} marcadores adicionados`);
    }

    function locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    userLocation = { lat, lon };
userAccuracy = accuracy;
                    
                    const userIcon = L.icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                    
                    userMarker = L.marker([lat, lon], { icon: userIcon })
                        .addTo(map)
                        .bindPopup(`${window.gssaI18n ? window.gssaI18n.t('popup-you-are-here') : 'Você está aqui!'} (${window.gssaI18n ? window.gssaI18n.t('popup-accuracy') : 'Precisão ±'} ${accuracy.toFixed(0)}m)`)
                        .openPopup();
                    
                    map.setView([lat, lon], 14, { animate: true });
                },
                (error) => console.warn(`Erro na geolocalização: ${error.message}`)
            );
        }
    }
    
    locateUser();

    const detailsPanel = document.getElementById('details-panel');
    const panelContent = detailsPanel.querySelector('.panel-content');
    const closeButton = document.getElementById('close-panel');

    function closeDetailsPanel() {
        detailsPanel.classList.remove('open');
        panelContent.innerHTML = '';
        setTimeout(() => map.invalidateSize(), 500);
    }
    
    closeButton.addEventListener('click', closeDetailsPanel);

    async function showDetails(ongId) {
        console.log(' Buscando detalhes da ONG ID:', ongId);
        
        const ong = ongsData.find(o => String(o.id) === String(ongId));
        
        if (!ong) {
            console.error(' ONG não encontrada para ID:', ongId);
            alert('ONG não encontrada. Tente recarregar a página.');
            return;
        }
        
        console.log(' ONG encontrada:', ong.nome);
        
        map.setView([ong.lat, ong.lon], 15, { animate: true });

        // helper — usa traduções se disponíveis, senão fallback PT
        const _t = (key) => window.gssaI18n ? window.gssaI18n.t(key) : key;

        let distanceHtml = '';
        if (userLocation) {
            const distance = calculateDistance(userLocation.lat, userLocation.lon, ong.lat, ong.lon);
            distanceHtml = `
                <div class="info-block distance-info">
                    <h3><i class="fas fa-route"></i> ${_t('panel-distance-title')}</h3>
                    <p style="font-weight: bold; font-size: 1.1em;">${distance} ${_t('panel-km-from-you')}</p>
                    <p style="font-size: 0.8em; color: var(--text-secondary);">${_t('panel-distance-sub')}</p>
                </div>
            `;
        }

        let applyButtonHtml = '';
        let existingApplicationId = null;
        
        if (currentUser && userRole === 'voluntario') {
            const q = query(
                collection(db, 'applications'),
                where('userId', '==', currentUser.uid),
                where('ongId', '==', String(ong.id))
            );
            
            try {
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                    const inscricaoDoc = snapshot.docs[0];
                    const inscricao = inscricaoDoc.data();
                    existingApplicationId = inscricaoDoc.id;
                    
                    const statusText = inscricao.status === 'approved' ? _t('status-approved') :
                                      inscricao.status === 'rejected' ? _t('status-rejected') : _t('status-pending');
                    const statusColor = inscricao.status === 'approved' ? '#2ECC71' : 
                                       inscricao.status === 'rejected' ? '#E74C3C' : '#F1C40F';
                    
                    applyButtonHtml = `
                        <div style="text-align: center; padding: 15px; background: rgba(217, 83, 79, 0.1); border-radius: 8px; margin-top: 20px;">
                            <i class="fas fa-info-circle"></i> 
                            <strong>${_t('status-label')} <span style="color: ${statusColor};">${statusText}</span></strong>
                            ${inscricao.status === 'pending' ? `
                                <button id="cancel-button" class="submit-button" style="margin-top: 15px; background: #E74C3C;">
                                    <i class="fas fa-times"></i> ${_t('panel-cancel-button')}
                                </button>
                            ` : ''}
                        </div>
                    `;
                } else {
                    applyButtonHtml = `
                        <button id="apply-button" class="submit-button" style="margin-top: 20px;">
                            <i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}
                        </button>
                    `;
                }
            } catch (error) {
                console.error('Erro ao verificar inscrição:', error);
                applyButtonHtml = `
                    <button id="apply-button" class="submit-button" style="margin-top: 20px;">
                        <i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}
                    </button>
                `;
            }
        } else if (!currentUser) {
            applyButtonHtml = `
                <p style="text-align: center; padding: 15px; background: rgba(217, 83, 79, 0.1); border-radius: 8px; margin-top: 20px;">
                    <i class="fas fa-info-circle"></i> 
                    <strong>${_t('panel-login-hint')}</strong>
                </p>
            `;
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
                   target="_blank" 
                   class="open-map-button"
                   style="margin-top: 10px;">
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

        const cancelButton = document.getElementById('cancel-button');
        if (cancelButton && existingApplicationId) {
            cancelButton.addEventListener('click', async () => {
                if (!confirm(`Cancelar inscrição na ${ong.nome}?`)) return;

                try {
                    cancelButton.disabled = true;
                    cancelButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelando...';
                    
                    await deleteDoc(doc(db, 'applications', existingApplicationId));
                    
                    alert(' Inscrição cancelada!');
                    showDetails(ong.id);
                } catch (error) {
                    console.error(' Erro ao cancelar:', error);
                    alert(`Erro: ${error.message}`);
                    cancelButton.disabled = false;
                    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancelar Inscrição';
                }
            });
        }

        const applyButton = document.getElementById('apply-button');
        if (applyButton && currentUser && userRole === 'voluntario') {
            applyButton.addEventListener('click', async () => {
                const _t = (k) => window.gssaI18n ? window.gssaI18n.t(k) : k;
const confirmMsg = _t('apply-confirm').replace('{nome}', ong.nome);
if (!confirm(confirmMsg)) return;

                try {
                    applyButton.disabled = true;
                    applyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                    
                    await addDoc(collection(db, 'applications'), {
                        ongId: String(ong.id),
                        ongName: ong.nome,         // ✅ salva nome para evitar "ONG não encontrada"
                        ongServicos: ong.servicos,  // ✅ salva serviços junto
                        userId: currentUser.uid,
                        status: 'pending',
                        createdAt: serverTimestamp()
                    });
                    
                    alert(' Inscrição enviada!');
                    showDetails(ong.id);
                } catch (error) {
                    console.error(' Erro ao inscrever:', error);
                    alert(`Erro: ${error.message}`);
                    applyButton.disabled = false;
                    applyButton.innerHTML = '<i class="fas fa-hand-holding-heart"></i> Inscrever-se';
                }
            });
        }
    }

    function refreshPanelIfOpen() {
        if (detailsPanel.classList.contains('open')) {
            const ongId = panelContent.querySelector('.panel-title') 
                ? ongsData.find(o => o.nome === panelContent.querySelector('.panel-title').textContent)?.id 
                : null;
            if (ongId) {
                showDetails(ongId);
            }
        }
    }

    loadOngsFromFirestore();

    // ── Carregar pop-ups das ONGs ── //
async function loadOngPopups() {
    try {
        const snapshot = await getDocs(collection(db, 'ong_popups'));
        const now = new Date();

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const expires = data.expiresAt?.toDate();
            if (!expires || expires < now) return;

            const marker = markers.get(String(data.ongId));
            if (!marker) return;

            const _t = (k) => window.gssaI18n ? window.gssaI18n.t(k) : k;

            const occupationHtml = data.occupation?.max
                ? `<div style="font-size:0.9em; font-weight:700; color:var(--color-highlight);
                               margin-bottom:6px;">
                       <i class="fas fa-users"></i>
                       ${_t('popup-occupancy-label')} ${data.occupation.current}/${data.occupation.max}
                   </div>`
                : '';

            const popupHtml = `
                <div style="max-width:220px; font-family: inherit;">
                    ${occupationHtml}
                    <div style="font-size:0.88em; line-height:1.5;
                                color:var(--text-primary); margin-bottom:8px;">
                        ${data.message}
                    </div>
                    <div style="font-size:0.75em; color:var(--text-secondary);">
                        <i class="fas fa-clock"></i>
                        ${_t('popup-expires-at')} ${expires.toLocaleString(
                            window.gssaI18n?.currentLang() === 'en' ? 'en-US' : 'pt-BR'
                        )}
                    </div>
                </div>
            `;

            marker.bindPopup(popupHtml).openPopup();
        });
    } catch (e) {
        console.warn('Erro ao carregar popups:', e);
    }
}

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        const query = document.getElementById('search-input').value.trim().toLowerCase();
        const foundOng = ongsData.find(ong => 
            ong.nome.toLowerCase().includes(query) || 
            ong.servicos.toLowerCase().includes(query)
        );
        
        if (foundOng) {
            const marker = markers.get(String(foundOng.id));
            if (marker) {
                map.setView(marker.getLatLng(), 15, { animate: true });
                marker.openPopup();
                showDetails(foundOng.id);
            }
        } else {
            alert('Nenhuma ONG encontrada.');
        }
    });

    window.showDetails = showDetails;

    document.getElementById('user-menu-button')?.addEventListener('click', () => {
        const menu = document.getElementById('user-dropdown-menu');
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            document.getElementById('user-dropdown-menu')?.classList.remove('show');
        }
    });

    // ✅ FIX: todos os links para a página de inscrições usam hífen (minhas-inscricoes.html)
    document.getElementById('nav-inscricoes')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            window.location.href = 'minhas_inscricoes.html';
        } else {
            alert('Faça login para ver suas inscrições');
            authModal.style.display = 'block';
            showLoginForm();
        }
    });

    document.getElementById('menu-contacts')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'minhas_inscricoes.html';
    });

    document.getElementById('menu-profile')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'perfil.html';
    });

    setTimeout(() => map.invalidateSize(), 200);

document.addEventListener('gssa-lang-changed', async () => {
    if (userMarker && userAccuracy !== null) {
        const _t = (key) => window.gssaI18n ? window.gssaI18n.t(key) : key;
        userMarker.setPopupContent(
            `${_t('popup-you-are-here')} (${_t('popup-accuracy')} ${userAccuracy.toFixed(0)}m)`
        );
    }
    addOngsToMap();
await loadOngPopups();
    refreshPanelIfOpen();
});
});









