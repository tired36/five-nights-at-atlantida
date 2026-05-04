import os
import glob

def rename_and_update():
    # Find all files recursively in assets/
    html_files = glob.glob('*.html') + glob.glob('**/*.html', recursive=True)
    
    # Store replacements
    replacements = {}
    
    for root, dirs, files in os.walk('assets'):
        for file in files:
            if ' ' in file:
                old_path = os.path.join(root, file)
                # create new name: lowercase, strip spaces before extension, replace spaces with underscores
                name, ext = os.path.splitext(file)
                new_name = name.strip().replace(' ', '_') + ext
                new_path = os.path.join(root, new_name)
                
                # rename the file
                os.rename(old_path, new_path)
                
                # prepare strings for replacement
                # HTML might use relative paths like 'assets/videos/golpes en la puerta.mp4'
                # or with %20 if encoded, but usually they are written with spaces in this repo.
                old_rel = old_path.replace('\\', '/')
                new_rel = new_path.replace('\\', '/')
                
                # Add to replacements
                replacements[old_rel] = new_rel
                replacements[old_rel.replace(' ', '%20')] = new_rel
                
    # Now update all HTML files
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        for old_str, new_str in replacements.items():
            if old_str in content:
                content = content.replace(old_str, new_str)
                modified = True
                
        if modified:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
                
    print("Renamed files and updated HTML references.")

if __name__ == '__main__':
    rename_and_update()
