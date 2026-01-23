# Guia de Release - Web Automations

Este documento descreve o processo de build e release do aplicativo para macOS, Windows e Linux usando GitHub Actions.

## Pre-requisitos

### 1. Repositorio no GitHub
O projeto deve estar hospedado no GitHub com o workflow em `.github/workflows/release.yml`.

### 2. Permissoes do GitHub Actions
O workflow usa `GITHUB_TOKEN` automaticamente fornecido pelo GitHub Actions. Verifique se as permissoes estao corretas:

1. Va em **Settings** > **Actions** > **General**
2. Em "Workflow permissions", selecione **Read and write permissions**
3. Marque **Allow GitHub Actions to create and approve pull requests** (opcional)

### 3. Versao no package.json
Antes de criar uma release, atualize a versao no `package.json`:

```json
{
  "version": "1.0.0"
}
```

## Como Fazer uma Release

### Passo 1: Commit das alteracoes
```bash
git add .
git commit -m "chore: prepare release v1.0.0"
git push origin main
```

### Passo 2: Criar a tag
```bash
# Criar tag localmente
git tag v1.0.0

# Enviar tag para o GitHub
git push origin v1.0.0
```

### Passo 3: Acompanhar o build
1. Va em **Actions** no repositorio do GitHub
2. Voce vera o workflow "Build and Release" em execucao
3. Aguarde a conclusao de todos os jobs (mac, windows, linux)

### Passo 4: Verificar a Release
1. Va em **Releases** no repositorio
2. A release `v1.0.0` estara disponivel com todos os arquivos:
   - `web-automations-1.0.0.dmg` (macOS)
   - `Web Automations-1.0.0-universal-mac.zip` (macOS)
   - `web-automations-1.0.0-setup.exe` (Windows installer)
   - `web-automations-1.0.0-portable.exe` (Windows portable)
   - `web-automations-1.0.0.AppImage` (Linux)
   - `web-automations-1.0.0.deb` (Linux Debian/Ubuntu)
   - `web-automations-1.0.0.snap` (Linux Snap)

## Versionamento

Use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Mudancas incompativeis
- **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades compativeis
- **PATCH** (1.0.0 → 1.0.1): Correcoes de bugs

### Exemplos de tags:
```bash
git tag v1.0.0      # Release estavel
git tag v1.1.0      # Nova feature
git tag v1.1.1      # Bug fix
git tag v2.0.0-beta # Pre-release (beta)
```

## Comandos Uteis

### Listar tags existentes
```bash
git tag -l
```

### Deletar tag local
```bash
git tag -d v1.0.0
```

### Deletar tag remota
```bash
git push origin --delete v1.0.0
```

### Criar tag com mensagem
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Troubleshooting

### Build falhou no Windows
- Verifique se `better-sqlite3` esta sendo compilado corretamente
- O `npm run postinstall` deve rodar `electron-builder install-app-deps`

### Build falhou no Linux (snap)
- Snap requer `snapcraft` instalado no runner
- Se falhar, considere remover `snap` do `electron-builder.yml`:
  ```yaml
  linux:
    target:
      - AppImage
      - deb
      # - snap  # Comentar se falhar
  ```

### Permissao negada ao criar release
- Verifique as permissoes do workflow em Settings > Actions > General
- Certifique-se de que "Read and write permissions" esta selecionado

### Tag ja existe
```bash
# Deletar tag local e remota
git tag -d v1.0.0
git push origin --delete v1.0.0

# Criar novamente
git tag v1.0.0
git push origin v1.0.0
```

## Estrutura do Workflow

```
push tag v*
    │
    ├── Job: build (mac)     → Gera .dmg e .zip
    ├── Job: build (windows) → Gera .exe (setup e portable)
    └── Job: build (linux)   → Gera .AppImage, .deb, .snap
            │
            └── Job: release → Cria GitHub Release com todos os arquivos
```

## Code Signing (Opcional)

Para distribuicao profissional, considere assinar os binarios:

### macOS
1. Obtenha um certificado "Developer ID Application" da Apple
2. Configure os secrets no GitHub:
   - `APPLE_ID`
   - `APPLE_ID_PASSWORD`
   - `APPLE_TEAM_ID`
   - `CSC_LINK` (certificado base64)
   - `CSC_KEY_PASSWORD`

### Windows
1. Obtenha um certificado de code signing (DigiCert, Sectigo, etc.)
2. Configure os secrets:
   - `WIN_CSC_LINK` (certificado .pfx base64)
   - `WIN_CSC_KEY_PASSWORD`

## Checklist de Release

- [ ] Atualizar versao no `package.json`
- [ ] Atualizar CHANGELOG (se houver)
- [ ] Testar build local (`npm run build:mac`)
- [ ] Commit e push para main
- [ ] Criar e enviar tag
- [ ] Verificar Actions no GitHub
- [ ] Testar downloads da Release
