import os
import re

pages_dir = r"E:\Bcc Seo\src\pages"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix 1: Col flex styles for KPI cards
    # This regex looks for <Col ... style={{ flex: ... }}
    # and replaces the flex part to flex: '1 1 200px', minWidth: 200
    content = re.sub(
        r'(<Col[^>]*?style=\{\{\s*)flex:\s*[^,}]+(,?.*?\}\})',
        r"\1flex: '1 1 200px', minWidth: 200\2",
        content
    )
    
    # Also handle cases where there are multiple style properties or flex is at the end
    content = re.sub(
        r"(style=\{\{.*?)(,\s*)?flex:\s*[^,}]+\s*(.*?\}\})",
        lambda m: m.group(1) + (", " if m.group(1).strip() != "style={{" else "") + "flex: '1 1 200px', minWidth: 200" + m.group(3),
        content
    )
    
    # Fix 2: Add scroll={{ x: 'max-content' }} to Table tags
    # Only if it doesn't already have scroll=
    def replace_table(m):
        table_tag = m.group(0)
        if "scroll=" not in table_tag:
            # insert before the closing > or />
            if table_tag.endswith("/>"):
                return table_tag[:-2] + " scroll={{ x: 'max-content' }} />"
            elif table_tag.endswith(">"):
                return table_tag[:-1] + " scroll={{ x: 'max-content' }}>"
        return table_tag

    content = re.sub(r'<Table[^>]*>', replace_table, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {os.path.basename(filepath)}")

for filename in os.listdir(pages_dir):
    if filename.endswith(".jsx"):
        fix_file(os.path.join(pages_dir, filename))
