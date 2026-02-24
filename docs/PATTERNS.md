# Padrões e Decisões Técnicas

Este documento registra padrões de implementação e soluções para problemas não-óbvios encontrados no projeto.

---

## Animação de ícones em botões (Electron / Chromium)

### Problema

Ao aplicar `animate-spin` (Tailwind) diretamente em um `<svg>` (ícone lucide-react) dentro de um `<Button>`, o ícone aparece deslocado durante a animação — tipicamente para cima e para a esquerda.

### Causa raiz

Dois fatores combinados:

1. **`transform-box: view-box` do SVG** — O Chromium usa o sistema de coordenadas interno do SVG (`0 0 24 24`) como referência para `transform-origin`, e não o box CSS (`16×16px`). Isso desloca levemente o ponto de rotação do centro geométrico.

2. **Subpixel rounding de GPU compositing layer** — Ao iniciar uma animação CSS com `transform`, o browser cria uma compositing layer separada para o elemento. Quando esse layer é criado junto com outras mudanças simultâneas (troca de ícone, mudança de estado `disabled`), o Chromium arredonda coordenadas de subpixel de forma independente por layer, resultando em um shift visível de 1–2px.

### Solução

Usar **`framer-motion`** com um wrapper `div` em vez de `animate-spin` diretamente no SVG:

```tsx
import { motion } from 'framer-motion'

// Em vez de:
<LoaderIcon className="animate-spin" />

// Use:
<motion.div
  className="size-4 shrink-0 flex items-center justify-center"
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
>
  <LoaderIcon className="size-4" />
</motion.div>
```

### Por que funciona

| Aspecto | CSS `animate-spin` | `framer-motion` |
|---|---|---|
| Mecanismo | `@keyframes` CSS + compositor GPU | Web Animations API + `transform` inline style |
| `transform-origin` | Dependia de `transform-box` do SVG | Força `50% 50% 0` como inline style no `div` |
| Elemento animado | O `<svg>` diretamente | Um `<div>` HTML (box model bem definido) |
| Posicionamento interno | Inline baseline do SVG | `flex items-center justify-center` no div |

- `motion.div` aplica `transform-origin: 50% 50% 0` como **inline style** (especificidade máxima, sem ambiguidade de coordenadas SVG).
- Animando um `div` HTML em vez do SVG, o box model é sempre previsível.
- `flex items-center justify-center` garante que o SVG filho seja centralizado via flexbox, eliminando qualquer offset de baseline inline.

### Contexto onde foi encontrado

`src/renderer/src/features/editor/ui/components/executeWorkflowBtn.tsx` — botão "Execute Workflow" com estado de loading.

---

## Layout shift em botões com cancel button dinâmico

### Problema

Ao adicionar um botão de cancelamento que aparece dinamicamente ao lado de um botão de ação em um painel `position="top-right"` do ReactFlow (`flex flex-col items-end`), o botão de ação se desloca para a esquerda quando o cancel button aparece.

### Causa raiz

O painel é ancorado à direita. Quando o wrapper cresce (cancel button aparece), todo o conteúdo se desloca para a esquerda.

### Solução

`flex-row-reverse` no wrapper + `invisible` no cancel button para preservar espaço no layout:

```tsx
<div className="flex flex-row-reverse gap-2">
  {/* Execute button — DOM primeiro, visualmente à direita (ancoragem estável) */}
  <Button ...>Execute Workflow</Button>

  {/* Cancel button — DOM segundo, visualmente à esquerda */}
  {/* "invisible" preserva o espaço no layout mesmo quando oculto */}
  <Button
    className={isPending ? 'animate-in fade-in-0 ...' : 'invisible'}
  >
    <SquareIcon />
  </Button>
</div>
```

`flex-row-reverse` faz o wrapper crescer para a **esquerda** quando o cancel button aparece, mantendo o botão de ação ancorado à direita. O `invisible` (ao invés de `hidden` ou renderização condicional) preserva o espaço do cancel button no layout desde o início, zerando qualquer shift.
