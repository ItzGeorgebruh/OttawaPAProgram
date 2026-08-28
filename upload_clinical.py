import os
import pandas as pd
from supabase import create_client

# 1. Your Supabase URL and Publishable Key
SUPABASE_URL = 'https://bknrtardzwrkvuouxcza.supabase.co'
SUPABASE_KEY = "sb_publishable_QQPSyu5M3zDQO3CJ6s-v8g_yC0sLnic"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Read your Clinical Medicine Excel file
excel_file = 'Clinical Medicine Diseases.xlsx' 
df = pd.read_excel(excel_file)

# Drop any fully blank rows based on generic_name
df = df.dropna(subset=['generic_name'])
df = df.fillna('')

print(f'Found {len(df)} clinical conditions to upload. Starting...')

# 3. Loop through each row and push it to Supabase
for index, row in df.iterrows():
    sec = row['section'] if 'section' in row and pd.notna(row['section']) else 'Clinical Medicine'
    term = row['didactic_term'] if 'didactic_term' in row and pd.notna(row['didactic_term']) else 'Term 1'

    payload = {
        'section': str(sec).strip() or 'Clinical Medicine',
        'didactic_term': str(term).strip() or 'Term 1',
        'generic_name': str(row.get('generic_name', '')),
        'brand_names': str(row.get('brand_names', '')),        # Subtype / Variant
        'body_systems': str(row.get('body_systems', '')),
        'pathophysiology': str(row.get('pathophysiology', '')),
        'cause': str(row.get('cause', '')),
        'symptoms': str(row.get('symptoms', '')),
        'diagnostics_labs': str(row.get('diagnostics_labs', '')),
        'treatment': str(row.get('treatment', '')),
        'complications': str(row.get('complications', '')),
    }

    # Insert into the 'drugs' table (which stores both Pharmacology & Clinical Medicine)
    supabase.table('drugs').insert(payload).execute()
    print(f"Successfully uploaded: {payload['generic_name']}")

print('All done! Check your Clinical Medicine web app page.')