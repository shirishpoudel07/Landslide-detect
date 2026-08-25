import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Path to the real dataset
csv_path = os.path.join(os.path.dirname(__file__), 'data', 'real_landslides.csv')
if not os.path.exists(csv_path):
    print(f"Error: Dataset not found at {csv_path}")
    print("Please place real_landslides.csv in the ml_service/data/ directory.")
    exit(1)

print(f"Loading dataset from {csv_path}...")
df = pd.read_csv(csv_path)
print(f"Initial raw dataset shape: {df.shape}")

# ==============================================================
# ROBUST DATA PREPROCESSING
# ==============================================================

# 1. Drop rows with empty coordinates or missing target
print("Cleaning data...")
df = df.dropna(subset=['latitude', 'longitude', 'landslide_occurred'])
print(f"Shape after dropping NaNs in coordinates: {df.shape}")

# 2. Drop columns not useful for actual geographic/weather prediction
df = df.drop(columns=['date'], errors='ignore')

# 3. Encode categorical text variables (e.g. 'trigger', 'landslide_size')
label_encoders = {}
categorical_cols = ['trigger', 'landslide_size']
for col in categorical_cols:
    if col in df.columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

# 4. Define features (X) and target (y)
X = df.drop(columns=['landslide_occurred'])
y = df['landslide_occurred']

feature_names = X.columns.tolist()

# 5. Normalize numerical columns using StandardScaler
print("Normalizing features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ==============================================================
# MODEL TRAINING
# ==============================================================

# 6. Train-test split (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 7. Train Random Forest Classifier
print("Training Random Forest Classifier on historical data...")
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 8. Evaluate Accuracy
accuracy = clf.score(X_test, y_test)
print(f"\nModel Evaluation Accuracy: {accuracy * 100:.2f}%\n")

# ==============================================================
# FEATURE IMPORTANCE OUTPUT
# ==============================================================

importances = clf.feature_importances_
print("*" * 40)
print(" FEATURE IMPORTANCES (What triggers landslides most?)")
print("*" * 40)
for name, importance in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True):
    # Print bar chart in terminal using ASCII to avoid cp1252 Windows terminal errors
    bar = "#" * int(importance * 50)
    print(f"{name.ljust(20)} | {importance:.4f} | {bar}")
print("*" * 40)

# ==============================================================
# SAVE MODEL ARTIFACTS
# ==============================================================

model_path = os.path.join(os.path.dirname(__file__), 'landslide_model.pkl')
scaler_path = os.path.join(os.path.dirname(__file__), 'scaler.pkl')

joblib.dump(clf, model_path)
joblib.dump(scaler, scaler_path)

print(f"\n[SUCCESS] Retrained model overwritten at: {model_path}")
print(f"[SUCCESS] Scaler saved at: {scaler_path}")
