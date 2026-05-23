# Analytics Schema — bunny-chaos-37

Catálogo completo dos eventos disparados via `window.Analytics.send()`
através do Wildlife Platform SDK (`@wildlife/platform-capacitor`). Os
eventos chegam ao **Topaz** dashboard via Singular method-channel.

Use este doc como referência pra **registrar o schema no Topaz admin**
(https://topaz.wildlifestudios.com → Project: bunny-chaos-37 → Events).
Sem schema registrado, os eventos chegam mas não aparecem nos dashboards
prontos — viram raw rows na tabela de eventos.

## Auto-context (injetado em TODO evento)

O wrapper `Analytics.send` em `index.html` (final do `<body>`) sempre
adiciona estes campos antes de mandar pro SDK:

| Campo | Tipo | Descrição |
|---|---|---|
| `stage` | int | Stage atual do player (1..N). De `arena.stage`. |
| `forge_lv` | int | Nível da forja (1..35). De `arena.forgeLevel`. |
| `carrots` | int | Cenouras (soft currency) atuais. De `arena.carrots`. |
| `era` | int | Era visual (0..9), 1 era = 5 stages. De `currentArenaEra()`. |

**No Topaz schema, esses 4 são campos globais — não precisa repetir nas
definições individuais abaixo.** Params do caller têm prioridade sobre o
auto-context (override via merge).

---

## Eventos por categoria

### Lifecycle de sessão

| Event | Disparado quando | Params extras |
|---|---|---|
| `session_start` | SDK terminou de inicializar no boot | — |
| `app_paused` | App vai pro background (iOS suspend / Android onPause) | `session_duration_ms: int`, `session_deaths: int` |
| `app_resumed` | App volta do background | `bg_duration_ms: int` |

> **Funil de sessão**: `session_start` + `app_paused` permite calcular
> duração média de sessão e taxa de quit nos primeiros N segundos.

---

### Settings (mudanças de configuração)

| Event | Quando | Params |
|---|---|---|
| `audio_setting_changed` | Toggle ou fader de áudio mudou | `category: 'master' \| 'music' \| 'sfx'`, `kind: 'toggle' \| 'fader'`, `enabled: bool` (toggle) ou `value: float` (fader) |
| `language_changed` | Idioma trocado no Settings | `lang: 'pt' \| 'en'` |
| `vibration_changed` | Toggle de vibração | `enabled: bool` |
| `consent_granted` | Player aceitou coleta de dados | `from: 'settings'` |

---

### Progressão e morte (CHURN — eventos-chave)

| Event | Quando | Params |
|---|---|---|
| `stage_started` | Player entra num stage novo (qualquer caminho: progressão natural, cheat skip, save resume) | `prev_stage: int`, `time_in_prev_stage_ms: int` (0 se for a primeira stage da sessão) |
| `wave_cleared` | Wave 1..N-1 do stage completada (não boss) | `cleared_wave: int` (1..4) |
| `boss_engaged` | Wave do boss iniciou | `via: 'auto'` (1ª tentativa após wave anterior) ou `'manual'` (player clicou DESAFIAR BOSS após falhar) |
| `boss_defeated` | Boss morreu (2 disparos: um aqui + um no kill detector) | `time_in_stage_ms: int` OU `kind: string, lettuce_drop: int` |
| `stage_cleared` | Alias de boss_defeated (funil clarity) | `time_in_stage_ms: int` |
| `player_died` | Player morreu (qualquer wave) | `wave: int`, `was_boss: bool`, `session_deaths: int` |

> **Pergunta 1: até onde os players chegam?**
> `SELECT player_id, MAX(stage) FROM events WHERE event_name='stage_started' GROUP BY 1`
>
> **Pergunta 2: onde travam?**
> `SELECT stage, wave, was_boss, COUNT(*) FROM events WHERE event_name='player_died' GROUP BY 1,2,3 ORDER BY 4 DESC`

---

### Gameplay loop (engagement)

| Event | Quando | Params |
|---|---|---|
| `forge_rolled` | Dados rolados (manual ou auto) | `source: 'auto' \| 'manual'`, `batch: int` (1 normal, N no auto-batch) |
| `roll_button_clicked` | Tap no botão ROLAR | `lettuce: int`, `has_lettuce: bool`, `phase: 'idle' \| 'rolling' \| 'after-roll'` |
| `auto_button_clicked` | Tap no botão AUTO (abre popup) | `was_active: bool` |
| `auto_toggle_changed` | Toggle AUTO ligado/desligado | `enabled: bool`, `source: 'popup' \| 'btn_quick_off'` |
| `item_equipped` | Item entrou em slot | `slot: string`, `era_idx: int`, `level: int`, `replaced: bool`, `replaced_era_idx: int` (se replaced), `source: 'auto' \| 'manual'` |
| `item_discarded` | Item descartado | `slot: string`, `era_idx: int`, `reward_carrots: int` |
| `quest_claimed` | Quest resgatada | `quest_id: string`, `reward: int` (gemas) |

---

### Monetização (gemas + IAP)

| Event | Quando | Params |
|---|---|---|
| `gem_spent_skip` | Player gastou gemas pra pular timer de forge upgrade | `cost: int`, `remaining_sec: int`, `level_from: int` |
| `iap_purchase_started` | Player clicou Comprar no modal IAP | `product_id: string` |
| `iap_purchase_completed` | Compra confirmada pelo SDK | `product_id: string`, `dev_mode: bool` (true se simulado em dev) |
| `iap_purchase_failed` | SDK rejeitou compra | `product_id: string`, `error: string`, `dev_mode: bool` |
| `iap_purchase_cancelled` | Player cancelou na tela nativa de pagamento | `product_id: string` |
| `iap_modal_cancelled` | Player fechou modal sem comprar | `product_id: string` |
| `iap_grant_applied` | Item da compra IAP foi concedido ao player | `product_id: string`, `era: int` |

---

## Tipos canônicos pra Topaz

- **int** — inteiro positivo ou zero
- **bool** — true/false (Topaz aceita; salva como int 0/1 ou string)
- **string** — texto curto (categoria, slug, enum)
- **float** — número decimal (valores de fader, percentuais)

> Nenhum evento usa **objects nested** ou **arrays** — Topaz não suporta.
> Cada call de `Analytics.send` passa só primitives.

---

## Como registrar no Topaz

1. Acessar https://topaz.wildlifestudios.com (login via SSO Wildlife)
2. **Projects** → procurar `bunny-chaos-37` (se não existe, criar)
3. **Schema** → **Events** → **+ New Event**
4. Pra cada evento da lista acima:
   - **Name**: copiar exatamente o `event_name` (case-sensitive)
   - **Category**: usar as seções deste doc (lifecycle, settings,
     progression, gameplay, monetization)
   - **Description**: copiar a coluna "Quando"
   - **Params**: adicionar cada param da coluna "Params" com tipo
     correspondente
5. Salvar. Os dashboards default (DAU, retenção, funnel) começam a
   popular após ~30min de eventos chegarem.

Auto-context fields (`stage`, `forge_lv`, `carrots`, `era`) devem ser
definidos como **global attributes** no projeto, não em cada evento.

## Smoke test pra validar

Em build dev/staging, no debug panel (gear icon → System tab) tem o
botão **"Send analytics smoke test"** — dispara `debug_smoke_test`.
Em ~30s aparece em `Project → Raw Events`. Se aparece, pipeline tá
vivo e todos os 27 eventos vão fluir igual.

Se NÃO aparece em 1 min:
- Verificar console no debug panel — `Analytics.send` no-op se
  `_WildlifePlatform.isInitialized === false` (SDK falhou de iniciar)
- Verificar LGPD gate — `SETTINGS.analyticsConsent === 'granted'` é
  pré-requisito. Default é granted, mas se o player rejeitou em
  Settings → Privacidade, todos eventos viram no-op
- Verificar Singular config (Topaz roda em cima do Singular pipeline)
  — pode estar com app não registrado no painel da Singular
