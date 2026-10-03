# Vídeos do Uai

Composições em Remotion para a série **Componente em destaque**.

## Thinking

A composição `Thinking` é o episódio 01: um vídeo de 14 segundos, em 1920x1080,
que acompanha o componente do progresso ao histórico concluído e inspecionável.

A composição `ThinkingV2` preserva o mesmo contrato e apresenta uma direção mais
editorial: palco claro, cursor nativo do macOS, câmera com aproximações suaves nos
alvos e uma assinatura final animada com a marca Uai. Ela tem 20 segundos, em
1920x1080.

## Response Status

A composição `ResponseStatus` é o episódio 02: 15 segundos, em 1920x1080. A
variante `bar`, em 3x e centralizada, passa pela fila e pela geração, o cursor
clica em Parar e depois em Regenerar, e a resposta termina concluída. Em
seguida, as variantes `inline`, `pill` e `bar` aparecem lado a lado, e o vídeo
fecha com a marca Uai.

O vídeo renderiza o componente real de `src/registry/uai` pelo alias `@uai`.
`useFrameSyncedAnimations` pausa as animações CSS e WAAPI do componente e as
posiciona no frame atual, para que o render seja determinístico. Nas trocas de
estado, `StatusSequence` faz um crossfade curto do conteúdo e mantém o contorno
da barra fixo.

```sh
bun run dev
bun run lint
bun run render:thinking
bun run render:thinking-v2
bun run render:response-status
```

Os MP4s são gerados em `out/thinking-component.mp4`,
`out/thinking-component-v2.mp4` e `out/response-status-component.mp4`.
