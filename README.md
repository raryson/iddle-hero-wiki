# Idle Hero Wiki

Wiki comunitária para consultar hunts, rotas de experiência e opções de farm de gold do Idle Hero.

O projeto é open source e contribuições são bem-vindas:

<https://github.com/raryson/iddle-hero-wiki>

## Funcionalidades

- Catálogo com 492 hunts e seus principais atributos.
- Busca por criatura.
- Filtros por faixa de level.
- Ordenação por estágio, XP/HP, Gold/HP ou HP.
- Recomendações de hunts por level, usando as rotas configuradas de XP e Gold.
- Detalhes da criatura ao clicar em uma linha.
- Layout responsivo para desktop e celular.

## Tecnologias

- React
- Vite
- JavaScript
- CSS

## Executar localmente

É necessário ter Node.js instalado.

```bash
npm install
npm run dev
```

Depois, abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Outros comandos

```bash
npm run build    # gera a versão de produção
npm run preview  # visualiza a build localmente
```

## Estrutura principal

```text
public/data/hunts.json  dados das hunts exibidos pelo app
src/main.jsx            aplicação React e componentes da página
src/routes.js           rotas de XP e Gold usadas nas recomendações
src/styles.css          estilos base
src/responsive.css      ajustes para telas pequenas
```

## Dados

Os dados ficam em arquivos JSON por enquanto, facilitando a manutenção e a publicação na Vercel. A ideia é futuramente adicionar cadastro de usuários e um fluxo para sugerir e revisar alterações nos dados.

## Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch para sua alteração.
3. Faça as mudanças e valide com `npm run build`.
4. Abra um Pull Request explicando o que foi alterado.
