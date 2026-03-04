// translations.js — GSSA i18n (PT-BR / EN)
// Usado pelo index.html e páginas secundárias.

const TRANSLATIONS = {
    'pt': {
        // Header
        'logo-subtitle':        'Gravataí Support & Shelter Assist',
        'search-placeholder':   'Buscar ONGs por nome, serviço ou bairro...',
        'nav-inicio':           'Início',
        'nav-contatos':         'Contatos',
        'auth-button-text':     'Entrar',
        // Dropdown usuário
        'menu-profile-text':    'Meu Perfil',
        'menu-contacts-text':   'Minhas Inscrições',
        'menu-admin-text':      'Painel Admin ONG',
        'menu-super-text':      'Painel Super-Admin',
        'menu-logout-text':     'Sair',
        // Modal login
        'login-title':          'Acesse sua Conta',
        'login-subtitle':       'Entre para gerenciar suas inscrições ou sua ONG',
        'login-email-label':    'E-mail',
        'login-pass-label':     'Senha',
        'login-submit':         'Entrar',
        'login-switch':         'Não tem conta? <strong>Cadastrar como Voluntário</strong>',
        'login-ong-link':       '<i class="fas fa-building"></i> <strong>Cadastrar minha ONG</strong>',
        // Modal cadastro
        'reg-title':            'Cadastro de Voluntário',
        'reg-subtitle':         'Seu apoio é fundamental. Preencha seus dados para ajudar as ONGs de Gravataí.',
        'reg-name-label':       'Nome Completo',
        'reg-name-ph':          'Seu nome',
        'reg-email-label':      'E-mail',
        'reg-pass-label':       'Senha',
        'reg-pass-ph':          'Mínimo 6 caracteres',
        'reg-passconf-label':   'Confirme a Senha',
        'reg-passconf-ph':      'Digite a senha novamente',
        'reg-location-label':   'Localização (Bairro/Ponto de Partida)',
        'reg-location-ph':      'Ex: Centro, Rincão da Madalena',
        'reg-skills-label':     'Habilidades/Serviços que Oferece (Separar por vírgula)',
        'reg-skills-ph':        'Ex: Médico, Motorista, Ajuda Geral, Eletricista',
        'reg-avail-label':      'Disponibilidade',
        'reg-avail-ph':         'Ex: Diária após 18h, Finais de Semana, Integral.',
        'reg-submit':           'Criar Conta',
        'reg-switch':           'Já tem conta? Entrar',
        'reg-ong-link':         '<i class="fas fa-building"></i> <strong>Cadastrar minha ONG</strong>',
        // Painel lateral ONG
        'panel-distance-title': 'Distância Estimada',
        'panel-distance-sub':   'Cálculo em linha reta.',
        'panel-services-title': 'Serviços Oferecidos',
        'panel-address-title':  'Endereço',
        'panel-maps-button':    'Abrir no Google Maps',
        'panel-hours-title':    'Horário',
        'panel-contact-title':  'Contato',
        'panel-apply-button':   'Inscrever-se como Voluntário',
        'panel-cancel-button':  'Cancelar Inscrição',
        'panel-login-hint':     'Faça login como voluntário para se inscrever',
        'panel-km-from-you':    'km de você',
        // Status inscrição
        'status-approved':      'Aprovado',
        'status-rejected':      'Rejeitado',
        'status-pending':       'Pendente',
        'status-label':         'Status:',
        // Língua
        'lang-toggle-label':    'EN',
    },
    'en': {
        // Header
        'logo-subtitle':        'Gravataí Support & Shelter Assist',
        'search-placeholder':   'Search NGOs by name, service or neighbourhood...',
        'nav-inicio':           'Home',
        'nav-contatos':         'Contacts',
        'auth-button-text':     'Sign In',
        // User dropdown
        'menu-profile-text':    'My Profile',
        'menu-contacts-text':   'My Applications',
        'menu-admin-text':      'NGO Admin Panel',
        'menu-super-text':      'Super-Admin Panel',
        'menu-logout-text':     'Sign Out',
        // Login modal
        'login-title':          'Sign In',
        'login-subtitle':       'Log in to manage your applications or your NGO',
        'login-email-label':    'E-mail',
        'login-pass-label':     'Password',
        'login-submit':         'Sign In',
        'login-switch':         'No account? <strong>Register as Volunteer</strong>',
        'login-ong-link':       '<i class="fas fa-building"></i> <strong>Register my NGO</strong>',
        // Register modal
        'reg-title':            'Volunteer Registration',
        'reg-subtitle':         'Your support matters. Fill in your details to help NGOs in Gravataí.',
        'reg-name-label':       'Full Name',
        'reg-name-ph':          'Your name',
        'reg-email-label':      'E-mail',
        'reg-pass-label':       'Password',
        'reg-pass-ph':          'Minimum 6 characters',
        'reg-passconf-label':   'Confirm Password',
        'reg-passconf-ph':      'Type your password again',
        'reg-location-label':   'Location (Neighbourhood / Starting point)',
        'reg-location-ph':      'e.g. City Centre, Urban Area',
        'reg-skills-label':     'Skills / Services You Offer (comma-separated)',
        'reg-skills-ph':        'e.g. Doctor, Driver, General Help, Electrician',
        'reg-avail-label':      'Availability',
        'reg-avail-ph':         'e.g. Weekdays after 6 pm, Weekends, Full-time.',
        'reg-submit':           'Create Account',
        'reg-switch':           'Already have an account? Sign In',
        'reg-ong-link':         '<i class="fas fa-building"></i> <strong>Register my NGO</strong>',
        // ONG side panel
        'panel-distance-title': 'Estimated Distance',
        'panel-distance-sub':   'Straight-line calculation.',
        'panel-services-title': 'Services Offered',
        'panel-address-title':  'Address',
        'panel-maps-button':    'Open in Google Maps',
        'panel-hours-title':    'Opening Hours',
        'panel-contact-title':  'Contact',
        'panel-apply-button':   'Apply as Volunteer',
        'panel-cancel-button':  'Cancel Application',
        'panel-login-hint':     'Sign in as a volunteer to apply',
        'panel-km-from-you':    'km from you',
        // Application status
        'status-approved':      'Approved',
        'status-rejected':      'Rejected',
        'status-pending':       'Pending',
        'status-label':         'Status:',
        // Language
        'lang-toggle-label':    'PT',
    }
};

// ── Estado global de língua ──────────────────────────────────────────────────
let currentLang = localStorage.getItem('gssa-lang') || 'pt';

function t(key) {
    return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS['pt'][key] ?? key;
}

// ── Aplica traduções estáticas (data-i18n) ───────────────────────────────────
function applyTranslations() {
    // Textos simples
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.innerHTML = t(key);
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPh);
    });

    // Atributos aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    // Botão de língua: mostra o idioma para o qual vai alternar
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.querySelector('.lang-label').textContent = t('lang-toggle-label');
        btn.title = currentLang === 'pt' ? 'Switch to English' : 'Mudar para Português';
    }

    // <html lang>
    document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';
}

// ── Toggle ───────────────────────────────────────────────────────────────────
function toggleLanguage() {
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    localStorage.setItem('gssa-lang', currentLang);
    applyTranslations();
    // Notifica app.js para re-renderizar o painel lateral se estiver aberto
    document.dispatchEvent(new CustomEvent('gssa-lang-changed', { detail: { lang: currentLang } }));
}

// ── Inicialização ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggleLanguage);
    applyTranslations();
});

// ── Exporta para uso em app.js ───────────────────────────────────────────────
window.gssaI18n = { t, currentLang: () => currentLang, applyTranslations };
