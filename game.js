// TODO: Add controls to start game screen
// TODO: Add game over screen
// TODO: Add pause game
// TODO: Render starship thrusters
// TODO: Refactor

// Parameters
const rotationSpeedChange = 0.1;
const movementSpeedChange = 0.01;
const torpedoLaunchSpeed = 3;
const asteroidSpeedCoefficient = 1.5;
const updateFrequency = 1000 / 60;
const dangerousTorpedoTimeout = 1000;
const explosionDuration = 1000;
const explosionMaxRadius = 100;
const explosionMaxWidth = 20;

let score = 0;

let isGameRunning = false;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = 1920;
ctx.canvas.height = 1080;

const getDegToRad = (degrees) => degrees * (Math.PI / 180);

const getRadToDeg = (radians) => radians * (180 / Math.PI);

const getDistance = (
  { position: { x: x1, y: y1 } },
  { position: { x: x2, y: y2 } }
) => ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;

const getRandomDirection = () => Math.random() * 360;

const getRandomAsteroidPosition = (starship) => {
  const distanceFromStarship = ctx.canvas.height / 2;
  const randomDirection = getRandomDirection();
  let x =
    starship.position.x +
    Math.cos(getDegToRad(randomDirection)) * distanceFromStarship;
  let y =
    starship.position.y +
    Math.sin(getDegToRad(randomDirection)) * distanceFromStarship;
  if (x < 0) {
    x += ctx.canvas.width;
  }
  if (x > ctx.canvas.width) {
    x -= ctx.canvas.width;
  }
  if (y < 0) {
    y += ctx.canvas.height;
  }
  if (y > ctx.canvas.height) {
    y -= ctx.canvas.height;
  }
  return { x, y };
};

let starship;
let torpedoes;
let asteroids;
let explosions;

const starshipImage = new Image();
starshipImage.src = "./starship.svg";

const torpedoImage = new Image();
torpedoImage.src = "./torpedo.svg";

const asteroidBigImage = new Image();
asteroidBigImage.src = "./asteroid-big.svg";

const asteroidMediumImage = new Image();
asteroidMediumImage.src = "./asteroid-medium.svg";

const asteroidSmallImage = new Image();
asteroidSmallImage.src = "./asteroid-small.svg";

