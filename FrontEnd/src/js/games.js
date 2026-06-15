const UPCOMING_IMAGE_SET = [
  './assets/img/gaming.webp',
  './assets/img/gaming2.webp',
  './assets/img/gaming3.webp'
];

function getUpcomingImage(index, entry) {
  return entry?.img?.trim() || UPCOMING_IMAGE_SET[index % UPCOMING_IMAGE_SET.length];
}

function buildGameElement(game, index) {
  const article = document.createElement('article');
  article.className = 'jogo jogo-em-breve';
  article.classList.add(index % 2 === 0 ? 'path-left' : 'path-right');

  const img = document.createElement('img');
  img.src = getUpcomingImage(index, game);
  img.alt = game.name ? `${game.name} - Em breve` : 'Jogo em breve';
  img.width = 120;
  img.height = 120;
  img.loading = 'lazy';

  const badge = document.createElement('span');
  badge.className = 'jogo-badge';
  badge.textContent = 'Em breve';

  const title = document.createElement('div');
  title.className = 'jogo-title';
  title.textContent = game.name || 'Em Breve';

  const subtitle = document.createElement('div');
  subtitle.className = 'jogo-breve-subtitle';
  subtitle.textContent = game.subtitle || 'Novo lançamento chegando ao Arcade365.';

  article.appendChild(img);
  article.appendChild(badge);
  article.appendChild(title);
  article.appendChild(subtitle);

  if (game.link && game.link.trim()) {
    const anchor = document.createElement('a');
    anchor.href = game.link.trim();
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.appendChild(article);
    return anchor;
  }

  return article;
}

async function fetchUpcomingGames() {
  const fallbackUrl = './src/data/upcomingGames.json';

  try {
    const response = await fetch('/api/upcomingGames', { cache: 'no-store' });
    if (response.ok) {
      return await response.json();
    }

    console.warn('API indisponível, carregando fallback local.');
  } catch (error) {
    console.warn('Falha ao carregar /api/upcomingGames, usando fallback local.', error);
  }

  try {
    const fallbackResponse = await fetch(fallbackUrl, { cache: 'no-store' });
    if (fallbackResponse.ok) {
      return await fallbackResponse.json();
    }
  } catch (error) {
    console.error('Falha ao carregar o fallback local de upcomingGames.json', error);
  }

  return [];
}

function renderGames(list) {
  const container = document.getElementById('dynamic-games');
  if (!container) return;

  container.innerHTML = '';
  list.forEach((game, index) => {
    container.appendChild(buildGameElement(game, index));
  });
}

async function addGames() {
  const upcomingGames = await fetchUpcomingGames();
  renderGames(Array.isArray(upcomingGames) ? upcomingGames : []);
}

document.addEventListener('DOMContentLoaded', addGames);
