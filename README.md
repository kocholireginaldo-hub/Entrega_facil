# Entrega Fácil

PWA para registrar e comprovar entregas (fotografia, data, horário, localização). Interface em GitHub Pages; Firebase para login, banco e fotos. Funciona em Android (Chrome) e iPhone (Safari 15+).

## Estrutura
index.html · manifest.json · service-worker.js · firestore.rules · storage.rules · cors.json
css/style.css · assets/icons/ (192, 512, maskable, apple-touch)
js/: firebase-config.js, auth.js, database.js, storage.js, app.js, agenda.js, nova.js, admin.js, share.js, ui.js

## 1. Criar o projeto Firebase
1. console.firebase.google.com > Adicionar projeto.
2. Configurações do projeto > Seus apps > Web (</>) > registre e copie o `firebaseConfig`.
3. Cole os valores em `js/firebase-config.js` (substitua os `COLE_AQUI`). A senha do Admin (`3030`) fica na constante `ADMIN_PIN` do mesmo arquivo.

## 2. Ativar os serviços
- **Authentication** > Método de login > E-mail/senha > Ativar.
  Em Configurações > Domínios autorizados, adicione `SEU-USUARIO.github.io`.
- **Firestore Database** > Criar banco (modo produção).
- **Storage** > Começar (modo produção). Exige plano Blaze em projetos novos (há cota gratuita).

## 3. Publicar as regras
- Firestore > Regras: cole `firestore.rules` > Publicar.
- Storage > Regras: cole `storage.rules` > Publicar (aceite a permissão de leitura do Firestore que o console pedir).
- CORS do Storage (necessário para anexar a foto no compartilhamento), no Cloud Shell do Google Cloud:
  edite `cors.json` com seu domínio e rode `gsutil cors set cors.json gs://SEU-BUCKET` (o bucket aparece no Storage).

## 4. Conta administrativa
Não existe cadastro público de administrador. Para autorizar alguém:
1. A pessoa cria uma conta normal no app.
2. Authentication > Usuários > copie o **UID** dela.
3. Firestore > Iniciar coleção `admins` > ID do documento = UID > campo `ativo` (boolean) = true.
As regras (Firestore e Storage) liberam leitura de tudo apenas para UIDs presentes em `admins`. O PIN 3030 é só uma etapa extra na tela; sozinho não dá acesso a nenhum dado.

## 5. Publicar no GitHub Pages
1. Crie um repositório, envie todos os arquivos (raiz do repositório).
2. Settings > Pages > Source: branch `main`, pasta `/ (root)` > Save.
3. Acesse `https://SEU-USUARIO.github.io/NOME-DO-REPO/` (HTTPS é exigido por câmera e localização).

## 6. Instalar
- **Android (Chrome):** menu ⋮ > Instalar aplicativo / Adicionar à tela inicial.
- **iPhone (Safari):** botão Compartilhar > Adicionar à Tela de Início. (No iPhone só o Safari instala PWA; outros navegadores do iOS rodam o app, mas sem instalar.)

## Testes
Não foram executados testes funcionais: o ambiente de desenvolvimento não tem acesso à internet nem a um projeto Firebase. Só foi feita checagem de sintaxe dos arquivos JavaScript. Execute a lista de testes obrigatórios (itens 1–22 do prompt) após configurar o Firebase.

## Limitações conhecidas
- Relatório do dia: texto + fotos via menu de compartilhar; **PDF não implementado** nesta versão.
- Compartilhar foto junto com texto depende do navegador (Android/Chrome e iOS 15+ normalmente suportam). Se não for possível, o app compartilha só o texto ou copia o texto e abre o WhatsApp; a foto deve ser anexada manualmente.
- O iOS pode exigir toque direto no botão para abrir o menu de compartilhar; se falhar, toque de novo.
- `capture="environment"` pede a câmera traseira, mas o navegador decide; no iPhone o Safari pode oferecer também a fototeca, e o app não consegue impedir.
- Sem fila offline: sem internet a entrega não é salva e o app avisa.
- Fotos usam URL de download do Firebase (token longo, não listável), mas quem tiver o link consegue abrir a imagem. Não compartilhe esses links.
- Imutabilidade é regra do app/regras do Firebase, não prova criptográfica; quem administra o projeto Firebase pode alterar dados.
- Admin carrega todos os registros de uma vez (adequado para equipe pequena).