const draw = () => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ship
  ctx.save();
  ctx.translate(starship.position.x, starship.position.y);
  ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
  ctx.translate(-starship.position.x, -starship.position.y);
  ctx.drawImage(
    starshipImage,
    starship.position.x - starshipImage.naturalWidth / 2,
    starship.position.y - starshipImage.naturalHeight / 2,
    starshipImage.naturalWidth,
    starshipImage.naturalHeight
  );
  ctx.restore();

  // Left edge
  if (starship.position.x <= starshipImage.naturalWidth) {
    ctx.save();
    ctx.translate(starship.position.x + ctx.canvas.width, starship.position.y);
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Right edge
  if (starship.position.x >= ctx.canvas.width - starshipImage.naturalWidth) {
    ctx.save();
    ctx.translate(starship.position.x - ctx.canvas.width, starship.position.y);
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Top edge
  if (starship.position.y <= starshipImage.naturalHeight) {
    ctx.save();
    ctx.translate(starship.position.x, starship.position.y + ctx.canvas.height);
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Bottom edge
  if (starship.position.y >= ctx.canvas.height - starshipImage.naturalHeight) {
    ctx.save();
    ctx.translate(starship.position.x, starship.position.y - ctx.canvas.height);
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Top left corner
  if (
    starship.position.x <= starshipImage.naturalWidth &&
    starship.position.y <= starshipImage.naturalHeight
  ) {
    ctx.save();
    ctx.translate(
      starship.position.x + ctx.canvas.width,
      starship.position.y + ctx.canvas.height
    );
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Bottom left corner
  if (
    starship.position.x <= starshipImage.naturalWidth &&
    starship.position.y >= ctx.canvas.height - starshipImage.naturalHeight
  ) {
    ctx.save();
    ctx.translate(
      starship.position.x + ctx.canvas.width,
      starship.position.y - ctx.canvas.height
    );
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Top right corner
  if (
    starship.position.x >= ctx.canvas.width - starshipImage.naturalWidth &&
    starship.position.y <= starshipImage.naturalHeight
  ) {
    ctx.save();
    ctx.translate(
      starship.position.x - ctx.canvas.width,
      starship.position.y + ctx.canvas.height
    );
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Bottom right corner
  if (
    starship.position.y >= ctx.canvas.height - starshipImage.naturalHeight &&
    starship.position.x >= ctx.canvas.width - starshipImage.naturalWidth
  ) {
    ctx.save();
    ctx.translate(
      starship.position.x - ctx.canvas.width,
      starship.position.y - ctx.canvas.height
    );
    ctx.rotate(-1 * getDegToRad(starship.rotation - 90));
    ctx.translate(-starship.position.x, -starship.position.y);
    ctx.drawImage(
      starshipImage,
      starship.position.x - starshipImage.naturalWidth / 2,
      starship.position.y - starshipImage.naturalHeight / 2,
      starshipImage.naturalWidth,
      starshipImage.naturalHeight
    );
    ctx.restore();
  }

  // Draw the torpedoes
  torpedoes.forEach((torpedo) => {
    ctx.drawImage(
      torpedoImage,
      torpedo.position.x - torpedoImage.naturalWidth / 2,
      torpedo.position.y - torpedoImage.naturalHeight / 2,
      torpedoImage.naturalWidth,
      torpedoImage.naturalHeight
    );
  });

  // Draw the asteroids
  asteroids.forEach((asteroid) => {
    let asteroidImage;
    if (asteroid.size === 2) {
      asteroidImage = asteroidBigImage;
    }
    if (asteroid.size === 1) {
      asteroidImage = asteroidMediumImage;
    }
    if (asteroid.size === 0) {
      asteroidImage = asteroidSmallImage;
    }
    ctx.save();
    ctx.translate(asteroid.position.x, asteroid.position.y);
    ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
    ctx.translate(-asteroid.position.x, -asteroid.position.y);
    ctx.drawImage(
      asteroidImage,
      asteroid.position.x - asteroidImage.naturalWidth / 2,
      asteroid.position.y - asteroidImage.naturalHeight / 2,
      asteroidImage.naturalWidth,
      asteroidImage.naturalHeight
    );
    ctx.restore();

    // Left edge
    if (asteroid.position.x <= asteroidImage.naturalWidth) {
      ctx.save();
      ctx.translate(
        asteroid.position.x + ctx.canvas.width,
        asteroid.position.y
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Right edge
    if (asteroid.position.x >= ctx.canvas.width - asteroidImage.naturalWidth) {
      ctx.save();
      ctx.translate(
        asteroid.position.x - ctx.canvas.width,
        asteroid.position.y
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Top edge
    if (asteroid.position.y <= asteroidImage.naturalHeight) {
      ctx.save();
      ctx.translate(
        asteroid.position.x,
        asteroid.position.y + ctx.canvas.height
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Bottom edge
    if (
      asteroid.position.y >=
      ctx.canvas.height - asteroidImage.naturalHeight
    ) {
      ctx.save();
      ctx.translate(
        asteroid.position.x,
        asteroid.position.y - ctx.canvas.height
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Top left corner
    if (
      asteroid.position.x <= asteroidImage.naturalWidth &&
      asteroid.position.y <= asteroidImage.naturalHeight
    ) {
      ctx.save();
      ctx.translate(
        asteroid.position.x + ctx.canvas.width,
        asteroid.position.y + ctx.canvas.height
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Bottom left corner
    if (
      asteroid.position.x <= asteroidImage.naturalWidth &&
      asteroid.position.y >= ctx.canvas.height - asteroidImage.naturalHeight
    ) {
      ctx.save();
      ctx.translate(
        asteroid.position.x + ctx.canvas.width,
        asteroid.position.y - ctx.canvas.height
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Top right corner
    if (
      asteroid.position.x >= ctx.canvas.width - asteroidImage.naturalWidth &&
      asteroid.position.y <= asteroidImage.naturalHeight
    ) {
      ctx.save();
      ctx.translate(
        asteroid.position.x - ctx.canvas.width,
        asteroid.position.y + ctx.canvas.height
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }

    // Bottom right corner
    if (
      asteroid.position.x >= ctx.canvas.width - asteroidImage.naturalWidth &&
      asteroid.position.y >= ctx.canvas.height - asteroidImage.naturalHeight
    ) {
      ctx.save();
      ctx.translate(
        asteroid.position.x - ctx.canvas.width,
        asteroid.position.y - ctx.canvas.height
      );
      ctx.rotate(-1 * getDegToRad(asteroid.rotation - 90));
      ctx.translate(-asteroid.position.x, -asteroid.position.y);
      ctx.drawImage(
        asteroidImage,
        asteroid.position.x - asteroidImage.naturalWidth / 2,
        asteroid.position.y - asteroidImage.naturalHeight / 2,
        asteroidImage.naturalWidth,
        asteroidImage.naturalHeight
      );
      ctx.restore();
    }
  });

  // Draw the explosions
  const now = Date.now();
  explosions.forEach((explosion) => {
    const explosionProgress = (now - explosion.startedAt) / explosionDuration;
    const explosionRadius =
      torpedoImage.naturalWidth + explosionProgress * explosionMaxRadius;
    ctx.beginPath();
    ctx.arc(
      explosion.position.x,
      explosion.position.y,
      explosionRadius,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = `hsla(0, 0%, 100%, ${Math.max(
      0.75 * 1 - explosionProgress,
      0
    )})`;
    ctx.lineWidth = 1 + explosionProgress * explosionMaxWidth;
    ctx.stroke();
  });

  // Request next frame
  if (isGameRunning) {
    requestAnimationFrame(draw);
  }
};

let rotationMomentumChangeInterval = null;
let forwardSpeedChangeInterval = null;

const fireTorpedo = () => {
  starship.canFire = false;
  setTimeout(() => {
    starship.canFire = true;
  }, 500);
  const moveVector = {
    x:
      (Math.cos(getDegToRad(starship.rotation)) || 0) *
      (starship.forwardSpeed + torpedoLaunchSpeed),
    y:
      (Math.sin(getDegToRad(starship.rotation)) || 0) *
      (starship.forwardSpeed + torpedoLaunchSpeed),
  };
  const driftVector = {
    x:
      (Math.cos(getDegToRad(starship.driftDirection)) || 0) *
      starship.driftSpeed,
    y:
      (Math.sin(getDegToRad(starship.driftDirection)) || 0) *
      starship.driftSpeed,
  };
  const deltaXDrift = driftVector.x + moveVector.x;
  const deltaYDrift = driftVector.y + moveVector.y;
  let direction;
  if (starship.driftSpeed === 0) {
    direction = starship.rotation;
  } else {
    direction =
      getRadToDeg(Math.atan(deltaYDrift / deltaXDrift || 0)) +
      (deltaXDrift < 0 ? 180 : 0);
  }
  const speed = (deltaXDrift ** 2 + deltaYDrift ** 2) ** 0.5;
  torpedoes.push({
    position: {
      x: starship.position.x,
      y: starship.position.y,
    },
    direction,
    speed,
    detonated: false,
    launchedAt: Date.now(),
  });
};

window.addEventListener("keydown", (event) => {
  if (!isGameRunning) {
    return;
  }
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    starship.rotationMomentum += rotationSpeedChange;
    clearInterval(rotationMomentumChangeInterval);
    rotationMomentumChangeInterval = setInterval(() => {
      starship.rotationMomentum += rotationSpeedChange;
    }, 50);
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    starship.rotationMomentum -= rotationSpeedChange;
    clearInterval(rotationMomentumChangeInterval);
    rotationMomentumChangeInterval = setInterval(() => {
      starship.rotationMomentum -= rotationSpeedChange;
    }, 50);
  }
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
    if (starship.forwardSpeed < 0) {
      starship.forwardSpeed = 0;
    }
    starship.forwardSpeed += movementSpeedChange;
    clearInterval(forwardSpeedChangeInterval);
    forwardSpeedChangeInterval = setInterval(() => {
      starship.forwardSpeed += movementSpeedChange;
    }, 50);
  }
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
    if (starship.forwardSpeed > 0) {
      starship.forwardSpeed = 0;
    }
    starship.forwardSpeed -= movementSpeedChange;
    clearInterval(forwardSpeedChangeInterval);
    forwardSpeedChangeInterval = setInterval(() => {
      starship.forwardSpeed -= movementSpeedChange;
    }, 50);
  }
  if (event.key === " " && starship.canFire) {
    fireTorpedo();
  }
});

document.addEventListener("click", () => {
  if (!isGameRunning) {
    return;
  }
  if (starship.canFire) {
    fireTorpedo();
  }
});

window.addEventListener("keyup", (event) => {
  if (!isGameRunning) {
    return;
  }
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    clearInterval(rotationMomentumChangeInterval);
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    clearInterval(rotationMomentumChangeInterval);
  }
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
    clearInterval(forwardSpeedChangeInterval);
    starship.forwardSpeed = 0;
  }
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
    clearInterval(forwardSpeedChangeInterval);
    starship.forwardSpeed = 0;
  }
});

const tick = () => {
  // Move starship
  starship.rotation += starship.rotationMomentum;
  const moveVector = {
    x: (Math.cos(getDegToRad(starship.rotation)) || 0) * starship.forwardSpeed,
    y: (Math.sin(getDegToRad(starship.rotation)) || 0) * starship.forwardSpeed,
  };
  const driftVector = {
    x:
      (Math.cos(getDegToRad(starship.driftDirection)) || 0) *
      starship.driftSpeed,
    y:
      (Math.sin(getDegToRad(starship.driftDirection)) || 0) *
      starship.driftSpeed,
  };
  const deltaXDrift = driftVector.x + moveVector.x;
  const deltaYDrift = driftVector.y + moveVector.y;
  if (starship.driftSpeed === 0) {
    starship.driftDirection = starship.rotation;
  } else {
    starship.driftDirection =
      getRadToDeg(Math.atan(deltaYDrift / deltaXDrift || 0)) +
      (deltaXDrift < 0 ? 180 : 0);
  }
  starship.driftSpeed = (deltaXDrift ** 2 + deltaYDrift ** 2) ** 0.5;
  starship.position.x +=
    starship.driftSpeed * Math.cos(getDegToRad(starship.driftDirection)) || 0;
  if (starship.position.x < 0) {
    starship.position.x += ctx.canvas.width;
  }
  if (starship.position.x > ctx.canvas.width) {
    starship.position.x -= ctx.canvas.width;
  }
  starship.position.y -=
    starship.driftSpeed * Math.sin(getDegToRad(starship.driftDirection)) || 0;
  if (starship.position.y < 0) {
    starship.position.y += ctx.canvas.height;
  }
  if (starship.position.y > ctx.canvas.height) {
    starship.position.y -= ctx.canvas.height;
  }

  // Move torpedoes
  torpedoes.forEach((torpedo) => {
    torpedo.position.x +=
      torpedo.speed * Math.cos(getDegToRad(torpedo.direction)) || 0;
    if (torpedo.position.x < 0) {
      torpedo.position.x += ctx.canvas.width;
    }
    if (torpedo.position.x > ctx.canvas.width) {
      torpedo.position.x -= ctx.canvas.width;
    }
    torpedo.position.y -=
      torpedo.speed * Math.sin(getDegToRad(torpedo.direction)) || 0;
    if (torpedo.position.y < 0) {
      torpedo.position.y += ctx.canvas.height;
    }
    if (torpedo.position.y > ctx.canvas.height) {
      torpedo.position.y -= ctx.canvas.height;
    }
  });

  // Move asteroids
  asteroids.forEach((asteroid) => {
    const asteroidSpeed = (3 - asteroid.size) * asteroidSpeedCoefficient;
    const deltaPosition = {
      x: asteroidSpeed * Math.cos(getDegToRad(asteroid.direction)) || 0,
      y: asteroidSpeed * Math.sin(getDegToRad(asteroid.direction)) || 0,
    };
    asteroid.position.x += deltaPosition.x;
    if (asteroid.position.x < 0) {
      asteroid.position.x += ctx.canvas.width;
    }
    if (asteroid.position.x > ctx.canvas.width) {
      asteroid.position.x -= ctx.canvas.width;
    }
    asteroid.position.y -= deltaPosition.y;
    if (asteroid.position.y < 0) {
      asteroid.position.y += ctx.canvas.height;
    }
    if (asteroid.position.y > ctx.canvas.height) {
      asteroid.position.y -= ctx.canvas.height;
    }
    asteroid.rotation += asteroidSpeed;
    if (asteroid.rotation > 360) {
      asteroid.rotation -= 360;
    }
  });

  const now = Date.now();

  // Detect torpedo collisions
  torpedoes.forEach((torpedo, torpedoIndex) => {
    // Torpedo hitting asteroid
    asteroids.forEach((asteroid) => {
      let asteroidImage;
      if (asteroid.size === 2) {
        asteroidImage = asteroidBigImage;
      }
      if (asteroid.size === 1) {
        asteroidImage = asteroidMediumImage;
      }
      if (asteroid.size === 0) {
        asteroidImage = asteroidSmallImage;
      }
      if (getDistance(torpedo, asteroid) <= asteroidImage.naturalWidth / 2) {
        torpedo.detonated = true;
        asteroid.exploded = true;
        explosions.push({
          position: {
            x: torpedo.position.x,
            y: torpedo.position.y,
          },
          startedAt: now,
        });
        score++;
        document.getElementById("score").innerHTML = score;
      }
    });

    // Torpedo hitting another torpedo
    torpedoes.forEach((otherTorpedo, otherTorpedoIndex) => {
      if (torpedoIndex !== otherTorpedoIndex) {
        if (
          getDistance(torpedo, otherTorpedo) <=
          torpedoImage.naturalWidth / 2
        ) {
          torpedo.detonated = true;
          otherTorpedo.detonated = true;
          explosions.push({
            position: {
              x: torpedo.position.x,
              y: torpedo.position.y,
            },
            startedAt: now,
          });
          explosions.push({
            position: {
              x: otherTorpedo.position.x,
              y: otherTorpedo.position.y,
            },
            startedAt: now,
          });
        }
      }
    });

    if (
      !torpedo.detonated &&
      now - torpedo.launchedAt > dangerousTorpedoTimeout
    ) {
      if (getDistance(torpedo, starship) <= starshipImage.naturalWidth / 2) {
        clearInterval(clock);
        isGameRunning = false;
      }
    }
  });

  asteroids.forEach((asteroid) => {
    if (!asteroid.exploded) {
      let asteroidImage;
      if (asteroid.size === 2) {
        asteroidImage = asteroidBigImage;
      }
      if (asteroid.size === 1) {
        asteroidImage = asteroidMediumImage;
      }
      if (asteroid.size === 0) {
        asteroidImage = asteroidSmallImage;
      }
      if (
        getDistance(asteroid, starship) <=
        asteroidImage.naturalWidth / 2 + starshipImage.naturalWidth / 2
      ) {
        clearInterval(clock);
        isGameRunning = false;
      }
    }
  });

  // Get rid of detonated torpedoes
  torpedoes = torpedoes.filter((torpedo) => !torpedo.detonated);

  // Get rid of invisible explosions
  explosions = explosions.filter(
    (explosion) => now - explosion.startedAt <= explosionDuration
  );

  // Split exploded asteroids
  asteroids = asteroids
    .map((asteroid) => {
      if (!asteroid.exploded) {
        return asteroid;
      }
      if (asteroid.size === 0) {
        return [];
      }
      return [
        {
          size: asteroid.size - 1,
          position: { x: asteroid.position.x, y: asteroid.position.y },
          direction: getRandomDirection(),
          rotation: getRandomDirection(),
          exploded: false,
        },
        {
          size: asteroid.size - 1,
          position: { x: asteroid.position.x, y: asteroid.position.y },
          direction: getRandomDirection(),
          rotation: getRandomDirection(),
          exploded: false,
        },
      ];
    })
    .flat();

  if (asteroids.length === 0) {
    asteroids = [
      {
        size: 2,
        position: getRandomAsteroidPosition(starship),
        direction: getRandomDirection(),
        rotation: getRandomDirection(),
        exploded: false,
      },
    ];
  }
};

let clock = null;

const startGame = () => {
  // Hide splash screen
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("start").tabIndex = -1;
  document.getElementById("start").blur();
  // Reset score
  score = 0;
  // Reset ship
  starship = {
    position: {
      x: ctx.canvas.width / 2,
      y: ctx.canvas.height / 2,
    },
    rotation: 90,
    driftDirection: 0,
    driftSpeed: 0,
    rotationMomentum: 0,
    forwardSpeed: 0,
    canFire: true,
  };
  // Reset torpedoes
  torpedoes = [];
  // Reset asteroids
  asteroids = [
    {
      size: 2,
      position: getRandomAsteroidPosition(starship),
      direction: getRandomDirection(),
      rotation: getRandomDirection(),
      exploded: false,
    },
  ];
  explosions = [];
  // Start clock
  isGameRunning = true;
  clock = setInterval(tick, updateFrequency);
  requestAnimationFrame(draw);
};

// Set up splash screen
document.getElementById("start").addEventListener("click", (event) => {
  event.stopPropagation();
  startGame();
});
