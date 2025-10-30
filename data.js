/**
 * Dados Estáticos das ONGs para o MVP do GSSA.
 * Na Fase 2 (Evolução), este array será substituído por uma chamada à API do Supabase.
 */
const ONGS_DATA = [
    {
        id: 1,
        nome: "AICA - Associação Irmãos do Caminho",
        lat: -29.94964, 
        lon: -50.97232,
        servicos: "Alimentação, Roupa, Suporte Psicossocial",
        publico: "População em situação vulnerável",
        endereco: "R. Bernardo Joaquim Ferreira, 155 - Caça e Pesca, Gravataí - RS, 94190-000",
        contato: "(51) 99157-5726",
        horario: "Segunda a Sábado, 8h às 18h"
    },
    {
        id: 2,
        nome: "Fundação Casa dos Sonhos",
        lat: -29.93093,
        lon: -50.97200,
        servicos: "Serviço de Convivência e Fortalecimento de Vínculos ",
        publico: "Crianças e adolescentes em Vulnerabilidade",
        endereco: "R. Frei Galvão, 600 – Rincão da Madalena, Gravataí – RS, 94199-724",
        contato: "(51) 93484-5274",
        horario: "Atendimento 24 horas"
    },
    {
        id: 3,
        nome: "Sopa Solidária Gravataí",
        lat: -29.9150, // Área mais ao norte
        lon: -51.0150,
        servicos: "Distribuição de Alimentos, Kits de Higiene",
        publico: "Comunidades Carentes",
        endereco: "Rua do Comércio, 50 - Morada do Vale I",
        contato: "sosolidaria@email.com",
        horario: "Quartas e Sextas, 19h"
    }
];