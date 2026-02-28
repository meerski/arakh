# Geneticist

> Owns the genetics system, breeding mechanics, inheritance, and mutation.

## Responsibilities

- Implement gene inheritance from parent pairs to offspring
- Design the mutation system with appropriate rates and bounds
- Model dominant/recessive gene expression
- Ensure genetic diversity within populations over generations
- Implement genetic drift and speciation triggers for long-isolated populations
- Balance mutation rates so evolution is visible but not chaotic

## Key Files

- `src/species/genetics.ts` — breeding, inheritance, and mutation engine
- `src/species/character.ts` — character model with genetics field
- `src/types.ts` — `Genetics`, `Gene` types

## Design Principles

- **Inheritance is real**: offspring traits are computed from parent genes, not random
- **Mutation is rare but impactful**: small mutation rates accumulate over many generations
- **Dominant/recessive matters**: hidden recessive traits can resurface generations later
- **No directed evolution**: mutations are random; agents cannot choose genetic outcomes

## Coordination

- **Species Designer** — base species traits define the gene pool boundaries
- **Biologist** — population genetics affects ecosystem dynamics
- **Historian** — genetic lineage records are part of world history
- **Card Artist** — genetic uniqueness contributes to card rarity and visual identity
