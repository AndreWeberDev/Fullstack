const ratingComments = {
  1: 'Não gostei muito... 😞',
  2: 'Poderia ser melhor 😐',
  3: 'Bom jogo! 😊',
  4: 'Muito bom! 😄',
  5: 'Excelente jogo! 🤩'
};

const currentRatings = {};
let lastOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

function updateStarDisplay(starContainer, rating) {
  const stars = Array.from(starContainer.querySelectorAll('.star'));
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < rating);
  });
}

function updateRatingComment(card, rating) {
  const comment = card.querySelector('.rating-comment');
  if (comment) {
    comment.textContent = ratingComments[rating] || 'Avaliação atualizada.';
  }
}

function handleStarSelection(star) {
  const rating = parseInt(star.dataset.value, 10);
  const card = star.closest('.rating-card');
  if (!card || Number.isNaN(rating)) return;

  const starContainer = card.querySelector('.rating-stars');
  if (!starContainer) return;

  updateStarDisplay(starContainer, rating);
  const gameId = card.querySelector('.rating-comment')?.id.replace('comment-', '');
  if (gameId) {
    currentRatings[gameId] = rating;
  }
  updateRatingComment(card, rating);
}

function handleStarKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleStarSelection(event.target);
  }
}

function initRatingCards() {
  document.querySelectorAll('.rating-stars').forEach(container => {
    container.addEventListener('click', event => {
      const star = event.target.closest('.star');
      if (star) {
        handleStarSelection(star);
      }
    });

    container.querySelectorAll('.star').forEach(star => {
      star.setAttribute('role', 'button');
      star.setAttribute('tabindex', '0');
      star.setAttribute('aria-label', `${star.dataset.value} estrela${star.dataset.value > 1 ? 's' : ''}`);
      star.addEventListener('keydown', handleStarKeydown);
    });
  });

  document.querySelectorAll('.rating-button[data-game-id]').forEach(button => {
    button.addEventListener('click', () => {
      const gameId = button.dataset.gameId;
      submitRating(gameId);
    });
  });
}

function submitRating(gameId) {
  if (!gameId || !currentRatings[gameId]) {
    alert('Por favor, selecione uma avaliação de estrelas antes de enviar.');
    return;
  }

  const rating = currentRatings[gameId];
  alert(`✓ Obrigado pela sua avaliação de ${rating} estrela${rating > 1 ? 's' : ''}! Sua opinião é muito importante para nós!`);
  delete currentRatings[gameId];
}

function showTemporaryMessage(element, duration = 5000) {
  if (!element) return;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, duration);
}

function initRecommendationForm() {
  const form = document.getElementById('recommendationForm');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const gameName = document.getElementById('gameName').value.trim();
    const gameGenre = document.getElementById('gameGenre').value.trim();
    const gameLink = document.getElementById('gameLink').value.trim();
    const gameDescription = document.getElementById('gameDescription').value.trim();
    const userName = document.getElementById('userName').value.trim() || 'Anônimo';
    const successMessage = document.getElementById('successMessage');

    if (!gameName || !gameGenre || !gameDescription) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const recommendation = {
      game: gameName,
      genre: gameGenre,
      link: gameLink,
      description: gameDescription,
      user: userName,
      date: new Date().toLocaleDateString('pt-BR')
    };

    console.log('Recomendação recebida:', recommendation);
    form.reset();
    showTemporaryMessage(successMessage, 5000);
  });
}

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function createFallingEmojis() {
  const emojis = ['🎮', '🕹️', '👾', '🎯', '🏆', '⭐', '🎪', '🎭', '🎨', '🎬'];
  const screenWidth = window.innerWidth;
  const emojiCount = Math.floor(Math.random() * 6 + 15);

  for (let i = 0; i < emojiCount; i += 1) {
    setTimeout(() => {
      const emoji = document.createElement('div');
      emoji.className = 'falling-emoji';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = `${Math.random() * (screenWidth - 60)}px`;
      emoji.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(emoji);

      setTimeout(() => {
        emoji.remove();
      }, 3500);
    }, i * 80);
  }
}

function handleOrientationChange() {
  const currentOrientation = isLandscape() ? 'landscape' : 'portrait';
  if (currentOrientation === 'landscape' && lastOrientation === 'portrait') {
    createFallingEmojis();
  }
  lastOrientation = currentOrientation;
}

document.addEventListener('DOMContentLoaded', () => {
  initRatingCards();
  initRecommendationForm();
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
});
