import os


def fix_imports(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.py') and filename != '__init__.py':
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()

            # 替换导入语句
            if 'from app import db' in content:
                content = content.replace('from app import db', 'from extensions import db')

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f'Fixed imports in {filepath}')
