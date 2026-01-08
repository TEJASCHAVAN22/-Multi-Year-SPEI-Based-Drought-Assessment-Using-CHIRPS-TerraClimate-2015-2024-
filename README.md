# 🌾 SPEI (Standardized Precipitation-Evapotranspiration Index) Analysis using Google Earth Engine

Estimate and visualize the SPEI — an index for drought/wetness based on the difference between precipitation and potential evapotranspiration 
(P - PET) — across an agro-climatic region in India using Earth Observation and climate data in Google Earth Engine (GEE).

This repository contains a GEE script that:
- computes monthly precipitation and PET sums,
- derives a simple monthly water balance (D = P − PET),
- standardizes that balance to create an SPEI-like index (demonstration standardization),
- visualizes mean SPEI over the study area,
- exports the mean SPEI as a GeoTIFF.

---

## 🔎 Overview

SPEI is commonly computed by:
1. Aggregating the climatic water balance (P − PET) at the chosen time scale (monthly, seasonal).
2. Fitting those aggregated values to a probability distribution (e.g., log‑logistic) and transforming to a standardized normal deviate — the SPEI.
3. Interpreting standardized values: negative indicates drought, positive indicates wet conditions.

This script provides a demonstrative SPEI workflow using CHIRPS for precipitation and TerraClimate for PET inside GEE.
Note: the standardization here is a simplified normalization (z-score) across the study period for demonstration
only — a rigorously computed SPEI requires proper distribution fitting and parameter estimation.

---

## 🗺️ Workflow steps implemented

1. Define AOI: filter agro-climatic region FeatureCollection by attribute (regionco_1 = 8).
2. Define study period: start/end year (2015–2024) and months (Jan–Dec).
3. Load daily CHIRPS precipitation and monthly TerraClimate PET, filtered by AOI and period.
4. Aggregate into monthly sums for precipitation and PET.
5. Compute monthly water balance D = P − PET.
6. Standardize the water balance across months to produce an SPEI-like index (demonstration normalization).
7. Visualize mean SPEI and add an on-map legend.
8. Export mean SPEI (GeoTIFF) to Google Drive.

---

## ⚙️ Requirements

- Google Earth Engine account.
- The AOI asset present in your GEE assets at:
  projects/gee-trial2/assets/Climatics_Zone_Shapefiles/IND_Agro_Climatic_Regions
- Public access to CHIRPS (UCSB-CHG/CHIRPS/DAILY) and TerraClimate (IDAHO_EPSCOR/TERRACLIMATE) datasets in GEE.



## 🧠 Interpretation

- SPEI values:
  - ≤ −2.0: Extreme drought
  - −1.5 to −2.0: Severe drought
  - −1.0 to −1.5: Moderate drought
  - −1.0 to 1.0: Near normal
  - 1.0 to 1.5: Moderately wet
  - ≥ 1.5: Very wet

- The map shows the mean SPEI over the selected months and years. Negative mean indicates persistent dry conditions across the period; positive mean indicates persistent wetness.

---

## ⚠️ Important caveats & recommendations

- Proper SPEI computation requires fitting the monthly water-balance series to a suitable probability distribution (commonly the log‑logistic) and then converting the cumulative probability to standard normal units. The script's standardization (z-score) is a quick demonstration and does not replace a full SPEI implementation.
- TerraClimate `pet` in GEE is monthly and aggregated; ensure temporal aggregation aligns with your intended SPEI time scale.
- The Export region parameter should be a geometry (e.g., `aoi.geometry()`), or you may convert/flatten the FeatureCollection before export to avoid issues.
- Check for nulls: if no data exists for a date range in either dataset for your AOI, steps like `.first()` or `.sum()` could produce unexpected results. Increase the date window or validate datasets before processing.
- For operational SPEI and drought monitoring, consider using established SPEI libraries (R: SPEI package) or implement probability distribution fitting in a reproducible way (e.g., compute scale & shape parameters per pixel/time series).

---

## 📚 References

- Vicente-Serrano, S.M., Beguería, S., & López-Moreno, J.I. (2010). A multiscalar drought index sensitive to global warming: The Standardized Precipitation Evapotranspiration Index. Journal of Climate.
- CHIRPS dataset — UCSB/CHG: https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY
- TerraClimate dataset — IDAHO_EPSCOR/TERRACLIMATE in GEE
- Google Earth Engine: https://developers.google.com/earth-engine

---

## 🏷 Author / Contact

Tejas Chavan  
GIS Expert — Government of Maharashtra (Revenue & Forest Department)  
Email: tejaskchavan22@gmail.com  
Phone: +91 7028338510
