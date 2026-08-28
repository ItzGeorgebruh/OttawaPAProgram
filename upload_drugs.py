import os
import pandas as pd
from supabase import create_client

# 1. Your Supabase URL and Publishable Key
SUPABASE_URL = 'https://bknrtardzwrkvuouxcza.supabase.co'
SUPABASE_KEY = "sb_publishable_QQPSyu5M3zDQO3CJ6s-v8g_yC0sLnic"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Read your Excel file (make sure to delete the description/example rows first!)
excel_file = 'Pharmacy Drugs.xlsx' 
df = pd.read_excel(excel_file)

# Drop any fully blank rows based on generic_name
df = df.dropna(subset=['generic_name'])
df = df.fillna('')

print(f'Found {len(df)} drugs to upload. Starting...')

# 3. Loop through each row and push it to Supabase
for index, row in df.iterrows():
    sec = row['section'] if 'section' in row and pd.notna(row['section']) else 'Pharmacology'
    term = row['didactic_term'] if 'didactic_term' in row and pd.notna(row['didactic_term']) else 'Term 1'

    payload = {
        'section': str(sec).strip() or 'Pharmacology',
        'didactic_term': str(term).strip() or 'Term 1',
        'generic_name': str(row.get('generic_name', '')),
        'brand_names': str(row.get('brand_names', '')),
        'drug_class': str(row.get('drug_class', '')),
        'body_systems': str(row.get('body_systems', '')),
        'pregnancy_safety': str(row.get('pregnancy_safety', 'Not Specified')),
        'mechanism_of_action': str(row.get('mechanism_of_action', '')),
        'indications': str(row.get('indications', '')),
        'route': str(row.get('route', '')),
        'side_effects': str(row.get('side_effects', '')),
        'contraindications': str(row.get('contraindications', '')),
        'clinical_pearls': str(row.get('clinical_pearls', '')),
    }

    # Insert into the 'drugs' table
    supabase.table('drugs').insert(payload).execute()
    print(f"Successfully uploaded: {payload['generic_name']}")

print('All done! Check your web app.')