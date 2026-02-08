import zipfile
import os

def zip_backend():
    source_dir = r"f:\Projetos\Automações\Personal Agenda\backend"
    zip_filename = r"f:\Projetos\Automações\Personal Agenda\deploy-easypanel.zip"
    
    print(f"Criando ZIP em: {zip_filename}")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Ignorar node_modules e .git
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')
                
            for file in files:
                file_path = os.path.join(root, file)
                # O nome no arquivo zip deve ser relativo à pasta backend
                arcname = os.path.relpath(file_path, source_dir)
                
                print(f"Adicionando: {arcname}")
                zipf.write(file_path, arcname)
                
    print("ZIP criado com sucesso!")

if __name__ == "__main__":
    zip_backend()
