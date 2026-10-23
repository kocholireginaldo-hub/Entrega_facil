# Entrega Fácil

Arquivos (todos na raiz): index.html, manifest.json, service-worker.js, 4 ícones PNG, firestore.rules.

## Atualizar (você já tem o Firebase configurado)
1. Firebase > Firestore > Regras: apague tudo, cole o conteúdo de `firestore.rules` e clique em Publicar. (OBRIGATÓRIO: sem isso o painel Administrador não funciona.)
2. No `index.html` novo, cole seus valores reais em `FIREBASE_CONFIG` (os mesmos da versão anterior).
3. GitHub: envie `index.html`, `service-worker.js` e `firestore.rules` para a raiz do repositório (Add file > Upload files, substituindo). Os demais arquivos não mudaram.
4. A coleção `admins` não é mais usada; pode ser apagada.

## Administrador
Ícone ⚙️ (Ajustes) > Administrador > senha 3030. O proprietário usa a conta comum dele. Sair do painel, trocar de aba ou sair da conta bloqueia o painel de novo.
A senha existe em dois lugares que devem ser iguais: `ADMIN_PIN` no index.html e `'3030'` no firestore.rules.
