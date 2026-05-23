# tools/

Dev-only helpers and design previews that **NÃO** vão pra build de produção.

A pasta fica **FORA** de `public/` de propósito — Vite copia tudo de `public/`
pro `dist/` (inclusive dot-folders), então qualquer asset de design/preview
dentro de `public/` acaba bundleado no IPA/APK final.

## Conteúdo

- `play.html` — meta-refresh trampoline pra `localhost:8000`. Usado durante
  dev quando quer abrir o jogo direto pelo navegador sem precisar acessar a
  URL completa.

- `previews/cosmic_blaster_beam.html` — design preview do efeito do Cosmic
  Blaster (commitado pelo Mateus em `399d89a` como referência visual do
  estilo cartoon-chibi do beam). Standalone HTML — basta abrir no navegador.

## Adicionando novos previews

Qualquer HTML/JS/imagem de teste ou referência visual que **não roda no
jogo final** deve ir aqui. Regra simples:

- Vai pro IPA/APK? → `public/`
- Só pra desenvolvedor olhar? → `tools/`
