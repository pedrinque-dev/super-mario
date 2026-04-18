# 🍄 Super Mario Jump!

Um jogo de endless runner inspirado no clássico Super Mario Bros, desenvolvido com HTML, CSS e JavaScript puro — sem frameworks, sem dependências.

---

## 🎮 Como Jogar

| Ação | Controle |
|------|----------|
| Iniciar o jogo | `Espaço` / `↑` / Toque na tela |
| Pular | `Espaço` / `↑` / Toque na tela |

- **Desvie do cano** verde para não perder.
- **Colete moedas** para ganhar pontos extras (+100 por moeda).
- O jogo fica progressivamente **mais rápido** a cada 5 segundos.
- Sua **melhor pontuação** é salva automaticamente no navegador.

---

## ✨ Funcionalidades

- 🏃 Personagem animado com física de pulo suave
- 🪙 Sistema de moedas com spawn aleatório e efeito de coleta
- 📈 Dificuldade progressiva — velocidade aumenta ao longo do tempo
- 🏆 Placar com pontuação atual, contagem de moedas e recorde pessoal
- 💾 Recorde salvo via `localStorage`
- 🔊 Efeitos sonoros: música de fundo, pulo, moeda e game over
- ☁️ Nuvens animadas em parallax no cenário
- 📱 Totalmente responsivo — funciona em desktop e mobile
- 🎨 Interface pixel art fiel ao estilo Mario

---

## 🗂️ Estrutura do Projeto

```
super-mario-jump/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── imgs/
    │   ├── mario.gif
    │   ├── pipe.png
    │   ├── coin.gif
    │   ├── clouds.png
    │   ├── game-over.png
    │   └── Mario-ico.ico
    └── audio/
        ├── background.mp3
        ├── jump.mp3
        ├── coin.mp3
        └── gameover.mp3
```

---

## 🚀 Como Executar

Não é necessário instalar nada. Basta abrir o arquivo `index.html` diretamente no navegador:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/super-mario-jump.git

# Acesse a pasta
cd super-mario-jump

# Abra no navegador
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

> **Dica:** Para que os áudios funcionem corretamente em alguns navegadores, sirva os arquivos via servidor local (ex: extensão Live Server do VS Code).

---

## 🛠️ Tecnologias

- **HTML5** — estrutura e elementos do jogo
- **CSS3** — animações, keyframes, layout responsivo
- **JavaScript (ES6+)** — lógica do jogo, colisões, loop via `requestAnimationFrame`
- **Web Audio API** — reprodução de sons
- **localStorage** — persistência do recorde

---

---

## 📄 Licença

Este projeto é de uso livre para fins educacionais e pessoais.  
Os assets visuais e sonoros são inspirados no universo Mario (© Nintendo) e utilizados apenas para fins não comerciais.

---

<p align="center">Feito com ❤️ e pixels</p>
