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

    const _t = (k) => window.gssaI18n?.t(k) ?? k;

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

    function showLoginForm() {
        if (loginFormContainer && registerFormContainer) {
            loginFormContainer.classList.add('active');    loginFormContainer.style.display    = 'block';
            registerFormContainer.classList.remove('active'); registerFormContainer.style.display = 'none';
        }
    }
    function showRegisterForm() {
        if (loginFormContainer && registerFormContainer) {
            registerFormContainer.classList.add('active');  registerFormContainer.style.display = 'block';
            loginFormContainer.classList.remove('active');  loginFormContainer.style.display    = 'none';
        }
    }

    authButton?.addEventListener('click', () => { authModal.style.display = 'block'; showLoginForm(); });
    document.getElementById('close-auth-modal')?.addEventListener('click', () => { authModal.style.display = 'none'; });
    switchToRegister?.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    switchToLogin?.addEventListener('click',    (e) => { e.preventDefault(); showLoginForm(); });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const uc = await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
            currentUser = uc.user;
            const ud = await getDoc(doc(db, 'users', currentUser.uid));
            if (ud.exists()) userRole = ud.data().role;
            authModal.style.display = 'none';
            updateUI(); refreshPanelIfOpen();
        } catch (error) { document.getElementById('login-message').textContent = `Erro: ${error.message}`; }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name         = document.getElementById('register-name').value;
        const email        = document.getElementById('register-email').value;
        const password     = document.getElementById('register-password').value;
        const confirmPass  = document.getElementById('register-password-confirm').value;
        const location     = document.getElementById('register-location').value;
        const skills       = document.getElementById('register-skills').value.split(',').map(s => s.trim()).filter(Boolean);
        const availability = document.getElementById('register-availability').value;
        if (password !== confirmPass) { document.getElementById('register-message').textContent = 'As senhas não coincidem.'; return; }
        try {
            const uc = await createUserWithEmailAndPassword(auth, email, password);
            currentUser = uc.user; userRole = 'voluntario';
            await setDoc(doc(db, 'users', currentUser.uid), { name, email, location, skills, availability, role: userRole, createdAt: serverTimestamp() });
            authModal.style.display = 'none';
            updateUI(); refreshPanelIfOpen();
        } catch (error) { document.getElementById('register-message').textContent = `Erro: ${error.message}`; }
    });

    async function handleLogout() { await signOut(auth); currentUser = null; userRole = null; updateUI(); refreshPanelIfOpen(); }
    menuLogout?.addEventListener('click', handleLogout);
    fixedLogoutButton?.addEventListener('click', handleLogout);

    function updateUI() {
        if (currentUser) {
            if (authButton)        authButton.style.display        = 'none';
            if (userDropdown)      userDropdown.style.display      = 'block';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'block';
            const ap = document.getElementById('menu-admin-panel');
            const sp = document.getElementById('menu-super-admin');
            if (ap) { ap.style.display = userRole === 'ong' ? 'block' : 'none'; if (userRole === 'ong') ap.href = 'painel-ong.html'; }
            if (sp && userRole !== 'superadmin') sp.style.display = 'none';
        } else {
            if (authButton)        authButton.style.display        = 'block';
            if (userDropdown)      userDropdown.style.display      = 'none';
            if (fixedLogoutButton) fixedLogoutButton.style.display = 'none';
            const ap = document.getElementById('menu-admin-panel');
            const sp = document.getElementById('menu-super-admin');
            if (ap) ap.style.display = 'none';
            if (sp) sp.style.display = 'none';
        }
    }

    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            const ud = await getDoc(doc(db, 'users', user.uid));
            if (ud.exists()) { userRole = ud.data().role; if (userNameDisplay) userNameDisplay.textContent = ud.data().name || user.email; }
            try {
                const sad  = await getDoc(doc(db, 'superAdmins', user.uid));
                const sal  = document.getElementById('menu-super-admin');
                if (sal) sal.style.display = sad.exists() ? 'block' : 'none';
            } catch (_) { const sal = document.getElementById('menu-super-admin'); if (sal) sal.style.display = 'none'; }
            updateUI(); refreshPanelIfOpen();
        } else { userRole = null; updateUI(); refreshPanelIfOpen(); }
    });

    // ── Tema ──────────────────────────────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-sun','fa-moon');
    }
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const d = document.body.classList.contains('dark-mode');
        themeToggle.querySelector('i').classList.replace(d?'fa-sun':'fa-moon', d?'fa-moon':'fa-sun');
        localStorage.setItem('theme', d?'dark':'light');
    });

    // ── Mapa ──────────────────────────────────────────────────────────────────
    const map = L.map('map', { zoomControl: true }).setView([-29.9402, -50.9944], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'© OpenStreetMap contributors' }).addTo(map);

    function calculateDistance(lat1,lon1,lat2,lon2) {
        const R=6371, dLat=(lat2-lat1)*(Math.PI/180), dLon=(lon2-lon1)*(Math.PI/180);
        const a=Math.sin(dLat/2)**2+Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)**2;
        return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
    }

    let userLocation=null, userMarker=null;
    const markers=new Map();
    let ongsData=[];

    async function loadOngsFromFirestore() {
        try {
            const snap = await getDocs(query(collection(db,'ongs'), where('status','==','approved')));
            ongsData=[];
            snap.forEach(ds => {
                const d=ds.data();
                if (!d.coordinates?.lat||!d.coordinates?.lon) return;
                ongsData.push({ id:String(ds.id), nome:d.basicInfo.name, lat:parseFloat(d.coordinates.lat), lon:parseFloat(d.coordinates.lon), servicos:d.services, publico:d.targetAudience, endereco:`${d.address.street}, ${d.address.neighborhood} - ${d.address.city}/${d.address.state} - CEP: ${d.address.zip}`, contato:d.basicInfo.phone, horario:d.schedule, email:d.basicInfo.email, cnpj:d.basicInfo.cnpj, descricao:d.description, capacidade:d.capacity });
            });
            if (typeof ONGS_DATA!=='undefined') ONGS_DATA.forEach(o=>{ if(!ongsData.find(x=>x.nome===o.nome)) ongsData.push({...o,id:String(o.id)}); });
            addOngsToMap();
        } catch (err) {
            console.error('Erro ao carregar ONGs:',err);
            if (typeof ONGS_DATA!=='undefined') { ongsData=ONGS_DATA.map(o=>({...o,id:String(o.id)})); addOngsToMap(); }
        }
    }

    function buildOngPopup(ong) {
        // ✅ Sem variável de serviços no balão — só nome e botão traduzido
        return `<div style="text-align:center;min-width:150px;">
            <strong style="font-size:1.1em;color:#D9534F;">${ong.nome}</strong><br>
            <button onclick="window.showDetails('${ong.id}')"
                    style="margin-top:8px;padding:6px 12px;background:#D9534F;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
                <i class="fas fa-info-circle"></i> ${_t('popup-see-details')}
            </button>
        </div>`;
    }

    function addOngsToMap() {
        markers.forEach(m=>m.remove()); markers.clear();
        ongsData.forEach(ong => {
            const marker=L.marker([ong.lat,ong.lon]).addTo(map);
            markers.set(String(ong.id),marker);
            marker.bindPopup(buildOngPopup(ong));
            marker.on('click',()=>showDetails(ong.id));
        });
    }

    function buildUserPopup(accuracy) {
        // ✅ Popup do usuário traduzido
        return `${_t('popup-you-are-here')} (${_t('popup-accuracy')} ${accuracy.toFixed(0)}m)`;
    }

    let lastAccuracy = 0;
    function locateUser() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(pos => {
            const {latitude:lat,longitude:lon,accuracy}=pos.coords;
            userLocation={lat,lon}; lastAccuracy=accuracy;
            const icon=L.icon({iconUrl:'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});
            userMarker=L.marker([lat,lon],{icon}).addTo(map).bindPopup(buildUserPopup(accuracy)).openPopup();
            map.setView([lat,lon],14,{animate:true});
        }, err=>console.warn(err.message));
    }
    locateUser();

    // ── Painel lateral ────────────────────────────────────────────────────────
    const detailsPanel = document.getElementById('details-panel');
    const panelContent = detailsPanel.querySelector('.panel-content');
    const closeButton  = document.getElementById('close-panel');

    function closeDetailsPanel() { detailsPanel.classList.remove('open'); panelContent.innerHTML=''; setTimeout(()=>map.invalidateSize(),500); }
    closeButton.addEventListener('click',closeDetailsPanel);

    async function showDetails(ongId) {
        const ong=ongsData.find(o=>String(o.id)===String(ongId));
        if (!ong) { alert('ONG não encontrada. Tente recarregar a página.'); return; }
        map.setView([ong.lat,ong.lon],15,{animate:true});

        let distanceHtml='';
        if (userLocation) {
            const d=calculateDistance(userLocation.lat,userLocation.lon,ong.lat,ong.lon);
            distanceHtml=`<div class="info-block distance-info"><h3><i class="fas fa-route"></i> ${_t('panel-distance-title')}</h3><p style="font-weight:bold;font-size:1.1em">${d} ${_t('panel-km-from-you')}</p><p style="font-size:.8em;color:var(--text-secondary)">${_t('panel-distance-sub')}</p></div>`;
        }

        let applyButtonHtml='', existingApplicationId=null;
        if (currentUser && userRole==='voluntario') {
            try {
                const snap=await getDocs(query(collection(db,'applications'),where('userId','==',currentUser.uid),where('ongId','==',String(ong.id))));
                if (!snap.empty) {
                    const ins=snap.docs[0].data(); existingApplicationId=snap.docs[0].id;
                    const st=ins.status==='approved'?_t('status-approved'):ins.status==='rejected'?_t('status-rejected'):_t('status-pending');
                    const sc=ins.status==='approved'?'#2ECC71':ins.status==='rejected'?'#E74C3C':'#F1C40F';
                    applyButtonHtml=`<div style="text-align:center;padding:15px;background:rgba(217,83,79,.1);border-radius:8px;margin-top:20px;"><i class="fas fa-info-circle"></i> <strong>${_t('status-label')} <span style="color:${sc}">${st}</span></strong>${ins.status==='pending'?`<button id="cancel-button" class="submit-button" style="margin-top:15px;background:#E74C3C;"><i class="fas fa-times"></i> ${_t('panel-cancel-button')}</button>`:''}</div>`;
                } else {
                    applyButtonHtml=`<button id="apply-button" class="submit-button" style="margin-top:20px;"><i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}</button>`;
                }
            } catch(_) { applyButtonHtml=`<button id="apply-button" class="submit-button" style="margin-top:20px;"><i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}</button>`; }
        } else if (!currentUser) {
            applyButtonHtml=`<p style="text-align:center;padding:15px;background:rgba(217,83,79,.1);border-radius:8px;margin-top:20px;"><i class="fas fa-info-circle"></i> <strong>${_t('panel-login-hint')}</strong></p>`;
        }

        panelContent.innerHTML=`
            <h2 class="panel-title">${ong.nome}</h2>
            ${distanceHtml}
            <div class="info-block"><h3><i class="fas fa-handshake"></i> ${_t('panel-services-title')}</h3><p>${ong.servicos}</p></div>
            <div class="info-block"><h3><i class="fas fa-map-marker-alt"></i> ${_t('panel-address-title')}</h3><p>${ong.endereco}</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ong.endereco)}" target="_blank" class="open-map-button" style="margin-top:10px;"><i class="fas fa-external-link-alt"></i> ${_t('panel-maps-button')}</a>
            </div>
            <div class="info-block"><h3><i class="fas fa-clock"></i> ${_t('panel-hours-title')}</h3><p>${ong.horario}</p></div>
            <div class="info-block"><h3><i class="fas fa-phone-alt"></i> ${_t('panel-contact-title')}</h3><p>${ong.contato}</p></div>
            ${applyButtonHtml}`;

        detailsPanel.classList.add('open');
        setTimeout(()=>map.invalidateSize(),500);

        document.getElementById('cancel-button')?.addEventListener('click', async()=>{
            if (!confirm(`${_t('panel-cancel-button')}?`)) return;
            const btn=document.getElementById('cancel-button');
            try { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>'; await deleteDoc(doc(db,'applications',existingApplicationId)); showDetails(ong.id); }
            catch(e) { alert(e.message); btn.disabled=false; btn.innerHTML=`<i class="fas fa-times"></i> ${_t('panel-cancel-button')}`; }
        });

        document.getElementById('apply-button')?.addEventListener('click', async()=>{
            if (!confirm(`${_t('panel-apply-button')} — ${ong.nome}?`)) return;
            const btn=document.getElementById('apply-button');
            try { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>'; await addDoc(collection(db,'applications'),{ongId:String(ong.id),ongName:ong.nome,ongServicos:ong.servicos,userId:currentUser.uid,status:'pending',createdAt:serverTimestamp()}); showDetails(ong.id); }
            catch(e) { alert(e.message); btn.disabled=false; btn.innerHTML=`<i class="fas fa-hand-holding-heart"></i> ${_t('panel-apply-button')}`; }
        });
    }

    function refreshPanelIfOpen() {
        if (detailsPanel.classList.contains('open')) {
            const titleEl=panelContent.querySelector('.panel-title');
            const id=titleEl?ongsData.find(o=>o.nome===titleEl.textContent)?.id:null;
            if (id) showDetails(id);
        }
    }

    loadOngsFromFirestore();

    document.getElementById('search-button').addEventListener('click',()=>{
        const q=document.getElementById('search-input').value.trim().toLowerCase();
        const found=ongsData.find(o=>o.nome.toLowerCase().includes(q)||o.servicos.toLowerCase().includes(q));
        if (found) { const m=markers.get(String(found.id)); if(m){map.setView(m.getLatLng(),15,{animate:true});m.openPopup();showDetails(found.id);} }
        else alert('Nenhuma ONG encontrada.');
    });

    window.showDetails=showDetails;

    document.getElementById('user-menu-button')?.addEventListener('click',()=>document.getElementById('user-dropdown-menu').classList.toggle('show'));
    document.addEventListener('click',(e)=>{ const d=document.getElementById('user-dropdown'); if(d&&!d.contains(e.target)) document.getElementById('user-dropdown-menu')?.classList.remove('show'); });

    document.getElementById('nav-inscricoes')?.addEventListener('click',(e)=>{ e.preventDefault(); if(currentUser) window.location.href='minhas_inscricoes.html'; else{authModal.style.display='block';showLoginForm();} });
    document.getElementById('menu-contacts')?.addEventListener('click',(e)=>{ e.preventDefault(); window.location.href='minhas_inscricoes.html'; });
    document.getElementById('menu-profile')?.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href='perfil.html'; });

    // ── Re-renderiza tudo quando idioma muda ──────────────────────────────────
    document.addEventListener('gssa-lang-changed', () => {
        // Popup do usuário
        if (userMarker) userMarker.setPopupContent(buildUserPopup(lastAccuracy||0));
        // Popups das ONGs
        ongsData.forEach(ong => { const m=markers.get(String(ong.id)); if(m) m.getPopup()?.setContent(buildOngPopup(ong)); });
        // Painel lateral
        refreshPanelIfOpen();
    });

    setTimeout(()=>map.invalidateSize(),200);
});
