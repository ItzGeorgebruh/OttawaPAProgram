import os
import pandas as pd
from supabase import create_client

# 1. Your Supabase URL and Service Role Key
SUPABASE_URL = 'https://bknrtardzwrkvuouxcza.supabase.co'
# Replace the text below with your actual secret service_role key from Supabase settings
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Read your Excel file (make sure to delete the description/example rows first!)
excel_file = 'Pharmacy Drugs.xlsx'  # Update if your file name is different
df = pd.read_excel(excel_file)

# Drop any fully blank rows
df = df.dropna(subset=['generic_name'])
df = df.fillna('')

print(f'Found {len(df)} drugs to upload. Starting...')

# 3. Loop through each row and push it to Supabase
for index, row in df.iterrows():
  payload = {
      'folder': str(row.get('folder', 'Pharmacology')),
      'term': str(row.get('term', 'Term 1')),
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
  response = supabase.table('drugs').insert(payload).execute()
  print(f"Successfully uploaded: {payload['generic_name']}")

print('All done! Check your web app.')