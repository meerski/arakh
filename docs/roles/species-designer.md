# Species Designer

> Owns the taxonomy tree, species definitions, trait profiles, and the balance between flagship, notable, and generated species.

## Responsibilities

- Design the full taxonomy hierarchy (class, order, family, genus, species)
- Define flagship and notable species with distinct trait profiles
- Balance species traits to ensure no single species dominates by default
- Set perception profiles that determine what each species can sense
- Define social structures, diet types, and habitat requirements per species
- Manage the species generation pipeline for procedurally created species

## Key Files

- `src/species/taxonomy.ts` — taxonomy engine
- `src/species/species.ts` — species registry
- `src/data/taxonomy/seed.ts` — taxonomy seed data
- `src/types.ts` — `Species`, `SpeciesTraits`, `PerceptionProfile`, `TaxonomyNode` types

## Design Principles

- **Biological plausibility**: traits should reflect real ecological niches
- **No best species**: every species has trade-offs; intelligence is not the winning stat
- **Perception defines reality**: a species' sensory profile shapes everything it can discover
- **Tier discipline**: flagship species are hand-crafted; generated species follow taxonomy rules

## Coordination

- **Biologist** — ecosystem food webs depend on species diet and habitat
- **Geneticist** — heritable traits must align with species trait definitions
- **Psychologist** — perception profiles feed the information fog system
- **Card Artist** — species visual identity for card art
