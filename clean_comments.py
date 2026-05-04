import sys
import glob

def clean_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('// ======') or stripped.startswith('/* ======'):
            continue
        new_lines.append(line)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
        
if __name__ == '__main__':
    for file in glob.glob('*.html'):
        clean_file(file)
