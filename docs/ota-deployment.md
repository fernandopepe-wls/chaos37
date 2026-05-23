# OTA Deployment

Como o pipeline de Over-The-Air updates funciona neste projeto, e o que
precisa estar no lugar pra publicar uma atualização sem passar pelas lojas.

## Visão geral

O game usa `@capgo/capacitor-updater`. No boot (`src/main.js`), o app:

1. Chama `notifyAppReady()` — sinaliza pro plugin que o bundle atual está
   funcionando (sem isso o plugin tenta revert pro bundle anterior em 30s).
2. Checa um **manifest.json** em CDN público pra ver se há versão nova.
3. Se houver, baixa **bundle.zip** assíncrono e aplica no próximo resume.

A URL do manifest é baked no build pelo Vite (`__OTA_MANIFEST_URL__`).
Hoje, com OTA habilitado:

```
https://ota.games.wildlifestudios.com/bunny-chaos-37/<env>/manifest.json
```

`<env>` = `development` | `staging` | `production` — derivado de
`OTA_S3_PREFIX` definido em `ci/build.yml` por job rule.

## Fluxo do CI

Pipeline em 5 stages (definidos em `ci/build.yml` via includes do template SRE):

```
setup → pre_build → build → post_build → deploy → publish
                                                    │
                                                    └── ota_publish (job da SRE)
```

O job `ota_publish` (no template SRE `gitlab-ci/game-build/build-capacitor-linux.yml`):

1. Lê `OTA_S3_PREFIX` do workflow variables
2. Empacota `dist/` em `bundle.zip`
3. Faz upload pra `s3://capacitor-games-ota/<OTA_S3_PREFIX>/bundle-vN.zip`
4. Gera/atualiza `s3://capacitor-games-ota/<OTA_S3_PREFIX>/manifest.json`
   com a versão nova
5. CloudFront invalida o cache em `https://ota.games.wildlifestudios.com/...`

## Variáveis de CI requeridas

Já definidas em `ci/build.yml` `.default_vars`:

| Var | Valor | Fonte |
|---|---|---|
| `OTA_ENABLED` | `"true"` | hardcoded |
| `OTA_S3_BUCKET` | `"capacitor-games-ota"` | hardcoded — bucket Wildlife |
| `OTA_S3_REGION` | `"us-east-1"` | hardcoded |
| `OTA_BASE_URL` | `"https://ota.games.wildlifestudios.com"` | hardcoded — CDN Wildlife |
| `OTA_S3_PREFIX` | `bunny-chaos-37/<env>` | por rule no workflow |

Faltam credenciais AWS pra `ota_publish` upload-ar. O template SRE espera no
GitLab CI/CD Variables (Settings → CI/CD → Variables):

| Var | Tipo | Onde obter |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | masked | IAM da Wildlife — pedir pro time SRE |
| `AWS_SECRET_ACCESS_KEY` | masked | idem |
| `CI_GIT_PUSH_TOKEN` | masked | (opcional) GitLab token pra commitar bumps de versão |

Sem essas vars, o pipeline passa nos outros stages mas o `ota_publish`
falha com erro de credentials. Workflow continua exibindo verde nos
demais (build_android, build_ios, firebase_distribution) porque OTA é
um stage separado (`publish`).

## Checklist pra primeira publicação OTA em produção

- [ ] **Bucket S3** `capacitor-games-ota` existe (SRE provisiona uma vez por
      org, já existe na conta da Wildlife)
- [ ] **Prefixo** `bunny-chaos-37/production` criado no bucket (auto-cria
      na primeira upload — não precisa pre-criar)
- [ ] **CloudFront** mapeado pra esse bucket via `ota.games.wildlifestudios.com`
      (já configurado pela SRE — confirmar acessando manualmente o manifest)
- [ ] **AWS creds** registrados em GitLab CI/CD Variables (pedir SRE)
- [ ] **OTA_S3_PREFIX** correto por env (✓ feito em `ci/build.yml`)
- [ ] **`__OTA_MANIFEST_URL__`** baked corretamente — após o build, conferir
      no console do device: `console.log(__OTA_MANIFEST_URL__)` deve imprimir
      a URL completa, não string vazia
- [ ] **Pipeline production rodada** uma vez com sucesso no job `ota_publish`
      — verificar log mostra `Uploaded: bundle.zip` + `manifest.json` updated

## Como validar manualmente

Após pipeline rodar com sucesso:

```bash
# 1. Manifest deve responder JSON (não 404)
curl -i https://ota.games.wildlifestudios.com/bunny-chaos-37/production/manifest.json

# Resposta esperada:
# {
#   "version": "0.1.0.78",
#   "url": "https://ota.games.wildlifestudios.com/bunny-chaos-37/production/bundle-v78.zip",
#   "sha256": "..."
# }

# 2. Bundle.zip deve responder com Content-Length > 0
curl -I https://ota.games.wildlifestudios.com/bunny-chaos-37/production/bundle-v78.zip
```

Se o manifest tem `version` maior que a do APK/IPA instalado, o updater
baixa o bundle e aplica no próximo app resume.

## Comportamento em dev/staging vs produção

`src/ota/updater.js` faz comparação diferente por env (ver CLAUDE.md
arquitetura do OTA):

- **Production**: compara semantic version (`0.1.0.78 > 0.1.0.77`). Só
  atualiza se nova versão for estritamente maior — evita downgrade.
- **Dev/Staging**: compara SHA256 do bundle. Sempre atualiza se o
  conteúdo mudou — útil pra iterar rápido em testes.

## Quebrar o OTA propositalmente (revert)

Se subiu bundle ruim e quer fazer rollback sem esperar o próximo CI:

```bash
# Apontar manifest pra bundle-vN-1 anterior (substituir vNUM)
aws s3 cp s3://capacitor-games-ota/bunny-chaos-37/production/manifest-vNUM-1.json \
          s3://capacitor-games-ota/bunny-chaos-37/production/manifest.json

# Invalidar CloudFront cache
aws cloudfront create-invalidation --distribution-id E... \
    --paths "/bunny-chaos-37/production/manifest.json"
```

Próximos resumes do app re-baixam a versão antiga. Histórico de bundles
fica no S3 como `bundle-vN.zip` — não são deletados em rollback.
