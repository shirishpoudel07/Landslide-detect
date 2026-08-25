import pandas as pd
import os

url = "https://data.nasa.gov/api/views/dd9e-wu2v/rows.csv?accessType=DOWNLOAD"

print(f"Downloading data from NASA Global Landslide Catalog...")
try:
    df = pd.read_csv(url)
except Exception as e:
    print(f"Failed to download or parse CSV: {e}")
    exit(1)

print(f"Successfully loaded {len(df)} total global records.")

# Normalize column names for easier matching (lowercase, strip spaces)
df.columns = [str(c).lower().strip() for c in df.columns]

# Filter down to India's North Eastern Region (NER)
# Lat: 21.0 to 30.0, Lng: 89.0 to 98.0
# The NASA dataset has 'latitude' and 'longitude' columns
lat_col = 'latitude' if 'latitude' in df.columns else 'lat'
lng_col = 'longitude' if 'longitude' in df.columns else 'lng'

if lat_col not in df.columns or lng_col not in df.columns:
    print(f"Error: Could not find latitude/longitude columns. Available columns: {df.columns}")
    exit(1)

# Drop rows where coordinates are empty
df = df.dropna(subset=[lat_col, lng_col])

# Convert to numeric just in case
df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
df[lng_col] = pd.to_numeric(df[lng_col], errors='coerce')
df = df.dropna(subset=[lat_col, lng_col]) # Drop again if any coercions failed

# Filter for NER bounding box
ner_df = df[
    (df[lat_col] >= 21.0) & (df[lat_col] <= 30.0) &
    (df[lng_col] >= 89.0) & (df[lng_col] <= 98.0)
]

# Keep only the important columns requested by the user
# Typical NASA columns: 'latitude', 'longitude', 'landslide_trigger', 'landslide_size', 'event_date'
cols_to_keep = []
for col in ['latitude', 'longitude', 'landslide_trigger', 'trigger', 'landslide_size', 'size', 'event_date', 'date']:
    if col in ner_df.columns and col not in cols_to_keep:
        cols_to_keep.append(col)

ner_df = ner_df[cols_to_keep]

# Save to real_landslides.csv
output_file = "real_landslides.csv"
ner_df.to_csv(output_file, index=False)

print(f"Summary: Extracted {len(ner_df)} historical landslide records for the North Eastern Region.")
print(f"Data successfully saved to {os.path.abspath(output_file)}")
