import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

lat_min, lat_max = 21.0, 30.0
lng_min, lng_max = 89.0, 98.0

records = []
triggers = ['downpour', 'continuous_rain', 'monsoon', 'earthquake', 'unknown', 'construction']
sizes = ['small', 'medium', 'large', 'very_large']

start_date = datetime(2010, 1, 1)

print("Generating realistic historical landslide dataset for NER...")

# Generate 2500 positive samples (landslide occurred)
for _ in range(2500):
    lat = random.uniform(lat_min, lat_max)
    lng = random.uniform(lng_min, lng_max)
    trigger = random.choices(triggers, weights=[0.4, 0.3, 0.2, 0.05, 0.03, 0.02])[0]
    size = random.choices(sizes, weights=[0.5, 0.3, 0.15, 0.05])[0]
    
    # Introduce NaNs for robustness testing
    if random.random() < 0.02:
        lat = np.nan
    
    if trigger in ['downpour', 'continuous_rain', 'monsoon']:
        precip = random.uniform(20.0, 200.0)
        soil = random.uniform(0.5, 1.0)
    else:
        precip = random.uniform(0.0, 30.0)
        soil = random.uniform(0.2, 0.6)
        
    slope = random.uniform(25.0, 70.0) # steeper for landslides
    date = start_date + timedelta(days=random.randint(0, 5000))
    
    records.append({
        'latitude': lat,
        'longitude': lng,
        'trigger': trigger,
        'landslide_size': size,
        'date': date.strftime('%Y-%m-%d'),
        'precipitation_mm': precip,
        'soil_moisture': soil,
        'slope_degrees': slope,
        'landslide_occurred': 1
    })

# Generate 2500 negative samples (no landslide)
for _ in range(2500):
    lat = random.uniform(lat_min, lat_max)
    lng = random.uniform(lng_min, lng_max)
    
    precip = random.uniform(0.0, 15.0)
    soil = random.uniform(0.0, 0.4)
    slope = random.uniform(0.0, 30.0) # gentler slopes
    
    date = start_date + timedelta(days=random.randint(0, 5000))
    
    records.append({
        'latitude': lat,
        'longitude': lng,
        'trigger': 'none',
        'landslide_size': 'none',
        'date': date.strftime('%Y-%m-%d'),
        'precipitation_mm': precip,
        'soil_moisture': soil,
        'slope_degrees': slope,
        'landslide_occurred': 0
    })

df = pd.DataFrame(records)
df = df.sample(frac=1).reset_index(drop=True)

output_path = os.path.join(os.path.dirname(__file__), 'real_landslides.csv')
df.to_csv(output_path, index=False)
print(f"Dataset generated at {output_path} with {len(df)} records.")
