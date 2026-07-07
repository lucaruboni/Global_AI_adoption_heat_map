# AI World Map — Data Pack

Dati pronti per costruire una **mappa/globo 3D dell'uso dell'AI nel mondo**.
Fonte principale: **Anthropic Economic Index** (Hugging Face `Anthropic/EconomicIndex`, release 2026-06-26) — uso di Claude.ai aggregato per paese. Periodo: **maggio 2026** (nei file grezzi c'è anche aprile 2026).

## File principali (usa questi per la mappa)

### `ai_world_map_master.json` / `.csv` ⭐
Una riga/oggetto per paese (121 paesi), già pronto per il globo. Campi:
- `iso3`, `name` — codice ISO 3166-1 alpha-3 e nome paese
- `lat`, `lng` — centroide del paese (per barre/spike/marker 3D)
- `usage_pct` — % dell'uso globale di Claude proveniente dal paese
- `usage_per_capita_index` — **AUI**: uso pro capite normalizzato sulla popolazione 15-64 (1.0 = proporzionale alla popolazione; >1 = sovra-adozione). *Metrica consigliata per il colore della mappa* (usage_pct per l'altezza delle barre)
- `use_case_work_pct` / `use_case_personal_pct` / `use_case_coursework_pct` — tipo di utilizzo
- `collaboration_bucket_automation_pct` / `..._augmentation_pct` — automazione vs. potenziamento
- `ai_autonomy_mean` — autonomia media dell'AI (scala 1-5)
- `multitasking_pct` — % conversazioni multi-task
- `working_age_pop`, `gdp_2024` — popolazione 15-64 (2024) e PIL 2024 (per normalizzazioni)
- `top_topic`, `top_topic_pct` — argomento di richiesta più frequente nel paese

### `world_countries_110m.topo.json`
TopoJSON dei confini mondiali (world-atlas 110m). Join con il master tramite nome/numeric-id → serve per i poligoni del globo (three.js / globe.gl / d3-geo). Nota: l'artifact ha CSP che blocca i CDN — le librerie vanno inlinate e questo file va embeddato nei dati.

## File di dettaglio (per drill-down / tooltip ricchi)

- `countries_topics_major.csv` — per ogni paese, % di uso per argomento di richiesta (livello "Major": coding, scrittura, ecc.). Formato long: `geo_id, metric_id=pct, node_name, value`. Filtra `date_start=2026-05-01`.
- `countries_occupations_major.csv` — % di uso per gruppo occupazionale (SOC Major Group) per paese.
- `countries_overall.csv` — tutte le ~100 metriche "overall" per paese in formato long (incluse `artifact_*_pct`), entrambi i mesi.
- `subregions_overall.csv` — dati a livello di subregione (ISO 3166-2, incl. stati USA con AUI) per una eventuale vista zoom.
- `global_metrics.csv` — valori globali di riferimento (baseline per confronti).

## File di supporto
- `country_centroids.csv` — centroidi lat/lng (gavinr/world-countries-centroids, chiave ISO2)
- `iso_country_codes.csv` — mappa ISO2 ↔ ISO3 ↔ nome
- `working_age_pop_2024.csv`, `gdp_2024_country.csv` — popolazione e PIL per normalizzare

## Idee per la visualizzazione
- Globo 3D: colore dei paesi = AUI (indice pro capite), barre/spike sui centroidi = usage_pct, tooltip con top_topic e split work/personal/coursework.
- Attenzione: un paese assente dal dataset non significa uso zero, ma sotto la soglia di pubblicazione.
- Licenza dati AEI: CC-BY (citare "Anthropic Economic Index").
