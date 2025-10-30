import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Configuração do Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDhQs9Kz4LLGaKIhWV9nUiTjlst5YEWhjg",
        authDomain: "gssa-gravatai.firebaseapp.com",
        projectId: "gssa-gravatai",
        storageBucket: "gssa-gravatai.firebasestorage.app",
        messagingSenderId: "650753472587",
        appId: "1:650753472587:web:65b706993648dc602975ce",
        measurementId: "G-2HS4CYEZ9H"
    };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    console.log("Firebase inicializado com sucesso.");

    let currentUser = null;
    let userRole = null; // 'voluntario' ou 'ong'

    // Elementos DOM
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

    // ========== FUNÇÕES DE AUTENTICAÇÃO ==========

    function showLoginForm() {
        loginFormContainer.classList.add('active');
        loginFormContainer.style.display = 'block';
        registerFormContainer.classList.remove('active');
        registerFormContainer.style.display = 'none';
    }

    function showRegisterForm() {
        registerFormContainer.classList.add('active');
        registerFormContainer.style.display = 'block';
        loginFormContainer.classList.remove('active');
        loginFormContainer.style.display = 'none';
    }

    // Abrir modal
    authButton?.addEventListener('click', () => {
        authModal.style.display = 'block';
        showLoginForm();
    });

    // Fechar modal
    document.getElementById('close-auth-modal')?.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    // Alternar formulários
    switchToRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    // Login
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            currentUser = userCredential.user;
            
            // Buscar papel do usuário
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

    // Cadastro (CORRIGIDO - removido campo 'contact' inexistente)
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        const location = document.getElementById('register-location').value; // CORRIGIDO
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
            
            // Salvar dados do usuário no Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
                name: name,
                email: email,
                location: location, // CORRIGIDO
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

    // Logout
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

    // Atualizar UI
    function updateUI() {
        if (currentUser) {
            if (authButton) authButton.style.display = 'none';
            if (userDropdown) userDropdown.style.display = 'block';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'block';
            
            if (userRole === 'ong') {
                const adminPanel = document.getElementById('menu-admin-panel');
                if (adminPanel) adminPanel.style.display = 'block';
            }
        } else {
            if (authButton) authButton.style.display = 'block';
            if (userDropdown) userDropdown.style.display = 'none';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'none';
        }
    }

    // Ouvinte de mudanças de estado de autenticação
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

    // ========== SISTEMA DE TEMA ==========

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

    // ========== MAPA E GEOLOCALIZAÇÃO ==========

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
    const markers = new Map();

    function locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    userLocation = { lat, lon };
                    
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
                        .bindPopup(`Você está aqui! (Precisão ± ${accuracy.toFixed(0)}m)`)
                        .openPopup();
                    
                    map.setView([lat, lon], 14, { animate: true });
                },
                (error) => console.warn(`Erro na geolocalização: ${error.message}`)
            );
        }
    }
    
    locateUser();

    // ========== PAINEL LATERAL ==========

    const detailsPanel = document.getElementById('details-panel');
    const panelContent = detailsPanel.querySelector('.panel-content');
    const closeButton = document.getElementById('close-panel');

    function closeDetailsPanel() {
        detailsPanel.classList.remove('open');
        panelContent.innerHTML = '';
        setTimeout(() => map.invalidateSize(), 500);
    }
    
    closeButton.addEventListener('click', closeDetailsPanel);

    function showDetails(ongId) {
        const ong = ONGS_DATA.find(o => o.id === ongId);
        if (!ong) return;
        
        map.setView([ong.lat, ong.lon], 15, { animate: true });

        let distanceHtml = '';
        if (userLocation) {
            const distance = calculateDistance(userLocation.lat, userLocation.lon, ong.lat, ong.lon);
            distanceHtml = `
                <div class="info-block distance-info">
                    <h3><i class="fas fa-route"></i> Distância Estimada</h3>
                    <p style="font-weight: bold; font-size: 1.1em;">${distance} km de você</p>
                    <p style="font-size: 0.8em;">Cálculo em linha reta. A rota pode ser maior.</p>
                </div>
            `;
        }

        console.log('showDetails chamado. currentUser:', currentUser ? currentUser.uid : 'null', 'userRole:', userRole);

        let applyButtonHtml = '';
        if (currentUser && userRole === 'voluntario') {
            applyButtonHtml = '<button id="apply-button" class="submit-button">Inscrever-se como Voluntário</button>';
            console.log('Botão de inscrição adicionado');
        } else {
            console.log('Botão de inscrição NÃO adicionado');
        }

        panelContent.innerHTML = `
            <h2 class="panel-title">${ong.nome}</h2>
            ${distanceHtml}
            <div class="info-block">
                <h3><i class="fas fa-handshake"></i> Serviços Oferecidos</h3>
                <p>${ong.servicos}</p>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-users"></i> Público Alvo</h3>
                <p>${ong.publico}</p>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-map-marker-alt"></i> Endereço</h3>
                <p>${ong.endereco}</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ong.endereco)}" 
                   target="_blank" 
                   class="open-map-button">
                    Abrir no Mapa <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-clock"></i> Horário de Atendimento</h3>
                <p>${ong.horario}</p>
            </div>
            <div class="info-block">
                <h3><i class="fas fa-phone-alt"></i> Contato</h3>
                <p>${ong.contato}</p>
            </div>
            ${applyButtonHtml}
        `;
        
        detailsPanel.classList.add('open');
        setTimeout(() => map.invalidateSize(), 500);

        // Event listener para inscrição
        if (currentUser && userRole === 'voluntario') {
            document.getElementById('apply-button')?.addEventListener('click', async () => {
                try {
                    await addDoc(collection(db, 'applications'), {
                        ongId: ongId,
                        userId: currentUser.uid,
                        status: 'pending',
                        createdAt: serverTimestamp()
                    });
                    alert('Inscrição enviada com sucesso! Aguarde aprovação da ONG.');
                } catch (error) {
                    alert(`Erro ao se inscrever: ${error.message}`);
                }
            });
        }
    }

    function refreshPanelIfOpen() {
        if (detailsPanel.classList.contains('open')) {
            const ongId = panelContent.querySelector('.panel-title') 
                ? ONGS_DATA.find(o => o.nome === panelContent.querySelector('.panel-title').textContent)?.id 
                : null;
            if (ongId) {
                console.log('Atualizando painel lateral para ONG ID:', ongId);
                showDetails(ongId);
            }
        }
    }

    // Adicionar marcadores
    ONGS_DATA.forEach(ong => {
        const marker = L.marker([ong.lat, ong.lon]).addTo(map);
        markers.set(ong.id, marker);
        
        const popupContent = `
            <strong>${ong.nome}</strong><br>
            <button onclick="window.showDetails(${ong.id})">Ver Detalhes</button>
        `;
        
        marker.bindPopup(popupContent);
        marker.on('click', () => showDetails(ong.id));
    });

    // Busca
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        const query = document.getElementById('search-input').value.trim().toLowerCase();
        const foundOng = ONGS_DATA.find(ong => 
            ong.nome.toLowerCase().includes(query) || 
            ong.servicos.toLowerCase().includes(query)
        );
        
        if (foundOng) {
            const marker = markers.get(foundOng.id);
            map.setView(marker.getLatLng(), 15, { animate: true });
            marker.openPopup();
            showDetails(foundOng.id);
        }
    });

    window.showDetails = showDetails;

    // Dropdown do usuário
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

    // ========== NAVEGAÇÃO PARA PÁGINAS (com fallback para modais) ==========

    // Função para tentar navegar para página ou abrir modal
    async function navigateOrModal(pageName) {
        // Tenta carregar a página
        try {
            const response = await fetch(pageName);
            if (response.ok) {
                window.location.href = pageName;
                return;
            }
        } catch (error) {
            console.log(`Página ${pageName} não encontrada, usando modal`);
        }

        // Se não conseguiu, abre modal
        if (pageName.includes('inscricoes')) {
            openInscricoesModal();
        } else if (pageName.includes('perfil')) {
            openPerfilModal();
        }
    }

    // Links de navegação
    document.getElementById('nav-inscricoes')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            navigateOrModal('minhas-inscricoes.html');
        } else {
            alert('Faça login para ver suas inscrições');
            authModal.style.display = 'block';
        }
    });

    document.getElementById('menu-contacts')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateOrModal('minhas-inscricoes.html');
    });

    document.getElementById('menu-profile')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateOrModal('perfil.html');
    });

    // ========== MODAL DE INSCRIÇÕES (FALLBACK) ==========

    const inscricoesModal = document.getElementById('inscricoes-modal');
    const closeInscricoesModal = document.getElementById('close-inscricoes-modal');

    async function openInscricoesModal() {
        if (!currentUser) {
            alert('Faça login para ver suas inscrições');
            return;
        }

        inscricoesModal.classList.add('open');
        const listContainer = document.getElementById('modal-inscricoes-list');
        listContainer.innerHTML = '<p style="text-align: center;">Carregando...</p>';

        try {
            const q = query(collection(db, 'applications'), where('userId', '==', currentUser.uid));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Você ainda não tem inscrições.</p>';
                return;
            }

            let html = '';
            snapshot.forEach((doc) => {
                const data = doc.data();
                const ong = ONGS_DATA.find(o => o.id === data.ongId);
                const ongNome = ong ? ong.nome : 'ONG não encontrada';
                const statusClass = data.status === 'approved' ? 'status-approved' : 
                                   data.status === 'rejected' ? 'status-rejected' : 'status-pending';
                const statusText = data.status === 'approved' ? 'Aprovado' : 
                                  data.status === 'rejected' ? 'Rejeitado' : 'Pendente';
                const dataInscricao = data.createdAt?.toDate 
                    ? data.createdAt.toDate().toLocaleDateString('pt-BR')
                    : 'Data não disponível';

                html += `
                    <div class="inscricao-item">
                        <h3>${ongNome}</h3>
                        <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
                        <p><strong>Data:</strong> ${dataInscricao}</p>
                    </div>
                `;
            });

            listContainer.innerHTML = html;
        } catch (error) {
            listContainer.innerHTML = `<p style="color: var(--color-error);">Erro: ${error.message}</p>`;
        }
    }

    closeInscricoesModal?.addEventListener('click', () => {
        inscricoesModal.classList.remove('open');
    });

    // ========== MODAL DE PERFIL (FALLBACK) ==========

    const perfilModal = document.getElementById('perfil-modal');
    const closePerfilModal = document.getElementById('close-perfil-modal');

    async function openPerfilModal() {
        if (!currentUser) {
            alert('Faça login para ver seu perfil');
            return;
        }

        perfilModal.classList.add('open');
        const contentContainer = document.getElementById('modal-perfil-content');
        contentContainer.innerHTML = '<p style="text-align: center;">Carregando...</p>';

        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (!userDoc.exists()) {
                throw new Error('Perfil não encontrado');
            }

            const userData = userDoc.data();
            const memberSince = userData.createdAt?.toDate 
                ? userData.createdAt.toDate().toLocaleDateString('pt-BR')
                : 'Não disponível';

            let skillsHtml = '';
            if (userData.skills && userData.skills.length > 0) {
                skillsHtml = userData.skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('');
            } else {
                skillsHtml = '<p style="color: var(--text-secondary);">Nenhuma habilidade cadastrada</p>';
            }

            contentContainer.innerHTML = `
                <div class="perfil-info-grid">
                    <div class="perfil-info-card">
                        <h4><i class="fas fa-user"></i> Nome</h4>
                        <p>${userData.name || 'Não informado'}</p>
                    </div>
                    <div class="perfil-info-card">
                        <h4><i class="fas fa-envelope"></i> E-mail</h4>
                        <p>${userData.email || currentUser.email}</p>
                    </div>
                    <div class="perfil-info-card">
                        <h4><i class="fas fa-map-marker-alt"></i> Localização</h4>
                        <p>${userData.location || 'Não informado'}</p>
                    </div>
                    <div class="perfil-info-card">
                        <h4><i class="fas fa-calendar-alt"></i> Membro desde</h4>
                        <p>${memberSince}</p>
                    </div>
                    <div class="perfil-info-card">
                        <h4><i class="fas fa-tools"></i> Habilidades</h4>
                        <div>${skillsHtml}</div>
                    </div>
                    <div class="perfil-info-card">
                        <h4><i class="fas fa-clock"></i> Disponibilidade</h4>
                        <p>${userData.availability || 'Não informado'}</p>
                    </div>
                </div>
            `;
        } catch (error) {
            contentContainer.innerHTML = `<p style="color: var(--color-error);">Erro: ${error.message}</p>`;
        }
    }

    closePerfilModal?.addEventListener('click', () => {
        perfilModal.classList.remove('open');
    });

    setTimeout(() => map.invalidateSize(), 200);
});