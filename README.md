# ⚙️ MarketingData API - Core Engine

Esta é a API de processamento e integração do ecossistema **MarketingData**. O serviço atua como um motor de **ETL (Extract, Transform, Load)**, orquestrando a extração de métricas de plataformas de anúncios (Meta Ads, Google Ads) e centralizando-as em um banco de dados analítico local para consumo de BI.

> **⚠️ Acesso Restrito:** Este é um repositório privado. É estritamente proibida a exposição de chaves de API, segredos de cliente ou bancos de dados contidos no ambiente de desenvolvimento.

---

## 🏗️ Arquitetura e Design

O projeto utiliza uma arquitetura baseada em **Módulos**, garantindo que a inclusão de novos provedores não afete o core da aplicação. Cada módulo é isolado em:

* **Routes:** Definição de endpoints e contratos de API.
* **Controllers:** Orquestração de requisições, respostas e tratamento de exceções.
* **Services:** Camada de lógica de negócio pesada, consumo de APIs externas e transformações de dados.
* **Repositories:** Camada de persistência e abstração de dados (Queries SQL puras para máxima performance).

---

## 🚀 Stack Técnica

* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Banco de Dados:** SQLite3 (Persistência analítica leve com suporte a queries complexas)
* **Integrações:** Axios (Consumo de Graph API com suporte a paginação e timeouts customizados)
* **Segurança:** JWT (JSON Web Tokens) & Bcrypt

---

## 🗺️ Documentação de Endpoints (API Reference)

Todas as rotas abaixo requerem o header `Authorization: Bearer <token>`, exceto as rotas de fluxo inicial de autenticação.

### **1. Integração & Contas (Meta Ads)**
| Método | Rota | Função |
| :--- | :--- | :--- |
| **GET** | `/api/meta/ad-accounts` | Retorna as contas selecionadas pelo usuário com métricas de status e gasto. |
| **GET** | `/api/meta/ad-accounts/available` | Bate na Graph API e retorna **todas** as contas do perfil (uso no Modal). |
| **GET** | `/api/meta/ad-accounts/saved` | Retorna os IDs das contas marcadas como ativas no banco local. |
| **POST** | `/api/meta/ad-accounts/select` | Realiza o "Sync" de ativação/desativação de contas no banco de dados. |

### **2. Biblioteca de Dados & ETL**
| Método | Rota | Função |
| :--- | :--- | :--- |
| **GET** | `/api/meta/metrics` | Recupera os dados brutos da tabela `campaign_metrics` (limitado a 500 registros). |
| **POST** | `/api/meta/sync-metrics` | **Motor de ETL:** Aciona o robô que percorre a paginação da Meta e salva os dados via `UPSERT`. |

### **3. Autenticação & Core**
| Método | Rota | Função |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Realiza a autenticação do usuário e retorna o token JWT. |
| **GET** | `/api/meta/auth/url` | Gera a URL de redirecionamento para o fluxo OAuth do Facebook. |
| **GET** | `/api/meta/auth/callback` | Recebe o código do Facebook, troca por Token de Longa Duração e salva a integração. |

---

## 📊 Fluxo de ETL & BI (Meta Ads)

O motor de dados foi desenhado para suportar altos volumes de métricas sem comprometer a performance do dashboard:

1.  **Extração (Extract):** Utiliza a Graph API da Meta (endpoint `/insights`) com `level: campaign` e `time_increment: 1`.
2.  **Paginação Robusta:** Implementação de loop `while` baseado no cursor `paging.next` para extração total de históricos de 30 dias.
3.  **Transformação (Transform):** Normalização de moedas, tratamento de tipos numéricos e padronização de datas (YYYY-MM-DD).
4.  **Persistência (Load/Upsert):** Dados inseridos via `INSERT ... ON CONFLICT`, garantindo que métricas diárias sejam atualizadas em vez de duplicadas.
5.  **Performance:** Índices únicos por `(client_id, provider, account_id, campaign_id, date)` para otimizar agregações.

---

## 🔧 Setup do Desenvolvedor

### **1. Instalação**
```bash
npm install